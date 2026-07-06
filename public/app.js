import {AD_CAMPAIGNS,CLASS_RULES,FINAL_ROUND,INVESTORS,OPERATING_MODES,average,canFinishRace,categoryImportance,classCap,clamp,developmentTime,emptyLedger,forecastLabel,inferenceCost,investmentDecision,spendableBudget,subscriptionConversion,upkeepCost,weakReleaseFactor} from "./game-core.js";

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
  flagship: { label: "Flagship", base: .72, hype: 18, time: 2, limit: 3 },
  pro: { label: "Pro", base: 1.15, hype: 26, time: 3, limit: 5 },
  light: { label: "Lite", base: .28, hype: 9, time: 1, limit: -4 },
  flash: { label: "Flash", base: .38, hype: 13, time: 1, limit: -2 },
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
const CURRENT_SAVE_VERSION = 5;
const TOTAL_ROUNDS = FINAL_ROUND + 1;
const STORAGE_KEY = "benchmark-ai-race-v2";
const SAVE_SLOTS_KEY = "benchmark-ai-race-save-slots-v1";
let state = null;
let builderValues = Array(CATEGORIES.length).fill(30);
let builderAudienceApplied = false;
let modelCompanyFilter = "all";
const CATEGORY_IMPORTANCE=categoryImportance(CATEGORIES,AUDIENCES);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => `${Number(n)<0?"−":""}€${Math.abs(Number(n)||0).toFixed(2)}M`;
const availableCash = (c) => spendableBudget(c.budget,state?.difficulty==="hard");
const dateLabel = (m = state.month) => `${QUARTERS[m % 4]} ${2024 + Math.floor(m / 4)}`;
const company = (id) => state.companies.find(c => c.id === id);
const player = () => company("player");
const releasedModels = () => state.companies.flatMap(c => c.models.filter(m => m.released).map(m => ({...m, companyId:c.id, companyName:c.name})));

