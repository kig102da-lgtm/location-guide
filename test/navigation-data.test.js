import test from "node:test";
import assert from "node:assert/strict";
import { groupByRegion, regionOf, templeLabel } from "../lib/navigation-data.js";

const temple = (id, name, address) => ({ id, name, address });

test("reads province and city/district from the address", () => {
  assert.deepEqual(regionOf("경기 수원시 팔달구 교동 12-2"), { province: "경기", region: "수원시" });
  assert.deepEqual(regionOf("인천 연수구 새말로55번길 26"), { province: "인천", region: "연수구" });
});

test("groups Gyeonggi by city and Incheon by district in Korean order", () => {
  const [gyeonggi, incheon] = groupByRegion([
    temple("suwon", "수원교당", "경기 수원시 팔달구 교동 12-2"),
    temple("dongsuwon", "동수원교당", "경기 수원시 권선구 동수원로 20"),
    temple("gapyeong", "가평교당", "경기 가평군 가평읍 계량촌길 1-14"),
    temple("songdo", "송도교당", "인천 연수구 컨벤시아대로 81"),
    temple("namdong", "남동교당", "인천 남동구 경인로 520"),
  ]);
  assert.equal(gyeonggi.name, "경기도");
  assert.equal(gyeonggi.count, 3);
  assert.deepEqual(gyeonggi.regions.map(({ name }) => name), ["가평군", "수원시"]);
  assert.deepEqual(gyeonggi.regions[1].temples.map(({ name }) => name), ["동수원교당", "수원교당"]);
  assert.equal(incheon.count, 2);
  assert.deepEqual(incheon.regions.map(({ name }) => name), ["남동구", "연수구"]);
});

test("labels only temples whose name points to another area", () => {
  assert.equal(templeLabel(temple("byeongjeom", "병점교당", "경기 오산시")), "병점교당 (오산시)");
  assert.equal(templeLabel(temple("bupyeong", "부평교당", "인천 계양구")), "부평교당 (계양구)");
  assert.equal(templeLabel(temple("suwon", "수원교당", "경기 수원시")), "수원교당");
});

test("skips addresses outside Gyeonggi and Incheon", () => {
  const groups = groupByRegion([temple("x", "서울교당", "서울 종로구")]);
  assert.deepEqual(groups.map(({ count }) => count), [0, 0]);
});
