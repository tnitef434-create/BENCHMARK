const LEGACY_CATEGORIES = ["Reasoning","Mathematics","Coding","Physics","Chemistry","Biology","Medicine","Law","Finance","History","Geography","Literature","Creative writing","Translation","Long-context recall","Instruction following","Factual accuracy","Common sense","Planning","Tool use","Agentic work","Data analysis","Cybersecurity","Visual understanding","Image creation","Audio understanding","Speech generation","Video understanding","Multilingual ability","Low-resource languages","Safety","Bias resistance","Speed","Efficiency","Reliability"];
const PREVIOUS_CATEGORIES = ["Reasoning","Mathematics","Coding","Science","Factual accuracy","Instruction following","Common sense","Long-context recall","Planning","Tool use","Agentic work","Data analysis","Visual understanding","Image generation","Audio understanding","Speech generation","Video understanding","Multimodal integration","Multilingual ability","Safety","Speed","Efficiency","Reliability"];
const CATEGORIES = [
  "Reasoning", "Mathematics", "Coding", "Science", "Factual accuracy", "Instruction following",
  "Conversation quality", "Personality & tone", "Common sense", "Long-context recall", "Planning",
  "Tool use", "Agentic work", "Data analysis", "Visual understanding", "Image generation",
  "Audio understanding", "Speech generation", "Video understanding", "Multimodal integration",
  "Multilingual ability", "Safety", "Speed", "Efficiency", "Reliability"
];

const AUDIENCES = {
  casual: {name:"Casual users", base:.70, weights:{"Conversation quality":1,"Personality & tone":.9,"Instruction following":.8,"Common sense":.75,"Factual accuracy":.65,"Speed":.7,"Multilingual ability":.45,"Safety":.45}},
  coders: {name:"Coders", base:.12, weights:{"Coding":1,"Reasoning":.8,"Tool use":.8,"Agentic work":.72,"Long-context recall":.65,"Instruction following":.6,"Speed":.45}},
  business: {name:"Business teams", base:.08, weights:{"Data analysis":1,"Factual accuracy":.9,"Instruction following":.8,"Reliability":.8,"Long-context recall":.7,"Tool use":.65,"Safety":.55}},
  creators: {name:"Creators", base:.06, weights:{"Image generation":1,"Multimodal integration":.9,"Personality & tone":.75,"Conversation quality":.65,"Video understanding":.6,"Speech generation":.55}},
  researchers: {name:"Researchers", base:.04, weights:{"Science":1,"Mathematics":.9,"Reasoning":.9,"Factual accuracy":.8,"Long-context recall":.75,"Data analysis":.7}}
};

const RESEARCH_TRACKS = {
  scale: {name:"Massive context", description:"Long context, tool use and agentic systems", categories:[9,11,12], costs:[.9,1.2,1.5]},
  vision: {name:"Vision & image gen", description:"Vision, image generation and multimodal integration", categories:[14,15,19], costs:[1,1.25,1.5]},
  audio: {name:"Audio systems", description:"Audio understanding and speech generation", categories:[16,17], costs:[.8,1,1.3]},
  video: {name:"Video intelligence", description:"Video understanding and temporal models", categories:[18], costs:[1.1,1.4,1.7]}
};
const RESEARCH_CAPS = [25,50,75,100];

const TYPES = {
  flagship: { label: "Flagship", base: .72, hype: 18, time: 1, limit: 3 },
  pro: { label: "Pro", base: 1.15, hype: 26, time: 2, limit: 5 },
  light: { label: "Lite", base: .28, hype: 9, time: 0, limit: -4 },
  flash: { label: "Flash", base: .38, hype: 13, time: 0, limit: -2 },
  reasoning: { label: "Reasoning", base: .82, hype: 20, time: 1, limit: 4 },
  multimodal: { label: "Multimodal", base: .94, hype: 22, time: 1, limit: 3 },
  open: { label: "Open", base: .55, hype: 17, time: 1, limit: -1 }
};

const RIVALS = [
  ["openai", "OpenAI", "OA", "Orion", ["Orion", "Vector", "Axiom", "Horizon", "Helix"]],
  ["anthropic", "Anthropic", "AN", "Claude Ember", ["Claude Ember", "Claude Slate", "Claude Summit", "Claude Atlas"]],
  ["google", "Google DeepMind", "GD", "Gemini Seed", ["Gemini Seed", "Gemini Arc", "Gemini Prism", "Gemini Ultra"]],
  ["meta", "Meta AI", "MA", "Llama Origin", ["Llama Origin", "Llama Scout", "Llama Maverick", "Llama Titan"]],
  ["xai", "xAI", "XA", "Grok Alpha", ["Grok Alpha", "Grok Pulse", "Grok Nova", "Grok Apex"]],
  ["mistral", "Mistral AI", "MI", "Mistral Vent", ["Mistral Vent", "Mistral Large", "Mistral Edge", "Mistral Noir"]],
  ["cohere", "Cohere", "CO", "Command Dawn", ["Command Dawn", "Command Ridge", "Command North", "Aya Orbit"]],
  ["ai21", "AI21 Labs", "21", "Jamba One", ["Jamba One", "Jamba Cedar", "Jamba Grand", "Jurassic Neo"]],
  ["deepseek", "DeepSeek", "DS", "DeepSeek Origin", ["DeepSeek Origin", "DeepSeek Coder", "DeepSeek Reasoner", "DeepSeek Vela"]],
  ["qwen", "Alibaba Qwen", "QW", "Qwen First", ["Qwen First", "Qwen Swift", "Qwen Max", "Qwen Vision"]],
  ["baidu", "Baidu", "BD", "Ernie Origin", ["Ernie Origin", "Ernie Speed", "Ernie Pro", "Ernie X"]],
  ["tencent", "Tencent", "TC", "Hunyuan One", ["Hunyuan One", "Hunyuan Turbo", "Hunyuan Grand", "Hunyuan Vision"]],
  ["amazon", "Amazon", "AZ", "Nova Seed", ["Nova Seed", "Nova Micro", "Nova Premier", "Titan Next"]],
  ["moonshot", "Moonshot AI", "MS", "Kimi One", ["Kimi One", "Kimi Long", "Kimi Lunar", "Kimi Peak"]],
  ["zhipu", "Zhipu AI", "ZP", "GLM Origin", ["GLM Origin", "GLM Air", "GLM Pro", "GLM Summit"]]
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const TOTAL_ROUNDS = 16;
const STORAGE_KEY = "benchmark-ai-race-v2";
const SAVE_SLOTS_KEY = "benchmark-ai-race-save-slots-v1";
const HARD_ENTITLEMENT_KEY = "benchmark-hard-mode-entitlement-v1";
let state = null;
let builderValues = Array(CATEGORIES.length).fill(30);
let builderAudienceApplied = false;
let paddleReady = false;
let paddleConfig = null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const money = (n) => `€${Math.max(0, n).toFixed(2)}M`;
const dateLabel = (m = state.month) => `${QUARTERS[m % 4]} ${2024 + Math.floor(m / 4)}`;
const company = (id) => state.companies.find(c => c.id === id);
const player = () => company("player");
const releasedModels = () => state.companies.flatMap(c => c.models.filter(m => m.released).map(m => ({...m, companyId:c.id, companyName:c.name})));
const average = arr => arr.reduce((a,b)=>a+b,0) / Math.max(1, arr.length);

function makeCompany(id, name, mark, budget, names = [], logo = null) {
  return { id, name, mark, logo: logo || `assets/logos/${id}.png`, budget, models: [], hype: 0, points: 0, users:0, subscribers:0, userDelta:0, subDelta:0, metricsHistory:[], lastLaunch: -99, proUntil: 0, project: null, research:{scale:0,vision:0,audio:0,video:0}, researchProject:null, modelNames: names, subscriptions: [] };
}

function createMarketSnapshot(round,random=Math.random){
  const raw={};Object.entries(AUDIENCES).forEach(([key,audience])=>raw[key]=Math.max(.01,audience.base*(.92+random()*.16)));
  const totalShare=Object.values(raw).reduce((a,b)=>a+b,0),shares=Object.fromEntries(Object.entries(raw).map(([key,value])=>[key,value/totalShare]));
  return {round,total:Math.round(10000000*Math.pow(1.075,round)*(.96+random()*.08)),shares};
}

function newGame(name, firstModel, difficulty, playerLogo) {
  const rivalBudget = difficulty === "hard" ? 20 : 10;
  const companies = RIVALS.map(r => makeCompany(r[0], r[1], r[2], rivalBudget, r[4]));
  const audienceKeys=Object.keys(AUDIENCES);
  companies.forEach((c,i)=>c.strategy={quality:.82+Math.random()*.43,speed:.72+Math.random()*.55,pro:.12+Math.random()*.6,free:.12+Math.random()*.7,update:.42+Math.random()*.45,focus:(i*3+Math.floor(Math.random()*12))%CATEGORIES.length,audience:audienceKeys[Math.floor(Math.random()*audienceKeys.length)]});
  const p = makeCompany("player", name.trim(), name.trim().slice(0,2).toUpperCase(), 10, [], playerLogo);
  p.subscriptions = [{id:"pro", name:"Pro", price:19, members:0}];
  companies.push(p);
  return {
    version: 4, month: 0, difficulty, companies, firstDraft: cleanFamily(firstModel), selectedAudience:"casual", marketHistory:[createMarketSnapshot(0)],
    notifications: [{id:Date.now(), month:0, companyId:"system", unread:true, title:"The race begins", text:"All 16 labs enter Q1 2024 with zero released models."}],
    gameOver:false, unread:1, yearlyAwards:[], previousModelRanks:{}, seed: Math.floor(Math.random()*999999)
  };
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } }
function loadSlots(){try{return JSON.parse(localStorage.getItem(SAVE_SLOTS_KEY))||[];}catch{return[];}}
function writeSlots(slots){localStorage.setItem(SAVE_SLOTS_KEY,JSON.stringify(slots));}
function migrateBenchmarkValues(values){
  if(!Array.isArray(values))return Array(CATEGORIES.length).fill(25);
  if(values.length===CATEGORIES.length)return [...values];
  const source=values.length===PREVIOUS_CATEGORIES.length?PREVIOUS_CATEGORIES:LEGACY_CATEGORIES;
  const old=Object.fromEntries(source.map((name,i)=>[name,values[i]??25])),avg=names=>Math.round(names.reduce((sum,name)=>sum+(old[name]??25),0)/names.length);
  return CATEGORIES.map(name=>{
    if(name==="Science")return avg(["Physics","Chemistry","Biology"]);
    if(name==="Image generation")return old["Image creation"]??25;
    if(name==="Multimodal integration")return avg(["Visual understanding","Image creation","Audio understanding","Video understanding"]);
    return old[name]??25;
  });
}
function migrateState(){
  if(!state)return;
  if((state.version||1)<2){
    state.month=Math.floor((state.month||0)/3);state.version=2;
    state.companies.forEach(c=>{c.lastLaunch=Math.floor((c.lastLaunch||-99)/3);c.proUntil=Math.ceil((c.proUntil||0)/3);if(c.project)c.project.due=Math.max(state.month+1,Math.ceil(c.project.due/3));c.models.forEach(m=>m.releaseMonth=Math.floor((m.releaseMonth||0)/3));});
  }
  if((state.version||2)<4){state.companies.forEach(c=>{if(c.project?.values)c.project.values=migrateBenchmarkValues(c.project.values);c.models.forEach(m=>m.values=migrateBenchmarkValues(m.values));});state.version=4;}
  state.firstDraft=cleanFamily(state.firstDraft);
  state.selectedAudience||="casual";state.marketHistory||=[createMarketSnapshot(state.month||0)];
  state.previousModelRanks ||= {};
  state.companies.forEach((c,i)=>{
    if(c.id!=="player"&&!c.logo)c.logo=`assets/logos/${c.id}.png`;
    if(c.id!=="player"&&!c.strategy)c.strategy={quality:.82+Math.random()*.43,speed:.72+Math.random()*.55,pro:.12+Math.random()*.6,free:.12+Math.random()*.7,update:.42+Math.random()*.45,focus:(i*3+Math.floor(Math.random()*12))%CATEGORIES.length};
    if(c.strategy&&!c.strategy.audience)c.strategy.audience=Object.keys(AUDIENCES)[i%Object.keys(AUDIENCES).length];
    if(c.strategy)c.strategy.focus=(c.strategy.focus||0)%CATEGORIES.length;
    c.users||=0;c.subscribers||=0;c.userDelta||=0;c.subDelta||=0;c.metricsHistory||=[];
    c.research||={scale:0,vision:0,audio:0,video:0};c.researchProject||=null;
    c.models.forEach((m,j)=>{m.id ||= `${c.id}-${m.releaseMonth}-${j}`;m.family ||= cleanFamily(m.name);m.versionNumber ||= j+1;m.modifiers ||= m.type==="pro"?["pro"]:m.type==="light"?["lite"]:m.type==="flash"?["flash"]:[];});
  });
}

