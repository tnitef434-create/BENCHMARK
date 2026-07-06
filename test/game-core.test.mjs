import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AD_CAMPAIGNS,FINAL_ROUND,INVESTORS,annualPerformancePenalty,canFinishRace,classCap,developmentTime,emptyLedger,forecastLabel,growthOperationsCost,inferenceCost,investmentDecision,launchPlacementHype,modelBuildCost,newsCoverageChance,newsImpact,reconcileModelAccess,runDeterministicSimulation,spendableBudget,subscriptionConversion,upkeepCost,weakReleaseFactor} from "../public/game-core.js";

test("Lite and Flash have strict capability caps and one-quarter builds",()=>{
  assert.equal(classCap("light","Reasoning",100),62);assert.equal(classCap("light","Speed",100),82);
  assert.equal(classCap("flash","Coding",100),68);assert.equal(classCap("flash","Reliability",100),92);
  assert.equal(developmentTime("light","new",90,30),1);assert.equal(developmentTime("flash","new",90,30),1);
});
test("free serving cost grows with users, limits and model weight",()=>{
  const small=inferenceCost({users:10000,freeLimit:5,score:40,type:"light"}).total;
  const heavy=inferenceCost({users:1000000,freeLimit:40,score:90,type:"pro"}).total;
  assert.ok(heavy>small*1000);assert.ok(heavy>1);
});
test("offers and ads improve subscriber conversion with diminishing returns",()=>{
  const base=subscriptionConversion({offerScore:45}),large=subscriptionConversion({offerScore:75,adBoost:AD_CAMPAIGNS.large.boost}),repeat=subscriptionConversion({offerScore:75,adBoost:AD_CAMPAIGNS.large.boost,repeatedAds:3});
  assert.ok(large>base);assert.ok(repeat<large);
});
test("frontier models carry major build and quarterly operating costs",()=>{
  const ordinary=modelBuildCost({values:Array(25).fill(55),type:"flagship"});
  const smart=modelBuildCost({values:Array(25).fill(85),type:"pro"});
  const extreme=modelBuildCost({values:Array(25).fill(100),type:"pro"});
  assert.ok(smart>ordinary*8);assert.ok(extreme>smart*3);assert.ok(extreme>100);
  assert.ok(upkeepCost(92,"pro","full",5000000)>upkeepCost(55,"flagship","full",100000)*10);
});
test("large PRO subscriber usage consumes a meaningful share of revenue",()=>{
  const quarterlyRevenue=1000000*19*3/1e6;
  const serving=inferenceCost({users:1200000,subscribers:1000000,freeLimit:10,proLimit:200,score:90,type:"pro"}).total;
  assert.ok(serving>quarterlyRevenue*.55);
});
test("launch placement rewards are strong but tiered",()=>{
  assert.equal(launchPlacementHype(1),24);assert.equal(launchPlacementHype(2),15);assert.equal(launchPlacementHype(3),15);assert.equal(launchPlacementHype(4),8);assert.equal(launchPlacementHype(5),8);assert.equal(launchPlacementHype(6),0);
});
test("growth operations progressively constrain runaway companies",()=>{
  const small=growthOperationsCost({users:100000,subscribers:5000,revenue:.4,budget:8});
  const leader=growthOperationsCost({users:8000000,subscribers:900000,revenue:30,budget:55});
  assert.ok(leader>small*30);assert.ok(leader>10);
});
test("better launches earn more coverage and top news creates dynamic growth",()=>{
  const weak=newsCoverageChance({score:45,debutRank:12,type:"light"}),breakout=newsCoverageChance({score:90,debutRank:1,type:"pro"});assert.ok(breakout>weak*3);assert.ok(breakout<=.96);
  const third=newsImpact({views:1000000,articleRank:3,score:80,existingConversion:.03}),first=newsImpact({views:1000000,articleRank:1,score:80,existingConversion:.03});assert.ok(first.hype>third.hype);assert.ok(first.users>third.users);assert.ok(first.subscribers>third.subscribers);
});
test("point losses target only severe hype and stagnation failures",()=>{
  assert.deepEqual(annualPerformancePenalty({hype:5,bottomRank:1,quartersSinceLaunch:6,hasModels:true}),{lowHype:2,stagnation:1,total:3});
  assert.equal(annualPerformancePenalty({hype:30,bottomRank:8,quartersSinceLaunch:2,hasModels:true}).total,0);
});
test("subscription-only models cannot report non-subscribers as active users",()=>{
  const paid={access:"paid",activeUsers:400000,userDelta:399000,paidUsers:0},free={access:"free",activeUsers:250000,userDelta:200000,paidUsers:0};const subscribers=reconcileModelAccess([paid,free],1000);assert.equal(subscribers,1000);assert.equal(paid.activeUsers,1000);assert.equal(paid.paidUsers,1000);assert.equal(free.activeUsers,250000);assert.equal(free.paidUsers,0);
});
test("very expensive subscriptions convert much worse",()=>{
  const normal=subscriptionConversion({offerScore:70,priceFactor:1});
  const pricey=subscriptionConversion({offerScore:70,priceFactor:.44});
  const extreme=subscriptionConversion({offerScore:70,priceFactor:.12});
  assert.ok(pricey<normal*.6);assert.ok(extreme<pricey*.4);
});
test("weak releases are strongly suppressed",()=>{assert.equal(weakReleaseFactor(89,100),.55);assert.equal(weakReleaseFactor(74,100),.2);assert.equal(weakReleaseFactor(95,100),1);});
test("investment can reject or return a partial offer",()=>{
  const rejected=investmentDecision({investor:INVESTORS[0],amount:10,metrics:{},random:()=>.99});assert.equal(rejected.accepted,false);
  let calls=0;const accepted=investmentDecision({investor:INVESTORS[4],amount:10,metrics:{bestScore:95,projectEstimate:90,hype:80,users:5000000,subscribers:400000},random:()=>calls++===0?0:.5});assert.equal(accepted.accepted,true);assert.ok(accepted.offer>0&&accepted.offer<=10);
});
test("forecast bands and ledger defaults are stable",()=>{assert.equal(forecastLabel(30),"Poor");assert.equal(forecastLabel(85),"Exceptional");assert.deepEqual(emptyLedger(4).round,4);});
test("Standard protects a runway while Hard exposes every euro",()=>{assert.equal(spendableBudget(10,false),9.9);assert.equal(spendableBudget(.1,false),0);assert.equal(spendableBudget(.1,true),.1);});
test("race runs from Q1 2020 and cannot finish before Q1 2027",()=>{assert.equal(FINAL_ROUND,28);assert.equal(canFinishRace(27),false);assert.equal(canFinishRace(28),true);});
test("all roster sizes finish cleanly across Standard and Hard seeds",()=>{for(const hard of [false,true])for(const rivals of [1,3,5,15])for(let seed=1;seed<=25;seed++){const result=runDeterministicSimulation(seed,hard,rivals);assert.equal(result.rounds,29);assert.equal(result.companies.length,rivals+1);result.companies.forEach(c=>{assert.ok(Number.isFinite(c.budget));if(!hard)assert.ok(c.budget>=.1);assert.ok(c.requests<=3);if(c.models.length){assert.ok(c.users>=c.models.length*25);assert.ok(c.models.every(m=>m.users>=25));}});}});
test("app contains variable rosters, v6 migration, transparent scoring, dynamic families, gated inbox, news variety, observer endings and no payment code",()=>{const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8"),html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8"),newsBlock=app.match(/const NEWS_TEMPLATES\s*=\s*\[([\s\S]*?)\n\];/)[1];assert.match(app,/CURRENT_SAVE_VERSION\s*=\s*6|version:\s*6/);assert.match(app,/const BASE_YEAR\s*=\s*2020/);assert.match(app,/function randomRivalRoster/);assert.match(html,/name="rivalCount" value="1"/);assert.match(html,/name="rivalCount" value="15"/);assert.doesNotMatch(html,/Q2 2024|yearLabel">2024/);assert.match(app,/function quarterGateStatus/);assert.match(app,/if\(!auto\).*quarterGateStatus/);assert.match(app,/function nextRivalFamily/);assert.match(app,/familyReputations/);assert.match(app,/pointBreakdown/);assert.match(app,/top1Streak>=2/);assert.match(app,/function showBankruptcy/);assert.match(app,/function simulateToEnd/);assert.match(app,/function awardTopThreeStreaks/);assert.match(app,/function generateQuarterlyNews/);assert.equal((newsBlock.match(/^  \["/gm)||[]).length,20);assert.match(html,/class="points-guide"/);assert.match(html,/value="new-family"/);assert.match(html,/id="newsView"/);assert.match(html,/id="inboxView"/);assert.match(html,/id="setupScreen" class="setup-screen is-hidden"/);assert.match(app,/else \$\("#setupScreen"\)\.classList\.remove\("is-hidden"\)/);assert.doesNotMatch(app+html,/Paddle|hard-mode\/verify|Unlock Hard Mode/);});
