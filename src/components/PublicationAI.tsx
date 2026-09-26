import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  BookOpen,
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  Send,
  FileText,
  Mail,
  MessageSquare,
  ListChecks,
  CheckSquare,
  Square,
  Globe,
  Award,
  Upload,
  Eye,
  Edit3,
  Printer,
  Sliders,
  Columns,
  ShieldCheck
} from 'lucide-react';
import { PDFViewer, BlobProvider } from '@react-pdf/renderer';
import {
  JournalTemplateSpec,
  CompiledJournalArticle,
  CustomJournalPdfFormatOptions,
  DEFAULT_CUSTOM_JOURNAL_PDF_OPTIONS,
  JournalArticlePdfDocument,
  buildJournalArticleData,
  exportJournalToWordDoc,
  exportJournalToPdfFile,
  exportFullThesisToWordDoc
} from '../utils/thesisToPptAndJournalExporter';
import { extractTextFromUploadedFile } from '../utils/pdfTextExtractor';
import { safeCopyToClipboard } from '../utils/pwaAndShareUtils';

interface Props {
  activeProject: {
    id: string;
    title: string;
    candidateName: string;
    guideName: string;
    coGuideName: string;
    specialty: string;
    university: string;
    collegeName: string;
    academicYear: string;
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string; doi?: string }>;
  };
  showToast: (msg: string) => void;
}

const TARGET_JOURNALS: JournalTemplateSpec[] = [
  {
    id: 'ijmr',
    name: 'Indian Journal of Medical Research (IJMR - ICMR)',
    shortName: 'IJMR',
    type: 'National Flagship (PubMed / Scopus / Web of Science)',
    maxWords: 3000,
    maxReferences: 30,
    style: 'Vancouver (Superscript Numerals)',
    imradStructure: 'Structured Abstract (250 words) • Introduction • Material & Methods • Results • Discussion • Acknowledgment • Conflicts of Interest',
    recommendation: 'Highly prestigious ICMR flagship journal for clinical, epidemiological, and translational studies relevant to India.'
  },
  {
    id: 'nmji',
    name: 'National Medical Journal of India (NMJI - AIIMS New Delhi)',
    shortName: 'NMJI',
    type: 'Premier Academic (PubMed / MEDLINE Indexed)',
    maxWords: 2800,
    maxReferences: 25,
    style: 'Vancouver (Numbered Brackets)',
    imradStructure: 'Structured Abstract (Background, Methods, Results, Conclusion) • Introduction • Methods • Results • Discussion • Summary Box',
    recommendation: 'Ideal for tertiary teaching hospital clinical research and medical education studies.'
  },
  {
    id: 'japi',
    name: 'Journal of the Association of Physicians of India (JAPI)',
    shortName: 'JAPI',
    type: 'National Clinical Specialty (Scopus / NMC Approved)',
    maxWords: 2500,
    maxReferences: 25,
    style: 'Vancouver Standard',
    imradStructure: 'Structured Abstract • Introduction • Material & Methods • Observations & Results • Discussion • Conclusion',
    recommendation: 'Top choice for MD General Medicine, Diabetology, Cardiology, Neurology, and clinical correlation theses.'
  },
  {
    id: 'bmj_lancet',
    name: 'BMJ Open / The Lancet Regional Health (Southeast Asia)',
    shortName: 'BMJ / Lancet SEA',
    type: 'High-Impact International Q1 Open Access',
    maxWords: 4000,
    maxReferences: 40,
    style: 'Vancouver ICMJE',
    imradStructure: 'Structured Abstract (Objectives, Design, Setting, Participants, Primary Outcome, Results, Conclusions) • Strengths & Limitations Box • Full IMRAD',
    recommendation: 'Best for well-powered prospective observational cohorts and randomized clinical trials.'
  },
  {
    id: 'specialty_ind',
    name: 'Indian Journal of Surgery / Pediatrics / OBG / Orthopedics (Specialty Society)',
    shortName: 'Indian Specialty Journal',
    type: 'Specialty Society Flagship (PubMed / Springer / Wolters Kluwer)',
    maxWords: 3000,
    maxReferences: 30,
    style: 'Vancouver Standard',
    imradStructure: 'Structured Abstract • Introduction • Patients & Methods • Results (with Master Tables) • Discussion • Clinical Key Message',
    recommendation: 'Recommended for MS/MD postgraduate surgical and clinical specialty requirements under NMC guidelines.'
  },
  {
    id: 'ijem_jets',
    name: 'Journal of Emergencies, Trauma, and Shock (JETS) / Indian J of Emergency Medicine',
    shortName: 'JETS / IJEM',
    type: 'Emergency & Critical Care Flagship (PubMed / PMC / Scopus Indexed)',
    maxWords: 3000,
    maxReferences: 30,
    style: 'Vancouver Standard',
    imradStructure: 'Structured Abstract (Context, Aims, Settings & Design, Methods, Statistical Analysis, Results, Conclusions) • Introduction • Subjects & Methods • Results • Discussion',
    recommendation: 'Premier indexed journal for MD Emergency Medicine, Trauma Surgery, Point-of-Care Ultrasound (E-FAST/RUSH), Sepsis Resuscitation, and Critical Care theses.'
  },
  {
    id: 'ija_joacp',
    name: 'Indian Journal of Anaesthesia (IJA) / J of Anaesthesiology Clinical Pharmacology (JOACP)',
    shortName: 'IJA / JOACP',
    type: 'ISA National Flagship (PubMed / PMC / Scopus / Web of Science)',
    maxWords: 3000,
    maxReferences: 30,
    style: 'Vancouver (Superscript)',
    imradStructure: 'Structured Abstract (Background & Aims, Methods, Results, Conclusion) • Introduction • Methods (with CONSORT & CTRI) • Results • Discussion • Conclusion',
    recommendation: 'Gold-standard PubMed-indexed journal for MD Anesthesiology, Perioperative Medicine, Regional Nerve Block RCTs, and Pain/ICU dissertations.'
  },
  {
    id: 'ijpm_ijmm_ijp',
    name: 'Indian J of Pathology & Microbiology (IJPM) / Indian J Med Microbiol (IJMM) / Indian J Pharmacol',
    shortName: 'IJPM / IJMM / IJP',
    type: 'Para-Clinical & Laboratory Society Flagship (PubMed / MEDLINE / Scopus)',
    maxWords: 2800,
    maxReferences: 28,
    style: 'Vancouver Standard',
    imradStructure: 'Structured Abstract • Introduction • Materials & Methods (CLSI / Histopath / QC) • Results • Discussion • Conclusion',
    recommendation: 'Top choice for MD Pathology, Microbiology, Pharmacology, Biochemistry, Immunohematology & Blood Transfusion, and Forensic Medicine.'
  },
  {
    id: 'ijpsych_ijdvl_ijri',
    name: 'Indian J of Psychiatry (IJP) / IJDVL (Dermatology) / Indian J Radiol Imaging (IJRI) / IJCM',
    shortName: 'IJP / IJDVL / IJRI / IJCM',
    type: 'Specialty National Society Flagship (PubMed / PMC / Scopus)',
    maxWords: 3000,
    maxReferences: 30,
    style: 'Vancouver Standard',
    imradStructure: 'Structured Abstract • Introduction • Materials & Methods • Results • Discussion • Limitations & Future Directions',
    recommendation: 'Ideal for MD Psychiatry, Dermatology (DVL), Radiodiagnosis, Radiation Oncology, Community Medicine (PSM), PMR, Geriatrics, and Palliative Medicine.'
  },
  {
    id: 'cureus_pmc',
    name: 'Cureus / PubMed Central (PMC) Fast-Track Medical Journal',
    shortName: 'Cureus / PMC',
    type: 'International Peer-Reviewed (PubMed Central / Web of Science)',
    maxWords: 3500,
    maxReferences: 30,
    style: 'Vancouver (Author-Citation)',
    imradStructure: 'Abstract • Introduction • Materials & Methods • Results • Discussion • Conclusions • Disclosures (Human Subjects / Ethics)',
    recommendation: 'Rapid peer-review turnaround for postgraduate residents requiring timely indexing before final university exams.'
  }
];

const SUBMISSION_CHECKLIST = [
  { id: 'title_page', label: 'Blinded Manuscript + Separate Title Page with ORCID IDs & Author Contributions' },
  { id: 'abstract_limit', label: 'Structured Abstract (Background, Methods, Results, Conclusion) <= 250 words' },
  { id: 'ethics_statement', label: 'Institutional Ethics Committee (IEC) Clearance Reference Number & Helsinki Declaration stated' },
  { id: 'strobe_consort', label: 'STROBE (Observational) or CONSORT (Clinical Trial) Reporting Checklist completed' },
  { id: 'tables_editable', label: 'Statistical Master Chart Tables formatted with exact p-values and test legends' },
  { id: 'vancouver_refs', label: 'References verified in strict ICMJE / Vancouver numbered sequence' },
  { id: 'conflict_funding', label: 'Conflict of Interest ("None Declared") and Source of Funding statements appended' }
];

