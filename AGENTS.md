# Repository Contract

이 파일은 계획서 재검토 후 구체화한다.

- 비밀값과 실제 개인정보를 커밋하지 않는다.
- 공개 가능한 합성 평면도만 샘플로 사용한다.
- 백엔드, 웹, 지도 처리 패키지의 경계를 유지한다.
- 변경 완료 조건과 검증 명령은 `scripts/`와 CI가 같은 진입점을 사용하도록 한다.
- 중요한 기술 선택은 `docs/adr/`에 기록한다.
- 로컬 개발 명령과 실행 문서는 Git Bash 기준으로 안내한다. 설치 진입점은 `bash scripts/bootstrap-python.sh`이며, Git Bash와 WSL을 혼동하거나 전역 PATH를 자동 변경하지 않는다.

