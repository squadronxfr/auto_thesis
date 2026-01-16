"""Package de réécriture académique."""

from .rewrite_schema import CritiqueJuge, ProblemeNonResolu
__all__ = [
    'CritiqueJuge',
    'ProblemeNonResolu',
    'obtenir_stockage_memoire'
]


def obtenir_stockage_memoire(*args, **kwargs):
    """
    Point d'entrée pour obtenir un stockage mémoire.

    Cette fonction est actuellement un faux-placé (stub) et doit être
    remplacée par une implémentation réelle lorsque celle-ci sera disponible.
    """
    raise NotImplementedError(
        "obtenir_stockage_memoire n'est pas encore implémenté dans "
        "backend.agent.reecriture.__init__"
    )
