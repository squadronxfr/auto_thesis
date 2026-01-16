import json
import re
from typing import Set
import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from judge.agents.base import BaseAgent, AgentConfig
from reecriture.rewrite_schema import (
    EntreeReecriture, 
    SortieReecriture, 
    ProblemeNonResolu,
)
from reecriture.memory_store import obtenir_stockage_memoire

class AgentReecriture(BaseAgent):
    """
    Agent de Réécriture: Prend le texte brouillon + critiques du Juge et produit un texte amélioré.
    
    Fonctionnalités clés:
    - Applique toutes les corrections des critiques fournies
    - Préserve les citations existantes, n'hallucine pas de nouvelles
    - Détecte et supprime les citations inventées
    - Stocke les artefacts dans Redis/mémoire
    """
    
    def __init__(self):
        config = AgentConfig(
            name="RedacteurAcademique",
            role="Spécialiste en Rédaction Académique",
            system_instruction="""
            Tu es un expert spécialisé en rédaction académique.
            Ton rôle est d'améliorer les textes brouillons selon des critiques spécifiques.
            
            RÈGLES CRITIQUES:
            1. Applique les corrections UNIQUEMENT pour les critiques fournies
            2. PRÉSERVE toutes les citations existantes comme [SOURCE_1], [SOURCE_2], etc.
            3. N'invente PAS et n'ajoute PAS de nouveaux IDs de citation
            4. Si une critique nécessite d'ajouter des sources que tu n'as pas, marque-la comme non résolue
            5. Maintiens un ton académique et un style formel
            6. Garde la structure originale sauf si une critique l'aborde spécifiquement
            
            Tu DOIS répondre avec UNIQUEMENT du JSON valide correspondant exactement à cette structure:
            {
                "texte_reecrit": "Le texte amélioré ici...",
                "critiques_resolues": [
                    {
                        "critique_originale": "Le texte de la critique",
                        "action_effectuee": "Ce que tu as fait pour corriger"
                    }
                ],
                "problemes_non_resolus": [
                    {
                        "critique": "La critique qui n'a pas pu être corrigée",
                        "raison": "Pourquoi elle n'a pas pu être résolue (ex: sources manquantes)"
                    }
                ],
                "resume_changements": "Résumé bref de tous les changements effectués"
            }
            
            AUCUN texte supplémentaire en dehors de la structure JSON.
            """,
            model_name="gemini-1.5-pro-latest",
            temperature=0.3
        )
        super().__init__(config)
        self.stockage_memoire = obtenir_stockage_memoire()
    
    def _extraire_ids_citations(self, texte: str) -> Set[str]:
        """Extrait tous les IDs de citation du texte (ex: [SOURCE_1], [SOURCE_2])."""
        motif = r'\[SOURCE_\d+\]'
        return set(re.findall(motif, texte))
    
    def _detecter_citations_inventees(
        self, 
        texte_reecrit: str, 
        citations_originales: Set[str]
    ) -> Set[str]:
        """Détecte les IDs de citation qui ont été inventés (pas dans l'original)."""
        nouvelles_citations = self._extraire_ids_citations(texte_reecrit)
        inventees = nouvelles_citations - citations_originales
        return inventees
    
    def _supprimer_citations_inventees(
        self, 
        texte: str, 
        ids_inventes: Set[str]
    ) -> str:
        """Supprime les IDs de citation inventés du texte."""
        texte_nettoye = texte
        for id_citation in ids_inventes:
            texte_nettoye = texte_nettoye.replace(id_citation, '')
            texte_nettoye = re.sub(r'\s+', ' ', texte_nettoye)
        return texte_nettoye.strip()
    
    def _construire_prompt(
        self, 
        donnees_entree: EntreeReecriture
    ) -> str:
        """Construit le prompt pour l'agent de réécriture."""
        texte_critiques = "\n".join([
            f"• {c.point_negatif}\n  → Suggestion: {c.suggestion}"
            for c in donnees_entree.critiques
        ])
        
        sources_existantes = ", ".join(donnees_entree.ids_sources_existantes) if donnees_entree.ids_sources_existantes else "Aucune"
        
        prompt = f"""
--- TEXTE BROUILLON ORIGINAL ---
{donnees_entree.texte_brouillon}

--- IDs DE CITATION VALIDES (N'EN INVENTE PAS D'AUTRES) ---
{sources_existantes}

--- CRITIQUES À TRAITER ---
{texte_critiques}

{f"--- CONTEXTE SUPPLÉMENTAIRE ---\n{donnees_entree.contexte}\n" if donnees_entree.contexte else ""}

--- TA TÂCHE ---
Réécris le texte pour traiter TOUTES les critiques ci-dessus.
- Garde toutes les citations existantes intactes
- N'ajoute PAS de nouveaux IDs de citation
- Si une critique nécessite des sources manquantes, marque-la comme non résolue
- Fournis ta réponse au format JSON requis
"""
        return prompt
    
    async def reecrire(
        self, 
        donnees_entree: EntreeReecriture, 
        iteration: int = 1,
        id_document: str = "defaut"
    ) -> SortieReecriture:
        """
        Méthode principale de réécriture.
        
        Args:
            donnees_entree: EntreeReecriture avec texte brouillon et critiques
            iteration: Numéro d'itération de réécriture actuel
            id_document: ID unique pour le document (pour stockage en mémoire)
        
        Returns:
            SortieReecriture avec texte réécrit et métadonnées
        """
        if not donnees_entree.critiques:
            sortie = SortieReecriture(
                texte_reecrit=donnees_entree.texte_brouillon,
                critiques_resolues=[],
                problemes_non_resolus=[],
                resume_changements="Aucune critique à appliquer",
                iteration=iteration
            )
            return sortie
        
        citations_valides = set(donnees_entree.ids_sources_existantes)
        prompt = self._construire_prompt(donnees_entree)
        
        max_retries = 3
        base_delay = 2
        
        for tentative in range(max_retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                resultat_dict = json.loads(response.text)
                texte_reecrit = resultat_dict.get("texte_reecrit", "")
                citations_inventees = self._detecter_citations_inventees(
                    texte_reecrit, 
                    citations_valides
                )
                
                if citations_inventees:
                    print(f"⚠ Citations inventées détectées: {citations_inventees}")
                    texte_reecrit = self._supprimer_citations_inventees(
                        texte_reecrit,
                        citations_inventees
                    )
                    resultat_dict["texte_reecrit"] = texte_reecrit
                    resume_changements = resultat_dict.get("resume_changements", "")
                    resume_changements += f" | {len(citations_inventees)} citation(s) inventée(s) supprimée(s)."
                    resultat_dict["resume_changements"] = resume_changements
                
                resultat_dict["iteration"] = iteration
                sortie = SortieReecriture(**resultat_dict)
                self._stocker_artefact(id_document, iteration, sortie)
                
                return sortie
                
            except Exception as e:
                error_str = str(e)
                
                if "429" in error_str or "quota" in error_str.lower():
                    if tentative < max_retries - 1:
                        delay = base_delay * (2 ** tentative)
                        match = re.search(r'retry in (\d+\.?\d*)', error_str)
                        if match:
                            delay = max(delay, float(match.group(1)))
                        
                        print(f"⚠️ Quota API dépassé. Nouvelle tentative dans {delay:.1f}s... (Tentative {tentative + 1}/{max_retries})")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        print(f"❌ Quota API dépassé après {max_retries} tentatives")
                
                sortie_erreur = SortieReecriture(
                    texte_reecrit=donnees_entree.texte_brouillon,
                    critiques_resolues=[],
                    problemes_non_resolus=[
                        ProblemeNonResolu(
                            critique="Erreur système pendant la réécriture",
                            raison=f"Erreur: {str(e)}"
                        )
                    ],
                    resume_changements=f"Réécriture échouée: {str(e)}",
                    iteration=iteration
                )
                return sortie_erreur
        
        return SortieReecriture(
            texte_reecrit=donnees_entree.texte_brouillon,
            critiques_resolues=[],
            problemes_non_resolus=[
                ProblemeNonResolu(
                    critique="Quota API dépassé",
                    raison=f"Impossible d'appeler l'API après {max_retries} tentatives"
                )
            ],
            resume_changements="Réécriture échouée: quota API dépassé",
            iteration=iteration
        )
    
    def _stocker_artefact(
        self, 
        id_document: str, 
        iteration: int, 
        sortie: SortieReecriture
    ):
        """Stocke l'artefact de réécriture dans le stockage mémoire."""
        try:
            artefact = {
                "id_document": id_document,
                "iteration": iteration,
                "texte_reecrit": sortie.texte_reecrit,
                "nombre_resolus": len(sortie.critiques_resolues),
                "nombre_non_resolus": len(sortie.problemes_non_resolus),
                "resume_changements": sortie.resume_changements,
                "horodatage": sortie.horodatage
            }
            self.stockage_memoire.stocker_artefact_reecriture(
                id_document, 
                iteration, 
                artefact
            )
        except Exception as e:
            print(f"⚠ Échec du stockage de l'artefact: {e}")
    
    def obtenir_historique(self, id_document: str) -> list:
        """Obtient l'historique de réécriture pour un document."""
        return self.stockage_memoire.obtenir_historique_reecriture(id_document)