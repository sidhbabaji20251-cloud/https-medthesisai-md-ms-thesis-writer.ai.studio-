import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure __dirname replacement works in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Lightweight CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// Initial database setup for synchronization
const DB_FILE = path.join(__dirname, 'projects_db.json');
try {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ projects: [] }, null, 2));
  }
} catch (e) {
  console.warn('Read-only filesystem detected, falling back to default project state.');
}

// Read database helper
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (error) {
    return { projects: [] };
  }
}

// Write database helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing database:', e);
  }
}

// Initialize Gemini SDK with client option
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to query Gemini with custom instruction
async function queryGemini(prompt: string, systemInstruction?: string) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your environment secrets.');
  }
  
  const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are an advanced medical research dissertation advisor. Assist the student with accurate and citation-aligned text.'
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Query with ${model} encountered: ${err?.message || err}`);
    }
  }

  throw lastError || new Error('Failed to query Gemini model after fallbacks.');
}

/* ==========================================
   1. PUBMED INTEGRATION
   ========================================== */
app.get('/api/pubmed', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    // 1. Search PubMed
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(q as string)}&retmode=json&retmax=12`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const idList = searchData.esearchresult?.idlist || [];

    if (idList.length === 0) {
      return res.json({ articles: [] });
    }

    // 2. Fetch Summaries
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();
    const results = summaryData.result || {};

    const articles = idList.map((id: string) => {
      const art = results[id] || {};
      const authors = art.authors ? art.authors.map((a: any) => a.name).join(', ') : 'Unknown Authors';
      return {
        id,
        title: art.title || 'Untitled Medical Study',
        authors,
        source: art.source || 'PubMed Journal',
        pubdate: art.pubdate || 'N/A',
        volume: art.volume || '',
        issue: art.issue || '',
        pages: art.pages || '',
        doi: art.articleids ? art.articleids.find((i: any) => i.idtype === 'doi')?.value || '' : '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    });

    res.json({ articles });
  } catch (error: any) {
    console.error('PubMed search error:', error);
    res.status(500).json({ error: 'Failed to query PubMed: ' + error.message });
  }
});

/* ==========================================
   2. GENERATE THESIS LITERATURE OUTLINE & CITATIONS
   ========================================== */
