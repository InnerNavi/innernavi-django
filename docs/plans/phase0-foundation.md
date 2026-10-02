# Phase 0-A — 로컬 개발 기반

- 요청: 프로젝트 버전을 선정·호환 확인·고정하고 로컬 개발 기반을 설정.
- 범위: Django 저장소만 변경. 전역 프로그램·PATH·기존 Docker 데이터 유지.
- 외부 변경 제외: push·main 병합, GitHub 설정/PR, API 키·유료 호출·클라우드·실계정 생성. 로컬 기준점 커밋은 후속 사용자 승인 범위에 포함한다.
- 상태: Phase 0-A 구현·기초 실행 검증 완료. Phase 0-B 하네스는 미구현. 결과는 [실행 증거](../evidence/development-foundation-2026-10-02.md)에 기록.
- 로컬 명령은 Git Bash 기준. 설치와 가상환경 설명은 [실행 문서](../runbooks/local-development.md), 확인 범위는 [Git Bash 증거](../evidence/git-bash-development-2026-10-02.md)에 기록.
- 1단계 검토 후 웹 연결 타임아웃과 pytest 캐시 경고를 보완했다. [후속 검증](../evidence/foundation-review-fixes-2026-10-02.md) 참조. 이후 승인에 따라 해당 저장소 신뢰 등록을 완료하고 `chore/dev-foundation`을 로컬 기준점 브랜치로 사용한다. [기준점 기록](../evidence/development-baseline-2026-10-02.md) 참조.

## 이번 작업

1. 지원 기간·패키지 metadata·이미지 digest 확인.
2. 프로젝트 Python·Node/패키지 lock 고정.
3. Django 설정/health/custom User 경계, Vue 연결 확인 화면, 순수 처리 패키지 경계.
4. Linux API/Worker/Vue와 별도 PostgreSQL/Redis Compose.
5. Windows 패키지 smoke·타입/빌드, Linux import·DB/큐·HTTP 프록시 연결 검사.
6. 재현 명령·선택 근거·실제 검증 결과 기록, 기존 Docker 자원 보존 확인.

## 완료 조건

- 잠금 파일로 설치를 재현할 수 있다.
- 기초 테스트와 빌드가 성공하고 실패를 숨기지 않는다.
- DB/Redis health, API live/DB ready, 웹→API 프록시, Celery ping을 실제 확인한다.
- 신규 UUID User migration이 기본 auth User를 만든 뒤 뒤늦게 변경하는 형태가 아니다.
- 전역 Python·Node·PATH와 기존 7개 컨테이너/데이터는 변경하지 않는다.
- 도메인 기능이 없는 부분은 NOT_IMPLEMENTED로 유지한다.

## 다음 작업: Phase 0-B 최소 하네스

AGENTS 라우팅·공통 명세 snapshot·Git Bash/Linux 공통 `verify.sh` 진입점·문서/비밀 검사·고의 실패 차단·기본 CI를 연결한다. 이후 AI 모의 테스트와 사람이 검수한 최신 SHA에만 병합 상태를 부여하는 설계를 검증한다. 실제 GitHub 설정 변경·키 발급·유료 호출은 별도 권한 범위다.

2026-10-02 후속 작업에서 [작업 규칙](../../AGENTS.md)·[상세 절차](../runbooks/task-workflow.md)·[수동 PR 양식](../../.github/pull_request_template.md)을 문서화했다. 범위와 진행은 [규칙 문서화 계획](agent-rules.md)을 따른다. 명세 snapshot·검증 스크립트·CI·AI 리뷰·보호 설정은 여전히 미구현이다. 기반 작업 완료 이후에만 최신 `main`에서 `dev`를 만들며, 이번 문서화만으로 Phase 0 전체가 완료되는 것은 아니다.

이 작업의 기초 pytest/Vitest는 전체 하네스 또는 M0 평가 세트가 아니다. 최종 M0/MVP 완료 게이트는 미구현 검사를 PASS로 처리하지 않는다.
