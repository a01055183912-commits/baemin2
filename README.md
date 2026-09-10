# 우리 가게 홍보글 작업대

배민 · 네이버 플레이스 · 카카오맵 · 인스타그램 플랫폼별로 다른 홍보글을 만들어주는 실습용 웹앱입니다.
사장님이 "우리 가게 사실"만 입력하면, 플랫폼별 고객 목적에 맞춰 AI가 글을 다시 써주고, 과장 표현/입력 한도를 자동으로 검수합니다.

강의 자료: 김미연 강사 「가게다운 AI 홍보글 플랫폼별 현장가이드」 (2026.09.10 기준)

## 구조

- `server.js` — Express 서버. 정적 파일 서빙 + `/api/generate` (Anthropic API 호출) + `/api/status`
- `public/` — 프론트엔드 (index.html, styles.css, app.js)
- AI 키가 설정되지 않아도 "AI 없이 기본 초안" 버튼으로 규칙 기반 초안을 바로 확인할 수 있습니다.

## 로컬 실행

```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY 채우기 (선택)
npm start
```

`http://localhost:3000` 접속.

## Railway 배포

1. 이 저장소를 Railway 프로젝트에 연결합니다 (New Project → Deploy from GitHub repo).
2. Railway가 Nixpacks로 Node.js 프로젝트를 자동 인식하고 `npm install` → `npm start`로 빌드/실행합니다.
3. Railway 프로젝트의 **Variables** 탭에서 환경변수를 등록합니다.
   - `ANTHROPIC_API_KEY` — Anthropic API 키 (https://console.anthropic.com). 설정하지 않으면 AI 생성 버튼 대신 기본 초안 기능만 동작합니다.
   - `ANTHROPIC_MODEL` — 선택, 기본값 `claude-sonnet-5`.
4. `PORT`는 Railway가 자동으로 주입하므로 별도 설정이 필요 없습니다.
5. 배포 후 Railway가 제공하는 도메인으로 접속해 확인합니다. 헬스체크 경로는 `/healthz` 입니다.

## 사용 방법

1. "우리 가게 사실" 폼에 아는 것만 입력합니다 (3개 이상 채우면 생성 가능). "예시 가게로 채우기"로 샘플을 먼저 체험할 수 있습니다.
2. "홍보글 4개 만들기"를 누르면 AI가 배민/네이버/카카오맵/인스타그램용 글을 각각 만들어 줍니다. AI가 연결되어 있지 않은 환경에서는 자동으로 규칙 기반 기본 초안이 표시됩니다.
3. 각 카드에서 글자 수, 과장 표현("최고", "맛집" 등) 검출, 사용된 가게 사실을 확인한 뒤 "복사" 버튼으로 각 플랫폼에 붙여넣습니다.

## 주의

플랫폼 정책과 관리자 입력 항목은 수시로 변경될 수 있습니다. 실제 등록 전에는 각 플랫폼의 공식 관리자 화면과 도움말을 다시 확인하세요. 본 도구는 검색 상위노출이나 광고 성과를 보장하지 않습니다.
