# 로컬 개발 기반 실행

상태: 로컬 실행 전용. 공개 서비스와 하네스/CI 설정은 아직 없다.

## 준비

- Windows x86_64: Git, uv 0.12.5, Node 24.19.0, npm 11.17.0.
- 기본 터미널은 Git Bash다. Windows 기본 `bash.exe`가 WSL을 가리킬 수 있으므로 시작 메뉴의 **Git Bash**를 연다. WSL Ubuntu나 PowerShell을 전제로 한 명령이 아니다.
- Linux 컨테이너를 실행할 수 있는 Docker Desktop/WSL 2. 실제 확인한 도구는 Docker 29.6.2 / Compose 5.3.1이다. 새 PC의 Docker/Compose는 이 버전 이상에서 구성·health 동작을 재검증한다.
- 운영 API 키·실메일·개인정보·실제 도면은 필요 없다.
- 반드시 `innernavi-django` 저장소 루트에서 아래 명령을 실행한다. `C:\WINDOWS\system32`에서 실행하지 않는다.

```bash
cd /c/Users/SSAFY/Desktop/InnerNavi_V2/innernavi-django
pwd
command -v uv node npm docker
```

## Python / Node 설치

```bash
bash scripts/bootstrap-python.sh
node scripts/check-node.mjs
npm --prefix apps/web ci --ignore-scripts --cache .cache/npm
uv run --locked --no-sync python --version
```

bootstrap은 저장소 내부에만 Python과 가상환경을 만든다. 기존 `.tools/python`과 `.venv`가 올바르면 재사용하며 버전을 확인한다. `bash scripts/bootstrap-python.sh`는 실행 권한 변경이나 PowerShell 실행 정책 변경이 필요 없다. 새 `.sh` 파일은 `.gitattributes`로 LF 개행을 고정한다. 기존 `.ps1` 파일은 호환용으로 남기지만 기본 실행 경로는 아니다.

`uv run`은 이 저장소의 Python을 사용한다. `python` 전역 명령이 다른 버전이라고 PATH를 재정렬하거나 기존 Python을 제거하지 않는다. `.tools`, `.venv`, `node_modules`, `.cache`는 커밋하지 않는다.

## 가상환경과 서버 실행의 구분

| 실행 위치 | Python 환경 | 현재 PC의 `.venv`를 복사하는가? |
| --- | --- | --- |
| Git Bash에서 `uv run ... runserver` | 저장소의 `.venv` | 아니오. 현재 PC에서 그대로 사용한다. |
| Docker API/Worker | 이미지 안에서 `uv.lock`으로 새로 만든 Linux `.venv` | 아니오. `.dockerignore`에서 로컬 환경을 제외한다. |
| 이후 실제 서버 배포 | 운영용 이미지를 빌드·게시하고 서버가 받아 실행하는 방식 등을 별도 확정 | 아니오. Windows 가상환경을 Linux 서버에 복사하지 않는다. |

`.venv`는 Django와 Python 패키지를 격리하는 폴더이지 서버 자체가 아니다. 서버 프로세스를 띄운다고 폴더가 이동하지 않는다. Python 버전·OS·실행 경로가 다른 환경에서는 잠금 파일로 의존성을 재설치한다. 데이터베이스·업로드 파일 보존/이관은 가상환경과 별도의 배포·백업 작업이다.

`uv run`은 활성화 없이 사용할 수 있다. 직접 `python` 명령을 쓰려는 경우에만 Git Bash에서 다음처럼 활성화한다.

```bash
source .venv/Scripts/activate
python -m django --version
deactivate
```

## 전체 개발 서버

```bash
docker compose --profile app up -d --build --wait
docker compose --profile app exec api python apps/backend/manage.py migrate
docker compose --profile app ps
```

- 웹 http://localhost:5173 의 연결 확인 버튼은 Vite의 같은 출처 `/api` 프록시로 Django live를 조회한다.
- 연결 확인은 요청부터 JSON 본문 읽기까지 5초로 제한한다. 무응답이면 요청 취소와 시간 초과 안내 후 버튼을 다시 사용할 수 있다. 이 제한은 지도 처리 작업의 실행 시간 제한과 별개다.
- API http://localhost:8000/api/v1/health/live 는 프로세스 확인이다.
- API http://localhost:8000/api/v1/health/ready 는 DB SELECT 1만 확인한다. 전체 스키마/권한/MVP 준비 확인이 아니다.
- PostgreSQL은 localhost:15432, Redis는 localhost:16379. 컨테이너 내부에서는 각각 postgres:5432, redis:6379.
- Worker는 concurrency 1이다. 작업 모델·자동 그래프 생성·재시도/취소 계약은 아직 없다. Celery ping은 broker/Worker 연결만 검사한다.
- 합성 개발 DB로만 migrate한다. createsuperuser나 운영자/관리자 계정을 자동 생성하지 않는다.

개발용 runserver와 Vite dev server를 공개 배포하지 않는다. 컨테이너 내부 bind 0.0.0.0은 호스트 공개를 의미하지 않으며 Compose의 호스트 포트는 127.0.0.1로 제한한다.

## 빠른 수정: API/Vue는 Windows, DB/Redis는 Docker

전체 앱 컨테이너를 먼저 중지하여 같은 포트를 두 번 쓰지 않는다. DB/Redis만 유지한다.

