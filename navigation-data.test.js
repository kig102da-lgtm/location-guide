import test from "node:test";
import assert from "node:assert/strict";
import { DISTRICT_ORDER, groupByDistrict } from "../lib/navigation-data.js";

const temple = (id, name, district) => ({ id, name, district });

test("keeps the four approved districts in order", () => {
  assert.deepEqual(DISTRICT_ORDER, ["수원지구", "안양지구", "분당지구", "인천지구"]);
});

test("groups temples by their sheet district and drops empty districts", () => {
  const groups = groupByDistrict([
    temple("suwon", "수원교당", "수원지구"),
    temple("gunpo", "군포교당", "안양지구"),
    temple("gyeonggi-pangyo", "경기판교교당", "수원지구"),
  ]);
  assert.deepEqual(groups.map(({ name }) => name), ["수원지구", "안양지구"]);
  assert.deepEqual(groups[0].temples.map(({ name }) => name), ["수원교당", "경기판교교당"]);
});

test("appends unknown districts after the approved order", () => {
  const groups = groupByDistrict([
    temple("sanbon-hospital", "산본병원교당", "기관교당"),
    temple("suwon", "수원교당", "수원지구"),
  ]);
  assert.deepEqual(groups.map(({ name }) => name), ["수원지구", "기관교당"]);
});

test("skips temples with no district", () => {
  assert.deepEqual(groupByDistrict([temple("x", "미지정교당", "")]), []);
});
