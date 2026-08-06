# 원클릭 위치 안내 MVP — Vercel 배포판

`원불교 서울교당`을 예제로 한 카카오톡 공유용 위치 안내 샘플입니다. 장소 정보는 브라우저에 저장한 샘플 데이터가 아니라 카카오 공식 REST API에서 가져옵니다.

## 왜 index.html을 직접 열면 검색되지 않나요?

주소가 `file:///C:/.../index.html`인 경우 HTML과 JavaScript만 로컬 파일로 열린 상태입니다. 이 환경에는 `/api/search` 요청을 처리할 웹 서버나 Vercel Serverless Function이 없으므로 실제 검색 API를 호출할 수 없습니다.

페이지는 `file://` 환경을 감지해 다음 안내를 표시하며 불필요한 요청을 보내지 않습니다.

> 현재 파일을 직접 열었습니다. 검색 기능은 Vercel 배포 주소 또는 vercel dev에서 사용할 수 있습니다.

## 프로젝트 구조

```text
location-guide/
├─ api/
│  └─ search.js
├─ assets/images/share-seoul.jpg
├─ .env.example
├─ .gitignore
├─ app.js
├─ index.html
├─ package.json
├─ styles.css
└─ vercel.json
```

Vercel은 `api/search.js`를 자동으로 `/api/search` Serverless Function으로 배포합니다. 프런트엔드와 서버 함수 모두 이 경로를 사용합니다.

## 필요한 API 키

카카오 디벨로퍼스에서 애플리케이션을 생성하고 **REST API 키**를 발급받습니다. 실제 키를 소스 파일이나 Git 저장소에 넣지 마세요.

`.env.example`:

```text
KAKAO_REST_API_KEY=
```

`.gitignore`는 `.env`, `.env.local`, `.env.*.local`과 `.vercel`을 제외하도록 설정되어 있습니다. `.env.example`에는 값이 없으므로 Git에 포함할 수 있습니다.

## Vercel에 배포하기

### Git 저장소로 배포

1. `location-guide` 폴더를 GitHub 저장소에 올립니다.
2. Vercel에서 **Add New → Project**를 선택합니다.
3. 저장소를 가져옵니다.
4. Framework Preset은 **Other**로 둡니다.
5. Root Directory가 이 프로젝트 폴더인지 확인합니다.
6. Build Command와 Output Directory는 비워 둡니다.
7. **Environment Variables**에서 다음 값을 등록합니다.
   - Name: `KAKAO_REST_API_KEY`
   - Value: 카카오 디벨로퍼스의 REST API 키
   - Environment: Production, Preview, Development
8. **Deploy**를 누릅니다.

환경변수를 배포 후 추가하거나 변경했다면 새 배포를 실행해야 함수에 반영됩니다.

카카오톡 등 로그인하지 않은 사용자에게 공유하려면 Vercel의 **Settings → Deployment Protection**에서 Production 배포가 Vercel Authentication으로 보호되지 않는지도 확인합니다. 보호된 배포는 사이트와 `/api/search` 대신 Vercel 로그인 페이지로 이동합니다.

### Vercel 대시보드에서 환경변수 추가

1. 프로젝트의 **Settings → Environment Variables**로 이동합니다.
2. `KAKAO_REST_API_KEY`를 추가합니다.
3. 키를 노출하지 않도록 Sensitive 옵션을 사용할 수 있습니다.
4. **Deployments**에서 최신 배포를 Redeploy 합니다.

## 로컬에서 실행하기

Node.js와 Vercel CLI가 필요합니다.

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npm run dev
```

터미널에 표시된 `http://localhost:3000` 주소를 엽니다. `index.html`을 더블클릭하지 마세요.

키를 직접 로컬에 설정할 경우 `.env.local`을 만들 수 있습니다.

```text
KAKAO_REST_API_KEY=발급받은_REST_API_키
```

`.env.local`은 `.gitignore`에 포함되어 있습니다.

## API 사용 방법

장소 검색:

```text
GET /api/search?q=원불교%20서울교당
```

응답 예시:

```json
{
  "places": [
    {
      "id": "장소 ID",
      "name": "원불교 서울교당",
      "address": "검색된 주소",
      "latitude": "위도",
      "longitude": "경도",
      "phone": "검색된 전화번호"
    }
  ]
}
```

장소 선택 후 상세 교통정보는 같은 경로에 `placeId`를 추가해 요청합니다.

```text
GET /api/search?q=원불교%20서울교당&placeId=장소ID
```

검색어는 서버에서 `URLSearchParams`로 안전하게 인코딩되며, 카카오 키는 Serverless Function에서만 읽습니다.

## 자동 검색과 공유

아래와 같이 `q` 파라미터가 있으면 검색창을 채우고 자동 검색합니다.

```text
https://배포주소/?q=원불교서울교당
```

위치 공유 버튼도 같은 형식의 URL을 클립보드에 복사합니다.

## 오류 해결

- **파일을 직접 열었다는 안내:** 정상입니다. Vercel에 배포하거나 `vercel dev`를 실행하세요.
- **검색 서버에 연결할 수 없습니다:** 배포 상태와 `/api/search` 함수 로그를 확인하세요.
- **로그인 또는 HTML 페이지가 반환됨:** Vercel의 Production Deployment Protection을 해제하고 다시 접속하세요.
- **API 키가 설정되지 않았습니다:** Vercel 환경변수를 추가하고 재배포하세요.
- **카카오 API 인증 실패:** JavaScript 키가 아닌 REST API 키인지 확인하고, 따옴표나 앞뒤 공백 없이 `KAKAO_REST_API_KEY`에 저장한 뒤 재배포하세요.
- **검색 결과가 없음:** 카카오 Local API가 해당 검색어의 장소를 반환하지 않은 경우입니다.

## Open Graph

`index.html`의 Open Graph 값은 서울교당 MVP용 정적 카드입니다. 배포 전에 `https://example.com`을 실제 Vercel 도메인으로 교체해야 합니다. 카카오톡 크롤러는 브라우저 JavaScript를 실행하지 않으므로 쿼리별 동적 카드는 별도 서버 렌더링이 필요합니다.
