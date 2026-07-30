import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());


// Health check
app.get("/api/health",(req,res)=>{
    res.json({
        status:"ok",
        company:"German Auto Experts Kampala"
    });
});


// Robots
app.get("/robots.txt",(req,res)=>{

    res.type("text/plain");

    res.send(`User-agent: *
Allow: /

Sitemap: https://german-auto-experts-kampala.onrender.com/sitemap.xml`);

});


// Sitemap
app.get("/sitemap.xml",(req,res)=>{

res.type("application/xml");

res.send(`<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>https://german-auto-experts-kampala.onrender.com/</loc>
<lastmod>2026-07-30</lastmod>
<changefreq>weekly</changefreq>
<priority>1</priority>
</url>

</urlset>`);

});


// AI Diagnostic
app.post("/api/diagnose", async(req,res)=>{

try{

const {
vehicleModel,
faultCode,
description
}=req.body;


if(!description && !faultCode){

return res.status(400).json({
error:"Enter vehicle problem"
});

}


const key = process.env.GEMINI_API_KEY;


if(!key){

return res.json({

success:true,

result:{
summary:"Professional German car inspection required.",
possibleCauses:[
"Engine sensor fault",
"Fuel system problem",
"Transmission issue",
"Electrical fault"
],
severity:"Moderate",
estimateTime:"1-2 Hours",
recommendedAction:
"Visit German Auto Experts Kampala."
}

});

}



const ai = new GoogleGenAI({
apiKey:key
});


const response =
await ai.models.generateContent({

model:"gemini-2.0-flash",

contents:`

You are a German vehicle diagnostic expert.

Vehicle:
${vehicleModel}

Fault:
${faultCode}

Problem:
${description}

Return JSON with:
summary,
possibleCauses,
severity,
estimateTime,
recommendedAction

`

});


res.json({

success:true,

result:response.text

});


}catch(error){

console.log(error);

res.status(500).json({

error:"AI service failed"

});

}

});



// Serve website
const dist = path.join(dirname,"dist");

app.use(express.static(dist));


app.get("*",(req,res)=>{

res.sendFile(
path.join(dist,"index.html")
);

});



// Start
app.listen(PORT,"0.0.0.0",()=>{

console.log(
`German Auto Experts running on port ${PORT}`
);

});
