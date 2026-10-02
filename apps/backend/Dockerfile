# Local development image only. Production settings/server are not implemented.
FROM ghcr.io/astral-sh/uv:0.12.5@sha256:e85be844203885286c60ffad8a858d48afb6c5a5c237ca0e67f12e74b8f174b1 AS uv
FROM python:3.13.16-slim-bookworm@sha256:5024f48ba9441d4b13a95d3945abc6365538e3a31109833367a1923523c6efed
COPY --from=uv /uv /usr/local/bin/uv
WORKDIR /workspace
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/workspace/apps/backend
COPY pyproject.toml uv.lock .python-version ./
COPY packages/map_processing/ packages/map_processing/
RUN uv sync --locked --no-dev --python /usr/local/bin/python
COPY apps/backend/ apps/backend/
RUN groupadd --gid 10001 innernavi && useradd --uid 10001 --gid innernavi --no-create-home innernavi
ENV PATH="/workspace/.venv/bin:$PATH"
USER innernavi
EXPOSE 8000
CMD ["python", "apps/backend/manage.py", "runserver", "0.0.0.0:8000", "--noreload"]
