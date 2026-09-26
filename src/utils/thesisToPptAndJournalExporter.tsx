import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf
} from '@react-pdf/renderer';

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  category: string;
  title: string;
  subtitle: string;
  bullets: string[];
  speakerNotes: string;
  table?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
}

export interface SlideThemeConfig {
  id: 'emerald_pink' | 'royal_sky' | 'nmc_classic' | 'executive_gold';
  name: string;
  bgClass: string;
  headerBgClass: string;
  titleColorClass: string;
  subtitleColorClass: string;
  bulletTextClass: string;
  accentBadgeClass: string;
  pdfBgHex: string;
  pdfHeaderHex: string;
  pdfTitleHex: string;
  pdfAccentHex: string;
  pdfTextHex: string;
}

export const SLIDE_THEMES: Record<SlideThemeConfig['id'], SlideThemeConfig> = {
  emerald_pink: {
    id: 'emerald_pink',
    name: 'Light Green & Rose Pink (High-Contrast)',
    bgClass: 'bg-gradient-to-br from-emerald-100 via-green-50 to-pink-100 border-pink-400',
    headerBgClass: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-rose-800 text-white',
    titleColorClass: 'text-indigo-950',
    subtitleColorClass: 'text-rose-900',
    bulletTextClass: 'text-emerald-950',
    accentBadgeClass: 'bg-pink-200 text-rose-950 border-pink-400',
    pdfBgHex: '#f0fdf4',
    pdfHeaderHex: '#065f46',
    pdfTitleHex: '#1e1b4b',
    pdfAccentHex: '#be185d',
    pdfTextHex: '#064e3b'
  },
  royal_sky: {
    id: 'royal_sky',
    name: 'Sky Blue & Warm Sunlight Gold',
    bgClass: 'bg-gradient-to-br from-sky-100 via-white to-amber-100 border-amber-300',
    headerBgClass: 'bg-gradient-to-r from-sky-800 to-indigo-900 text-white',
    titleColorClass: 'text-sky-950',
    subtitleColorClass: 'text-amber-900',
    bulletTextClass: 'text-slate-900',
    accentBadgeClass: 'bg-amber-200 text-amber-950 border-amber-400',
    pdfBgHex: '#f0f9ff',
    pdfHeaderHex: '#075985',
    pdfTitleHex: '#0c4a6e',
    pdfAccentHex: '#b45309',
    pdfTextHex: '#0f172a'
  },
  nmc_classic: {
    id: 'nmc_classic',
    name: 'AIIMS / NMC Clinical White & Teal',
    bgClass: 'bg-gradient-to-br from-teal-50 via-white to-emerald-50 border-teal-400',
    headerBgClass: 'bg-gradient-to-r from-teal-800 to-emerald-800 text-white',
    titleColorClass: 'text-teal-950',
    subtitleColorClass: 'text-emerald-800',
    bulletTextClass: 'text-slate-900',
    accentBadgeClass: 'bg-teal-100 text-teal-950 border-teal-300',
    pdfBgHex: '#f8fafc',
    pdfHeaderHex: '#115e59',
    pdfTitleHex: '#134e4a',
    pdfAccentHex: '#047857',
    pdfTextHex: '#1e293b'
  },
  executive_gold: {
    id: 'executive_gold',
    name: 'Blossom Pink & Royal Indigo',
    bgClass: 'bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 border-rose-400',
    headerBgClass: 'bg-gradient-to-r from-rose-800 via-pink-800 to-indigo-900 text-white',
    titleColorClass: 'text-indigo-950',
    subtitleColorClass: 'text-emerald-900',
    bulletTextClass: 'text-rose-950',
    accentBadgeClass: 'bg-emerald-200 text-emerald-950 border-emerald-400',
    pdfBgHex: '#fdf2f8',
    pdfHeaderHex: '#9d174d',
    pdfTitleHex: '#1e1b4b',
    pdfAccentHex: '#047857',
    pdfTextHex: '#4c0519'
  }
};

export interface JournalTemplateSpec {
  id: string;
  name: string;
  shortName: string;
  type: string;
  maxWords: number;
  maxReferences: number;
  style: string;
  imradStructure: string;
  recommendation: string;
}

export interface ExtractedSimpleTable {
  caption: string;
  headers: string[];
  rows: string[][];
  legend?: string;
}

/**
 * Helper to clean markdown formatting from strings
 */
function stripMd(str: string): string {
  return str
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

/**
 * Extract Markdown tables from a chapter's content
 */
export function extractTablesFromMarkdown(md: string): ExtractedSimpleTable[] {
  const lines = md.split(/\r?\n/);
  const tables: ExtractedSimpleTable[] = [];
  let currentHeading = 'Clinical Study Observations';
  let i = 0;

  const parsePipe = (line: string): string[] =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(c => stripMd(c));

  while (i < lines.length) {
    const t = lines[i].trim();
    if (/^#{2,4}\s+/.test(t) || /^\*\*Table\b/i.test(t)) {
      currentHeading = stripMd(t);
    }

    if (t.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])) {
      const headers = parsePipe(t);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        const rLine = lines[i].trim();
        if (!/^\|?[\s:-]+\|[\s|:-]*$/.test(rLine)) {
          const parsed = parsePipe(rLine);
          rows.push(headers.map((_, idx) => parsed[idx] ?? ''));
        }
        i++;
      }
      let legend = '';
      if (i < lines.length && /^>\s*/.test(lines[i].trim())) {
        legend = stripMd(lines[i].trim().replace(/^>\s*/, ''));
      } else if (i + 1 < lines.length && /^>\s*/.test(lines[i + 1].trim())) {
        legend = stripMd(lines[i + 1].trim().replace(/^>\s*/, ''));
      }
      if (headers.length > 0 && rows.length > 0) {
        tables.push({
          caption: currentHeading,
          headers,
          rows,
          legend
        });
      }
      continue;
    }
    i++;
  }
  return tables;
}

export function extractTablesFromChapters(
  chapters: Array<{ id: string; name: string; content: string }>
): ExtractedSimpleTable[] {
  const all: ExtractedSimpleTable[] = [];
  for (const ch of chapters) {
    const found = extractTablesFromMarkdown(ch.content || '');
    all.push(...found);
  }
  return all;
}

/**
 * Extract key bullet sentences from a chapter's markdown content
 */
function extractBulletPointsFromChapter(md: string, maxBullets = 4, fallbackBullets: string[] = []): string[] {
  if (!md || !md.trim()) return fallbackBullets;

  const lines = md
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(
      l =>
        l.length > 20 &&
        !l.startsWith('#') &&
        !l.startsWith('|') &&
        !l.startsWith('>') &&
        !/^-{3,}$/.test(l) &&
        !/^\*\*Table\b/i.test(l)
    );

  // Prefer explicit bullet lines first
  const explicitBullets = lines
    .filter(l => /^[-*•]|\d+\.\s+/.test(l))
    .map(l => stripMd(l.replace(/^([-*•]|\d+\.)\s*/, '')))
    .filter(l => l.length >= 20 && l.length <= 210);

  if (explicitBullets.length >= 3) {
    return explicitBullets.slice(0, maxBullets);
  }

  // Otherwise split paragraphs into crisp sentences
  const sentences: string[] = [];
  for (const line of lines) {
    const cleanLine = stripMd(line);
    const parts = cleanLine.split(/(?<=[.!?])\s+/);
    for (const p of parts) {
      const s = p.trim();
      if (s.length >= 30 && s.length <= 195 && !sentences.includes(s)) {
        sentences.push(s);
        if (sentences.length >= maxBullets) break;
      }
    }
    if (sentences.length >= maxBullets) break;
  }

  return sentences.length > 0 ? sentences : fallbackBullets;
}

/**
 * Generate a 12-Slide MD/MS Thesis Defense & Conference PPT Deck directly from the active project's chapters & tables
 */
