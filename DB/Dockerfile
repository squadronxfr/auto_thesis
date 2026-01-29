FROM postgres:16

# Copie tous les scripts SQL/SH d'init dans le répertoire automatique de Postgres
# (ils seront exécutés UNIQUEMENT au 1er démarrage si le volume data est vide)
COPY ./init-db/ /docker-entrypoint-initdb.d/

# Optionnel : permissions (en général pas nécessaire, mais safe)
RUN chmod -R 755 /docker-entrypoint-initdb.d/