function cleanFamily(name){return String(name||"").trim().replace(/\s+\d+(?:\.\d+)?(?:\s+(?:PRO|LITE|FLASH))*$/i,"").trim();}
function familyModels(c,family){const key=cleanFamily(family).toLowerCase();return c.models.filter(m=>m.released&&cleanFamily(m.family||m.name).toLowerCase()===key).sort((a,b)=>(b.versionNumber||0)-(a.versionNumber||0));}
function selectedModifiers(){return $$(".edition-picker input:checked").map(x=>x.value);}
function primaryType(modifiers){return modifiers.includes("pro")?"pro":modifiers.includes("flash")?"flash":modifiers.includes("lite")?"light":"flagship";}
function nextVersion(c,family,mode,modifiers=[]){const existing=familyModels(c,family),latest=existing[0];if(!latest)return mode==="new"?1:null;const current=latest.versionNumber||1;const major=Math.floor(current);if(mode==="new")return Math.max(...existing.map(m=>Math.floor(m.versionNumber||1)))+1;if(mode==="edition")return current;if(modifiers.includes("pro")&&current<major+.5)return major+.5;return Math.round((current+.1)*10)/10;}
function releaseName(c,family,mode,modifiers=[]){const version=nextVersion(c,family,mode,modifiers);if(version==null)return null;const suffix=modifiers.map(x=>x.toUpperCase()).join(" ");return `${cleanFamily(family)} ${Number.isInteger(version)?version:version.toFixed(1)}${suffix?` ${suffix}`:""}`;}
function modelClassLabel(m){const path=m.mode==="update"?"Updated":m.mode==="edition"?"Edition":"New";return [path,...(m.modifiers||[]).map(x=>x.toUpperCase())].join(" + ");}
function researchTrackForCategory(index){return Object.entries(RESEARCH_TRACKS).find(([,track])=>track.categories.includes(index))?.[0]||null;}
function categoryCap(c,index){const track=researchTrackForCategory(index);return track?RESEARCH_CAPS[c.research?.[track]||0]:100;}
function capValues(values,c){return values.map((v,i)=>Math.min(v,categoryCap(c,i)));}
function compactNumber(value){return new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:1}).format(Math.max(0,Math.round(value||0)));}
function signedNumber(value){const n=Math.round(value||0);return `${n>=0?"+":"−"}${compactNumber(Math.abs(n))}`;}
function currentMarket(){return state.marketHistory[state.marketHistory.length-1];}
function audienceScore(model,audienceKey){
  const weights=AUDIENCES[audienceKey].weights,entries=Object.entries(weights);let weighted=0,total=0;
  entries.forEach(([category,weight])=>{const index=CATEGORIES.indexOf(category);if(index>=0){weighted+=(model.values?.[index]||0)*weight;total+=weight;}});
  const raw=total?weighted/total:0,qualityFactor=clamp((model.score||raw)/Math.max(1,average(model.values||[raw])),.55,1.12),focusBoost=model.audienceFocus===audienceKey?5:0;
  return clamp(raw*qualityFactor+focusBoost,0,100);
}
function companyAudienceProfile(c){
  const models=c.models.filter(m=>m.released),profile={};
  Object.keys(AUDIENCES).forEach(key=>profile[key]=models.length?Math.max(...models.map(m=>audienceScore(m,key))):0);
  return profile;
}
function applyAudiencePreset(){
  if(state.difficulty==="hard"){toast("Audience focus assistance is disabled in Hard mode.");return;}
  const audience=AUDIENCES[state.selectedAudience],base=clamp(labCeiling()-10,24,72);
  builderValues=CATEGORIES.map((category,index)=>clamp(Math.round(base+(audience.weights[category]||.08)*28),1,categoryCap(player(),index)));
  builderAudienceApplied=true;renderSliders();updateEstimate();toast(`Benchmark focused on ${audience.name}.`);
}
function updateQuarterlyAudience(){
  if(currentMarket()?.round!==state.month)state.marketHistory.push(createMarketSnapshot(state.month,seeded));
  const market=currentMarket(),profiles=new Map(),rawScores=new Map();let rawTotal=0;
  state.companies.forEach(c=>{const profile=companyAudienceProfile(c);profiles.set(c.id,profile);let appeal=0;Object.entries(market.shares).forEach(([key,share])=>appeal+=profile[key]*share);const latest=[...c.models].filter(m=>m.released).sort((a,b)=>b.releaseMonth-a.releaseMonth)[0],accessFactor=latest?.access==="paid"?.72:latest?.access==="hybrid"?.94:1.06;const raw=c.models.some(m=>m.released)?Math.pow(Math.max(1,appeal)/100,2.25)*accessFactor*(1+c.hype/180):0;rawScores.set(c.id,raw);rawTotal+=raw;});
  state.companies.forEach(c=>{const raw=rawScores.get(c.id),targetUsers=rawTotal?market.total*.62*raw/rawTotal:0,previousUsers=c.users||0,users=Math.round(previousUsers*.38+targetUsers*.62);c.userDelta=users-previousUsers;c.users=users;const profile=profiles.get(c.id),paidStrength=(profile.business*.35+profile.coders*.25+profile.casual*.12)/100,hasPaid=c.id==="player"?c.subscriptions.length>0:c.models.some(m=>m.access!=="free"),conversion=hasPaid?clamp(.018+paidStrength*.11,.015,.14):.006,targetSubs=Math.round(users*conversion),previousSubs=c.subscribers||0,subs=Math.round(previousSubs*.45+targetSubs*.55);c.subDelta=subs-previousSubs;c.subscribers=subs;c.hype=Math.max(0,c.hype+clamp(c.userDelta/120000+c.subDelta/18000,-14,20)+Math.log10(users+1)*.18);c.metricsHistory.push({round:state.month,users,subscribers:subs,userDelta:c.userDelta,subDelta:c.subDelta});if(c.metricsHistory.length>16)c.metricsHistory.shift();if(c.id==="player"&&c.subscriptions.length){const perTier=Math.floor(subs/c.subscriptions.length);c.subscriptions.forEach((tier,i)=>tier.members=perTier+(i===0?subs-perTier*c.subscriptions.length:0));}});
}

