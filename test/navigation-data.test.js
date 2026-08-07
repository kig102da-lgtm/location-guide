import test from "node:test";
import assert from "node:assert/strict";
import { DISTRICTS, matchVisibleTemples } from "../lib/navigation-data.js";

test("uses the four approved districts", () => {
  assert.deepEqual(DISTRICTS.map(({ name }) => name), ["수원지구", "안양지구", "분당지구", "인천지구"]);
  assert.ok(DISTRICTS[0].temples.includes("경기판교교당"));
});

test("district lists match only production-visible temples", () => {
  const visible = [{ id: "suwon", name: "수원교당" }, { id: "hidden", name: "다른교당" }];
  assert.deepEqual(matchVisibleTemples(["수원교당", "수원교당", "없는교당"], visible), [visible[0]]);
});