function makeCompany(id, name, mark, budget, names = [], logo = null) {
  const generated=`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="18" fill="#f2f2ed"/><text x="40" y="48" text-anchor="middle" fill="#090909" font-family="Arial,sans-serif" font-size="24" font-weight="700">${String(mark).replace(/[<>&]/g,"").slice(0,2)}</text></svg>`)}`;
  return { id, name, mark, logo: logo || (id==="player"?generated:`assets/logos/${id}.png`), budget, models: [], hype: 0, points: 0, users:0, subscribers:0, userDelta:0, subDelta:0, metricsHistory:[], financeHistory:[], currentLedger:emptyLedger(0),lastLaunch:-99,proUntil:0,top3Streak:0,streakPoints:0,project:null,research:{scale:0,vision:0,audio:0,video:0},researchProject:null,modelNames:names,subscriptions:[],campaign:null,campaignRepeat:0,investmentRequests:0,investments:[],insolvent:false };
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
    version: CURRENT_SAVE_VERSION, month: 0, difficulty, companies, firstDraft: cleanFamily(firstModel), selectedAudience:"casual", marketHistory:[createMarketSnapshot(0)],
    notifications: [{id:Date.now(), month:0, companyId:"system", unread:true, title:"The race begins", text:"All 16 labs enter Q1 2024 with zero released models."}],
    gameOver:false, unread:1, yearlyAwards:[], previousModelRanks:{}, seed: Math.floor(Math.random()*999999), loadedFromLegacySave:false, originalVersion:CURRENT_SAVE_VERSION
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
  const incomingVersion = state.version || 1;
  state.originalVersion = incomingVersion;
  state.loadedFromLegacySave = incomingVersion < CURRENT_SAVE_VERSION;
  if((state.version||1)<2){
    state.month=Math.floor((state.month||0)/3);state.version=2;
    state.companies.forEach(c=>{c.lastLaunch=Math.floor((c.lastLaunch||-99)/3);c.proUntil=Math.ceil((c.proUntil||0)/3);if(c.project)c.project.due=Math.max(state.month+1,Math.ceil(c.project.due/3));c.models.forEach(m=>m.releaseMonth=Math.floor((m.releaseMonth||0)/3));});
  }
  if((state.version||2)<4){state.companies.forEach(c=>{if(c.project?.values)c.project.values=migrateBenchmarkValues(c.project.values);c.models.forEach(m=>m.values=migrateBenchmarkValues(m.values));});state.version=4;}
  if((state.version||4)<CURRENT_SAVE_VERSION)state.version=CURRENT_SAVE_VERSION;
  state.firstDraft=cleanFamily(state.firstDraft);
  state.selectedAudience||="casual";state.marketHistory||=[createMarketSnapshot(state.month||0)];
  state.previousModelRanks ||= {};
  state.gameOver=Boolean(state.gameOver&&canFinishRace(state.month||0));
  state.companies.forEach((c,i)=>{
    if(c.id!=="player"&&!c.logo)c.logo=`assets/logos/${c.id}.png`;
    if(c.id!=="player"&&!c.strategy)c.strategy={quality:.82+Math.random()*.43,speed:.72+Math.random()*.55,pro:.12+Math.random()*.6,free:.12+Math.random()*.7,update:.42+Math.random()*.45,focus:(i*3+Math.floor(Math.random()*12))%CATEGORIES.length};
    if(c.strategy&&!c.strategy.audience)c.strategy.audience=Object.keys(AUDIENCES)[i%Object.keys(AUDIENCES).length];
    if(c.strategy)c.strategy.focus=(c.strategy.focus||0)%CATEGORIES.length;
    c.users||=0;c.subscribers||=0;c.userDelta||=0;c.subDelta||=0;c.metricsHistory||=[];c.financeHistory||=[];c.currentLedger||=emptyLedger(state.month||0);
    c.top3Streak||=0;c.streakPoints||=0;c.campaign??=null;c.campaignRepeat||=0;c.investmentRequests||=0;c.investments||=[];c.insolvent||=false;
    c.research||={scale:0,vision:0,audio:0,video:0};c.researchProject||=null;
    if(c.project&&c.project.publicForecast==null)c.project.publicForecast=clamp(c.project.estimate||average(c.project.values||[40]),1,99);
    c.subscriptions||=[];c.subscriptions.forEach(t=>{t.members||=0;t.memberDelta||=0;});
    c.models.forEach((m,j)=>{m.id ||= `${c.id}-${m.releaseMonth}-${j}`;m.family ||= cleanFamily(m.name);m.versionNumber ||= j+1;m.modifiers ||= m.type==="pro"?["pro"]:m.type==="light"?["lite"]:m.type==="flash"?["flash"]:[];if(m.modifiers.length>1)m.modifiers=[m.modifiers.includes("pro")?"pro":m.modifiers.includes("flash")?"flash":"lite"];m.operatingMode||="full";m.activeUsers||=0;m.paidUsers||=0;m.userDelta||=0;m.revenue||=0;m.inferenceCost||=0;m.upkeep||=0;m.net||=0;m.financeHistory||=[];m.popularityFactor||=1;});
    const released=c.models.filter(m=>m.released);if(released.length&&c.users<=0){released.forEach(m=>m.activeUsers=Math.max(25,Math.round(120+m.score*8)));c.users=released.reduce((sum,m)=>sum+m.activeUsers,0);c.userDelta=c.users;}
  });
  repairLegacyNotifications();
}

function cleanFamily(name){return String(name||"").trim().replace(/\s+\d+(?:\.\d+)?(?:\s+(?:PRO|LITE|FLASH))*$/i,"").trim();}
function familyModels(c,family){const key=cleanFamily(family).toLowerCase();return c.models.filter(m=>m.released&&cleanFamily(m.family||m.name).toLowerCase()===key).sort((a,b)=>(b.versionNumber||0)-(a.versionNumber||0));}
function primaryType(modifiers=[]){return modifiers.includes("pro")?"pro":modifiers.includes("flash")?"flash":modifiers.includes("lite")?"light":"flagship";}
function autoModelClass(c,family,mode,values){
  const latest=familyModels(c,family)[0],avg=average(values),speed=CATEGORIES.includes("Speed")?values[CATEGORIES.indexOf("Speed")]||0:0,efficiency=CATEGORIES.includes("Efficiency")?values[CATEGORIES.indexOf("Efficiency")]||0:0,reliability=CATEGORIES.includes("Reliability")?values[CATEGORIES.indexOf("Reliability")]||0:0;
  if(!latest||mode==="new")return {type:"flagship",modifiers:[],reason:"New generation defaults to Flagship unless it is a tuned follow-up."};
  const previous=latest.score||average(latest.values||[avg]),delta=avg-previous;
  const speedLead=speed-avg,efficiencyLead=efficiency-avg,reliabilityLead=reliability-avg;
  const flashCandidate=(speedLead>=14&&efficiencyLead>=10)||(speed>=82&&efficiency>=76&&reliability>=68&&delta>=-3&&delta<=8);
  if(flashCandidate)return {type:"flash",modifiers:["flash"],reason:"Speed, efficiency and reliability are driving a faster tuned release."};
  if(mode==="update"&&delta>=8&&state.month>=c.proUntil&&c.models.filter(m=>m.released).length>0)return {type:"pro",modifiers:["pro"],reason:"This update is far ahead of its base model, so it becomes PRO automatically."};
  if(delta<=-4||avg<=previous*.92)return {type:"light",modifiers:["lite"],reason:"This release trails the main model, so it becomes LITE automatically."};
  return {type:"flagship",modifiers:[],reason:"Balanced follow-up quality keeps this release in Flagship class."};
}
function nextVersion(c,family,mode,modifiers=[]){const existing=familyModels(c,family),latest=existing[0];if(!latest)return mode==="new"?1:null;const current=latest.versionNumber||1;const major=Math.floor(current);if(mode==="new")return Math.max(...existing.map(m=>Math.floor(m.versionNumber||1)))+1;if(mode==="edition")return current;if(modifiers.includes("pro")&&current<major+.5)return major+.5;return Math.round((current+.1)*10)/10;}
function releaseName(c,family,mode,modifiers=[]){const version=nextVersion(c,family,mode,modifiers);if(version==null)return null;const suffix=modifiers.map(x=>x.toUpperCase()).join(" ");return `${cleanFamily(family)} ${Number.isInteger(version)?version:version.toFixed(1)}${suffix?` ${suffix}`:""}`;}
function modelClassLabel(m){const path=m.mode==="update"?"Updated":m.mode==="edition"?"Edition":"New";return [path,...(m.modifiers||[]).map(x=>x.toUpperCase())].join(" + ");}
function researchTrackForCategory(index){return Object.entries(RESEARCH_TRACKS).find(([,track])=>track.categories.includes(index))?.[0]||null;}
function categoryCap(c,index,type="flagship"){const track=researchTrackForCategory(index),researchCap=track?RESEARCH_CAPS[c.research?.[track]||0]:100;return classCap(type,CATEGORIES[index],researchCap);}
function capValues(values,c,type="flagship"){return values.map((v,i)=>Math.min(v,categoryCap(c,i,type)));}
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
function audienceMonetizationFactor(profile,marketShares={}){
  const weights={casual:.74,coders:1.14,business:1.22,creators:.96,researchers:1.08};
  const raw=Object.fromEntries(Object.keys(AUDIENCES).map(key=>[key,Math.max(.01,(profile[key]||0)*(marketShares[key]||0))]));
  const total=Object.values(raw).reduce((sum,value)=>sum+value,0)||1;
  return Object.entries(raw).reduce((sum,[key,value])=>sum+(value/total)*(weights[key]||1),0);
}
function modelMarketAppeal(model,market,c){
  let publicScore=0;Object.entries(market.shares).forEach(([key,share])=>publicScore+=audienceScore(model,key)*share);
  const age=Math.max(0,state.month-model.releaseMonth),freshness=Math.max(.18,Math.pow(.92,age));
  const operation=OPERATING_MODES[model.operatingMode||"full"]?.reach||1,classPopularity=CLASS_RULES[model.type]?.popularity||1;
  return Math.max(.0001,Math.pow(Math.max(1,publicScore)/100,2.25)*freshness*operation*classPopularity*(model.popularityFactor||1)*(1+c.hype/220));
}
function applyAudiencePreset(){
  if(state.difficulty==="hard"){toast("Audience focus assistance is disabled in Hard mode.");return;}
  const audience=AUDIENCES[state.selectedAudience],base=clamp(labCeiling()-10,24,72);
  const family=cleanFamily($("#modelName")?.value),mode=$("#modelType")?.value||"new",type=autoModelClass(player(),family,mode,builderValues).type;builderValues=CATEGORIES.map((category,index)=>clamp(Math.round(base+(audience.weights[category]||.08)*28),1,categoryCap(player(),index,type)));
  builderAudienceApplied=true;renderSliders();updateEstimate();toast(`Benchmark focused on ${audience.name}.`);
}
function updateQuarterlyAudience(){
  if(currentMarket()?.round!==state.month)state.marketHistory.push(createMarketSnapshot(state.month,seeded));
  const market=currentMarket(),companyRaw=new Map(),modelRaw=new Map();let rawTotal=0;
  state.companies.forEach(c=>{const models=c.models.filter(m=>m.released),scores=models.map(m=>[m,modelMarketAppeal(m,market,c)]),sorted=scores.map(x=>x[1]).sort((a,b)=>b-a);modelRaw.set(c.id,scores);const latest=[...models].sort((a,b)=>b.releaseMonth-a.releaseMonth)[0],accessFactor=latest?.access==="paid"?.76:latest?.access==="hybrid"?.96:1.04;const raw=models.length?(sorted[0]+sorted.slice(1).reduce((a,b)=>a+b*.2,0))*accessFactor:0;companyRaw.set(c.id,raw);rawTotal+=raw;});
  state.companies.forEach(c=>{
    const models=c.models.filter(m=>m.released),raw=companyRaw.get(c.id)||0,minimum=models.length*25,target=rawTotal?Math.max(minimum,market.total*.62*raw/rawTotal):minimum,previous=c.users||0,users=models.length?Math.max(minimum,Math.round(previous*.45+target*.55)):0;c.userDelta=users-previous;c.users=users;
    const weights=modelRaw.get(c.id)||[],weightTotal=weights.reduce((sum,x)=>sum+x[1],0)||1,distributable=Math.max(0,users-weights.length*25);let extraAssigned=0;weights.forEach(([m,w],i)=>{const old=m.activeUsers||0,extra=i===weights.length-1?distributable-extraAssigned:Math.round(distributable*w/weightTotal),next=25+Math.max(0,extra);m.userDelta=next-old;m.activeUsers=next;extraAssigned+=Math.max(0,extra);});
    const profile=companyAudienceProfile(c),catalogQuality=Math.max(0,...Object.values(profile)),diversity=clamp(models.length*8,0,24),tiers=c.subscriptions||[],avgPrice=tiers.length?average(tiers.map(t=>t.price)):30,limitValue=models.length?average(models.map(m=>clamp((m.proLimit||0)/10,0,100))):0,offerScore=clamp(catalogQuality*.55+diversity+limitValue*.2+clamp(35-avgPrice,0,25)*.6,0,100),ad=c.campaign?AD_CAMPAIGNS[c.campaign.size]:null,audienceFactor=audienceMonetizationFactor(profile,market.shares),conversion=tiers.length?subscriptionConversion({offerScore,adBoost:ad?.boost||0,repeatedAds:c.campaignRepeat||0,audienceFactor}):.005,targetSubs=Math.round(users*conversion),oldSubs=c.subscribers||0,subs=Math.min(users,Math.round(oldSubs*.45+targetSubs*.55));c.subDelta=subs-oldSubs;c.subscribers=subs;
    if(tiers.length){const tierWeights=tiers.map(t=>Math.max(.1,(40-t.price)/20)*(c.campaign?.tierId===t.id?1.5:1)),tw=tierWeights.reduce((a,b)=>a+b,0);let distributed=0;tiers.forEach((t,i)=>{const old=t.members||0,next=i===tiers.length-1?subs-distributed:Math.round(subs*tierWeights[i]/tw);t.memberDelta=next-old;t.members=next;distributed+=next;});}
    const eligible=models.filter(m=>m.access!=="free"),eligibleTotal=eligible.reduce((sum,m)=>sum+m.activeUsers,0)||1;eligible.forEach(m=>m.paidUsers=Math.min(m.activeUsers,Math.round(subs*m.activeUsers/eligibleTotal)));models.filter(m=>m.access==="free").forEach(m=>m.paidUsers=0);
    c.hype=Math.max(0,c.hype+clamp(c.userDelta/120000+c.subDelta/18000,-14,20)+Math.log10(users+1)*.18);c.metricsHistory.push({round:state.month,users,subscribers:subs,userDelta:c.userDelta,subDelta:c.subDelta});if(c.metricsHistory.length>16)c.metricsHistory.shift();
  });
}

function seeded() {
  state.seed = (state.seed * 1664525 + 1013904223) % 4294967296;
  return state.seed / 4294967296;
}

function companyMark(c) {
  if(c?.id==="system"||c?.system)return `<i class="company-mark system-mark"><svg><use href="#i-mark"/></svg></i>`;
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
  const time = developmentTime(type,"new",avg,overreach);
  const risk = clamp(overreach * 2.8, 0, 58);
  const expected = clamp(avg + accessBoost - risk * .09, 1, 99);
  const hype = Math.round(TYPES[type].hype + Math.max(0,modifiers.length-1)*4 + Math.max(0, expected - 35) * .55 + (access === "free" ? 8 : access === "paid" ? -3 : 2));
  return {avg, cost, extremeCost, time, risk, expected, hype, ceiling};
}

function notify(companyId, title, text) {
  state.notifications.unshift({id:Date.now()+Math.random(), month:state.month, companyId, unread:true, title, text});
  state.unread++;
}
function notificationText(kind,data={}){
  if(kind==="investmentAccepted")return `${money(data.offer)} invested after a ${money(data.requested)} request.`;
  if(kind==="investmentDeclined")return `The ${money(data.requested)} funding request was rejected.`;
  return data.text||"";
}
function notifyStructured(companyId,title,kind,data={}){
  state.notifications.unshift({id:Date.now()+Math.random(),month:state.month,companyId,unread:true,title,kind,data,text:notificationText(kind,data)});
  state.unread++;
}
function repairLegacyNotifications(){
  state.notifications=(state.notifications||[]).map(n=>{
    if(n.kind&&n.data)return {...n,text:notificationText(n.kind,n.data)};
    if(!n.companyId||n.companyId==="system")return n;
    const title=String(n.title||""),text=String(n.text||"");
    if(!/€0\.00M/.test(text))return n;
    const c=company(n.companyId);if(!c)return n;
    const accepted=title.match(/^(.*?)\s+backs\s+/i);
    if(accepted){
      const investor=accepted[1].trim();
      const match=(c.investments||[]).find(i=>i.round===n.month&&i.investor===investor&&i.amount>0);
      if(match)return {...n,kind:"investmentAccepted",data:{requested:match.requested,offer:match.amount},text:notificationText("investmentAccepted",{requested:match.requested,offer:match.amount})};
    }
    const declined=title.match(/^(.*?)\s+declines\s+/i);
    if(declined){
      const amountMatch=title.match(/€(\d+(?:\.\d+)?)M/i);
      if(amountMatch)return {...n,kind:"investmentDeclined",data:{requested:Number(amountMatch[1])},text:notificationText("investmentDeclined",{requested:Number(amountMatch[1])})};
    }
    return n;
  });
}
function ledgerFor(c){if(!c.currentLedger||c.currentLedger.round!==state.month)c.currentLedger=emptyLedger(state.month);return c.currentLedger;}
function bookExpense(c,key,amount){if(!amount)return;c.budget-=amount;const l=ledgerFor(c);l[key]=(l[key]||0)+amount;l.spending+=amount;l.net=l.revenue+l.investmentIncome-l.spending;}
function bookIncome(c,key,amount){if(!amount)return;c.budget+=amount;const l=ledgerFor(c);if(key==="investmentIncome")l.investmentIncome+=amount;else{l[key]=(l[key]||0)+amount;l.revenue+=amount;}l.net=l.revenue+l.investmentIncome-l.spending;}

function render() {
  if (!state) return;
  $("#app").classList.remove("is-hidden");
  $("#setupScreen").classList.add("is-hidden");
  $("#saveVersionWarning").classList.toggle("is-hidden", !state.loadedFromLegacySave);
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
  renderModelRanking(); renderHypeRanking(); renderNotifications(); renderCompanies();renderFinance();
  save();
}

function renderModelRanking() {
  const list = $("#modelRanking"),filter=$("#modelCompanyFilter"),allModels=releasedModels().sort((a,b)=>b.score-a.score);
  filter.innerHTML=`<option value="all">All companies</option><option value="player">Your models</option>${state.companies.filter(c=>c.id!=="player").sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}`;
  filter.value=modelCompanyFilter;enhanceSelect(filter);
  const models=allModels.map((m,index)=>({m,globalRank:index+1})).filter(({m})=>modelCompanyFilter==="all"||m.companyId===modelCompanyFilter);
  if (!models.length) {
    list.innerHTML = `<div class="empty-ranking"><strong>${allModels.length?"No matching models.":"No models released."}</strong><p>${allModels.length?"This company has not released a model yet.":"Q1 2024 is the quiet before the race. The first launches can land from Q2 onward."}</p></div>`;
    return;
  }
  list.innerHTML = models.map(({m,globalRank})=>{
    const c=company(m.companyId);
    const movement=rankMovement(m,globalRank);
    return `<button class="rank-row model-grid ${c.id==="player"?"player-row":""}" data-company="${c.id}">
      <span class="rank-primary"><span class="rank-position"><b class="rank-number ${globalRank<=3?"top":""}">${String(globalRank).padStart(2,"0")}</b><i class="rank-move ${movement.cls}" title="${movement.label}" aria-label="${movement.label}">${movement.symbol}</i></span>${companyMark(c)}<span class="rank-name"><strong>${escapeHtml(m.name)}</strong><small>Released ${dateLabel(m.releaseMonth)}</small></span></span>
      <span class="company-cell"><strong>${escapeHtml(c.name)}</strong><small>${money(c.budget)} left</small></span><span class="tag">${modelClassLabel(m)}</span><strong class="score">${m.score.toFixed(1)}</strong><span class="metric-cell"><strong>${compactNumber(m.activeUsers)}</strong><small>${signedNumber(m.userDelta)} / Q</small></span><span class="hype-delta">+${m.launchHype}</span>
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
  repairLegacyNotifications();
  const items=state.notifications;
  $("#notificationList").innerHTML=items.length?items.map(n=>{
    const c=n.companyId==="system"?{id:"system",system:true}:company(n.companyId);
    return `<div class="activity-item ${n.unread?"unread":""}"><span class="activity-date">${dateLabel(n.month)}</span>${companyMark(c)}<div class="activity-copy"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.text)}</p></div>${n.companyId!=="system"?`<button class="tag open-company" data-company="${n.companyId}">View lab</button>`:""}</div>`;
  }).join(""):`<div class="empty-ranking"><strong>No activity yet.</strong></div>`;
}

