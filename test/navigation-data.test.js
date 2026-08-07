import test from "node:test";
import assert from "node:assert/strict";
import { DISTRICTS, SUBWAY_LINES, matchVisibleTemples } from "../lib/navigation-data.js";

test("uses the four approved districts", () => {
  assert.deepEqual(DISTRICTS.map(({ name }) => name), ["수원지구", "안양지구", "분당지구", "인천지구"]);
});

test("line temple lists are deduplicated and match only production-visible temples", () => {
  assert.ok(SUBWAY_LINES.length > 0);
  for (const line of SUBWAY_LINES) assert.equal(new Set(line.temples).size, line.temples.length);
  const visible = [{ id: "suwon", name: "수원교당" }, { id: "hidden", name: "다른교당" }];
  assert.deepEqual(matchVisibleTemples(["수원교당", "수원교당", "없는교당"], visible), [visible[0]]);
});
