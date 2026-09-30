# InnerNavi Django

InnerNavi의 주력 포트폴리오 구현입니다. Django 기반 백엔드, Vue 웹, Python 지도 처리 패키지, 검증 하네스와 배포 구성을 하나의 저장소에서 관리합니다.

> 현재 상태: 저장소 골격만 생성했습니다. 세부 범위와 기술 선택은 기존 계획서를 다시 검토한 뒤 확정합니다.

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
infra/                  Compose·Nginx·모니터링·IaC
scripts/                검증·배포·롤백 진입점
.github/workflows/      GitHub Actions
```

