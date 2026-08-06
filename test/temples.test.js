import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { searchTemples, toYouTubeEmbedUrl } from "../lib/temple-search.js";

const temples = JSON.parse(await fs.readFile(new URL("../data/temples.json", import.meta.url), "utf8"));

test("contains exactly 44 unique, valid public temples", () => {
  assert.equal(temples.length, 44);
  assert.equal(new Set(temples.map(({ id }) => id)).size, 44);
  assert.equal(new Set(temples.map(({ name }) => name)).size, 44);
  for (const temple of temples) {
    assert.ok(temple.id);
    assert.ok(temple.name.endsWith("교당"));
    assert.ok(temple.address);
    assert.ok(Array.isArray(temple.aliases));
    assert.match(temple.kakaoMapUrl, /^https:\/\/map\.kakao\.com\//);
    assert.match(temple.naverMapUrl, /^https:\/\/map\.naver\.com\//);
    if (temple.blog) assert.match(temple.blog, /^https:\/\//);
  }
});

test("every temple is searchable by its full display name", () => {
  for (const temple of temples) {
    assert.equal(searchTemples(temples, temple.name)[0]?.id, temple.id, temple.name);
  }
});

test("preserves 경기판교교당 and the 판교교당 alias", () => {
  const pangyo = temples.find(({ id }) => id === "gyeonggi-pangyo");
  assert.equal(pangyo.name, "경기판교교당");
  assert.ok(pangyo.aliases.includes("판교교당"));
  assert.equal(searchTemples(temples, "판교교당")[0]?.id, pangyo.id);
});

test("partial searches rank the closest temple first", () => {
  const matches = searchTemples(temples, "안산");
  assert.deepEqual(matches.slice(0, 2).map(({ name }) => name), ["안산교당", "안산국제교당"]);
});

test("current optional data matches the authoritative workbook", () => {
  assert.equal(temples.filter(({ blog }) => blog).length, 28);
  assert.equal(temples.filter(({ youtube }) => youtube).length, 0);
  assert.ok(temples.some(({ phone }) => !phone));
});

test("YouTube links convert without autoplay", () => {
  assert.equal(toYouTubeEmbedUrl("https://youtu.be/abc123"), "https://www.youtube-nocookie.com/embed/abc123");
  assert.equal(toYouTubeEmbedUrl("https://www.youtube.com/watch?v=abc123"), "https://www.youtube-nocookie.com/embed/abc123");
  assert.equal(toYouTubeEmbedUrl(""), "");
});