function renderCompanies() {
  const rows=[...state.companies].sort((a,b)=>b.points-a.points || b.hype-a.hype);
  $("#companyLeaderboard").innerHTML=rows.map((c,i)=>`<button class="rank-row ${c.id==="player"?"player-row":""}" data-company="${c.id}"><span class="rank-primary"><span class="rank-position"><b class="rank-number ${i<3?"top":""}">${String(i+1).padStart(2,"0")}</b></span>${companyMark(c)}<span class="rank-name"><strong>${escapeHtml(c.name)}</strong><small>${c.project?"Model in development":"Independent AI lab"}</small></span></span><span class="company-cell"><strong>${money(c.budget)}</strong><small>${c.models.filter(m=>m.released).length} released</small></span><span class="metric-cell"><strong>${compactNumber(c.users)}</strong><small>${signedNumber(c.userDelta)} / Q</small></span><span class="metric-cell"><strong>${compactNumber(c.subscribers)}</strong><small>${signedNumber(c.subDelta)} / Q</small></span><strong class="score">${Math.round(c.hype)}</strong><span>${c.points} pts</span></button>`).join("");
  $("#companyGrid").innerHTML=rows.map(c=>{const role=c.insolvent?"insolvent":c.id==="player"?"player":"rival",label=c.insolvent?"Insolvent":c.id==="player"?"You":"Rival";return `<button class="company-card" data-company="${c.id}"><div class="company-card-top">${companyMark(c)}<span class="company-role ${role}"><i></i>${label}</span></div><h3>${escapeHtml(c.name)}</h3><p>${c.project?`${escapeHtml(c.project.name)} · forecast ${forecastLabel(c.project.publicForecast||c.project.estimate)}`:"No active project"}</p><div class="company-card-stats"><span><strong>${money(c.budget)}</strong>Budget</span><span><strong>${c.models.filter(m=>m.released).length}</strong>Models</span><span><strong>${c.project?1:0}</strong>Upcoming</span><span><strong>${compactNumber(c.users)}</strong>Users</span><span><strong>${compactNumber(c.subscribers)}</strong>Subs</span><span><strong>${Math.round(c.hype)}</strong>Hype</span></div></button>`}).join("");
}

function renderFinance(){
  if(!state)return;const p=player(),current=p.currentLedger||emptyLedger(state.month),history=[...(p.financeHistory||[]),current],totalIncome=history.reduce((s,l)=>s+(l.revenue||0)+(l.investmentIncome||0),0),totalSpend=history.reduce((s,l)=>s+(l.spending||0),0);
  $("#financeSummary").innerHTML=`<div><span>Quarter income</span><strong>${money((current.revenue||0)+(current.investmentIncome||0))}</strong></div><div><span>Quarter spending</span><strong>${money(current.spending||0)}</strong></div><div><span>Quarter net</span><strong class="${current.net<0?"negative":""}">${current.net<0?"−":"+"}${money(Math.abs(current.net||0))}</strong></div><div><span>All-time cashflow</span><strong>${money(totalIncome)} / ${money(totalSpend)}</strong></div>`;
  $("#financeBreakdown").innerHTML=[["Subscriptions",current.subscriptionRevenue],["Investments",current.investmentIncome],["Inference",current.inference],["Upkeep",current.upkeep],["Development",current.development],["Research",current.research],["Advertising",current.advertising]].map(([label,value],i)=>`<div><span>${label}</span><strong>${i<2?"+":"−"}${money(value||0)}</strong></div>`).join("");
  if(current.runwaySavings>0)$("#financeBreakdown").insertAdjacentHTML("beforeend",`<div><span>Runway saved</span><strong class="protected-value">${money(current.runwaySavings)}</strong></div>`);
  const max=Math.max(.01,...history.flatMap(l=>[(l.revenue||0)+(l.investmentIncome||0),l.spending||0]));$("#financeChart").innerHTML=history.map(l=>`<div class="ledger-bars" title="${dateLabel(l.round)}"><i style="height:${((l.revenue||0)+(l.investmentIncome||0))/max*100}%"></i><b style="height:${(l.spending||0)/max*100}%"></b><small>${QUARTERS[l.round%4]}</small></div>`).join("");
  $("#financeHistory").innerHTML=history.slice().reverse().map(l=>`<div class="finance-row"><span>${dateLabel(l.round)}</span><strong>+${money((l.revenue||0)+(l.investmentIncome||0))}</strong><strong>−${money(l.spending||0)}</strong><b class="${l.net<0?"negative":""}">${l.net<0?"−":"+"}${money(Math.abs(l.net||0))}</b></div>`).join("")||`<p class="panel-meta">No transactions yet.</p>`;
  $("#modelFinance").innerHTML=p.models.filter(m=>m.released).sort((a,b)=>b.activeUsers-a.activeUsers).map(m=>`<div class="model-finance-row"><div><strong>${escapeHtml(m.name)}</strong><small>${compactNumber(m.activeUsers)} active · ${m.operatingMode}</small></div><span>+${money(m.revenue)}</span><span>−${money(m.inferenceCost+m.upkeep)}</span><b class="${m.net<0?"negative":""}">${m.net<0?"−":"+"}${money(Math.abs(m.net))}</b></div>`).join("")||`<p class="panel-meta">Release a model to begin financial tracking.</p>`;
}

