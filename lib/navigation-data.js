export const DISTRICT_ORDER = ["수원지구", "안양지구", "분당지구", "인천지구"];

export function groupByDistrict(temples) {
  const groups = new Map(DISTRICT_ORDER.map((name) => [name, []]));
  for (const temple of temples) {
    if (!temple.district) continue;
    if (!groups.has(temple.district)) groups.set(temple.district, []);
    groups.get(temple.district).push(temple);
  }
  return [...groups].filter(([, list]) => list.length).map(([name, list]) => ({ name, temples: list }));
}
