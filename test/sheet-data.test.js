import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, sheetCsvToTemples } from "../lib/sheet-data.js";

test("parses quoted commas, line breaks, and escaped quotes", () => {
  assert.deepEqual(parseCsv('a,b\r\n"x,y","line 1\nline 2"\r\n"say ""hi""",z'), [
    ["a", "b"],
    ["x,y", "line 1\nline 2"],
    ['say "hi"', "z"],
  ]);
});

test("maps operation settings and hides OFF rows", () => {
  const csv = [
    "templeId,교당명,검색명,검색별칭,주소,전화번호,YouTube URL,블로그 URL,네이버 플레이스 URL,노출 여부,영상 사용,블로그 사용,전화 표시,카카오맵 URL,네이버지도 URL,최종 수정일,메모",
    'visible,테스트교당,테스트,"별칭1, 별칭2",주소,010-1234,https://youtube.test/video,https://blog.test,https://place.test,ON,OFF,ON,OFF,https://kakao.test,https://naver.test,2026-08-07,"관리, 메모"',
    "hidden,숨김교당,숨김,,주소,,,,,OFF,ON,ON,ON,,,,",
  ].join("\n");

  const temples = sheetCsvToTemples(csv);
  assert.equal(temples.length, 1);
  assert.equal(temples[0].id, "visible");
  assert.deepEqual(temples[0].aliases, ["테스트", "별칭1", "별칭2"]);
  assert.equal(temples[0].youtube, "");
  assert.equal(temples[0].blog, "https://blog.test");
  assert.equal(temples[0].phone, "");
  assert.equal(temples[0].updatedAt, "2026-08-07");
  assert.equal("naverPlaceUrl" in temples[0], false);
  assert.equal("naverMapUrl" in temples[0], false);
  assert.equal("kakaoMapUrl" in temples[0], false);
});