function showCompany(id) {
  const c=company(id); if(!c)return;
  const models=[...c.models].filter(m=>m.released).sort((a,b)=>b.releaseMonth-a.releaseMonth);
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">COMPANY FILE</p><h2>${escapeHtml(c.name)}</h2><p class="panel-meta">${c.id==="player"?"Your company":"Autonomous rival lab"}</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div>${c.id==="player"?`<label class="logo-upload-label panel-logo-label">Company logo<span class="logo-upload"><span class="logo-preview">${c.logo?`<img src="${escapeHtml(c.logo)}" alt="Logo preview">`:`<svg><use href="#i-plus"/></svg>`}</span><span class="logo-upload-copy"><strong>${c.logo?"Replace your logo":"Add your logo"}</strong><small>PNG, JPG, WEBP or SVG · max 1.5 MB</small></span><span class="logo-upload-action">Choose file</span><input id="changeCompanyLogo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></span></label>`:""}<div class="panel-stat-grid"><div><span>Budget left</span><strong>${money(c.budget)}</strong></div><div><span>Hype / points</span><strong>${Math.round(c.hype)} / ${c.points}</strong></div></div><div class="audience-summary"><div><span>Active users</span><strong>${compactNumber(c.users)}</strong><small>${signedNumber(c.userDelta)} this quarter</small></div><div><span>Subscribers</span><strong>${compactNumber(c.subscribers)}</strong><small>${signedNumber(c.subDelta)} this quarter</small></div></div>${c.project?`<div class="upcoming-forecast"><span>UPCOMING · ${dateLabel(c.project.due)}</span><strong>${escapeHtml(c.project.name)}</strong><b>${forecastLabel(c.project.publicForecast||c.project.estimate)}</b><small>Forecasts are intentionally uncertain.</small></div>`:""}<div class="panel-section"><h3>Model history</h3>${models.length?models.map(m=>`<div class="panel-model model-detail"><div><strong>${escapeHtml(m.name)}</strong><small>${modelClassLabel(m)} · ${dateLabel(m.releaseMonth)} · ${compactNumber(m.activeUsers)} users</small>${c.id==="player"?`<div class="operating-picker">${Object.entries(OPERATING_MODES).map(([key,op])=>`<button data-model-mode="${m.id}" data-mode="${key}" class="${m.operatingMode===key?"active":""}" ${key==="lean"&&state.month-m.releaseMonth<2||key==="legacy"&&state.month-m.releaseMonth<4?"disabled":""}>${op.label}</button>`).join("")}</div>`:""}</div><div class="model-detail-numbers"><strong>${m.score.toFixed(1)}</strong><small>${m.net<0?"−":"+"}${money(Math.abs(m.net))}/Q</small></div></div>`).join(""):`<p class="panel-meta">No released models. Every lab began at zero.</p>`}</div><div class="panel-section"><h3>Research</h3>${Object.entries(RESEARCH_TRACKS).map(([key,track])=>`<div class="panel-model"><div><strong>${track.name}</strong><small>${c.researchProject?.track===key?`In progress · due ${dateLabel(c.researchProject.due)}`:track.description}</small></div><strong>${RESEARCH_CAPS[c.research?.[key]||0]}</strong></div>`).join("")}</div>`;
  $("#sidePanel .upcoming-forecast small")?.replaceChildren("Forecasts are uncertain.");
  $("#sidePanel").classList.remove("is-hidden");
  $("#changeCompanyLogo")?.addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;if(file.size>1.5*1024*1024){toast("Logo must be smaller than 1.5 MB.");return;}c.logo=await fileToDataUrl(file);save();render();showCompany("player");toast("Company logo updated.");});
  $$('[data-model-mode]').forEach(btn=>btn.addEventListener("click",()=>{const m=c.models.find(x=>x.id===btn.dataset.modelMode);if(!m||btn.disabled)return;m.operatingMode=btn.dataset.mode;save();render();showCompany(c.id);toast(`${m.name} moved to ${OPERATING_MODES[m.operatingMode].label} operations.`);}));
}

function switchView(view) {
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $$(".view").forEach(v=>v.classList.remove("active"));
  $(`#${view}View`).classList.add("active");
  $("#viewTitle").textContent={race:"Model race",hype:"Hype leaderboard",notifications:"Activity",companies:"Companies",finance:"Finance"}[view];
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
  if(state.gameOver||player().insolvent){toast(player().insolvent?"Your company is insolvent.":"The 2024–2027 race is over.");return;}
  $("#modelModal").classList.remove("is-hidden"); $("#modalBackdrop").classList.remove("is-hidden");
  const p=player();
  builderAudienceApplied=false;
  $("#audienceFocusBtn").textContent=state.difficulty==="hard"?"Audience focus disabled in Hard mode":`Focus: ${AUDIENCES[state.selectedAudience].name}`;
  $("#audienceFocusBtn").disabled=state.difficulty==="hard";
  const latest=[...p.models].filter(m=>m.released).sort((a,b)=>b.releaseMonth-a.releaseMonth)[0];
  $("#modelName").value = state.firstDraft || latest?.family || "";
  $("#modelType").value="new";
  $("#modelTier").innerHTML=p.subscriptions.map(s=>`<option value="${s.id}">${escapeHtml(s.name)} · €${s.price}/mo</option>`).join("") || `<option value="">No paid tier created</option>`;
  [$("#modelType"),$("#modelAccess"),$("#modelTier")].forEach(enhanceSelect);
  const ownBest=p.models.filter(m=>m.released).sort((a,b)=>b.score-a.score)[0]?.score||0;
  const base=clamp(Math.round(Math.max(36,ownBest-2)),20,75); builderValues=Array(CATEGORIES.length).fill(base);
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
    builderValues=Array(CATEGORIES.length).fill(clamp(Math.round(Math.max(36,ownBest-2)),20,82));
  }
  renderSliders();updateEstimate();
}

function closeModal() { $("#modelModal").classList.add("is-hidden"); $("#modalBackdrop").classList.add("is-hidden"); }

function renderSliders(){
  const family=cleanFamily($("#modelName")?.value),mode=$("#modelType")?.value||"new",classification=autoModelClass(player(),family,mode,builderValues),type=classification.type;builderValues=capValues(builderValues,player(),type);
  $("#categoryGrid").innerHTML=CATEGORIES.map((cat,i)=>{const track=researchTrackForCategory(i),cap=categoryCap(player(),i,type),importance=CATEGORY_IMPORTANCE[cat];return `<div class="slider-row ${track?"research-gated":""}"><label title="${cat} · ${importance.label} public impact"><span>${cat}<i class="importance-dots dots-${importance.dots}" aria-label="${importance.label} public importance"></i></span><small>${importance.label.toUpperCase()}${cap<100?` · MAX ${cap}`:""}</small></label><input type="range" min="1" max="${cap}" value="${builderValues[i]}" data-index="${i}" aria-label="${cat}" ${track?`data-research="${track}"`:""}><output>${builderValues[i]}</output></div>`}).join("");
  $("#autoClassPreview").innerHTML=`<strong>${CLASS_RULES[type].label}</strong> · ${escapeHtml(classification.reason)}`;
}

function updateEstimate(){
  const p=player(),family=cleanFamily($("#modelName").value),mode=$("#modelType").value,classification=autoModelClass(p,family,mode,builderValues),modifiers=classification.modifiers,type=classification.type,access=$("#modelAccess").value;
  const e=estimateBuild(builderValues,type,access,+$("#freeLimit").value,+$("#proLimit").value,p,modifiers),finalName=releaseName(p,family,mode,modifiers);e.time=developmentTime(type,mode,e.avg,Math.max(0,e.avg-e.ceiling));
  const focusHype=builderAudienceApplied?Math.round((currentMarket()?.shares[state.selectedAudience]||0)*10):0;
  $("#builderBudget").textContent=money(p.budget);$("#projectedName").textContent=finalName||"Needs version 1"; $("#projectedScore").textContent=e.expected.toFixed(1); $("#projectedCost").textContent=money(e.cost); $("#projectedTime").textContent=`${e.time} qtr`; $("#projectedHype").textContent=`+${e.hype+focusHype}`; $("#labCeiling").textContent=e.ceiling;
  const messages=[];
  if(e.risk>0)messages.push(`${Math.round(e.risk)}% overreach risk: targets exceed current research maturity.`); else messages.push("Targets are within your lab's current research maturity.");
  if(e.extremeCost>.05)messages.push(`Extreme 65–100 specialization adds ${money(e.extremeCost)} to this build.`);
  if(e.cost>availableCash(p))messages.push(state.difficulty==="hard"?"This project exceeds your remaining budget.":"This project would spend your protected €0.10M operating reserve.");
  if(mode!=="new"&&!familyModels(p,family).length)messages.push("This path needs an existing released model family.");
  const duplicate=!!finalName&&familyModels(p,family).some(m=>m.name.toLowerCase()===finalName.toLowerCase());if(duplicate)messages.push("That exact version and edition already exists.");
  if(access!=="free" && !p.subscriptions.length)messages.push("Create a subscription tier before using paid access.");
  messages.push(`${CLASS_RULES[type].label} is assigned automatically from this model's direction and strength.`);
  $("#riskText").textContent=messages.join(" ");
  const prelocked=state.month===0||!!p.project||state.month-p.lastLaunch<1;
  $("#releaseModelBtn").disabled=prelocked||!family||!finalName||duplicate||e.cost>availableCash(p)||(access!=="free"&&!p.subscriptions.length);
}

