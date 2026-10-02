# 로컬 개발 기반 검증 — 2026-10-02

- 범위: Phase 0-A, Windows x86_64와 Docker Desktop의 Linux amd64 개발 환경.
- 결과: 아래 기초 검사는 PASS. 전체 하네스·M0·MVP·운영 배포 완료를 뜻하지 않는다.
- 변경: Django 저장소의 로컬 파일과 프로젝트 전용 Python/패키지/Docker 자원. 커밋·push·GitHub 설정 변경 없음.
- 재현 절차: [로컬 실행 문서](../runbooks/local-development.md). 버전과 이미지 digest: [ADR-0001](../adr/0001-development-runtime.md).

## 환경과 설치

| 항목 | 확인 결과 |
| --- | --- |
| 프로젝트 Python / uv | 3.13.16 / 0.12.5, `.tools/python`과 `.venv` 사용 |
| 전역 Python | `python` 3.12.10, `python3.13` 3.13.15 유지 |
| Node / npm | 기존 24.19.0 / 11.17.0 유지, 저장소와 컨테이너에서 같은 버전 확인 |
| Django / DRF / Celery | 5.2.17 / 3.18.1 / 5.6.3 |
| PostgreSQL / Redis server | 실제 서버 17.11 / 7.4.11 |
| Docker / Compose | 29.6.2 / 5.3.1, Linux 엔진 |
| TypeScript | 6.0.3, Windows/Linux에서 Vue 타입 검사·빌드 확인 |

`uv sync --locked --check`는 변경할 항목이 없음을 확인했다. `npm ci --ignore-scripts`는 package-lock에서 설치했다. 전역 Python·Node·PATH·레지스트리를 교체하지 않았다.

잠금 파일 SHA-256:

```text
uv.lock
ED733BEA3796604AB9FD9795B567BEA6248F126AC92053A32159CBFFDCC2BF84

apps/web/package-lock.json
47F5D837540471D011DCF7583FEA19AE4E7E3558CC7394A9B7C042130DA66A6E
```

## 실제 실행 결과

| 검사 | 결과 | 확인 범위 |
| --- | --- | --- |
| Windows Django `check` | PASS, 문제 없음 | 로컬 설정·앱 로딩 |
| `makemigrations --check --dry-run` | PASS, No changes detected | 모델과 초기 migration 일치 |
| 전용 PostgreSQL `migrate` | PASS | contenttypes/auth/accounts/sessions 신규 DB 적용 |
| Python pytest | PASS, 6개 | health 4개와 처리 의존성 smoke 2개; PostgreSQL 테스트 DB 포함 |
| Ruff check / format check | PASS | 현재 Python 코드의 규칙·포맷 |
| mypy | PASS, 소스 파일 1개 | 아직 비어 있는 순수 처리 패키지 경계만 검사; 전체 제품 타입 검증 아님 |
| Windows Vue 타입 검사·build | PASS | 현재 최소 Vue 코드 빌드 |
| Windows Vitest | PASS, 2개 | health 응답 형식 검사; 브라우저 E2E 아님 |
| API/웹 Docker build | PASS | 잠금 파일로 Linux 개발 이미지 설치·빌드 |
| Compose 서비스 health | PASS, 5개 healthy | API/Worker/web/PostgreSQL/Redis 기초 연결 |
| Linux Django `check` / migration 누락 검사 | PASS | Linux 설정·앱·migration 확인 |
| Linux 영상 라이브러리 | PASS | OpenCV 5.0.0, NumPy 2.5.3, scikit-image 0.26.0 import 및 합성 PNG/중심선 smoke |
| Linux Vue 타입 검사·build / Vitest | PASS / 2개 PASS | Node/npm 버전 검사 포함 |
| Redis `PING` | PASS, PONG | broker 서버 응답 |
| Celery `inspect ping` | PASS, 1 node online | Linux Worker와 broker 연결; 제품 작업 실행 검증 아님 |
| API `health/live` | PASS, HTTP 200 | `scope=development-foundation` |
| API `health/ready` | PASS, HTTP 200 | `scope=database-connectivity-only`, SELECT 1만 확인 |
| 웹 `/api/v1/health/live` | PASS, HTTP 200 | Vite 같은 출처 프록시 → Django 연결 |
| 웹 HTML | PASS, HTTP 200 | InnerNavi 문서 제공; 화면 렌더링·클릭 E2E 미검증 |
| DRF 인증 기본값 | PASS | SessionAuthentication만 설정; 제품 로그인 API 미구현 |
| `accounts_user` 원본 DB 행 수 | 0 | 실제 운영자·관리자 계정 생성 없음 |
| 최종 문서·설정 정합성 | PASS, 텍스트 47개 | UTF-8·충돌 표시·공백·Markdown 링크/코드 블록·JSON 및 tracked diff 검사 |

