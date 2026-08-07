import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("release URL and metadata use the new production origin", async () => {
  const [html, readme, robots, sitemap] = await Promise.all([
    read("index.html"), read("README.md"), read("robots.txt"), read("sitemap.xml"),
  ]);
  for (const source of [html, readme, robots, sitemap]) {
    assert.match(source, /https:\/\/wongi-location\.vercel\.app/);
    assert.doesNotMatch(source, /location-guide-eight/);
  }
  assert.match(html, /rel="canonical" href="https:\/\/wongi-location\.vercel\.app\/"/);
  assert.match(html, /property="og:url" content="https:\/\/wongi-location\.vercel\.app\/"/);
  assert.match(html, /property="og:image" content="https:\/\/wongi-location\.vercel\.app\/og-image\.png"/);
});

test("release UI excludes autocomplete, suggestions, favorites, and bottom navigation", async () => {
  const [html, app, styles] = await Promise.all([read("index.html"), read("app.js"), read("styles.css")]);
  assert.match(html, /반갑습니다\. 경기인천교구 교당을 방문해 보세요/);
  assert.match(html, /열린 교화, 친절한 교당/);
  assert.match(html, /placeholder="교당명을 입력하세요"/);
  assert.match(html, /autocomplete="off"/);
  assert.doesNotMatch(html + app, /datalist|templeSuggestions|favorite|즐겨찾기|bottom-nav/i);
  assert.doesNotMatch(html + app + styles, /Pretendard/i);
  assert.match(styles, /font-family: "KoPubWorld Dotum"/);
  assert.match(styles, /background-size: 80%/);
  assert.match(styles, /background-position: center center/);
});

test("detail content order and computed map searches are fixed", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("app.js")]);
  const ids = ["videoSection", "blogSection", "phoneSection", "addressLabel", "kakaoMapLink", "naverMapLink", "detailHomeButton"];
  const positions = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.match(app, /map\.kakao\.com\/link\/search\/\$\{mapQuery\}/);
  assert.match(app, /map\.naver\.com\/p\/search\/\$\{mapQuery\}/);
  assert.doesNotMatch(app, /kakaoMapUrl|naverMapUrl|naverPlaceUrl/);
});

test("Google Sheets is the only production temple source", async () => {
  const [app, sheet, readme] = await Promise.all([read("app.js"), read("lib/sheet-data.js"), read("README.md")]);
  assert.match(app, /fetch\("\/api\/temples"/);
  assert.doesNotMatch(app + readme, /temples\.json/);
  assert.match(sheet, /1xTMxfW0mc4F3M4LS22GwUWIsb77wGTY9IJwsH2qcTj0/);
  assert.match(sheet, /gid=6288047/);
});
