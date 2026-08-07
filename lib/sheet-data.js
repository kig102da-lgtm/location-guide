export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1xTMxfW0mc4F3M4LS22GwUWIsb77wGTY9IJwsH2qcTj0/export?format=csv&gid=6288047";

export function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') { value += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(value); value = ""; }
    else if (character === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += character;
  }

  if (value || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

function unique(values) { return [...new Set(values.map((value) => value.trim()).filter(Boolean))]; }
function isOn(value) { return value.trim().toUpperCase() === "ON"; }

export function sheetCsvToTemples(csv) {
  const [rawHeaders = [], ...rows] = parseCsv(csv.replace(/^\uFEFF/, ""));
  const headers = rawHeaders.map((header) => header.trim());

  return rows
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, (row[index] ?? "").trim()])))
    .filter((record) => isOn(record["노출 여부"] ?? ""))
    .map((record) => ({
      id: record.templeId,
      name: record["교당명"],
      aliases: unique([record["검색명"], ...(record["검색별칭"] ?? "").split(/[,;\n]/)]),
      address: record["주소"],
      phone: isOn(record["전화 표시"] ?? "") ? record["전화번호"] : "",
      youtube: isOn(record["영상 사용"] ?? "") ? record["YouTube URL"] : "",
      blog: isOn(record["블로그 사용"] ?? "") ? record["블로그 URL"] : "",
      updatedAt: record["최종 수정일"],
    }))
    .filter((temple) => temple.id && temple.name && temple.address);
}
