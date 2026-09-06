import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const GEMINI_MODEL = "models/gemini-3.5-flash-lite";

app.use(express.json({ limit: "10mb" }));

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({ apiKey });
}

// Normalize model outputs so frontend sees a stable shape
function normalizeModelReport(parsed: any) {
  const makeReport = (p: any) => {
    if (!p || typeof p !== "object") return p;
    const company = p.company || p.name || p.studioName || "";
    const companyFit = Number(p.companyFitScore ?? p.companyFit ?? p.overallFitScore ?? 0);
    const roleFit = Number(p.roleFitScore ?? 0);
    const decision = p.decisionOwnership || p.decisionOwnership || {};

    const philosophySummary =
      p.philosophyAlignment?.summary ?? p.whyItFitsKylie ?? p.corePhilosophy ?? "";
    const philosophyScore = Number(p.philosophyAlignment?.score ?? companyFit ?? 0);

    return {
      // fields the frontend expects
      studioName: company,
      companyFitScore: companyFit,
      roleFitScore: roleFit,
      overallFitScore: companyFit,
      hiringStatus: p.hiringStatus ?? "spontaneous_outreach",
      cvTrackRecommendation: p.recommendedCV ?? p.recommendedCVTrack ?? "Hybrid",
      philosophyAlignment: {
        score: philosophyScore,
        summary: philosophySummary,
      },
      decisionOwnershipLevel: decision.level ?? p.decisionOwnershipLevel ?? decision.name ?? null,
      decisionOwnership: decision,
      careerEngineMapping: p.careerEngine ?? p.careerEngineMapping ?? {},
      alignmentSignals: p.positiveSignals ?? p.alignmentSignals ?? [],
      negativeSignals: p.negativeSignals ?? [],
      ecosystemClassification: p.ecosystem ?? p.ecosystemClassification ?? "",
      outreachTalkingPoints: p.coldOutreachAngle ? [p.coldOutreachAngle] : p.outreachPitchAngle ? [p.outreachPitchAngle] : p.outreachTalkingPoints ?? [],
      outreachTalkingPointsRaw: p.outreachTalkingPoints ?? null,
      outreachDraft: p, // keep original for debugging
      _raw: p,
    };
  };

  if (Array.isArray(parsed)) {
    return parsed.map(makeReport);
  }
  return makeReport(parsed);
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Cognitive Career Radar API" });
});

// Minimum meaningful body characters required to treat a crawled page as evaluable.
// Below this threshold the page is likely a JS-rendered shell or bot-blocked, and we refuse
// to fabricate a report instead of silently producing identical templated output.
const MIN_USEFUL_CONTENT_CHARS = 300;

// Helper: Fetch and extract clean text from a live studio/job URL
async function fetchUrlContent(rawUrl: string): Promise<{ title: string; text: string; contentLength?: number; error?: string }> {
  try {
    let targetUrl = rawUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { title: "", text: "", error: `HTTP ${response.status} ${response.statusText}` };
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    // Extract meta description
    const metaDescMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
    );
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";

    // Strip scripts, styles, navs, svgs, comments
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

    const maxChars = 7500;
    const truncated =
      cleaned.length > maxChars ? cleaned.substring(0, maxChars) + " ...[truncated]" : cleaned;

    return {
      title,
      contentLength: cleaned.length,
      text: `Page Title: ${title}\nMeta Description: ${metaDesc}\nExtracted Page Content:\n${truncated}`,
    };
  } catch (err: any) {
    console.warn(`Could not crawl URL ${rawUrl}:`, err.message);
    return { title: "", text: "", error: err.message };
  }
}

