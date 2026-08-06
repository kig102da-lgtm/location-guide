import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/search.js";

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

function kakaoResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

test("returns a clear error when the server key is missing", async () => {
  delete process.env.KAKAO_REST_API_KEY;
  const response = createResponse();

  await handler({ method: "GET", query: { q: "서울교당" } }, response);

  assert.equal(response.statusCode, 500);
  assert.match(response.body.error, /API 키/);
});

test("uses the Vercel key only in the Kakao authorization header", async (t) => {
  process.env.KAKAO_REST_API_KEY = "  test-rest-key  ";
  t.after(() => delete process.env.KAKAO_REST_API_KEY);
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.headers.Authorization, "KakaoAK test-rest-key");
    assert.equal(url.searchParams.get("query"), "원불교 서울교당");
    return kakaoResponse({ documents: [{
      id: "1",
      place_name: "원불교 서울교당",
      road_address_name: "서울",
      address_name: "서울",
      y: "37.0",
      x: "127.0",
      phone: "",
      place_url: "http://place.map.kakao.com/1"
    }] });
  });
  const response = createResponse();

  await handler({ method: "GET", query: { q: "원불교 서울교당" } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.places[0].name, "원불교 서울교당");
  assert.equal(response.body.places[0].kakaoMapUrl, "https://place.map.kakao.com/1");
});

test("reports Kakao authentication failures without exposing the key", async (t) => {
  process.env.KAKAO_REST_API_KEY = "secret-value";
  t.after(() => delete process.env.KAKAO_REST_API_KEY);
  t.mock.method(globalThis, "fetch", async () => kakaoResponse({ code: -401, message: "Unauthorized" }, 401));
  const response = createResponse();

  await handler({ method: "GET", query: { q: "서울교당" } }, response);

  assert.equal(response.statusCode, 502);
  assert.equal(response.body.code, "KAKAO_AUTH_FAILED");
  assert.doesNotMatch(JSON.stringify(response.body), /secret-value/);
});

test("keeps place details available when optional walking routes fail", async (t) => {
  process.env.KAKAO_REST_API_KEY = "test-rest-key";
  t.after(() => delete process.env.KAKAO_REST_API_KEY);
  const destination = {
    id: "destination",
    place_name: "서울교당",
    road_address_name: "서울",
    address_name: "서울",
    y: "37.0",
    x: "127.0",
    phone: "",
    place_url: "https://place.map.kakao.com/destination"
  };
  const nearby = {
    id: "nearby",
    place_name: "가까운 역",
    address_name: "서울",
    y: "37.01",
    x: "127.01",
    place_url: "https://place.map.kakao.com/nearby"
  };

  t.mock.method(globalThis, "fetch", async (url) => {
    if (url.pathname === "/v2/local/search/keyword.json" && !url.searchParams.has("x")) {
      return kakaoResponse({ documents: [destination] });
    }
    if (url.pathname.startsWith("/v2/local/search/")) {
      return kakaoResponse({ documents: [nearby] });
    }
    return kakaoResponse({ code: -5, message: "route unavailable" }, 503);
  });
  const response = createResponse();

  await handler({ method: "GET", query: { q: "서울교당", placeId: "destination" } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.place.id, "destination");
  assert.equal(response.body.subway.walkRoute, null);
  assert.equal(response.body.busStop.walkRoute, null);
});
