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
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "German Auto Experts Kampala" });
  });

  // SEO: robots.txt and sitemap.xml endpoints
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\n\nSitemap: https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/sitemap.xml`);
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#about</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#services</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#cars</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#gallery</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#experts</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#parts</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#diagnostics</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ais-pre-dcvpqkws2jn6b7tf26zu2m-243186199812.europe-west2.run.app/#contact</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  });

  app.get("/llms.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile(path.join(currentDir, "public", "llms.txt"));
  });

  // AI Diagnostic Advisor using Gemini 3.6 Flash on the server
  app.post("/api/diagnose", async (req, res) => {
    try {
      const { vehicleModel, faultCode, description } = req.body;

      if (!description && !faultCode) {
        return res.status(400).json({ error: "Please provide a fault code or problem description." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          analysis: "Our master German vehicle diagnostic tools and AI advisor require active API keys. Based on standard German vehicle engineering parameters:",
          possibleCauses: [
            "ECU / Camshaft Sensor Timing variance (P0011 / P0014)",
            "High-Pressure Fuel Pump (HPFP) pressure drop",
            "Air intake leak or Mass Air Flow sensor contamination",
            "Automatic transmission solenoid valve friction"
          ],
          severity: "Moderate - Recommended to schedule an inspection at German Auto Experts Kampala",
          recommendedAction: "Bring your vehicle to our Kampala master garage for state-of-the-art OBD-II / XENTRY / ISTA diagnostic scan."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are the Lead Master Diagnostic Specialist at 'German Auto Experts Kampala' (Uganda's premier German car service center).
Vehicle Model: ${vehicleModel || "German Vehicle (Mercedes-Benz/BMW/Audi/Porsche/VW/Land Rover)"}
Fault Code / Symptom: ${faultCode || "N/A"}
Customer Description: ${description}

Provide a concise, highly professional diagnostic breakdown formatted strictly in valid JSON with these keys:
- summary: A clear 2-sentence expert explanation of what is likely happening.
- possibleCauses: An array of 3-4 specific technical causes typical for German cars (e.g., M274 oil gear rattle, N20 timing chain guide wear, EA888 carbon buildup, PDK clutch adaptation).
- severity: One of ["Critical - Stop Driving", "High - Urgent Repair Required", "Moderate - Schedule Service Soon", "Low - Minor Inspection Needed"]
- estimateTime: Estimated diagnostic/repair duration (e.g., "1 - 2 Hours Diagnostic", "1 Day Engine Repair")
- recommendedAction: Professional recommendation advising the customer to bring the vehicle to German Auto Experts Kampala on +256 707 989 994.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const diagnosticData = JSON.parse(text);
      return res.json({ success: true, result: diagnosticData });
    } catch (err: any) {
      console.error("Diagnostic error:", err);
      return res.status(500).json({
        error: "Failed to run AI diagnostic scanner",
        details: err.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
