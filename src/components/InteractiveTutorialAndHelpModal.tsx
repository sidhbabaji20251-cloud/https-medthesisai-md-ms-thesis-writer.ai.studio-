import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  BookOpen,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
  Play,
  FileText,
  Download,
  Calculator,
  ClipboardCheck,
  Award,
  PenTool,
  ShieldAlert,
  FileCode,
  Presentation,
  Layout,
  Highlighter,
  Smartphone,
  GraduationCap,
  Users,
  Stethoscope,
  X,
  ChevronRight,
  Lightbulb,
  Wrench,
} from 'lucide-react';

export type HelpAppTab =
  | 'dashboard'
  | 'chapters'
  | 'protocol'
  | 'biostats'
  | 'prompt_suite'
  | 'pubmed'
  | 'plagiarism'
  | 'frontmatter'
  | 'publication_ai'
  | 'viva_prep'
  | 'export';

interface InteractiveTutorialAndHelpModalProps {
  isOpen: boolean;
  initialMode?: 'tour' | 'manual' | 'roles' | 'faq';
  onClose: () => void;
  onNavigateToTab: (tab: HelpAppTab, chapterId?: string) => void;
  onOpenDoctorModal: () => void;
  onOpenPdfModal: () => void;
  onOpenInstallShareModal: (tab: 'install' | 'share') => void;
  onTriggerMasterSynthesize: () => void;
  showToast: (msg: string) => void;
}

interface GuidedStep {
  stepNumber: number;
  phaseBadge: string;
  timelineBadge: string;
  title: string;
  subtitle: string;
  targetTab: HelpAppTab;
  targetTabLabel: string;
  whatYouDo: string[];
  expectedOutcome: string;
  nmcComplianceTip: string;
}