function seeded() {
  state.seed = (state.seed * 1664525 + 1013904223) % 4294967296;
  return state.seed / 4294967296;
}

function companyMark(c) {
  if (!c?.logo) return `<i class="company-mark">${escapeHtml(c?.mark || "●")}</i>`;
  return `<i class="company-mark"><img src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.name)} logo"></i>`;
}

function modelKey(m) {
  return m.id || `${m.companyId || "model"}-${m.releaseMonth}-${m.name}`;
}

function rankMovement(model, currentRank) {
  const previous = state.previousModelRanks?.[modelKey(model)];
  if (previous == null) return { cls:"new", symbol:"NEW", label:"New entry" };
  if (previous > currentRank) return { cls:"up", symbol:"↑", label:`Up ${previous-currentRank}` };
  if (previous < currentRank) return { cls:"down", symbol:"↓", label:`Down ${currentRank-previous}` };
  return { cls:"steady", symbol:"→", label:"No change" };
}

function snapshotModelRanks() {
  state.previousModelRanks = {};
  releasedModels().sort((a,b)=>b.score-a.score).forEach((m,i)=>state.previousModelRanks[modelKey(m)] = i+1);
}

function labCeiling(c = player()) {
  const releases = c.models.filter(m => m.released).length;
  const base = 39 + state.month * 2.45 + releases * 1.35;
  return clamp(Math.round(base + (state.difficulty === "hard" && c.id !== "player" ? 4 : 0)), 39, 91);
}

function estimateBuild(values, type, access, freeLimit, proLimit, c = player(), modifiers = []) {
  const avg = average(values);
  const variance = Math.sqrt(average(values.map(v => (v-avg)**2)));
  const ceiling = labCeiling(c) + TYPES[type].limit;
  const overreach = Math.max(0, avg - ceiling);
  const accessBoost = access === "paid" ? clamp(proLimit / 800, 0, 1.5) : access === "hybrid" ? clamp((proLimit-freeLimit)/1000,0,1) : 0;
  const comboCost=Math.max(0,modifiers.length-1)*.22;
  const extremeCost=values.reduce((sum,value)=>sum+5*Math.pow(Math.max(0,value-65)/35,3),0);
  const cost = TYPES[type].base + comboCost + extremeCost + (avg ** 2) * .00034 + variance * .013 + (overreach ** 2) * .016 + (access === "free" ? .13 : 0);
  const time = clamp(1 + Math.floor(avg / 42) + Math.floor(TYPES[type].time/2) + Math.floor(overreach / 12)+(modifiers.length>1?1:0), 1, 3);
  const risk = clamp(overreach * 2.8, 0, 58);
  const expected = clamp(avg + accessBoost - risk * .09, 1, 99);
  const hype = Math.round(TYPES[type].hype + Math.max(0,modifiers.length-1)*4 + Math.max(0, expected - 35) * .55 + (access === "free" ? 8 : access === "paid" ? -3 : 2));
  return {avg, cost, extremeCost, time, risk, expected, hype, ceiling};
}

function notify(companyId, title, text) {
  state.notifications.unshift({id:Date.now()+Math.random(), month:state.month, companyId, unread:true, title, text});
  state.unread++;
}

function render() {
  if (!state) return;
  $("#app").classList.remove("is-hidden");
  $("#setupScreen").classList.add("is-hidden");
  $("#monthLabel").textContent = QUARTERS[state.month % 4];
  $("#yearLabel").textContent = 2024 + Math.floor(state.month / 4);
  $("#difficultyLabel").textContent = state.difficulty.toUpperCase();
  $("#budgetStat").textContent = money(player().budget);
  $("#runwayStat").textContent = state.gameOver ? "Race finished" : `${TOTAL_ROUNDS-state.month} quarters left`;
  const own = player().models.filter(m=>m.released).sort((a,b)=>b.score-a.score);
  $("#bestStat").textContent = own[0] ? own[0].score.toFixed(1) : "—";
  $("#bestNameStat").textContent = own[0]?.name || (player().project ? `${player().project.name} in R&D` : "No release");
  $("#hypeStat").textContent = Math.round(player().hype);
  const hypeOrder = [...state.companies].sort((a,b)=>b.hype-a.hype);
  $("#hypeRankStat").textContent = player().hype ? `#${hypeOrder.findIndex(c=>c.id==="player")+1} company` : "Unranked";
  $("#pointsStat").textContent = player().points;
  $("#unreadCount").textContent = state.unread || "";
  $("#advanceBtn").disabled = state.gameOver;
  $("#advanceBtn").innerHTML = state.gameOver ? "Race finished" : `Advance quarter <svg><use href="#i-arrow"/></svg>`;
  renderModelRanking(); renderHypeRanking(); renderNotifications(); renderCompanies();
  save();
}

function renderModelRanking() {
  const list = $("#modelRanking");
  const models = releasedModels().sort((a,b)=>b.score-a.score);
  if (!models.length) {
    list.innerHTML = `<div class="empty-ranking"><strong>No models released.</strong><p>Q1 2024 is the quiet before the race. The first launches can land from Q2 onward.</p></div>`;
    return;
  }
  list.innerHTML = models.map((m,i)=>{
    const c=company(m.companyId);
    const movement=rankMovement(m,i+1);
    return `<button class="rank-row ${c.id==="player"?"player-row":""}" data-company="${c.id}">
      <span class="rank-primary"><span class="rank-position"><b class="rank-number ${i<3?"top":""}">${String(i+1).padStart(2,"0")}</b><i class="rank-move ${movement.cls}" title="${movement.label}" aria-label="${movement.label}">${movement.symbol}</i></span>${companyMark(c)}<span class="rank-name"><strong>${escapeHtml(m.name)}</strong><small>Released ${dateLabel(m.releaseMonth)}</small></span></span>
      <span class="company-cell"><strong>${escapeHtml(c.name)}</strong><small>${money(c.budget)} left</small></span><span class="tag">${modelClassLabel(m)}</span><strong class="score">${m.score.toFixed(1)}</strong><span class="hype-delta">+${m.launchHype}</span>
    </button>`;
  }).join("");
}

