import express from "express";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const app=express();
const port=Number(process.env.PORT||4173);
const environment=process.env.PADDLE_ENVIRONMENT==="production"?"production":"sandbox";
const apiKey=process.env.PADDLE_API_KEY;
const clientToken=process.env.PADDLE_CLIENT_TOKEN;
const priceId=process.env.PADDLE_PRICE_ID;
const webhookSecret=process.env.PADDLE_WEBHOOK_SECRET;
const signingSecret=process.env.ENTITLEMENT_SECRET;
const paddle=apiKey?new Paddle(apiKey,{environment:environment==="sandbox"?Environment.sandbox:Environment.production}):null;
const root=path.dirname(fileURLToPath(import.meta.url));

function paymentReady(){return Boolean(paddle&&clientToken&&priceId&&signingSecret);}
function signEntitlement(transactionId){
  const payload=Buffer.from(JSON.stringify({product:"hard_mode",transactionId,issuedAt:Date.now()})).toString("base64url");
  const signature=crypto.createHmac("sha256",signingSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
function verifyEntitlement(token){
  if(!signingSecret||typeof token!=="string"||!token.includes("."))return false;
  const [payload,signature]=token.split(".");
  const expected=crypto.createHmac("sha256",signingSecret).update(payload).digest();
  let supplied;try{supplied=Buffer.from(signature,"base64url");}catch{return false;}
  if(expected.length!==supplied.length||!crypto.timingSafeEqual(expected,supplied))return false;
  try{return JSON.parse(Buffer.from(payload,"base64url").toString()).product==="hard_mode";}catch{return false;}
}
function isHardModeTransaction(transaction){
  const hasPrice=transaction.items?.some(item=>item.price?.id===priceId&&item.quantity===1);
  return ["paid","completed"].includes(transaction.status)&&hasPrice&&transaction.customData?.entitlement==="hard_mode";
}

app.post("/api/paddle/webhook",express.raw({type:"application/json"}),async(req,res)=>{
  if(!paddle||!webhookSecret)return res.status(503).send("Paddle webhook is not configured");
  try{
    const event=await paddle.webhooks.unmarshal(req.body.toString(),webhookSecret,req.headers["paddle-signature"]||"");
    if(event.eventType===EventName.TransactionCompleted&&isHardModeTransaction(event.data))console.log(`Verified Hard Mode purchase ${event.data.id}`);
    res.status(200).send("ok");
  }catch{res.status(400).send("invalid signature");}
});

app.use(express.json({limit:"20kb"}));
app.get("/api/hard-mode/config",(_req,res)=>{
  if(!paymentReady())return res.status(503).json({error:"Paddle payments are not configured on this server."});
  res.json({clientToken,priceId,environment});
});
app.post("/api/hard-mode/verify",async(req,res)=>{
  if(!paymentReady())return res.status(503).json({error:"Paddle payments are not configured on this server."});
  const transactionId=req.body?.transactionId;
  if(typeof transactionId!=="string"||!/^txn_[a-z\d]{26}$/.test(transactionId))return res.status(400).json({error:"Invalid Paddle transaction."});
  try{
    const transaction=await paddle.transactions.get(transactionId);
    if(!isHardModeTransaction(transaction))return res.status(402).json({error:"Hard Mode payment has not been completed."});
    res.json({token:signEntitlement(transaction.id)});
  }catch(error){console.error("Paddle verification error:",error.message);res.status(400).json({error:"Could not verify this Paddle purchase."});}
});
app.post("/api/hard-mode/entitlement",(req,res)=>res.json({valid:verifyEntitlement(req.body?.token)}));

app.use(express.static(root));
app.listen(port,"127.0.0.1",()=>console.log(`BENCHMARK running at http://127.0.0.1:${port} (${environment})`));
