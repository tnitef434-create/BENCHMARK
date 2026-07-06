import express from "express";
import path from "node:path";
import {fileURLToPath} from "node:url";

const app=express(),port=Number(process.env.PORT||4173),root=path.join(path.dirname(fileURLToPath(import.meta.url)),"public");
app.use(express.static(root));
app.listen(port,"127.0.0.1",()=>console.log(`BENCHMARK running at http://127.0.0.1:${port}`));
