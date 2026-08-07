export const DISTRICTS = [
  { name: "수원지구", temples: ["안산교당", "안산국제교당", "수원교당", "동수원교당", "용인교당", "기흥교당", "죽전교당", "동탄교당", "화성교당", "평택교당", "오산교당", "병점교당", "안성교당", "경기판교교당"] },
  { name: "안양지구", temples: ["군포교당", "산본교당", "동안양교당", "과천교당", "광명교당", "시화교당", "의왕교당"] },
  { name: "분당지구", temples: ["분당교당", "성남교당", "수정교당", "가평교당", "경기광주교당", "구리교당", "남양주교당", "양평교당", "여주교당", "이천교당", "하남교당"] },
  { name: "인천지구", temples: ["인천교당", "남동교당", "부평교당", "북인천교당", "연수교당", "송도교당", "청라교당", "하늘교당", "부천교당", "약대교당", "오정교당", "번개교당"] },
];

// Derived from the supplied route map's CHURCHES -> station -> LINES grouping.
export const SUBWAY_LINES = [
  { name: "1호선", color: "#0052A4", temples: ["부천교당", "번개교당", "인천교당", "군포교당", "의왕교당", "수원시립전문요양원교당", "병점교당", "원광종합병원교당", "오산교당", "평택교당", "안성교당", "동탄교당"] },
  { name: "4호선", color: "#00A5DE", temples: ["과천교당", "동안양교당", "산본교당", "산본병원교당", "안산국제교당", "시화교당"] },
  { name: "5호선", color: "#996CAC", temples: ["하남교당"] },
  { name: "7호선", color: "#747F00", temples: ["약대교당", "오정교당", "광명교당"] },
  { name: "8호선", color: "#E6186C", temples: ["구리교당", "성남교당"] },
  { name: "수인분당선", color: "#F5A200", temples: ["연수교당", "시화교당", "안산국제교당", "안산교당", "화성교당", "수원교당", "동수원교당", "기흥교당", "죽전교당", "분당교당", "수정교당"] },
  { name: "신분당선", color: "#D4003B", temples: ["경기판교교당"] },
  { name: "경춘선", color: "#0C8E72", temples: ["남양주교당", "가평교당"] },
  { name: "경강선", color: "#003DA5", temples: ["경기판교교당", "경기광주교당", "이천교당", "여주교당"] },
  { name: "경의중앙선", color: "#77C4A3", temples: ["양평교당", "구리교당"] },
  { name: "공항철도", color: "#0090D2", temples: ["청라교당", "하늘교당"] },
  { name: "서해선", color: "#8FC31F", temples: ["약대교당"] },
  { name: "인천1호선", color: "#7CA8D5", temples: ["부평교당", "북인천교당", "남동교당", "송도교당"] },
  { name: "인천2호선", color: "#ED8B00", temples: ["남동교당"] },
  { name: "에버라인", color: "#509F22", temples: ["용인교당"] },
];

export function matchVisibleTemples(names, temples) {
  const byName = new Map(temples.map((temple) => [temple.name, temple]));
  return [...new Set(names)].map((name) => byName.get(name)).filter(Boolean);
}
