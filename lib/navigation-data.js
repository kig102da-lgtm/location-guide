export const DISTRICTS = [
  { name: "수원지구", temples: ["안산교당", "안산국제교당", "수원교당", "동수원교당", "용인교당", "기흥교당", "죽전교당", "동탄교당", "화성교당", "평택교당", "오산교당", "병점교당", "안성교당", "경기판교교당"] },
  { name: "안양지구", temples: ["군포교당", "산본교당", "동안양교당", "과천교당", "광명교당", "시화교당", "의왕교당"] },
  { name: "분당지구", temples: ["분당교당", "성남교당", "수정교당", "가평교당", "경기광주교당", "구리교당", "남양주교당", "양평교당", "여주교당", "이천교당", "하남교당"] },
  { name: "인천지구", temples: ["인천교당", "남동교당", "부평교당", "북인천교당", "연수교당", "송도교당", "청라교당", "하늘교당", "부천교당", "약대교당", "오정교당", "번개교당"] },
];

export function matchVisibleTemples(names, temples) {
  const byName = new Map(temples.map((temple) => [temple.name, temple]));
  return [...new Set(names)].map((name) => byName.get(name)).filter(Boolean);
}
