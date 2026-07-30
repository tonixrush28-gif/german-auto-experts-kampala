import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    company: "German Auto Experts Kampala",
    website: "https://german-auto-experts-kampala.onrender.com/",
    timestamp: new Date().toISOString()
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
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// AI Diagnostic route
app.post("/api/diagnose", async (req, res) => {
  try {
    const { vehicleBrand, vehicleModel, year, faultCode, description } = req.body;

    if (!description && !faultCode) {
      return res.status(400).json({
        error: "Please enter a vehicle fault code or symptom description."
      });
    }

    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      // Fallback expert diagnostic payload
      return res.json({
        success: true,
        result: {
          summary: `Professional inspection recommended for ${vehicleBrand || 'German vehicle'} ${vehicleModel || ''}.`,
          possibleCauses: [
            `ECU / Sensor calibration drift (${faultCode || 'Generic Fault'})`,
            "Air intake or turbocharger boost leak",
            "High-pressure fuel pump (HPFP) pressure fluctuation",
            "Bus line / SAM module electrical contact resistance"
          ],
          severity: "Moderate to High",
          estimateTime: "1 - 2 Hours Diagnostic",
          recommendedAction: "Schedule Star/ICOM computer scan at German Auto Experts Mengo Garage, Kampala.",
          requiredPartsEstimate: ["OEM Replacement Sensor/Valve", "German Diagnostic Scan"],
          note: "Our Mengo garage is equipped with dealer-level diagnostic scanners (Mercedes Star Diagnosis, BMW ICOM NEXT, VAG ODIS, Porsche PIWIS)."
        }
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `
You are a senior master mechanical and electrical engineer at "German Auto Experts Kampala" in Mengo, Kampala, Uganda.
Analyze the following German vehicle problem and return ONLY a clean JSON object with expert repair insights.

Vehicle Details:
- Brand: ${vehicleBrand || 'German Vehicle'}
- Model: ${vehicleModel || 'N/A'}
- Year: ${year || 'N/A'}
- OBD-II Fault Code: ${faultCode || 'None provided'}
- Symptom Description: ${description}

Respond strictly in JSON matching this schema:
{
  "summary": "Clear, technical master-mechanic summary of the issue",
  "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "severity": "Low | Moderate | High | Critical",
  "estimateTime": "Estimated workshop repair/diagnostic time (e.g. 2-3 Hours)",
  "recommendedAction": "Actionable repair step at Mengo Workshop",
  "requiredPartsEstimate": ["Part 1", "Part 2"],
  "note": "Special advice tailored for African road conditions, fuel quality, or German ECU quirks"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let resultObj;
    try {
      resultObj = JSON.parse(response.text || "{}");
    } catch {
      resultObj = {
        summary: response.text,
        possibleCauses: ["Diagnostic scan required"],
        severity: "Moderate",
        estimateTime: "1-2 Hours",
        recommendedAction: "Bring vehicle to German Auto Experts Mengo Garage."
      };
    }

    return res.json({
      success: true,
      result: resultObj
    });
  } catch (error: any) {
    console.error("Diagnostic error:", error);
    return res.status(500).json({
      error: "Unable to process AI diagnostic request right now.",
      details: error?.message
    });
  }
});

async function startServer() {
  // Serve frontend static or Vite dev middleware
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
    console.log(`German Auto Experts Kampala server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