초기 custom User는 UUID 식별자와 unique email을 가지며 기본 비활성이다. 합성 계정은 임시 pytest DB에서만 사용했다. 역할·승인·OTP·건물 소속·로그인은 NOT_IMPLEMENTED다.

## 실패와 수정 이력

- TypeScript 7.0.2 + vue-tsc 3.3.11 조합에서 `ERR_PACKAGE_PATH_NOT_EXPORTED`로 타입 검사가 실패했다. TypeScript 6.0.3으로 변경하고 잠금 파일을 재생성한 뒤 Windows/Linux 타입 검사·빌드·테스트를 다시 통과했다. 실패한 후보를 호환 버전으로 기록하지 않는다.
- 제한된 실행 환경에서 네트워크/Docker 접근이 막힌 경우, 승인된 범위의 실행으로 실제 프로그램·엔진을 확인했다. 이를 사용자 PC의 설치 누락이나 PATH 문제로 간주하지 않았다.

## 기존 자원 보존과 종료 상태

기존 컨테이너 7개의 ID/이름/중지 또는 Created 상태를 확인했으며 시작·삭제하지 않았다.

| 기존 ID | 이름 | 보존 상태 |
| --- | --- | --- |
| 30bb69a240be | itda-redis-i10 | Created |
| c6d6610aaac0 | itda-i9 | Exited |
| 0902f226f04d | itda-dev-backend-1 | Exited |
| 391e51be8cc6 | itda-dev-redis-1 | Exited |
| 6427a2b13729 | itda-dev-db-1 | Exited |
| 7dffaba1a772 | itda-dev-ai-1 | Exited |
| 65c8f4766986 | iread-skill-stage3-ai | Exited |

검증 후 `docker compose --profile app stop`으로 `innernavi-django-local`의 5개 컨테이너만 중지했다. API/web의 종료 코드 143은 이 명시적인 중지 이후의 상태이며, 실행 중 health 실패로 해석하지 않는다. 컨테이너·이미지·새 데이터 볼륨 `innernavi-django-local_postgres_data`, `innernavi-django-local_redis_data`는 보존했다. Docker Desktop 자체는 종료하지 않았다.

다시 실행하려면 저장소 루트에서 `docker compose --profile app up -d --build --wait`를 사용한다. 새 데이터 볼륨을 사용하는 환경은 실행 문서의 migrate 단계도 수행한다.

## 미완료·미검증

- NOT_IMPLEMENTED: 자동 노드/간선, M0 평가 세트, 계정 신청/승인/OTP, 건물별 권한, 발행·다층 경로, 제품 웹 화면.
- NOT_IMPLEMENTED: 공통 verify 진입점, AGENTS 상세 라우팅, 고의 실패 차단, CI/CD, AI 리뷰, 최신 SHA 사람 승인, GitHub 보호 설정.
- NOT_VERIFIED: 보안/의존성/SAST/이미지 종합 검사, production 설정, 브라우저 시각·상호작용 E2E, 실메일, 공개 배포, 백업/복구·롤백 훈련.
- NOT_VERIFIED: 처리 성능·최대 PNG·CPU/메모리 peak/OOM·운영 예산. Docker의 가용 메모리나 Compose 메모리 제한 합계는 실제 성능 측정이 아니며 2 vCPU/4 GiB 수용 기준 통과로 보고하지 않는다.
- 운영 비밀값·API 키·유료 API 호출·클라우드 자원·실제 평면도는 사용하지 않았다.

다음 작업은 Phase 0-B 최소 하네스다. 현재 기초 검사를 연결하되 미구현 제품 검사를 성공한 것으로 처리하지 않는다.

이 문서는 초기 실행 기록이다. Git Bash 전환과 검토 후 웹 요청 타임아웃·캐시 보완은 [후속 검증 기록](foundation-review-fixes-2026-10-02.md)을 따른다. 후속 웹 테스트는 13개이며 Python 테스트는 6개다.
