import { SHEET_CSV_URL, sheetCsvToTemples } from "../lib/sheet-data.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sheetResponse = await fetch(SHEET_CSV_URL, {
      headers: { "User-Agent": "wongi-location/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!sheetResponse.ok) throw new Error(`Google Sheets returned ${sheetResponse.status}`);
    const temples = sheetCsvToTemples(await sheetResponse.text());
    if (!temples.length) throw new Error("Google Sheets returned no visible temples");
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return response.status(200).json(temples);
  } catch (error) {
    console.error("Unable to load temple data", error);
    response.setHeader("Cache-Control", "no-store");
    return response.status(502).json({ error: "Unable to load temple data" });
  }
}
