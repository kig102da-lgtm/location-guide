import { toYouTubeEmbedUrl } from "./lib/temple-search.js";
import { groupByRegion, templeLabel } from "./lib/navigation-data.js";

const $ = (selector) => document.querySelector(selector);
const elements = {
  main: $("#main"), homeScreen: $("#homeScreen"), detailScreen: $("#detailScreen"),
  loadStatus: $("#loadStatus"), retryButton: $("#retryButton"), provinceTabs: $("#provinceTabs"), regionList: $("#regionList"),
  templeTitle: $("#templeTitle"), videoSection: $("#videoSection"), youtubeFrame: $("#youtubeFrame"), blogSection: $("#blogSection"),
  blogLink: $("#blogLink"), addressText: $("#addressText"), phoneSection: $("#phoneSection"), phoneText: $("#phoneText"),
  kakaoMapLink: $("#kakaoMapLink"), naverMapLink: $("#naverMapLink"), toast: $("#toast")
};
const state = { temples: [], province: "경기", selected: null, loading: false };
let toastTimer;

function showScreen(target, focusTarget) {
  [elements.homeScreen, elements.detailScreen].forEach((screen) => { screen.hidden = screen !== target; });
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

function createTempleLink(temple, className = "temple-link") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = templeLabel(temple);
  button.setAttribute("aria-label", `${temple.name} 상세 정보 보기`);
  button.addEventListener("click", () => goTo({ temple: temple.id }));
  return button;
}

function renderBrowseNavigation() {
  const provinces = groupByRegion(state.temples);
  elements.provinceTabs.replaceChildren(...provinces.map((province) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "province-tab";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(province.key === state.province));
    tab.append(province.name);
    const count = document.createElement("small");
    count.textContent = province.count;
    tab.append(count);
    tab.addEventListener("click", () => goTo(province.key === "경기" ? {} : { p: province.key }));
    return tab;
  }));
  const current = provinces.find(({ key }) => key === state.province) ?? provinces[0];
  elements.regionList.replaceChildren(...current.regions.map((region) => {
    const row = document.createElement("section");
    row.className = "region-row";
    const title = document.createElement("h3");
    title.textContent = region.name;
    const count = document.createElement("em");
    count.textContent = region.temples.length;
    title.append(count);
    const list = document.createElement("div");
    list.className = "region-temples";
    list.replaceChildren(...region.temples.map((temple) => createTempleLink(temple)));
    row.append(title, list);
    return row;
  }));
}

function renderDetail(temple) {
  state.selected = temple;
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
  // 도로명과 마지막 번지·호수가 줄바꿈으로 떨어지지 않게 한다
  elements.addressText.textContent = temple.address.replace(/ ([^ ]+)$/, " $1");
  const mapQuery = encodeURIComponent(temple.address);
  elements.kakaoMapLink.href = temple.lat && temple.lng
    ? `https://map.kakao.com/link/map/${encodeURIComponent(temple.name)},${temple.lat},${temple.lng}`
    : `https://map.kakao.com/link/search/${mapQuery}`;
  elements.naverMapLink.href = `https://map.naver.com/p/search/${mapQuery}`;
  showScreen(elements.detailScreen, elements.templeTitle);
}

function renderRoute() {
  if (!state.temples.length) return;
  const params = routeParams();
  const templeId = params.get("temple") || "";
  if (templeId) {
    const temple = state.temples.find((item) => item.id === templeId);
    if (temple) return renderDetail(temple);
  }
  state.province = params.get("p") === "인천" ? "인천" : "경기";
  state.selected = null;
  elements.youtubeFrame.src = "";
  renderBrowseNavigation();
  showScreen(elements.homeScreen);
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
  elements.retryButton.hidden = mode !== "error";
  elements.loadStatus.classList.toggle("error", mode === "error");
  elements.loadStatus.textContent = mode === "loading" ? "교당 정보를 불러오는 중..." : mode === "error" ? "교당 정보를 불러오지 못했습니다." : mode === "stale" ? "정보가 최신이 아닐 수 있습니다." : "";
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
    const fromSnapshot = response.headers.get("X-Data-Source") === "snapshot";
    state.temples = validateTemples(await response.json());
    setLoadingState(fromSnapshot ? "stale" : "ready");
    renderRoute();
  } catch (error) {
    console.error("Unable to load temple data", error);
    setLoadingState("error");
  }
}

$("#headerHomeButton").addEventListener("click", () => goTo());
$("#detailHomeButton").addEventListener("click", () => goTo());
$("#copyAddressButton").addEventListener("click", () => { if (state.selected) copyText(state.selected.address, "주소가 복사되었습니다."); });
$("#copyPhoneButton").addEventListener("click", () => { if (state.selected?.phone) copyText(state.selected.phone, "전화번호가 복사되었습니다."); });
elements.retryButton.addEventListener("click", loadTemples);
window.addEventListener("hashchange", renderRoute);
loadTemples();
