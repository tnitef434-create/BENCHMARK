export const CLASS_RULES = {
  flagship:{label:"Flagship",build:.72,upkeep:1,popularity:1,hype:18},
  pro:{label:"PRO",build:1.15,upkeep:1.2,popularity:1.08,hype:26},
  light:{label:"LITE",build:.28,upkeep:.5,popularity:.78,hype:9},
  flash:{label:"FLASH",build:.38,upkeep:.65,popularity:.86,hype:13}
};
export const OPERATING_MODES={full:{label:"Full",upkeep:1,reach:1,limits:1},lean:{label:"Lean",upkeep:.6,reach:.93,limits:1},legacy:{label:"Legacy",upkeep:.25,reach:.8,limits:.5}};
export const AD_CAMPAIGNS={small:{label:"Small",cost:.05,boost:8},medium:{label:"Medium",cost:.2,boost:20},large:{label:"Large",cost:.6,boost:38}};
export const FINAL_ROUND=12;
export function canFinishRace(round){return round>=FINAL_ROUND;}
export const INVESTORS=[
  {id:"blackrock",name:"BlackRock",label:"Ultra-selective",base:.05,logo:"assets/investors/blackrock.svg"},
  {id:"berkshire",name:"Berkshire Hathaway",label:"Very selective",base:.07,logo:"assets/investors/berkshire.svg"},
  {id:"softbank",name:"SoftBank",label:"Selective",base:.14,logo:"assets/investors/softbank.svg"},
  {id:"sequoia",name:"Sequoia Capital",label:"Growth-focused",base:.20,logo:"assets/investors/sequoia.svg"},
  {id:"a16z",name:"Andreessen Horowitz",label:"Opportunistic",base:.26,logo:"assets/investors/a16z.svg"}
];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const average=arr=>arr.reduce((a,b)=>a+b,0)/Math.max(1,arr.length);

export function categoryImportance(categories,audiences){
  const raw=Object.fromEntries(categories.map(c=>[c,0]));
  Object.values(audiences).forEach(a=>Object.entries(a.weights).forEach(([c,w])=>{if(c in raw)raw[c]+=a.base*w;}));
  const max=Math.max(...Object.values(raw),1);
  return Object.fromEntries(categories.map(c=>{const value=raw[c]/max;return[c,{value,label:value>=.65?"Core":value>=.35?"Important":"Specialized",dots:value>=.65?3:value>=.35?2:1}]}));
}
export function classCap(type,category,researchCap=100){
  if(type==="light")return Math.min(researchCap,["Speed","Efficiency"].includes(category)?82:62);
  if(type==="flash")return Math.min(researchCap,["Speed","Efficiency","Reliability"].includes(category)?92:68);
  return researchCap;
}
export function developmentTime(type,mode,avg,overreach){
  if(type==="light"||type==="flash")return 1;
  const base=type==="pro"?3:2;
  return clamp(base+(avg>76||overreach>10?1:0)-(mode==="update"?1:0),1,3);
}
export function weakReleaseFactor(score,previousBest){
  if(!previousBest)return 1;
  const ratio=score/previousBest;
  return ratio<.75?.2:ratio<.9?.55:1;
}
export function inferenceCost({users=0,subscribers=0,freeLimit=0,proLimit=0,score=0,type="flagship",mode="full"}){
  const intensity=clamp(score/100,.1,1),perMessage=.0007+Math.pow(intensity,3)*.0073;
  const classMultiplier=type==="light"?.38:type==="flash"?.52:type==="pro"?1.45:1;
  const limitMultiplier=OPERATING_MODES[mode]?.limits||1;
  const freeUsers=Math.max(0,users-subscribers);
  const free=freeUsers*freeLimit*limitMultiplier*90*.25*perMessage*classMultiplier/1e6;
  const paid=subscribers*proLimit*limitMultiplier*90*.27*perMessage*classMultiplier/1e6;
  return {free,paid,total:free+paid,perMessage};
}
export function upkeepCost(score,type="flagship",mode="full",users=0){
  const frontier=Math.pow(Math.max(0,score-58)/42,2.35)*2.15;
  const scaleOverhead=Math.sqrt(Math.max(0,users)/100000)*.12;
  return (.025+score*score*.000012+frontier+scaleOverhead)*(CLASS_RULES[type]?.upkeep||1)*(OPERATING_MODES[mode]?.upkeep||1);
}
export function modelBuildCost({values=[],type="flagship",variance=0,overreach=0,access="hybrid"}){
  const avg=average(values),base=CLASS_RULES[type]?.build??.72;
  const frontier=values.reduce((sum,value)=>sum+5.5*Math.pow(Math.max(0,value-65)/35,3),0);
  const broadIntelligence=Math.pow(Math.max(0,avg-55)/45,2.4)*8;
  const raw=base+frontier+broadIntelligence+avg*avg*.00034+variance*.013+overreach*overreach*.016+(access==="free"?.13:0);
  return raw*(type==="pro"?1.22:1);
}
export function subscriptionConversion({offerScore=0,adBoost=0,repeatedAds=0,audienceFactor=1,priceFactor=1}){
  const diminishing=Math.pow(.75,repeatedAds),effective=offerScore+adBoost*diminishing;
  return clamp((.005+effective*.00115)*audienceFactor*priceFactor,.0015,.12);
}
export function forecastLabel(score){return score<35?"Poor":score<45?"Bad":score<58?"Average":score<70?"Good":score<82?"Great":"Exceptional";}
export function investmentPotential({bestScore=0,projectEstimate=0,hype=0,users=0,subscribers=0}){
  const userScore=clamp(Math.log10(users+1)/7*100,0,100),subHealth=users?clamp(subscribers/users*900,0,100):0;
  return clamp(bestScore*.3+projectEstimate*.2+clamp(hype,0,100)*.15+userScore*.2+subHealth*.15,0,100);
}
export function investmentDecision({investor,amount,metrics,random=Math.random}){
  const potential=investmentPotential(metrics),probability=clamp(investor.base+(potential-50)*.005-(amount-1)*.018,.01,.75);
  if(random()>=probability)return{accepted:false,offer:0,potential};
  const factor=clamp(.35+potential/130+(random()-.5)*.2-.03*amount,.2,1);
  return{accepted:true,offer:Math.max(.1,Math.round(amount*factor*10)/10),potential};
}
export function emptyLedger(round){return{round,subscriptionRevenue:0,investmentIncome:0,inference:0,upkeep:0,development:0,research:0,advertising:0,runwaySavings:0,revenue:0,spending:0,net:0,closing:0};}
export function spendableBudget(budget,hard=false,reserve=.1){return Math.max(0,budget-(hard?0:reserve));}

