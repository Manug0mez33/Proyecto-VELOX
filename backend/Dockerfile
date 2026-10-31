FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Usa directamente el entorno virtual creado por uv (sin "uv run" en cada comando).
ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Primero las dependencias: Docker reutiliza esta capa si pyproject/uv.lock no cambian.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

# Junta los estáticos del admin y la API navegable para que WhiteNoise los sirva.
RUN DJANGO_DEBUG=False python src/manage.py collectstatic --noinput

EXPOSE 8000

# Producción: migraciones + catálogo inicial + gunicorn (ver start.sh).
CMD ["./start.sh"]
