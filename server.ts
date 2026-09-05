import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Cognitive Career Radar API" });
});

// Helper: Fetch and extract clean text from a live studio/job URL
async function fetchUrlContent(rawUrl: string): Promise<{ title: string; text: string; error?: string }> {
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

    // If a URL is provided, actively fetch the live website content
    if (url && typeof url === "string" && url.trim().length > 0) {
      const crawlResult = await fetchUrlContent(url);
      if (crawlResult.text) {
        crawledContent = crawlResult.text;
        extractedTitle = crawlResult.title;
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
- Positive Signals: Complex/ambiguous problems, narrative systems, integrated communication, automotive/luxury, speculative/future scenarios, multidisciplinary collaboration, creative production / physical realisation.
- HARD NEGATIVE SIGNALS: Predominantly daily social publishing, social calendars, community management, influencer ops, performance marketing/SEO, repetitive banner resizing, pure administrative PM, pure account approval chasing.
- IMPORTANT RULE: Company philosophy and structural alignment is PRIORITY #1. Whether there is an open job is secondary. Spontaneous / Cold outreach to a high-fit studio is highly encouraged.

INPUT TO EVALUATE:
Target Name / Hint: ${effectiveTargetName}
Website / Job URL: ${url || "N/A"}
${crawledContent ? `Live Website Crawled Data:\n"""\n${crawledContent}\n"""\n` : ""}
${content ? `Provided JD or User Description:\n"""\n${content}\n"""` : ""}

NOTE FOR URL-ONLY EVALUATIONS:
If the user provided only a URL (and no JD text), evaluate the studio or agency based on the crawled site content, its ethos, its problem domain, and where a high-level Communication Designer / Creative Producer fits into their team for spontaneous executive pitch.

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
  "recommendedPortfolioEmphasis": ["Array of recommended projects or case studies to emphasize, e.g. 'Audi Integrated Campaign', 'TYRANNO Speculative System', 'The Infinite Discussion', 'DEEAR Magazine'"],
  "coldOutreachAngle": "A sharp, tailored 2-3 sentence positioning proposition explaining why Kylie’s specific skillset is uniquely valuable to this team"
}
Output only valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
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
Search and identify 4 to 6 real, high-calibre independent creative studios, brand experience agencies, automotive/luxury communication consultancies, speculative/future design practices, or cultural production studios that are structurally aligned with Kylie's cognitive system.

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
[
  {
    "id": "unique-kebab-slug",
    "name": "Studio or Agency Name",
    "website": "https://...",
    "location": "City, Country",
    "country": "Country",
    "ecosystem": "Category summary (e.g., Automotive Restomod / Experiential / Speculative Systems)",
    "hiringStatus": "active_role" | "spontaneous_outreach" | "talent_pool",
    "activeRoles": ["Role 1", "Role 2"] (optional array of open positions if found),
    "companyFitScore": number between 70 and 98,
    "roleFitScore": number between 70 and 96,
    "overallPriority": "EXCEPTIONAL" | "STRONG" | "INVESTIGATE",
    "confidence": "HIGH" | "MEDIUM",
    "decisionOwnershipExpected": "TRANSLATE" | "SHAPE" | "DEFINE",
    "careerEngineStages": {
      "understand": boolean,
      "structure": boolean,
      "concept": boolean,
      "translate": boolean,
      "coordinate": boolean,
      "produce": boolean,
      "realise": boolean,
      "explanation": "Why this activates Kylie's engine"
    },
    "corePhilosophy": "What is this studio's unique way of working and aesthetic philosophy?",
    "structuralStrengths": ["Strength 1", "Strength 2", "Strength 3"],
    "potentialFrictions": ["Potential challenge or barrier"],
    "whyItFitsKylie": "Detailed rationale connecting to Kylie's career DNA",
    "recommendedCVTrack": "Creative / Design version" | "Automotive / Brand Communication version" | "Hybrid",
    "outreachPitchAngle": "Tailored angle of approach for cold outreach or direct application",
    "keyWorkExamples": ["Notable Project 1", "Notable Project 2"],
    "pipelineStatus": "discovered",
    "dateDiscovered": "${new Date().toISOString().split('T')[0]}"
  }
]

Provide real, authentic studios and accurate URLs. Return valid JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: probePrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ results: parsed });
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
- Core: Moves seamlessly between Strategy, Concept, Visual Communication, and Production Realisation.
- Problem type: Thrives in ambiguous, complex briefs; transforms ideas into structured narrative systems and executable physical/spatial/brand experiences.
- Key Case Studies to reference when appropriate:
  * Audi Integrated Brand Communication (Automotive campaign, cross-functional execution)
  * TYRANNO (Speculative communication system & semiotics)
  * The Infinite Discussion (Speculative exhibition narrative & audiovisual dialogue system)
  * DEEAR Magazine (Editorial architecture & typography sequencing)
- Recommended CV Track for this studio: ${studio.recommendedCVTrack}
- Studio Philosophy: ${studio.corePhilosophy}
- Why It Fits: ${studio.whyItFitsKylie}
- Recommended Angle: ${studio.outreachPitchAngle}
- Work Examples: ${(studio.keyWorkExamples || []).join(', ')}
${customNote ? `Additional note: ${customNote}` : ''}

TARGET LANGUAGE: ${language === 'it' ? 'Italian (idiomatic, professional, contemporary Milanese creative industry tone)' : 'English (refined, confident, lucid, high-taste)'}

STYLE GUIDELINES:
- Zero generic boilerplate ("I am writing to express my eager interest...", "I am a passionate creative who wears many hats..."). BANNED!
- Write with competence-first professionalism: observe something genuine about their work, demonstrate understanding of their structural methodology, frame Kylie as a high-value collaborator who can bridge concept and production reality, and propose an open, low-friction conversational exchange.
- Output JSON:
{
  "subjectLine": "Compelling subject line",
  "previewSnippet": "1-sentence hook",
  "salutation": "Dear [Name / Team],",
  "body": "Full body text formatted in paragraphs",
  "closing": "Professional closing",
  "strategicTalkingPoints": [
    "Talking point 1 on how Kylie's experience relates to their projects",
    "Talking point 2 on production or narrative bridge"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: outreachPrompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
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
