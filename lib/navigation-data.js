export const PROVINCES = [
  { key: "경기", name: "경기도" },
  { key: "인천", name: "인천" },
];

// 교당 이름이 가리키는 지역과 주소상 시·군·구가 다른 곳만 괄호로 실제 지역을 덧붙인다.
export const REGION_NOTES = { byeongjeom: "오산시", bupyeong: "계양구" };

const collator = new Intl.Collator("ko");

// 주소 첫 두 칸이 시·도와 시·군·구다. 예) "경기 수원시 팔달구 ..." → 경기 / 수원시
export function regionOf(address = "") {
  const [province = "", region = ""] = address.trim().split(/\s+/);
  return { province, region };
}

export function templeLabel(temple) {
  const note = REGION_NOTES[temple.id];
  return note ? `${temple.name} (${note})` : temple.name;
}

export function groupByRegion(temples) {
  return PROVINCES.map(({ key, name }) => {
    const regions = new Map();
    for (const temple of temples) {
      const { province, region } = regionOf(temple.address);
      if (province !== key || !region) continue;
      if (!regions.has(region)) regions.set(region, []);
      regions.get(region).push(temple);
    }
    const list = [...regions]
      .sort(([a], [b]) => collator.compare(a, b))
      .map(([region, items]) => ({ name: region, temples: items.sort((a, b) => collator.compare(a.name, b.name)) }));
    return { key, name, count: list.reduce((sum, region) => sum + region.temples.length, 0), regions: list };
  });
}
