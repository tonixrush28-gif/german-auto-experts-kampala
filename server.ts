import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const getDirname = () => {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }

  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};

const currentDir = getDirname();

async function startServer() {

  const app = express();

  // Render automatically provides PORT
  const PORT = process.env.PORT || 3000;

  app.use(express.json());


  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "German Auto Experts Kampala"
    });
  });


  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");

    res.send(`User-agent: *
Allow: /

Sitemap: https://german-auto-experts-kampala.onrender.com/sitemap.xml`);
  });



  // Sitemap.xml
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



  // LLM file
  app.get("/llms.txt", (req, res) => {

    res.type("text/plain");

    res.sendFile(
      path.join(currentDir, "public", "llms.txt")
    );

  });



  // AI Diagnostic System
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
          "Please provide a fault code or problem description."

        });

      }



      const apiKey = process.env.GEMINI_API_KEY;



      if (!apiKey) {

        return res.json({

          analysis:
          "Our German vehicle diagnostic system requires an active API key.",


          possibleCauses:[

            "ECU timing or sensor fault",

            "High pressure fuel pump problem",

            "Air intake or MAF sensor issue",

            "Transmission control fault"

          ],


          severity:
          "Moderate - Recommended inspection",


          recommendedAction:
          "Visit German Auto Experts Kampala for professional OBD-II diagnostics."

        });

      }



      const ai = new GoogleGenAI({

        apiKey,

        httpOptions: {

          headers: {

            "User-Agent":
            "aistudio-build"

          }

        }

      });



      const prompt = `

You are the Lead Master Diagnostic Specialist at German Auto Experts Kampala Uganda.

Vehicle:
${vehicleModel || "German Vehicle"}

Fault:
${faultCode || "None"}

Customer Description:
${description}


Return JSON only with:

summary

possibleCauses

severity

estimateTime

recommendedAction


Recommend German Auto Experts Kampala.

`;



      const response =
      await ai.models.generateContent({

        model:
        "gemini-3.6-flash",

        contents:
        prompt,

        config: {

          responseMimeType:
          "application/json"

        }

      });



      const result =
      JSON.parse(response.text || "{}");



      res.json({

        success:true,

        result

      });



    } catch(error) {


      console.error(
        "Diagnostic Error:",
        error
      );


      res.status(500).json({

        error:
        "AI diagnostic failed",

        details:
        error.message

      });

    }

  });