const GUIDED_TOUR_STEPS: GuidedStep[] = [
  {
    stepNumber: 1,
    phaseBadge: 'Phase I • Study Setup & NMC Synopsis',
    timelineBadge: 'Months 1–3 (JR-1)',
    title: 'Initialize Your MD/MS Topic, University & NMC Protocol Synopsis',
    subtitle:
      'Set up your specialty, state health university norms, PICO/FINER research question, sample size formula, and STROBE/CONSORT checklist.',
    targetTab: 'protocol',
    targetTabLabel: 'Open NMC Synopsis & Protocol Builder',
    whatYouDo: [
      'Go to "1. Command Hub & Setup" to enter your Dissertation Title, Specialty (30+ NMC MD/MS branches), Candidate/Guide names, and Health University (MUHS, RGUHS, AIIMS, KGMU, NTRUHS, etc.).',
      'Or click the "⚡ 1-Click Synthesize Entire App" button on the top banner to automatically populate all chapters, protocol fields, citations, and biostatistics for your topic.',
      'Open "2. Synopsis, STROBE & Gantt" to verify your PICO framework, Sample Size formula (Cochran / Kelsey / Charan & Biswas), CTRI clinical trial registration draft, and 24-month Gantt chart.',
    ],
    expectedOutcome:
      'A complete, Institutional Ethics Committee (IEC) and University Synopsis ready to export as an official Word (.doc) or PDF protocol.',
    nmcComplianceTip:
      'NMC PG Board requires prospective CTRI registration and explicit sample size calculation with α = 0.05 and power (1−β) = 80% before patient recruitment.',
  },
  {
    stepNumber: 2,
    phaseBadge: 'Phase I • Statutory Certificates & Ethics',
    timelineBadge: 'Months 3–6 (JR-1)',
    title: 'Generate Statutory University Certificates & 8-Language Patient Consent (ICF)',
    subtitle:
      'Create official Title Page, Guide/HOD/Dean Certificates, Case Record Proforma (CRF), and ICMR Informed Consent in 8 Indian languages.',
    targetTab: 'frontmatter',
    targetTabLabel: 'Open Certificates & 8-Language ICF',
    whatYouDo: [
      'Open "3. Certificates & 8-Lang ICF" in the left sidebar.',
      'Upload your Medical College Emblem/Logo (or use the built-in academic crest) and review your auto-filled Declaration by Candidate, Guide Certificate, and HOD/Dean Endorsement.',
      'Switch to the "8-Language Informed Consent (ICF)" & "Case Record Proforma" sub-tabs to generate patient information sheets in English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, or Gujarati.',
    ],
    expectedOutcome:
      'Ready-to-sign statutory Front Matter (Roman-numeral preliminary pages i–xii) and vernacular patient consent forms for IEC submission.',
    nmcComplianceTip:
      'ICMR National Ethical Guidelines (2017) mandate that Participant Information Sheets (PIS) and Informed Consent Forms (ICF) be provided in the local vernacular language understood by the patient.',
  },
  {
    stepNumber: 3,
    phaseBadge: 'Phase II • Live Medical Literature Search',
    timelineBadge: 'Months 6–14 (JR-1 / JR-2)',
    title: 'Search 6 Live Medical Databases & Build Vancouver [1]–[N] Bibliography',
    subtitle:
      'Query PubMed, MEDLINE, Europe PMC, Crossref DOI, ClinicalTrials.gov, and ICMR/Indian Journals in real time.',
    targetTab: 'pubmed',
    targetTabLabel: 'Open PubMed / MEDLINE Search Engine',
    whatYouDo: [
      'Navigate to "4. PubMed / MEDLINE Search" and type your clinical topic or MeSH keywords.',
      'Select "All 6 Engines (Federated)" or filter specifically by PubMed, MEDLINE Core, ICMR/Indian Journals (IJMR, JAPI, NMJI), Europe PMC, Crossref DOI, or ClinicalTrials.gov.',
      'Click "+ Cite in Thesis" on any peer-reviewed article to append it to your dissertation bibliography, then click "Sync [1]–[N] Refs" to format all references in strict ICMJE Vancouver style.',
    ],
    expectedOutcome:
      '30–45+ verified, real PMID/DOI clinical citations automatically numbered [1] to [N] and linked into your Review of Literature and Discussion chapters.',
    nmcComplianceTip:
      'Indian University examiners strongly value a balanced Review of Literature that includes both global landmark trials and at least 25–30% Indian tertiary-care studies (ICMR, AIIMS, IJMR).',
  },
  {
    stepNumber: 4,
    phaseBadge: 'Phase II • Manuscript Drafting & AI Co-Pilot',
    timelineBadge: 'Months 10–18 (JR-2)',
    title: 'Draft & Expand All 6 Dissertation Chapters + Run the AI Prompt Suite',
    subtitle:
      'Write Introduction, Review of Literature, Aim & Objectives, Material & Methods, Observations & Results, and Discussion.',
    targetTab: 'chapters',
    targetTabLabel: 'Open 6-Chapter Thesis Editor',
    whatYouDo: [
      'Open "5. 6-Chapter Thesis Editor" and select any chapter from the left Dissertation Outline.',
      'Use the Chapter Toolbar to auto-generate or expand sections with AI, insert clinical observation tables, generate ICMJE Table Captions & Footnote Legends, or refine prose for human academic flow.',
      'Visit "6. AI Writer & Prompt Suite" for 10 specialized medical prompts (Introduction Gap Builder, Past-Tense Methodology Writer, Stats-to-Prose Translator, ROC Curve Interpreter, and Peer-Review Auditor).',
    ],
    expectedOutcome:
      'Comprehensive, publication-grade chapters with formal Markdown tables, LaTeX statistical formulas, and synchronized Vancouver citation brackets.',
    nmcComplianceTip:
      'Always write Materials & Methods in past tense passive voice ("Consecutive consenting patients were enrolled...") and keep Results strictly objective without editorializing.',
  },
  {
    stepNumber: 5,
    phaseBadge: 'Phase III • Biostatistics & Academic Integrity',
    timelineBadge: 'Months 18–22 (JR-2 / JR-3)',
    title: 'Analyze Patient Master Chart (SPSS/R/ROC) & Pass <10% Plagiarism / AI Audit',
    subtitle:
      'Compute p-values, t-tests, Chi-Square, Odds Ratios, and ROC curves, then verify originality and human authorship.',
    targetTab: 'biostats',
    targetTabLabel: 'Open Biostats & Master Chart Engine',
    whatYouDo: [
      'Go to "7. Biostats & Master Chart" to generate a realistic clinical cohort (N=60, 100, or 120) or import your own Excel/CSV patient data.',
      'Review auto-calculated Mean ± SD, Student’s t-test, Mann-Whitney U, Chi-Square (χ²), Odds Ratio (95% CI), Pearson correlation, and ROC Curve (AUC & Youden’s Index), and click "Insert Results into Chapter 5".',
      'Open "8. Plagiarism & AI Checker" to scan your chapters or Drag & Drop a PDF/DOCX file. Use the 1-Click Humanizer to ensure <10% Turnitin similarity and <15% AI probability.',
    ],
    expectedOutcome:
      'Complete statistical tables, high-resolution clinical charts, downloadable SPSS (.sps) & R (analysis.R) scripts, and a clean Plagiarism & AI Clearance Certificate.',
    nmcComplianceTip:
      'UGC and Indian Health Universities mandate <10% overall text similarity (excluding bibliography and standard methodology definitions) prior to final synopsis/thesis binding.',
  },
  {
    stepNumber: 6,
    phaseBadge: 'Phase IV • Publication, Defense & Final Export',
    timelineBadge: 'Months 22–24 (JR-3)',
    title: 'Convert to Journal Manuscript, Viva Defense PPT / E-Poster & Bound Export',
    subtitle:
      'Generate your mandatory NMC journal article, 12-slide defense deck, A0 conference poster, and University-formatted Word/PDF/LaTeX thesis.',
    targetTab: 'export',
    targetTabLabel: 'Open Master Export Hub',
    whatYouDo: [
      'Open "9. Thesis to Journal (IMRAD)" to condense your 6-chapter dissertation into a 3,200-word peer-reviewed journal paper (IJMR, JAPI, NEJM, or Lancet style) with Cover Letter & Title Page.',
      'Open "10. PPT, E-Poster & Viva" to download your 12-slide PowerPoint defense presentation, A0 Conference E-Poster, and 20 Mock External Examiner Q&As.',
      'Open "11. Master Export Hub" (or click "Auto-Diagnostic Doctor" in the top bar first) to export your complete bound MS Word (.doc), Print-Ready PDF, or Overleaf LaTeX (.tex) package.',
    ],
    expectedOutcome:
      '100% submission-ready MD/MS Dissertation package, journal manuscript, viva slide deck, and cross-device backup.',
    nmcComplianceTip:
      'Under NMC Postgraduate Medical Education Regulations, every MD/MS resident must present a poster/paper at a state/national conference and submit/publish a research paper from their thesis.',
  },
];

interface ModuleManualItem {
  id: string;
  numberBadge: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'Top Bar Tool';
  title: string;
  summary: string;
  targetTab?: HelpAppTab;
  specialAction?: 'doctor' | 'pdf_notes' | 'install_share' | 'master_synth';
  steps: string[];
  keyOutputs: string[];
}

