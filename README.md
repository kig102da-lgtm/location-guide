# 원불교 경기인천교구 교당 안내

경기인천교구 교당을 이름으로 검색하고 주소·전화·영상·블로그·지도 정보를 확인하는 모바일 우선 웹앱입니다.

## 운영 데이터

운영자는 [Google Sheets 운영표](https://docs.google.com/spreadsheets/d/1xTMxfW0mc4F3M4LS22GwUWIsb77wGTY9IJwsH2qcTj0/edit?gid=6288047#gid=6288047)만 수정합니다. 앱은 `/api/temples`에서 공개 CSV를 읽어 사용하며, 저장소의 JSON 파일을 운영 데이터로 사용하지 않습니다.

- `노출 여부`: `ON`인 교당만 검색 가능
- `영상 사용`: `ON`이고 URL이 있을 때만 YouTube 표시
- `블로그 사용`: `ON`이고 URL이 있을 때만 블로그 표시
- `전화 표시`: `ON`이고 번호가 있을 때만 전화 표시
- 빈 정보는 영역 자체를 표시하지 않음
- 변경 내용은 최대 5분의 캐시 뒤 반영

## 검증

Node.js 20 이상에서 실행합니다.

```text
npm run validate
```

## 배포

Vercel 프로젝트 이름은 `wongi-location`, 운영 URL은 <https://wongi-location.vercel.app>입니다. GitHub 저장소 `kig102da-lgtm/location-guide`의 `main` 브랜치를 연결합니다.