function startPlayerProject(ev){
  ev.preventDefault(); const p=player(); if($("#releaseModelBtn").disabled)return;
  const family=cleanFamily($("#modelName").value); if(!family){toast("Give the model family a name.");return;}
  const mode=$("#modelType").value,classification=autoModelClass(p,family,mode,builderValues),modifiers=classification.modifiers,type=classification.type,name=releaseName(p,family,mode,modifiers),versionNumber=nextVersion(p,family,mode,modifiers),access=$("#modelAccess").value,freeLimit=+$("#freeLimit").value,proLimit=+$("#proLimit").value;
  const e=estimateBuild(builderValues,type,access,freeLimit,proLimit,p,modifiers);e.time=developmentTime(type,mode,e.avg,Math.max(0,e.avg-e.ceiling));
  bookExpense(p,"development",e.cost);
  const audienceFocus=builderAudienceApplied?state.selectedAudience:null,focusHype=audienceFocus?Math.round((currentMarket()?.shares[audienceFocus]||0)*10):0;
  const forecastNoise=(seeded()-.5)*(state.difficulty==="hard"?32:20);
  p.project={name,family,versionNumber,mode,modifiers,type,access,freeLimit,proLimit,tierId:$("#modelTier").value,values:[...builderValues],audienceFocus,due:state.month+e.time,estimate:e.expected,publicForecast:clamp(e.expected+forecastNoise,1,99),launchHype:e.hype+focusHype,risk:e.risk,cost:e.cost};
  if(modifiers.includes("pro"))p.proUntil=state.month+3;
  state.firstDraft="";
  notify("player",`${name} enters development`,`€${e.cost.toFixed(2)}M committed. Expected launch: ${dateLabel(p.project.due)}.`);
  closeModal(); toast(`${name} entered development.`); render();
}

function realizeProject(c){
  const p=c.project; if(!p||p.due>state.month)return;
  const noise=(seeded()-.5)*3.4;
  const ceiling=labCeiling(c)+TYPES[p.type].limit;
  const raw=average(p.values);
  const service=p.access==="paid"?clamp(p.proLimit/800,0,1.5):p.access==="hybrid"?clamp((p.proLimit-p.freeLimit)/1000,0,1):0;
  const score=clamp(Math.min(raw,ceiling+Math.max(0,(raw-ceiling)*.22))+service+noise,1,99);
  const previousBest=Math.max(0,...c.models.filter(m=>m.released).map(m=>m.score)),popularityFactor=weakReleaseFactor(score,previousBest);
  const launchHype=Math.max(1,Math.round((p.launchHype+(score-(releasedModels()[0]?.score||35))*.5)*popularityFactor));
  c.models.push({id:`${c.id}-${state.month}-${c.models.length}`,name:p.name,family:p.family,versionNumber:p.versionNumber,mode:p.mode,modifiers:p.modifiers||[],type:p.type,access:p.access,freeLimit:p.freeLimit,proLimit:p.proLimit,tierId:p.tierId||"",values:p.values,audienceFocus:p.audienceFocus||null,score,releaseMonth:state.month,released:true,launchHype,popularityFactor,operatingMode:"full",activeUsers:25,paidUsers:0,userDelta:25,revenue:0,inferenceCost:0,upkeep:0,net:0,financeHistory:[]});
  c.hype+=launchHype; c.lastLaunch=state.month;
  notify(c.id,`${c.name} releases ${p.name}`,`${modelClassLabel(p)} model debuts at ${score.toFixed(1)} with +${launchHype} hype.`);
  c.project=null;
}

function rivalStart(c){
  if(c.insolvent||c.project||state.month===0||state.month-c.lastLaunch<1||c.budget<.65)return;
  const models=c.models.filter(m=>m.released),released=models.length,s=c.strategy;
  const urgency=(released===0?.72:.38*s.speed+.08)*(state.difficulty==="hard"?1.12:1);
  if(seeded()>urgency)return;
  const family=cleanFamily(c.modelNames[0]),mode=released===0?"new":seeded()<s.update?"update":seeded()<.22?"edition":"new";
  let latest=familyModels(c,family)[0],audienceFocus=seeded()<.62?s.audience:Object.entries(currentMarket()?.shares||{casual:1}).sort((a,b)=>b[1]-a[1])[0][0],audienceWeights=AUDIENCES[audienceFocus].weights;
  const target=clamp(labCeiling(c)-7+s.quality*7+seeded()*7,22,95);
  let values=mode==="update"&&latest?.values?[...latest.values].map((v,i)=>clamp(Math.round(v+1+seeded()*4+(i===s.focus?4:0)+(audienceWeights[CATEGORIES[i]]||0)*4),1,categoryCap(c,i,"flagship"))):CATEGORIES.map((category,i)=>clamp(Math.round(target+(seeded()-.5)*13+(i===s.focus?7:0)+(audienceWeights[category]||0)*10+((category==="Speed"||category==="Efficiency")&&s.speed>.98?6:0)),1,categoryCap(c,i,"flagship")));
  let classification=autoModelClass(c,family,mode,values),modifiers=classification.modifiers,type=classification.type;
  values=capValues(values,c,type);
  let access=seeded()<s.free?"free":seeded()<.72?"hybrid":"paid",freeLimit=access==="paid"?0:Math.round(6+seeded()*34),proLimit=Math.round(140+seeded()*560);
  if(access!=="free"&&!c.subscriptions.length)c.subscriptions.push({id:`${c.id}-pro`,name:"Pro",price:Math.round(10+seeded()*18),members:0,memberDelta:0});
  let e=estimateBuild(values,type,access,freeLimit,proLimit,c,modifiers),maxSpend=availableCash(c)*(released===0?.72:.58);
  for(let attempt=0;e.cost>maxSpend&&attempt<8;attempt++){values=values.map((v,i)=>clamp(v>65?v-5:v-2,18,categoryCap(c,i,type)));classification=autoModelClass(c,family,mode,values);modifiers=classification.modifiers;type=classification.type;values=capValues(values,c,type);e=estimateBuild(values,type,access,freeLimit,proLimit,c,modifiers);}
  if(e.cost>availableCash(c)){values=values.map((v,i)=>clamp(v-8,18,categoryCap(c,i,"light")));classification={type:"light",modifiers:["lite"]};modifiers=classification.modifiers;type=classification.type;access="free";freeLimit=30;proLimit=200;e=estimateBuild(values,type,"free",30,200,c,modifiers);}
  if(e.cost>availableCash(c))return;
  const name=releaseName(c,family,mode,modifiers),versionNumber=nextVersion(c,family,mode,modifiers);if(!name)return;
  e.time=developmentTime(type,mode,e.avg,Math.max(0,e.avg-e.ceiling));bookExpense(c,"development",e.cost);
  c.project={name,family,versionNumber,mode,modifiers,type,access,freeLimit,proLimit,values,audienceFocus,due:state.month+e.time,estimate:e.expected,publicForecast:clamp(e.expected+(seeded()-.5)*(state.difficulty==="hard"?32:20),1,99),launchHype:e.hype+Math.round((currentMarket()?.shares[audienceFocus]||0)*10),risk:e.risk,cost:e.cost};
  if(modifiers.includes("pro"))c.proUntil=state.month+3;
}

function quarterlyEconomy(){
  state.companies.forEach(c=>{
    const models=c.models.filter(m=>m.released),subscriptionRevenue=(c.subscriptions||[]).reduce((sum,t)=>sum+(t.members||0)*t.price*3/1000000,0);bookIncome(c,"subscriptionRevenue",subscriptionRevenue);
    const totalPaid=models.reduce((sum,m)=>sum+(m.paidUsers||0),0)||1;
    const calculate=()=>models.forEach(m=>{const compute=inferenceCost({users:m.activeUsers,subscribers:m.paidUsers,freeLimit:m.access==="paid"?0:m.freeLimit,proLimit:m.proLimit,score:m.score,type:m.type,mode:m.operatingMode});m.revenue=subscriptionRevenue*(m.paidUsers||0)/totalPaid;m.inferenceCost=compute.total;m.upkeep=upkeepCost(m.score,m.type,m.operatingMode);m.net=m.revenue-m.inferenceCost-m.upkeep;});
    calculate();
    let planned=models.reduce((s,m)=>s+m.inferenceCost+m.upkeep,0),originalPlanned=planned,protectedRunway=false;
    if(state.difficulty!=="hard"&&planned>availableCash(c)){
      const oldest=[...models].sort((a,b)=>a.releaseMonth-b.releaseMonth);
      for(const m of oldest){if(planned<=availableCash(c))break;if(m.operatingMode==="full"&&state.month-m.releaseMonth>=2){m.operatingMode="lean";calculate();planned=models.reduce((s,x)=>s+x.inferenceCost+x.upkeep,0);}}
      for(const m of oldest){if(planned<=availableCash(c))break;if(m.operatingMode==="lean"&&state.month-m.releaseMonth>=4){m.operatingMode="legacy";calculate();planned=models.reduce((s,x)=>s+x.inferenceCost+x.upkeep,0);}}
      const cash=availableCash(c);
      if(planned>cash&&planned>0){const ratio=clamp(cash/planned,0,1),reach=Math.max(.08,ratio);models.forEach(m=>{m.activeUsers=Math.max(25,Math.round(m.activeUsers*reach));m.paidUsers=Math.min(m.activeUsers,Math.round(m.paidUsers*reach));m.inferenceCost*=ratio;m.upkeep*=ratio;m.net=m.revenue-m.inferenceCost-m.upkeep;});}
      const finalCost=models.reduce((s,m)=>s+m.inferenceCost+m.upkeep,0),l=ledgerFor(c);l.runwaySavings=(l.runwaySavings||0)+Math.max(0,originalPlanned-finalCost);protectedRunway=true;c.runwaySafeguards=(c.runwaySafeguards||0)+1;c.users=models.reduce((s,m)=>s+m.activeUsers,0);c.subscribers=Math.min(c.users,models.reduce((s,m)=>s+m.paidUsers,0));
    }
    models.forEach(m=>{m.financeHistory.push({round:state.month,users:m.activeUsers,revenue:m.revenue,cost:m.inferenceCost+m.upkeep,net:m.net});if(m.financeHistory.length>16)m.financeHistory.shift();});
    const inference=models.reduce((s,m)=>s+m.inferenceCost,0),upkeep=models.reduce((s,m)=>s+m.upkeep,0);bookExpense(c,"inference",inference);bookExpense(c,"upkeep",upkeep);if(state.difficulty!=="hard"&&c.budget<.1)c.budget=.1;const l=ledgerFor(c);l.closing=c.budget;l.net=l.revenue+l.investmentIncome-l.spending;
    if(protectedRunway&&c.id==="player")notify("system","Runway protection activated","Serving capacity was reduced and eligible older models were moved to cheaper operations. Your €0.10M reserve remains intact.");
    if(c.campaign)c.campaign=null;
  });
}

