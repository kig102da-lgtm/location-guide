const KAKAO_BASE_URL = "https://dapi.kakao.com";

function getQueryValue(value) {
  return Array.isArray(value) ? value[0] : value || "";
}

function sendJson(response, status, body) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", status === 200 ? "public, max-age=60" : "no-store");
  return response.status(status).json(body);
}

async function requestKakao(path, parameters, apiKey) {
  const url = new URL(path, KAKAO_BASE_URL);
  const safeParameters = new URLSearchParams();

  Object.entries(parameters).forEach(([name, value]) => {
    if (value !== undefined && value !== "") {
      safeParameters.set(name, String(value));
    }
  });

  // URLSearchParams가 검색어를 포함한 모든 값을 안전하게 URL 인코딩합니다.
  url.search = safeParameters.toString();

  const kakaoResponse = await fetch(url, {
    headers: { Authorization: `KakaoAK ${apiKey}` }
  });

  const responseText = await kakaoResponse.text();
  let responseBody;

  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseBody = {};
  }

  if (!kakaoResponse.ok) {
    const error = new Error(
      kakaoResponse.status === 401 || kakaoResponse.status === 403
        ? "카카오 API 인증에 실패했습니다. 서버 환경변수를 확인해 주세요."
        : responseBody.message || `카카오 API 요청에 실패했습니다. (${kakaoResponse.status})`
    );
    error.status = kakaoResponse.status;
    error.kakaoCode = responseBody.code;
    throw error;
  }

  return responseBody;
}

function mapPlace(place) {
  return {
    id: place.id,
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    latitude: place.y,
    longitude: place.x,
    phone: place.phone || "",
    kakaoMapUrl: place.place_url.replace(/^http:/, "https:"),
    naverMapUrl: `https://map.naver.com/p/search/${encodeURIComponent(place.place_name)}`
  };
}

async function findNearby(destination, apiKey, type) {
  const common = {
    x: destination.x,
    y: destination.y,
    radius: 5000,
    sort: "distance",
    size: 1
  };

  const result = type === "subway"
    ? await requestKakao("/v2/local/search/category.json", { ...common, category_group_code: "SW8" }, apiKey)
    : await requestKakao("/v2/local/search/keyword.json", { ...common, query: "버스정류장" }, apiKey);

  return result.documents?.[0] || null;
}

async function findWalkRoute(start, destination, apiKey) {
  if (!start) return null;

  const result = await requestKakao("/v2/routing/walk", {
    start_x: start.x,
    start_y: start.y,
    end_x: destination.x,
    end_y: destination.y,
    route_mode: "SHORTEST"
  }, apiKey);

  if (result.status !== "OK" || !result.route?.properties) return null;

  return {
    distance: result.route.properties.totalDistance,
    time: result.route.properties.totalTime,
    landingUrl: result.route.properties.landingUrl
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "GET 요청만 지원합니다." });
  }

  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    return sendJson(response, 500, {
      error: "검색 서버의 API 키가 설정되지 않았습니다."
    });
  }

  const query = getQueryValue(request.query?.q).trim();
  const placeId = getQueryValue(request.query?.placeId).trim();

  if (!query || query.length > 80) {
    return sendJson(response, 400, { error: "검색어를 확인해 주세요." });
  }

  try {
    const searchResult = await requestKakao("/v2/local/search/keyword.json", {
      query,
      size: 10
    }, apiKey);
    const documents = Array.isArray(searchResult.documents) ? searchResult.documents : [];

    if (!placeId) {
      return sendJson(response, 200, { places: documents.map(mapPlace) });
    }

    const destination = documents.find((place) => place.id === placeId);
    if (!destination) {
      return sendJson(response, 404, { error: "선택한 장소를 다시 찾지 못했습니다." });
    }

    const [subwayDocument, busDocument] = await Promise.all([
      findNearby(destination, apiKey, "subway"),
      findNearby(destination, apiKey, "bus")
    ]);
    const [subwayWalk, busWalk] = await Promise.all([
      findWalkRoute(subwayDocument, destination, apiKey),
      findWalkRoute(busDocument, destination, apiKey)
    ]);
    const mapNearby = (place, route) => place ? {
      name: place.place_name,
      latitude: place.y,
      longitude: place.x,
      walkRoute: route
    } : null;

    return sendJson(response, 200, {
      place: mapPlace(destination),
      subway: mapNearby(subwayDocument, subwayWalk),
      busStop: mapNearby(busDocument, busWalk)
    });
  } catch (error) {
    console.error("Kakao API request failed", {
      status: error.status,
      kakaoCode: error.kakaoCode,
      message: error.message
    });
    return sendJson(response, 502, {
      error: error.message || "카카오 장소 검색에 실패했습니다."
    });
  }
}