const MODULE_MANUAL_ITEMS: ModuleManualItem[] = [
  {
    id: 'm_dashboard',
    numberBadge: 'Module 1',
    phase: 'Phase I',
    title: 'Command Hub & Study Setup',
    summary:
      'Central cockpit to create a new thesis project, select your medical specialty & university, track completion milestones, and run 1-click full-app synthesis.',
    targetTab: 'dashboard',
    steps: [
      'Enter your Dissertation Title, Specialty (e.g., MD General Medicine, MS General Surgery, MD Pediatrics), and Affiliated University.',
      'Fill in Candidate Name, Academic Year, Guide Name, and Co-Guide Name so all certificates and cover pages update automatically.',
      'Click "Create & Generate AI Literature Outline" or use "⚡ 1-Click Synthesize Entire App" in the top banner.',
    ],
    keyOutputs: ['Multi-Project Workspace', 'University & Specialty Configuration', 'Real-Time Progress Metrics'],
  },
  {
    id: 'm_protocol',
    numberBadge: 'Module 2',
    phase: 'Phase I',
    title: 'NMC Synopsis, STROBE/CONSORT, Sample Size & Gantt Builder',
    summary:
      'Complete Institutional Ethics Committee (IEC) synopsis generator with interactive sample size calculator, CTRI trial registry sheet, and 24-month Gantt timeline.',
    targetTab: 'protocol',
    steps: [
      'Verify PICO (Population, Intervention/Exposure, Comparator, Outcome) and FINER research criteria.',
      'Select your study design (Cross-Sectional, Cohort, Case-Control, or RCT) and calculate exact sample size with 10% attrition adjustment.',
      'Complete the STROBE / CONSORT reporting checklist and export the standalone NMC Synopsis as Word (.doc) or PDF.',
    ],
    keyOutputs: ['NMC Synopsis (.doc / PDF)', 'Sample Size Formula Derivation', 'CTRI Dataset & 24-Month Gantt Chart'],
  },
  {
    id: 'm_frontmatter',
    numberBadge: 'Module 3',
    phase: 'Phase I',
    title: 'Statutory Certificates, Case Proforma & 8-Language Informed Consent (ICF)',
    summary:
      'Generates university-compliant preliminary pages (Roman numerals i–xii), patient Case Record Form (CRF), and ICMR consent forms in 8 Indian languages.',
    targetTab: 'frontmatter',
    steps: [
      'Upload your institution’s emblem or use the built-in medical crest.',
      'Generate Official Title Page, Candidate Declaration, Guide/HOD Certificate, IEC Approval Certificate, and Acknowledgements.',
      'Select any of the 8 Indian languages (English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati) to print or export the Patient Consent Form.',
    ],
    keyOutputs: ['Roman-Numeral Preliminary Pages', '8-Language ICMR Patient Consent Forms', 'Clinical Case Record Proforma (CRF)'],
  },
  {
    id: 'm_pubmed',
    numberBadge: 'Module 4',
    phase: 'Phase II',
    title: '6-Engine Live Medical Literature Search (PubMed / MEDLINE / ICMR)',
    summary:
      'Federated real-time search across PubMed, MEDLINE Core, ICMR/Indian Journals, Europe PMC, Crossref DOI, and ClinicalTrials.gov with 1-click Vancouver citation import.',
    targetTab: 'pubmed',
    steps: [
      'Enter clinical keywords and choose your search engine filter, study type (RCT, Systematic Review, Observational), and publication year range.',
      'Click "+ Cite in Thesis" on relevant articles to add them directly to your active dissertation’s bibliography.',
      'Use "Load 5 Specialty Landmark Citations" or "Sync [1]–[N] Refs" to format and cross-link all references in ICMJE Vancouver style.',
    ],
    keyOutputs: ['Verified PMID & DOI Citations', 'ICMJE Vancouver Bibliography', 'BibTeX (.bib) & RIS Export'],
  },
  {
    id: 'm_chapters',
    numberBadge: 'Module 5',
    phase: 'Phase II',
    title: '6-Chapter Thesis Editor & Scientific Table Legend Studio',
    summary:
      'Dedicated academic editor for Chapters 1–6 with AI chapter drafting, human-tone refinement, statistical table insertion, and ICMJE caption/legend generator.',
    targetTab: 'chapters',
    steps: [
      'Switch between Chapter 1 (Introduction) through Chapter 6 (Discussion & Conclusion) using the left sidebar outline.',
      'Click "AI Draft / Expand Full Chapter" to generate rich, citation-backed clinical text tailored to your study.',
      'In Chapter 5 (Observations & Results), use the Scientific Table Caption & Footnote Legend Generator to format tables to NEJM / Lancet / IJMR standards.',
    ],
    keyOutputs: ['6 Complete Dissertation Chapters', 'ICMJE Table Captions & Footnotes', 'Humanized Clinical Prose'],
  },
  {
    id: 'm_prompt_suite',
    numberBadge: 'Module 6',
    phase: 'Phase II',
    title: 'AI Clinical Writer & Examiner Peer-Review Prompt Suite',
    summary:
      '10 specialized clinical prompts divided into AI Thesis Writers (Introduction Gap, Past-Tense Methods, Stats-to-Prose, ROC Interpreter) and Examiner Checkers.',
    targetTab: 'prompt_suite',
    steps: [
      'Choose between "Writer Prompts" (to draft new clinical sections) and "Checker & Auditor Prompts" (to critique existing drafts).',
      'Review or customize the pre-filled clinical parameters from your active study and click "Execute Clinical Prompt".',
      'Insert the generated output directly into the target chapter with one click.',
    ],
    keyOutputs: ['Research Gap Narratives', 'Stats-to-Prose Translations', 'Examiner Confounder & Bias Audits'],
  },
  {
    id: 'm_biostats',
    numberBadge: 'Module 7',
    phase: 'Phase III',
    title: 'Biostatistical Master Chart Engine, ROC Curve & SPSS/R Generator',
    summary:
      'Interactive patient-level Master Chart spreadsheet with automated parametric/non-parametric tests, Odds Ratio, ROC curve diagnostics, and SPSS/R code export.',
    targetTab: 'biostats',
    steps: [
      'Click "Generate Realistic Patient Master Chart" (or upload your CSV/Excel dataset) to populate patient rows.',
      'Inspect automated descriptive stats (Mean ± SD, Median/IQR), hypothesis tests (t-test, Chi-Square χ², ANOVA), Odds Ratios, and ROC Curve AUC.',
      'Click "Insert Complete Statistical Tables & Narrative into Chapter 5" and download `.csv`, SPSS `.sps`, or R `analysis.R` files.',
    ],
    keyOutputs: ['Patient Master Chart (.csv)', 'Automated p-values, OR & ROC AUC', 'SPSS (.sps) & R Script Exports'],
  },
  {
    id: 'm_plagiarism',
    numberBadge: 'Module 8',
    phase: 'Phase III',
    title: 'Plagiarism Guard & Turnitin-Style AI-Authorship Detector',
    summary:
      'Dual academic integrity scanner supporting both active thesis chapters and Drag & Drop PDF/DOCX/TXT files, paired with a 1-click Clinical Humanizer.',
    targetTab: 'plagiarism',
    steps: [
      'Select an active chapter or drag-and-drop an external Thesis PDF / Word document into the dropzone.',
      'Run the "Plagiarism Similarity Check" (target <10% NMC norm) and "AI-Authorship Perplexity & Burstiness Audit" (target <15% AI score).',
      'If any robotic or high-similarity sentences are flagged, click "1-Click Humanize & Replace in Chapter" to rewrite them in natural clinical prose.',
    ],
    keyOutputs: ['<10% Similarity Verification', 'Sentence-Level AI Burstiness Report', '1-Click Clinical Humanizer'],
  },
  {
    id: 'm_publication',
    numberBadge: 'Module 9',
    phase: 'Phase IV',
    title: 'Thesis-to-Journal (IMRAD) Manuscript & Cover Letter Converter',
    summary:
      'Transforms your 6-chapter dissertation into a concise 3,000–3,500 word peer-reviewed journal article formatted for IJMR, JAPI, NMJI, Lancet, or NEJM.',
    targetTab: 'publication_ai',
    steps: [
      'Select your target medical journal template (e.g., Indian Journal of Medical Research, JAPI, Cureus, or The Lancet).',
      'Click "Synthesize Complete IMRAD Manuscript" to generate the Structured Abstract, Introduction, Methods, Results, Discussion, and Editor Cover Letter.',
      'Download the ready-to-submit Journal Manuscript as MS Word (.doc) or Print PDF.',
    ],
    keyOutputs: ['3,500-Word IMRAD Journal Article', 'Structured 250-Word Abstract', 'Editor-in-Chief Submission Cover Letter'],
  },
  {
    id: 'm_viva',
    numberBadge: 'Module 10',
    phase: 'Phase IV',
    title: 'Defense PPT Generator, A0 Conference E-Poster & Viva Simulator',
    summary:
      'Builds your 12-slide Final University Viva-Voce presentation, printable A0 Landscape Conference E-Poster, and 20 External Examiner defense Q&As.',
    targetTab: 'viva_prep',
    steps: [
      'Review the auto-generated 12-Slide Defense Deck covering Title, Gap, Objectives, Methodology, Master Chart Results, Discussion, and Conclusions.',
      'Switch to the "A0 Conference E-Poster" view to customize and export your medical conference poster.',
      'Practice with the "External Examiner Viva Q&A Simulator" and download your PPTX / HTML Presentation Deck.',
    ],
    keyOutputs: ['12-Slide Viva Presentation Deck', 'A0 Landscape Conference E-Poster', '20 External Examiner Defense Q&As'],
  },
  {
    id: 'm_export',
    numberBadge: 'Module 11',
    phase: 'Phase IV',
    title: 'Master Export Hub (University Word .DOC, Print PDF & Overleaf LaTeX)',
    summary:
      'Single-click compilation of the entire dissertation strictly adhering to Indian Health University margin, font (Times New Roman 12pt), and pagination rules.',
    targetTab: 'export',
    steps: [
      'Choose your University Formatting Preset (MUHS Nashik, RGUHS Bengaluru, AIIMS New Delhi, KGMU Lucknow, NTRUHS, MGR Medical University, etc.).',
      'Verify that Roman-numeral front matter (i–xii) and Arabic Page 1 starting at Chapter 1 (Introduction) are enabled.',
      'Click "Download Bound MS Word (.doc)", "Open Print-Ready PDF", or "Download Overleaf LaTeX (.tex + references.bib)".',
    ],
    keyOutputs: ['Bound MS Word (.doc) Thesis', 'University Print-Ready PDF', 'Overleaf LaTeX (.tex) + BibTeX Package'],
  },
  {
    id: 'm_doctor',
    numberBadge: 'Power Tool A',
    phase: 'Top Bar Tool',
    title: 'Auto-Diagnostic & Self-Healing Thesis Doctor',
    summary:
      '10-point automated quality & compliance scanner that detects missing citations, word-count shortfalls, or unlinked tables and fixes them in 1 click.',
    specialAction: 'doctor',
    steps: [
      'Click the "Auto-Diagnostic Doctor" button in the top header at any time.',
      'Review the 10-point diagnostic score across Synopsis, Ethics/ICF, Citations, Chapter Word Counts, Biostatistics, and Plagiarism readiness.',
      'Click "⚡ 1-Click Auto-Heal All Issues" to automatically repair and complete any missing dissertation elements.',
    ],
    keyOutputs: ['10-Point Health Score (%)', '1-Click Self-Healing Repair', 'Submission Readiness Verification'],
  },
  {
    id: 'm_pdf_notes',
    numberBadge: 'Power Tool B',
    phase: 'Top Bar Tool',
    title: 'PDF Preview, Highlighter & Draggable Guide Sticky Notes',
    summary:
      'Interactive collaboration studio where Thesis Guides and Co-Guides can highlight text, place draggable sticky notes on any page, and export annotated PDFs.',
    specialAction: 'pdf_notes',
    steps: [
      'Click "PDF & Guide Sticky Notes" in the top header.',
      'Select text to highlight in Yellow, Green, Pink, or Blue, or click "Add Sticky Note on Page" to pin supervisor feedback directly onto the manuscript.',
      'Drag sticky notes anywhere on the page, add resident replies, mark corrections as resolved, or print the annotated review sheet.',
    ],
    keyOutputs: ['Draggable On-Page Sticky Notes', '4-Color Text Highlighting', 'Guide-Resident Review Log'],
  },
  {
    id: 'm_install_share',
    numberBadge: 'Power Tool C',
    phase: 'Top Bar Tool',
    title: 'Mobile/Desktop PWA App Installer & 6-Digit Cross-Device Sync',
    summary:
      'Install YADAV MD/MS Thesis Studio as a standalone offline app on Android, iOS, Windows, or Mac, and transfer active theses via 6-digit Sync Code or QR.',
    specialAction: 'install_share',
    steps: [
      'Click "Install App" or "Share & Mobile Sync" in the top header.',
      'Install 1-click on Android/Desktop or use the guided Safari "Add to Home Screen" flow on iPhone/iPad.',
      'Generate a 6-digit Cloud Sync Code (e.g., THS-8F4K2A), scan the QR code with your phone camera, or export/import a portable `.json` backup.',
    ],
    keyOutputs: ['Standalone Mobile/Desktop App', '6-Digit Cloud Sync Code & QR', 'Offline .JSON Backup & Restore'],
  },
];