function rollLedgers(){state.companies.forEach(c=>{if(c.currentLedger){c.currentLedger.closing=c.budget;c.currentLedger.net=c.currentLedger.revenue+c.currentLedger.investmentIncome-c.currentLedger.spending;c.financeHistory.push({...c.currentLedger});if(c.financeHistory.length>16)c.financeHistory.shift();}c.currentLedger=emptyLedger(state.month+1);});}
function companyInvestmentMetrics(c){const best=Math.max(0,...c.models.filter(m=>m.released).map(m=>m.score));return{bestScore:best,projectEstimate:c.project?.estimate||0,hype:c.hype,users:c.users,subscribers:c.subscribers};}
function requestCompanyInvestment(c,investor,amount){if(c.investmentRequests>=3)return null;c.investmentRequests++;const result=investmentDecision({investor,amount,metrics:companyInvestmentMetrics(c),random:seeded});if(result.accepted){bookIncome(c,"investmentIncome",result.offer);c.investments.push({round:state.month,investor:investor.name,requested:amount,amount:result.offer});notifyStructured(c.id,`${investor.name} backs ${c.name}`,"investmentAccepted",{requested:amount,offer:result.offer});}else notifyStructured(c.id,`${investor.name} declines ${c.name}`,"investmentDeclined",{requested:amount});return result;}
function rivalInvestment(c){if(c.investmentRequests>=3||c.budget>2.2||seeded()>.36)return;const investor=INVESTORS[Math.floor(seeded()*INVESTORS.length)],amount=clamp(Math.round((2+c.project?.estimate/15+seeded()*3)*10)/10,1,10);requestCompanyInvestment(c,investor,amount);}
function rivalAdvertising(c){if(c.insolvent||!c.subscriptions.length||availableCash(c)<.25||seeded()>.22)return;const size=availableCash(c)>5&&seeded()>.6?"large":availableCash(c)>2?"medium":"small",campaign=AD_CAMPAIGNS[size],tier=c.subscriptions[0];if(campaign.cost>availableCash(c))return;bookExpense(c,"advertising",campaign.cost);c.campaignRepeat=c.campaign?.size===size?(c.campaignRepeat||0)+1:0;c.campaign={size,tierId:tier.id};}
function awardTopThreeStreaks(){const top=releasedModels().sort((a,b)=>b.score-a.score).slice(0,3),present=new Set(top.map(m=>m.companyId));state.companies.forEach(c=>{if(present.has(c.id)){c.top3Streak=(c.top3Streak||0)+1;if(c.top3Streak>=3){c.points++;c.streakPoints=(c.streakPoints||0)+1;notify(c.id,`${c.name} earns a top-three streak point`,`${c.top3Streak} consecutive quarters in the model top three.`);}}else c.top3Streak=0;});}

function processResearch(c){
  const project=c.researchProject;if(!project||project.due>state.month)return;
  c.research[project.track]=Math.min(3,(c.research[project.track]||0)+1);
  notify(c.id,`${c.name} completes ${RESEARCH_TRACKS[project.track].name}`,`Research level ${c.research[project.track]} raises its frontier benchmark cap to ${RESEARCH_CAPS[c.research[project.track]]}.`);
  c.researchProject=null;
}

function rivalResearch(c){
  if(c.insolvent||c.researchProject||availableCash(c)<1.2||seeded()>.3)return;
  const entries=Object.keys(RESEARCH_TRACKS).filter(key=>(c.research[key]||0)<3);if(!entries.length)return;
  const focusTrack=researchTrackForCategory(c.strategy.focus),track=focusTrack&&entries.includes(focusTrack)&&seeded()<.65?focusTrack:entries[Math.floor(seeded()*entries.length)];
  const level=c.research[track]||0,cost=RESEARCH_TRACKS[track].costs[level];if(cost>availableCash(c))return;
  bookExpense(c,"research",cost);c.researchProject={track,due:state.month+1,cost};
}

function awardYear(){
  const models=releasedModels().sort((a,b)=>b.score-a.score);
  const modelPoints=[10,8,6,4,2],hypePoints=[5,3,2,1],userPoints=[5,3,2,1],subscriberPoints=[5,3,2,1];
  const seen=new Set(),modelWinners=[];
  for(const m of models){if(!seen.has(m.companyId)){modelWinners.push(m.companyId);seen.add(m.companyId);}if(modelWinners.length===5)break;}
  modelWinners.forEach((id,i)=>company(id).points+=modelPoints[i]);
  const portfolioCounts={},depthBonuses={};
  models.slice(0,15).forEach(model=>portfolioCounts[model.companyId]=(portfolioCounts[model.companyId]||0)+1);
  Object.entries(portfolioCounts).forEach(([id,count])=>{if(count<2)return;company(id).points+=count;depthBonuses[id]=count;});
  const hypeWinners=[...state.companies].sort((a,b)=>b.hype-a.hype).slice(0,4);
  hypeWinners.forEach((c,i)=>c.points+=hypePoints[i]);
  const userWinners=[...state.companies].sort((a,b)=>b.users-a.users || b.subscribers-a.subscribers).slice(0,4);
  userWinners.forEach((c,i)=>c.points+=userPoints[i]);
  const subscriberWinners=[...state.companies].sort((a,b)=>b.subscribers-a.subscribers || b.users-a.users).slice(0,4);
  subscriberWinners.forEach((c,i)=>c.points+=subscriberPoints[i]);
  const year=2024+Math.floor(state.month/4);
  state.yearlyAwards.push({year,modelWinners,hypeWinners:hypeWinners.map(c=>c.id),userWinners:userWinners.map(c=>c.id),subscriberWinners:subscriberWinners.map(c=>c.id),depthBonuses});
  const depthText=Object.entries(depthBonuses).sort((a,b)=>b[1]-a[1]).map(([id,points])=>`${company(id).name} +${points}`).join(", ");
  notify("system",`${year} season points awarded`,`${company(modelWinners[0])?.name||"No lab"} wins the model race; ${hypeWinners[0].name} wins hype; ${userWinners[0].name} leads total users; ${subscriberWinners[0].name} leads subscribers.${depthText?` Portfolio bonuses: ${depthText}.`:""}`);
}

function advanceMonth(auto=false){
  if(state.gameOver)return;
  if(canFinishRace(state.month)){awardYear();state.gameOver=true;notify("system","The 2027 race is complete",`${[...state.companies].sort((a,b)=>b.points-a.points)[0].name} wins the era on points.`);render();showEnd();return;}
  if(state.month%4===3)awardYear();
  snapshotModelRanks();
  rollLedgers();
  state.month++;
  state.companies.forEach(c=>c.hype*=.72);
  state.companies.forEach(processResearch);
  state.companies.forEach(realizeProject);
  state.companies.filter(c=>c.id!=="player").forEach(c=>{rivalInvestment(c);rivalAdvertising(c);rivalResearch(c);rivalStart(c);});
  updateQuarterlyAudience();
  quarterlyEconomy();awardTopThreeStreaks();
  state.companies.forEach(c=>{if(state.difficulty==="hard"&&c.budget<0)c.insolvent=true;});
  if(!auto){render();toast(`${dateLabel()} — new quarter`);if(player().insolvent&&!state.bankruptcyMode)showBankruptcy();}
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
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">FRONTIER R&D</p><h2>Research lab</h2><p class="panel-meta">Core benchmark fields are open to 100 immediately. Frontier fields require dedicated research.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div>${p.researchProject?`<div class="research-active"><span>ACTIVE PROJECT</span><strong>${RESEARCH_TRACKS[p.researchProject.track].name}</strong><small>Completes ${dateLabel(p.researchProject.due)}</small></div>`:""}<div class="research-list">${Object.entries(RESEARCH_TRACKS).map(([key,track])=>{const level=p.research[key]||0,cap=RESEARCH_CAPS[level],complete=level>=3,cost=complete?0:track.costs[level];return `<article class="research-card"><div class="research-card-top"><div><span>LEVEL ${level} / 3</span><h3>${track.name}</h3></div><strong>${cap}</strong></div><p>${track.description}</p><div class="research-progress"><i style="width:${level/3*100}%"></i></div><div class="research-card-bottom"><small>${complete?"Maximum unlocked":`Next cap ${RESEARCH_CAPS[level+1]} · ${money(cost)} · 1 quarter`}</small><button class="tag research-start" data-track="${key}" ${complete||p.researchProject||cost>=p.budget||state.gameOver||p.insolvent?"disabled":""}>${complete?"Complete":"Research"}</button></div></article>`}).join("")}</div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $$(".research-start").forEach(btn=>btn.addEventListener("click",()=>{const track=btn.dataset.track,level=p.research[track]||0,cost=RESEARCH_TRACKS[track].costs[level];if(p.researchProject||cost>availableCash(p)||p.insolvent)return;bookExpense(p,"research",cost);p.researchProject={track,due:state.month+1,cost};notify("player",`${RESEARCH_TRACKS[track].name} research begins`,`${money(cost)} committed. New capability cap arrives in ${dateLabel(p.researchProject.due)}.`);render();showResearch();toast("Research project started.");}));
}