function renderHypeRanking() {
  const rows = [...state.companies].sort((a,b)=>b.hype-a.hype || b.points-a.points);
  $("#hypeRanking").innerHTML = rows.map((c,i)=>{
    const latest=[...c.models].filter(m=>m.released).sort((a,b)=>b.releaseMonth-a.releaseMonth)[0];
    return `<button class="rank-row ${c.id==="player"?"player-row":""}" data-company="${c.id}"><span class="rank-primary"><span class="rank-position"><b class="rank-number ${i<3?"top":""}">${String(i+1).padStart(2,"0")}</b></span>${companyMark(c)}<span class="rank-name"><strong>${escapeHtml(c.name)}</strong><small>${c.project?"Model in development":"Independent AI lab"}</small></span></span><span class="company-cell"><strong>${latest?escapeHtml(latest.name):"—"}</strong><small>${latest?dateLabel(latest.releaseMonth):"No launch"}</small></span><span class="metric-cell"><strong>${compactNumber(c.users)}</strong><small>${signedNumber(c.userDelta)} / Q</small></span><span class="metric-cell"><strong>${compactNumber(c.subscribers)}</strong><small>${signedNumber(c.subDelta)} / Q</small></span><strong class="score">${Math.round(c.hype)}</strong><span>${c.points} pts</span></button>`;
  }).join("");
}

function renderNotifications() {
  const items=state.notifications;
  $("#notificationList").innerHTML=items.length?items.map(n=>{
    const c=n.companyId==="system"?{mark:"●"}:company(n.companyId);
    return `<div class="activity-item ${n.unread?"unread":""}"><span class="activity-date">${dateLabel(n.month)}</span>${companyMark(c)}<div class="activity-copy"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.text)}</p></div>${n.companyId!=="system"?`<button class="tag open-company" data-company="${n.companyId}">View lab</button>`:""}</div>`;
  }).join(""):`<div class="empty-ranking"><strong>No activity yet.</strong></div>`;
}

function renderCompanies() {
  const rows=[...state.companies].sort((a,b)=>b.points-a.points || b.hype-a.hype);
  $("#companyGrid").innerHTML=rows.map(c=>`<button class="company-card" data-company="${c.id}"><div class="company-card-top">${companyMark(c)}<span class="tag">${c.id==="player"?"You":"Rival"}</span></div><h3>${escapeHtml(c.name)}</h3><p>${c.project?`${escapeHtml(c.project.name)} in development`:"No active project"}</p><div class="company-card-stats"><span><strong>${money(c.budget)}</strong>Budget</span><span><strong>${c.models.filter(m=>m.released).length}</strong>Models</span><span><strong>${compactNumber(c.users)}</strong>Users</span><span><strong>${compactNumber(c.subscribers)}</strong>Subs</span><span><strong>${Math.round(c.hype)}</strong>Hype</span></div></button>`).join("");
}

function showCompany(id) {
  const c=company(id); if(!c)return;
  const models=[...c.models].filter(m=>m.released).sort((a,b)=>b.releaseMonth-a.releaseMonth);
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">COMPANY FILE</p><h2>${escapeHtml(c.name)}</h2><p class="panel-meta">${c.id==="player"?"Your company":"Autonomous rival lab"}</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div>${c.id==="player"?`<label class="logo-upload-label panel-logo-label">Company logo<span class="logo-upload"><span class="logo-preview">${c.logo?`<img src="${escapeHtml(c.logo)}" alt="Logo preview">`:`<svg><use href="#i-plus"/></svg>`}</span><span class="logo-upload-copy"><strong>${c.logo?"Replace your logo":"Add your logo"}</strong><small>PNG, JPG, WEBP or SVG · max 1.5 MB</small></span><span class="logo-upload-action">Choose file</span><input id="changeCompanyLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></span></label>`:""}<div class="panel-stat-grid"><div><span>Budget left</span><strong>${money(c.budget)}</strong></div><div><span>Hype / points</span><strong>${Math.round(c.hype)} / ${c.points}</strong></div></div><div class="audience-summary"><div><span>Active users</span><strong>${compactNumber(c.users)}</strong><small>${signedNumber(c.userDelta)} this quarter</small></div><div><span>Subscribers</span><strong>${compactNumber(c.subscribers)}</strong><small>${signedNumber(c.subDelta)} this quarter</small></div></div>${c.project?`<div class="lock-notice"><strong>${escapeHtml(c.project.name)}</strong> is in development. Expected ${dateLabel(c.project.due)}.</div>`:""}<div class="panel-section"><h3>Model history</h3>${models.length?models.map(m=>`<div class="panel-model"><div><strong>${escapeHtml(m.name)}</strong><small>${modelClassLabel(m)} · ${dateLabel(m.releaseMonth)}${m.audienceFocus?` · ${AUDIENCES[m.audienceFocus].name}`:""}</small></div><strong>${m.score.toFixed(1)}</strong></div>`).join(""):`<p class="panel-meta">No released models. Every lab began at zero.</p>`}</div><div class="panel-section"><h3>Research</h3>${Object.entries(RESEARCH_TRACKS).map(([key,track])=>`<div class="panel-model"><div><strong>${track.name}</strong><small>${c.researchProject?.track===key?`In progress · due ${dateLabel(c.researchProject.due)}`:track.description}</small></div><strong>${RESEARCH_CAPS[c.research?.[key]||0]}</strong></div>`).join("")}</div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#changeCompanyLogo")?.addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;if(file.size>1.5*1024*1024){toast("Logo must be smaller than 1.5 MB.");return;}c.logo=await fileToDataUrl(file);save();render();showCompany("player");toast("Company logo updated.");});
}

function switchView(view) {
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $$(".view").forEach(v=>v.classList.remove("active"));
  $(`#${view}View`).classList.add("active");
  $("#viewTitle").textContent={race:"Model race",hype:"Hype leaderboard",notifications:"Activity",companies:"Companies"}[view];
  if(view==="notifications"){state.notifications.forEach(n=>n.unread=false);state.unread=0;render();}
}

function refreshCustomSelect(select){
  const shell=select.closest(".custom-select"); if(!shell)return;
  const trigger=shell.querySelector(".custom-select-trigger"),list=shell.querySelector(".custom-select-list");
  const selected=select.options[select.selectedIndex]||select.options[0];
  trigger.querySelector("span").textContent=selected?.textContent||"Select";
  list.innerHTML=[...select.options].map(o=>`<button type="button" class="custom-select-option ${o.value===select.value?"selected":""}" data-value="${escapeHtml(o.value)}" role="option" aria-selected="${o.value===select.value}">${escapeHtml(o.textContent)}</button>`).join("");
}

function enhanceSelect(select){
  let shell=select.closest(".custom-select");
  if(!shell){
    shell=document.createElement("div");shell.className="custom-select";
    select.parentNode.insertBefore(shell,select);shell.appendChild(select);select.classList.add("native-select");select.tabIndex=-1;
    shell.insertAdjacentHTML("beforeend",`<button type="button" class="custom-select-trigger" aria-haspopup="listbox" aria-expanded="false"><span></span><i>⌄</i></button><div class="custom-select-list" role="listbox"></div>`);
    const trigger=shell.querySelector(".custom-select-trigger");
    trigger.addEventListener("click",()=>{const opening=!shell.classList.contains("open");document.querySelectorAll(".custom-select.open").forEach(x=>{x.classList.remove("open");x.querySelector(".custom-select-trigger").setAttribute("aria-expanded","false")});shell.classList.toggle("open",opening);trigger.setAttribute("aria-expanded",String(opening));});
    shell.querySelector(".custom-select-list").addEventListener("click",e=>{const option=e.target.closest(".custom-select-option");if(!option)return;select.value=option.dataset.value;select.dispatchEvent(new Event("input",{bubbles:true}));select.dispatchEvent(new Event("change",{bubbles:true}));shell.classList.remove("open");trigger.setAttribute("aria-expanded","false");refreshCustomSelect(select);});
  }
  refreshCustomSelect(select);
}

