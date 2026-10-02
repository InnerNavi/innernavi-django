# 개발 기반 검토 후 보완 — 2026-10-02

## 요청과 범위

- 사용자 승인: 웹 연결 확인의 시간 제한·실패 테스트와 pytest 캐시 경고를 보완하고 재검증.
- 제외: Git 지속 설정·소유권/ACL 변경·브랜치 생성·커밋·push·실계정·유료 API·클라우드.
- 기존 미커밋 개발 기반을 유지하고 관련 코드·설정·문서만 수정했다. 패키지 버전과 의존성 잠금 파일은 변경하지 않았다.

## 수정

1. `fetchHealth`에 5초 deadline, `AbortController` 취소, 성공/실패 시 타이머 정리를 추가했다. 응답 헤더뿐 아니라 JSON 본문 읽기도 제한한다. 취소를 무시하는 전송 모의 객체에서도 호출자는 시간 초과로 종료한다.
2. 화면 상태를 `useHealthCheck`로 분리해 시간 초과 안내·버튼 재사용·재시도·중복 요청 방지를 단위 테스트했다. HTTP/네트워크 오류는 내부 상세를 노출하지 않는 기존 안내를 유지한다.
3. pytest `cache_dir`를 `.cache/pytest`로 지정했다. 기존 `.pytest_cache`를 삭제하거나 소유권/권한을 바꾸지 않았다. `.cache`는 기존 Git/Docker 제외 규칙을 사용한다.

## 실제 결과

| 검사 | 결과 |
| --- | --- |
| Git Bash Windows Vitest | 2개 파일, 13개 PASS |
| Windows Vue 타입 검사·build | PASS |
| Linux 개발 web 이미지 build | PASS |
| Linux 임시 web 컨테이너 타입 검사·build·Vitest | PASS, 13개 PASS |
| `uv sync --locked --check` | PASS, Would make no changes |
| Django `check` | PASS, 문제 없음 |
| PostgreSQL `makemigrations --check --dry-run` | PASS, No changes detected |
| `pytest -W error::pytest.PytestCacheWarning` | 6개 PASS, 캐시 경고 없음 |
| 새 캐시 쓰기 결과 | `.cache/pytest/v/cache/nodeids`를 읽어 테스트 ID 6개 확인 |
| 새 캐시 Git 제외 | `git check-ignore`로 확인 |
| Ruff check / format / mypy | PASS, 현재 검사 범위 유지 |

웹 테스트 구성: 기존 응답 형식 2개 + 정상 응답/무응답/본문 지연/HTTP 오류/네트워크 오류/JSON 오류/다른 응답/재시도 8개 + 화면 상태 3개. 타임아웃은 fake timer로 5초 직전·직후와 타이머 정리를 확인한다. 화면 상태 검사는 실제 브라우저 렌더링·클릭 E2E가 아니다.

Python 캐시 경고를 무시하거나 cacheprovider를 끄지 않았다. 경고를 오류로 처리한 검사가 통과하고 새 캐시 파일이 실제 생성된 것을 확인했다.

잠금 파일 SHA-256은 초기 검증과 동일하다.

```text
uv.lock
ED733BEA3796604AB9FD9795B567BEA6248F126AC92053A32159CBFFDCC2BF84

apps/web/package-lock.json
47F5D837540471D011DCF7583FEA19AE4E7E3558CC7394A9B7C042130DA66A6E
```

## 종료와 남은 범위

검증을 위해 시작한 InnerNavi PostgreSQL/Redis는 다시 중지했다. Linux 일회성 web 테스트 컨테이너는 `run --rm --no-deps`로 자동 정리했다. 데이터 볼륨은 보존하고 기존 다른 프로젝트의 컨테이너를 시작·삭제하지 않았다.

일반 Git 명령의 저장소 소유자 경고는 여전히 별도 조치가 필요하다. 읽기 검증에만 정확한 저장소 경로의 `-c safe.directory=...`를 사용하며, 전역 설정·소유권·커밋을 변경하지 않았다.

전체 하네스/CI, M0, 계정 승인·권한·다층 경로, 운영 배포·보안 종합 검사·브라우저 E2E는 이 보완 작업의 완료 범위가 아니다.

위 Git 상태는 보완 완료 시점의 기록이다. 이후 사용자 승인에 따른 저장소 한 곳의 신뢰 등록과 로컬 기준점 브랜치는 [기준점 기록](development-baseline-2026-10-02.md)을 따른다.