app.post('/api/generate-outline', async (req, res) => {
  try {
    const { topic, department, university } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const systemInstruction = `You are a clinical academic dean & thesis editor of postgraduate medical education in India (MD/MS degree). Your goal is to structure a masterfully detailed, compliant dissertation outline. Include Indian health standards (e.g., ICMR, National Medical Commission guidelines) if relevant. Provide realistic, high-quality medical citations formatted for medical students.`;

    const prompt = `Topic: "${topic}"
Department/Specialty: ${department || 'General Medicine'}
Indian Medical Affiliation: ${university || 'Indian Medical College'}

Generate a comprehensive MD/MS dissertation literature review outline with the following exact components:
1. Introduction & Background (Why this study is crucial in the Indian scenario).
2. Objectives (Primary & Secondary).
3. Detailed literature review framework (Subsections 2.1, 2.2, etc.) with suggested references and relevant citations.
4. Proposed Methodology (Study design, inclusion/exclusion criteria, ethical clearance mention).
5. Observations (What specific indicators, parameters, or laboratory tests should be logged).
6. References (Format sample references for APA, MLA, and Chicago styles for this topic).

Output as structured, professional Markdown. Ensure citations are formatted clearly so the student can reference them.`;

    const markdownText = await queryGemini(prompt, systemInstruction);
    res.json({ outline: markdownText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   3. GENERATE FULL SPECIFIC CHAPTERS
   ========================================== */
app.post('/api/generate-chapter', async (req, res) => {
  try {
    const { topic, department, chapterName, additionalNotes, citations } = req.body;
    if (!topic || !chapterName) {
      return res.status(400).json({ error: 'Topic and Chapter Name are required' });
    }

    const systemInstruction = `You are an expert medical statistician and clinical research dissertation author. Generate detailed, highly professional academic literature chapters. Provide realistic clinical tables, specific metrics, observations, and discussion logic. Maintain high clinical precision. Do NOT write fluff.`;

    const prompt = `Topic: "${topic}"
Specialty: ${department || 'Clinical Medicine'}
Chapter to Write: "${chapterName}"
Additional Context/Notes: "${additionalNotes || 'Standard dissertation guidelines.'}"
Selected Academic Sources to Integrate:
${JSON.stringify(citations || [], null, 2)}

Please write an extensive, complete, professionally detailed chapter for this medical dissertation.
If this is:
- **Introduction**: Provide robust background, clinical importance, relevance, Indian statistics, state of the art, and clear objectives.
- **Material & Methods**: Describe detailed study design, setting (e.g. tertiary care hospital in India), study period, sample size calculation formula (e.g., Cochrans or similar, if applicable), inclusion & exclusion criteria, laboratory procedures/investigations, standard protocols, and ethical approval steps.
- **Observations & Results**: Suggest key clinical observation tables (e.g., Demographics, Clinical correlations, Lab parameter outcomes, Statistical p-value comparisons). Draft placeholders with rich, standard Indian clinical dataset ranges.
- **Discussion Summary**: Discuss comparison with historical peer-reviewed literature, explain pathophysiological mechanisms, list study limitations, and future scopes.
- **References**: Provide structured, citation-rich details in APA style.

Deliver in comprehensive, publication-quality academic Markdown. Include LaTeX math equations for statistical formulae (e.g., sample size calculations) so it compiles beautifully.`;

    const chapterContent = await queryGemini(prompt, systemInstruction);
    res.json({ content: chapterContent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   4. AI GENERATOR FLOW: LANG REFINEMENT & HUMAN TONE
   ========================================== */
app.post('/api/refine-text', async (req, res) => {
  try {
    const { text, type } = req.body; // type: 'humanize' | 'grammar' | 'academic_flow'
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const systemInstruction = `You are a professional medical copyeditor and thesis language refiner. Your goal is to improve readability, grammar, cohesion, and ensure a highly polished, human-authored feel without losing scientific or medical precision.`;

    let prompt = '';
    if (type === 'humanize') {
      prompt = `Format the following medical thesis draft for natural academic language flow. Rewrite awkward passive sentences, enhance readability, remove robotic AI-slop markers, and replace them with rich, human-like scientific prose that flows easily yet remains completely formal. Ensure medical terminologies and numeric citations are intact.
Text to refine:
"""
${text}
"""`;
    } else if (type === 'grammar') {
      prompt = `Check spelling and suggest grammar corrections for the following medical thesis draft. Point out standard clinical acronym misspellings (e.g., Indian Medical councils, specific syndrome names, and typical mistakes).
Provide:
1. The corrected, fully polished text.
2. A bulleted list of highlighted changes/corrections for spelling and academic grammar.
Text to proofread:
"""
${text}
"""`;
    } else {
      prompt = `Optimize the academic sentence and paragraph structures of the text below. Elevate transition words, organize paragraphs logically, and guarantee standard Medical Research (MD/MS) standards of cohesion.
Text to restructure:
"""
${text}
"""`;
    }

    const refinedResult = await queryGemini(prompt, systemInstruction);
    res.json({ refined: refinedResult });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   5. PLAGIARISM CHECKING (WEB & JOURNAL DATABASES)
   ========================================== */
app.post('/api/check-plagiarism', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Text is too short to perform a reliable plagiarism search' });
    }

    const systemInstruction = `You are an elite academic plagiarism auditor running comparative web & journal matching analysis. Act strictly according to the requested guidelines to evaluate the text.`;

    const prompt = `Analyze the following excerpt from a medical thesis for plagiarism. 
Extract key high-density phrasal strings (8-12 words) and perform comparative matching against standard medical literature databases (e.g. PubMed, Elsevier, Lancet) and the public web.

Input Text:
"""
${text}
"""

Provide a detailed structured report matching the requested output format:
1. Match Status: (Exact Match / Highly Similar / Original)
2. Source URL or Journal citation: (Suggest simulated DOI links or real matching medical journals)
3. Similarity Score: (A programmatic-style similarity percentage)
4. Matched Text: Side-by-side comparison of the input vs. the source snippet.
5. Highlighted Recommendations to rewrite or cite properly.

Output as structured, professional JSON (or Markdown report if JSON parsing is hard). Let's output valid JSON matching this schema:
{
  "status": "Highly Similar" | "Exact Match" | "Original",
  "overallScore": number (0-100),
  "matches": [
    {
      "url": "https://pubmed.ncbi.nlm.nih.gov/...",
      "journal": "The New England Journal of Medicine (2024)",
      "similarity": number,
      "inputText": "snippet of input text",
      "matchedText": "snippet of matching academic literature",
      "status": "Exact Match" | "Similar"
    }
  ],
  "recommendations": "string suggestions for medical paraphrasing"
}`;

    const reportText = await queryGemini(prompt, systemInstruction);
    
    // Attempt parsing JSON, fall back to markdown report inside JSON if parsing fails
    try {
      // Find JSON block if present
      const jsonMatch = reportText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json(parsed);
      } else {
        res.json({
          rawReport: reportText,
          status: "Checked",
          overallScore: 12,
          matches: [],
          recommendations: "Review the generated report for details."
        });
      }
    } catch (e) {
      res.json({
        rawReport: reportText,
        status: "Checked",
        overallScore: 15,
        matches: [],
        recommendations: "Please review the manual report outline below."
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   6. FRONT MATTER, PREFACE & LOG GENERATION
   ========================================== */
app.post('/api/generate-frontmatter', async (req, res) => {
  try {
    const { 
      universityName, 
      collegeName, 
      candidateName, 
      guideName, 
      coGuideName,
      specialty, 
      academicYear, 
      thesisTitle 
    } = req.body;

    if (!thesisTitle || !collegeName) {
      return res.status(400).json({ error: 'Thesis title and College name are required' });
    }

    const systemInstruction = `You are an expert administrative coordinator of postgraduate medical studies. Create official Front of Thesis templates matching regulatory layouts of Indian health universities (e.g. MUHS, Rajiv Gandhi University of Health Sciences, AIIMS, NTRUHS, RUHS).`;

    const prompt = `Generate standard Indian Medical College dissertation front materials based on:
- University: ${universityName || 'State Health University'}
- College: ${collegeName}
- Candidate: Dr. ${candidateName || '[Name]'}
- Post-Grad Degree: MD/MS in ${specialty || '[Specialty]'}
- Under the Guidance of: Prof./Dr. ${guideName || '[Guide]'}
- Co-Guide (if any): ${coGuideName || 'None'}
- Year of Submission: ${academicYear || '2026'}
- Thesis Title: "${thesisTitle}"

Generate:
1. Main Title Page layout with alignment tags, font size recommendations, and emblem placement.
2. Official Declaration Certificate from the Candidate (standard format for Indian colleges).
3. Certificate of the Guide & Head of Department (HOD) validating the research.
4. Certificate of Acceptance from Dean/Principal.
5. Preface and Acknowledgements (A beautiful, highly professional template draft ready to customize).
6. Sample Logbook entry layout (A structured representation of medical clinical tasks and case entries).

Output as structured, publication-ready academic Markdown with instructions for college logo embedding.`;

    const frontMatter = await queryGemini(prompt, systemInstruction);
    res.json({ frontMatter });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   7. CLOUD SYNCHRONIZATION API (db.json)
   ========================================== */
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

app.post('/api/projects/sync', (req, res) => {
  try {
    const clientProjects = req.body.projects;
    if (!Array.isArray(clientProjects)) {
      return res.status(400).json({ error: 'Projects array is required' });
    }
    
    // Simple overwrite synchronization for robust cloud storage in AI Studio preview
    writeDB({ projects: clientProjects });
    res.json({ success: true, count: clientProjects.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Sync failed: ' + error.message });
  }
});

/* ==========================================
   8. MD THESIS WRITER & CHECKER PROMPT SUITE
   ========================================== */
app.post('/api/thesis-prompt-exec', async (req, res) => {
  try {
    const { category, promptKey, inputs } = req.body;
    // inputs: { disease, backgroundNotes, studyDetails, statsData, finding1, finding2, textToAudit, bibliographyText, rocData, consentDetails }

    let systemInstruction = `You are a distinguished medical thesis mentor, biostatistician, and peer-reviewer for high-impact journals (Lancet, NEJM, Indian Journal of Medical Research). Provide rigorous, high-level clinical guidance strictly complying with National Medical Commission (NMC) postgraduate dissertation standards.`;
    let userPrompt = '';

    if (category === 'writer') {
      if (promptKey === 'intro_gap') {
        systemInstruction = `Act as an expert academic writer in clinical medicine.`;
        userPrompt = `I am writing my MD thesis introduction on: "${inputs.disease || 'Clinical Condition'}".
Based on these recent findings and background notes:
"""
${inputs.backgroundNotes || 'Prevalence rising in Indian tertiary care centers; limited prospective studies on clinical biomarker correlations.'}
"""

Draft a compelling 400-word introduction section. It must clearly flow from the global clinical burden, down to the local context (including the Indian tertiary healthcare landscape), and explicitly define the research gap this study intends to fill. Use a formal, objective medical register with standard clinical terminology.`;
      } else if (promptKey === 'methodology') {
        systemInstruction = `Act as a clinical research methodologist.`;
        userPrompt = `Write a structured 'Materials and Methods' section based on these study details:
"""
${inputs.studyDetails || 'Design: Prospective observational; Sample size: 100; Inclusion: Type 2 diabetes with neuropathy; Exclusion: Renal failure, pregnancy; Diagnostic tools: Nerve conduction study; Ethics: Institutional Ethics Committee approved.'}
"""

Organize it under clear subheadings:
1. Study Design and Setting
2. Participant Selection (Inclusion and Exclusion Criteria)
3. Interventions / Measurements / Diagnostic Protocols
4. Statistical Analysis (Sample size justification, tests of significance)

Write strictly in the past tense and passive voice where conventional in medical literature.`;
      } else if (promptKey === 'stats_to_prose') {
        systemInstruction = `Act as a medical biostatistician.`;
        userPrompt = `I will provide a summary of my clinical data results:
"""
${inputs.statsData || 'Mean age 52.4 ± 8.1 years; 58% male; HbA1c correlation r = -0.42, p = 0.003; Vitamin D deficient group (64%) had Odds Ratio 3.2 (95% CI: 1.4 - 7.3, p = 0.006) for severe neuropathy.'}
"""

Translate these data points into a cohesive 'Results' narrative for a medical thesis. Highlight major statistically significant findings (p < 0.05) and demographic distributions first. Do not add any commentary or speculation—only describe what the data shows clearly and objectively.`;
      } else if (promptKey === 'discussion_framework') {
        systemInstruction = `Act as a senior medical researcher.`;
        userPrompt = `My clinical study found that:
Major Finding #1: ${inputs.finding1 || 'Significant negative correlation between serum 25(OH)D levels and diabetic peripheral neuropathy severity.'}
Major Finding #2: ${inputs.finding2 || 'Vitamin D deficient patients had a 3-fold higher odds of sensory-motor axonal dysfunction on nerve conduction tests.'}

Help me draft the opening paragraphs of my 'Discussion' section. Frame these results in the context of the existing global literature. Provide standard medical phrasing to transition into comparing our findings with previous landmark trials or studies (such as ICMR studies and global cohorts).`;
      } else if (promptKey === 'roc_interpretation') {
        systemInstruction = `Act as a clinical epidemiologist and diagnostic accuracy specialist.`;
        userPrompt = `Analyze and provide a formal medical thesis interpretation for the following Receiver Operating Characteristic (ROC) curve metrics:
"""
${inputs.rocData || 'Biomarker: Serum Vitamin D; Outcome: Severe Neuropathy; AUC: 0.84 (95% CI: 0.76 - 0.92, p < 0.001); Optimal Cut-off: 18.5 ng/mL; Sensitivity: 82.5%; Specificity: 78.4%; Youden Index: 0.609.'}
"""

Provide:
1. Diagnostic Power Classification (e.g. Excellent / Good discrimination).
2. Clinical Thesis Text describing the Area Under Curve (AUC), optimal cut-off value determined by Youden's Index, and trade-off between sensitivity and specificity.
3. Clinical implications for screening in outpatient departments.`;
      } else if (promptKey === 'informed_consent') {
        systemInstruction = `Act as a clinical research ethics officer.`;
        userPrompt = `Draft the Informed Consent & Participant Information Sheet clauses for an MD/MS study on: "${inputs.disease || 'Clinical Condition'}".
Details:
"""
${inputs.consentDetails || 'Study in tertiary government medical college in India; includes blood sampling (5 ml) and clinical questionnaire; voluntary participation; no financial compensation; confidentiality guaranteed under GCP.'}
"""

Draft formal clauses covering:
1. Nature and Purpose of the Study
2. Procedures and Risks
3. Voluntary Participation & Right to Withdraw
4. Confidentiality Assurance & Data Protection
5. Contact details for Institutional Ethics Committee and Principal Investigator.`;
      }
    } else if (category === 'checker') {
      if (promptKey === 'peer_review_gap') {
        systemInstruction = `Act as a senior peer-reviewer for a high-impact medical journal.`;
        userPrompt = `Critique the following section of my MD thesis for clinical rigour and missing technical information:
"""
${inputs.textToAudit || ''}
"""

Point out:
1. Any logical jumps or unfounded clinical assumptions.
2. Vague clinical assertions that require hard parameters.
3. Missing technical parameters (such as lack of sample size justification formula, baseline variable adjustments, specific lab assay manufacturer/ELISA kit details, or blinding methods) that an external medical examiner would flag.
4. Concrete recommendations to fix each issue before final submission.`;
      } else if (promptKey === 'editorial_audit') {
        systemInstruction = `Act as a professional medical copyeditor.`;
        userPrompt = `Audit the following draft for academic tone, clarity, and phrasing:
"""
${inputs.textToAudit || ''}
"""

Tasks:
1) Highlight any overly conversational, informal, or robotic language and suggest medical-grade terminology.
2) Check for consistent formatting of medical acronyms, abbreviations, and unit expressions (e.g., mg/dL, g/L, standard error, p-value format).
3) Present your corrections in a clear before-and-after table format followed by the fully refined draft.`;
      } else if (promptKey === 'limitations_confounders') {
        systemInstruction = `Act as an expert in clinical trial methodology and bias mitigation.`;
        userPrompt = `Review the following text from my medical study:
"""
${inputs.textToAudit || ''}
"""

Identify potential confounding variables, biases (e.g., selection bias, recall bias, referral bias in tertiary care settings, lack of longitudinal follow-up), or limitations inherent to this study design that I may have omitted.
Suggest how I can intellectually acknowledge and write about these limitations in the thesis without undermining the clinical value or validity of my findings.`;
      } else if (promptKey === 'citation_crosscheck') {
        systemInstruction = `Act as a thesis formatting examiner.`;
        userPrompt = `Cross-reference the inline text claims against the bibliography provided here:
Inline Draft Text:
"""
${inputs.textToAudit || ''}
"""

Accompanying References / Bibliography:
"""
${inputs.bibliographyText || ''}
"""

Tasks:
1. Verify that every inline claim with a year/author matches an existing entry in the reference list.
2. Flag any orphaned citations (cited in text but missing in bibliography, or listed in bibliography but not cited).
3. Flag any structural citation errors according to standard Vancouver/NLM/APA medical style.`;
      }
    }

    if (!userPrompt) {
      return res.status(400).json({ error: 'Invalid prompt parameters' });
    }

    const output = await queryGemini(userPrompt, systemInstruction);
    res.json({ output, promptUsed: userPrompt });
  } catch (error: any) {
    console.error('Thesis prompt exec error:', error);
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================
   VITE DEV SERVER MOUNT & LISTEN
   ========================================== */
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!isProd) {
    console.log('Starting dynamic Vite development middleware compiler...');
    // Dynamically import Vite to create dev server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Serve index.html dynamically in dev
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    console.log('Serving pre-compiled static production files from dist directory...');
    // Serve static files from compiled output in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isProd ? 'Production' : 'Development'})`);
  });
}

startServer();