function showSaves(){
  const slots=loadSlots();
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">GAME ARCHIVE</p><h2>Save / load</h2><p class="panel-meta">Autosave is always on. Named saves let you keep up to eight alternate runs.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><form id="saveGameForm" class="save-game-form"><input id="saveGameName" maxlength="28" value="${escapeHtml(`${player().name} · ${dateLabel()}`)}" aria-label="Save name"><button class="start-btn" ${slots.length>=8?"disabled":""}>Save current game</button></form><div class="panel-section"><h3>Named saves</h3><div class="save-slot-list">${slots.length?slots.map((slot,i)=>`<div class="save-slot"><div><strong>${escapeHtml(slot.name)}</strong><small>${escapeHtml(slot.company)} · ${escapeHtml(slot.date)} · ${slot.models} models</small></div><div><button class="text-btn load-slot" data-slot="${i}">Load</button><button class="text-btn delete-slot danger" data-slot="${i}">Delete</button></div></div>`).join(""):`<p class="panel-meta">No named saves yet.</p>`}</div></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#saveGameForm").addEventListener("submit",e=>{e.preventDefault();const current=loadSlots();if(current.length>=8)return;const name=$("#saveGameName").value.trim()||`${player().name} ${dateLabel()}`;current.unshift({name,company:player().name,date:dateLabel(),models:player().models.filter(m=>m.released).length,savedAt:Date.now(),data:JSON.parse(JSON.stringify(state))});writeSlots(current);showSaves();toast("Game saved.");});
  $$(".load-slot").forEach(btn=>btn.addEventListener("click",()=>{const slot=loadSlots()[+btn.dataset.slot];if(!slot)return;state=JSON.parse(JSON.stringify(slot.data));migrateState();save();render();$("#sidePanel").classList.add("is-hidden");toast(`Loaded ${slot.name}.`);}));
  $$(".delete-slot").forEach(btn=>btn.addEventListener("click",()=>{const current=loadSlots();current.splice(+btn.dataset.slot,1);writeSlots(current);showSaves();toast("Save deleted.");}));
}

function showSubscriptions(){
  const p=player();
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">MONETIZATION</p><h2>Subscriptions</h2><p class="panel-meta">Offers, model access and advertising determine conversion. Revenue and serving costs settle every quarter.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="panel-section"><h3>Your tiers</h3>${p.subscriptions.map(s=>`<div class="sub-tier expanded"><div><strong>${escapeHtml(s.name)}</strong><p>€${s.price}/month · ${compactNumber(s.members)} members · ${signedNumber(s.memberDelta)} / Q</p><small>${money(s.members*s.price*3/1000000)} quarterly gross</small></div><button class="text-btn delete-tier danger" data-tier="${s.id}">Delete</button><div class="tier-advertise"><span>Advertise for one quarter</span>${Object.entries(AD_CAMPAIGNS).map(([key,ad])=>`<button class="tag advertise-tier" data-tier="${s.id}" data-size="${key}" ${p.campaign||p.insolvent||p.budget<ad.cost?"disabled":""}>${ad.label} · ${money(ad.cost)}</button>`).join("")}</div></div>`).join("")||`<p class="panel-meta">No paid tiers yet.</p>`}</div><div id="tierReassign"></div><div class="panel-section"><h3>Create tier (max 3)</h3><form id="tierForm" class="panel-form"><input id="tierName" maxlength="18" placeholder="Tier name" required><input id="tierPrice" type="number" min="3" max="200" value="19" required><button class="start-btn" ${p.subscriptions.length>=3||p.insolvent?"disabled":""}>Create subscription</button></form></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#tierForm")?.addEventListener("submit",e=>{e.preventDefault();if(p.subscriptions.length>=3)return;const name=$("#tierName").value.trim();const price=+$("#tierPrice").value||19;p.subscriptions.push({id:`tier-${Date.now()}`,name,price,members:0});showSubscriptions();render();toast(`${name} subscription created.`);});
  $$(".advertise-tier").forEach(btn=>btn.addEventListener("click",()=>{const ad=AD_CAMPAIGNS[btn.dataset.size];if(p.campaign||p.insolvent||ad.cost>availableCash(p))return;const repeated=p.lastCampaignSize===btn.dataset.size?(p.campaignRepeat||0)+1:0;p.campaignRepeat=repeated;p.lastCampaignSize=btn.dataset.size;p.campaign={size:btn.dataset.size,tierId:btn.dataset.tier};bookExpense(p,"advertising",ad.cost);notify("player",`${ad.label} subscription campaign begins`,`${money(ad.cost)} committed for ${dateLabel()}. Repeated campaigns have diminishing returns.`);render();showSubscriptions();toast("Advertising campaign launched.");}));
  $$(".delete-tier").forEach(btn=>btn.addEventListener("click",()=>{const tier=p.subscriptions.find(t=>t.id===btn.dataset.tier),affected=p.models.filter(m=>m.tierId===tier.id&&m.access!=="free");if(!affected.length){p.subscriptions=p.subscriptions.filter(t=>t.id!==tier.id);render();showSubscriptions();toast(`${tier.name} deleted.`);return;}const targets=p.subscriptions.filter(t=>t.id!==tier.id);$("#tierReassign").innerHTML=`<div class="reassign-box"><strong>Reassign ${affected.length} attached model${affected.length===1?"":"s"}</strong><p>Choose another subscription or make those models free before deleting ${escapeHtml(tier.name)}.</p><select id="tierReassignTarget"><option value="free">Make affected models free</option>${targets.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("")}</select><button id="confirmTierDelete" class="start-btn">Reassign & delete</button></div>`;enhanceSelect($("#tierReassignTarget"));$("#confirmTierDelete").addEventListener("click",()=>{const target=$("#tierReassignTarget").value;affected.forEach(m=>{if(target==="free"){m.access="free";m.tierId="";m.freeLimit=Math.max(12,m.freeLimit||0);}else m.tierId=target;});p.subscriptions=p.subscriptions.filter(t=>t.id!==tier.id);render();showSubscriptions();toast(`${tier.name} deleted and models reassigned.`);});}));
}

function showInvestments(){
  const p=player(),remaining=3-(p.investmentRequests||0);
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">CAPITAL PARTNERS</p><h2>Investments</h2><p class="panel-meta">You have ${remaining} of 3 lifetime requests left. Every pitch counts, including rejections.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><label class="investment-amount">Requested funding <strong id="investmentAmountLabel">€3.0M</strong><input id="investmentAmount" type="range" min="1" max="10" step=".5" value="3"></label><div class="investor-list">${INVESTORS.map(i=>`<button class="investor-card" data-investor="${i.id}" ${remaining<=0?"disabled":""}><img src="${i.logo}" alt="${i.name} logo"><span><strong>${i.name}</strong><small>${i.label}</small></span><b>Request</b></button>`).join("")}</div><div class="panel-section"><h3>Funding history</h3>${p.investments.length?p.investments.slice().reverse().map(i=>`<div class="panel-model"><div><strong>${escapeHtml(i.investor)}</strong><small>${dateLabel(i.round)} · requested ${money(i.requested)}</small></div><strong>+${money(i.amount)}</strong></div>`).join(""):`<p class="panel-meta">No accepted investments.</p>`}</div>`;
  $("#sidePanel").classList.remove("is-hidden");$("#investmentAmount").addEventListener("input",e=>$("#investmentAmountLabel").textContent=`€${(+e.target.value).toFixed(1)}M`);$$(".investor-card").forEach(btn=>btn.addEventListener("click",()=>{const investor=INVESTORS.find(i=>i.id===btn.dataset.investor),amount=+$("#investmentAmount").value,result=requestCompanyInvestment(p,investor,amount);render();showInvestments();toast(result?.accepted?`${investor.name} offered ${money(result.offer)}.`:`${investor.name} declined the request.`);}));
}

function showRules(){
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">GAME SYSTEM</p><h2>Rules & scoring</h2></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><ul class="rules-list"><li>The race has 16 turns: Q1–Q4 of 2024 through 2027. Q1 2024 is pre-launch.</li><li>Public category importance, audience demand, freshness, class and relative quality determine model users and hype.</li><li>Every released model keeps a small residual audience. Users and subscribers can grow or fall each quarter.</li><li>Casual audiences convert to subscriptions more slowly than coder, business or research-heavy audiences, so broad appeal stays strong without becoming overpowered.</li><li>Free and paid daily messages consume inference budget. Heavy models, high limits and large audiences cost substantially more.</li><li>LITE and FLASH release in one quarter with strict capability caps. PRO is powerful but expensive and has a three-quarter cooldown.</li><li>Old models can move to Lean or Legacy operations to trade reach and limits for lower upkeep.</li><li>Starting with a company’s third consecutive quarter represented in the model top three, it earns +1 streak point each continuing quarter.</li><li>At each Q4 close, company-best models earn 10 / 8 / 6 / 4 / 2 points, portfolio depth adds points, hype earns 5 / 3 / 2 / 1, top total users earn 5 / 3 / 2 / 1, and top subscribers earn 5 / 3 / 2 / 1.</li><li>Each company has three lifetime investment requests. Rejections count, actual chances are hidden and accepted offers may be partial.</li><li>Insolvency occurs only when quarterly spending closes above all income and available cash. The race then continues in observer mode.</li><li>All economy, investment, model and scoring rules apply equally to rivals.</li></ul><button id="resetGame" class="utility-btn danger">Reset this game <span>×</span></button>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#resetGame").addEventListener("click",()=>{if(confirm("Reset the entire race?")){localStorage.removeItem(STORAGE_KEY);location.reload();}});
}