// Single Opportunity / Studio Diagnostic Evaluator
app.post("/api/evaluate-single", async (req, res) => {
  try {
    const { content, url, targetName } = req.body;
    if (!content && !url) {
      return res.status(400).json({ error: "Either content (JD/text) or website URL is required." });
    }

    let crawledContent = "";
    let extractedTitle = "";
    let crawlWarning: string | null = null;

    // If a URL is provided, actively fetch the live website content
    const hasUserProvidedText = content && typeof content === "string" && content.trim().length > 0;
    if (url && typeof url === "string" && url.trim().length > 0) {
      const crawlResult = await fetchUrlContent(url);

      // Refuse to fabricate: when the crawl is the SOLE source of input and it returned
      // nothing useful, tell the user directly instead of letting the model invent a report.
      if (!hasUserProvidedText) {
        if (crawlResult.error) {
          return res.status(422).json({
            code: "CONTENT_EXTRACTION_FAILED",
            error: `We could not extract content from this URL (${crawlResult.error}). The site likely blocked our request. Paste its About / role text into the description field instead.`,
          });
        }
        if ((crawlResult.contentLength ?? 0) < MIN_USEFUL_CONTENT_CHARS) {
          return res.status(422).json({
            code: "CONTENT_EXTRACTION_FAILED",
            error:
              "This page renders its content with JavaScript (or returns no meaningful body text), so we could not extract enough information to evaluate it honestly. Paste its About / role text into the description field instead.",
          });
        }
      }

      if (crawlResult.text) {
        crawledContent = crawlResult.text;
        extractedTitle = crawlResult.title;
        if ((crawlResult.contentLength ?? 0) < MIN_USEFUL_CONTENT_CHARS) {
          crawlWarning =
            "Crawled website content was too thin to evaluate on its own; base the analysis primarily on the provided description text.";
        }
      } else if (crawlResult.error) {
        crawlWarning = `Website crawl failed (${crawlResult.error}); the evaluation is based only on the provided text.`;
      }
    }

    const ai = getGenAI();

    const effectiveTargetName =
      targetName || extractedTitle || (url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "Unknown Target");

    const prompt = `
You are the career evaluation agent for Kylie Bi, strictly executing the rules from KYLIE_JOB_AGENT_PROTOCOL_v1.0.md, KYLIE_JOB_FILTER_SPEC_v1.0.yaml, and KYLIE_CAREER_DNA_v1.0.md.

KYLIE'S IDENTITY & COGNITIVE SYSTEM SUMMARY:
- Professional identity: Multidisciplinary Communication Creative & Creative Producer / Strategist. "A translator of possibilities."
- Career Engine: UNDERSTAND → STRUCTURE → CONCEPT → TRANSLATE → COORDINATE → PRODUCE → REALISE.
- Decision Ownership Hierarchy:
  * Level 0 (EXECUTE): Predefined layout adaptation, repetitive asset production. Low fit.
  * Level 1 (COORDINATE): Scheduling, basic task tracking. Conditional fit.
  * Level 2 (TRANSLATE): Turns strategy/concept into feasible communication or production solution. Strong fit.
  * Level 3 (SHAPE): Contributes meaningfully to concepts, narratives, experience, strategic direction. Very strong fit.
  * Level 4 (DEFINE): Participates in determining what problem to solve. Highest-value fit.
- Positive Signals: Complex/ambiguous problems, narrative systems, integrated communication, automotive/luxury, speculative/future scenarios, multidisciplinary collaboration, creative production [...]
- HARD NEGATIVE SIGNALS: Predominantly daily social publishing, social calendars, community management, influencer ops, performance marketing/SEO, repetitive banner resizing, pure administrative [...]
- IMPORTANT RULE: Company philosophy and structural alignment is PRIORITY #1. Whether there is an open job is secondary. Spontaneous / Cold outreach to a high-fit studio is highly encouraged.

INPUT TO EVALUATE:
Target Name / Hint: ${effectiveTargetName}
Website / Job URL: ${url || "N/A"}
${crawledContent ? `Live Website Crawled Data:\n"""\n${crawledContent}\n"""\n` : ""}
${crawlWarning ? `WARNING: ${crawlWarning} Do NOT fabricate site-specific claims or reach a confident verdict. Prefer "INVESTIGATE" priority and/or LOW confidence, and list what could not be verified in "unknowns".\n` : ""}
${content ? `Provided JD or User Description:\n"""\n${content}\n"""` : ""}

NOTE FOR URL-ONLY EVALUATIONS:
If the user provided only a URL (and no JD text), evaluate the studio or agency based on the crawled site content, its ethos, its problem domain, and where a high-level Communication Designer / C[...]

You MUST evaluate this opportunity strictly following the 18-Point Protocol and return a JSON object with this exact structure:
{
  "company": "Company/Studio Name",
  "role": "Role Title (or 'Spontaneous Outreach / General Practice' if company only)",
  "location": "Location / Country",
  "hiringStatus": "active_role" or "spontaneous_outreach" or "talent_pool",
  "actualRole": "Concise deconstruction of what the role actually is, cutting through jargon",
  "orgPosition": "Where this role sits between Strategy, Creative, Design, Production, Client, and Technology",
  "problemSolved": "What actual problem does this role or company solve?",
  "input": "What raw inputs enter this role (e.g. raw client brief, business problem, strategy)?",
  "transformation": "What transformation is performed (e.g. strategy → communication system, concept → physical realisation)?",
  "output": "What tangible outputs are produced?",
  "decisionOwnership": {
    "level": 0 to 4 (number),
    "name": "EXECUTE" | "COORDINATE" | "TRANSLATE" | "SHAPE" | "DEFINE",
    "evidence": "Specific evidence from the text supporting this decision level"
  },
  "careerEngine": {
    "understand": boolean,
    "structure": boolean,
    "concept": boolean,
    "translate": boolean,
    "coordinate": boolean,
    "produce": boolean,
    "realise": boolean,
    "explanation": "Which parts of Kylie's 7-step Career Engine are activated and why"
  },
  "crossFunctionalRelationships": ["list of meaningful cross-discipline interfaces"],
  "positiveSignals": ["list of positive signals detected"],
  "negativeSignals": ["list of negative signals or risks detected"],
  "unknowns": ["list of critical missing information, if any"],
  "companyFitScore": number between 0 and 100,
  "roleFitScore": number between 0 and 100,
  "priority": "EXCEPTIONAL" | "STRONG" | "INVESTIGATE" | "LOW" | "REJECT",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "recommendedAction": "Actionable verdict (e.g. 'Immediate high-priority cold outreach', 'Tailor automotive portfolio', 'Investigate team structure first', 'Skip')",
  "recommendedCV": "Creative / Design version" | "Automotive / Brand Communication version" | "Hybrid",
  "recommendedPortfolioEmphasis": ["Array of recommended projects or case studies to emphasize, e.g. 'Audi Integrated Campaign', 'TYRANNO Speculative System', 'The Infinite Discussion', 'DEEAR Ma[...]
  "coldOutreachAngle": "A sharp, tailored 2-3 sentence positioning proposition explaining why Kylie’s specific skillset is uniquely valuable to this team"
}
Output only valid JSON.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Raised from 0.2: low temperature made outputs converge to one identical
        // template when crawled input was thin. 0.6 keeps JSON output stable while
        // letting genuinely different inputs produce genuinely different reports.
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const normalized = normalizeModelReport(parsed);
    res.json(normalized);
  } catch (error: any) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate input" });
  }
});

// Autonomous Studio Discovery Radar Probe
app.post("/api/discover-studios", async (req, res) => {
  try {
    const { location = "Italy", domain = "All", customKeywords = "", existingIds = [] } = req.body;
    const ai = getGenAI();

    const probePrompt = `
You are the automated studio & agency discovery agent for Kylie Bi (Multidisciplinary Communication Designer & Creative Producer, "A translator of possibilities").

YOUR MISSION:
Search and identify 4 to 6 real, high-calibre independent creative studios, brand experience agencies, automotive/luxury communication consultancies, speculative/future design practices, or cultu[...]

SEARCH CRITERIA:
- Target Location / Eco-system: ${location} (e.g., Milan, Turin, Rome, Italy, Amsterdam, Berlin, Copenhagen, Europe, or Remote).
- Discipline / Theme: ${domain} (e.g. Brand Experience, Automotive Communication, Spatial & Narrative Systems, Creative Technology & Realisation).
- Keywords / Niche: ${customKeywords || 'creative-led, interdisciplinary, problem precedes media, high-craft physical & visual realization'}
- Do NOT include these already discovered studio IDs or names if possible: ${JSON.stringify(existingIds)}

CRITICAL EVALUATION MANDATES FOR KYLIE:
1. Studio philosophy, design culture, and structural architecture is PRIORITY #1.
2. DO NOT filter out studios merely because they do not have a public job posting right now! If the studio is high-fit, label their hiringStatus as "spontaneous_outreach" (Cold Outreach).
3. If they currently have an open position or hiring notice on their website or recent post, label hiringStatus as "active_role" and specify the activeRoles.
4. If they are an inspiring ecosystem benchmark to watch, label as "talent_pool".
5. Evaluate their Decision Ownership Expected (Level 2: TRANSLATE, Level 3: SHAPE, Level 4: DEFINE).
6. Map their Career Engine Activation (understand, structure, concept, translate, coordinate, produce, realise).
7. Recommend CV Track: 'Creative / Design version' | 'Automotive / Brand Communication version' | 'Hybrid'.
8. Formulate a sharp, personalized cold outreach pitch angle.

Return a JSON array of studio objects matching this exact schema:
[...
]

Provide real, authentic studios and accurate URLs. Return valid JSON only.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: probePrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    const normalized = normalizeModelReport(parsed);
    res.json({ results: normalized });
  } catch (error: any) {
    console.error("Discovery error:", error);
    res.status(500).json({ error: error.message || "Failed to run discovery probe" });
  }
});

// Cold Outreach Proposal Generator
app.post("/api/generate-outreach", async (req, res) => {
  try {
    const { studio, customNote = "", language = "en" } = req.body;
    if (!studio) {
      return res.status(400).json({ error: "Studio candidate data is required" });
    }

    const ai = getGenAI();

    const outreachPrompt = `
You are Kylie Bi's career strategist and communication director.
Draft a compelling, highly personalized, anti-cliché cold outreach email / introductory cover note to the founders or creative directors at ${studio.name}.

ABOUT KYLIE BI:
- Title: Communication Designer & Creative Producer / "A translator of possibilities"
...`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: outreachPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const normalized = normalizeModelReport(parsed);
    res.json(normalized);
  } catch (error: any) {
    console.error("Outreach generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate outreach" });
  }
});

// Vite middleware or static serving
async function startServer() {
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
    console.log(`Cognitive Career Radar Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
