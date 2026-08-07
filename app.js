import { searchTemples, toYouTubeEmbedUrl } from "./lib/temple-search.js";
import { DISTRICTS, matchVisibleTemples } from "./lib/navigation-data.js";

const $ = (selector) => document.querySelector(selector);
const elements = {
  main: $("#main"), searchScreen: $("#searchScreen"), resultsScreen: $("#resultsScreen"), detailScreen: $("#detailScreen"),
  searchForm: $("#searchForm"), searchInput: $("#searchInput"), searchButton: $("#searchButton"), loadStatus: $("#loadStatus"), retryButton: $("#retryButton"),
  resultList: $("#resultList"), resultCount: $("#resultCount"), emptyState: $("#emptyState"), resultsTitle: $("#resultsTitle"),
  templeTitle: $("#templeTitle"), videoSection: $("#videoSection"), youtubeFrame: $("#youtubeFrame"), blogSection: $("#blogSection"),
  blogLink: $("#blogLink"), addressText: $("#addressText"), phoneSection: $("#phoneSection"), phoneText: $("#phoneText"),
  kakaoMapLink: $("#kakaoMapLink"), naverMapLink: $("#naverMapLink"), toast: $("#toast"), districtList: $("#districtList")
};
const state = { temples: [], query: "", selected: null, loading: false };
let toastTimer;

function showScreen(target, focusTarget) {
  [elements.searchScreen, elements.resultsScreen, elements.detailScreen].forEach((screen) => { screen.hidden = screen !== target; });
  target.classList.remove("screen-enter");
  requestAnimationFrame(() => target.classList.add("screen-enter"));
  window.scrollTo({ top: 0, behavior: "auto" });
  focusTarget?.focus({ preventScroll: true });
}

function routeParams() { return new URLSearchParams(window.location.hash.slice(1)); }
function goTo(params = {}) {
  const hash = new URLSearchParams(params).toString();
  if (window.location.hash.slice(1) === hash) renderRoute();
  else window.location.hash = hash;
}

function createResultCard(temple) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "temple-card";
  button.setAttribute("aria-label", `${temple.name} 상세 정보 보기`);
  const title = document.createElement("span");
  title.className = "temple-card-title";
  title.textContent = temple.name;
  const address = document.createElement("span");
  address.className = "temple-card-address";
  address.textContent = temple.address;
  button.append(title, address);
  button.addEventListener("click", () => goTo({ temple: temple.id, q: state.query }));
  return button;
}

function createTempleLink(temple, className = "temple-link") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = temple.name;
  button.setAttribute("aria-label", `${temple.name} 상세 정보 보기`);
  button.addEventListener("click", () => goTo({ temple: temple.id }));
  return button;
}

function renderBrowseNavigation() {
  elements.districtList.replaceChildren(...DISTRICTS.map((district) => {
    const section = document.createElement("section");
    section.className = "district-card";
    const title = document.createElement("h3");
    title.textContent = district.name;
    const list = document.createElement("div");
    list.className = "district-temples";
    list.replaceChildren(...matchVisibleTemples(district.temples, state.temples).map((temple) => createTempleLink(temple)));
    section.append(title, list);
    return section;
  }));

}

function renderResults(query) {
  state.query = query.trim();
  elements.searchInput.value = state.query;
  const matches = searchTemples(state.temples, state.query);
  elements.resultList.replaceChildren(...matches.map(createResultCard));
  elements.emptyState.hidden = matches.length !== 0;
  elements.resultCount.textContent = `${matches.length}개의 검색 결과가 있습니다.`;
  showScreen(elements.resultsScreen, elements.resultsTitle);
}

function renderDetail(temple, query) {
  state.selected = temple;
  state.query = query.trim();
  elements.templeTitle.textContent = temple.name;
  const embedUrl = toYouTubeEmbedUrl(temple.youtube);
  elements.videoSection.hidden = !embedUrl;
  elements.youtubeFrame.src = embedUrl;
  elements.youtubeFrame.title = `${temple.name} 소개 영상`;
  elements.blogSection.hidden = !temple.blog;
  elements.blogLink.href = temple.blog || "";
  elements.blogLink.querySelector("span").textContent = `${temple.name} 블로그 바로가기`;
  elements.phoneSection.hidden = !temple.phone;
  elements.phoneText.textContent = temple.phone;
  elements.addressText.textContent = temple.address;
  const mapQuery = encodeURIComponent(`${temple.name} ${temple.address}`);
  elements.kakaoMapLink.href = `https://map.kakao.com/link/search/${mapQuery}`;
  elements.naverMapLink.href = `https://map.naver.com/p/search/${mapQuery}`;
  showScreen(elements.detailScreen, elements.templeTitle);
}

function renderRoute() {
  if (!state.temples.length) return;
  const params = routeParams();
  const templeId = params.get("temple") || "";
  const query = params.get("q") || "";
  if (templeId) {
    const temple = state.temples.find((item) => item.id === templeId);
    if (temple) return renderDetail(temple, query);
  }
  if (query) return renderResults(query);
  state.query = "";
  state.selected = null;
  elements.youtubeFrame.src = "";
  showScreen(elements.searchScreen);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2000);
}

async function copyText(value, successMessage) {
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
    else {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.cssText = "position:fixed;left:-9999px;opacity:0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    showToast(successMessage);
  } catch { showToast("복사하지 못했습니다."); }
}

function setLoadingState(mode) {
  const loading = mode === "loading";
  state.loading = loading;
  elements.main.setAttribute("aria-busy", String(loading));
  elements.searchInput.disabled = mode !== "ready";
  elements.searchButton.disabled = mode !== "ready";
  elements.retryButton.hidden = mode !== "error";
  elements.loadStatus.classList.toggle("error", mode === "error");
  elements.loadStatus.textContent = mode === "loading" ? "교당 정보를 불러오는 중..." : mode === "error" ? "교당 정보를 불러오지 못했습니다." : "";
}

function validateTemples(temples) {
  if (!Array.isArray(temples) || !temples.length) throw new Error("invalid temple data");
  if (new Set(temples.map(({ id }) => id)).size !== temples.length) throw new Error("duplicate temple ids");
  if (temples.some(({ id, name, address }) => !id || !name || !address)) throw new Error("missing required temple data");
  return temples;
}

async function loadTemples() {
  if (state.loading) return;
  setLoadingState("loading");
  try {
    const response = await fetch("/api/temples", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`Google Sheets API request failed: ${response.status}`);
    state.temples = validateTemples(await response.json());
    renderBrowseNavigation();
    setLoadingState("ready");
    renderRoute();
  } catch (error) {
    console.error("Unable to load temple data", error);
    setLoadingState("error");
  }
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  if (query) goTo({ q: query });
});
$("#headerHomeButton").addEventListener("click", () => goTo());
$("#detailHomeButton").addEventListener("click", () => goTo());
$("#resultsBackButton").addEventListener("click", () => goTo());
$("#detailBackButton").addEventListener("click", () => state.query ? goTo({ q: state.query }) : goTo());
$("#copyAddressButton").addEventListener("click", () => { if (state.selected) copyText(state.selected.address, "주소가 복사되었습니다."); });
$("#copyPhoneButton").addEventListener("click", () => { if (state.selected?.phone) copyText(state.selected.phone, "전화번호가 복사되었습니다."); });
elements.retryButton.addEventListener("click", loadTemples);
window.addEventListener("hashchange", renderRoute);
loadTemples();
