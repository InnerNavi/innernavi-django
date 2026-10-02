# 로컬 개발 기준점 — 2026-10-02

## 승인과 범위

- 사용자 승인: Django 저장소 경로 한 곳의 Git 신뢰 등록, `chore/dev-foundation` 브랜치, 기존 noreply 작성자 설정 확인 후 로컬 기준점 커밋.
- 제외: 소유권·ACL·작성자 설정 변경, push·main 병합·PR·GitHub 보호 설정·유료 호출·클라우드.
- 다른 저장소와 상위 폴더의 계획서는 이 Django 기준점 커밋에 포함하지 않는다. 공통 제품 명세의 저장소 snapshot 연결은 다음 Phase 0-B 작업이다.

## 확인한 상태

1. 기존 `main`과 로컬 `origin/main` 기준 SHA는 `144a87b5fcfc1c5f1a7f896850f904824ceb13f7`로 같았다. 이번 작업에서 원격 조회를 위한 fetch나 push는 하지 않는다.
2. 기존 유효 작성자 설정은 저장소 로컬 noreply였다. 개인 이메일이나 전역 작성자 설정으로 교체하지 않는다.
3. 해당 PC의 `C:/Users/SSAFY/Desktop/InnerNavi_V2/innernavi-django`만 전역 `safe.directory`에 추가했고 기존 신뢰 항목을 보존했다. 소유자 변경이나 모든 경로를 신뢰하는 설정은 사용하지 않았다.
4. 일반 Git Bash 명령으로 저장소를 확인하고 `chore/dev-foundation` 브랜치를 생성했다. 기존 개발 기반의 미커밋 변경은 그대로 유지했다.

## 기준점 내용과 검증

버전·잠금 파일, 최소 Django/Vue/순수 처리 패키지, custom User 초기 migration, 로컬 개발 Compose와 Dockerfile, Git Bash 설치기, 기초 테스트, 검토 후 타임아웃·캐시 보완, 실행/ADR/증거 문서를 하나의 개발 기반 기준점으로 묶는다.

관련 실행 증거:

- [초기 개발 기반](development-foundation-2026-10-02.md)
- [Git Bash 명령](git-bash-development-2026-10-02.md)
- [타임아웃·캐시 후속 검증](foundation-review-fixes-2026-10-02.md)

가상환경·Python 설치 폴더·node_modules·캐시·빌드 결과·실제 비밀값·실계정·실제 평면도는 기준점에 넣지 않는다. 제품 기능·전체 하네스·CI/AI 리뷰·공개 배포가 구현되었다고 표시하지 않는다.

## 커밋 완료 확인

기준점 커밋 메시지는 `chore: establish Django development foundation`이다. 실제 SHA와 완료 여부는 자체 SHA를 문서 안에 넣는 대신 다음 Git 상태로 확인한다.

```bash
git branch --show-current
git log -1 --format='%h %s'
git log main..chore/dev-foundation --oneline
git status --short
```

완료 조건은 요청한 브랜치에 기준점 커밋이 있고 Django 작업 트리가 깨끗하며, `main`이 위 기존 SHA를 유지하는 것이다. 커밋 SHA는 최종 보고에서 함께 제공한다. 원격 브랜치 게시와 main 병합은 별도 승인 작업이다.

다음 단계는 Phase 0-B의 `AGENTS.md` 작업별 규칙과 공통 명세 연결이다.
