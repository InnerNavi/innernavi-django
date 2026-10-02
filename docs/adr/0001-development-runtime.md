# ADR-0001 — Django 로컬 개발 버전과 실행 경계

- 결정일: 2026-10-02
- 상태: 개발 기반 결정. 운영 배포·MVP·전체 하네스 완료가 아님.
- 범위: `innernavi-django`만 설정. Spring 버전은 Django 이후 별도 검증.

## 결정

| 구분 | 고정 값 | 원본 |
| --- | --- | --- |
| Python | 3.13.16 | `.python-version`, 두 pyproject의 Python 범위, backend 이미지 |
| uv | 0.12.5 | `tool.uv.required-version`, bootstrap, Docker tool 이미지 |
| Node / npm | 24.19.0 / 11.17.0 | `.node-version`, package.json engines/packageManager, web 이미지 |
| Django / DRF | 5.2.17 LTS / 3.18.1 | `pyproject.toml`, `uv.lock` |
| Celery / psycopg | 5.6.3 / 3.3.6 binary | `pyproject.toml`, `uv.lock` |
| Python Redis client | 6.4.0 | Celery/Kombu 호환 범위를 충족한 `uv.lock` |
| NumPy / OpenCV headless / scikit-image | 2.5.3 / 5.0.0.93 / 0.26.0 | 처리 패키지 pyproject, `uv.lock` |
| Vue / Router / Pinia | 3.5.43 / 5.3.1 / 4.0.3 | web package.json, package-lock.json |
| Vite / Vue plugin | 8.3.2 / 6.0.9 | web package.json, package-lock.json |
| TypeScript / vue-tsc / Vitest | 6.0.3 / 3.3.11 / 5.0.3 | web package.json, package-lock.json |
| PostgreSQL / Redis server | 17.11 / 7.4.11 | Compose의 버전 태그 + digest |

테스트·포맷·타입 도구와 전이 의존성도 lock에 고정한다. Redis Python client와 Redis server 버전은 서로 다른 소프트웨어이므로 같은 번호일 필요가 없다.

## 이유와 확인 범위

- Django 5.2는 LTS 계열이며 지원 기간과 Python 호환성을 공식 문서에서 확인했다. 새 제품 기능이 필요한 것이 아니므로 6.x 최신 번호만을 이유로 선택하지 않는다.
- Python 3.13의 최신 확인 패치를 프로젝트 내부에 설치한다. 기존 전역 Python 3.12와 uv 관리 Python을 교체하지 않는다. 네이티브 영상 라이브러리는 Windows와 Linux에서 실제 import/PNG/중심선 smoke를 검증한다.
- 기존 Node 24.19.0 LTS를 그대로 사용하고 npm 11.17.0을 고정한다. Docker의 npm 설치는 이미지 안에서만 수행한다.
- TypeScript 7.0.2는 `vue-tsc 3.3.11`과 실제 실행 시 `ERR_PACKAGE_PATH_NOT_EXPORTED`가 발생했다. 6.0.3으로 조정한 뒤 Windows와 Linux 컨테이너의 타입 검사·빌드가 성공했다. peer 범위 충족만으로 호환 성공이라 판단하지 않는다.
- Celery는 Windows를 공식 지원하지 않으므로 Worker는 Linux 컨테이너에서 실행한다. API와 Worker는 같은 이미지·같은 잠금 파일을 사용한다.
- PostgreSQL 17은 지원 중인 안정 계열이다. 패치 17.11을 선택하고 Redis 7.4.11과 함께 기본적인 DB/큐 연결을 확인한다. 운영 플랫폼의 관리형 호환은 아직 검증하지 않았다.
- `opencv-python` GUI 의존성이 필요하지 않으므로 headless 패키지만 설치한다.

## 고정된 이미지

| 이미지 | manifest digest |
| --- | --- |
| python:3.13.16-slim-bookworm | sha256:5024f48ba9441d4b13a95d3945abc6365538e3a31109833367a1923523c6efed |
| node:24.19.0-bookworm-slim | sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df |
| postgres:17.11-bookworm | sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652 |
| redis:7.4.11-alpine | sha256:858f009f9709ce576febc734aa78b8f6d624b82571f9ddb6bda4377c833b3499 |
| ghcr.io/astral-sh/uv:0.12.5 | sha256:e85be844203885286c60ffad8a858d48afb6c5a5c237ca0e67f12e74b8f174b1 |

Compose 초기 검증 아키텍처는 linux/amd64다. arm64 운영 서버를 확정한 것이 아니다. 이미지 업데이트는 태그만 조용히 바꾸지 않고 digest·lock·실행 테스트·ADR을 함께 갱신한다.

## 로컬 설치와 재현

- Python은 `.tools/python` 아래, 패키지는 `.venv`와 `apps/web/node_modules`, 캐시는 `.cache` 아래에 둔다. 모두 Git에서 제외한다.
- 로컬 기본 터미널은 Git Bash이고 설치는 `bash scripts/bootstrap-python.sh`로 진행한다. 기존 PowerShell 설치기는 호환용으로만 남긴다. `.venv`는 서버로 복사하지 않으며 Docker는 소스·lock으로 Linux 의존성을 새로 설치한다.
- bootstrap은 공식 uv 메타데이터 commit `7e9d252e37065168cd3ed8419bb31da512133604`를 고정해 Python 3.13.16을 찾는다. `--no-bin --no-registry`로 전역 별칭/레지스트리를 변경하지 않는다.
- Python은 `uv sync --locked`, Node는 `npm ci --ignore-scripts`로 재현한다. Node 설치 스크립트 자동 실행을 끄고 저장소의 버전 확인은 별도로 실행한다.
- 기존 Docker 프로젝트와 구분되는 `innernavi-django-local` 이름·볼륨을 사용한다. 모든 개발 공개 포트는 127.0.0.1에만 연결한다.
- DB 계정/암호는 합성 localhost 개발 값이다. 운영 계정/비밀값이 아니다. local.py의 SECRET_KEY는 미설정 시 프로세스별 임시값이며 세션 보존이나 Worker 간 서명을 보장하지 않는다. 인증 구현 전 안정적인 개발 키 관리와 production 설정을 추가해야 한다.
- UUID 기반 custom User를 첫 migration부터 둔다. 신규 기본값은 비활성이며 실제 승인·역할·건물별 권한·OTP·가입 API는 구현하지 않았다. Django superuser는 제품 운영자와 별개다.

## 아직 하지 않은 것

공통 verify 인터페이스·전체 회귀 게이트·CI·AI API 호출·사람 승인 check·브랜치 보호·GHCR 게시·운영 이미지/메일/배포/백업은 별도 작업이다. 기초 smoke 통과가 M0 또는 MVP 수용 기준 통과를 뜻하지 않는다.

## 출처

- [Django 지원 버전](https://www.djangoproject.com/download/), [Django Python 호환](https://docs.djangoproject.com/en/5.2/faq/install/)
- [Python 릴리스](https://www.python.org/downloads/), [Node 지원 현황](https://nodejs.org/en/about/previous-releases)
- [Vue 시작 조건](https://vuejs.org/guide/quick-start.html), [Celery 지원 플랫폼](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)
- [PostgreSQL 지원 정책](https://www.postgresql.org/support/versioning/), [Redis 공식 이미지](https://hub.docker.com/_/redis)
- 각 Python/Node 패키지의 공식 PyPI/npm 레지스트리에서 버전·Python/Node 조건·peer 의존성을 조회하고 실제 lock 설치/빌드로 확인한다.
