(function(){
  "use strict";
  const $=(selector)=>document.querySelector(selector);
  const state={query:"",selected:null};
  let toastTimer;

  function setStatus(message,isError=false){const el=$("#status");el.textContent=message;el.classList.toggle("error",isError)}
  function showToast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
  async function copyText(text){if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return}const area=document.createElement("textarea");area.value=text;area.style.cssText="position:fixed;opacity:0";document.body.append(area);area.select();document.execCommand("copy");area.remove()}
  async function request(params){
    if(location.protocol==="file:"){
      throw new Error("이 파일을 직접 열면 검색할 수 없습니다. Vercel에 배포하거나 vercel dev로 실행해 주세요.");
    }

    let response;
    try{
      response=await fetch(`/api/search?${new URLSearchParams(params)}`);
    }catch{
      throw new Error("검색 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }

    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      throw new Error(data.error||"검색 서버에서 요청을 처리하지 못했습니다.");
    }
    return data;
  }

  function createCandidate(place){const button=document.createElement("button");button.type="button";button.className="candidate";const name=document.createElement("strong");name.textContent=place.name;const address=document.createElement("span");address.textContent=place.address;button.append(name,address);button.addEventListener("click",()=>selectPlace(place));return button}
  function renderCandidates(places){const list=$("#candidateList");list.replaceChildren(...places.map(createCandidate));$("#candidateSection").hidden=false;$("#placeSection").hidden=true}
  function formatDistance(meters){return meters>=1000?`${(meters/1000).toFixed(1)}km`:`${meters}m`}
  function formatTime(seconds){const minutes=Math.max(1,Math.round(seconds/60));return `약 ${minutes}분`}
  function createTransportCard(type,item){if(!item)return null;const article=document.createElement("article");article.className="transport-card";const route=item.walkRoute;article.innerHTML=`<div class="transport-type"><span>${type}</span></div><h3></h3><div class="route-facts"></div>`;article.querySelector("h3").textContent=item.name;const facts=article.querySelector(".route-facts");if(route){facts.innerHTML=`<div><small>실제 도보거리</small><strong>${formatDistance(route.distance)}</strong></div><div><small>예상 도보시간</small><strong>${formatTime(route.time)}</strong></div>`}else{const note=document.createElement("p");note.className="route-note";note.textContent="도보 경로를 찾지 못했습니다.";article.append(note)}return article}
  function renderPlace(data){const p=data.place;state.selected=p;$("#candidateSection").hidden=true;$("#placeName").textContent=p.name;$("#placeAddress").textContent=p.address;$("#latitude").textContent=p.latitude;$("#longitude").textContent=p.longitude;$("#kakaoMapLink").href=p.kakaoMapUrl;$("#naverMapLink").href=p.naverMapUrl;const cards=[createTransportCard("가장 가까운 지하철역",data.subway),createTransportCard("가장 가까운 버스정류장",data.busStop)].filter(Boolean);$("#transportCards").replaceChildren(...cards);const phoneWrap=$("#phoneWrap");if(p.phone){$("#phoneLink").textContent=p.phone;$("#phoneLink").href=`tel:${p.phone.replace(/[^+\d]/g,"")}`;phoneWrap.hidden=false}else phoneWrap.hidden=true;$("#placeSection").hidden=false;setStatus("");$("#placeSection").scrollIntoView({behavior:"smooth",block:"start"})}

  async function selectPlace(place){setStatus("교통 정보를 불러오는 중입니다...");try{const data=await request({q:state.query,placeId:place.id});renderPlace(data)}catch(error){setStatus(error.message,true)}}
  async function search(query){const clean=query.trim();if(!clean)return;state.query=clean;setStatus("장소를 검색하는 중입니다...");$("#candidateSection").hidden=true;$("#placeSection").hidden=true;try{const data=await request({q:clean});if(!data.places.length){setStatus("검색 결과가 없습니다.",true);return}renderCandidates(data.places);setStatus(`${data.places.length}개의 결과를 찾았습니다.`);if(data.places.length===1)await selectPlace(data.places[0])}catch(error){setStatus(error.message,true)}}
  $("#searchForm").addEventListener("submit",event=>{event.preventDefault();search($("#searchInput").value)});
  $("#shareButton").addEventListener("click",async()=>{const compact=state.query.replace(/\s+/g,"");const url=new URL(location.href);url.search="";url.searchParams.set("q",compact);try{await copyText(url.href);showToast("공유 링크가 복사되었습니다.")}catch{showToast("링크를 복사하지 못했습니다.")}});
  const initialQuery=new URLSearchParams(location.search).get("q");
  if(initialQuery){$("#searchInput").value=initialQuery;search(initialQuery)}
  else if(location.protocol==="file:"){
    setStatus("현재 파일을 직접 열었습니다. 검색 기능은 Vercel 배포 주소 또는 vercel dev에서 사용할 수 있습니다.",true);
  }
})();
