# Release Checklist v1.0

검증 결과는 자동 검사, 코드 검토, 실제 운영 데이터 검사, 배포 후 브라우저 검사로 구분합니다. 배포 전에는 배포 관련 항목을 완료로 표시하지 않습니다.

## 디자인 및 화면

- [x] KoPubWorld Dotum Light(300) 전역 적용
- [x] Pretendard 제거
- [x] 좌상단 `로고-인쇄-오렌지블랙.png` 사용
- [x] 로고 카드·배경·그림자 제거
- [x] `심볼-화면-오렌지.png`를 검색·결과·상세 화면 공통 배경으로 적용
- [x] 배경 크기 80%, 중앙 정렬, 반복 없음
- [x] 첫 화면 문구 정확히 적용
- [x] 검색 placeholder 정확히 적용
- [x] 자동완성·미리보기·추천·기본 교당 목록 제거
- [x] 즐겨찾기·하단 내비게이션·교당 부제 제거
- [x] 검색 결과는 교당명과 주소만 표시

## 상세 화면 및 데이터 규칙

- [x] YouTube → 블로그 → 전화/복사 → 주소/복사 → 카카오맵 → 네이버지도 → 처음으로 돌아가기 순서
- [x] 카카오맵 노란색, 네이버지도 초록색
- [x] 네이버지도는 교당명과 주소로 검색
- [x] Google Sheets `노출 여부`, `영상 사용`, `블로그 사용`, `전화 표시` ON/OFF 반영
- [x] 빈 선택 정보는 영역과 여백을 함께 숨김
- [x] 운영 데이터는 지정 Google Sheets만 사용
- [x] `temples.json` 운영 폴백 및 파일 제거
- [x] 로딩·오류·재시도 상태 제공

## URL, SEO 및 PWA

- [x] canonical, `og:url`, `og:image`를 `https://wongi-location.vercel.app` 기준으로 수정
- [x] README, manifest, robots, sitemap 수정
- [x] 저장소에서 기존 `location-guide-eight` URL 제거
- [x] 192px·512px PWA 아이콘과 manifest 연결
- [x] 새 Vercel 프로젝트 이름이 정확히 `wongi-location`
- [x] GitHub `main` 연결 및 운영 배포
- [x] `https://wongi-location.vercel.app` 실서비스 응답 확인

## QA

- [x] 자동 테스트 및 문법 검사 통과
- [x] 운영표의 노출 ON 교당 44개 파싱 확인
- [x] 44개 교당 필수 ID·이름·주소 및 중복 ID 검사
- [x] 영상·블로그·전화 ON/OFF와 빈 값 규칙 검사
- [x] 지도 링크가 교당명+주소 검색으로 생성되는지 검사
- [x] 배포 URL에서 PC Chromium 확인
- [x] 배포 URL에서 390×844 모바일 크기 확인
- [x] 배포 URL에서 복사·외부 링크 상호작용 확인
