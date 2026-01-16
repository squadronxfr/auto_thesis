"""Package de réécriture académique."""

from .rewrite_schema import CritiqueJuge, ProblemeNonResolu
__all__ = [
    'CritiqueJuge',
    'ProblemeNonResolu',
    'obtenir_stockage_memoire'
]

# Expose the real implementation from memory_store as the public entry point.
from .memory_store import obtenir_stockage_memoire