export function runDeterministicSimulation(seed=1,hard=false){
  let value=seed>>>0;const random=()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296;};
  const companies=Array.from({length:16},(_,id)=>({id,budget:id===15?10:hard?20:10,models:[],users:0,subscribers:0,requests:0,points:0,streak:0,insolvent:false}));
  for(let round=0;round<=FINAL_ROUND;round++)companies.forEach(c=>{
    if(!c.insolvent&&round>0&&(c.models.length===0||random()<.32)){const types=["flagship","pro","light","flash"],type=types[Math.floor(random()*types.length)],score=clamp(35+round*2.5+random()*18,1,99),cost=CLASS_RULES[type].build+score*score*.00034;c.budget-=cost;c.models.push({score,type,users:25,subs:0,freeLimit:type==="pro"?4:18,proLimit:200,mode:"full"});}
    if(c.models.length){const best=Math.max(...c.models.map(m=>m.score)),target=Math.max(c.models.length*25,Math.round((120000+round*30000)*(best/70)*(0.7+random()*.6)));c.users=Math.max(c.models.length*25,Math.round(c.users*.45+target*.55));c.subscribers=Math.round(c.users*subscriptionConversion({offerScore:clamp(best*.75+c.models.length*6,0,100)}));let remaining=c.users;c.models.forEach((m,i)=>{m.users=i===c.models.length-1?Math.max(25,remaining):Math.max(25,Math.round(c.users/c.models.length));remaining-=m.users;m.subs=Math.round(c.subscribers*m.users/c.users);const compute=inferenceCost({users:m.users,subscribers:m.subs,freeLimit:m.freeLimit,proLimit:m.proLimit,score:m.score,type:m.type,mode:m.mode});c.budget+=m.subs*19*3/1e6-compute.total-upkeepCost(m.score,m.type,m.mode);});}
    if(c.budget<2&&c.requests<3){c.requests++;const result=investmentDecision({investor:INVESTORS[Math.floor(random()*INVESTORS.length)],amount:3,metrics:{bestScore:Math.max(0,...c.models.map(m=>m.score)),projectEstimate:0,hype:20,users:c.users,subscribers:c.subscribers},random});c.budget+=result.offer;}
    if(hard&&c.budget<0)c.insolvent=true;
    if(!hard&&c.budget<.1)c.budget=.1;
  });
  return{rounds:FINAL_ROUND+1,companies};
}