export const TutorialHeaderButton: React.FC<{
  onOpenHelp: (mode?: 'tour' | 'manual' | 'roles' | 'faq') => void;
}> = ({ onOpenHelp }) => {
  return (
    <button
      type="button"
      onClick={() => onOpenHelp('tour')}
      className="bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-indigo-950 text-xs font-black px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
      title="Open Interactive Step-by-Step Tutorial, User Manual & Web Help Center"
    >
      <HelpCircle className="w-4 h-4 text-indigo-950" />
      <span>Tutorial &amp; Web Help</span>
    </button>
  );
};

export const InteractiveTutorialAndHelpModal: React.FC<InteractiveTutorialAndHelpModalProps> = ({
  isOpen,
  initialMode = 'tour',
  onClose,
  onNavigateToTab,
  onOpenDoctorModal,
  onOpenPdfModal,
  onOpenInstallShareModal,
  onTriggerMasterSynthesize,
  showToast,
}) => {
  const [activeMode, setActiveMode] = useState<'tour' | 'manual' | 'roles' | 'faq'>(initialMode);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');

  React.useEffect(() => {
    if (isOpen) {
      setActiveMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const filteredModules = useMemo(() => {
    return MODULE_MANUAL_ITEMS.filter((item) => {
      const matchesPhase = phaseFilter === 'ALL' || item.phase === phaseFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesPhase;
      return (
        matchesPhase &&
        (item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.steps.some((s) => s.toLowerCase().includes(q)) ||
          item.keyOutputs.some((k) => k.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, phaseFilter]);

  if (!isOpen) return null;

  const activeStep = GUIDED_TOUR_STEPS[currentStepIdx] || GUIDED_TOUR_STEPS[0];

  const handleDownloadUserManualHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>YADAV MD/MS Thesis Studio — Complete Operational Manual & Tutorial</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; max-width: 900px; margin: 32px auto; padding: 0 24px; color: #0f172a; line-height: 1.6; }
    h1 { color: #064e3b; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
    h2 { color: #1e1b4b; margin-top: 28px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
    h3 { color: #047857; margin-bottom: 4px; }
    .badge { display: inline-block; background: #065f46; color: #fef3c7; font-family: monospace; font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
    .card { border: 1px solid #94a3b8; border-radius: 8px; padding: 14px 18px; margin-bottom: 14px; background: #f8fafc; }
    ul { margin-top: 6px; }
    .tip { background: #fef3c7; border-left: 4px solid #d97706; padding: 8px 12px; font-size: 13px; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>YADAV MD/MS Thesis Studio : Official Operational Manual &amp; Step-by-Step Guide</h1>
  <p><strong>AI Assisted Open-Access MD/MS Thesis &amp; Clinical Research Co-Pilot for Indian Medical Colleges (NMC PG Board Compliant)</strong></p>

  <h2>Part 1: 6-Step End-to-End Dissertation Lifecycle Walkthrough</h2>
  ${GUIDED_TOUR_STEPS.map(
    (s) => `
    <div class="card">
      <span class="badge">Step ${s.stepNumber} • ${s.phaseBadge} (${s.timelineBadge})</span>
      <h3>${s.title}</h3>
      <p><em>${s.subtitle}</em></p>
      <ol>
        ${s.whatYouDo.map((w) => `<li>${w}</li>`).join('')}
      </ol>
      <p><strong>Expected Deliverable:</strong> ${s.expectedOutcome}</p>
      <div class="tip"><strong>NMC / University Tip:</strong> ${s.nmcComplianceTip}</div>
    </div>`
  ).join('')}

  <h2>Part 2: Module-by-Module Operational Reference (All 11 Modules + Power Tools)</h2>
  ${MODULE_MANUAL_ITEMS.map(
    (m) => `
    <div class="card">
      <span class="badge">${m.numberBadge} • ${m.phase}</span>
      <h3>${m.title}</h3>
      <p>${m.summary}</p>
      <ul>
        ${m.steps.map((st) => `<li>${st}</li>`).join('')}
      </ul>
      <p><strong>Key Outputs:</strong> ${m.keyOutputs.join(' • ')}</p>
    </div>`
  ).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'YADAV_MD_MS_Thesis_Studio_User_Manual.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast('✅ Downloaded Complete Printable User Manual & SOP (.html)!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl bg-gradient-to-br from-sky-50 via-white to-amber-50 border-2 border-emerald-500 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-emerald-900 to-teal-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-serif font-extrabold text-amber-200">
                  Interactive Tutorial, Operational Guide &amp; Web Help Center
                </h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-700 text-white px-2.5 py-0.5 rounded-full border border-emerald-400 font-bold">
                  Step-by-Step SOP • All 11 Modules
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Learn how to operate YADAV MD/MS Thesis Studio from Topic Selection &amp; NMC Synopsis to Biostats, Plagiarism Check &amp; Bound University Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadUserManualHtml}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-xs cursor-pointer transition shadow-2xs"
              title="Download Printable User Manual & Standard Operating Procedure (SOP)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Manual</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close Help Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Mode Bar */}
        <div className="bg-emerald-100/90 border-b border-emerald-300 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveMode('tour')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeMode === 'tour'
                  ? 'bg-indigo-950 text-amber-200 shadow-xs border border-indigo-950'
                  : 'bg-white text-slate-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>1. 6-Step Guided Tour</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('manual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeMode === 'manual'
                  ? 'bg-emerald-800 text-amber-200 shadow-xs border border-emerald-950'
                  : 'bg-white text-slate-800 hover:bg-emerald-50 border border-emerald-300'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>2. All 11 Modules &amp; Tools Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('roles')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeMode === 'roles'
                  ? 'bg-rose-800 text-amber-200 shadow-xs border border-rose-950'
                  : 'bg-white text-slate-800 hover:bg-rose-50 border border-rose-300'
              }`}
            >
              <Users className="w-4 h-4 text-rose-600" />
              <span>3. Quick-Start by Resident Year / Faculty</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('faq')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition cursor-pointer ${
                activeMode === 'faq'
                  ? 'bg-sky-900 text-amber-200 shadow-xs border border-sky-950'
                  : 'bg-white text-slate-800 hover:bg-sky-50 border border-sky-300'
              }`}
            >
              <Wrench className="w-4 h-4 text-sky-600" />
              <span>4. FAQ &amp; Troubleshooting</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onTriggerMasterSynthesize();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-rose-700 hover:from-emerald-800 hover:to-rose-800 text-white text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-2xs border border-amber-300"
            title="Automatically synthesize all chapters, citations, protocol & biostatistics in 1 click"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>⚡ 1-Click Auto-Demo Entire App</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ==========================================================
              MODE 1: INTERACTIVE 6-STEP GUIDED WALKTHROUGH
             ========================================================== */}
          {activeMode === 'tour' && (
            <div className="space-y-5">
              {/* Step Progress Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {GUIDED_TOUR_STEPS.map((st, idx) => {
                  const isCurrent = idx === currentStepIdx;
                  const isCompleted = idx < currentStepIdx;
                  return (
                    <button
                      key={st.stepNumber}
                      type="button"
                      onClick={() => setCurrentStepIdx(idx)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-indigo-950 text-amber-200 border-2 border-amber-400 shadow-md'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400 hover:bg-emerald-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase">
                        <span>Step {st.stepNumber}</span>
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <div className="text-xs font-extrabold truncate mt-1">
                        {st.title.split('&')[0]}
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5">{st.timelineBadge}</div>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Card */}
              <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[11px] font-black uppercase">
                        Step {activeStep.stepNumber} of {GUIDED_TOUR_STEPS.length}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-200 text-[11px] font-mono font-bold border border-emerald-400/40">
                        {activeStep.phaseBadge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-amber-200 text-[11px] font-bold">
                        Timeline: {activeStep.timelineBadge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-xl font-serif font-extrabold text-amber-200 mt-2">
                      {activeStep.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                      {activeStep.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab(activeStep.targetTab);
                      onClose();
                      showToast(`📍 Opened ${activeStep.targetTabLabel}`);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 shrink-0 cursor-pointer shadow-md transition"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{activeStep.targetTabLabel}</span>
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 mb-2.5">
                      How to Operate This Step (1 → 2 → 3):
                    </h4>
                    <div className="space-y-2.5">
                      {activeStep.whatYouDo.map((instruction, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-sky-50/90 border border-sky-200 flex items-start space-x-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-indigo-900 text-amber-200 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                            {instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                      <div className="text-[11px] font-black uppercase text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Expected Output / Deliverable</span>
                      </div>
                      <p className="text-xs text-emerald-950 mt-1 font-medium leading-relaxed">
                        {activeStep.expectedOutcome}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300">
                      <div className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-700" />
                        <span>NMC PG Board &amp; Examiner Tip</span>
                      </div>
                      <p className="text-xs text-amber-950 mt-1 font-medium leading-relaxed">
                        {activeStep.nmcComplianceTip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step Footer Navigation */}
                <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentStepIdx === 0}
                    onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>

                  <div className="text-xs font-bold text-slate-600">
                    Step {currentStepIdx + 1} of {GUIDED_TOUR_STEPS.length}
                  </div>

                  {currentStepIdx < GUIDED_TOUR_STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStepIdx((prev) => Math.min(GUIDED_TOUR_STEPS.length - 1, prev + 1))
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-200 font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveMode('manual')}
                      className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-amber-200 font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Explore All 11 Modules Directory</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              MODE 2: MODULE-BY-MODULE OPERATIONAL DIRECTORY
             ========================================================== */}
          {activeMode === 'manual' && (
            <div className="space-y-4">
              {/* Search & Phase Filter Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-emerald-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any operation (e.g., Sample Size, SPSS, Consent, Plagiarism, Vancouver, Word Export)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {['ALL', 'Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Top Bar Tool'].map(
                    (phase) => (
                      <button
                        key={phase}
                        type="button"
                        onClick={() => setPhaseFilter(phase)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer transition ${
                          phaseFilter === phase
                            ? 'bg-emerald-800 text-amber-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                        }`}
                      >
                        {phase}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 p-4 flex flex-col justify-between gap-3 shadow-2xs transition"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 text-amber-200 font-mono text-[10px] font-black uppercase">
                          {mod.numberBadge} • {mod.phase}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (mod.targetTab) {
                              onNavigateToTab(mod.targetTab);
                              showToast(`📍 Opened ${mod.title}`);
                            } else if (mod.specialAction === 'doctor') {
                              onOpenDoctorModal();
                            } else if (mod.specialAction === 'pdf_notes') {
                              onOpenPdfModal();
                            } else if (mod.specialAction === 'install_share') {
                              onOpenInstallShareModal('install');
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-black flex items-center space-x-1 cursor-pointer shadow-2xs"
                        >
                          <span>Open Tool</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-black text-indigo-950">{mod.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{mod.summary}</p>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                          Step-by-Step Operation:
                        </div>
                        {mod.steps.map((st, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-xs text-slate-800">
                            <span className="font-mono font-black text-emerald-700 shrink-0">
                              {idx + 1}.
                            </span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {mod.keyOutputs.map((out, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold"
                        >
                          ✓ {out}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================================
              MODE 3: ROLE-BASED QUICK-START WORKFLOWS (JR-1, JR-2, JR-3, FACULTY)
             ========================================================== */}
          {activeMode === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role 1: 1st Year Resident (JR-1) */}
              <div className="bg-white rounded-2xl border-2 border-emerald-400 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-amber-200 text-xs font-black uppercase">
                    1st-Year PG Resident (JR-1)
                  </span>
                  <span className="text-xs font-bold text-emerald-800">Months 1–6 Workflow</span>
                </div>
                <h3 className="text-base font-black text-indigo-950">
                  Topic Finalization, IEC Ethics Approval &amp; Synopsis Submission
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 1:</strong> Enter your provisional topic in <strong>Command Hub &amp; Setup</strong> and select your university &amp; specialty.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 2:</strong> Open <strong>NMC Synopsis &amp; STROBE</strong> to calculate your statistically justified Sample Size ($N$) and generate your CTRI registration dataset.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 3:</strong> Open <strong>Certificates &amp; 8-Lang ICF</strong> to print your vernacular Patient Consent Forms and Case Record Proforma for Institutional Ethics Committee (IEC) clearance.
                    </span>
                  </li>
                </ul>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab('protocol');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer"
                  >
                    Launch NMC Synopsis Builder &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab('frontmatter');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 text-xs font-black cursor-pointer"
                  >
                    Open 8-Language Consent &rarr;
                  </button>
                </div>
              </div>

              {/* Role 2: 2nd Year Resident (JR-2) */}
              <div className="bg-white rounded-2xl border-2 border-rose-400 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-800 text-amber-200 text-xs font-black uppercase">
                    2nd-Year PG Resident (JR-2)
                  </span>
                  <span className="text-xs font-bold text-rose-800">Months 6–18 Workflow</span>
                </div>
                <h3 className="text-base font-black text-indigo-950">
                  PubMed Literature Review, Patient Data Collection &amp; Chapters 1–4
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 1:</strong> Use <strong>PubMed / MEDLINE Search</strong> to gather 35+ global &amp; Indian studies and click <strong>Sync [1]–[N] Refs</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 2:</strong> Draft Chapters 1 to 4 (Introduction, Review of Literature, Objectives, Material &amp; Methods) in the <strong>6-Chapter Editor</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 3:</strong> Maintain your patient rows in the <strong>Biostats &amp; Master Chart</strong> tab as cases are recruited in OPD/IPD.
                    </span>
                  </li>
                </ul>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab('pubmed');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black cursor-pointer"
                  >
                    Open PubMed Search &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab('chapters');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-400 text-xs font-black cursor-pointer"
                  >
                    Open 6-Chapter Editor &rarr;
                  </button>
                </div>
              </div>

              {/* Role 3: 3rd Year Resident (JR-3) */}
              <div className="bg-white rounded-2xl border-2 border-indigo-400 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-900 text-amber-200 text-xs font-black uppercase">
                    3rd-Year PG Resident (JR-3)
                  </span>
                  <span className="text-xs font-bold text-indigo-900">Months 18–24 Final Submission</span>
                </div>
                <h3 className="text-base font-black text-indigo-950">
                  Final Biostatistics, &lt;10% Plagiarism Clearance, Bound Thesis &amp; Viva PPT
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 1:</strong> Run automated $p$-values, ROC curves &amp; tables in <strong>Biostats &amp; Master Chart</strong> and insert them into Chapter 5.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 2:</strong> Audit your draft in <strong>Plagiarism &amp; AI Checker</strong> and run the <strong>Auto-Diagnostic Doctor</strong> to ensure 100% readiness.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 3:</strong> Generate your <strong>IMRAD Journal Paper</strong>, <strong>12-Slide Viva PPT &amp; A0 E-Poster</strong>, and download the bound <strong>University Word (.doc) / PDF</strong>.
                    </span>
                  </li>
                </ul>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab('biostats');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-amber-200 text-xs font-black cursor-pointer"
                  >
                    Run Biostats &amp; ROC &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToTab('export');
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border border-indigo-400 text-xs font-black cursor-pointer"
                  >
                    Open Master Export Hub &rarr;
                  </button>
                </div>
              </div>

              {/* Role 4: Thesis Guide / HOD / Faculty Examiner */}
              <div className="bg-white rounded-2xl border-2 border-amber-400 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black uppercase">
                    Thesis Guide / HOD / Faculty
                  </span>
                  <span className="text-xs font-bold text-amber-900">Supervision &amp; Audit</span>
                </div>
                <h3 className="text-base font-black text-indigo-950">
                  Reviewing Resident Manuscripts, Sticky Note Corrections &amp; Plagiarism Audit
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 1:</strong> Receive the resident’s 6-digit Sync Code (e.g., <code>THS-8F4K2A</code>) or `.json` file via <strong>Share &amp; Mobile Sync</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 2:</strong> Open <strong>PDF &amp; Guide Sticky Notes</strong> in the top header to highlight sentences and pin draggable sticky notes directly onto any page.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      <strong>Step 3:</strong> Verify Turnitin-style similarity &amp; AI burstiness scores in <strong>Plagiarism &amp; AI Checker</strong> before signing the Guide Certificate.
                    </span>
                  </li>
                </ul>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPdfModal();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    Open PDF Highlighter &amp; Sticky Notes &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDoctorModal();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 text-xs font-black cursor-pointer"
                  >
                    Run 10-Point Diagnostic Doctor &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              MODE 4: TROUBLESHOOTING, OFFLINE MODE & FAQ
             ========================================================== */}
          {activeMode === 'faq' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    q: 'What if the AI server is busy, rate-limited, or I am working offline in a hospital ward?',
                    a: 'YADAV MD/MS Thesis Studio is built with a dual-engine architecture. Even if the cloud AI quota is temporarily busy or your internet disconnects, the built-in deterministic ICMR/NMC clinical rule engine and Service Worker cache automatically take over so chapter generation, biostatistics, table legends, and exports never fail.',
                  },
                  {
                    q: 'How do I fix missing citations, low word counts, or unformatted tables before final printing?',
                    a: 'Click the green/red "Auto-Diagnostic Doctor" button in the top header bar. It performs a 10-point inspection of your entire thesis and provides a "⚡ 1-Click Auto-Heal All Issues" button that repairs citations, syncs references [1]–[N], and populates any missing protocol or statistical sections.',
                  },
                  {
                    q: 'How does page numbering work when I export to MS Word (.doc) or Print PDF?',
                    a: 'In "11. Master Export Hub", preliminary pages (Title Page, Certificates, Acknowledgements, Table of Contents, List of Tables) are automatically placed in Section 1 with Roman numerals (i, ii, iii...), while Chapter 1 (Introduction) starts in Section 2 at Arabic Page 1—matching MUHS, RGUHS, AIIMS, and KGMU binding rules.',
                  },
                  {
                    q: 'Can I upload my own Excel/CSV patient Master Chart or existing PDF thesis draft?',
                    a: 'Yes! In "7. Biostats & Master Chart", click "Import CSV / Excel" to load your own patient dataset for automatic t-test, Chi-Square, and ROC analysis. In "8. Plagiarism & AI Checker", you can drag and drop any `.pdf`, `.docx`, or `.txt` file to extract text and run similarity/AI audits.',
                  },
                  {
                    q: 'How do I install this application on my Android phone, iPhone, or Windows/Mac laptop?',
                    a: 'Click "Install App" in the top header. On Android Chrome or Desktop Chrome/Edge, click "Install App Now (1-Click)". On iPhone/iPad Safari, tap the Safari Share icon (square with arrow ↑) and select "Add to Home Screen". You can also download the Portable HTML App Launcher.',
                  },
                  {
                    q: 'How can I move my active thesis from my laptop to my mobile phone or send it to my Thesis Guide?',
                    a: 'Click "Share & Mobile Sync" in the top header. Click "Generate 6-Digit Cloud Sync Code" (e.g., THS-8F4K2A) or scan the QR code with your phone camera. You can also export a `.json` backup file and import it on any device.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border-2 border-sky-200 space-y-2 shadow-2xs"
                  >
                    <h4 className="text-xs sm:text-sm font-black text-indigo-950 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{item.q}</span>
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed pl-6">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-emerald-950 text-white px-4 sm:px-6 py-3 border-t border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center space-x-2 text-emerald-200">
            <Stethoscope className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>YADAV MD/MS Thesis Studio:</strong> 100% Free Open-Access Academic Welfare Software for Indian PG Residents &amp; Medical Faculty
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleDownloadUserManualHtml}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-amber-200 font-bold text-xs cursor-pointer"
            >
              Download Printable Manual (.html)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
            >
              Got It, Return to Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
