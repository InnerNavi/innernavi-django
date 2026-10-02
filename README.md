# InnerNavi Django

InnerNavi의 주력 포트폴리오 구현입니다. Django 기반 백엔드, Vue 웹, Python 지도 처리 패키지, 검증 하네스와 배포 구성을 하나의 저장소에서 관리합니다.

> 현재 상태: Phase 0-A 로컬 개발 기반을 설정하고 기초 실행 검증을 완료했습니다. 버전 잠금, 최소 Django/Vue 실행 코드, 순수 처리 패키지 경계와 개발용 Compose를 추가했습니다. 자동 그래프 생성·회원가입/승인·길찾기·하네스/CI·운영 배포는 아직 구현되지 않았습니다.

## 시작하기

Git Bash에서 이 저장소의 루트로 이동한 뒤 실행합니다. 전역 Python·PATH·기존 Docker 프로젝트를 변경하지 않습니다.

```bash
cd /c/Users/SSAFY/Desktop/InnerNavi_V2/innernavi-django
# Windows x86_64, uv 0.12.5, Node 24.19.0, npm 11.17.0
bash scripts/bootstrap-python.sh
node scripts/check-node.mjs
npm --prefix apps/web ci --ignore-scripts --cache .cache/npm

# 전용 PostgreSQL/Redis와 Linux API/Worker/Vue 개발 서버
docker compose --profile app up -d --build --wait
docker compose --profile app exec api python apps/backend/manage.py migrate
```

- 개발 화면: http://localhost:5173
- 프로세스 확인: http://localhost:8000/api/v1/health/live
- DB 연결 확인: http://localhost:8000/api/v1/health/ready
- `ready`는 DB 연결만 확인하며 MVP·권한·전체 스키마 준비를 보장하지 않습니다.
- 웹 연결 확인은 응답 본문을 포함해 5초로 제한합니다. 시간 초과 안내 후 다시 시도할 수 있습니다.
- Windows에서는 Celery Worker를 직접 실행하지 않고 Linux Docker로 실행합니다.
- 종료는 `docker compose --profile app stop`입니다. 데이터 볼륨은 보존됩니다.

Dockerfile과 Compose는 **로컬 개발 전용**입니다. DEBUG, 개발 서버, 합성 DB 인증 값, Redis 정책을 공개 운영에 사용하지 않습니다. 운영 계정/실메일/API 키는 생성하지 않습니다.

## 개발 환경 문서

- [버전 선택과 고정 근거](docs/adr/0001-development-runtime.md)
- [로컬 실행·검증·문제 해결](docs/runbooks/local-development.md)
- [개발 기반 작업과 미완료 범위](docs/plans/phase0-foundation.md)
- [실제 검증 결과](docs/evidence/development-foundation-2026-10-02.md)
- [Git Bash 실행 확인](docs/evidence/git-bash-development-2026-10-02.md)
- [개발 기반 검토 후 타임아웃·캐시 보완 결과](docs/evidence/foundation-review-fixes-2026-10-02.md)
- [로컬 기준점 브랜치와 Git 접근 확인](docs/evidence/development-baseline-2026-10-02.md)

`.python-version`, `.node-version`, `pyproject.toml`, `uv.lock`, `apps/web/package-lock.json`, Docker 이미지 digest가 실행 환경을 고정합니다. PC의 `python` 명령이 다른 버전을 가리켜도 이 프로젝트는 `uv run --locked` 또는 Docker로 실행합니다.

`.venv`는 현재 PC에서 Python/Django 의존성을 격리하는 로컬 가상환경입니다. 서버에 그대로 복사하지 않습니다. 로컬 `uv run`은 이 환경을 사용하며, Docker 빌드는 소스와 잠금 파일로 Linux 이미지 안에 별도의 가상환경을 만듭니다. 현재 Docker 구성은 개발 전용이고 운영 배포는 이후 단계입니다.

## 저장소 역할

- Django REST API와 비동기 지도 처리
- 관리자·사용자 웹
- 지도 그래프 생성과 경로 탐색 평가
- CI/CD, 배포, 롤백과 복구 훈련
- 개발·도메인 평가 하네스

## 예정 구조

```text
apps/                   Django 백엔드와 Vue 웹
packages/               프레임워크와 분리된 Python 지도 처리 패키지
tests/                  통합·계약·E2E·도메인 평가
docs/                   설계·명세·계획·ADR·운영 기록·증거
compose.yml             로컬 개발용 DB·Redis·API·Worker·Vue
infra/                  운영 Compose·Nginx·모니터링·IaC는 이후 단계
scripts/                검증·배포·롤백 진입점
.github/workflows/      GitHub Actions
```