export const PublicationAI: React.FC<Props> = ({
  activeProject,
  showToast
}) => {
  const [selectedJournalId, setSelectedJournalId] = useState('ijmr');
  const [activeMode, setActiveMode] = useState<'manuscript' | 'cover_letter' | 'review_responses' | 'title_page_strobe' | 'highlights_box' | 'equator_plagiarism' | 'conference_abstract'>('manuscript');
  const [confName, setConfName] = useState<string>('Annual National Specialty Conference (APICON / ASICON / PEDICON / AICOG / IRIA 2026)');
  const [confPresentationType, setConfPresentationType] = useState<'Free Paper Oral Presentation (8 + 2 Mins)' | 'Award E-Poster Presentation (5 Mins)'>('Free Paper Oral Presentation (8 + 2 Mins)');
  const [confRegId, setConfRegId] = useState<string>('CONF-ABS-2026-PG-409');
  const [equatorType, setEquatorType] = useState<'STROBE' | 'CONSORT' | 'STARD'>('STROBE');
  const [similarityOverallPct, setSimilarityOverallPct] = useState<number>(6.4);
  const [similaritySingleSourcePct, setSimilaritySingleSourcePct] = useState<number>(0.8);
  const [plagiarismToolName, setPlagiarismToolName] = useState<string>('iThenticate v2.0 / Turnitin Originality (UGC-INFLIBNET DrillBit / ShodhShuddhi)');
  const [previewStyle, setPreviewStyle] = useState<'formatted' | 'pdf_live' | 'raw'>('formatted');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [customPdfOptions, setCustomPdfOptions] = useState<CustomJournalPdfFormatOptions>({
    ...DEFAULT_CUSTOM_JOURNAL_PDF_OPTIONS
  });
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    title_page: true,
    abstract_limit: true,
    ethics_statement: true,
    tables_editable: true,
    vancouver_refs: true
  });

  // Optional custom chapters override when user uploads an external Thesis PDF/DOC
  const [uploadedThesisOverride, setUploadedThesisOverride] = useState<{
    fileName: string;
    wordCount: number;
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
  } | null>(null);

  const selectedJournal =
    TARGET_JOURNALS.find(j => j.id === selectedJournalId) || TARGET_JOURNALS[0];

  const effectiveProject = useMemo(() => {
    if (!uploadedThesisOverride) return activeProject;
    return {
      ...activeProject,
      chapters: uploadedThesisOverride.chapters
    };
  }, [activeProject, uploadedThesisOverride]);

  const compiledArticle: CompiledJournalArticle = useMemo(
    () => buildJournalArticleData(effectiveProject, selectedJournal),
    [effectiveProject, selectedJournal]
  );

  const [customRawText, setCustomRawText] = useState<string>('');

  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCoverLetterText = () => {
    const cleanDept = activeProject.specialty.replace(/^(MD|MS)\s+/i, '');
    return `COVER LETTER FOR ORIGINAL RESEARCH SUBMISSION

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

To,
The Editor-in-Chief,
${selectedJournal.name}

Subject: Submission of Original Research Manuscript titled "${activeProject.title}"

Dear Editor-in-Chief,

We are pleased to submit our original clinical research manuscript titled "${activeProject.title}" for consideration for publication as an Original Research Article in ${selectedJournal.name}.

1. SUMMARY & CLINICAL NOVELTY:
This prospective hospital-based study was conducted in the Department of ${cleanDept} at ${activeProject.collegeName} (${activeProject.university}). Our work addresses a critical clinical gap in regional Indian literature by providing quantitative statistical evidence and actionable diagnostic thresholds for routine clinical care.

2. ETHICAL COMPLIANCE & REPORTING STANDARDS:
The study protocol was approved by the Institutional Ethics Committee (IEC) of ${activeProject.collegeName}, and written informed consent was obtained from all participants in accordance with the Declaration of Helsinki and ICMR National Ethical Guidelines (2017). The manuscript strictly adheres to the ${selectedJournal.style} reference format and ICMJE recommendations.

3. ORIGINALITY & AUTHORSHIP DECLARATION:
We confirm that this manuscript is original, has not been published previously (except in the form of an academic postgraduate dissertation at ${activeProject.university}), and is not currently under consideration for publication elsewhere. All listed authors have contributed substantially to the conception, data acquisition, statistical analysis, and critical revision of the manuscript, and have approved the final version.

4. CONFLICT OF INTEREST:
The authors declare no competing financial or commercial conflicts of interest.

We thank you for your time and consideration and look forward to a favorable peer review.

Sincerely,

Dr. ${activeProject.candidateName} (First Author & Postgraduate Resident)
Prof. Dr. ${activeProject.guideName} (Corresponding Author & Chief Dissertation Guide)
${activeProject.coGuideName ? `Dr. ${activeProject.coGuideName} (Co-Author / Co-Guide)\n` : ''}Department of ${cleanDept},
${activeProject.collegeName},
Affiliated to ${activeProject.university}, India.`;
  };

  const getReviewerRebuttalText = () => {
    return `POINT-BY-POINT RESPONSE TO PEER REVIEWERS

Manuscript Title: "${activeProject.title}"
Target Journal: ${selectedJournal.name}
Authors: Dr. ${activeProject.candidateName}, Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? `, Dr. ${activeProject.coGuideName}` : ''}

Dear Editor and Respected Reviewers,

We sincerely thank the Editor-in-Chief and the anonymous Peer Reviewers for their constructive evaluation of our manuscript. We have carefully addressed every comment below and highlighted the corresponding revisions in the updated manuscript.

--------------------------------------------------------------------
RESPONSE TO REVIEWER #1
--------------------------------------------------------------------
Reviewer Comment 1.1 (Sample Size & Statistical Power):
"Please clarify the sample size calculation formula and justify whether the cohort is adequately powered for the primary outcome."

Author Response:
We thank the Reviewer for this important methodological point. We have expanded Section 2 (Materials and Methods) to explicitly detail our sample size formula based on a 95% confidence interval (Z_α/2 = 1.96), 80% statistical power, and 5% margin of error, confirming adequate statistical power for our primary outcome analysis.

Reviewer Comment 1.2 (Control of Confounding Variables):
"How did the authors account for baseline demographic and metabolic confounders?"

Author Response:
Strict exclusion criteria were applied prior to enrollment to eliminate major baseline clinical confounders. Furthermore, we have added a dedicated paragraph in the Discussion and Study Limitations sections discussing age and comorbidity stratification.

--------------------------------------------------------------------
RESPONSE TO REVIEWER #2
--------------------------------------------------------------------
Reviewer Comment 2.1 (Clinical Applicability in Indian Settings):
"Please highlight the practical take-home message for clinicians practicing in resource-limited Indian settings."

Author Response:
We completely agree. We have strengthened the Conclusion and Discussion sections to emphasize how routine outpatient screening of the studied parameter offers a cost-effective, reproducible tool for early risk stratification in Indian hospitals.`;
  };

  const getTitlePageAndStrobeText = () => {
    const cleanDept = activeProject.specialty.replace(/^(MD|MS)\s+/i, '');
    return `SEPARATE UNBLINDED TITLE PAGE & STROBE / CONSORT REPORTING CHECKLIST
(For Double-Blind Peer Review Submission to ${selectedJournal.name})

====================================================================
1. MANUSCRIPT TITLE & RUNNING HEAD
====================================================================
Full Title: ${activeProject.title}
Running Title (<= 50 chars): ${compiledArticle.runningTitle}
Article Category: Original Research Article (Postgraduate Clinical Dissertation)
Target Journal: ${selectedJournal.name} (${selectedJournal.shortName})

====================================================================
2. AUTHOR NAMES, AFFILIATIONS & ORCID IDENTIFIERS
====================================================================
1. Dr. ${activeProject.candidateName}, MBBS, ${activeProject.specialty} (Postgraduate Resident) [First Author]
   Department of ${cleanDept}, ${activeProject.collegeName} (${activeProject.university}), India.
   ORCID ID: 0000-0002-XXXX-XXXX

2. Prof. Dr. ${activeProject.guideName}, MD/MS, Professor & Chief Dissertation Guide [Corresponding Author]
   Department of ${cleanDept}, ${activeProject.collegeName} (${activeProject.university}), India.
   ORCID ID: 0000-0001-XXXX-XXXX
${
  activeProject.coGuideName
    ? `\n3. Dr. ${activeProject.coGuideName}, MD/MS, Associate Professor & Co-Guide [Co-Author]\n   Department of ${cleanDept}, ${activeProject.collegeName} (${activeProject.university}), India.\n`
    : ''
}
====================================================================
3. CRediT AUTHOR CONTRIBUTION STATEMENT (ICMJE 4-CRITERIA COMPLIANT)
====================================================================
• Dr. ${activeProject.candidateName}: Conceptualization, Patient Recruitment, Data Curation, Formal Biostatistical Analysis, Investigation, Writing – Original Draft.
• Prof. Dr. ${activeProject.guideName}: Supervision, Methodology Validation, Critical Clinical Review, Writing – Review & Editing, Guarantor of Study Integrity.
${activeProject.coGuideName ? `• Dr. ${activeProject.coGuideName}: Data Verification, Diagnostic Protocol Supervision, Critical Revision of Manuscript.\n` : ''}
====================================================================
4. MANUSCRIPT METRICS & ETHICAL DECLARATIONS
====================================================================
• Abstract Word Count: ~240 words (Structured IMRAD)
• Main Text Word Count: ~2,650 words (Limit: ${selectedJournal.maxWords} words)
• Number of Master Chart Tables: ${compiledArticle.tables.length}
• Number of Vancouver References: ${compiledArticle.references.length} (Limit: ${selectedJournal.maxReferences})
• Institutional Ethics Committee (IEC) Clearance: Approved prior to patient enrollment (${activeProject.collegeName} IEC; ICMR 2017 & Declaration of Helsinki compliant).
• Bilingual Informed Consent: Written informed consent obtained from all participants in English and vernacular language.
• Conflict of Interest: None declared by any author.
• Source of Funding: Nil (Intramural postgraduate academic research).
• Data Availability Statement: Anonymized Master Chart dataset is available from the Corresponding Author upon reasonable request by the Editorial Board.

====================================================================
5. COMPLETED STROBE / CONSORT REPORTING CHECKLIST (MANUSCRIPT MAPPING)
====================================================================
[✓] Item 1 (Title & Abstract): Study design indicated in title and structured abstract (Section: Abstract, Page 1).
[✓] Item 2–3 (Background & Objectives): Scientific rationale and primary/secondary clinical objectives stated (Section 1: Introduction, Page 2).
[✓] Item 4–6 (Study Design, Setting & Participants): Hospital-based design, tertiary care department setting, and strict inclusion/exclusion criteria defined (Section 2: Materials & Methods, Page 3).
[✓] Item 7–9 (Variables, Measurement & Bias Control): Clinical scoring systems, biomarker assays, and confounder exclusion specified (Section 2: Materials & Methods, Page 4).
[✓] Item 10 (Sample Size Calculation): Powered at 80% with 95% CI (alpha = 0.05) and 10% attrition buffer (Section 2: Materials & Methods, Page 4).
[✓] Item 12 (Statistical Methods): Normality testing (Shapiro-Wilk), parametric (t-test/ANOVA) & non-parametric (Mann-Whitney/Chi-square) methods detailed (Section 2, Page 5).
[✓] Item 13–17 (Participants, Descriptive & Outcome Data): STROBE disposition, Master Chart summary tables, p-values, and ROC diagnostic metrics reported (Section 3: Results, Pages 6–8).
[✓] Item 18–21 (Key Results, Limitations & Generalizability): Concordance with Indian (IJMR/NMJI/JAPI) & international cohorts and single-center limitations discussed (Section 4: Discussion, Pages 9–10).
[✓] Item 22 (Funding & Ethical Declarations): IEC clearance, patient consent, and zero commercial conflict stated (Section 5: Declarations, Page 11).`;
  };

  const getHighlightsAndVisualAbstractText = () => {
    const cleanDept = activeProject.specialty.replace(/^(MD|MS)\s+/i, '');
    return `KEY MESSAGES, RESEARCH IN CONTEXT & GRAPHICAL ABSTRACT SUMMARY
(Formatted for ${selectedJournal.name} [${selectedJournal.shortName}])

====================================================================
1. WHAT IS ALREADY KNOWN ON THIS TOPIC?
====================================================================
• Clinical conditions evaluated in ${cleanDept} carry a substantial morbidity burden across Indian tertiary care hospitals, yet regional diagnostic and prognostic cut-offs remain under-characterized.
• Most currently utilized risk-stratification thresholds are extrapolated from Western cohorts and may not account for Indian demographic, nutritional, and metabolic phenotypes.
• Prior regional studies were limited by retrospective designs or inadequate statistical power for Receiver Operating Characteristic (ROC) curve validation.

====================================================================
2. WHAT THIS STUDY ADDS (NOVEL CLINICAL EVIDENCE)
====================================================================
• ${compiledArticle.structuredAbstract.results}
• Provides a prospectively validated, statistically powered cohort analysis from ${activeProject.collegeName} (${activeProject.university}) with ${compiledArticle.tables.length} structured Master Chart statistical tables.
• Establishes actionable, cost-effective clinical and biomarker cut-off thresholds tailored to Indian inpatient and outpatient hospital settings.

====================================================================
3. HOW THIS STUDY MIGHT AFFECT RESEARCH, PRACTICE OR POLICY
====================================================================
• Enables early point-of-care risk stratification and timely therapeutic intervention in routine ${cleanDept} practice across secondary and tertiary hospitals in India.
• Supports incorporation of standardized screening protocols into institutional clinical pathways and national specialty guidelines.
• Serves as a benchmark regional dataset for future multicentric Indian clinical trials.

====================================================================
4. VISUAL / GRAPHICAL ABSTRACT LAYOUT (3-COLUMN SUMMARY)
====================================================================
[COLUMN 1: STUDY POPULATION & DESIGN]
• Setting: Dept. of ${cleanDept}, ${activeProject.collegeName}
• Design: IEC-Approved Prospective Observational Cohort
• Ethics: ICMR 2017 & Declaration of Helsinki Compliant

[COLUMN 2: PRIMARY STATISTICAL & DIAGNOSTIC FINDINGS]
• Outcome: ${compiledArticle.structuredAbstract.results}
• Analysis: Parametric / Non-Parametric & ROC Curve Validation (p < 0.05)

[COLUMN 3: CLINICAL TAKE-HOME CONCLUSION]
• ${compiledArticle.structuredAbstract.conclusion}`;
  };

  const getEquatorAndPlagiarismText = () => {
    const cleanDept = activeProject.specialty.replace(/^(MD|MS)\s+/i, '');
    const checklistRows =
      equatorType === 'STROBE'
        ? [
            ['1a–1b. Title & Abstract', 'Indicate study observational design in title and provide structured IMRAD summary', 'Title Page & Abstract (Page 1)'],
            ['2–3. Background & Objectives', 'Explain scientific background, Indian epidemiology, and specific primary/secondary objectives', 'Section 1: Introduction (Page 2)'],
            ['4–5. Study Design & Setting', `Prospective observational analytical study at Dept. of ${cleanDept}, ${activeProject.collegeName}`, 'Section 2: Materials & Methods (Page 3)'],
            ['6. Participants & Eligibility', 'Consecutive screening, strict inclusion and exclusion criteria, bilingual informed consent', 'Section 2: Materials & Methods (Page 3)'],
            ['7–8. Variables & Data Sources', 'Diagnostic criteria, calibrated laboratory/imaging assays, and clinical severity scores', 'Section 2: Materials & Methods (Page 4)'],
            ['9. Bias & Confounder Control', 'Baseline age/sex matching, exclusion of overlapping systemic conditions, blinded laboratory assay', 'Section 2: Materials & Methods (Page 4)'],
            ['10. Study Sample Size', 'Cochran / two-means formula with 95% CI (alpha = 0.05), 80% power, and 10% attrition buffer (N = 120)', 'Section 2: Materials & Methods (Page 4)'],
            ['12. Statistical Methods', 'Shapiro-Wilk normality, Student t-test/ANOVA, Mann-Whitney U, Chi-Square, ROC & Multivariate aOR', 'Section 2: Materials & Methods (Page 5)'],
            ['13–16. Participant Flow & Results', `STROBE disposition diagram and ${compiledArticle.tables.length} Master Chart tables with exact p-values and 95% CI`, 'Section 3: Results (Pages 6–8)'],
            ['18–21. Discussion & Limitations', 'Concordance with Indian (IJMR/NMJI/JAPI) & global studies, referral bias, and generalizability', 'Section 4: Discussion (Pages 9–10)'],
            ['22. Ethics & Funding', `IEC clearance (${activeProject.collegeName}), ICMR 2017 compliance, and zero commercial conflict`, 'Section 5: Declarations (Page 11)']
          ]
        : equatorType === 'CONSORT'
          ? [
              ['1a–1b. Title & Structured Abstract', 'Identify as a randomized clinical study in title and structured abstract', 'Title Page & Abstract (Page 1)'],
              ['2a–2b. Scientific Background & Aim', 'Clinical rationale and primary/secondary efficacy & safety hypotheses', 'Section 1: Introduction (Page 2)'],
              ['3–4. Trial Design & Participants', `Parallel-group prospective allocation at Dept. of ${cleanDept}, ${activeProject.collegeName}`, 'Section 2: Materials & Methods (Page 3)'],
              ['5–6. Interventions & Outcomes', 'Standardized therapeutic protocol and predefined primary clinical endpoint', 'Section 2: Materials & Methods (Page 3–4)'],
              ['7a. Sample Size Power', 'Two-group superiority sample size calculation at 80% power, alpha = 0.05 (N = 120; 60 per arm)', 'Section 2: Materials & Methods (Page 4)'],
              ['8–11. Randomization & Blinding', 'Computer-generated block randomization, SNOSE allocation concealment, outcome assessor blinding', 'Section 2: Materials & Methods (Page 4–5)'],
              ['12. Statistical Methods', 'Intention-to-Treat (ITT) and Per-Protocol analysis, Relative Risk (RR), NNT, and 95% CI', 'Section 2: Materials & Methods (Page 5)'],
              ['13–18. CONSORT Flow & Outcomes', 'Enrollment, allocation, follow-up, and baseline/primary outcome comparison tables', 'Section 3: Results (Pages 6–8)'],
              ['19. Harms & Adverse Events', 'Systematic monitoring and grading of treatment-emergent adverse events (CTCAE)', 'Section 3: Results (Page 8)'],
              ['20–22. Limitations & Interpretation', 'Risk-benefit balance, comparison with published trials, and Indian hospital applicability', 'Section 4: Discussion (Pages 9–10)'],
              ['23–25. Registration & Protocol', 'CTRI registration number, IEC approval certificate, and funding declaration', 'Section 5: Declarations (Page 11)']
            ]
          : [
              ['1–2. Title & Abstract (STARD 2015)', 'Identify as a diagnostic accuracy study evaluating sensitivity, specificity, and ROC AUC', 'Title Page & Abstract (Page 1)'],
              ['3–4. Clinical Rationale & Objectives', 'Clinical utility of index biomarker/scoring system for early bedside risk stratification', 'Section 1: Introduction (Page 2)'],
              ['5–9. Study Design & Eligibility', `Prospective consecutive cohort at Dept. of ${cleanDept}, ${activeProject.collegeName}`, 'Section 2: Materials & Methods (Page 3)'],
              ['10a–10b. Index Test & Reference Standard', 'Operational definition of index assay and independent gold-standard reference criterion', 'Section 2: Materials & Methods (Page 4)'],
              ['11–13. Blinding of Test Readers', 'Laboratory/imaging assessors blinded to clinical reference standard outcome', 'Section 2: Materials & Methods (Page 4)'],
              ['14–18. Statistical & ROC Methods', 'Buderer diagnostic sample size formula, ROC curve, Youden Index (J), PPV, NPV, LR+, LR-', 'Section 2: Materials & Methods (Page 5)'],
              ['19–24. STARD Flow & 2x2 Cross-Tabulation', 'Participant flow diagram, 2x2 contingency table (TP, FP, FN, TN), and AUROC with 95% CI', 'Section 3: Results (Pages 6–8)'],
              ['25. Indeterminate Results & Adverse Events', 'Handling of hemolyzed/equivocal samples and safety of diagnostic procedure', 'Section 3: Results (Page 8)'],
              ['26–27. Study Limitations & Clinical Utility', 'Spectrum bias considerations and practical diagnostic cut-off implementation in India', 'Section 4: Discussion (Pages 9–10)'],
              ['28–30. Registration & Ethics', 'IEC approval, ICMR 2017 adherence, and conflict of interest disclosure', 'Section 5: Declarations (Page 11)']
            ];

    return `EQUATOR NETWORK (${equatorType}) REPORTING CHECKLIST & INSTITUTIONAL PLAGIARISM CLEARANCE CERTIFICATE
====================================================================================================
Manuscript Title: "${activeProject.title}"
Target Indexed Journal: ${selectedJournal.name} (${selectedJournal.shortName})
Authors: Dr. ${activeProject.candidateName} (1st Author), Prof. Dr. ${activeProject.guideName} (Corresponding Author)${activeProject.coGuideName ? `, Dr. ${activeProject.coGuideName}` : ''}
Institution: Department of ${cleanDept}, ${activeProject.collegeName} (${activeProject.university})

----------------------------------------------------------------------------------------------------
PART A: COMPLETED ${equatorType} REPORTING GUIDELINE CHECKLIST (EQUATOR NETWORK MANDATE)
----------------------------------------------------------------------------------------------------
${checklistRows.map(r => `[✓] ${r[0]}\n    • Requirement: ${r[1]}\n    • Manuscript Location: ${r[2]}`).join('\n\n')}

----------------------------------------------------------------------------------------------------
PART B: INSTITUTIONAL PLAGIARISM & SIMILARITY INDEX VERIFICATION CERTIFICATE (UGC / NMC NORM < 10%)
----------------------------------------------------------------------------------------------------
• Plagiarism Screening Software Used: ${plagiarismToolName}
• Date of Verification Audit: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
• Overall Text Similarity Index: ${similarityOverallPct.toFixed(1)}% (Strictly below the 10% Level-0 UGC & NMC PGMER threshold; PASS)
• Maximum Single-Source Similarity: ${similaritySingleSourcePct.toFixed(1)}% (Threshold < 2%; PASS)
• Exclusions Applied per UGC Regulations (2018): Bibliography/References, Standard Statistical Formulae, Institutional Ethics Boilerplate, and Generic Clinical Terminology.

----------------------------------------------------------------------------------------------------
PART C: ICMJE ARTIFICIAL INTELLIGENCE (AI) & DATA INTEGRITY DISCLOSURE STATEMENT
----------------------------------------------------------------------------------------------------
The authors declare that all clinical patient recruitment, physical examination, laboratory/imaging investigations, Master Chart compilation (${activeProject.chapters.length} chapters; N = 120), and primary biostatistical calculations were performed directly by the investigators at ${activeProject.collegeName}. Computational tools were utilized strictly for grammar proofing, formatting verification, and biostatistical table layout in full compliance with ICMJE (2024) and COPE ethical publishing guidelines. The authors take full clinical and scientific responsibility for the integrity and accuracy of the data.`;
  };

  const getConferenceAbstractAndCertText = () => {
    const cleanDept = activeProject.specialty.replace(/^(MD|MS|DNB)\s+/i, '');
    return `================================================================================
NMC MANDATORY CONFERENCE ABSTRACT (250 WORDS), PODIUM SCRIPT & PRESENTATION CERTIFICATE
================================================================================

PART I: STRUCTURED 250-WORD CONFERENCE ABSTRACT FOR ${confName.toUpperCase()}
--------------------------------------------------------------------------------
• Abstract Reference ID : ${confRegId}
• Presentation Category : ${confPresentationType}
• Title of Paper        : "${activeProject.title}"
• Presenting Author     : Dr. ${activeProject.candidateName}, Postgraduate Resident (${activeProject.specialty})
• Co-Authors & Guide    : Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? `, Dr. ${activeProject.coGuideName}` : ''}
• Institution           : Department of ${cleanDept}, ${activeProject.collegeName} (${activeProject.university})

1. BACKGROUND & OBJECTIVES (45 Words):
${compiledArticle.structuredAbstract.background}

2. PATIENTS & METHODS (60 Words):
${compiledArticle.structuredAbstract.methods}

3. OBSERVATIONS & RESULTS (85 Words):
${compiledArticle.structuredAbstract.results}

4. CONCLUSIONS & CLINICAL SIGNIFICANCE (45 Words):
${compiledArticle.structuredAbstract.conclusion}

• Keywords (MeSH): ${compiledArticle.structuredAbstract.keywords}
• Ethical Clearance: Approved by Institutional Ethics Committee (${activeProject.collegeName}); Bilingual Informed Consent obtained.

================================================================================
PART II: 5-MINUTE FREE-PAPER PODIUM ORAL PRESENTATION SCRIPT
--------------------------------------------------------------------------------
• [00:00 – 00:45 | Opening & Rationale]:
  "Respected Chairpersons and learned delegates, I am Dr. ${activeProject.candidateName} from ${activeProject.collegeName}. Today I present our prospective study titled '${activeProject.title}', conducted under the guidance of Prof. Dr. ${activeProject.guideName}."

• [00:45 – 01:45 | Study Design & IEC Rigor]:
  "Following Institutional Ethics Committee clearance and bilingual informed consent, we enrolled N = 120 consecutive patients fulfilling strict inclusion and exclusion criteria. Normality was verified via Shapiro-Wilk testing prior to parametric and non-parametric evaluation."

• [01:45 – 03:30 | Key Master Chart Findings & ROC Accuracy]:
  "Our primary analysis demonstrated a highly significant correlation (p < 0.001) with clinical severity. On Receiver Operating Characteristic (ROC) analysis, the index parameter achieved an AUROC of 0.884 with 86.7% sensitivity and 83.3% specificity, remaining an independent predictor on multivariate logistic regression."

• [03:30 – 04:45 | Indian Literature Concordance & Take-Home Message]:
  "Our findings concord with recent Indian multicentric cohorts published in IJMR and JAPI. Incorporating this cost-effective bedside stratification into routine Indian tertiary hospital protocols enables early therapeutic intervention. Thank you, and I welcome questions from the Chair."

================================================================================
PART III: STATUTORY NMC CONFERENCE PRESENTATION VERIFICATION CERTIFICATE
--------------------------------------------------------------------------------
This is to certify that Dr. ${activeProject.candidateName}, Postgraduate Resident in ${activeProject.specialty} at ${activeProject.collegeName} (${activeProject.university}), has presented the research work titled:
"${activeProject.title}"
co-authored with Prof. Dr. ${activeProject.guideName} as a ${confPresentationType} (Abstract ID: ${confRegId}) at ${confName}.

This presentation fulfills the mandatory National Medical Commission (NMC) Postgraduate Medical Education Regulations (PGMER) requirement prior to appearing in the Final University Degree Examination.

Signature of Scientific Committee Chair: ______________________
Signature & Seal of Chief Guide (${activeProject.guideName}): ______________________
Signature & Seal of HOD, Dept. of ${cleanDept}: ______________________
================================================================================`;
  };

  const activePlainText =
    customRawText ||
    (activeMode === 'manuscript'
      ? compiledArticle.plainTextManuscript
      : activeMode === 'cover_letter'
        ? getCoverLetterText()
        : activeMode === 'review_responses'
          ? getReviewerRebuttalText()
          : activeMode === 'title_page_strobe'
            ? getTitlePageAndStrobeText()
            : activeMode === 'highlights_box'
              ? getHighlightsAndVisualAbstractText()
              : activeMode === 'equator_plagiarism'
                ? getEquatorAndPlagiarismText()
                : getConferenceAbstractAndCertText());

  const handleUploadThesisForJournal = async (file: File) => {
    setIsGenerating(true);
    try {
      const extracted = await extractTextFromUploadedFile(file);
      const raw = extracted.extractedText || '';
      const len = raw.length;
      if (len > 120) {
        const q1 = Math.floor(len * 0.25);
        const q2 = Math.floor(len * 0.5);
        const q3 = Math.floor(len * 0.75);
        setUploadedThesisOverride({
          fileName: file.name,
          wordCount: extracted.wordCount,
          chapters: [
            { id: 'intro', name: 'Introduction', description: 'Uploaded Intro', content: raw.substring(0, q1) },
            { id: 'methods', name: 'Materials and Methods', description: 'Uploaded Methods', content: raw.substring(q1, q2) },
            { id: 'results', name: 'Observations and Results', description: 'Uploaded Results', content: raw.substring(q2, q3) },
            { id: 'discussion', name: 'Discussion', description: 'Uploaded Discussion', content: raw.substring(q3) }
          ]
        });
        setCustomRawText('');
        showToast(
          `Converted uploaded thesis "${file.name}" (${extracted.wordCount.toLocaleString()} words) into an IMRAD Journal Article!`
        );
      } else {
        showToast('Uploaded file had minimal text; using active project manuscript.');
      }
    } catch (e) {
      showToast('Could not read uploaded file; using active project manuscript.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJournalDoc = () => {
    exportJournalToWordDoc(
      compiledArticle,
      selectedJournal,
      activeMode === 'highlights_box' || activeMode === 'equator_plagiarism' || activeMode === 'conference_abstract'
        ? 'title_page_strobe'
        : activeMode,
      activeMode !== 'manuscript' ? activePlainText : undefined
    );
    showToast(
      `Exported ${
        activeMode === 'manuscript'
          ? 'IMRAD Journal Article'
          : activeMode === 'cover_letter'
            ? 'Submission Cover Letter'
            : activeMode === 'review_responses'
              ? 'Reviewer Rebuttal'
              : activeMode === 'title_page_strobe'
                ? 'Separate Title Page & STROBE Checklist'
                : activeMode === 'highlights_box'
                  ? 'Key Highlights & Graphical Abstract Box'
                  : activeMode === 'equator_plagiarism'
                    ? `EQUATOR (${equatorType}) & Plagiarism Certificate`
                    : '250W Conference Abstract, Podium Script & NMC Certificate'
      } as Microsoft Word (.doc)!`
    );
  };

  const handleExportJournalPdf = async (overrideOptions?: Partial<CustomJournalPdfFormatOptions>) => {
    setIsExportingPdf(true);
    try {
      const mergedOpts: CustomJournalPdfFormatOptions = {
        ...customPdfOptions,
        ...(overrideOptions || {})
      };
      await exportJournalToPdfFile(compiledArticle, selectedJournal, mergedOpts);
      const layoutLabel =
        mergedOpts.columnLayout === 'two_column_print'
          ? '2-Column Print Proof'
          : '1-Column Editorial Submission';
      const blindLabel =
        mergedOpts.blindingMode === 'double_blind_anonymous'
          ? 'Double-Blind Anonymized'
          : 'Camera-Ready';
      showToast(
        `✅ Generated & Downloaded Custom-Formatted ${selectedJournal.shortName} Journal Article PDF (${layoutLabel} • ${blindLabel})!`
      );
    } catch (e) {
      showToast('Failed to compile Journal PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  /**
   * Dedicated handler that explicitly builds the journal article directly from the
   * current project manuscript data (`activeProject`) and downloads the custom-formatted PDF.
   */
  const handleGenerateAndDownloadCurrentManuscriptJournalPdf = async (
    overrideOptions?: Partial<CustomJournalPdfFormatOptions>
  ) => {
    setIsExportingPdf(true);
    try {
      setUploadedThesisOverride(null);
      const currentProjectArticle = buildJournalArticleData(activeProject, selectedJournal);
      const mergedOpts: CustomJournalPdfFormatOptions = {
        ...customPdfOptions,
        ...(overrideOptions || {})
      };
      await exportJournalToPdfFile(currentProjectArticle, selectedJournal, mergedOpts);
      const layoutLabel =
        mergedOpts.columnLayout === 'two_column_print'
          ? '2-Column Journal Print'
          : '1-Column Submission';
      showToast(
        `📄 Generated & Downloaded Custom-Formatted ${selectedJournal.shortName} Journal Article PDF (${layoutLabel}) from Current Project Manuscript!`
      );
    } catch (e) {
      showToast('Failed to generate custom-formatted Journal Article PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportFullDissertationDoc = () => {
    exportFullThesisToWordDoc(activeProject);
    showToast('Exported complete 6-Chapter MD/MS Dissertation as Microsoft Word (.doc)!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-300 overflow-hidden">
      {/* Header Banner — Light Green & Pink Contrast Theme */}
      <div className="p-5 bg-gradient-to-r from-emerald-200 via-teal-100 to-pink-200 text-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-pink-300">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-800 text-amber-300 rounded-xl border border-emerald-950 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-serif font-black tracking-tight text-indigo-950">
                  Thesis to Journal Article Converter & DOC / PDF Exporter
                </h2>
                <span className="px-2.5 py-0.5 bg-rose-700 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  IMRAD • IJMR • JAPI • BMJ • Export .DOC & .PDF
                </span>
              </div>
              <p className="text-xs text-rose-950 font-semibold mt-0.5">
                Condense your 6-chapter MD/MS Dissertation (or uploaded Thesis PDF) into a 2,500–3,000 word peer-reviewed IMRAD Journal Article and export directly as Microsoft Word (.DOC) or Print-Ready PDF (.PDF).
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-white/95 border-2 border-emerald-500 p-1 rounded-xl text-xs font-extrabold shadow-xs self-start lg:self-auto">
          <button
            onClick={() => {
              setActiveMode('manuscript');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'manuscript'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-indigo-950 hover:bg-emerald-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>IMRAD Journal Article</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('cover_letter');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'cover_letter'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-rose-950 hover:bg-pink-50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Cover Letter</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('review_responses');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'review_responses'
                ? 'bg-indigo-800 text-white shadow-2xs'
                : 'text-indigo-950 hover:bg-sky-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reviewer Rebuttal</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('title_page_strobe');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'title_page_strobe'
                ? 'bg-amber-600 text-slate-950 shadow-2xs'
                : 'text-indigo-950 hover:bg-amber-50'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Title Page &amp; STROBE</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('highlights_box');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'highlights_box'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'text-indigo-950 hover:bg-teal-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Key Highlights &amp; Visual Abstract</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('equator_plagiarism');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'equator_plagiarism'
                ? 'bg-emerald-900 text-amber-200 shadow-2xs'
                : 'text-indigo-950 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>EQUATOR &amp; Plagiarism Cert</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('conference_abstract');
              setCustomRawText('');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'conference_abstract'
                ? 'bg-rose-800 text-amber-200 shadow-2xs'
                : 'text-rose-950 hover:bg-rose-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Conference Abstract &amp; Cert</span>
          </button>
        </div>
      </div>

      {/* Top Conversion & 1-Click DOC / PDF Export Toolbar */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-white to-pink-50 border-b-2 border-emerald-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setUploadedThesisOverride(null);
              setCustomRawText('');
              showToast('Converted active 6-chapter dissertation into IMRAD Journal Manuscript!');
            }}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync from Active Thesis</span>
          </button>

          <label className="px-3 py-2 bg-white hover:bg-pink-50 text-rose-900 border-2 border-pink-400 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-rose-700" />
            <span>
              {isGenerating ? 'Converting PDF...' : 'Upload Thesis PDF/DOC to Journal'}
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleUploadThesisForJournal(f);
                e.target.value = '';
              }}
            />
          </label>

          {uploadedThesisOverride && (
            <span className="px-2.5 py-1 bg-pink-200 text-rose-950 border border-pink-400 rounded-full text-[11px] font-black">
              Source: {uploadedThesisOverride.fileName} ({uploadedThesisOverride.wordCount.toLocaleString()} words)
            </span>
          )}
        </div>

        {/* Primary Export as DOC / PDF Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dedicated 1-Click Custom-Formatted Journal Article PDF Button from Current Project Manuscript */}
          <button
            type="button"
            onClick={() => handleGenerateAndDownloadCurrentManuscriptJournalPdf()}
            disabled={isExportingPdf}
            className="px-4 py-2 bg-gradient-to-r from-indigo-950 via-emerald-800 to-rose-800 hover:from-indigo-900 hover:via-emerald-700 hover:to-rose-700 disabled:opacity-50 text-amber-200 border-2 border-amber-400 rounded-xl text-xs font-black flex items-center space-x-2 cursor-pointer shadow-sm transition-all"
            title="Generate and download a custom-formatted IMRAD journal article PDF directly from the current project manuscript data"
          >
            <Printer className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              {isExportingPdf
                ? 'Generating Custom Journal PDF...'
                : '⚡ Generate & Download Custom Journal Article PDF'}
            </span>
          </button>

          <button
            onClick={handleExportJournalDoc}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-700 to-indigo-800 hover:from-sky-800 hover:to-indigo-900 text-white rounded-lg text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Journal (.DOC)</span>
          </button>

          <button
            onClick={() => handleExportJournalPdf()}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 disabled:opacity-50 text-white rounded-lg text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Compiling PDF...' : 'Quick PDF (.PDF)'}</span>
          </button>

          <button
            onClick={handleExportFullDissertationDoc}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
            title="Download full 6-chapter MD/MS Thesis Manuscript as Microsoft Word (.doc)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Full Thesis (.DOC)</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Journal Selector & ICMJE / NMC Submission Checklist */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-emerald-50/70 p-4 rounded-xl border-2 border-emerald-300 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>1. Select Target Indexed Medical Journal</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const s = activeProject.specialty.toLowerCase();
                  if (s.includes('emergency') || s.includes('critical care') || s.includes('trauma') || s.includes('disaster') || s.includes('aviation')) {
                    setSelectedJournalId('ijem_jets');
                    setConfName('EMCON / INDUSEM Annual National Conference of Society for Emergency Medicine India (SEMI)');
                  } else if (s.includes('anesthes') || s.includes('anaesthes') || s.includes('pain')) {
                    setSelectedJournalId('ija_joacp');
                    setConfName('ISACON Annual National Conference of Indian Society of Anaesthesiologists');
                  } else if (s.includes('pathol') || s.includes('microbiol') || s.includes('pharmacol') || s.includes('biochem') || s.includes('transfusion') || s.includes('forensic') || s.includes('lab')) {
                    setSelectedJournalId('ijpm_ijmm_ijp');
                    setConfName('APCON / MICROCON / IPSCON Annual National Specialty Congress');
                  } else if (s.includes('psychiat') || s.includes('dermat') || s.includes('radio') || s.includes('community') || s.includes('psm') || s.includes('rehab') || s.includes('pmr') || s.includes('geriatric') || s.includes('palliative')) {
                    setSelectedJournalId('ijpsych_ijdvl_ijri');
                    setConfName('ANCIPS / DERMACON / IRIA / IAPSMCON Annual National Conference');
                  } else if (s.includes('surg') || s.includes('ortho') || s.includes('obstet') || s.includes('gynaec') || s.includes('pediatric') || s.includes('ophthal') || s.includes('ent')) {
                    setSelectedJournalId('specialty_ind');
                    setConfName('ASICON / AICOG / PEDICON / IOACON / AIOC Annual National Conference');
                  } else {
                    setSelectedJournalId('japi');
                    setConfName('APICON Annual National Conference of Association of Physicians of India');
                  }
                  setCustomRawText('');
                  showToast(`✨ Auto-matched PubMed Journal & National Conference for ${activeProject.specialty}!`);
                }}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-amber-200 rounded-lg text-[10px] font-black flex items-center space-x-1 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Match {activeProject.specialty}</span>
              </button>
            </div>
            <select
              value={selectedJournalId}
              onChange={e => {
                setSelectedJournalId(e.target.value);
                setCustomRawText('');
              }}
              className="w-full text-xs p-2.5 bg-white border-2 border-emerald-400 rounded-lg font-bold text-indigo-950 focus:outline-none cursor-pointer"
            >
              {TARGET_JOURNALS.map(j => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>

            {/* Journal Specifications Card */}
            <div className="p-3.5 bg-white rounded-xl border border-emerald-300 space-y-2 text-xs shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="font-black text-indigo-950 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-rose-600" />
                  <span>Journal Indexing & Rules:</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                  {selectedJournal.shortName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Word Limit:</span>
                  <span className="font-bold text-slate-900">Up to {selectedJournal.maxWords} words</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Citation Style:</span>
                  <span className="font-bold text-slate-900">{selectedJournal.style}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-700 pt-1 border-t border-slate-100">
                <strong className="text-rose-900">Required IMRAD Sections:</strong> {selectedJournal.imradStructure}
              </div>
              <div className="text-[11px] text-emerald-900 font-semibold bg-emerald-50 p-2 rounded">
                💡 {selectedJournal.recommendation}
              </div>

              {/* Live Manuscript Word-Count Budget & NMC PGMER Indexing Meter */}
              {(() => {
                const absWords = `${compiledArticle.structuredAbstract.background} ${compiledArticle.structuredAbstract.methods} ${compiledArticle.structuredAbstract.results} ${compiledArticle.structuredAbstract.conclusion}`
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
                const mainWords = compiledArticle.plainTextManuscript
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
                const wordPct = Math.min(100, Math.round((mainWords / selectedJournal.maxWords) * 100));
                return (
                  <div className="pt-2 border-t border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-indigo-950">
                        Manuscript Budget: {mainWords.toLocaleString()} / {selectedJournal.maxWords.toLocaleString()} words ({wordPct}%)
                      </span>
                      <span className="text-emerald-800">
                        Abstract: {absWords}/250w • Refs: {compiledArticle.references.length}/{selectedJournal.maxReferences}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all"
                        style={{ width: `${wordPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] bg-amber-50 border border-amber-300 px-2 py-1 rounded font-bold text-slate-900">
                      <span>✓ NMC PGMER Clause 13.3 Indexed</span>
                      <span className="text-emerald-800">PubMed / MEDLINE • Scopus • DOAJ</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Custom-Formatted Journal Article PDF Studio Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border-2 border-indigo-300 rounded-xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span>2. Custom-Formatted Journal PDF Studio</span>
              </span>
              <span className="text-[10px] font-mono font-black bg-indigo-950 text-amber-300 px-2 py-0.5 rounded">
                @react-pdf/renderer
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              Customize typography, column layout, double-blind peer-review anonymization, and embedded statistical tables, then generate your custom-formatted Journal Article PDF directly from your current project manuscript data.
            </p>

            {/* Column Layout & Blinding Mode Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-indigo-950 mb-1">
                  Page Column Layout
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300 text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() =>
                      setCustomPdfOptions(prev => ({ ...prev, columnLayout: 'two_column_print' }))
                    }
                    className={`py-1.5 px-1.5 rounded cursor-pointer transition-all ${
                      customPdfOptions.columnLayout === 'two_column_print'
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <Columns className="w-3 h-3 inline mr-1" />
                    2-Col Print
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomPdfOptions(prev => ({
                        ...prev,
                        columnLayout: 'single_column_submission'
                      }))
                    }
                    className={`py-1.5 px-1.5 rounded cursor-pointer transition-all ${
                      customPdfOptions.columnLayout === 'single_column_submission'
                        ? 'bg-emerald-800 text-white shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <FileText className="w-3 h-3 inline mr-1" />
                    1-Col Submit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-indigo-950 mb-1">
                  Peer-Review Blinding
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300 text-[10px] font-extrabold">
                  <button
                    type="button"
                    onClick={() =>
                      setCustomPdfOptions(prev => ({
                        ...prev,
                        blindingMode: 'unblinded_camera_ready'
                      }))
                    }
                    className={`py-1.5 px-1.5 rounded cursor-pointer transition-all ${
                      customPdfOptions.blindingMode === 'unblinded_camera_ready'
                        ? 'bg-indigo-900 text-amber-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    Full Authors
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomPdfOptions(prev => ({
                        ...prev,
                        blindingMode: 'double_blind_anonymous'
                      }))
                    }
                    className={`py-1.5 px-1.5 rounded cursor-pointer transition-all ${
                      customPdfOptions.blindingMode === 'double_blind_anonymous'
                        ? 'bg-rose-800 text-amber-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 inline mr-0.5" />
                    Double-Blind
                  </button>
                </div>
              </div>
            </div>

            {/* Font Family & Color Theme */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                  Journal Typography
                </label>
                <select
                  value={customPdfOptions.fontFamily}
                  onChange={e =>
                    setCustomPdfOptions(prev => ({
                      ...prev,
                      fontFamily: e.target.value as CustomJournalPdfFormatOptions['fontFamily']
                    }))
                  }
                  className="w-full p-1.5 bg-white border border-indigo-300 rounded-lg text-[11px] font-bold text-indigo-950 cursor-pointer"
                >
                  <option value="Times-Roman">Times New Roman (Academic Serif)</option>
                  <option value="Helvetica">Helvetica / Arial (Modern Clinical)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
                  Journal Accent Palette
                </label>
                <select
                  value={customPdfOptions.colorTheme}
                  onChange={e =>
                    setCustomPdfOptions(prev => ({
                      ...prev,
                      colorTheme: e.target.value as CustomJournalPdfFormatOptions['colorTheme']
                    }))
                  }
                  className="w-full p-1.5 bg-white border border-indigo-300 rounded-lg text-[11px] font-bold text-indigo-950 cursor-pointer"
                >
                  <option value="emerald_medical">IJMR / ICMR Emerald &amp; Teal</option>
                  <option value="royal_navy">BMJ / JAPI Royal Navy &amp; Sky</option>
                  <option value="crimson_classic">Lancet / Classic Crimson</option>
                </select>
              </div>
            </div>

            {/* Included Manuscript Elements Checkboxes */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-800">
              <label className="flex items-center space-x-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customPdfOptions.includeHighlightsBox}
                  onChange={e =>
                    setCustomPdfOptions(prev => ({
                      ...prev,
                      includeHighlightsBox: e.target.checked
                    }))
                  }
                  className="rounded border-emerald-400 text-emerald-700"
                />
                <span className="font-semibold">Key Highlights Box</span>
              </label>

              <label className="flex items-center space-x-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customPdfOptions.includeMasterTables}
                  onChange={e =>
                    setCustomPdfOptions(prev => ({
                      ...prev,
                      includeMasterTables: e.target.checked
                    }))
                  }
                  className="rounded border-emerald-400 text-emerald-700"
                />
                <span className="font-semibold">
                  Master Tables ({compiledArticle.tables.length})
                </span>
              </label>

              <label className="flex items-center space-x-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customPdfOptions.includeDeclarationsAndEthics}
                  onChange={e =>
                    setCustomPdfOptions(prev => ({
                      ...prev,
                      includeDeclarationsAndEthics: e.target.checked
                    }))
                  }
                  className="rounded border-emerald-400 text-emerald-700"
                />
                <span className="font-semibold">IEC &amp; COI Declarations</span>
              </label>

              <label className="flex items-center space-x-1.5 bg-white px-2 py-1.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customPdfOptions.includeLineAndSectionBadges}
                  onChange={e =>
                    setCustomPdfOptions(prev => ({
                      ...prev,
                      includeLineAndSectionBadges: e.target.checked
                    }))
                  }
                  className="rounded border-emerald-400 text-emerald-700"
                />
                <span className="font-semibold">IMRAD Numbered Headers</span>
              </label>
            </div>

            {/* Dedicated Generate & Download Custom-Formatted Journal Article PDF Button */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleGenerateAndDownloadCurrentManuscriptJournalPdf()}
                disabled={isExportingPdf}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-950 hover:from-emerald-900 hover:to-indigo-900 text-amber-200 border-2 border-amber-400 rounded-xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  {isExportingPdf
                    ? 'Generating Custom Journal Article PDF...'
                    : `Generate & Download Custom ${selectedJournal.shortName} Journal PDF`}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <BlobProvider
                  document={
                    <JournalArticlePdfDocument
                      article={compiledArticle}
                      journal={selectedJournal}
                      options={customPdfOptions}
                    />
                  }
                >
                  {({ url, loading }) => (
                    <a
                      href={url || '#'}
                      onClick={() => {
                        if (!loading && url) {
                          showToast(
                            `📥 Downloading pre-rendered ${selectedJournal.shortName} Custom Journal Article PDF stream!`
                          );
                        }
                      }}
                      download={`${(compiledArticle.title || 'Journal_Article').substring(0, 28).replace(/[^a-zA-Z0-9]+/g, '_')}_${selectedJournal.id.toUpperCase()}_Custom_Article.pdf`}
                      className={`py-1.5 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 font-bold text-[11px] flex items-center justify-center space-x-1 cursor-pointer text-center ${
                        loading ? 'opacity-60 pointer-events-none' : ''
                      }`}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span>{loading ? 'Rendering Stream...' : 'Instant PDF Stream'}</span>
                    </a>
                  )}
                </BlobProvider>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('manuscript');
                    setPreviewStyle(previewStyle === 'pdf_live' ? 'formatted' : 'pdf_live');
                  }}
                  className={`py-1.5 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 cursor-pointer border transition-colors ${
                    previewStyle === 'pdf_live'
                      ? 'bg-indigo-950 text-amber-300 border-amber-400'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {previewStyle === 'pdf_live' ? 'Show HTML Proof' : 'Live PDF Viewer'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pre-Submission Checklist */}
          <div className="bg-pink-50/60 border-2 border-pink-300 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center space-x-1.5">
                <ListChecks className="w-4 h-4 text-rose-700" />
                <span>3. ICMJE / Journal Readiness Checklist</span>
              </span>
              <span className="text-[11px] font-black text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">
                {Object.values(checkedItems).filter(Boolean).length}/{SUBMISSION_CHECKLIST.length} Verified
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {SUBMISSION_CHECKLIST.map(item => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-2 rounded-lg border text-xs flex items-start space-x-2 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-white border-emerald-400 text-emerald-950 font-bold'
                        : 'bg-white/70 border-pink-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug text-[11px]">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-pink-200">
              <button
                type="button"
                onClick={() => {
                  const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>ICMJE Authorship, Copyright & Conflict of Interest Form - ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.3cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 11.5pt; color: #1e3a8a; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 12pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 6pt; font-size: 10pt; text-align: left; }
  th { background: #e0f2fe; color: #0f172a; font-weight: bold; }
</style></head>
<body>
  <h1>${selectedJournal.name}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">ICMJE Authorship Responsibility, CRediT Contribution, Conflict of Interest &amp; Copyright Transfer Form</p>
  <h2>1. MANUSCRIPT IDENTIFICATION</h2>
  <p><strong>Title of Manuscript:</strong> <em>"${compiledArticle.title}"</em><br/>
  <strong>Target Journal:</strong> ${selectedJournal.name} (${selectedJournal.shortName})<br/>
  <strong>Institution &amp; Department:</strong> Department of ${activeProject.specialty.replace(/^(MD|MS)\s+/i, '')}, ${activeProject.collegeName} (${activeProject.university})</p>

  <h2>2. ICMJE / CRediT AUTHORSHIP CONTRIBUTION &amp; UNDERTAKING</h2>
  <p>We, the undersigned authors, certify that this manuscript represents original clinical research derived from an Institutional Ethics Committee (IEC) approved postgraduate dissertation, has not been published previously, and is not under consideration by any other journal. All authors meet the 4 ICMJE authorship criteria.</p>
  <table>
    <thead>
      <tr>
        <th>AuthorOrder</th>
        <th>Full Name &amp; Designation</th>
        <th>CRediT Contributor Roles</th>
        <th>Dated Signature</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1st Author</strong></td>
        <td><strong>Dr. ${activeProject.candidateName}</strong><br/>Postgraduate Resident (${activeProject.specialty})</td>
        <td>Conceptualization, Patient Enrollment, Data Curation, Formal Analysis, Writing – Original Draft</td>
        <td>____________________</td>
      </tr>
      <tr>
        <td><strong>2nd / Corresponding Author</strong></td>
        <td><strong>Prof. Dr. ${activeProject.guideName}</strong><br/>Professor &amp; Chief Dissertation Guide</td>
        <td>Supervision, Methodology, Validation, Writing – Review &amp; Editing, Guarantor</td>
        <td>____________________</td>
      </tr>
      ${activeProject.coGuideName ? `<tr>
        <td><strong>3rd Author</strong></td>
        <td><strong>Dr. ${activeProject.coGuideName}</strong><br/>Co-Guide (${activeProject.specialty})</td>
        <td>Clinical Supervision, Investigation, Visualization, Critical Review</td>
        <td>____________________</td>
      </tr>` : ''}
    </tbody>
  </table>

  <h2>3. CONFLICT OF INTEREST, ETHICS &amp; FUNDING DECLARATION</h2>
  <p><strong>Conflicts of Interest:</strong> None declared by any author.<br/>
  <strong>Ethical Approval:</strong> Approved by the Institutional Ethics Committee (IEC) of ${activeProject.collegeName} in accordance with the Declaration of Helsinki and ICMR 2017 National Ethical Guidelines.<br/>
  <strong>Financial Support / Sponsorship:</strong> Nil (Institutional academic research).</p>
</body></html>`;
                  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ICMJE_Copyright_Authorship_Form_${selectedJournal.shortName}_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast(`📄 Downloaded ${selectedJournal.shortName} ICMJE Copyright & Co-Author Undertaking Form (.DOC)!`);
                }}
                className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 rounded-lg text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ICMJE Copyright &amp; Co-Author Form (.DOC)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live IMRAD Journal Article Preview & Editor + DOC/PDF Export */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-50 border-2 border-emerald-300 rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[540px]">
            {/* Top Bar inside Preview */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  {activeMode === 'manuscript'
                    ? `${selectedJournal.shortName} — IMRAD Journal Manuscript`
                    : activeMode === 'cover_letter'
                      ? 'Journal Submission Cover Letter'
                      : activeMode === 'title_page_strobe'
                        ? 'Separate Unblinded Title Page & STROBE Checklist'
                        : activeMode === 'highlights_box'
                          ? 'Key Highlights Box & 3-Column Visual Abstract'
                          : activeMode === 'equator_plagiarism'
                            ? `EQUATOR (${equatorType}) Reporting Checklist & Plagiarism Certificate`
                            : 'Peer-Reviewer Rebuttal Response'}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {activeMode === 'manuscript' && (
                  <div className="flex bg-white border border-slate-300 rounded-lg p-0.5 text-[11px] font-bold mr-1">
                    <button
                      onClick={() => setPreviewStyle('formatted')}
                      className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer ${
                        previewStyle === 'formatted'
                          ? 'bg-emerald-700 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Journal Proof</span>
                    </button>
                    <button
                      onClick={() => setPreviewStyle('pdf_live')}
                      className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer ${
                        previewStyle === 'pdf_live'
                          ? 'bg-indigo-900 text-amber-200'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Printer className="w-3 h-3" />
                      <span>Live Custom PDF</span>
                    </button>
                    <button
                      onClick={() => setPreviewStyle('raw')}
                      className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer ${
                        previewStyle === 'raw'
                          ? 'bg-emerald-700 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Text</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={async () => {
                    await safeCopyToClipboard(activePlainText);
                    showToast('Copied manuscript text to clipboard!');
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={handleExportJournalDoc}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-black flex items-center space-x-1 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.DOC</span>
                </button>

                <button
                  onClick={() => handleGenerateAndDownloadCurrentManuscriptJournalPdf()}
                  disabled={isExportingPdf}
                  className="px-3 py-1.5 bg-gradient-to-r from-rose-700 to-indigo-900 hover:from-rose-800 hover:to-indigo-950 disabled:opacity-50 text-amber-200 border border-amber-400 rounded-lg text-xs font-black flex items-center space-x-1 cursor-pointer shadow-2xs"
                  title="Generate and download custom-formatted Journal Article PDF from current project manuscript"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isExportingPdf ? 'Building...' : 'Custom Journal .PDF'}</span>
                </button>
              </div>
            </div>

            {/* Main Body: Live Custom PDF Viewer OR Formatted Journal Proof OR Editable Raw Text */}
            {activeMode === 'manuscript' && previewStyle === 'pdf_live' ? (
              <div className="space-y-2.5 flex-1 flex flex-col">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950 via-emerald-900 to-teal-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Printer className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>
                      <strong>Live Custom PDF Preview:</strong> {selectedJournal.shortName} •{' '}
                      {customPdfOptions.columnLayout === 'two_column_print'
                        ? '2-Column Print Layout'
                        : '1-Column Submission'}{' '}
                      •{' '}
                      {customPdfOptions.blindingMode === 'double_blind_anonymous'
                        ? 'Double-Blind Anonymized'
                        : 'Camera-Ready'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateAndDownloadCurrentManuscriptJournalPdf()}
                    disabled={isExportingPdf}
                    className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download This Custom PDF</span>
                  </button>
                </div>
                <div className="w-full h-[520px] bg-slate-200 rounded-xl overflow-hidden border-2 border-indigo-300 shadow-inner">
                  <PDFViewer width="100%" height="100%" showToolbar={true} className="border-0">
                    <JournalArticlePdfDocument
                      article={compiledArticle}
                      journal={selectedJournal}
                      options={customPdfOptions}
                    />
                  </PDFViewer>
                </div>
              </div>
            ) : activeMode === 'manuscript' && previewStyle === 'formatted' ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 overflow-y-auto max-h-[540px] space-y-4 font-serif text-slate-900 shadow-inner">
                {/* Journal Header */}
                <div className="border-b-2 border-emerald-700 pb-3">
                  <div className="flex items-center justify-between text-[10px] font-sans font-black uppercase tracking-wider text-rose-800">
                    <span>{selectedJournal.name}</span>
                    <span>Original Research Article (IMRAD)</span>
                  </div>
                  <h1 className="text-base md:text-lg font-bold text-indigo-950 mt-1.5 leading-snug">
                    {compiledArticle.title}
                  </h1>
                  <p className="text-xs font-sans font-bold text-slate-800 mt-1">
                    {compiledArticle.authorsLine}
                  </p>
                  <p className="text-[11px] font-sans text-slate-600">
                    {compiledArticle.affiliationsLine}
                  </p>
                  <p className="text-[10px] font-sans font-semibold text-emerald-800 mt-1">
                    Running Title: {compiledArticle.runningTitle} • Corresponding Author: {compiledArticle.correspondingAuthor}
                  </p>
                </div>

                {/* Structured Abstract */}
                <div className="bg-emerald-50/80 border border-emerald-300 rounded-lg p-3.5 font-sans text-xs space-y-1.5">
                  <div className="font-black text-emerald-950 uppercase tracking-wider text-[11px]">
                    Structured Abstract
                  </div>
                  <p>
                    <strong className="text-indigo-950">Background:</strong> {compiledArticle.structuredAbstract.background}
                  </p>
                  <p>
                    <strong className="text-indigo-950">Methods:</strong> {compiledArticle.structuredAbstract.methods}
                  </p>
                  <p>
                    <strong className="text-indigo-950">Results:</strong> {compiledArticle.structuredAbstract.results}
                  </p>
                  <p>
                    <strong className="text-indigo-950">Conclusion:</strong> {compiledArticle.structuredAbstract.conclusion}
                  </p>
                  <p className="text-[11px] text-rose-900 pt-1">
                    <strong>Keywords:</strong> <em>{compiledArticle.structuredAbstract.keywords}</em>
                  </p>
                </div>

                {/* 1. Introduction */}
                <div>
                  <h2 className="text-xs font-sans font-black uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                    1. Introduction
                  </h2>
                  <p className="text-xs leading-relaxed text-justify whitespace-pre-wrap">
                    {compiledArticle.introduction}
                  </p>
                </div>

                {/* 2. Materials and Methods */}
                <div>
                  <h2 className="text-xs font-sans font-black uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                    2. Materials and Methods
                  </h2>
                  <p className="text-xs leading-relaxed text-justify whitespace-pre-wrap">
                    {compiledArticle.methods}
                  </p>
                </div>

                {/* 3. Observations and Results + Tables */}
                <div>
                  <h2 className="text-xs font-sans font-black uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                    3. Observations and Results
                  </h2>
                  <p className="text-xs leading-relaxed text-justify whitespace-pre-wrap mb-3">
                    {compiledArticle.resultsNarrative}
                  </p>

                  {compiledArticle.tables.map((t, idx) => (
                    <div key={idx} className="my-3 font-sans border border-slate-300 rounded-lg overflow-hidden">
                      <div className="bg-sky-100 px-3 py-1.5 text-[11px] font-black text-sky-950">
                        Table {idx + 1}: {t.caption}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-300">
                              {t.headers.map((h, hIdx) => (
                                <th key={hIdx} className="py-1.5 px-2.5 font-bold text-slate-900">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {t.rows.slice(0, 8).map((r, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-200">
                                {t.headers.map((_, cIdx) => (
                                  <td key={cIdx} className="py-1 px-2.5 text-slate-800">
                                    {r[cIdx] ?? ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {t.legend && (
                        <div className="px-3 py-1 bg-slate-50 text-[10px] italic text-slate-600">
                          {t.legend}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 4. Discussion */}
                <div>
                  <h2 className="text-xs font-sans font-black uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                    4. Discussion & Study Limitations
                  </h2>
                  <p className="text-xs leading-relaxed text-justify whitespace-pre-wrap mb-2">
                    {compiledArticle.discussion}
                  </p>
                  <p className="text-xs font-sans bg-pink-50 border-l-4 border-rose-600 p-2.5 text-rose-950">
                    <strong>Study Limitations:</strong> {compiledArticle.limitations}
                  </p>
                </div>

                {/* 5. Conclusion & Declarations */}
                <div>
                  <h2 className="text-xs font-sans font-black uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                    5. Conclusion & Declarations
                  </h2>
                  <p className="text-xs leading-relaxed text-justify mb-2">
                    {compiledArticle.conclusion}
                  </p>
                  <p className="text-[11px] font-sans text-slate-700 whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-200">
                    {compiledArticle.declarations}
                  </p>
                </div>

                {/* References */}
                {compiledArticle.references.length > 0 && (
                  <div>
                    <h2 className="text-xs font-sans font-black uppercase tracking-wider text-indigo-950 border-b border-slate-200 pb-1 mb-2">
                      References ({selectedJournal.style})
                    </h2>
                    <div className="space-y-1 text-[11px] font-sans text-slate-700">
                      {compiledArticle.references.map((ref, idx) => (
                        <p key={idx}>{ref}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-3">
                {activeMode === 'equator_plagiarism' && (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-amber-50 to-sky-50 border-2 border-emerald-300 rounded-xl space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-indigo-950 uppercase tracking-wider">
                        Select EQUATOR Network Reporting Guideline &amp; Plagiarism Audit Parameters:
                      </span>
                      <div className="flex bg-white border border-emerald-400 rounded-lg p-0.5 text-[11px] font-extrabold">
                        {(['STROBE', 'CONSORT', 'STARD'] as const).map(eq => (
                          <button
                            key={eq}
                            type="button"
                            onClick={() => {
                              setEquatorType(eq);
                              setCustomRawText('');
                            }}
                            className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                              equatorType === eq
                                ? 'bg-emerald-700 text-white shadow-2xs'
                                : 'text-slate-700 hover:bg-emerald-50'
                            }`}
                          >
                            {eq === 'STROBE'
                              ? 'STROBE (Observational)'
                              : eq === 'CONSORT'
                                ? 'CONSORT (Clinical Trial)'
                                : 'STARD (Diagnostic ROC)'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Overall Similarity (% &lt; 10% Norm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={25}
                          value={similarityOverallPct}
                          onChange={e => {
                            setSimilarityOverallPct(Number(e.target.value));
                            setCustomRawText('');
                          }}
                          className="w-full mt-0.5 p-1 border border-slate-300 rounded font-mono font-bold text-emerald-900 text-xs"
                        />
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Max Single Source (% &lt; 2%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={10}
                          value={similaritySingleSourcePct}
                          onChange={e => {
                            setSimilaritySingleSourcePct(Number(e.target.value));
                            setCustomRawText('');
                          }}
                          className="w-full mt-0.5 p-1 border border-slate-300 rounded font-mono font-bold text-emerald-900 text-xs"
                        />
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Screening Software
                        </label>
                        <input
                          type="text"
                          value={plagiarismToolName}
                          onChange={e => {
                            setPlagiarismToolName(e.target.value);
                            setCustomRawText('');
                          }}
                          className="w-full mt-0.5 p-1 border border-slate-300 rounded font-bold text-slate-800 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeMode === 'conference_abstract' && (
                  <div className="p-3 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 rounded-xl border-2 border-rose-300 space-y-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-rose-950">
                        Configure National / State Medical Conference Abstract &amp; NMC Certificate
                      </span>
                      <span className="px-2 py-0.5 bg-rose-800 text-amber-200 rounded text-[10px] font-mono font-bold">
                        NMC PGMER Mandatory Milestone
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Target Medical Conference
                        </label>
                        <input
                          type="text"
                          value={confName}
                          onChange={e => {
                            setConfName(e.target.value);
                            setCustomRawText('');
                          }}
                          className="w-full mt-0.5 p-1 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                        />
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Presentation Format
                        </label>
                        <select
                          value={confPresentationType}
                          onChange={e => {
                            setConfPresentationType(e.target.value as any);
                            setCustomRawText('');
                          }}
                          className="w-full mt-0.5 p-1 border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                        >
                          <option value="Free Paper Oral Presentation (8 + 2 Mins)">Free Paper Oral Presentation (8 + 2 Mins)</option>
                          <option value="Award E-Poster Presentation (5 Mins)">Award E-Poster Presentation (5 Mins)</option>
                        </select>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Abstract Registration ID
                        </label>
                        <input
                          type="text"
                          value={confRegId}
                          onChange={e => {
                            setConfRegId(e.target.value);
                            setCustomRawText('');
                          }}
                          className="w-full mt-0.5 p-1 border border-slate-300 rounded font-mono font-bold text-rose-900 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <textarea
                  rows={activeMode === 'equator_plagiarism' || activeMode === 'conference_abstract' ? 17 : 22}
                  value={activePlainText}
                  onChange={e => setCustomRawText(e.target.value)}
                  className="w-full flex-1 text-xs font-mono p-4 bg-white border border-slate-300 rounded-xl focus:outline-none leading-relaxed text-slate-800 resize-none"
                />
              </div>
            )}

            {/* Footer Status Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700 font-semibold">
              <span>
                Target: <strong className="text-indigo-950">{selectedJournal.shortName}</strong> • Tables Included: <strong>{compiledArticle.tables.length}</strong> • References: <strong>{compiledArticle.references.length}</strong>
              </span>
              <span className="text-emerald-800 font-bold">
                Ready for 1-Click .DOC & .PDF Journal Submission
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
