export function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/^원불교\s*/, "").replace(/[\s,._-]+/g, "");
}

function rankTemple(temple, query) {
  const name = normalizeSearchText(temple.name);
  const aliases = temple.aliases.map(normalizeSearchText);
  if (name === query) return 0;
  if (aliases.includes(query)) return 1;
  if (name.startsWith(query)) return 2;
  if (aliases.some((alias) => alias.startsWith(query))) return 3;
  if (name.includes(query)) return 4;
  if (aliases.some((alias) => alias.includes(query))) return 5;
  return Number.POSITIVE_INFINITY;
}

export function searchTemples(temples, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  return temples.map((temple, index) => ({ temple, index, rank: rankTemple(temple, normalizedQuery) })).filter(({ rank }) => Number.isFinite(rank)).sort((a, b) => a.rank - b.rank || a.index - b.index).map(({ temple }) => temple);
}

export function toYouTubeEmbedUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    let videoId = "";
    if (url.hostname === "youtu.be") videoId = url.pathname.slice(1).split("/")[0];
    if (url.hostname.endsWith("youtube.com")) {
      videoId = url.searchParams.get("v") || "";
      if (!videoId && /^\/(embed|shorts)\//.test(url.pathname)) videoId = url.pathname.split("/")[2] || "";
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : "";
  } catch {
    return "";
  }
}
