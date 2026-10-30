FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml uv.lock* ./
RUN uv sync

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uv run python src/manage.py migrate && uv run python src/manage.py runserver 0.0.0.0:8000"]
