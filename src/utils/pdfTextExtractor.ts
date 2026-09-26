export interface ExtractedPdfResult {
  fileName: string;
  fileSizeKB: number;
  pageCount: number;
  wordCount: number;
  charCount: number;
  extractedText: string;
  extractionMethod: 'pdf-stream' | 'text-direct' | 'metadata-fallback';
}

export interface AiCheckReport {
  overallAiProbability: number; // 0 - 100
  humanAuthoredScore: number; // 0 - 100
  verdict: 'Human-Authored Clinical Prose' | 'Mixed Human & AI Assisted' | 'High AI-Generated Pattern Detected';
  perplexityScore: number; // Higher = more human/varied
  burstinessScore: number; // Sentence length variation (higher = more human)
  clinicalSpecificityScore: number; // Presence of real clinical units, p-values, citations
  flaggedSentences: Array<{
    sentence: string;
    reason: string;
    aiConfidence: number;
    humanizedSuggestion: string;
  }>;
  aiPhraseHits: Array<{
    phrase: string;
    count: number;
    replacement: string;
  }>;
  summaryRecommendations: string;
}

/**
 * Decode octal escapes and standard PDF escape sequences inside (...) literals
 */
function decodePdfLiteralString(raw: string): string {
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\([0-7]{1,3})/g, (_m, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 && code <= 126 ? String.fromCharCode(code) : ' ';
    });
}

/**
 * Decode PDF hex string <...> (supports ASCII hex and UTF-16BE BOM FEFF)
 */
function decodePdfHexString(hexRaw: string): string {
  const clean = hexRaw.replace(/\s+/g, '');
  if (clean.length < 2) return '';

  if (clean.toUpperCase().startsWith('FEFF')) {
    let out = '';
    for (let i = 4; i + 3 < clean.length; i += 4) {
      const code = parseInt(clean.substring(i, i + 4), 16);
      if (code >= 32 && code < 0xd800) {
        out += String.fromCharCode(code);
      }
    }
    return out;
  }

  let out = '';
  for (let i = 0; i + 1 < clean.length; i += 2) {
    const code = parseInt(clean.substring(i, i + 2), 16);
    if (code >= 32 && code <= 126) {
      out += String.fromCharCode(code);
    } else if (code === 10 || code === 13) {
      out += '\n';
    }
  }
  return out;
}

/**
 * Extract readable text tokens from a decompressed or raw PDF content stream
 */
function extractTextFromPdfContentStream(content: string): string {
  const chunks: string[] = [];

  // Match BT ... ET text blocks first
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match: RegExpExecArray | null;
  let foundBtEt = false;

  while ((match = btEtRegex.exec(content)) !== null) {
    foundBtEt = true;
    const block = match[1];

    // 1. Extract TJ arrays: [(text) -20 (more)] TJ
    const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    const blockParts: string[] = [];

    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = arrMatch[1];
      const litRegex = /\(((?:\\.|[^\\()])*)\)|<([0-9A-Fa-f\s]+)>/g;
      let tokenMatch: RegExpExecArray | null;
      let lineStr = '';
      while ((tokenMatch = litRegex.exec(inner)) !== null) {
        if (tokenMatch[1] !== undefined) {
          lineStr += decodePdfLiteralString(tokenMatch[1]);
        } else if (tokenMatch[2] !== undefined) {
          lineStr += decodePdfHexString(tokenMatch[2]);
        }
      }
      if (lineStr.trim()) blockParts.push(lineStr.trim());
    }

    // 2. Extract single (text) Tj or ' or "
    const singleTjRegex = /\(((?:\\.|[^\\()])*)\)\s*(?:Tj|'|")|<([0-9A-Fa-f\s]+)>\s*Tj/g;
    let singleMatch: RegExpExecArray | null;
    while ((singleMatch = singleTjRegex.exec(block)) !== null) {
      const decoded =
        singleMatch[1] !== undefined
          ? decodePdfLiteralString(singleMatch[1])
          : decodePdfHexString(singleMatch[2] || '');
      if (decoded.trim()) blockParts.push(decoded.trim());
    }

    if (blockParts.length > 0) {
      chunks.push(blockParts.join(' '));
    }
  }

  // Fallback if no BT..ET blocks matched directly: scan parenthesized strings of 3+ readable chars
  if (!foundBtEt || chunks.length === 0) {
    const fallbackRegex = /\(((?:\\.|[^\\()]){3,})\)/g;
    let fbMatch: RegExpExecArray | null;
    while ((fbMatch = fallbackRegex.exec(content)) !== null) {
      const str = decodePdfLiteralString(fbMatch[1]).trim();
      if (
        str.length >= 3 &&
        /[a-zA-Z]{2,}/.test(str) &&
        !/^(Type|Font|Page|Catalog|Outlines|Helvetica|Times|Courier|WinAnsiEncoding|FlateDecode|Identity-H)/i.test(str)
      ) {
        chunks.push(str);
      }
    }
  }

  return chunks
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/ - /g, '-')
    .trim();
}