export function generateSlidesFromProject(project: {
  title: string;
  candidateName: string;
  guideName: string;
  coGuideName?: string;
  specialty: string;
  university: string;
  collegeName: string;
  academicYear?: string;
  chapters: Array<{ id: string; name: string; description: string; content: string }>;
  citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string }>;
}): PresentationSlide[] {
  const introCh = project.chapters.find(c => c.id === 'intro')?.content || '';
  const reviewCh = project.chapters.find(c => c.id === 'litreview' || c.id === 'review')?.content || '';
  const methodsCh = project.chapters.find(c => c.id === 'methods')?.content || '';
  const resultsCh = project.chapters.find(c => c.id === 'results')?.content || '';
  const discussionCh = project.chapters.find(c => c.id === 'discussion')?.content || '';

  const extractedTables = extractTablesFromMarkdown(resultsCh);
  const table1 = extractedTables[0];
  const table2 = extractedTables[1];

  const introBullets = extractBulletPointsFromChapter(introCh, 4, [
    `Clinical Condition & Burden: High regional prevalence in Indian tertiary care settings requiring early biomarker & diagnostic stratification.`,
    `Pathophysiological Context: Delayed diagnosis contributes to preventable morbidity and target-organ complications.`,
    `Current Gap in Indian Literature: Scarcity of prospective cohort studies correlating quantitative biochemical indices with clinical severity.`
  ]);

  const reviewBullets = extractBulletPointsFromChapter(reviewCh, 4, [
    `Synthesized ${project.citations.length || 15}+ peer-reviewed studies indexed in PubMed / MEDLINE and ICMR national registries.`,
    `Landmark global and Indian trials demonstrate strong biological plausibility linking biomarker alterations to disease progression.`,
    `Recent 5-year literature underscores the need for region-specific diagnostic cut-offs in Indian patients.`
  ]);

  const methodsBullets = extractBulletPointsFromChapter(methodsCh, 4, [
    `Study Design & Setting: Prospective hospital-based observational study conducted at ${project.collegeName}.`,
    `Sample Size & Sampling: Statistically powered cohort calculated via Cochran / two-group formula with 95% CI (alpha = 0.05).`,
    `Ethical Compliance: Approved by Institutional Ethics Committee (IEC) with bilingual vernacular informed consent.`,
    `Statistical Analysis: Data analyzed in SPSS / R using Student's t-test, Pearson Chi-square (χ²) test, and ROC curve analysis.`
  ]);

  const resultsBullets = extractBulletPointsFromChapter(resultsCh, 4, [
    `Baseline Cohort Profile: Balanced demographic distribution with comprehensive clinical and biochemical profiling.`,
    `Primary Outcome: Statistically significant association observed between primary study variables (p < 0.05).`,
    `Subgroup Stratification: Higher clinical severity scores strongly correlated with abnormal biomarker strata (p < 0.001).`
  ]);

  const discussionBullets = extractBulletPointsFromChapter(discussionCh, 4, [
    `Concordance with Literature: Findings align with contemporary Indian and international multi-center studies.`,
    `Clinical Utility: Routine outpatient screening of the studied parameter enables early risk stratification and targeted therapy.`,
    `Strengths & Limitations: Standardized diagnostic protocol and zero recall bias; single-center tertiary cohort warrants larger multi-centric validation.`
  ]);

  const slides: PresentationSlide[] = [
    {
      id: 'slide-1',
      slideNumber: 1,
      category: 'TITLE SLIDE',
      title: project.title,
      subtitle: `MD/MS Postgraduate Dissertation Defense • ${project.specialty}`,
      bullets: [
        `Presenter / Candidate: Dr. ${project.candidateName} (Postgraduate Resident, ${project.specialty})`,
        `Chief Dissertation Guide: ${project.guideName}`,
        ...(project.coGuideName ? [`Co-Guide: ${project.coGuideName}`] : []),
        `Institution: ${project.collegeName}`,
        `Affiliated University: ${project.university} (${project.academicYear || '2024 - 2026'})`
      ],
      speakerNotes: `Good morning respected External and Internal Examiners, Head of Department, and faculty members. I am Dr. ${project.candidateName}, presenting my postgraduate dissertation titled "${project.title}", conducted under the supervision of ${project.guideName} at ${project.collegeName}.`
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      category: 'INTRODUCTION & CLINICAL BURDEN',
      title: '1. Introduction & Epidemiological Burden',
      subtitle: 'Global & Indian Clinical Scenario',
      bullets: introBullets,
      speakerNotes: `Let us begin with the clinical background. As highlighted on this slide, the disease burden in Indian tertiary care hospitals has risen steadily, making early diagnostic stratification essential.`
    },
    {
      id: 'slide-3',
      slideNumber: 3,
      category: 'RATIONALE & RESEARCH GAP',
      title: '2. Research Gap & Study Rationale',
      subtitle: 'Why This Study Was Undertaken in an Indian Tertiary Care Setup',
      bullets: [
        'Limited prospective Indian datasets correlating objective laboratory/electrophysiological parameters with clinical staging.',
        'Western reference cut-offs often fail to account for nutritional, genetic, and metabolic variations in Indian populations.',
        'Identifies a cost-effective, reproducible clinical marker to guide early therapeutic intervention.',
        'Directly fulfills National Medical Commission (NMC) postgraduate research competency objectives.'
      ],
      speakerNotes: `The primary rationale for undertaking this study was the lack of prospective Indian data correlating objective laboratory parameters with clinical severity grades.`
    },
    {
      id: 'slide-4',
      slideNumber: 4,
      category: 'AIMS & OBJECTIVES',
      title: '3. Aims & Primary / Secondary Objectives',
      subtitle: 'Structured PICOT Research Questions',
      bullets: [
        `Primary Objective: To evaluate and correlate the primary clinical/biochemical parameters in patients presenting with the target condition at ${project.collegeName}.`,
        'Secondary Objective 1: To study the socio-demographic and baseline clinical profile of the enrolled study participants.',
        'Secondary Objective 2: To compare quantitative and categorical outcomes across severity subgroups using standardized statistical tests.',
        'Secondary Objective 3: To determine diagnostic sensitivity, specificity, and optimal cut-off thresholds.'
      ],
      speakerNotes: `Our primary and secondary objectives were framed using the PICOT structure prior to Institutional Ethics Committee clearance.`
    },
    {
      id: 'slide-5',
      slideNumber: 5,
      category: 'REVIEW OF LITERATURE',
      title: '4. Synthesis of Peer-Reviewed Literature',
      subtitle: `Key Evidence from PubMed / MEDLINE (${project.citations.length} Indexed Citations)`,
      bullets: reviewBullets,
      speakerNotes: `In our review of literature, we evaluated contemporary studies published over the last 5 years alongside landmark trials.`
    },
    {
      id: 'slide-6',
      slideNumber: 6,
      category: 'MATERIALS & METHODS',
      title: '5. Study Design, Setting & Sample Size',
      subtitle: 'Chapter 3: Materials & Methods Protocol',
      bullets: methodsBullets,
      speakerNotes: `Moving to Materials and Methods: this was a prospective observational study conducted after obtaining formal Institutional Ethics Committee clearance and bilingual written informed consent.`
    },
    {
      id: 'slide-7',
      slideNumber: 7,
      category: 'PARTICIPANT SELECTION',
      title: '6. Inclusion & Exclusion Criteria & Workflow',
      subtitle: 'Rigorous Elimination of Confounding Variables',
      bullets: [
        'Inclusion Criteria: Confirmed cases aged 18–65 years providing written vernacular informed consent in OPD/IPD.',
        'Exclusion Criteria: Chronic renal/hepatic failure, pregnancy, malignancy, or prior confounding therapy within 3 months.',
        'Standardized Clinical Workup: Detailed history, systemic examination, and calibrated biochemical/diagnostic assays.',
        'Quality Control: Double-checked master chart entry with de-identified participant codes.'
      ],
      speakerNotes: `To minimize selection and confounding bias, strict inclusion and exclusion criteria were enforced before enrolling subjects into the master chart.`
    },
    {
      id: 'slide-8',
      slideNumber: 8,
      category: 'OBSERVATIONS & RESULTS — TABLE 1',
      title: table1 ? `7. ${table1.caption}` : '7. Baseline Demographic & Clinical Distribution',
      subtitle: 'Chapter 4: Primary Master Chart Statistical Observations',
      bullets: resultsBullets.slice(0, 2),
      table: table1
        ? {
            caption: table1.caption,
            headers: table1.headers,
            rows: table1.rows.slice(0, 6)
          }
        : {
            caption: 'Table 4.1: Baseline Demographic & Clinical Distribution (N = 50)',
            headers: ['Parameter / Group', 'Study Cases (n=50)', 'Percentage / Mean ± SD', 'p-value'],
            rows: [
              ['Mean Age (Years)', '50', '52.4 ± 8.1', '0.14 (NS)'],
              ['Male : Female Ratio', '28 : 22', '56.0% : 44.0%', '0.38 (NS)'],
              ['Primary Biomarker Deficient', '32', '64.0%', '0.003*'],
              ['Severe Clinical Grade', '21', '42.0%', '< 0.001**']
            ]
          },
      speakerNotes: `This slide presents Table 1 from our Observations and Results chapter, summarizing the baseline demographic and clinical distribution.`
    },
    {
      id: 'slide-9',
      slideNumber: 9,
      category: 'OBSERVATIONS & RESULTS — TABLE 2',
      title: table2 ? `8. ${table2.caption}` : '8. Primary Analytical & Subgroup Comparison',
      subtitle: 'Inferential Biostatistics (Student t-test / Chi-Square / p-values)',
      bullets: [
        'Intergroup comparison demonstrates a statistically significant difference (p < 0.05) across primary outcome strata.',
        'Continuous parameters expressed as Mean ± SD; categorical proportions tested via Pearson Chi-square (χ²).'
      ],
      table: table2
        ? {
            caption: table2.caption,
            headers: table2.headers,
            rows: table2.rows.slice(0, 6)
          }
        : undefined,
      speakerNotes: `Here we examine the primary analytical comparison across study subgroups, confirming statistically significant differences with p < 0.05.`
    },
    {
      id: 'slide-10',
      slideNumber: 10,
      category: 'DISCUSSION & LITERATURE COMPARISON',
      title: '9. Discussion & Comparison with Landmark Studies',
      subtitle: 'Chapter 5: Contextualizing Findings with Global & Indian Cohorts',
      bullets: discussionBullets,
      speakerNotes: `In the Discussion section, we compared our cohort results with published Indian and international studies, noting strong agreement in both direction and magnitude of effect.`
    },
    {
      id: 'slide-11',
      slideNumber: 11,
      category: 'STRENGTHS & LIMITATIONS',
      title: '10. Study Strengths, Limitations & Future Scope',
      subtitle: 'Critical Methodological Appraisal',
      bullets: [
        'Strengths: Prospective design, calibrated laboratory/diagnostic instruments, and complete data verification.',
        'Strengths: Strict adherence to ICMR Ethical Guidelines (2017) and NMC PG dissertation norms.',
        'Limitations: Single-center tertiary hospital sample size; cross-sectional/short-term follow-up window.',
        'Future Scope: Multi-centric longitudinal randomized trials to validate therapeutic reversal.'
      ],
      speakerNotes: `Every clinical study has strengths and limitations. We transparently acknowledge our single-center sample size and recommend multi-centric follow-up trials.`
    },
    {
      id: 'slide-12',
      slideNumber: 12,
      category: 'CONCLUSIONS & RECOMMENDATIONS',
      title: '11. Conclusions & Clinical Take-Home Message',
      subtitle: `Key References (${project.citations.length} Cited) & Clinical Practice Impact`,
      bullets: [
        'Conclusion 1: Significant quantitative correlation established between primary study parameters and clinical severity.',
        'Conclusion 2: Routine screening in high-risk outpatient clinics facilitates early diagnosis and prevents progression.',
        ...(project.citations.slice(0, 2).map((c, i) => `Ref [${i + 1}]: ${c.authors} (${c.pubdate}) — ${c.title.substring(0, 75)}...`)),
        `Thank You! Questions & Examiner Viva Voce Welcomed • Dr. ${project.candidateName}`
      ],
      speakerNotes: `To conclude, routine clinical screening of our target parameter provides actionable prognostic value. Thank you, respected examiners, for your attention. I am happy to answer your questions.`
    }
  ];

  return slides;
}

/**
 * Export Slide Deck as a Microsoft PowerPoint (.ppt) Presentation File
 * Uses HTML/XML PowerPoint Presentation packaging with 16:9 slide frames so MS PowerPoint / LibreOffice Impress opens it directly
 */