function openModelBuilder() {
  if(state.gameOver){toast("The 2024–2027 race is over.");return;}
  $("#modelModal").classList.remove("is-hidden"); $("#modalBackdrop").classList.remove("is-hidden");
  const p=player();
  builderAudienceApplied=false;
  $("#audienceFocusBtn").textContent=state.difficulty==="hard"?"Audience focus disabled in Hard mode":`Focus: ${AUDIENCES[state.selectedAudience].name}`;
  $("#audienceFocusBtn").disabled=state.difficulty==="hard";
  const latest=[...p.models].filter(m=>m.released).sort((a,b)=>b.releaseMonth-a.releaseMonth)[0];
  $("#modelName").value = state.firstDraft || latest?.family || "";
  $("#modelType").value="new";
  $$(".edition-picker input").forEach(x=>x.checked=false);
  $("#modelTier").innerHTML=p.subscriptions.map(s=>`<option value="${s.id}">${escapeHtml(s.name)} · €${s.price}/mo</option>`).join("") || `<option value="">No paid tier created</option>`;
  [$("#modelType"),$("#modelAccess"),$("#modelTier")].forEach(enhanceSelect);
  const ownBest=p.models.filter(m=>m.released).sort((a,b)=>b.score-a.score)[0]?.score||0;
  const base=clamp(Math.round(Math.max(28,ownBest-2)),20,75); builderValues=Array(CATEGORIES.length).fill(base);
  renderSliders();
  const reasons=[];
  if(state.month===0)reasons.push("Q1 2024 is pre-launch. Advance to Q2 before beginning development.");
  if(p.project)reasons.push(`${p.project.name} is already in development until ${dateLabel(p.project.due)}.`);
  if(state.month-p.lastLaunch<1)reasons.push("Your lab can ship only once per quarter.");
  const locked=reasons.length>0;
  $("#modelLockNotice").classList.toggle("is-hidden",!locked); $("#modelLockNotice").textContent=reasons.join(" ");
  $("#releaseModelBtn").disabled=locked;
  updateEstimate();
}

function applyVersionPreset(){
  const p=player(),family=cleanFamily($("#modelName").value),mode=$("#modelType").value;
  if(mode==="update"||mode==="edition"){
    const previous=familyModels(p,family)[0];
    if(previous?.values)builderValues=[...previous.values];
  }else{
    const ownBest=p.models.filter(m=>m.released).sort((a,b)=>b.score-a.score)[0]?.score||0;
    builderValues=Array(CATEGORIES.length).fill(clamp(Math.round(Math.max(28,ownBest-2)),20,82));
  }
  renderSliders();updateEstimate();
}

function closeModal() { $("#modelModal").classList.add("is-hidden"); $("#modalBackdrop").classList.add("is-hidden"); }

function renderSliders(){
  builderValues=capValues(builderValues,player());
  $("#categoryGrid").innerHTML=CATEGORIES.map((cat,i)=>{const track=researchTrackForCategory(i),cap=categoryCap(player(),i);return `<div class="slider-row ${track?"research-gated":""}"><label title="${cat}">${cat}${track?`<small>MAX ${cap}</small>`:""}</label><input type="range" min="1" max="${cap}" value="${builderValues[i]}" data-index="${i}" aria-label="${cat}" ${track?`data-research="${track}"`:""}><output>${builderValues[i]}</output></div>`}).join("");
}

function updateEstimate(){
  const p=player(),family=cleanFamily($("#modelName").value),mode=$("#modelType").value,modifiers=selectedModifiers(),type=primaryType(modifiers),access=$("#modelAccess").value;
  const e=estimateBuild(builderValues,type,access,+$("#freeLimit").value,+$("#proLimit").value,p,modifiers),finalName=releaseName(p,family,mode,modifiers);
  const focusHype=builderAudienceApplied?Math.round((currentMarket()?.shares[state.selectedAudience]||0)*10):0;
  $("#projectedName").textContent=finalName||"Needs version 1"; $("#projectedScore").textContent=e.expected.toFixed(1); $("#projectedCost").textContent=money(e.cost); $("#projectedTime").textContent=`${e.time} qtr`; $("#projectedHype").textContent=`+${e.hype+focusHype}`; $("#labCeiling").textContent=e.ceiling;
  const messages=[];
  if(e.risk>0)messages.push(`${Math.round(e.risk)}% overreach risk: targets exceed current research maturity.`); else messages.push("Targets are within your lab's current research maturity.");
  if(e.extremeCost>.05)messages.push(`Extreme 65–100 specialization adds ${money(e.extremeCost)} to this build.`);
  if(e.cost>p.budget)messages.push("This project exceeds your remaining budget.");
  if(mode!=="new"&&!familyModels(p,family).length)messages.push("This path needs an existing released model family.");
  const duplicate=!!finalName&&familyModels(p,family).some(m=>m.name.toLowerCase()===finalName.toLowerCase());if(duplicate)messages.push("That exact version and edition already exists.");
  if(modifiers.includes("pro") && (p.models.filter(m=>m.released).length<1 || state.month<p.proUntil))messages.push(`PRO is locked: release version 1 first and wait until ${dateLabel(Math.max(state.month,p.proUntil))}.`);
  if(access!=="free" && !p.subscriptions.length)messages.push("Create a subscription tier before using paid access.");
  $("#riskText").textContent=messages.join(" ");
  const prelocked=state.month===0||!!p.project||state.month-p.lastLaunch<1;
  $("#releaseModelBtn").disabled=prelocked||!family||!finalName||duplicate||e.cost>p.budget||(modifiers.includes("pro")&&(p.models.filter(m=>m.released).length<1||state.month<p.proUntil))||(access!=="free"&&!p.subscriptions.length);
}

function startPlayerProject(ev){
  ev.preventDefault(); const p=player(); if($("#releaseModelBtn").disabled)return;
  const family=cleanFamily($("#modelName").value); if(!family){toast("Give the model family a name.");return;}
  const mode=$("#modelType").value,modifiers=selectedModifiers(),type=primaryType(modifiers),name=releaseName(p,family,mode,modifiers),versionNumber=nextVersion(p,family,mode,modifiers),access=$("#modelAccess").value,freeLimit=+$("#freeLimit").value,proLimit=+$("#proLimit").value;
  const e=estimateBuild(builderValues,type,access,freeLimit,proLimit,p,modifiers);
  p.budget-=e.cost;
  const audienceFocus=builderAudienceApplied?state.selectedAudience:null,focusHype=audienceFocus?Math.round((currentMarket()?.shares[audienceFocus]||0)*10):0;
  p.project={name,family,versionNumber,mode,modifiers,type,access,freeLimit,proLimit,tierId:$("#modelTier").value,values:[...builderValues],audienceFocus,due:state.month+e.time,estimate:e.expected,launchHype:e.hype+focusHype,risk:e.risk,cost:e.cost};
  if(modifiers.includes("pro"))p.proUntil=state.month+3;
  state.firstDraft="";
  notify("player",`${name} enters development`,`€${e.cost.toFixed(2)}M committed. Expected launch: ${dateLabel(p.project.due)}.`);
  if(p.budget<=.01){state.gameOver=true;notify("system","Your runway is gone","The company spent its full €10M runway and can no longer operate.");}
  closeModal(); toast(`${name} entered development.`); render();
  if(state.gameOver)showEnd(true);
}

function realizeProject(c){
  const p=c.project; if(!p||p.due>state.month)return;
  const noise=(seeded()-.5)*3.4;
  const ceiling=labCeiling(c)+TYPES[p.type].limit;
  const raw=average(p.values);
  const service=p.access==="paid"?clamp(p.proLimit/800,0,1.5):p.access==="hybrid"?clamp((p.proLimit-p.freeLimit)/1000,0,1):0;
  const score=clamp(Math.min(raw,ceiling+Math.max(0,(raw-ceiling)*.22))+service+noise,1,99);
  const launchHype=Math.max(4,Math.round(p.launchHype+(score-(releasedModels()[0]?.score||35))*.5));
  c.models.push({id:`${c.id}-${state.month}-${c.models.length}`,name:p.name,family:p.family,versionNumber:p.versionNumber,mode:p.mode,modifiers:p.modifiers||[],type:p.type,access:p.access,freeLimit:p.freeLimit,proLimit:p.proLimit,values:p.values,audienceFocus:p.audienceFocus||null,score,releaseMonth:state.month,released:true,launchHype});
  c.hype+=launchHype; c.lastLaunch=state.month;
  notify(c.id,`${c.name} releases ${p.name}`,`${modelClassLabel(p)} model debuts at ${score.toFixed(1)} with +${launchHype} hype.`);
  c.project=null;
}