```bash
docker compose --profile app stop api web worker
docker compose up -d --wait postgres redis
uv run --locked python apps/backend/manage.py migrate
uv run --locked python apps/backend/manage.py runserver 127.0.0.1:8000
```

다른 터미널의 같은 저장소 루트에서 `npm --prefix apps/web run dev`를 실행한다. Windows에서 Celery Worker를 직접 실행하지 않는다. 로컬 API/Vue 프로세스를 중지한 후에 전체 app profile을 다시 켠다.

## 기초 검증

```bash
# PostgreSQL 테스트 DB를 사용하는 pytest 전에 DB/Redis를 실행한다.
docker compose up -d --wait postgres redis
uv sync --locked --check
uv run --locked --no-sync python apps/backend/manage.py check
uv run --locked --no-sync python apps/backend/manage.py makemigrations --check --dry-run
uv run --locked --no-sync pytest
uv run --locked --no-sync ruff check .
uv run --locked --no-sync ruff format --check .
uv run --locked --no-sync mypy
npm --prefix apps/web run build
npm --prefix apps/web test
docker compose config --quiet
```

이 명령은 현재 기초 코드만 검사한다. M0 그래프 품질, 계정/권한, 다층 경로, 계약/E2E/운영 복원은 NOT_IMPLEMENTED다. 공통 verify 진입점과 고의 실패 게이트는 다음 하네스 작업에서 연결한다.

pytest 캐시는 `pyproject.toml`의 `cache_dir = ".cache/pytest"`를 사용하며 Git과 Docker 빌드에서 제외한다. 기존 `.pytest_cache`의 소유권·ACL은 변경하지 않고 캐시 위치를 분리했다. 경고 해결 여부를 엄격하게 확인하려면 DB/Redis 실행 후 다음 명령을 사용한다.

```bash
uv run --locked --no-sync pytest -W error::pytest.PytestCacheWarning
```

캐시 경고를 숨기거나 플러그인을 끄는 방식이 아니다. 캐시 경고가 발생하면 위 검증은 실패해야 한다. 새 경로에서도 접근이 거부되면 현재 계정의 해당 경로 권한을 확인하고, 다른 프로젝트의 캐시 삭제나 전역 권한 변경으로 해결하지 않는다.

## 중지와 문제 해결

- 중지: `docker compose --profile app stop`. 전용 컨테이너와 데이터 볼륨을 보존한다.
- 기존 프로젝트 정리, 전체 Docker prune, 볼륨 삭제를 이 작업의 해결 방법으로 쓰지 않는다.
- `docker --version`은 성공하지만 `docker info`가 실패하면 Desktop/WSL 엔진 상태를 확인한다.
- 버전 오류는 `.python-version`, `.node-version`, package.json, 현재 실행 경로를 비교한다. 전역 환경을 자동 교체하지 않는다.
- 포트가 사용 중이면 기존 프로세스를 임의 종료하지 말고 어떤 서비스인지 확인한다. 포트 변경은 Compose와 로컬 설정/프록시/문서를 함께 수정한다.
- 임시 SECRET_KEY 때문에 재시작 시 개발 세션이 유지되지 않는다. 현재 가입/로그인 기능은 제공하지 않는다.

### Git 저장소 소유자 경고

초기 Git Bash에서 `git status`를 조회할 때 `detected dubious ownership`이 발생했다. 저장소 폴더의 소유자와 현재 실행 계정이 다른 것이 원인이며 Python 가상환경의 문제는 아니다.

2026-10-02 사용자 승인 후 이 PC의 `C:/Users/SSAFY/Desktop/InnerNavi_V2/innernavi-django` 한 곳만 전역 `safe.directory`에 등록했다. 기존 신뢰 항목은 보존했고 소유권·ACL·전역 작성자 설정은 바꾸지 않았다. 이제 이 PC에서는 일반 `git status`가 동작한다. 다른 PC나 clone 경로까지 자동으로 신뢰하는 설정은 아니다.

새 경로에서 같은 경고가 발생하면 소유자와 경로를 먼저 확인한다. 본인이 관리하는 저장소가 맞는 경우 다음처럼 해당 경로를 **이번 명령에서만** 허용해 조회할 수 있다. 모든 경로를 허용하는 `safe.directory=*`는 사용하지 않는다.

```bash
git -c safe.directory=C:/Users/SSAFY/Desktop/InnerNavi_V2/innernavi-django status
```

신뢰 경로 지속 등록은 본인이 확인한 해당 경로에만 적용한다. 이 설치 스크립트는 Git 설정을 자동 변경하지 않는다. 등록과 기준점 브랜치의 범위는 [기준점 기록](../evidence/development-baseline-2026-10-02.md)을 따른다.

## 기록

선택 근거는 [ADR](../adr/0001-development-runtime.md), 기존 기초 실행 결과는 [evidence](../evidence/development-foundation-2026-10-02.md), Git Bash 확인 범위는 [Git Bash evidence](../evidence/git-bash-development-2026-10-02.md), 검토 후 타임아웃·캐시 보완은 [후속 검증](../evidence/foundation-review-fixes-2026-10-02.md)을 확인한다. 도구 버전·잠금 파일을 바꾸면 기초 검증을 다시 실행한다.