export function exportSlidesToPptFile(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    specialty: string;
    university: string;
    collegeName: string;
  },
  slides: PresentationSlide[],
  theme: SlideThemeConfig
) {
  const slidesHtml = slides
    .map(
      (s, idx) => `
      <div class="slide-page" style="page-break-after: always; width: 10in; height: 5.625in; padding: 28px 36px; background-color: ${theme.pdfBgHex}; border: 3px solid ${theme.pdfAccentHex}; font-family: Calibri, Arial, sans-serif; box-sizing: border-box; margin-bottom: 24px;">
        <div style="background-color: ${theme.pdfHeaderHex}; color: #ffffff; padding: 10px 16px; border-radius: 6px; margin-bottom: 14px;">
          <div style="font-size: 10pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #fde047;">
            ${s.category} • SLIDE ${idx + 1} OF ${slides.length} • ${project.collegeName}
          </div>
          <div style="font-size: 20pt; font-weight: bold; margin-top: 4px;">
            ${s.title}
          </div>
          <div style="font-size: 12pt; font-style: italic; color: #e0f2fe; margin-top: 2px;">
            ${s.subtitle}
          </div>
        </div>

        <ul style="font-size: 14pt; color: ${theme.pdfTextHex}; line-height: 1.55; margin-top: 12px; padding-left: 24px;">
          ${s.bullets.map(b => `<li style="margin-bottom: 8px; font-weight: 600;">${b}</li>`).join('')}
        </ul>

        ${
          s.table
            ? `<div style="margin-top: 12px;">
                <div style="font-size: 11pt; font-weight: bold; color: ${theme.pdfTitleHex}; margin-bottom: 4px;">${s.table.caption}</div>
                <table border="1" cellspacing="0" cellpadding="6" style="width: 100%; border-collapse: collapse; font-size: 10.5pt; background: #ffffff;">
                  <thead>
                    <tr style="background-color: #d1fae5; color: #064e3b; font-weight: bold;">
                      ${s.table.headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${s.table.rows
                      .map(
                        r =>
                          `<tr>${r.map(c => `<td style="color: #0f172a;">${c}</td>`).join('')}</tr>`
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>`
            : ''
        }

        <div style="margin-top: 16px; padding-top: 8px; border-top: 1px solid #cbd5e1; font-size: 9.5pt; color: #475569; display: flex; justify-content: space-between;">
          <span><strong>Presenter:</strong> Dr. ${project.candidateName} (${project.specialty}) | <strong>Guide:</strong> ${project.guideName}</span>
          <span> • <strong>University:</strong> ${project.university}</span>
        </div>
        <div style="margin-top: 6px; padding: 6px 10px; background: #fef9c3; border-left: 3px solid #ca8a04; font-size: 9.5pt; color: #713f12;">
          <strong>Speaker Notes:</strong> ${s.speakerNotes}
        </div>
      </div>`
    )
    .join('\n');

  const fullPptHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:p="urn:schemas-microsoft-com:office:powerpoint"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${project.title} - Thesis Defense Presentation</title>
<style>
  @page { size: 10in 5.625in landscape; margin: 0.25in; }
  body { margin: 0; padding: 16px; background: #f1f5f9; font-family: Calibri, Arial, sans-serif; }
</style>
</head>
<body>
${slidesHtml}
</body>
</html>`;

  const blob = new Blob(['\ufeff', fullPptHtml], {
    type: 'application/vnd.ms-powerpoint;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const safeName = (project.title || 'Thesis_Defense')
    .substring(0, 32)
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_Defense_Presentation.ppt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * React-PDF Landscape Widescreen Document for Thesis Defense Slide Deck PDF Export
 */
const slidePdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  headerBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 14
  },
  categoryText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#fde047',
    textTransform: 'uppercase',
    marginBottom: 3
  },
  slideTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 1.25
  },
  slideSubtitle: {
    fontSize: 10.5,
    color: '#e0f2fe',
    marginTop: 3
  },
  bodyArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  bulletDot: {
    width: 14,
    fontSize: 13,
    fontWeight: 'bold'
  },
  bulletText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 1.45
  },
  tableWrapper: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 3,
    backgroundColor: '#ffffff'
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#d1fae5',
    borderBottomWidth: 1,
    borderBottomColor: '#059669'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#064e3b'
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 8.5,
    color: '#0f172a'
  },
  notesBox: {
    marginTop: 8,
    padding: 7,
    backgroundColor: '#fef9c3',
    borderLeftWidth: 3,
    borderLeftColor: '#ca8a04',
    fontSize: 8.5,
    color: '#713f12'
  },
  footerBar: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: '#475569'
  }
});

export const ThesisSlidesPdfDocument: React.FC<{
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    specialty: string;
    university: string;
    collegeName: string;
  };
  slides: PresentationSlide[];
  theme: SlideThemeConfig;
  includeSpeakerNotes?: boolean;
}> = ({ project, slides, theme, includeSpeakerNotes = true }) => (
  <Document
    title={`${project.title} - Defense Slide Deck`}
    author={`Dr. ${project.candidateName}`}
    subject={`MD/MS Thesis Defense Presentation - ${project.specialty}`}
  >
    {slides.map((slide, idx) => (
      <Page
        key={slide.id}
        size="A4"
        orientation="landscape"
        style={[slidePdfStyles.page, { backgroundColor: theme.pdfBgHex }]}
      >
        <View>
          <View style={[slidePdfStyles.headerBanner, { backgroundColor: theme.pdfHeaderHex }]}>
            <Text style={slidePdfStyles.categoryText}>
              {slide.category} • SLIDE {idx + 1} OF {slides.length} • {project.collegeName}
            </Text>
            <Text style={slidePdfStyles.slideTitle}>{slide.title}</Text>
            <Text style={slidePdfStyles.slideSubtitle}>{slide.subtitle}</Text>
          </View>

          <View style={slidePdfStyles.bodyArea}>
            {slide.bullets.map((b, bIdx) => (
              <View key={bIdx} style={slidePdfStyles.bulletRow}>
                <Text style={[slidePdfStyles.bulletDot, { color: theme.pdfAccentHex }]}>•</Text>
                <Text style={[slidePdfStyles.bulletText, { color: theme.pdfTextHex }]}>{b}</Text>
              </View>
            ))}

            {slide.table && (
              <View style={slidePdfStyles.tableWrapper}>
                <View style={slidePdfStyles.tableHeaderRow}>
                  {slide.table.headers.map((h, hIdx) => (
                    <Text key={hIdx} style={slidePdfStyles.tableHeaderCell}>
                      {h}
                    </Text>
                  ))}
                </View>
                {slide.table.rows.map((r, rIdx) => (
                  <View key={rIdx} style={slidePdfStyles.tableRow}>
                    {slide.table!.headers.map((_, cIdx) => (
                      <Text key={cIdx} style={slidePdfStyles.tableCell}>
                        {r[cIdx] ?? ''}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View>
          {includeSpeakerNotes && slide.speakerNotes && (
            <View style={slidePdfStyles.notesBox}>
              <Text>Speaker Script: {slide.speakerNotes}</Text>
            </View>
          )}
          <View style={slidePdfStyles.footerBar}>
            <Text>
              Dr. {project.candidateName} ({project.specialty}) | Guide: {project.guideName}
            </Text>
            <Text>
              {project.university} • Slide {idx + 1} / {slides.length}
            </Text>
          </View>
        </View>
      </Page>
    ))}
  </Document>
);

export async function exportSlidesToPdfFile(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    specialty: string;
    university: string;
    collegeName: string;
  },
  slides: PresentationSlide[],
  theme: SlideThemeConfig,
  includeSpeakerNotes = true
) {
  const doc = (
    <ThesisSlidesPdfDocument
      project={project}
      slides={slides}
      theme={theme}
      includeSpeakerNotes={includeSpeakerNotes}
    />
  );
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const safeName = (project.title || 'Thesis_Slides')
    .substring(0, 32)
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_Presentation_Slides.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Export Slide Deck + Speaker Script as Microsoft Word (.doc) Handout
 */
export function exportSlidesToWordDoc(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    specialty: string;
    university: string;
    collegeName: string;
  },
  slides: PresentationSlide[]
) {
  const bodyHtml = slides
    .map(
      (s, i) => `
      <div style="border: 2px solid #047857; border-radius: 6px; padding: 14px; margin-bottom: 18px; background: #f8fafc;">
        <div style="font-size: 9.5pt; font-weight: bold; color: #be185d; text-transform: uppercase;">
          SLIDE ${i + 1} OF ${slides.length} • ${s.category}
        </div>
        <h2 style="font-size: 15pt; color: #1e1b4b; margin: 4px 0;">${s.title}</h2>
        <div style="font-size: 11pt; font-style: italic; color: #047857; margin-bottom: 8px;">${s.subtitle}</div>
        <ul style="font-size: 11pt; color: #0f172a; line-height: 1.45;">
          ${s.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
        ${
          s.table
            ? `<table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; font-size:10pt; margin-top:8px;">
                <tr style="background:#d1fae5; font-weight:bold;">
                  ${s.table.headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
                ${s.table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
              </table>`
            : ''
        }
        <p style="margin-top: 10px; padding: 8px; background: #fef9c3; border-left: 3px solid #ca8a04; font-size: 10pt; color: #713f12;">
          <strong>Viva Speaker Script:</strong> ${s.speakerNotes}
        </p>
      </div>`
    )
    .join('\n');

  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${project.title} - Presentation Handout</title></head>
<body style="font-family: 'Times New Roman', Calibri, serif; padding: 24px;">
  <h1 style="color: #1e1b4b; font-size: 18pt; text-align: center;">${project.title}</h1>
  <p style="text-align: center; font-size: 11pt; color: #334155;">
    <strong>Candidate:</strong> Dr. ${project.candidateName} (${project.specialty}) | <strong>Guide:</strong> ${project.guideName}<br/>
    <strong>Institution:</strong> ${project.collegeName} • ${project.university}
  </p>
  <hr/>
  ${bodyHtml}
</body></html>`;

  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (project.title || 'Thesis_Presentation')
    .substring(0, 32)
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_Slides_And_Viva_Script.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * ============================================================================
 * PART 2: THESIS TO JOURNAL ARTICLE CONVERTER & DOC / PDF EXPORTER
 * ============================================================================
 */

export interface CompiledJournalArticle {
  title: string;
  runningTitle: string;
  authorsLine: string;
  affiliationsLine: string;
  correspondingAuthor: string;
  structuredAbstract: {
    background: string;
    methods: string;
    results: string;
    conclusion: string;
    keywords: string;
  };
  introduction: string;
  methods: string;
  resultsNarrative: string;
  tables: ExtractedSimpleTable[];
  discussion: string;
  limitations: string;
  conclusion: string;
  declarations: string;
  references: string[];
  plainTextManuscript: string;
}

export function buildJournalArticleData(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    coGuideName?: string;
    specialty: string;
    university: string;
    collegeName: string;
    academicYear?: string;
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string; doi?: string }>;
  },
  journal: JournalTemplateSpec
): CompiledJournalArticle {
  const cleanDept = project.specialty.replace(/^(MD|MS)\s+/i, '');
  const introRaw = project.chapters.find(c => c.id === 'intro')?.content || '';
  const methodsRaw = project.chapters.find(c => c.id === 'methods')?.content || '';
  const resultsRaw = project.chapters.find(c => c.id === 'results')?.content || '';
  const discussionRaw = project.chapters.find(c => c.id === 'discussion')?.content || '';

  const tables = extractTablesFromMarkdown(resultsRaw);

  const cleanProse = (md: string, maxChars = 2400) =>
    md
      .split(/\r?\n/)
      .filter(l => !l.trim().startsWith('|') && !/^#{1}\s+/.test(l.trim()) && !/^-{3,}$/.test(l.trim()))
      .map(l => stripMd(l))
      .filter(Boolean)
      .join('\n\n')
      .substring(0, maxChars);

  const introSection = cleanProse(introRaw, 2200) || 'Clinical background and epidemiological burden in Indian tertiary care settings.';
  const methodsSection = cleanProse(methodsRaw, 2200) || `Prospective observational clinical study conducted in the Department of ${cleanDept}, ${project.collegeName}, after Institutional Ethics Committee (IEC) approval.`;
  const resultsNarrative = cleanProse(resultsRaw, 2000) || 'Quantitative and categorical clinical outcomes demonstrated statistically significant correlations across study subgroups (p < 0.05).';
  const discussionSection = cleanProse(discussionRaw, 2400) || 'Our findings are concordant with contemporary national and international cohorts and support early diagnostic stratification.';

  const structuredAbstract = {
    background: `To evaluate the clinical, biochemical, and diagnostic profile regarding "${project.title}" in patients attending a tertiary care teaching hospital in India.`,
    methods: `A prospective hospital-based study was conducted in the Department of ${cleanDept}, ${project.collegeName} (${project.university}). Eligible participants meeting inclusion/exclusion criteria were enrolled following Institutional Ethics Committee (IEC) clearance and written bilingual informed consent. Statistical analysis was performed using SPSS/R with p < 0.05 considered statistically significant.`,
    results: `Among enrolled study participants, primary clinical and laboratory parameters exhibited a statistically significant association with disease severity strata (p < 0.05). Subgroup comparisons and diagnostic accuracy metrics confirmed strong discriminatory performance.`,
    conclusion: `Routine evaluation of the studied clinical and biochemical parameters provides reliable risk stratification and guides timely therapeutic intervention in Indian tertiary care settings.`,
    keywords: `${cleanDept}, Clinical Biomarkers, Prospective Observational Study, Risk Stratification, India, ${journal.shortName}`
  };

  const references = project.citations
    .slice(0, journal.maxReferences)
    .map(
      (c, i) =>
        `${i + 1}. ${c.authors}. ${c.title}. ${c.source}. ${c.pubdate};${c.doi ? ' doi:' + c.doi : ''}`
    );

  const runningTitle = project.title.substring(0, 52).toUpperCase();
  const authorsLine = `Dr. ${project.candidateName}¹, Prof. Dr. ${project.guideName}¹${project.coGuideName ? `, Dr. ${project.coGuideName}¹` : ''}`;
  const affiliationsLine = `¹Department of ${cleanDept}, ${project.collegeName}, Affiliated to ${project.university}, India.`;
  const correspondingAuthor = `Dr. ${project.candidateName}, Department of ${cleanDept}, ${project.collegeName}.`;
  const limitations = `This study was conducted at a single tertiary care center with a hospital-based cohort, which may limit generalizability to primary community settings. Multi-centric longitudinal studies with larger sample sizes are recommended.`;
  const conclusion = `The present study establishes a statistically significant clinical correlation supporting routine diagnostic screening and early targeted management in patients presenting to ${cleanDept} clinics.`;
  const declarations = `Ethics Approval & Consent to Participate: Approved by the Institutional Ethics Committee (IEC) of ${project.collegeName}. Written informed consent was obtained from all participants in English and vernacular language.\nConflict of Interest: The authors declare no competing financial or commercial conflicts of interest.\nFunding Statement: Nil / Intramural academic postgraduate research support.`;

  const tablesPlainText = tables
    .map(
      (t, idx) =>
        `\n[TABLE ${idx + 1}: ${t.caption}]\nHeaders: ${t.headers.join(' | ')}\n` +
        t.rows.map(r => r.join(' | ')).join('\n') +
        (t.legend ? `\nLegend: ${t.legend}\n` : '\n')
    )
    .join('\n');

  const plainTextManuscript = `TARGET JOURNAL: ${journal.name.toUpperCase()} (${journal.type})
ARTICLE TYPE: Original Research Article (IMRAD Format • Max ${journal.maxWords} Words)

TITLE:
${project.title}

RUNNING TITLE:
${runningTitle}

AUTHORS:
${authorsLine}

AFFILIATIONS:
${affiliationsLine}

CORRESPONDING AUTHOR:
${correspondingAuthor}

====================================================================
STRUCTURED ABSTRACT
====================================================================
Background: ${structuredAbstract.background}
Methods: ${structuredAbstract.methods}
Results: ${structuredAbstract.results}
Conclusion: ${structuredAbstract.conclusion}
Keywords: ${structuredAbstract.keywords}

====================================================================
1. INTRODUCTION
====================================================================
${introSection}

====================================================================
2. MATERIALS AND METHODS
====================================================================
${methodsSection}

====================================================================
3. OBSERVATIONS AND RESULTS
====================================================================
${resultsNarrative}
${tablesPlainText}

====================================================================
4. DISCUSSION
====================================================================
${discussionSection}

Study Limitations:
${limitations}

====================================================================
5. CONCLUSION
====================================================================
${conclusion}

====================================================================
DECLARATIONS (ETHICS, CONSENT, COMPETING INTERESTS & FUNDING)
====================================================================
${declarations}

====================================================================
REFERENCES (${journal.style})
====================================================================
${references.join('\n')}`;

  return {
    title: project.title,
    runningTitle,
    authorsLine,
    affiliationsLine,
    correspondingAuthor,
    structuredAbstract,
    introduction: introSection,
    methods: methodsSection,
    resultsNarrative,
    tables,
    discussion: discussionSection,
    limitations,
    conclusion,
    declarations,
    references,
    plainTextManuscript
  };
}

/**
 * Export Journal Manuscript (or Cover Letter / Reviewer Response) as a Formatted Microsoft Word (.doc) File
 */
export function exportJournalToWordDoc(
  article: CompiledJournalArticle,
  journal: JournalTemplateSpec,
  mode: 'manuscript' | 'cover_letter' | 'review_responses' | 'title_page_strobe' = 'manuscript',
  customText?: string
) {
  let bodyContent = '';

  if (mode !== 'manuscript' && customText) {
    bodyContent = `<div style="white-space: pre-wrap; font-size: 11pt; line-height: 1.6;">${customText}</div>`;
  } else {
    const tablesHtml = article.tables
      .map(
        (t, idx) => `
        <div style="margin: 16px 0;">
          <p style="font-weight: bold; font-size: 10.5pt; color: #0f172a; margin-bottom: 4px;">
            Table ${idx + 1}: ${t.caption}
          </p>
          <table border="1" cellspacing="0" cellpadding="6" style="width: 100%; border-collapse: collapse; font-size: 9.5pt;">
            <thead>
              <tr style="background-color: #e0f2fe; color: #0c4a6e; font-weight: bold;">
                ${t.headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${t.rows
                .map(
                  r => `<tr>${r.map(c => `<td style="color: #1e293b;">${c}</td>`).join('')}</tr>`
                )
                .join('')}
            </tbody>
          </table>
          ${
            t.legend
              ? `<p style="font-size: 9pt; font-style: italic; color: #334155; margin-top: 4px;">${t.legend}</p>`
              : ''
          }
        </div>`
      )
      .join('\n');

    bodyContent = `
      <div style="border-bottom: 2px solid #047857; padding-bottom: 10px; margin-bottom: 16px;">
        <div style="font-size: 9pt; font-weight: bold; color: #be185d; text-transform: uppercase;">
          Original Research Article • Formatted for ${journal.name}
        </div>
        <h1 style="font-size: 16pt; color: #0f172a; margin: 6px 0;">${article.title}</h1>
        <p style="font-size: 10.5pt; font-weight: bold; color: #1e293b; margin: 4px 0;">${article.authorsLine}</p>
        <p style="font-size: 9.5pt; color: #475569; margin: 2px 0;">${article.affiliationsLine}</p>
        <p style="font-size: 9pt; color: #047857; margin: 4px 0;"><strong>Running Title:</strong> ${article.runningTitle} | <strong>Corresponding Author:</strong> ${article.correspondingAuthor}</p>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 6px; margin-bottom: 18px; font-size: 10pt; line-height: 1.5;">
        <h3 style="margin-top: 0; color: #064e3b; font-size: 11pt; text-transform: uppercase;">Structured Abstract</h3>
        <p><strong>Background:</strong> ${article.structuredAbstract.background}</p>
        <p><strong>Methods:</strong> ${article.structuredAbstract.methods}</p>
        <p><strong>Results:</strong> ${article.structuredAbstract.results}</p>
        <p><strong>Conclusion:</strong> ${article.structuredAbstract.conclusion}</p>
        <p style="margin-bottom: 0;"><strong>Keywords:</strong> <em>${article.structuredAbstract.keywords}</em></p>
      </div>

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">1. Introduction</h2>
      <p style="font-size: 11pt; line-height: 1.6; text-align: justify; white-space: pre-wrap;">${article.introduction}</p>

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">2. Materials and Methods</h2>
      <p style="font-size: 11pt; line-height: 1.6; text-align: justify; white-space: pre-wrap;">${article.methods}</p>

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">3. Observations and Results</h2>
      <p style="font-size: 11pt; line-height: 1.6; text-align: justify; white-space: pre-wrap;">${article.resultsNarrative}</p>
      ${tablesHtml}

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">4. Discussion</h2>
      <p style="font-size: 11pt; line-height: 1.6; text-align: justify; white-space: pre-wrap;">${article.discussion}</p>
      <p style="font-size: 10.5pt; line-height: 1.5; background: #fff1f2; padding: 8px; border-left: 3px solid #e11d48;"><strong>Study Limitations:</strong> ${article.limitations}</p>

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">5. Conclusion</h2>
      <p style="font-size: 11pt; line-height: 1.6; text-align: justify;">${article.conclusion}</p>

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">Declarations (Ethics, Consent &amp; Competing Interests)</h2>
      <p style="font-size: 10pt; line-height: 1.5; white-space: pre-wrap;">${article.declarations}</p>

      <h2 style="font-size: 12.5pt; color: #1e1b4b; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">References (${journal.shortName} / Vancouver Style)</h2>
      <ol style="font-size: 9.5pt; line-height: 1.5;">
        ${article.references.map(r => `<li>${r.replace(/^\d+\.\s*/, '')}</li>`).join('')}
      </ol>
    `;
  }

  const fullDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${article.title} - ${journal.shortName}</title>
<style>
  @page { size: 8.27in 11.69in; margin: 0.85in; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #0f172a; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>`;

  const blob = new Blob(['\ufeff', fullDoc], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (article.title || 'Journal_Article')
    .substring(0, 30)
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const suffix =
    mode === 'manuscript'
      ? `Journal_Article_${journal.id.toUpperCase()}`
      : mode === 'cover_letter'
        ? `Cover_Letter_${journal.id.toUpperCase()}`
        : `Reviewer_Rebuttal_${journal.id.toUpperCase()}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_${suffix}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export interface CustomJournalPdfFormatOptions {
  columnLayout: 'two_column_print' | 'single_column_submission';
  blindingMode: 'unblinded_camera_ready' | 'double_blind_anonymous';
  fontFamily: 'Times-Roman' | 'Helvetica';
  colorTheme: 'emerald_medical' | 'royal_navy' | 'crimson_classic';
  includeHighlightsBox: boolean;
  includeMasterTables: boolean;
  includeDeclarationsAndEthics: boolean;
  includeLineAndSectionBadges: boolean;
}

export const DEFAULT_CUSTOM_JOURNAL_PDF_OPTIONS: CustomJournalPdfFormatOptions = {
  columnLayout: 'two_column_print',
  blindingMode: 'unblinded_camera_ready',
  fontFamily: 'Times-Roman',
  colorTheme: 'emerald_medical',
  includeHighlightsBox: true,
  includeMasterTables: true,
  includeDeclarationsAndEthics: true,
  includeLineAndSectionBadges: true
};

const JOURNAL_PDF_COLOR_THEMES: Record<
  CustomJournalPdfFormatOptions['colorTheme'],
  {
    primaryHex: string;
    secondaryHex: string;
    headingHex: string;
    boxBgHex: string;
    boxBorderHex: string;
    tableHeaderBgHex: string;
    tableHeaderBorderHex: string;
    tableHeaderTextHex: string;
    highlightsBgHex: string;
    highlightsBorderHex: string;
  }
> = {
  emerald_medical: {
    primaryHex: '#047857',
    secondaryHex: '#be185d',
    headingHex: '#1e1b4b',
    boxBgHex: '#f0fdf4',
    boxBorderHex: '#86efac',
    tableHeaderBgHex: '#e0f2fe',
    tableHeaderBorderHex: '#0284c7',
    tableHeaderTextHex: '#0c4a6e',
    highlightsBgHex: '#fefce8',
    highlightsBorderHex: '#eab308'
  },
  royal_navy: {
    primaryHex: '#1e3a8a',
    secondaryHex: '#0369a1',
    headingHex: '#0f172a',
    boxBgHex: '#f0f9ff',
    boxBorderHex: '#93c5fd',
    tableHeaderBgHex: '#dbeafe',
    tableHeaderBorderHex: '#1d4ed8',
    tableHeaderTextHex: '#1e3a8a',
    highlightsBgHex: '#f8fafc',
    highlightsBorderHex: '#475569'
  },
  crimson_classic: {
    primaryHex: '#9f1239',
    secondaryHex: '#0f172a',
    headingHex: '#4c0519',
    boxBgHex: '#fff1f2',
    boxBorderHex: '#fda4af',
    tableHeaderBgHex: '#ffe4e6',
    tableHeaderBorderHex: '#be123c',
    tableHeaderTextHex: '#881337',
    highlightsBgHex: '#fffbeb',
    highlightsBorderHex: '#d97706'
  }
};

/**
 * React-PDF Document for Print-Ready & Custom-Formatted Medical Journal Article PDF Export
 */
const journalPdfStyles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 44,
    paddingHorizontal: 42,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.48,
    color: '#1e293b'
  },
  journalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#047857',
    paddingBottom: 5,
    marginBottom: 10
  },
  journalNameText: {
    fontSize: 8.8,
    fontWeight: 'bold',
    color: '#047857',
    textTransform: 'uppercase'
  },
  articleTypeBadge: {
    fontSize: 7.8,
    fontWeight: 'bold',
    color: '#be185d',
    textTransform: 'uppercase'
  },
  articleTitle: {
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 1.28,
    marginBottom: 5
  },
  authorsText: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 2
  },
  affiliationText: {
    fontSize: 8.4,
    color: '#475569',
    marginBottom: 3
  },
  correspText: {
    fontSize: 7.8,
    color: '#047857',
    marginBottom: 8
  },
  metadataBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 0.7,
    borderColor: '#cbd5e1',
    borderRadius: 3
  },
  metadataBadgeItem: {
    fontSize: 7.5,
    color: '#334155',
    marginRight: 14
  },
  abstractBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 4,
    padding: 9,
    marginBottom: 10
  },
  abstractHeading: {
    fontSize: 9.2,
    fontWeight: 'bold',
    color: '#064e3b',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  abstractLine: {
    fontSize: 8.6,
    marginBottom: 3,
    color: '#0f172a',
    textAlign: 'justify'
  },
  highlightsBox: {
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#eab308',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12
  },
  highlightsHeading: {
    fontSize: 8.8,
    fontWeight: 'bold',
    color: '#854d0e',
    textTransform: 'uppercase',
    marginBottom: 3
  },
  highlightsBullet: {
    fontSize: 8.2,
    color: '#1e293b',
    marginBottom: 2.5,
    textAlign: 'justify'
  },
  twoColumnGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  columnPane: {
    width: '48.2%'
  },
  sectionHeading: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1e1b4b',
    textTransform: 'uppercase',
    borderBottomWidth: 0.8,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 5
  },
  paragraph: {
    fontSize: 9.2,
    color: '#1e293b',
    textAlign: 'justify',
    marginBottom: 6
  },
  tableBox: {
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 2
  },
  tableCaption: {
    fontSize: 8.6,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 3,
    marginTop: 6
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderBottomWidth: 1,
    borderBottomColor: '#0284c7'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  tableHeaderCell: {
    flex: 1,
    padding: 4,
    fontSize: 7.8,
    fontWeight: 'bold',
    color: '#0c4a6e'
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 7.8,
    color: '#1e293b'
  },
  refItem: {
    fontSize: 8.1,
    color: '#334155',
    marginBottom: 3.5
  },
  pageFooter: {
    position: 'absolute',
    bottom: 22,
    left: 42,
    right: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.8,
    color: '#64748b',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4
  }
});

export const JournalArticlePdfDocument: React.FC<{
  article: CompiledJournalArticle;
  journal: JournalTemplateSpec;
  options?: Partial<CustomJournalPdfFormatOptions>;
}> = ({ article, journal, options }) => {
  const cfg: CustomJournalPdfFormatOptions = {
    ...DEFAULT_CUSTOM_JOURNAL_PDF_OPTIONS,
    ...(options || {})
  };
  const palette = JOURNAL_PDF_COLOR_THEMES[cfg.colorTheme] || JOURNAL_PDF_COLOR_THEMES.emerald_medical;
  const isTwoCol = cfg.columnLayout === 'two_column_print';
  const isBlinded = cfg.blindingMode === 'double_blind_anonymous';
  const bodyLineHeight = isTwoCol ? 1.42 : 1.68;
  const bodyFontSize = isTwoCol ? 9.0 : 10.0;

  const displayedAuthors = isBlinded
    ? '[Author Names Anonymized for Double-Blind Peer Review]'
    : article.authorsLine;
  const displayedAffiliation = isBlinded
    ? '[Institutional & Departmental Affiliations Masked per ICMJE Double-Blind Peer Review Protocol]'
    : article.affiliationsLine;
  const displayedCorresp = isBlinded
    ? `Running Title: ${article.runningTitle} | Manuscript Category: Original Research (Double-Blind Submission)`
    : `Running Title: ${article.runningTitle} | Corresponding Author: ${article.correspondingAuthor}`;
  const displayedDeclarations = isBlinded
    ? `Ethics Approval & Consent to Participate: Approved by the Institutional Ethics Committee (IEC) of the study institution [Anonymized for Peer Review]. Written bilingual informed consent was obtained from all participants in accordance with the Declaration of Helsinki and ICMR (2017) guidelines.\nConflict of Interest: The authors declare no competing financial or commercial conflicts of interest.\nFunding Statement: Nil / Intramural postgraduate academic research.`
    : article.declarations;

  const introParagraphs = article.introduction.split('\n\n').filter(Boolean);
  const methodsParagraphs = article.methods.split('\n\n').filter(Boolean);
  const resultsParagraphs = article.resultsNarrative.split('\n\n').filter(Boolean);
  const discussionParagraphs = article.discussion.split('\n\n').filter(Boolean);

  const secPrefix = (secNum: string, title: string) =>
    cfg.includeLineAndSectionBadges ? `${secNum}. ${title}` : title;

  return (
    <Document
      title={`${article.title} - ${journal.shortName}`}
      author={displayedAuthors}
      subject={`IMRAD Original Research Article - ${journal.name}`}
    >
      <Page
        size="A4"
        style={[
          journalPdfStyles.page,
          {
            fontFamily: cfg.fontFamily,
            fontSize: bodyFontSize,
            lineHeight: bodyLineHeight
          }
        ]}
      >
        {/* Top Journal Header Banner */}
        <View
          style={[
            journalPdfStyles.journalBanner,
            { borderBottomColor: palette.primaryHex }
          ]}
          fixed
        >
          <Text style={[journalPdfStyles.journalNameText, { color: palette.primaryHex }]}>
            {journal.name}
          </Text>
          <Text style={[journalPdfStyles.articleTypeBadge, { color: palette.secondaryHex }]}>
            {isTwoCol ? 'Original Research • Print Proof' : 'Original Research • Editorial Submission'}
          </Text>
        </View>

        {/* Article Title & Author Metadata */}
        <Text style={[journalPdfStyles.articleTitle, { color: palette.headingHex }]}>
          {article.title}
        </Text>
        <Text style={[journalPdfStyles.authorsText, { color: palette.headingHex }]}>
          {displayedAuthors}
        </Text>
        <Text style={journalPdfStyles.affiliationText}>{displayedAffiliation}</Text>
        <Text style={[journalPdfStyles.correspText, { color: palette.primaryHex }]}>
          {displayedCorresp}
        </Text>

        {/* Journal Compliance Metadata Strip */}
        {cfg.includeLineAndSectionBadges && (
          <View style={journalPdfStyles.metadataBadgeRow}>
            <Text style={journalPdfStyles.metadataBadgeItem}>
              Target Journal: {journal.shortName} ({journal.style})
            </Text>
            <Text style={journalPdfStyles.metadataBadgeItem}>
              Structure: IMRAD • {article.tables.length} Master Tables • {article.references.length} Refs
            </Text>
            <Text style={journalPdfStyles.metadataBadgeItem}>
              Review Mode: {isBlinded ? 'Double-Blind Anonymized' : 'Camera-Ready Author Proof'}
            </Text>
          </View>
        )}

        {/* Structured IMRAD Abstract Box */}
        <View
          style={[
            journalPdfStyles.abstractBox,
            {
              backgroundColor: palette.boxBgHex,
              borderColor: palette.boxBorderHex
            }
          ]}
        >
          <Text style={[journalPdfStyles.abstractHeading, { color: palette.primaryHex }]}>
            Structured Abstract ({journal.shortName} Format)
          </Text>
          <Text style={journalPdfStyles.abstractLine}>
            Background &amp; Objectives: {article.structuredAbstract.background}
          </Text>
          <Text style={journalPdfStyles.abstractLine}>
            Materials &amp; Methods: {article.structuredAbstract.methods}
          </Text>
          <Text style={journalPdfStyles.abstractLine}>
            Observations &amp; Results: {article.structuredAbstract.results}
          </Text>
          <Text style={journalPdfStyles.abstractLine}>
            Conclusions: {article.structuredAbstract.conclusion}
          </Text>
          <Text style={[journalPdfStyles.abstractLine, { marginBottom: 0, fontStyle: 'italic' }]}>
            Keywords (MeSH): {article.structuredAbstract.keywords}
          </Text>
        </View>

        {/* Optional Key Clinical Highlights / Research in Context Box */}
        {cfg.includeHighlightsBox && (
          <View
            style={[
              journalPdfStyles.highlightsBox,
              {
                backgroundColor: palette.highlightsBgHex,
                borderColor: palette.highlightsBorderHex
              }
            ]}
          >
            <Text style={journalPdfStyles.highlightsHeading}>
              Key Clinical Messages &amp; Research in Context
            </Text>
            <Text style={journalPdfStyles.highlightsBullet}>
              • What is already known: Regional diagnostic and prognostic thresholds for this clinical condition remain under-characterized in Indian tertiary care settings.
            </Text>
            <Text style={journalPdfStyles.highlightsBullet}>
              • What this study adds: {article.structuredAbstract.results}
            </Text>
            <Text style={journalPdfStyles.highlightsBullet}>
              • Clinical practice impact: {article.structuredAbstract.conclusion}
            </Text>
          </View>
        )}

        {/* Main IMRAD Body: Two-Column Print Layout vs. Single-Column Submission Layout */}
        {isTwoCol ? (
          <View>
            <View style={journalPdfStyles.twoColumnGrid}>
              {/* Left Column: 1. Introduction & 2. Materials and Methods */}
              <View style={journalPdfStyles.columnPane}>
                <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
                  {secPrefix('1', 'Introduction')}
                </Text>
                {introParagraphs.map((p, idx) => (
                  <Text
                    key={idx}
                    style={[
                      journalPdfStyles.paragraph,
                      { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                    ]}
                  >
                    {p}
                  </Text>
                ))}

                <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
                  {secPrefix('2', 'Materials and Methods')}
                </Text>
                {methodsParagraphs.map((p, idx) => (
                  <Text
                    key={idx}
                    style={[
                      journalPdfStyles.paragraph,
                      { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                    ]}
                  >
                    {p}
                  </Text>
                ))}
              </View>

              {/* Right Column: 3. Observations & Results + 4. Discussion */}
              <View style={journalPdfStyles.columnPane}>
                <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
                  {secPrefix('3', 'Observations and Results')}
                </Text>
                {resultsParagraphs.map((p, idx) => (
                  <Text
                    key={idx}
                    style={[
                      journalPdfStyles.paragraph,
                      { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                    ]}
                  >
                    {p}
                  </Text>
                ))}

                <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
                  {secPrefix('4', 'Discussion')}
                </Text>
                {discussionParagraphs.map((p, idx) => (
                  <Text
                    key={idx}
                    style={[
                      journalPdfStyles.paragraph,
                      { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                    ]}
                  >
                    {p}
                  </Text>
                ))}
                <Text
                  style={[
                    journalPdfStyles.paragraph,
                    { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                  ]}
                >
                  Study Limitations: {article.limitations}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* 1. Introduction */}
            <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
              {secPrefix('1', 'Introduction')}
            </Text>
            {introParagraphs.map((p, idx) => (
              <Text
                key={idx}
                style={[
                  journalPdfStyles.paragraph,
                  { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                ]}
              >
                {p}
              </Text>
            ))}

            {/* 2. Materials and Methods */}
            <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
              {secPrefix('2', 'Materials and Methods')}
            </Text>
            {methodsParagraphs.map((p, idx) => (
              <Text
                key={idx}
                style={[
                  journalPdfStyles.paragraph,
                  { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                ]}
              >
                {p}
              </Text>
            ))}

            {/* 3. Observations and Results */}
            <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
              {secPrefix('3', 'Observations and Results')}
            </Text>
            {resultsParagraphs.map((p, idx) => (
              <Text
                key={idx}
                style={[
                  journalPdfStyles.paragraph,
                  { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                ]}
              >
                {p}
              </Text>
            ))}

            {/* 4. Discussion & Limitations */}
            <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
              {secPrefix('4', 'Discussion')}
            </Text>
            {discussionParagraphs.map((p, idx) => (
              <Text
                key={idx}
                style={[
                  journalPdfStyles.paragraph,
                  { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
                ]}
              >
                {p}
              </Text>
            ))}
            <Text
              style={[
                journalPdfStyles.paragraph,
                { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
              ]}
            >
              Study Limitations: {article.limitations}
            </Text>
          </View>
        )}

        {/* Full-Width Statistical Master Chart Tables */}
        {cfg.includeMasterTables &&
          article.tables.map((t, tIdx) => (
            <View key={tIdx} wrap={false}>
              <Text style={journalPdfStyles.tableCaption}>
                Table {tIdx + 1}: {t.caption}
              </Text>
              <View style={journalPdfStyles.tableBox}>
                <View
                  style={[
                    journalPdfStyles.tableHeaderRow,
                    {
                      backgroundColor: palette.tableHeaderBgHex,
                      borderBottomColor: palette.tableHeaderBorderHex
                    }
                  ]}
                >
                  {t.headers.map((h, hIdx) => (
                    <Text
                      key={hIdx}
                      style={[
                        journalPdfStyles.tableHeaderCell,
                        { color: palette.tableHeaderTextHex }
                      ]}
                    >
                      {h}
                    </Text>
                  ))}
                </View>
                {t.rows.slice(0, 8).map((r, rIdx) => (
                  <View key={rIdx} style={journalPdfStyles.tableRow}>
                    {t.headers.map((_, cIdx) => (
                      <Text key={cIdx} style={journalPdfStyles.tableCell}>
                        {r[cIdx] ?? ''}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
              {t.legend ? (
                <Text style={{ fontSize: 7.8, fontStyle: 'italic', color: '#475569', marginBottom: 6 }}>
                  {t.legend}
                </Text>
              ) : null}
            </View>
          ))}

        {/* 5. Conclusion */}
        <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
          {secPrefix('5', 'Conclusion')}
        </Text>
        <Text
          style={[
            journalPdfStyles.paragraph,
            { fontSize: bodyFontSize, lineHeight: bodyLineHeight }
          ]}
        >
          {article.conclusion}
        </Text>

        {/* Declarations & Ethical Clearance */}
        {cfg.includeDeclarationsAndEthics && (
          <View>
            <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
              Declarations, Ethical Clearance &amp; Competing Interests
            </Text>
            <Text
              style={[
                journalPdfStyles.paragraph,
                { fontSize: bodyFontSize - 0.3, lineHeight: bodyLineHeight }
              ]}
            >
              {displayedDeclarations}
            </Text>
          </View>
        )}

        {/* References */}
        {article.references.length > 0 && (
          <View>
            <Text style={[journalPdfStyles.sectionHeading, { color: palette.headingHex }]}>
              References ({journal.shortName} / {journal.style})
            </Text>
            {article.references.map((ref, rIdx) => (
              <Text key={rIdx} style={journalPdfStyles.refItem}>
                {ref}
              </Text>
            ))}
          </View>
        )}

        <View style={journalPdfStyles.pageFooter} fixed>
          <Text>{article.runningTitle}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${journal.shortName} (${isTwoCol ? '2-Col Print' : '1-Col Submission'}) • Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

export async function exportJournalToPdfFile(
  article: CompiledJournalArticle,
  journal: JournalTemplateSpec,
  options?: Partial<CustomJournalPdfFormatOptions>
) {
  const cfg: CustomJournalPdfFormatOptions = {
    ...DEFAULT_CUSTOM_JOURNAL_PDF_OPTIONS,
    ...(options || {})
  };
  const doc = <JournalArticlePdfDocument article={article} journal={journal} options={cfg} />;
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const safeName = (article.title || 'Journal_Article')
    .substring(0, 30)
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const layoutTag = cfg.columnLayout === 'two_column_print' ? '2Col_Print' : '1Col_Subm';
  const blindTag = cfg.blindingMode === 'double_blind_anonymous' ? '_Blinded' : '';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_${journal.id.toUpperCase()}_${layoutTag}${blindTag}_Journal_Article.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export interface UniversityLayoutPreset {
  id: string;
  name: string;
  shortTag: string;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
  marginCss: string;
  accentColor: string;
  bindingRuleNote: string;
}

export const UNIVERSITY_LAYOUT_PRESETS: UniversityLayoutPreset[] = [
  {
    id: 'nmc_standard',
    name: 'NMC / BCBR Standard Hardbound (1.5" Left Margin • 12pt Times New Roman • 1.8x Spacing)',
    shortTag: 'NMC Standard A4',
    fontFamily: "'Times New Roman', Times, serif",
    fontSizePt: 12,
    lineHeight: 1.8,
    marginCss: '25mm 25mm 25mm 38mm',
    accentColor: '#047857',
    bindingRuleNote: 'Left Margin: 38mm (1.5 in) for Hardbinding • Top/Bottom/Right: 25mm (1.0 in) • Single-sided A4'
  },
  {
    id: 'state_health_univ',
    name: 'State Health Universities (RGUHS / MUHS / KUHS / UHSR / AMRU / WBUHS • Double Spaced)',
    shortTag: 'RGUHS / MUHS / KUHS',
    fontFamily: "'Times New Roman', Times, serif",
    fontSizePt: 12,
    lineHeight: 2.0,
    marginCss: '30mm 25mm 30mm 40mm',
    accentColor: '#be185d',
    bindingRuleNote: 'Left Margin: 40mm • Double Line Spacing (2.0) • Chapter Page Breaks Mandatory • Vancouver Numbered'
  },
  {
    id: 'aiims_pgimer',
    name: 'Autonomous Institutes (AIIMS / PGIMER / JIPMER / NIMHANS • 11.5pt Georgia • 1.65x Spacing)',
    shortTag: 'AIIMS / PGIMER',
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSizePt: 11.5,
    lineHeight: 1.65,
    marginCss: '25mm 25mm 25mm 35mm',
    accentColor: '#0f766e',
    bindingRuleNote: 'Left Margin: 35mm • Structured IMRAD + 6-Chapter Hybrid • High-Density Statistical Tables'
  },
  {
    id: 'compact_guide_proof',
    name: 'Compact Guide & Ethics Review Draft (11pt Arial/Calibri • 1.4x Eco-Print Layout)',
    shortTag: 'Guide Review Proof',
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSizePt: 11,
    lineHeight: 1.4,
    marginCss: '20mm 20mm 20mm 25mm',
    accentColor: '#1e40af',
    bindingRuleNote: 'Compact 20mm Margins • Designed for rapid Guide/Co-Guide redline correction & IEC submission'
  }
];

export interface SpecialtyStudyBlueprint {
  id: string;
  name: string;
  studyDesign: string;
  sampleSizeRule: string;
  primaryStatisticalTests: string;
  reportingGuideline: string;
  methodologyTemplateSnippet: string;
}

export const SPECIALTY_STUDY_BLUEPRINTS: SpecialtyStudyBlueprint[] = [
  {
    id: 'diagnostic_biomarker',
    name: '1. Diagnostic Accuracy & Biomarker Correlation (ROC / AUC / Sensitivity)',
    studyDesign: 'Prospective Hospital-Based Observational Cross-Sectional Study',
    sampleSizeRule: 'N = 120 consecutive consenting patients (Buderer formula for sensitivity 88%, α = 0.05, 95% CI)',
    primaryStatisticalTests: 'ROC Curve (AUC), Sensitivity, Specificity, PPV, NPV, Pearson/Spearman r, Independent t-test',
    reportingGuideline: 'STARD & STROBE Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Diagnostic Accuracy & Biomarker Evaluation (STARD / STROBE)
- **Study Design:** Prospective hospital-based observational diagnostic evaluation.
- **Sample Size Justification:** Calculated using Buderer's diagnostic accuracy formula assuming expected sensitivity of 88%, precision $d = 0.06$, at 95% confidence level ($Z_{1-\\alpha/2} = 1.96$), yielding $N = 120$ subjects.
- **Statistical Plan:** Receiver Operating Characteristic (ROC) curve analysis to determine optimal cut-off threshold, Youden's Index ($J$), Sensitivity, Specificity, Positive Predictive Value (PPV), and Negative Predictive Value (NPV).`
  },
  {
    id: 'rct_interventional',
    name: '2. Comparative Clinical Trial / 2-Arm Intervention (CONSORT Protocol)',
    studyDesign: 'Prospective Randomized Comparative Two-Arm Clinical Study',
    sampleSizeRule: 'N = 120 (Group A: n = 60 vs. Group B: n = 60; 80% power, α = 0.05, 10% attrition adjustment)',
    primaryStatisticalTests: 'Unpaired Student t-test, Paired t-test, Chi-Square (χ²) / Fisher Exact Test, Relative Risk (RR)',
    reportingGuideline: 'CONSORT 2010 Statement & CTRI Registration',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Two-Arm Comparative Interventional Study (CONSORT)
- **Study Design:** Prospective randomized comparative clinical study registered with CTRI.
- **Allocation & Concealment:** Computer-generated block randomization (1:1 ratio) into Group A ($n = 60$) and Group B ($n = 60$) using sequentially numbered opaque sealed envelopes (SNOSE).
- **Statistical Plan:** Intention-to-treat (ITT) and per-protocol analysis using Student's unpaired $t$-test for continuous endpoints and Chi-Square ($\\chi^2$) test for categorical efficacy and adverse event rates.`
  },
  {
    id: 'surgical_outcomes',
    name: '3. Surgical & Perioperative Outcomes Cohort (Clavien-Dindo / VAS / LOS)',
    studyDesign: 'Prospective Longitudinal Surgical Cohort Study',
    sampleSizeRule: 'N = 100 consecutive patients undergoing elective/emergency surgical intervention',
    primaryStatisticalTests: 'Repeated-Measures ANOVA, Mann-Whitney U Test, Kaplan-Meier / Log-Rank, Chi-Square',
    reportingGuideline: 'STROCSS & STROBE Surgical Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Surgical & Perioperative Outcome Evaluation (STROCSS)
- **Study Design:** Prospective longitudinal surgical cohort evaluation with 30-day and 90-day post-operative follow-up.
- **Perioperative Endpoints:** Operative duration (minutes), estimated blood loss (mL), Visual Analogue Scale (VAS 0–10) pain scores at 6h/24h/48h, Clavien-Dindo surgical complication grading, and length of hospital stay (days).`
  },
  {
    id: 'radiology_pathology',
    name: '4. Clinicopathological / Radio-Pathological Concordance (Cohen Kappa κ)',
    studyDesign: 'Prospective Cross-Sectional Concordance & Gold-Standard Validation Study',
    sampleSizeRule: 'N = 110 cases with paired imaging/clinical and histopathological gold-standard confirmation',
    primaryStatisticalTests: "Cohen's Kappa (κ) Inter-Observer Agreement, Sensitivity/Specificity vs. Histopathology, χ² Test",
    reportingGuideline: 'STARD Concordance Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Radio-Pathological & Clinicopathological Concordance
- **Study Design:** Prospective blinded concordance study comparing index diagnostic modality against histopathological/gold-standard confirmation.
- **Agreement Statistics:** Inter-modality and inter-observer concordance quantified using Cohen's Kappa ($\\kappa$) coefficient ($\\kappa > 0.80$ indicating almost perfect agreement) alongside sensitivity and specificity matrices.`
  },
  {
    id: 'community_epidemiology',
    name: '5. Community Medicine / Cross-Sectional Prevalence & Risk Factor Survey',
    studyDesign: 'Community-Based Cross-Sectional Epidemiological Study (Multistage Sampling)',
    sampleSizeRule: 'N = 240 participants calculated via Cochran formula (Z²pq/d²) with design effect',
    primaryStatisticalTests: 'Prevalence (%) with 95% CI, Multivariate Binary Logistic Regression (Adjusted Odds Ratio aOR)',
    reportingGuideline: 'STROBE Cross-Sectional Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Community-Based Epidemiological Survey (STROBE)
- **Study Design:** Cross-sectional epidemiological investigation in urban and rural field practice areas.
- **Sampling Strategy:** Cochran's formula $n = Z^2 P(1-P)/d^2$ using pre-validated semi-structured schedules and Modified Kuppuswamy socioeconomic stratification.
- **Statistical Plan:** Crude and adjusted Odds Ratios (aOR) with 95% Confidence Intervals using multivariable binary logistic regression.`
  },
  {
    id: 'emergency_critical_care',
    name: '6. MD Emergency Medicine, Trauma & Critical Care Triage Cohort (NEWS2 / qSOFA / eFAST / RTS)',
    studyDesign: 'Prospective Emergency Department Triage & Resuscitation Prognostic Cohort Study',
    sampleSizeRule: 'N = 140 consecutive acute emergency / polytrauma presentations (Buderer / ROC power for 28-day outcome)',
    primaryStatisticalTests: 'AUROC Comparison (DeLong Test), Kaplan-Meier 7/28-Day Survival, Lactate Clearance %, Multivariate Cox / Logistic Regression',
    reportingGuideline: 'STROBE & TRIPOD Emergency Prognostic Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: MD Emergency Medicine, Trauma & Critical Care Triage Protocol (STROBE / TRIPOD)
- **Study Design:** Prospective observational emergency department (ED) resuscitation and prognostic validation study conducted in the Red/Yellow Triage Zones.
- **Bedside Emergency & Triage Parameters:** National Early Warning Score 2 (NEWS2), quick SOFA (qSOFA), Revised Trauma Score (RTS), Injury Severity Score (ISS), Point-of-Care Ultrasound (POCUS / eFAST), and serial arterial blood gas (ABG) 6-hour lactate clearance.
- **Primary Endpoints & Statistical Plan:** Need for mechanical ventilation/vasopressors, ICU length of stay, and 28-day survival analyzed via AUROC (Youden's $J$) and multivariable logistic regression.`
  },
  {
    id: 'anesthesia_perioperative',
    name: '7. MD Anesthesiology, Pain & Airway Management Double-Blind RCT (ASA / VAS / Hemodynamics)',
    studyDesign: 'Prospective Randomized Double-Blind Comparative Perioperative Clinical Trial',
    sampleSizeRule: 'N = 90 (Group A: n = 45 vs. Group B: n = 45; ASA I–II patients, 80% power, α = 0.05)',
    primaryStatisticalTests: 'Repeated-Measures ANOVA (HR/MAP at 0, 1, 3, 5, 10, 15 min), Mann-Whitney U (VAS / Ramsay Sedation), Kaplan-Meier Time to First Rescue Analgesia',
    reportingGuideline: 'CONSORT 2010 Statement & CTRI Registration',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: MD Anesthesiology & Perioperative Hemodynamic / Analgesic Trial (CONSORT)
- **Study Design:** Prospective randomized double-blind comparative study in ASA Physical Status I–II patients undergoing elective surgery.
- **Perioperative Monitoring:** Baseline and serial Heart Rate (HR), Mean Arterial Pressure (MAP), SpO2, EtCO2, Cormack-Lehane laryngoscopic view, sensory/motor block onset & regression (Modified Bromage Scale), and postoperative VAS pain scores.`
  },
  {
    id: 'micro_path_pharma_transfusion',
    name: '8. MD Pathology / Microbiology / Pharmacology / Transfusion & Lab Medicine (CLSI / WHO-UMC / IHC)',
    studyDesign: 'Prospective Cross-Sectional Laboratory, Histopathological & Pharmacovigilance Analytical Study',
    sampleSizeRule: 'N = 150 clinical isolates / histopathological biopsies / donor units / ADR cases',
    primaryStatisticalTests: 'Sensitivity, Specificity, Cohen Kappa (κ), CLSI MIC50/MIC90 Resistance %, WHO-UMC / Naranjo Causality Chi-Square (χ²)',
    reportingGuideline: 'STARD, CLSI M100 & STROBE Laboratory Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Para-Clinical & Diagnostic Laboratory Evaluation (CLSI / STARD)
- **Study Design:** Prospective analytical study in the Department of Pathology / Microbiology / Pharmacology / Immunohematology & Blood Transfusion.
- **Standardized Assay Protocols:** AutomatedVITEK-2 / Kirby-Bauer disk diffusion per CLSI M100 guidelines, immunohistochemistry (IHC) scoring, Naranjo & WHO-UMC ADR causality scales, or Gel-Card crossmatch / component quality control.`
  },
  {
    id: 'psych_geriatrics_pmr_family',
    name: '9. MD Psychiatry / Geriatrics / PMR / Family & Palliative Medicine (DSM-5 / Frailty / FIM / QoL)',
    studyDesign: 'Prospective Observational Psychometric, Functional Rehabilitation & Quality-of-Life Cohort Study',
    sampleSizeRule: 'N = 120 consenting patients evaluated with validated vernacular psychometric / functional scales',
    primaryStatisticalTests: "Cronbach's Alpha, Spearman's Rank Correlation (ρ), Paired Wilcoxon Signed-Rank Test, Multivariate Regression",
    reportingGuideline: 'STROBE & CONSORT-PRO (Patient-Reported Outcomes)',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: MD Psychiatry, Geriatrics, PMR, Family & Palliative Medicine Cohort
- **Study Design:** Prospective clinical and functional outcome study utilizing validated bilingual patient-reported and clinician-rated scales.
- **Validated Assessment Scales:** ICD-11 / DSM-5 diagnostic criteria, Hamilton Rating Scales (HAM-D / HAM-A), Clinical Frailty Scale (CFS), Functional Independence Measure (FIM) / Barthel Index, and WHOQOL-BREF / EORTC QLQ-C30.`
  },
  {
    id: 'obg_pediatrics_neonatology',
    name: '10. MD/MS Obstetrics & Gynaecology / MD Pediatrics & Neonatology (Robson / Bishop / APGAR / SNAPPE-II)',
    studyDesign: 'Prospective Maternal-Fetal / Neonatal / Pediatric Intensive Care Cohort Study',
    sampleSizeRule: 'N = 130 feto-maternal dyads or pediatric/NICU admissions',
    primaryStatisticalTests: 'Relative Risk (RR), Odds Ratio (OR), ROC Curve for Cord Blood / Biomarker Cutoffs, Chi-Square (χ²)',
    reportingGuideline: 'STROBE Maternal-Neonatal Guidelines',
    methodologyTemplateSnippet: `### Specialty Study Blueprint: Maternal-Fetal, Pediatric & Neonatal Clinical Outcome Study
- **Study Design:** Prospective observational feto-maternal and neonatal/pediatric cohort evaluation.
- **Clinical Endpoints:** Robson Ten-Group Classification, Modified Bishop Score, Partogram progression, Umbilical Cord Arterial pH/Lactate, 1- and 5-minute APGAR scores, Fenton growth charts, and SNAPPE-II / PRISM-III severity scores.`
  }
];

/**
 * Export Full Multi-Chapter Dissertation Manuscript as Microsoft Word (.doc)
 */
export function exportFullThesisToWordDoc(
  project: {
    title: string;
    candidateName: string;
    guideName: string;
    coGuideName?: string;
    specialty: string;
    university: string;
    collegeName: string;
    academicYear: string;
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; doi?: string }>;
    frontMatter?: string;
    logbook?: string;
  },
  presetId: string = 'nmc_standard'
) {
  const preset =
    UNIVERSITY_LAYOUT_PRESETS.find(p => p.id === presetId) || UNIVERSITY_LAYOUT_PRESETS[0];

  const tocRowsHtml = project.chapters
    .map(
      (ch, idx) => `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 1px dotted #94a3b8; font-weight: bold;">Chapter ${idx + 1}</td>
        <td style="padding: 6px 8px; border-bottom: 1px dotted #94a3b8;">${ch.name.replace(/^\d+\.\s*/, '')}</td>
        <td style="padding: 6px 8px; border-bottom: 1px dotted #94a3b8; text-align: right;">Section ${idx + 1}</td>
      </tr>`
    )
    .join('\n');

  const frontMatterHtml = project.frontMatter
    ? `<div style="page-break-before: always;">
        <h1 style="font-size: 15pt; color: ${preset.accentColor}; border-bottom: 2px solid ${preset.accentColor}; padding-bottom: 4px;">
          DECLARATIONS, UNIVERSITY CERTIFICATES, BILINGUAL CONSENT &amp; PROFORMA
        </h1>
        <pre style="font-family: ${preset.fontFamily}; font-size: ${preset.fontSizePt - 1}pt; line-height: 1.5; white-space: pre-wrap;">${project.frontMatter}</pre>
      </div>`
    : '';

  const tocHtml = `<div style="page-break-before: always;">
    <h1 style="font-size: 15pt; color: ${preset.accentColor}; border-bottom: 2px solid ${preset.accentColor}; padding-bottom: 4px;">
      AUTOMATED TABLE OF CONTENTS
    </h1>
    <p style="font-size: 9.5pt; color: #475569; font-style: italic;">${preset.bindingRuleNote}</p>
    <table border="0" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse; font-size: 11pt; margin-top: 10px;">
      <tr style="background:#f1f5f9; font-weight:bold;">
        <th style="text-align:left; width: 20%;">Chapter</th>
        <th style="text-align:left; width: 65%;">Title &amp; Section</th>
        <th style="text-align:right; width: 15%;">Part</th>
      </tr>
      ${tocRowsHtml}
    </table>
  </div>`;

  const chaptersHtml = project.chapters
    .map(ch => {
      const tables = extractTablesFromMarkdown(ch.content);
      const proseLines = ch.content
        .split(/\r?\n/)
        .filter(l => !l.trim().startsWith('|') && !/^-{3,}$/.test(l.trim()))
        .map(l => stripMd(l))
        .filter(Boolean);

      const tablesHtml = tables
        .map(
          (t, idx) => `
          <div style="margin: 14px 0;">
            <p style="font-weight:bold; font-size:10.5pt;">Table ${idx + 1}: ${t.caption}</p>
            <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse; font-size:9.5pt;">
              <tr style="background:#e0f2fe; font-weight:bold;">
                ${t.headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
              ${t.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
            </table>
            ${t.legend ? `<p style="font-size:9pt; font-style:italic;">${t.legend}</p>` : ''}
          </div>`
        )
        .join('\n');

      return `
        <div style="page-break-before: always;">
          <h1 style="font-size: 16pt; color: ${preset.accentColor}; border-bottom: 2px solid ${preset.accentColor}; padding-bottom: 4px;">
            ${ch.name}
          </h1>
          <p style="font-size: 10pt; font-style: italic; color: #475569;">${ch.description}</p>
          ${proseLines.map(p => `<p style="font-size: ${preset.fontSizePt}pt; line-height: ${preset.lineHeight}; text-align: justify;">${p}</p>`).join('\n')}
          ${tablesHtml}
        </div>`;
    })
    .join('\n');

  const logbookHtml = project.logbook
    ? `<div style="page-break-before: always;">
        <h1 style="font-size: 15pt; color: ${preset.accentColor}; border-bottom: 2px solid ${preset.accentColor}; padding-bottom: 4px;">
          ANNEXURE III: CLINICAL DISSERTATION LOGBOOK &amp; MASTER CHART SUMMARY
        </h1>
        <pre style="font-family: ${preset.fontFamily}; font-size: ${preset.fontSizePt - 1}pt; line-height: 1.5; white-space: pre-wrap;">${project.logbook}</pre>
      </div>`
    : '';

  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>${project.title} - Complete Dissertation</title>
  <style>
    @page { size: A4 portrait; margin: ${preset.marginCss}; }
    body { font-family: ${preset.fontFamily}; color: #0f172a; }
  </style>
</head>
<body style="font-family: ${preset.fontFamily}; padding: 24px; color: #0f172a;">
  <div style="text-align: center; padding: 40px 20px; border: 3px double ${preset.accentColor};">
    <h2 style="text-transform: uppercase; font-size: 14pt;">${project.university}</h2>
    <p style="font-size: 10pt; letter-spacing: 1px;">DISSERTATION SUBMITTED IN PARTIAL FULFILLMENT OF POSTGRADUATE MEDICAL REGULATIONS (${preset.shortTag})</p>
    <h1 style="font-size: 18pt; color: ${preset.accentColor}; margin: 24px 0;">"${project.title}"</h1>
    <p style="font-size: 13pt; font-weight: bold;">Degree &amp; Specialty: ${project.specialty}</p>
    <p style="font-size: 12pt; margin-top: 20px;"><strong>Submitted By:</strong> Dr. ${project.candidateName}</p>
    <p style="font-size: 12pt;"><strong>Under the Supervision of:</strong> ${project.guideName}</p>
    ${project.coGuideName ? `<p style="font-size: 11pt;"><strong>Co-Guide:</strong> ${project.coGuideName}</p>` : ''}
    <p style="font-size: 12pt; margin-top: 24px;"><strong>${project.collegeName}</strong><br/>Academic Session: ${project.academicYear}</p>
    <p style="font-size: 9pt; color: #475569; margin-top: 16px;">Layout Profile: ${preset.name}</p>
  </div>
  ${frontMatterHtml}
  ${tocHtml}
  ${chaptersHtml}
  ${logbookHtml}
</body></html>`;

  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeName = (project.title || 'MD_MS_Dissertation')
    .substring(0, 32)
    .replace(/[^a-zA-Z0-9]+/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}_Full_Dissertation_${preset.id.toUpperCase()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