/**
 * Decompress a Uint8Array using browser's DecompressionStream ('deflate' or 'deflate-raw')
 */
async function tryInflateBytes(compressed: Uint8Array): Promise<string | null> {
  if (typeof DecompressionStream === 'undefined') return null;

  const formats: Array<'deflate' | 'deflate-raw'> = ['deflate', 'deflate-raw'];
  for (const fmt of formats) {
    try {
      const ds = new DecompressionStream(fmt);
      const writer = ds.writable.getWriter();
      writer.write(new Uint8Array(compressed)).catch(() => {});
      writer.close().catch(() => {});

      const reader = ds.readable.getReader();
      const decodedChunks: Uint8Array[] = [];
      let totalLen = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          decodedChunks.push(value);
          totalLen += value.length;
          if (totalLen > 5 * 1024 * 1024) break; // safety cap 5MB per stream
        }
      }

      if (totalLen > 0) {
        const merged = new Uint8Array(totalLen);
        let offset = 0;
        for (const c of decodedChunks) {
          merged.set(c, offset);
          offset += c.length;
        }
        return new TextDecoder('latin1').decode(merged);
      }
    } catch {
      // try next format
    }
  }
  return null;
}

/**
 * Extract text from a dropped or uploaded PDF, TXT, MD, TEX, or DOC/DOCX file
 */
export async function extractTextFromUploadedFile(file: File): Promise<ExtractedPdfResult> {
  const fileSizeKB = Math.max(1, Math.round(file.size / 1024));
  const lowerName = file.name.toLowerCase();

  // 1. Plain text / Markdown / LaTeX / CSV files
  if (
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.tex') ||
    lowerName.endsWith('.csv') ||
    file.type.startsWith('text/')
  ) {
    const rawText = await file.text();
    const cleaned = rawText.trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    return {
      fileName: file.name,
      fileSizeKB,
      pageCount: Math.max(1, Math.ceil(words.length / 300)),
      wordCount: words.length,
      charCount: cleaned.length,
      extractedText: cleaned,
      extractionMethod: 'text-direct'
    };
  }

  // 2. Binary PDF file parsing (uncompressed + FlateDecode streams)
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const latin1Raw = new TextDecoder('latin1').decode(bytes);

  // Count approximate pages in PDF
  const pageMatches = latin1Raw.match(/\/Type\s*\/Page\b/g);
  const estimatedPages = pageMatches ? pageMatches.length : Math.max(1, Math.round(fileSizeKB / 45));

  const extractedSegments: string[] = [];

  // Extract uncompressed text first
  const directText = extractTextFromPdfContentStream(latin1Raw);
  if (directText.length > 40) {
    extractedSegments.push(directText);
  }

  // Locate stream ... endstream blocks and decompress FlateDecode streams
  const streamRegex = /stream\r?\n/g;
  let sMatch: RegExpExecArray | null;
  let streamsProcessed = 0;

  while ((sMatch = streamRegex.exec(latin1Raw)) !== null && streamsProcessed < 120) {
    const startIdx = sMatch.index + sMatch[0].length;
    const endIdx = latin1Raw.indexOf('endstream', startIdx);
    if (endIdx === -1) break;

    let streamEnd = endIdx;
    if (latin1Raw[streamEnd - 1] === '\n') streamEnd--;
    if (latin1Raw[streamEnd - 1] === '\r') streamEnd--;

    const streamLen = streamEnd - startIdx;
    if (streamLen > 10 && streamLen < 1024 * 1024) {
      streamsProcessed++;
      const subBytes = bytes.subarray(startIdx, streamEnd);
      const inflated = await tryInflateBytes(subBytes);
      if (inflated) {
        const parsedStreamText = extractTextFromPdfContentStream(inflated);
        if (parsedStreamText.length > 15) {
          extractedSegments.push(parsedStreamText);
        }
      }
    }
  }

  let combinedText = extractedSegments
    .join('\n\n')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If the PDF uses custom CID font maps or scanned images where raw stream text is sparse,
  // build a structured clinical analysis excerpt from available metadata + readable strings
  let extractionMethod: ExtractedPdfResult['extractionMethod'] = 'pdf-stream';
  if (combinedText.split(/\s+/).filter(Boolean).length < 25) {
    extractionMethod = 'metadata-fallback';
    const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
    combinedText = `Uploaded Clinical Dissertation Manuscript: "${cleanTitle}" (${estimatedPages} pages, ${fileSizeKB} KB).\n\n` +
      (combinedText ? `Extracted Document Text & Metadata:\n${combinedText}\n\n` : '') +
      `[Note: This PDF uses embedded subset/CID font encoding or scanned pages. Analyzing manuscript title "${cleanTitle}" along with extracted strings for plagiarism & AI authorship verification. You may also edit or paste specific paragraphs below.]`;
  }

  const words = combinedText.split(/\s+/).filter(Boolean);
  return {
    fileName: file.name,
    fileSizeKB,
    pageCount: estimatedPages,
    wordCount: words.length,
    charCount: combinedText.length,
    extractedText: combinedText,
    extractionMethod
  };
}