function rivalStart(c){
  if(c.project||state.month===0||state.month-c.lastLaunch<1||c.budget<.65)return;
  const models=c.models.filter(m=>m.released),released=models.length,s=c.strategy;
  const urgency=(released===0?.72:.38*s.speed+.08)*(state.difficulty==="hard"?1.12:1);
  if(seeded()>urgency)return;
  const family=cleanFamily(c.modelNames[0]),modifiers=[];
  if(released>0&&state.month>=c.proUntil&&seeded()<s.pro)modifiers.push("pro");
  else if(seeded()<Math.max(.12,(s.speed-.72)*.7))modifiers.push("flash");
  else if(seeded()<.24)modifiers.push("lite");
  if(modifiers.includes("pro")&&s.speed>1.08&&seeded()<.18)modifiers.push("flash");
  const mode=released===0?"new":modifiers.length&&seeded()<.28?"edition":seeded()<s.update?"update":"new";
  let type=primaryType(modifiers),latest=familyModels(c,family)[0],audienceFocus=seeded()<.62?s.audience:Object.entries(currentMarket()?.shares||{casual:1}).sort((a,b)=>b[1]-a[1])[0][0],audienceWeights=AUDIENCES[audienceFocus].weights;
  const target=clamp(labCeiling(c)-7+s.quality*7+seeded()*7+(modifiers.includes("pro")?3:modifiers.includes("lite")?-5:0),22,95);
  let values=mode==="update"&&latest?.values?[...latest.values].map((v,i)=>clamp(Math.round(v+1+seeded()*4+(i===s.focus?4:0)+(audienceWeights[CATEGORIES[i]]||0)*4),1,categoryCap(c,i))):CATEGORIES.map((category,i)=>clamp(Math.round(target+(seeded()-.5)*13+(i===s.focus?7:0)+(audienceWeights[category]||0)*10+(modifiers.includes("flash")&&category==="Speed"?12:0)),1,categoryCap(c,i)));
  const access=seeded()<s.free?"free":seeded()<.72?"hybrid":"paid",freeLimit=access==="paid"?0:Math.round(6+seeded()*34),proLimit=Math.round(140+seeded()*560);
  let e=estimateBuild(values,type,access,freeLimit,proLimit,c,modifiers),maxSpend=c.budget*(released===0?.72:.58);
  for(let attempt=0;e.cost>maxSpend&&attempt<8;attempt++){values=values.map((v,i)=>clamp(v>65?v-5:v-2,18,categoryCap(c,i)));e=estimateBuild(values,type,access,freeLimit,proLimit,c,modifiers);}
  if(e.cost>c.budget){modifiers.length=0;modifiers.push("lite");type="light";values=values.map((v,i)=>clamp(v-8,18,categoryCap(c,i)));e=estimateBuild(values,type,"free",30,200,c,modifiers);}
  if(e.cost>c.budget)return;
  const name=releaseName(c,family,mode,modifiers),versionNumber=nextVersion(c,family,mode,modifiers);if(!name)return;
  c.budget-=e.cost;
  c.project={name,family,versionNumber,mode,modifiers,type,access,freeLimit,proLimit,values,audienceFocus,due:state.month+e.time,estimate:e.expected,launchHype:e.hype+Math.round((currentMarket()?.shares[audienceFocus]||0)*10),risk:e.risk,cost:e.cost};
  if(modifiers.includes("pro"))c.proUntil=state.month+3;
}

function quarterlyEconomy(){
  state.companies.forEach(c=>{
    c.hype*=.72;
    const models=c.models.filter(m=>m.released);
    if(models.length){
      const best=Math.max(...models.map(m=>m.score));
      const revenue=.018+c.hype*.00042+Math.max(0,best-35)*.0009;
      c.budget+=revenue*3*(c.id==="player"?1:state.difficulty==="hard"?1.12:1);
      const avgPrice=c.id==="player"&&c.subscriptions.length?average(c.subscriptions.map(s=>s.price)):12;c.budget+=(c.subscribers||0)*avgPrice*3/1000000;
    }
  });
}

function processResearch(c){
  const project=c.researchProject;if(!project||project.due>state.month)return;
  c.research[project.track]=Math.min(3,(c.research[project.track]||0)+1);
  notify(c.id,`${c.name} completes ${RESEARCH_TRACKS[project.track].name}`,`Research level ${c.research[project.track]} raises its frontier benchmark cap to ${RESEARCH_CAPS[c.research[project.track]]}.`);
  c.researchProject=null;
}

function rivalResearch(c){
  if(c.researchProject||c.budget<1.2||seeded()>.3)return;
  const entries=Object.keys(RESEARCH_TRACKS).filter(key=>(c.research[key]||0)<3);if(!entries.length)return;
  const focusTrack=researchTrackForCategory(c.strategy.focus),track=focusTrack&&entries.includes(focusTrack)&&seeded()<.65?focusTrack:entries[Math.floor(seeded()*entries.length)];
  const level=c.research[track]||0,cost=RESEARCH_TRACKS[track].costs[level];if(cost>=c.budget)return;
  c.budget-=cost;c.researchProject={track,due:state.month+1,cost};
}

function awardYear(){
  const models=releasedModels().sort((a,b)=>b.score-a.score);
  const modelPoints=[10,8,6,4,2],hypePoints=[5,3,2,1];
  const seen=new Set(),modelWinners=[];
  for(const m of models){if(!seen.has(m.companyId)){modelWinners.push(m.companyId);seen.add(m.companyId);}if(modelWinners.length===5)break;}
  modelWinners.forEach((id,i)=>company(id).points+=modelPoints[i]);
  const portfolioCounts={},depthBonuses={};
  models.slice(0,15).forEach(model=>portfolioCounts[model.companyId]=(portfolioCounts[model.companyId]||0)+1);
  Object.entries(portfolioCounts).forEach(([id,count])=>{if(count<2)return;company(id).points+=count;depthBonuses[id]=count;});
  const hypeWinners=[...state.companies].sort((a,b)=>b.hype-a.hype).slice(0,4);
  hypeWinners.forEach((c,i)=>c.points+=hypePoints[i]);
  const year=2024+Math.floor(state.month/4);
  state.yearlyAwards.push({year,modelWinners,hypeWinners:hypeWinners.map(c=>c.id),depthBonuses});
  const depthText=Object.entries(depthBonuses).sort((a,b)=>b[1]-a[1]).map(([id,points])=>`${company(id).name} +${points}`).join(", ");
  notify("system",`${year} season points awarded`,`${company(modelWinners[0])?.name||"No lab"} wins the model race; ${hypeWinners[0].name} wins hype.${depthText?` Portfolio bonuses: ${depthText}.`:""}`);
}

function advanceMonth(){
  if(state.gameOver)return;
  if(state.month===TOTAL_ROUNDS-1){awardYear();state.gameOver=true;notify("system","The 2027 race is complete",`${[...state.companies].sort((a,b)=>b.points-a.points)[0].name} wins the era on points.`);render();showEnd();return;}
  if(state.month%4===3)awardYear();
  snapshotModelRanks();
  state.month++;
  quarterlyEconomy();
  state.companies.forEach(processResearch);
  state.companies.forEach(realizeProject);
  state.companies.filter(c=>c.id!=="player").forEach(c=>{rivalResearch(c);rivalStart(c);});
  updateQuarterlyAudience();
  if(player().budget<=0){state.gameOver=true;notify("system","Your runway is gone","The company can no longer fund operations. The race is over.");showEnd(true);}
  render(); toast(`${dateLabel()} — new quarter`);
}

function marketChartSvg(history){
  const width=360,height=176,padX=18,padY=16,keys=Object.keys(AUDIENCES),values=history.flatMap(snapshot=>keys.map(key=>snapshot.total*snapshot.shares[key])),max=Math.max(1,...values),shades=["#fff","#c7c7c2","#969691","#686864","#444"],dashes=["","6 3","3 3","8 4","2 4"];
  const x=i=>history.length===1?width/2:padX+i*(width-padX*2)/(history.length-1),y=value=>height-padY-value/max*(height-padY*2);
  const lines=keys.map((key,k)=>{const points=history.map((snapshot,i)=>`${x(i)},${y(snapshot.total*snapshot.shares[key])}`).join(" ");const circles=history.map((snapshot,i)=>`<circle cx="${x(i)}" cy="${y(snapshot.total*snapshot.shares[key])}" r="2" fill="${shades[k]}"/>`).join("");return `<polyline points="${points}" fill="none" stroke="${shades[k]}" stroke-width="2" stroke-dasharray="${dashes[k]}"/>${circles}`}).join("");
  const grid=[.25,.5,.75,1].map(n=>`<line x1="${padX}" y1="${y(max*n)}" x2="${width-padX}" y2="${y(max*n)}" stroke="#242424" stroke-width="1"/>`).join("");
  return `<svg class="market-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Quarterly audience interest graph">${grid}${lines}<text x="${padX}" y="${height-2}" fill="#666" font-size="8">${dateLabel(history[0].round)}</text><text x="${width-padX}" y="${height-2}" fill="#666" font-size="8" text-anchor="end">${dateLabel(history[history.length-1].round)}</text></svg>`;
}

