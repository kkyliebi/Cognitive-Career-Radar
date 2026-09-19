import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({
    apiKey,
    vertexai: false,
  });
}

// Available stable flash models with automatic fallback on quota / high demand
const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

async function generateContentWithRetry(options: {
  prompt: string;
  responseMimeType?: string;
  temperature?: number;
  maxRetries?: number;
}): Promise<string> {
  const ai = getGenAI();
  const maxRetries = options.maxRetries ?? 3;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelName = CANDIDATE_MODELS[attempt % CANDIDATE_MODELS.length];
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.prompt,
        config: {
          responseMimeType: options.responseMimeType || "application/json",
          temperature: options.temperature ?? 0.35,
        },
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Attempt ${attempt + 1} with model ${modelName} failed:`, err?.message || err);
      if (attempt < maxRetries - 1) {
        const delayMs = (attempt + 1) * 800;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Failed to generate content from AI model after retries.");
}

function geminiClientErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  try {
    const parsed = JSON.parse(raw);
    const apiError = parsed?.error;
    if (apiError?.code === 503 || apiError?.status === "UNAVAILABLE") {
      return "The AI evaluation service is currently experiencing high demand. Please retry in a few seconds.";
    }
    if (apiError?.code === 429 || apiError?.status === "RESOURCE_EXHAUSTED") {
      return "Rate limit reached. Please wait a moment before trying again.";
    }
    return apiError?.message || raw;
  } catch {
    return raw;
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Cognitive Career Radar API" });
});

// Minimum useful characters to consider crawled page meaningful
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

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    const metaDescMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
    );
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";

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

    const truncated = cleaned.slice(0, 10000);

    return {
      title,
      contentLength: cleaned.length,
      text: `Page Title: ${title}\nMeta Description: ${metaDesc}\nExtracted Page Content:\n${truncated}`,
    };
  } catch (err: any) {
    return { title: "", text: "", error: err.message || "Failed to fetch URL" };
  }
}

// ----------------------------------------------------
// 1. Single Opportunity / Studio Diagnostic Evaluator
// ----------------------------------------------------
app.post("/api/evaluate-single", async (req, res) => {
  try {
    const { url, content, targetName } = req.body;

    if (!url && !content && !targetName) {
      return res.status(400).json({ error: "Please provide a target name, live URL, or job description text." });
    }

    let crawledContent = "";
    let extractedTitle = "";
    let crawlWarning: string | null = null;

    const hasUserProvidedText = content && typeof content === "string" && content.trim().length > 0;
    if (url && typeof url === "string" && url.trim().length > 0) {
      const crawlResult = await fetchUrlContent(url);

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

    const effectiveTargetName =
      targetName || extractedTitle || (url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "Unknown Target");

    const prompt = `
You are the career evaluation agent for Kylie Bi, strictly executing the rules from KYLIE_JOB_AGENT_PROTOCOL_v1.0.md, KYLIE_JOB_FILTER_SPEC_v1.0.yaml, and KYLIE_CAREER_DNA_v1.0.md.

KYLIE'S IDENTITY & COGNITIVE SYSTEM SUMMARY:
- Professional identity: Multidisciplinary Communication Creative, Systems Designer & Creative Producer / Strategist. "A translator of possibilities."
- 8-Step Career Engine: 01 Understand unfamiliar domain → 02 Identify relationships → 03 Structure complexity → 04 Create concepts / scenarios → 05 Translate into artefacts → 06 Facilitate people → 07 Design interaction / narrative / systems → 08 Coordinate implementation.
- Decision Ownership Hierarchy:
  * Level 0 (EXECUTE): Pure task execution without creative/strategic input. Immediate REJECT.
  * Level 1 (COORDINATE): Pure logistics, administrative assistance, schedule management. REJECT if dominant.
  * Level 2 (TRANSLATE): Turns strategy/concept into feasible communication or production solution. Strong fit.
  * Level 3 (SHAPE): Contributes meaningfully to concepts, narratives, experience, strategic direction. Very strong fit.
  * Level 4 (DEFINE): Participates in determining what problem to solve. Highest-value fit.
- Expanded Search Universe: Creative / Communication / Experience / Design Strategy / Systems Design / Narrative Systems / Human–AI Interaction / AI Experience / Agent Experience / AI Interaction / AI Transformation / Automotive & Luxury Brand Communication.
- Positive Signals: Complex/ambiguous domains, Human–AI systems, narrative systems & speculative worldbuilding, integrated automotive/luxury communication, multidisciplinary collaboration, high-craft physical/exhibition realization.
- HARD NEGATIVE SIGNALS: Predominantly daily social publishing, social calendars, community management, influencer ops, performance marketing/SEO, repetitive banner resizing, pure administrative assistant tasks.
- IMPORTANT RULE: Company philosophy and structural alignment is PRIORITY #1. Whether there is an open job is secondary. Spontaneous / Cold outreach to a high-fit studio is highly encouraged.

INPUT TO EVALUATE:
Target Name / Hint: ${effectiveTargetName}
${crawledContent ? `Live Website Crawled Data:\n"""\n${crawledContent}\n"""\n` : ""}
${crawlWarning ? `WARNING: ${crawlWarning} Do NOT fabricate site-specific claims. Prefer "INVESTIGATE" priority and/or LOW confidence, and list what could not be verified in "unknowns".\n` : ""}
${content ? `Provided JD or User Description:\n"""\n${content}\n"""` : ""}

You MUST evaluate this opportunity strictly following the 18-Point Protocol and return a JSON object with this exact structure:
{
  "company": "${effectiveTargetName}",
  "role": "Role Title (or 'Spontaneous Outreach / General Practice' if company only)",
  "location": "Location / Country",
  "hiringStatus": "active_role",
  "actualRole": "Concise deconstruction of what the role actually is, cutting through jargon",
  "orgPosition": "Where this role sits between Strategy, Creative, Design, Production, Client, and Technology",
  "problemSolved": "What actual problem does this role or company solve?",
  "input": "What raw inputs enter this role (e.g. raw client brief, business problem, strategy)?",
  "transformation": "What transformation is performed (e.g. strategy → communication system, concept → physical realisation)?",
  "output": "What tangible outputs are produced?",
  "decisionOwnership": {
    "level": 3,
    "name": "SHAPE",
    "evidence": "Specific evidence from the text supporting this decision level"
  },
  "careerEngine": {
    "understand": true,
    "structure": true,
    "concept": true,
    "translate": true,
    "coordinate": true,
    "produce": true,
    "realise": true,
    "explanation": "Which parts of Kylie's 7-step Career Engine are activated and why"
  },
  "crossFunctionalRelationships": ["Creative Director", "Production", "Fabricators", "Brand Strategy"],
  "positiveSignals": ["Focus on tangible craft", "Integrated narrative systems"],
  "negativeSignals": [],
  "unknowns": ["Immediate quarter hiring budget"],
  "companyFitScore": 92,
  "roleFitScore": 88,
  "priority": "EXCEPTIONAL",
  "confidence": "HIGH",
  "recommendedAction": "Actionable verdict (e.g. 'Immediate high-priority cold outreach')",
  "recommendedCV": "Creative / Design version",
  "recommendedPortfolioEmphasis": ["Audi Integrated Campaign", "TYRANNO Speculative System", "DEEAR Sensory Interface"],
  "coldOutreachAngle": "A sharp, tailored 2-3 sentence proposition tailored to this studio",
  "ecosystem": "Independent Creative Studio"
}
Output only valid JSON.
`;

    const rawJson = await generateContentWithRetry({
      prompt,
      temperature: 0.4,
    });

    const parsed = JSON.parse(rawJson || "{}");

    // Clean & normalize for EvaluationReport format expected by frontend
    const companyName = parsed.company || effectiveTargetName || "Target Studio";
    const fitScore = Number(parsed.companyFitScore ?? parsed.overallFitScore ?? 88);
    const decisionName = parsed.decisionOwnership?.name || "SHAPE";

    const normalizedReport = {
      ...parsed,
      company: companyName,
      studioName: companyName,
      companyFitScore: fitScore,
      roleFitScore: Number(parsed.roleFitScore ?? fitScore),
      overallFitScore: fitScore,
      hiringStatus: parsed.hiringStatus ?? "spontaneous_outreach",
      ecosystemClassification: parsed.ecosystem || parsed.ecosystemClassification || "Independent Design & Creative Practice",
      cvTrackRecommendation: parsed.recommendedCV || parsed.recommendedCVTrack || "Creative / Design version",
      decisionOwnershipLevel: decisionName,
      decisionOwnership: parsed.decisionOwnership || {
        level: 3,
        name: decisionName,
        evidence: "Evaluated from creative positioning and output scope.",
      },
      careerEngineMapping: parsed.careerEngine || {
        understand: true,
        structure: true,
        concept: true,
        translate: true,
        coordinate: true,
        produce: true,
        realise: true,
        explanation: "Comprehensive activation across the strategic realization engine.",
      },
      philosophyAlignment: {
        score: fitScore,
        summary: parsed.problemSolved || parsed.actualRole || "Strong alignment with multidisciplinary narrative and production translation.",
      },
      alignmentSignals: parsed.positiveSignals || [],
      negativeSignals: parsed.negativeSignals || [],
      outreachTalkingPoints: parsed.coldOutreachAngle ? [parsed.coldOutreachAngle] : ["Highlight translating conceptual strategy into tangible realization systems."],
    };

    res.json(normalizedReport);
  } catch (error: any) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: geminiClientErrorMessage(error) || "Failed to evaluate input" });
  }
});

// ----------------------------------------------------
// 2. Autonomous Studio Discovery Radar Probe
// ----------------------------------------------------
app.post("/api/discover-studios", async (req, res) => {
  try {
    const { location = "Italy", domain = "All", customKeywords = "", existingIds = [] } = req.body;

    const probePrompt = `
You are the automated studio & agency discovery radar agent for Kylie Bi (Multidisciplinary Communication Designer, Systems Designer & Creative Producer, "A translator of possibilities").

KYLIE'S IDENTITY & TARGET ECOSYSTEM:
- Multidisciplinary Communication Creative, Systems Designer & Creative Producer based in Milan, Italy (Master's from Politecnico di Milano).
- Core strengths: Translating complex narratives and unfamiliar domains into physical, digital, and spatial artefacts; Human–AI interaction & Agent Experience (AX); AI transformation; Design strategy & systems design; Automotive/luxury communication (FAW-Audi campaigns); Speculative scenarios & exhibition systems.
- 8-Step Career Engine: 01 Understand unfamiliar domain → 02 Identify relationships → 03 Structure complexity → 04 Create concepts / scenarios → 05 Translate into artefacts → 06 Facilitate people → 07 Design interaction / narrative / systems → 08 Coordinate implementation.

SEARCH CRITERIA:
- Target Location / Eco-system: ${location} (e.g., Milan, Turin, Rome, Italy, Amsterdam, Berlin, Copenhagen, London, Europe, or Remote).
- Discipline / Theme: ${domain} (e.g. Human–AI Interaction / Agent Experience / AI Transformation, Design Strategy & Systems Design, Narrative Systems & Speculative Scenarios, Spatial Narrative & Immersive Tech, Automotive Brand Communication & Luxury Experience, Creative Direction & Interdisciplinary Production).
- Keywords / Niche: ${customKeywords || 'creative-led, interdisciplinary, problem precedes media, high-craft physical & visual realization, agent experience, AI interaction'}
- Do NOT include these already discovered studio names if possible: ${JSON.stringify(existingIds)}

CRITICAL EVALUATION MANDATES FOR KYLIE:
1. Studio philosophy, design culture, and structural architecture is PRIORITY #1.
2. DO NOT filter out studios merely because they do not have a public job posting right now! If the studio is high-fit, label their hiringStatus as "spontaneous_outreach" (Cold Outreach).
3. If they currently have an open position or hiring notice, label hiringStatus as "active_role" and specify activeRoles.
4. If they are an inspiring benchmark to watch, label as "talent_pool".
5. Evaluate their Decision Ownership Expected ('TRANSLATE' | 'SHAPE' | 'DEFINE').
6. Recommend CV Track: 'Creative / Design version' | 'Automotive / Brand Communication version' | 'Hybrid'.
7. Formulate a sharp, personalized 2-sentence cold outreach pitch angle.

Return a JSON array of 4 to 6 authentic studio candidate objects strictly matching this format:
[
  {
    "id": "studio-unique-id",
    "name": "Studio Name",
    "website": "https://...",
    "location": "Milan",
    "country": "Italy",
    "ecosystem": "Human–AI Interaction & Systems Design",
    "hiringStatus": "spontaneous_outreach",
    "activeRoles": [],
    "companyFitScore": 92,
    "roleFitScore": 88,
    "overallPriority": "EXCEPTIONAL",
    "confidence": "HIGH",
    "decisionOwnershipExpected": "SHAPE",
    "careerEngineStages": {
      "understandDomain": true,
      "identifyRelationships": true,
      "structureComplexity": true,
      "createConceptsScenarios": true,
      "translateArtefacts": true,
      "facilitatePeople": true,
      "designSystemsNarrative": true,
      "coordinateImplementation": true,
      "explanation": "Activates end-to-end domain understanding, concept translation, and systems design."
    },
    "corePhilosophy": "Core ethos and design approach of the studio.",
    "structuralStrengths": ["Strength 1", "Strength 2"],
    "potentialFrictions": ["Potential risk 1"],
    "whyItFitsKylie": "Detailed rationale on why Kylie's multidisciplinary skillset connects with this studio.",
    "recommendedCVTrack": "Creative / Design version",
    "outreachPitchAngle": "Sharp 2-sentence hook for cold email to the creative director.",
    "keyWorkExamples": ["Notable Project 1", "Notable Project 2"]
  }
]
Output valid JSON array only.
`;

    const rawJson = await generateContentWithRetry({
      prompt: probePrompt,
      temperature: 0.4,
    });

    const parsed = JSON.parse(rawJson || "[]");
    const rawList = Array.isArray(parsed) ? parsed : parsed.results || parsed.studios || [parsed];
    const todayStr = new Date().toISOString().split("T")[0];

    // Normalize precisely to the StudioCandidate TypeScript interface
    const candidates = rawList.map((s: any, idx: number) => {
      const sName = String(s.name || s.studioName || `Studio ${idx + 1}`).trim();
      const sId = String(s.id || `disc-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`);
      const fit = Number(s.companyFitScore ?? s.overallFitScore ?? 88);

      const engine = s.careerEngineStages || s.careerEngine || {};
      const safeEngine = {
        understandDomain: Boolean(engine.understandDomain ?? engine.understand ?? true),
        identifyRelationships: Boolean(engine.identifyRelationships ?? engine.relationships ?? true),
        structureComplexity: Boolean(engine.structureComplexity ?? engine.structure ?? true),
        createConceptsScenarios: Boolean(engine.createConceptsScenarios ?? engine.concept ?? true),
        translateArtefacts: Boolean(engine.translateArtefacts ?? engine.translate ?? true),
        facilitatePeople: Boolean(engine.facilitatePeople ?? engine.facilitate ?? true),
        designSystemsNarrative: Boolean(engine.designSystemsNarrative ?? engine.design ?? true),
        coordinateImplementation: Boolean(engine.coordinateImplementation ?? engine.coordinate ?? true),
        // Legacy flags
        understand: Boolean(engine.understand ?? true),
        structure: Boolean(engine.structure ?? true),
        concept: Boolean(engine.concept ?? true),
        translate: Boolean(engine.translate ?? true),
        coordinate: Boolean(engine.coordinate ?? true),
        produce: Boolean(engine.produce ?? true),
        realise: Boolean(engine.realise ?? true),
        explanation: engine.explanation || "Activates strategic concept translation and realization.",
      };

      return {
        id: sId,
        name: sName,
        website: s.website || "https://",
        location: s.location || "Milan",
        country: s.country || "Italy",
        ecosystem: s.ecosystem || s.ecosystemClassification || "Independent Creative Studio",
        hiringStatus: s.hiringStatus === "active_role" ? "active_role" : s.hiringStatus === "talent_pool" ? "talent_pool" : "spontaneous_outreach",
        activeRoles: Array.isArray(s.activeRoles) ? s.activeRoles : [],
        companyFitScore: fit,
        roleFitScore: Number(s.roleFitScore ?? fit),
        overallPriority: s.overallPriority || (fit >= 90 ? "EXCEPTIONAL" : fit >= 80 ? "STRONG" : "INVESTIGATE"),
        confidence: s.confidence || (fit >= 85 ? "HIGH" : "MEDIUM"),
        decisionOwnershipExpected: s.decisionOwnershipExpected || s.decisionOwnershipLevel || "SHAPE",
        careerEngineStages: safeEngine,
        corePhilosophy: s.corePhilosophy || s.problemSolved || "Interdisciplinary approach bridging strategic concept with material craft.",
        structuralStrengths: Array.isArray(s.structuralStrengths) && s.structuralStrengths.length > 0 ? s.structuralStrengths : ["High design autonomy", "Integrated spatial and visual communication"],
        potentialFrictions: Array.isArray(s.potentialFrictions) ? s.potentialFrictions : [],
        whyItFitsKylie: s.whyItFitsKylie || s.corePhilosophy || "Strong resonance with translating complex conceptual systems into physical and visual reality.",
        recommendedCVTrack: s.recommendedCVTrack || s.recommendedCV || "Creative / Design version",
        outreachPitchAngle: s.outreachPitchAngle || s.coldOutreachAngle || "Propose bridging conceptual translation and multidisciplinary creative production.",
        keyWorkExamples: Array.isArray(s.keyWorkExamples) ? s.keyWorkExamples : ["Spatial Brand Systems", "Visual Identity & Exhibition"],
        pipelineStatus: "discovered",
        dateDiscovered: s.dateDiscovered || todayStr,
      };
    });

    res.json({ results: candidates });
  } catch (error: any) {
    console.error("Discovery error:", error);
    res.status(500).json({ error: geminiClientErrorMessage(error) || "Failed to run discovery probe" });
  }
});

// ----------------------------------------------------
// 3. Cold Outreach Proposal Generator
// ----------------------------------------------------
app.post("/api/generate-outreach", async (req, res) => {
  try {
    const { studio, customNote = "", language = "en" } = req.body;
    if (!studio) {
      return res.status(400).json({ error: "Studio candidate data is required" });
    }

    const studioName = studio.name || "Creative Studio";

    const outreachPrompt = `
You are Kylie Bi's career strategist and communication director.
Draft a compelling, highly personalized, anti-cliché cold outreach email / introductory cover note to the founders or creative directors at ${studioName}.

ABOUT KYLIE BI:
- Title: Multidisciplinary Communication Designer & Creative Producer / "A translator of possibilities"
- Location: Milan, Italy
- Background: Master's in Communication Design (Politecnico di Milano), Automotive brand communication (Audi integrated campaigns at FAW-Audi), Speculative & Exhibition Design (TYRANNO, The Infinite Discussion, DEEAR), Interactive visual systems.
- Core capability: Translating high-level strategic/philosophical briefs into physical, spatial, and visual reality. Navigates seamlessly between high-level conceptual direction and granular production execution.
- Recommended CV Track for this studio: ${studio.recommendedCVTrack || 'Creative / Design version'}

STUDIO CONTEXT:
- Studio Name: ${studioName}
- Location: ${studio.location || 'Europe'}, ${studio.country || 'Italy'}
- Core Philosophy: ${studio.corePhilosophy || 'N/A'}
- Why it fits: ${studio.whyItFitsKylie || 'N/A'}
- Outreach Pitch Angle: ${studio.outreachPitchAngle || 'N/A'}
- Hiring Status: ${studio.hiringStatus}
${customNote ? `Additional User Focus/Note: "${customNote}"` : ''}
Language: ${language === 'it' ? 'Italian (fluent, professional, cultured)' : 'English (refined, direct, engaging)'}

TONE & VOICE GUIDELINES:
- Direct, confident, peer-to-peer (no generic subservient cover letter cliches like "I am writing to express my enthusiasm").
- Open immediately with genuine resonance for their specific design ethos or recent spatial/visual work.
- Articulate Kylie's distinct value proposition: solving the friction between conceptual intent and material execution.
- Keep the body concise (180–250 words), easily readable on mobile.
- Clear, low-pressure call to action (a 15-minute introductory coffee in Milan or virtual exchange).

Return a JSON object with this exact schema:
{
  "subjectLine": "Compelling subject line",
  "previewSnippet": "Preview text snippet",
  "salutation": "Dear [Founder/Creative Director Name or Team],",
  "body": "Paragraph 1: Resonant hook on their work.\n\nParagraph 2: Kylie's positioning and tangible bridge.\n\nParagraph 3: Low-friction invitation to connect.",
  "closing": "Warm regards / Cordiali saluti,",
  "strategicTalkingPoints": [
    "Talking point 1 on studio alignment",
    "Talking point 2 on production translation",
    "Talking point 3 on portfolio highlight"
  ]
}
Output valid JSON only.
`;

    const rawJson = await generateContentWithRetry({
      prompt: outreachPrompt,
      temperature: 0.35,
    });

    const parsed = JSON.parse(rawJson || "{}");

    res.json({
      subjectLine: parsed.subjectLine || `Connecting / Multidisciplinary Communication & Production · Kylie Bi × ${studioName}`,
      previewSnippet: parsed.previewSnippet || "Translating conceptual narratives into spatial and visual execution.",
      salutation: parsed.salutation || `Dear ${studioName} Team,`,
      body: parsed.body || `I have been following ${studioName}'s work and deeply appreciate your approach to design as a structural narrative.\n\nAs a multidisciplinary communication designer and creative producer based in Milan, I specialize in bridging the gap between high-level brand strategy and material execution. Having led automotive integrated campaigns and speculative exhibition systems, I understand the complex friction of turning ambitious concepts into tangible reality.\n\nI would welcome the opportunity to connect for a brief introductory conversation or coffee in Milan.`,
      closing: parsed.closing || "Warm regards,",
      strategicTalkingPoints: Array.isArray(parsed.strategicTalkingPoints) ? parsed.strategicTalkingPoints : [
        "Aligning on philosophy precedes media choice",
        "Experience in complex automotive and speculative production",
        "Politecnico di Milano Master's background based locally in Milan",
      ],
    });
  } catch (error: any) {
    console.error("Outreach generation error:", error);
    res.status(500).json({ error: geminiClientErrorMessage(error) || "Failed to generate outreach" });
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
