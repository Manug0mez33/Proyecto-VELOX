#!/bin/sh
# Arranque del contenedor en producción (Render).
set -e

python src/manage.py migrate --noinput
python src/manage.py cargar_catalogo

# Crea el superusuario desde DJANGO_SUPERUSER_USERNAME / _EMAIL / _PASSWORD (si ya existe, sigue).
if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
    python src/manage.py createsuperuser --noinput || true
fi

# Render define $PORT; en local se usa 8000.
exec gunicorn nucleo.wsgi:application --chdir src --bind 0.0.0.0:${PORT:-8000} --workers 2
