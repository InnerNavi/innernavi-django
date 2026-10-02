# Git Bash 개발 명령 확인 — 2026-10-02

## 변경 범위

- 사용자 요청에 따라 기본 로컬 터미널과 실행 문서를 Git Bash 기준으로 변경했다.
- `scripts/bootstrap-python.sh`를 추가하고 `.gitattributes`에서 Bash 스크립트의 LF 개행을 고정했다.
- README·실행 문서·ADR·Phase 0 계획·AGENTS에 명령과 가상환경/배포 경계를 반영했다. 기존 PowerShell 설치기는 호환용으로 유지한다.
- Python/Node 버전과 의존성 잠금 파일·Compose 기능·제품 범위는 변경하지 않았다.
- 커밋·push·전역 PATH·Git 설정·소유권/ACL 변경 없음. 전체 하네스/CI는 여전히 미구현이다.

## 실제 사용한 환경

Git for Windows의 Git Bash 5.3.15, `MINGW64_NT-10.0-26200`, x86_64에서 실행했다. uv 0.12.5, Node 24.19.0, npm 11.17.0과 기존 Windows 프로젝트 Python 3.13.16을 사용했다.

Windows 기본 `bash.exe`는 WSL로 연결되어 이 실행 환경에서 실패했다. Git Bash 실행 파일을 명시해 검증했으며 WSL 설치나 기본 PATH를 변경하지 않았다. 사용자 실행 방법은 [runbook](../runbooks/local-development.md)의 Git Bash 명령을 따른다.

## 결과

| 확인 | 결과 |
| --- | --- |
| `bash -n scripts/bootstrap-python.sh` | PASS, 문법 검사 |
| 저장소 루트에서 bootstrap 재실행 | PASS, 기존 Python과 46개 설치 의존성 확인·재사용 |
| 상위 폴더에서 bootstrap 경로로 실행 | PASS, 스크립트가 자체 저장소 루트를 찾아 처리 |
| `uv sync --locked --check` | PASS, Would make no changes |
| `uv run` Python / Django 버전 | 3.13.16 / 5.2.17 |
| `source .venv/Scripts/activate` 후 `python` 실행·`deactivate` | PASS, 같은 프로젝트 Python/Django 확인 |
| Django `check` | PASS, 문제 없음 |
| 실제 PostgreSQL에서 migration 누락 검사 | PASS, No changes detected |
| pytest | PASS, 6개. 캐시 쓰기 권한 경고 1건은 아래에 별도 기록 |
| Ruff check / format / mypy | PASS / 23 files already formatted / 소스 파일 1개 PASS |
| Vue 타입 검사·build / Vitest | PASS / 2개 PASS |
| Compose config / PostgreSQL·Redis health | PASS / 두 서비스 healthy |
| 저장소 경로에 한정한 `git -c safe.directory=... diff --check` | PASS, 전역 설정 변경 없음 |
| 종료 상태 | InnerNavi 컨테이너 5개 Exited, 기존 다른 컨테이너 7개 보존·미시작 |

잠금 파일 SHA-256은 [기초 검증 기록](development-foundation-2026-10-02.md)과 동일하다. DB 테스트를 위해 기존 InnerNavi PostgreSQL/Redis만 잠시 시작했으며 검증 후 다시 중지했다. 컨테이너·데이터 볼륨을 삭제하지 않았다.

## 발견한 경고와 한계

- 일반 Git 조회는 `detected dubious ownership`으로 실패했다. 저장소 소유자와 실행 계정이 다른 것을 확인했다. 검증용 읽기 명령에만 정확한 저장소 경로를 허용했으며 전역 `safe.directory` 또는 소유권/ACL을 수정하지 않았다. 사용자에게도 [경로 한정 조회 방법](../runbooks/local-development.md#git-저장소-소유자-경고)을 안내한다.
- 당시 pytest 6개는 통과했지만 기존 `.pytest_cache/v/cache`를 쓸 때 `PytestCacheWarning` / Windows 접근 거부가 발생했다. 이후 [검토 후 보완](foundation-review-fixes-2026-10-02.md)에서 캐시 경로를 `.cache/pytest`로 분리하고 경고 없이 통과했다. 기존 캐시는 삭제하거나 권한을 변경하지 않았다.
- npm의 새 major 버전 알림은 자동 적용하지 않았다. 선택한 npm 11.17.0을 유지한다.
- Bash bootstrap은 기존 설치를 재사용하는 경로를 실제 검증했다. 빈 새 PC에서 Python을 처음 내려받는 경로는 이번 Git Bash 전환에서 별도로 검증하지 않았다.
- Git Bash는 Windows에서 실행되는 셸이다. 이 로컬 `.venv`를 Linux 환경으로 바꾸거나 서버에 옮기는 기능이 아니다. Docker 이미지 안의 Linux 환경은 소스·잠금 파일로 별도 생성한다.
- 운영용 서버·이미지·CI/CD·제품 E2E는 이 작업의 검증 대상이 아니다.

Git 소유자 경고는 위 초기 전환 시점의 기록이다. 이후 승인받은 경로 한 곳의 지속 신뢰 등록과 기준점 브랜치는 [기준점 기록](development-baseline-2026-10-02.md)을 따른다.