function showNewGame(){
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">START OVER</p><h2>New game</h2></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="new-game-confirm"><div class="company-mark system-mark"><svg><use href="#i-mark"/></svg></div><h3>Begin a new AI race?</h3><p>This permanently replaces the current company, models, subscriptions, budget and leaderboard progress.</p><button id="confirmNewGame" class="start-btn">Start new game <svg><use href="#i-arrow"/></svg></button><button class="text-btn close-panel">Keep current game</button></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  $("#confirmNewGame").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);location.reload();});
}

function showMobileMenu(){
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">GAME CONTROL</p><h2>Menu</h2><p class="panel-meta">Manage the company, its financing and the current run.</p></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="mobile-action-list"><button data-mobile-action="model">New model <span>＋</span></button><button data-mobile-action="market">Market interest <span>→</span></button><button data-mobile-action="research">Research lab <span>→</span></button><button data-mobile-action="subscriptions">Subscriptions <span>→</span></button><button data-mobile-action="investments">Investments <span>→</span></button><button data-mobile-action="saves">Save / load <span>→</span></button><button data-mobile-action="rules">Rules & scoring <span>→</span></button><button data-mobile-action="new">New game <span>＋</span></button></div>`;
  $("#sidePanel").classList.remove("is-hidden");
  const actions={model:()=>{$("#sidePanel").classList.add("is-hidden");openModelBuilder();},market:showAudienceMarket,research:showResearch,subscriptions:showSubscriptions,investments:showInvestments,saves:showSaves,rules:showRules,new:showNewGame};
  $$("[data-mobile-action]").forEach(button=>button.addEventListener("click",()=>actions[button.dataset.mobileAction]?.()));
}

function showBankruptcy(){
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">RUNWAY EXHAUSTED</p><h2>Continue as observer</h2></div></div><div class="bankruptcy-card"><p>Your company’s quarterly spending exceeded all income and available cash. You can no longer fund projects, but the AI race will continue.</p><button id="simulateEnd" class="start-btn">Simulate to Q4 2027 <svg><use href="#i-arrow"/></svg></button><button id="manualObserve" class="utility-btn">Advance manually each quarter <span>→</span></button></div>`;$("#sidePanel").classList.remove("is-hidden");$("#simulateEnd").addEventListener("click",simulateToEnd);$("#manualObserve").addEventListener("click",()=>{state.bankruptcyMode="manual";save();$("#sidePanel").classList.add("is-hidden");toast("Observer mode enabled. Advance each quarter when ready.");});
}
function simulateToEnd(){state.bankruptcyMode="simulated";while(!state.gameOver)advanceMonth(true);render();showEnd();}
function showEnd(){
  const ordered=[...state.companies].sort((a,b)=>b.points-a.points||b.hype-a.hype),models=releasedModels().sort((a,b)=>b.score-a.score),p=player(),pos=ordered.findIndex(c=>c.id==="player")+1,history=[...(p.financeHistory||[]),p.currentLedger||emptyLedger(state.month)],income=history.reduce((s,l)=>s+(l.revenue||0)+(l.investmentIncome||0),0),spending=history.reduce((s,l)=>s+(l.spending||0),0);
  $("#sidePanel").innerHTML=`<div class="panel-top"><div><p class="eyebrow">FINAL REPORT / 2027</p><h2>The era is complete</h2></div><button class="icon-btn close-panel"><svg><use href="#i-close"/></svg></button></div><div class="end-card"><p>${p.insolvent?"FINISHED IN OBSERVER MODE":"FOUR-YEAR ERA COMPLETE"}</p><div class="final-score">#${pos}</div><h2>${escapeHtml(p.name)}</h2><p>${p.points} points · ${compactNumber(p.users)} users · ${compactNumber(p.subscribers)} subscribers</p><p>Champion: ${escapeHtml(ordered[0].name)} with ${ordered[0].points} points.</p></div><div class="final-grid"><div><span>Total income</span><strong>${money(income)}</strong></div><div><span>Total spending</span><strong>${money(spending)}</strong></div><div><span>Investments</span><strong>${money(p.investments.reduce((s,i)=>s+i.amount,0))}</strong></div><div><span>Closing budget</span><strong>${money(p.budget)}</strong></div></div><div class="panel-section"><h3>Your final model positions</h3>${p.models.filter(m=>m.released).sort((a,b)=>b.score-a.score).map(m=>`<div class="panel-model"><div><strong>#${models.findIndex(x=>x.id===m.id)+1} ${escapeHtml(m.name)}</strong><small>${compactNumber(m.activeUsers)} active users · ${m.operatingMode}</small></div><strong>${m.score.toFixed(1)}</strong></div>`).join("")||`<p class="panel-meta">No released models.</p>`}</div><div class="panel-section"><h3>Final company podium</h3>${ordered.slice(0,5).map((c,i)=>`<div class="panel-model"><div><strong>#${i+1} ${escapeHtml(c.name)}</strong><small>${compactNumber(c.users)} users · ${c.models.filter(m=>m.released).length} models</small></div><strong>${c.points} pts</strong></div>`).join("")}</div>`;
  $("#sidePanel").classList.remove("is-hidden");
}

function escapeHtml(s){return String(s??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2400);}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}

function bind(){
  $("#companyLogo").addEventListener("change",async e=>{
    const file=e.target.files[0]; if(!file)return;
    if(file.size>1.5*1024*1024){e.target.value="";$("#logoPreview").innerHTML=`<svg><use href="#i-plus"/></svg>`;toast("Logo must be smaller than 1.5 MB.");return;}
    const data=await fileToDataUrl(file);$("#logoPreview").innerHTML=`<img src="${data}" alt="Logo preview">`;
  });
  $("#setupForm").addEventListener("submit",async e=>{e.preventDefault();const difficulty=new FormData(e.target).get("difficulty"),file=$("#companyLogo").files[0];if(file?.size>1.5*1024*1024){toast("Logo must be smaller than 1.5 MB.");return;}const logo=file?await fileToDataUrl(file):null;state=newGame($("#companyName").value,$("#firstModelName").value,difficulty,logo);render();});
  $("#modelCompanyFilter").addEventListener("change",e=>{modelCompanyFilter=e.target.value;renderModelRanking();});
  $$(".nav-btn[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
  $("#advanceBtn").addEventListener("click",()=>advanceMonth(false)); $("#newModelBtn").addEventListener("click",openModelBuilder);
  $("#modelForm").addEventListener("submit",startPlayerProject); $("#modalBackdrop").addEventListener("click",closeModal); $$(".close-modal").forEach(b=>b.addEventListener("click",closeModal));
  $("#categoryGrid").addEventListener("input",e=>{if(e.target.type==="range"){const i=+e.target.dataset.index;builderValues[i]=+e.target.value;e.target.nextElementSibling.value=e.target.value;updateEstimate();}});
  ["modelAccess","modelTier","freeLimit","proLimit"].forEach(id=>$(`#${id}`).addEventListener("input",updateEstimate));
  $("#modelType").addEventListener("change",applyVersionPreset);$("#modelName").addEventListener("change",applyVersionPreset);
  $("#balanceSliders").addEventListener("click",()=>{builderValues=Array(CATEGORIES.length).fill(clamp(labCeiling()-5,20,80));builderAudienceApplied=false;renderSliders();updateEstimate();});
  $("#audienceFocusBtn").addEventListener("click",applyAudiencePreset);
  document.addEventListener("click",e=>{const target=e.target.closest("[data-company]");if(target&&!target.classList.contains("nav-btn"))showCompany(target.dataset.company);if(e.target.closest(".close-panel"))$("#sidePanel").classList.add("is-hidden");});
  document.addEventListener("click",e=>{if(!e.target.closest(".custom-select"))document.querySelectorAll(".custom-select.open").forEach(x=>{x.classList.remove("open");x.querySelector(".custom-select-trigger").setAttribute("aria-expanded","false")});});
  $("#markReadBtn").addEventListener("click",()=>{state.notifications.forEach(n=>n.unread=false);state.unread=0;render();});
  $("#newGameMenuBtn").addEventListener("click",showNewGame); $("#savesBtn").addEventListener("click",showSaves); $("#audienceBtn").addEventListener("click",showAudienceMarket); $("#researchBtn").addEventListener("click",showResearch); $("#subscriptionsBtn").addEventListener("click",showSubscriptions);$("#investmentsBtn").addEventListener("click",showInvestments); $("#rulesBtn").addEventListener("click",showRules);$("#mobileMenuBtn").addEventListener("click",showMobileMenu);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();$("#sidePanel").classList.add("is-hidden");}});
}

function initializeApp(){bind();localStorage.removeItem("benchmark-hard-mode-entitlement-v1");state=load();if(state){migrateState();render();}else $("#setupScreen").classList.remove("is-hidden");}
initializeApp();