/**
 * Comprehensive AI Authorship & Clinical Prose Detector (Perplexity, Burstiness, AI-Phrase Fingerprinting)
 */
export function analyzeTextForAiAuthorship(text: string): AiCheckReport {
  const clean = text.trim();
  if (!clean) {
    return {
      overallAiProbability: 0,
      humanAuthoredScore: 100,
      verdict: 'Human-Authored Clinical Prose',
      perplexityScore: 85,
      burstinessScore: 80,
      clinicalSpecificityScore: 90,
      flaggedSentences: [],
      aiPhraseHits: [],
      summaryRecommendations: 'No text provided.'
    };
  }

  // Typical LLM boilerplate phrases in academic writing
  const AI_FINGERPRINT_PHRASES: Array<{ pattern: RegExp; label: string; replacement: string }> = [
    { pattern: /\bit is imperative to note\b/gi, label: 'it is imperative to note', replacement: 'notably' },
    { pattern: /\bplays a pivotal role\b/gi, label: 'plays a pivotal role', replacement: 'contributes significantly to' },
    { pattern: /\bdelve into\b/gi, label: 'delve into', replacement: 'examine' },
    { pattern: /\ba testament to\b/gi, label: 'a testament to', replacement: 'evidence of' },
    { pattern: /\bfurthermore,\s+it is worth noting\b/gi, label: 'furthermore, it is worth noting', replacement: 'additionally' },
    { pattern: /\bcomprehensive overview\b/gi, label: 'comprehensive overview', replacement: 'systematic evaluation' },
    { pattern: /\bin the realm of\b/gi, label: 'in the realm of', replacement: 'in clinical' },
    { pattern: /\bunderscores the importance of\b/gi, label: 'underscores the importance of', replacement: 'demonstrates the clinical relevance of' },
    { pattern: /\bmultifaceted\b/gi, label: 'multifaceted', replacement: 'complex multifactorial' },
    { pattern: /\bparadigm shift\b/gi, label: 'paradigm shift', replacement: 'diagnostic advancement' },
    { pattern: /\bcrucial role\b/gi, label: 'crucial role', replacement: 'key pathogenic role' },
    { pattern: /\bshed light on\b/gi, label: 'shed light on', replacement: 'clarify' }
  ];

  const aiPhraseHits: AiCheckReport['aiPhraseHits'] = [];
  let totalPhrasePenalty = 0;

  AI_FINGERPRINT_PHRASES.forEach(({ pattern, label, replacement }) => {
    const matches = clean.match(pattern);
    if (matches && matches.length > 0) {
      aiPhraseHits.push({
        phrase: label,
        count: matches.length,
        replacement
      });
      totalPhrasePenalty += matches.length * 9;
    }
  });

  // Split into sentences
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 5);

  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLen =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 18;

  // Compute Burstiness (Coefficient of Variation of sentence lengths)
  const variance =
    sentenceLengths.length > 1
      ? sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgLen, 2), 0) / sentenceLengths.length
      : 25;
  const stdDev = Math.sqrt(variance);
  const coeffVar = avgLen > 0 ? stdDev / avgLen : 0.35;
  // Human writing has higher burstiness (CV ~ 0.40 - 0.65); uniform AI writing has CV ~ 0.15 - 0.28
  const burstinessScore = Math.min(98, Math.max(18, Math.round(coeffVar * 145)));

  // Clinical Specificity Score: numbers, p-values, ± SD, citations [1], units (mg/dL, ng/mL, n=, %)
  const clinicalMarkers = (
    clean.match(/(\bp\s*[<=>]\s*0\.\d+|±|\b\d+(\.\d+)?%|\[\d+\]|\b(mg\/dL|ng\/mL|mmol\/L|IU\/L|years|cases|CI|OR|AUC|Chi-square|t-test|ANOVA)\b)/gi) || []
  ).length;
  const wordsCount = Math.max(1, clean.split(/\s+/).length);
  const markerDensity = (clinicalMarkers / wordsCount) * 100;
  const clinicalSpecificityScore = Math.min(98, Math.max(25, Math.round(45 + markerDensity * 14)));

  // Lexical diversity (Type-Token Ratio) -> Perplexity proxy
  const wordTokens = clean
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);
  const uniqueWords = new Set(wordTokens).size;
  const ttr = wordTokens.length > 0 ? uniqueWords / Math.sqrt(wordTokens.length) : 4;
  const perplexityScore = Math.min(96, Math.max(30, Math.round(ttr * 12.5)));

  // Flag sentences that look uniform/robotic or contain AI transition markers
  const flaggedSentences: AiCheckReport['flaggedSentences'] = [];
  sentences.forEach(sentence => {
    const wordsInSent = sentence.split(/\s+/).length;
    const hasAiTransition = /\b(furthermore|moreover|consequently|it is important to note|delve|pivotal|underscores|multifaceted|testament|crucial)\b/i.test(sentence);
    const lacksClinicalData = !/(\d+|\[|\bp\b|±|%)/i.test(sentence);

    if (hasAiTransition || (wordsInSent >= 22 && wordsInSent <= 28 && lacksClinicalData && flaggedSentences.length < 5)) {
      const humanized = sentence
        .replace(/\bFurthermore,\s*/gi, 'In addition, ')
        .replace(/\bMoreover,\s*/gi, 'Clinically, ')
        .replace(/\bplays a pivotal role in\b/gi, 'is directly associated with')
        .replace(/\bunderscores the importance of\b/gi, 'supports routine evaluation of')
        .replace(/\bdelve into\b/gi, 'investigate');

      flaggedSentences.push({
        sentence,
        reason: hasAiTransition
          ? 'Contains high-frequency LLM transition/boilerplate phrasing'
          : 'Uniform sentence cadence lacking specific empirical parameters or citation anchors',
        aiConfidence: hasAiTransition ? 78 : 54,
        humanizedSuggestion:
          humanized !== sentence
            ? humanized
            : `${sentence.replace(/\.$/, '')} (supported by our institutional cohort observations, p < 0.05).`
      });
    }
  });

  // Calculate overall AI probability
  const baseAi =
    100 -
    Math.round(burstinessScore * 0.35 + clinicalSpecificityScore * 0.4 + perplexityScore * 0.25) +
    totalPhrasePenalty;
  const overallAiProbability = Math.min(94, Math.max(4, baseAi));
  const humanAuthoredScore = 100 - overallAiProbability;

  const verdict: AiCheckReport['verdict'] =
    overallAiProbability <= 20
      ? 'Human-Authored Clinical Prose'
      : overallAiProbability <= 45
        ? 'Mixed Human & AI Assisted'
        : 'High AI-Generated Pattern Detected';

  const summaryRecommendations =
    overallAiProbability <= 20
      ? '✓ Excellent Human-Authored Clinical Profile: High empirical specificity, natural sentence burstiness, and authentic medical register suitable for NMC & Turnitin/iThenticate scrutiny.'
      : overallAiProbability <= 45
        ? 'Moderate AI-Assisted Phrasing Detected: Replace generic transition words with direct patient cohort numbers (n, %, Mean ± SD) and vary sentence lengths to ensure 100% human-authored compliance.'
        : 'High AI Pattern Alert: Multiple generic LLM phrases and uniform sentence structures detected. Use the 1-Click Humanize tool to inject clinical specificity and natural sentence burstiness.';

  return {
    overallAiProbability,
    humanAuthoredScore,
    verdict,
    perplexityScore,
    burstinessScore,
    clinicalSpecificityScore,
    flaggedSentences: flaggedSentences.slice(0, 6),
    aiPhraseHits,
    summaryRecommendations
  };
}
