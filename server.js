import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());


// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "German Auto Experts Kampala"
  });
});


// Robots
app.get("/robots.txt", (req, res) => {

  res.type("text/plain");

  res.send(`User-agent: *
Allow: /

Sitemap: https://german-auto-experts-kampala.onrender.com/sitemap.xml`);

});


// Sitemap
app.get("/sitemap.xml", (req, res) => {

  res.type("application/xml");

  res.send(`<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

<url>
<loc>https://german-auto-experts-kampala.onrender.com/</loc>
<lastmod>2026-07-30</lastmod>
<changefreq>weekly</changefreq>
<priority>1.0</priority>
</url>

</urlset>`);

});



// AI Diagnostic API
app.post("/api/diagnose", async (req, res) => {

  try {

    const {
      vehicleModel,
      faultCode,
      description
    } = req.body;


    if (!description && !faultCode) {

      return res.status(400).json({

        error:
        "Enter vehicle problem or fault code"

      });

    }


    const apiKey = process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return res.json({

        success:true,

        result:{

          summary:
          "Professional German vehicle inspection required.",

          possibleCauses:[

            "Engine sensor fault",

            "Fuel system issue",

            "Transmission problem",

            "Electrical fault"

          ],

          severity:
          "Moderate",

          estimateTime:
          "1-2 Hours",

          recommendedAction:
          "Visit German Auto Experts Kampala for diagnosis."

        }

      });

    }



    const ai = new GoogleGenAI({

      apiKey: apiKey

    });



    const prompt = `

You are a German car diagnostic expert.

Garage:
German Auto Experts Kampala Uganda.

Vehicle:
${vehicleModel || "German Vehicle"}

Fault:
${faultCode || "No code"}

Customer problem:
${description}


Return JSON:

{
"summary":"",
"possibleCauses":[],
"severity":"",
"estimateTime":"",
"recommendedAction":""
}

`;



    const response =
    await ai.models.generateContent({

      model:"gemini-2.0-flash",

      contents:prompt

    });



    let result;


    try {

      result = JSON.parse(response.text);

    } catch {

      result = {

        summary: response.text

      };

    }



    res.json({

      success:true,

      result

    });



  } catch(error) {


    console.error(error);


    res.status(500).json({

      error:
      "Diagnostic service failed",

      details:
      error.message

    });


  }

});




// Production static files
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));


// React/Vite fallback
app.get("*", (req,res)=>{

  res.sendFile(
    path.join(distPath,"index.html")
  );

});



// Start server
app.listen(PORT,"0.0.0.0",()=>{

 console.log(
  `German Auto Experts server running on port ${PORT}`
 );

});
