import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AD_CAMPAIGNS,FINAL_ROUND,INVESTORS,canFinishRace,classCap,developmentTime,emptyLedger,forecastLabel,inferenceCost,investmentDecision,runDeterministicSimulation,spendableBudget,subscriptionConversion,weakReleaseFactor} from "../public/game-core.js";

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
test("weak releases are strongly suppressed",()=>{assert.equal(weakReleaseFactor(89,100),.55);assert.equal(weakReleaseFactor(74,100),.2);assert.equal(weakReleaseFactor(95,100),1);});
test("investment can reject or return a partial offer",()=>{
  const rejected=investmentDecision({investor:INVESTORS[0],amount:10,metrics:{},random:()=>.99});assert.equal(rejected.accepted,false);
  let calls=0;const accepted=investmentDecision({investor:INVESTORS[4],amount:10,metrics:{bestScore:95,projectEstimate:90,hype:80,users:5000000,subscribers:400000},random:()=>calls++===0?0:.5});assert.equal(accepted.accepted,true);assert.ok(accepted.offer>0&&accepted.offer<=10);
});
test("forecast bands and ledger defaults are stable",()=>{assert.equal(forecastLabel(30),"Poor");assert.equal(forecastLabel(85),"Exceptional");assert.deepEqual(emptyLedger(4).round,4);});
test("Standard protects a runway while Hard exposes every euro",()=>{assert.equal(spendableBudget(10,false),9.9);assert.equal(spendableBudget(.1,false),0);assert.equal(spendableBudget(.1,true),.1);});
test("race cannot finish before Q1 2027",()=>{assert.equal(FINAL_ROUND,12);assert.equal(canFinishRace(11),false);assert.equal(canFinishRace(12),true);});
test("100 seeded Standard and Hard simulations always finish cleanly",()=>{for(const hard of [false,true])for(let seed=1;seed<=100;seed++){const result=runDeterministicSimulation(seed,hard);assert.equal(result.rounds,13);assert.equal(result.companies.length,16);result.companies.forEach(c=>{assert.ok(Number.isFinite(c.budget));if(!hard)assert.ok(c.budget>=.1);assert.ok(c.requests<=3);if(c.models.length){assert.ok(c.users>=c.models.length*25);assert.ok(c.models.every(m=>m.users>=25));}});}});
test("app contains v5 migration, observer endings and no payment code",()=>{const app=readFileSync(new URL("../public/app.js",import.meta.url),"utf8"),html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");assert.match(app,/CURRENT_SAVE_VERSION\s*=\s*5|version:\s*5/);assert.match(app,/function showBankruptcy/);assert.match(app,/function simulateToEnd/);assert.match(app,/function awardTopThreeStreaks/);assert.match(html,/id="setupScreen" class="setup-screen is-hidden"/);assert.match(app,/else \$\("#setupScreen"\)\.classList\.remove\("is-hidden"\)/);assert.doesNotMatch(app+html,/Paddle|hard-mode\/verify|Unlock Hard Mode/);});