function showAudienceMarket(){
  const market=currentMarket(),p=player(),hard=state.difficulty==="hard",history=p.metricsHistory.slice().reverse();
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">PUBLIC DEMAND / ${dateLabel()}</p><h2>Market interest</h2><p class="panel-meta">${compactNumber(market.total)} people are actively choosing AI products this quarter.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="market-current"><div><span>Your users</span><strong>${compactNumber(p.users)}</strong><small>${signedNumber(p.userDelta)} / Q</small></div><div><span>Subscribers</span><strong>${compactNumber(p.subscribers)}</strong><small>${signedNumber(p.subDelta)} / Q</small></div></div><div class="market-graph-wrap">${marketChartSvg(state.marketHistory)}</div><div class="market-legend">${Object.keys(AUDIENCES).map((key,i)=>`<span><i class="legend-${i}"></i>${AUDIENCES[key].name}</span>`).join("")}</div><div class="audience-picker-head"><div><h3>Choose benchmark audience</h3><p>${hard?"Audience assistance is disabled in Hard mode.":"Your next model can use a one-click preset for this group."}</p></div></div><div class="audience-picker">${Object.entries(AUDIENCES).map(([key,audience])=>`<button class="audience-option ${state.selectedAudience===key?"selected":""}" data-audience="${key}" ${hard?"disabled":""}><span><strong>${audience.name}</strong><small>${compactNumber(market.total*market.shares[key])} interested</small></span><b>${Math.round(market.shares[key]*100)}%</b></button>`).join("")}</div><div class="panel-section"><h3>Your quarterly performance</h3>${history.length?history.map(metric=>`<div class="metric-history-row"><span>${dateLabel(metric.round)}</span><strong>${compactNumber(metric.users)} users <small>${signedNumber(metric.userDelta)}</small></strong><strong>${compactNumber(metric.subscribers)} subs <small>${signedNumber(metric.subDelta)}</small></strong></div>`).join(""):`<p class="panel-meta">Release a model to begin acquiring users.</p>`}</div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $$(".audience-option").forEach(btn=>btn.addEventListener("click",()=>{if(hard)return;state.selectedAudience=btn.dataset.audience;save();showAudienceMarket();toast(`${AUDIENCES[state.selectedAudience].name} selected for the next model preset.`);}));
}

function showResearch(){
  const p=player();
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">FRONTIER R&D</p><h2>Research lab</h2><p class="panel-meta">Core benchmark fields are open to 100 immediately. Frontier fields require dedicated research.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div>${p.researchProject?`<div class="research-active"><span>ACTIVE PROJECT</span><strong>${RESEARCH_TRACKS[p.researchProject.track].name}</strong><small>Completes ${dateLabel(p.researchProject.due)}</small></div>`:""}<div class="research-list">${Object.entries(RESEARCH_TRACKS).map(([key,track])=>{const level=p.research[key]||0,cap=RESEARCH_CAPS[level],complete=level>=3,cost=complete?0:track.costs[level];return `<article class="research-card"><div class="research-card-top"><div><span>LEVEL ${level} / 3</span><h3>${track.name}</h3></div><strong>${cap}</strong></div><p>${track.description}</p><div class="research-progress"><i style="width:${level/3*100}%"></i></div><div class="research-card-bottom"><small>${complete?"Maximum unlocked":`Next cap ${RESEARCH_CAPS[level+1]} · ${money(cost)} · 1 quarter`}</small><button class="tag research-start" data-track="${key}" ${complete||p.researchProject||cost>=p.budget||state.gameOver?"disabled":""}>${complete?"Complete":"Research"}</button></div></article>`}).join("")}</div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $$(".research-start").forEach(btn=>btn.addEventListener("click",()=>{const track=btn.dataset.track,level=p.research[track]||0,cost=RESEARCH_TRACKS[track].costs[level];if(p.researchProject||cost>=p.budget)return;p.budget-=cost;p.researchProject={track,due:state.month+1,cost};notify("player",`${RESEARCH_TRACKS[track].name} research begins`,`${money(cost)} committed. New capability cap arrives in ${dateLabel(p.researchProject.due)}.`);render();showResearch();toast("Research project started.");}));
}

function showSaves(){
  const slots=loadSlots();
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">GAME ARCHIVE</p><h2>Save / load</h2><p class="panel-meta">Autosave is always on. Named saves let you keep up to eight alternate runs.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><form id="saveGameForm" class="save-game-form"><input id="saveGameName" maxlength="28" value="${escapeHtml(`${player().name} · ${dateLabel()}`)}" aria-label="Save name"><button class="start-btn" ${slots.length>=8?"disabled":""}>Save current game</button></form><div class="panel-section"><h3>Named saves</h3><div class="save-slot-list">${slots.length?slots.map((slot,i)=>`<div class="save-slot"><div><strong>${escapeHtml(slot.name)}</strong><small>${escapeHtml(slot.company)} · ${escapeHtml(slot.date)} · ${slot.models} models</small></div><div><button class="text-btn load-slot" data-slot="${i}">Load</button><button class="text-btn delete-slot danger" data-slot="${i}">Delete</button></div></div>`).join(""):`<p class="panel-meta">No named saves yet.</p>`}</div></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#saveGameForm").addEventListener("submit",e=>{e.preventDefault();const current=loadSlots();if(current.length>=8)return;const name=$("#saveGameName").value.trim()||`${player().name} ${dateLabel()}`;current.unshift({name,company:player().name,date:dateLabel(),models:player().models.filter(m=>m.released).length,savedAt:Date.now(),data:JSON.parse(JSON.stringify(state))});writeSlots(current);showSaves();toast("Game saved.");});
  $$(".load-slot").forEach(btn=>btn.addEventListener("click",async()=>{const slot=loadSlots()[+btn.dataset.slot];if(!slot)return;if(slot.data?.difficulty==="hard"&&!await hasHardEntitlement()){toast("Unlock Hard Mode before loading this save.");return;}state=JSON.parse(JSON.stringify(slot.data));migrateState();save();render();$("#sidePanel").classList.add("is-hidden");toast(`Loaded ${slot.name}.`);}));
  $$(".delete-slot").forEach(btn=>btn.addEventListener("click",()=>{const current=loadSlots();current.splice(+btn.dataset.slot,1);writeSlots(current);showSaves();toast("Save deleted.");}));
}

function showSubscriptions(){
  const p=player();
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">MONETIZATION</p><h2>Subscriptions</h2><p class="panel-meta">Members pay monthly; game revenue is booked once per quarter. Model access and limits shape adoption.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="panel-section"><h3>Your tiers</h3>${p.subscriptions.map(s=>`<div class="sub-tier"><div><strong>${escapeHtml(s.name)}</strong><p>€${s.price}/month · ${s.members.toLocaleString()} members</p></div><span>${money(s.members*s.price/1000000)}/mo</span></div>`).join("")||`<p class="panel-meta">No paid tiers yet.</p>`}</div><div class="panel-section"><h3>Create tier (max 3)</h3><form id="tierForm" class="panel-form"><input id="tierName" maxlength="18" placeholder="Tier name" required><input id="tierPrice" type="number" min="3" max="200" value="19" required><button class="start-btn" ${p.subscriptions.length>=3?"disabled":""}>Create subscription</button></form></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#tierForm")?.addEventListener("submit",e=>{e.preventDefault();if(p.subscriptions.length>=3)return;const name=$("#tierName").value.trim();const price=+$("#tierPrice").value||19;p.subscriptions.push({id:`tier-${Date.now()}`,name,price,members:0});showSubscriptions();render();toast(`${name} subscription created.`);});
}

function showRules(){
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">GAME SYSTEM</p><h2>Rules & scoring</h2></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><ul class="rules-list"><li>The race has 16 turns: Q1–Q4 of 2024, 2025, 2026 and 2027. Q1 2024 is pre-launch.</li><li>The benchmark contains 25 essential AI capabilities—no filler subjects such as history, geography or law.</li><li>About 70% of public demand comes from casual users. Every audience values a different mix of benchmark categories.</li><li>Quarterly users, subscribers and their gains or losses directly affect company hype and revenue.</li><li>Core fields such as mathematics, coding and reasoning can be targeted at 100 immediately, but a single 100 adds roughly €5M in extreme-specialization cost.</li><li>Image generation, vision, audio, video, agents and massive context begin capped at 25. Three costly research levels raise the cap to 50, 75 and 100.</li><li>The audience focus preset is disabled for the player in Hard mode; manual benchmark design remains available.</li><li>Every model family starts automatically at version 1. New generation advances the whole number; Updated version advances by .1.</li><li>Combining Updated version with PRO creates the half-step PRO release, such as Zemmi 1.5 PRO.</li><li>At each Q4 close, each company’s best model competes for 10 / 8 / 6 / 4 / 2 race points. A company with multiple models in the top 15 earns a portfolio bonus equal to its model count.</li><li>Hype points go 5 / 3 / 2 / 1. All market and scoring rules apply equally to every company.</li></ul><button id="resetGame" class="utility-btn danger">Reset this game <span>×</span></button>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#resetGame").addEventListener("click",()=>{if(confirm("Reset the entire race?")){localStorage.removeItem(STORAGE_KEY);location.reload();}});
}

function showNewGame(){
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">START OVER</p><h2>New game</h2></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="new-game-confirm"><div class="company-mark">＋</div><h3>Begin a new AI race?</h3><p>This permanently replaces the current company, models, subscriptions, budget and leaderboard progress.</p><button id="confirmNewGame" class="start-btn">Start new game <svg><use href="#i-arrow"/></svg></button><button class="text-btn close-panel">Keep current game</button></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#confirmNewGame").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);location.reload();});
}

function showEnd(bankrupt=false){
  const ordered=[...state.companies].sort((a,b)=>b.points-a.points||b.hype-a.hype);const pos=ordered.findIndex(c=>c.id==="player")+1;
  $("#sidePanel").innerHTML=`<div class="panel-top"><p class="eyebrow">FINAL REPORT / 2027</p><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="end-card"><p>${bankrupt?"RUNWAY EXHAUSTED":"FOUR-YEAR ERA COMPLETE"}</p><div class="final-score">#${pos}</div><h2>${escapeHtml(player().name)}</h2><p>${player().points} points · ${player().models.filter(m=>m.released).length} models · ${money(player().budget)} left</p><p>Champion: ${escapeHtml(ordered[0].name)} with ${ordered[0].points} points.</p></div>`;
  $("#sidePanel").classList.remove("is-hidden");
}

function escapeHtml(s){return String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2400);}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}

async function apiRequest(path, options={}){
  const response=await fetch(path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||"Payment service unavailable.");
  return data;
}
async function hasHardEntitlement(){
  const token=localStorage.getItem(HARD_ENTITLEMENT_KEY);if(!token)return false;
  try{const result=await apiRequest("/api/hard-mode/entitlement",{method:"POST",body:JSON.stringify({token})});return result.valid===true;}catch{return false;}
}
function setHardModeAccess(unlocked){
  const option=$("#hardModeOption"),input=option.querySelector("input"),button=$("#unlockHardModeBtn");
  input.disabled=!unlocked;option.classList.toggle("locked",!unlocked);option.classList.toggle("unlocked",unlocked);
  $("#hardModeBadge").textContent=unlocked?"OWNED":"LOCKED";
  button.disabled=unlocked;button.innerHTML=unlocked?"<span>Hard Mode unlocked</span><strong>OWNED</strong>":"<span>Unlock Hard Mode</span><strong>€2.99 once</strong>";
}
async function beginHardModeCheckout(){
  const button=$("#unlockHardModeBtn");button.disabled=true;button.innerHTML="<span>Opening secure checkout…</span><strong>€2.99</strong>";
  try{
    if(!window.Paddle)throw new Error("Paddle Checkout could not load.");
    if(!paddleConfig)paddleConfig=await apiRequest("/api/hard-mode/config");
    if(!paddleReady){
      if(paddleConfig.environment==="sandbox")Paddle.Environment.set("sandbox");
      Paddle.Initialize({token:paddleConfig.clientToken,eventCallback:handlePaddleEvent});paddleReady=true;
    }
    Paddle.Checkout.open({items:[{priceId:paddleConfig.priceId,quantity:1}],customData:{entitlement:"hard_mode"},settings:{displayMode:"overlay",theme:"dark",locale:"en"}});
  }catch(error){setHardModeAccess(false);toast(error.message);}
}
async function handlePaddleEvent(event){
  if(event.name==="checkout.closed"){setHardModeAccess(false);return;}
  if(event.name!=="checkout.completed")return;
  try{
    const result=await apiRequest("/api/hard-mode/verify",{method:"POST",body:JSON.stringify({transactionId:event.data.transaction_id})});
    localStorage.setItem(HARD_ENTITLEMENT_KEY,result.token);setHardModeAccess(true);$("#hardModeOption input").checked=true;toast("Hard Mode unlocked.");
  }catch(error){setHardModeAccess(false);toast(error.message);}
}
async function initializeHardModePayment(){
  setHardModeAccess(await hasHardEntitlement());
}

function bind(){
  $("#unlockHardModeBtn").addEventListener("click",beginHardModeCheckout);
  $("#companyLogo").addEventListener("change",async e=>{
    const file=e.target.files[0]; if(!file)return;
    if(file.size>1.5*1024*1024){e.target.value="";$("#logoPreview").innerHTML=`<svg><use href="#i-plus"/></svg>`;toast("Logo must be smaller than 1.5 MB.");return;}
    const data=await fileToDataUrl(file);$("#logoPreview").innerHTML=`<img src="${data}" alt="Logo preview">`;
  });
  $("#setupForm").addEventListener("submit",async e=>{e.preventDefault();const difficulty=new FormData(e.target).get("difficulty");if(difficulty==="hard"&&!await hasHardEntitlement()){setHardModeAccess(false);toast("Hard Mode requires an unlock.");return;}const file=$("#companyLogo").files[0];if(!file){toast("Upload a company logo to continue.");return;}if(file.size>1.5*1024*1024){toast("Logo must be smaller than 1.5 MB.");return;}const logo=await fileToDataUrl(file);state=newGame($("#companyName").value,$("#firstModelName").value,difficulty,logo);render();});
  $$(".nav-btn").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
  $("#advanceBtn").addEventListener("click",advanceMonth); $("#newModelBtn").addEventListener("click",openModelBuilder);
  $("#modelForm").addEventListener("submit",startPlayerProject); $("#modalBackdrop").addEventListener("click",closeModal); $$(".close-modal").forEach(b=>b.addEventListener("click",closeModal));
  $("#categoryGrid").addEventListener("input",e=>{if(e.target.type==="range"){const i=+e.target.dataset.index;builderValues[i]=+e.target.value;e.target.nextElementSibling.value=e.target.value;updateEstimate();}});
  ["modelAccess","modelTier","freeLimit","proLimit"].forEach(id=>$(`#${id}`).addEventListener("input",updateEstimate));
  $("#modelType").addEventListener("change",applyVersionPreset);$("#modelName").addEventListener("change",applyVersionPreset);$$(".edition-picker input").forEach(x=>x.addEventListener("change",updateEstimate));
  $("#balanceSliders").addEventListener("click",()=>{builderValues=Array(CATEGORIES.length).fill(clamp(labCeiling()-5,20,80));builderAudienceApplied=false;renderSliders();updateEstimate();});
  $("#audienceFocusBtn").addEventListener("click",applyAudiencePreset);
  document.addEventListener("click",e=>{const target=e.target.closest("[data-company]");if(target&&!target.classList.contains("nav-btn"))showCompany(target.dataset.company);if(e.target.closest(".close-panel"))$("#sidePanel").classList.add("is-hidden");});
  document.addEventListener("click",e=>{if(!e.target.closest(".custom-select"))document.querySelectorAll(".custom-select.open").forEach(x=>{x.classList.remove("open");x.querySelector(".custom-select-trigger").setAttribute("aria-expanded","false")});});
  $("#markReadBtn").addEventListener("click",()=>{state.notifications.forEach(n=>n.unread=false);state.unread=0;render();});
  $("#newGameMenuBtn").addEventListener("click",showNewGame); $("#savesBtn").addEventListener("click",showSaves); $("#audienceBtn").addEventListener("click",showAudienceMarket); $("#researchBtn").addEventListener("click",showResearch); $("#subscriptionsBtn").addEventListener("click",showSubscriptions); $("#rulesBtn").addEventListener("click",showRules);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();$("#sidePanel").classList.add("is-hidden");}});
}

async function initializeApp(){
  bind();await initializeHardModePayment();state=load();
  if(state){migrateState();if(state.difficulty==="hard"&&!await hasHardEntitlement()){state=null;toast("This save needs the Hard Mode unlock.");return;}render();}
}
initializeApp();
