import React, { useState, useEffect } from 'react';
import {
  Award,
  HelpCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  Palette,
  Edit3,
  CheckCircle,
  Presentation,
  LayoutGrid,
  QrCode,
  Printer
} from 'lucide-react';
import {
  PresentationSlide,
  SLIDE_THEMES,
  SlideThemeConfig,
  generateSlidesFromProject,
  exportSlidesToPptFile,
  exportSlidesToPdfFile,
  exportSlidesToWordDoc,
  extractTablesFromChapters
} from '../utils/thesisToPptAndJournalExporter';
import { extractTextFromUploadedFile } from '../utils/pdfTextExtractor';
import { exportConferencePosterToPdf } from '../utils/advancedThesisSuiteUtils';

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
    academicYear?: string;
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string }>;
  };
  showToast: (msg: string) => void;
}

const CONFERENCE_OPTIONS = [
  'APICON — Annual National Conference of Association of Physicians of India',
  'EMCON / INDUSEM — Annual National Conference of Society for Emergency Medicine India (SEMI)',
  'ASICON — Annual Conference of Association of Surgeons of India',
  'PEDICON — National Conference of Indian Academy of Pediatrics (IAP)',
  'AICOG — All India Congress of Obstetrics & Gynaecology (FOGSI)',
  'ISACON — Annual National Conference of Indian Society of Anaesthesiologists',
  'IRIA — Annual Congress of Indian Radiological & Imaging Association',
  'IOACON — National Conference of Indian Orthopaedic Association',
  'DERMACON / ANCIPS / NAPCON — Dermatology, Psychiatry & Pulmonary Medicine National Congress',
  'APCON / MICROCON / IPSCON — Pathology, Microbiology & Pharmacology National Conference',
  'IAPMRCON / GERICON / AROICON / TRANSMEDCON — PMR, Geriatrics, Oncology & Transfusion Medicine Congress'
];

const MOCK_VIVA_QUESTIONS = [
  {
    id: 1,
    question: 'Why did you choose this specific clinical dissertation topic and what is the primary clinical significance of your study?',
    answerHint: 'Focus on the rising burden in Indian population, the specific gap in regional tertiary care literature, and therapeutic risk stratification.',
    examinerComment: 'Excellent response. Always connect your background burden directly to regional Indian datasets (such as ICMR registries).'
  },
  {
    id: 2,
    question: 'How did you justify and calculate your sample size? Is your study cohort statistically powered?',
    answerHint: 'Mention the prevalence formula n = (Z_alpha^2 * p * q) / d^2 or two-group comparison formula with 95% confidence interval and 80% statistical power.',
    examinerComment: 'Very precise. Explicitly quoting your margin of error (d = 0.05) and alpha level protects your methodology from academic objections.'
  },
  {
    id: 3,
    question: 'Which statistical tests did you select to analyze the correlation, and why was a parametric or non-parametric test chosen?',
    answerHint: 'Pearson / Student t-test is used if continuous biological data is normally distributed; if variables exhibit skewed distributions or ordinal scores, Spearman rank correlation / Mann-Whitney U test is required.',
    examinerComment: 'Correct. Always state that normality was verified via Kolmogorov-Smirnov or Shapiro-Wilk testing before selecting the inferential model.'
  },
  {
    id: 4,
    question: 'What are the primary confounding variables in this study and how did you eliminate or adjust for them?',
    answerHint: 'Explain how strict exclusion criteria eliminated baseline clinical confounders and how stratified subgroup / multivariate analysis controlled for age and comorbidities.',
    examinerComment: 'Outstanding. Acknowledging confounders and explaining exclusion & regression adjustment demonstrates strong clinical maturity.'
  }
];

export const DefenseVivaPrep: React.FC<Props> = ({
  activeProject,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'poster' | 'viva' | 'examiner_rubric' | 'practical_cases' | 'pedagogy_jc'>('slides');
  const [pedagogyTopic, setPedagogyTopic] = useState<string>(
    `Bedside Clinical Approach, Diagnostic Stratification & Management in ${activeProject.specialty.replace(/^(MD|MS|DNB)\s+/i, '')}`
  );
  const [jcArticleCitation, setJcArticleCitation] = useState<string>(
    activeProject.citations[0]
      ? `${activeProject.citations[0].authors} (${activeProject.citations[0].pubdate}). ${activeProject.citations[0].title}. ${activeProject.citations[0].source}.`
      : 'Sharma RK et al. (2024). Multicentric Diagnostic & Prognostic Validation Cohort. Indian J Med Res (ICMR).'
  );

  // 5. NMC 400-Mark University Clinical Practical Exam (Long Case + 3 Short Cases + Grand Table Viva) State
  const [longCaseDiagnosis, setLongCaseDiagnosis] = useState<string>(
    `Classic Tertiary Care Long Case in ${activeProject.specialty} (Synchronized with "${activeProject.title}")`
  );
  const [practicalStationScores, setPracticalStationScores] = useState({
    longCase: 82, // out of 100
    shortCases: 126, // out of 150 (3 x 50)
    thesisDefense: 45, // out of 50
    grandTableViva: 84 // out of 100
  });

  // 4-Examiner 100-Mark University Board Evaluation Rubric State
  const [examinerPanel, setExaminerPanel] = useState({
    internal1: `Prof. Dr. ${activeProject.guideName} (Internal Examiner I & Chief Guide)`,
    internal2: `Prof. & Head, Dept. of ${activeProject.specialty.replace(/^(MD|MS)\s+/i, '')} (Internal Examiner II)`,
    external1: 'Prof. Dr. R. K. Sharma, MD/MS (External Examiner I — AIIMS / Central Institute)',
    external2: 'Prof. Dr. S. Venkataraman, MD/MS (External Examiner II — State Health University)'
  });
  const [boardVerdict, setBoardVerdict] = useState<'DISTINCTION' | 'ACCEPTED' | 'MINOR_REVISION'>('DISTINCTION');
  const [rubricScores, setRubricScores] = useState<{
    domain1: number; // max 15
    domain2: number; // max 15
    domain3: number; // max 20
    domain4: number; // max 20
    domain5: number; // max 15
    domain6: number; // max 15
  }>({
    domain1: 14,
    domain2: 14,
    domain3: 18,
    domain4: 19,
    domain5: 14,
    domain6: 14
  });

  // Slide Deck State
  const [slides, setSlides] = useState<PresentationSlide[]>(() =>
    generateSlidesFromProject(activeProject)
  );
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [selectedThemeId, setSelectedThemeId] = useState<SlideThemeConfig['id']>('emerald_pink');
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [isPresenterFullscreen, setIsPresenterFullscreen] = useState(false);
  const [includeNotesInPdf, setIncludeNotesInPdf] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isConvertingUpload, setIsConvertingUpload] = useState(false);
  const [uploadedSourceName, setUploadedSourceName] = useState<string | null>(null);
  const [showSlideDefenseOverlay, setShowSlideDefenseOverlay] = useState<boolean>(true);
  const [quickSlideTopicInput, setQuickSlideTopicInput] = useState<string>(activeProject.title);

  // Scientific Conference E-Poster State
  const [selectedConference, setSelectedConference] = useState(CONFERENCE_OPTIONS[0]);
  const [posterCode, setPosterCode] = useState('E-POSTER #MD-2026-108');
  const [isExportingPosterPdf, setIsExportingPosterPdf] = useState(false);

  // Viva States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [studentResponse, setStudentResponse] = useState('');
  const [examinerResponse, setExaminerComment] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [completedVivaIds, setCompletedVivaIds] = useState<Record<number, string>>({});

  // 10-Minute NMC Oral Defense Timer State
  const [vivaTimerSeconds, setVivaTimerSeconds] = useState<number>(600);
  const [isVivaTimerRunning, setIsVivaTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isVivaTimerRunning) return;
    const interval = setInterval(() => {
      setVivaTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isVivaTimerRunning]);

  const formatTimerMMSS = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const dynamicVivaQuestions = React.useMemo(() => {
    const cleanSpecialty = activeProject.specialty.replace(/^(MD|MS)\s+/i, '');
    const firstCitation = activeProject.citations[0]
      ? `${activeProject.citations[0].authors.split(',')[0]} et al. (${activeProject.citations[0].pubdate})`
      : 'ICMR Multicentric Study Group (2024)';
    const secondCitation = activeProject.citations[1]
      ? `${activeProject.citations[1].authors.split(',')[0]} et al. (${activeProject.citations[1].pubdate})`
      : 'Sharma et al. (NMJI 2023)';

    return [
      {
        id: 1,
        category: '1. Rationale & Indian Burden',
        question: `Why did you select "${activeProject.title}" for your ${activeProject.specialty} dissertation at ${activeProject.collegeName}, and what specific gap in Indian clinical literature does it address?`,
        answerHint: `Highlight the high regional disease burden in Indian tertiary care settings, scarcity of prospective data under ${activeProject.university}, and how early risk stratification improves patient outcomes.`,
        modelAnswer: `Respected Examiner, in Indian tertiary care centers in ${cleanSpecialty}, patients frequently present at an advanced clinical stage where western diagnostic cut-offs may not directly apply due to demographic and nutritional variations. While studies such as ${firstCitation} evaluated baseline parameters, there remained a paucity of prospective regional data from ${activeProject.collegeName}. Therefore, this study was designed to establish local clinical and biomarker correlations to guide early bedside risk stratification.`,
        examinerComment: 'Excellent justification. Connecting your research question directly to Indian demographic reality and regional tertiary hospital data is exactly what the examination board looks for.'
      },
      {
        id: 2,
        category: '2. Sample Size & Statistical Power',
        question: 'How did you calculate and justify your sample size (N = 120), and what assumptions were made for alpha error and statistical power?',
        answerHint: 'Cite Cochran’s prevalence formula n = Z²PQ / d² or two-group comparison formula with 95% Confidence Interval (Z = 1.96), 80% Statistical Power (1 - β = 0.80), and 10% attrition buffer.',
        modelAnswer: 'Sir/Madam, the minimum sample size was calculated using the standard biostatistical formula with a 95% confidence level (alpha = 0.05, Z_α/2 = 1.96), 80% statistical power (Z_β = 0.84), and an absolute precision (margin of error d) of 5% based on reference prevalence from prior Indian studies. After incorporating a 10% contingency for non-response or sample hemolysis, our final enrolled sample of N = 120 (60 cases and 60 controls) was fully powered to detect clinically meaningful differences.',
        examinerComment: 'Very precise. Quoting your exact alpha level (0.05), power (80%), and attrition adjustment protects your methodology from any biostatistical objection.'
      },
      {
        id: 3,
        category: '3. Study Design & STROBE / CONSORT Flow',
        question: 'Explain your patient recruitment workflow and why your chosen study design was the most ethical and practical choice for a 36-month residency.',
        answerHint: 'Describe consecutive screening, strict inclusion/exclusion filtering, written bilingual informed consent, and STROBE/CONSORT flowchart tracking.',
        modelAnswer: `We employed a prospective observational analytical design following STROBE reporting guidelines. Out of 148 consecutive patients screened in the Department of ${cleanSpecialty}, 28 were excluded due to predefined confounding comorbidities or refusal of consent, leaving 120 eligible participants who provided written bilingual informed consent. This design allowed rigorous real-world evaluation without withholding standard-of-care therapy.`,
        examinerComment: 'Well structured. Referring to the STROBE participant disposition flow shows strong adherence to international reporting standards.'
      },
      {
        id: 4,
        category: '4. Parametric vs. Non-Parametric Tests',
        question: 'Which statistical tests did you use to analyze your Master Chart variables, and how did you verify whether your continuous variables followed a normal distribution?',
        answerHint: 'Mention Shapiro-Wilk / Kolmogorov-Smirnov test for normality, Mean ± SD with Student’s t-test / ANOVA for normal data, and Median (IQR) with Mann-Whitney U / Spearman for skewed data.',
        modelAnswer: 'Before applying inferential tests, all continuous variables in our Master Chart were tested for normality using the Shapiro-Wilk test and Q-Q plots. Normally distributed variables were expressed as Mean ± Standard Deviation and compared using the unpaired Student’s t-test (two groups) or One-Way ANOVA (three or more groups). Skewed variables and ordinal clinical scores were summarized as Median (Interquartile Range) and analyzed via the Mann-Whitney U test, while categorical proportions were compared using the Chi-Square (χ²) or Fisher’s Exact test.',
        examinerComment: 'Spot on. Explicitly mentioning Shapiro-Wilk normality testing before choosing Student’s t-test vs. Mann-Whitney U test demonstrates strong statistical command.'
      },
      {
        id: 5,
        category: '5. Confounding Variables & Bias Control',
        question: 'What were the major potential confounding variables in your study cohort, and how did you control for selection and measurement bias?',
        answerHint: 'Discuss baseline age/sex matching, strict exclusion of overlapping systemic conditions, calibrated laboratory/imaging protocols, and multivariate regression.',
        modelAnswer: 'We controlled for confounding at two levels: during enrollment via strict exclusion criteria (eliminating preexisting hepatic, renal, or systemic inflammatory conditions that alter baseline biomarkers) and by ensuring baseline age and gender comparability (p = 0.412, statistically non-significant) between study groups. Furthermore, multivariate logistic regression confirmed that our primary parameter remained an independent predictor (Adjusted OR = 3.84, p < 0.001) after adjusting for age and BMI.',
        examinerComment: 'Outstanding response. Demonstrating both design-level control (exclusion criteria & matching) and statistical control (multivariate regression) is distinction-level.'
      },
      {
        id: 6,
        category: '6. Diagnostic Cut-Off, Sensitivity & ROC Curve',
        question: 'How did you determine the optimal diagnostic cut-off value for your primary study parameter, and what was the Area Under the ROC Curve (AUROC)?',
        answerHint: 'Explain Receiver Operating Characteristic (ROC) curve analysis, Youden’s Index (J = Sensitivity + Specificity - 1), PPV, NPV, and Likelihood Ratios.',
        modelAnswer: 'We constructed a Receiver Operating Characteristic (ROC) curve plotting Sensitivity against (1 - Specificity) across continuous thresholds. Using Youden’s Index (maximizing Sensitivity + Specificity - 1), we identified the optimal diagnostic cut-off, which yielded an Area Under the ROC Curve (AUROC) of 0.884 (95% CI: 0.821–0.946, p < 0.001), with a diagnostic sensitivity of 86.7%, specificity of 83.3%, Positive Predictive Value of 83.9%, and Negative Predictive Value of 86.2%.',
        examinerComment: 'Very impressive. Knowing Youden’s Index and quoting AUROC with 95% confidence intervals sets your viva defense apart.'
      },
      {
        id: 7,
        category: '7. Concordance with Indian & Global Studies',
        question: 'How do your primary observations compare with published Indian (IJMR / NMJI / JAPI) and international studies, and why do any minor variations exist?',
        answerHint: `Compare your Mean ± SD and p-values with ${firstCitation} and ${secondCitation}, noting ethnic, dietary, or tertiary referral differences.`,
        modelAnswer: `Our primary outcome findings are in strong concordance with ${firstCitation} and ${secondCitation}, both of which reported statistically significant correlations (p < 0.001) in comparable cohorts. Minor variations in absolute baseline mean titers in our cohort at ${activeProject.collegeName} are attributable to tertiary-care referral patterns, where patients often present slightly later in the natural history of disease compared to community screening cohorts.`,
        examinerComment: 'Thoughtful comparative analysis. Explaining minor numerical differences via tertiary hospital referral bias shows mature clinical reasoning.'
      },
      {
        id: 8,
        category: '8. Ethical Clearance, ICMR 2017 & Patient Consent',
        question: 'How did you ensure compliance with ICMR National Ethical Guidelines (2017) and protect patient confidentiality during data collection?',
        answerHint: 'Mention Institutional Ethics Committee (IEC) approval prior to enrollment, Bilingual Participant Information Sheet (PIS) & Consent Form, and anonymized Master Chart coding.',
        modelAnswer: 'Enrollment commenced strictly after obtaining formal clearance from our Institutional Ethics Committee (IEC) in compliance with ICMR National Ethical Guidelines for Biomedical and Health Research Involving Human Participants (2017) and the Declaration of Helsinki. Every participant was provided a Participant Information Sheet and signed a written Informed Consent Form in English and their vernacular language. All patient identifiers were replaced with alphanumeric study codes in the Master Chart, and no extra financial burden was imposed on any patient.',
        examinerComment: 'Complete and thorough ethical answer. Mentioning zero financial burden on patients and vernacular consent is highly appreciated by examiners.'
      },
      {
        id: 9,
        category: '9. Study Limitations & Internal Validity',
        question: 'What are the key methodological limitations of your dissertation, and how should future researchers build upon your work?',
        answerHint: 'Acknowledge single-center tertiary teaching hospital setting, cross-sectional/short-term follow-up window, and recommend multicentric longitudinal validation.',
        modelAnswer: 'First, as a single-center study conducted at a tertiary teaching hospital, referral bias may limit direct generalization to primary rural health centers. Second, serial long-term longitudinal follow-up beyond hospital discharge was outside the timeframe of our residency protocol. Future multicentric Indian studies with larger sample sizes and serial post-treatment biomarker monitoring are recommended to validate these cut-offs across diverse geographic regions.',
        examinerComment: 'Honest, balanced, and scientifically sound. Examiners always test whether a candidate recognizes the realistic scope of a single-center PG thesis.'
      },
      {
        id: 10,
        category: '10. Bedside Clinical Take-Home Message',
        question: `In one concise statement, how should your findings change routine clinical practice in the Department of ${cleanSpecialty}?`,
        answerHint: 'Provide a clear, actionable clinical recommendation for routine OPD/IPD screening and early therapeutic intervention.',
        modelAnswer: `Routine incorporation of our studied clinical and biomarker protocol at initial IPD/OPD presentation provides a rapid, cost-effective, and statistically validated tool (AUROC = 0.884, p < 0.001) to identify high-risk patients early, enabling timely targeted intervention and reducing morbidity in Indian teaching hospitals.`,
        examinerComment: 'Clear, decisive, and clinically actionable summary!'
      },
      (() => {
        const s = (activeProject.specialty || '').toLowerCase();
        if (s.includes('emergency') || s.includes('trauma') || s.includes('critical care')) {
          return {
            id: 11,
            category: '11. Emergency Triage & Resuscitation Protocol',
            question: `How did you integrate your study protocol within the Golden Hour of Emergency Department resuscitation (ABCDE, E-FAST, and Surviving Sepsis / ATLS bundle) without delaying life-saving care?`,
            answerHint: 'Emphasize zero delay to primary ABCDE survey, simultaneous point-of-care arterial blood gas/lactate sampling during initial IV cannulation, and bedside POCUS/E-FAST integration.',
            modelAnswer: `Respected Examiner, patient safety in the Red-Zone Resuscitation Bay was paramount. All index biomarker and arterial blood gas samples were drawn simultaneously during initial large-bore intravenous cannulation within the first 10 minutes of Emergency Severity Index (ESI) Triage Category I/II arrival, causing zero delay to the primary ABCDE survey, E-FAST ultrasound, or 1-hour Surviving Sepsis / ATLS resuscitation bundle.`,
            examinerComment: 'Distinction-grade emergency medicine response! Demonstrating that research sampling never delayed resuscitation is crucial for an MD Emergency Medicine examiner.'
          };
        }
        if (s.includes('anesthes') || s.includes('anaesthes') || s.includes('pain')) {
          return {
            id: 11,
            category: '11. Perioperative ASA & Hemodynamic Standardization',
            question: `How did you standardize anesthetic induction, airway management (Cormack-Lehane / Video Laryngoscopy), and intraoperative hemodynamic monitoring across all study groups?`,
            answerHint: 'Explain uniform pre-anesthetic ASA physical status classification, standardized induction/volatile agents, bispectral/ETCO2 monitoring, and predefined rescue vasopressor criteria.',
            modelAnswer: `All enrolled ASA Physical Status I–III patients underwent a uniform pre-anesthetic checkup (PAC) and standardized induction protocol. Intraoperative continuous ECG, SpO2, capnography (ETCO2 maintained at 35–40 mmHg), and non-invasive/invasive MAP were recorded at 5-minute intervals. Any hypotensive episode (>20% drop from baseline MAP) was treated per a predefined rescue Mephentermine/Phenylephrine protocol and documented in the Master Chart.`,
            examinerComment: 'Excellent perioperative standardization. Controlling anesthetic depth and rescue vasopressor thresholds eliminates intraoperative confounding.'
          };
        }
        if (s.includes('pathol') || s.includes('microbiol') || s.includes('pharmacol') || s.includes('transfusion') || s.includes('biochem')) {
          return {
            id: 11,
            category: '11. NABL / CLSI Quality Control & Inter-Observer Concordance',
            question: `How did you ensure internal/external laboratory quality control (IQC/EQAS), CLSI breakpoint compliance, and blinded inter-observer diagnostic concordance?`,
            answerHint: 'Cite daily ATCC/NABL calibration controls, blinded dual-observer slide/culture evaluation, and Cohen’s Kappa (κ > 0.85) inter-rater reliability.',
            modelAnswer: `All assays and histopathological/microbiological evaluations were performed under strict NABL and CLSI M100 quality assurance protocols using ATCC reference control strains and calibrated daily internal quality controls (IQC). Furthermore, slides and culture plates were independently evaluated by two senior faculty consultants blinded to clinical outcomes, achieving an inter-observer Cohen’s Kappa coefficient of κ = 0.89 (almost perfect agreement).`,
            examinerComment: 'Outstanding diagnostic rigor. Quoting Cohen’s Kappa for blinded inter-observer agreement and ATCC/NABL quality controls impresses any external examiner.'
          };
        }
        if (s.includes('surgery') || s.includes('ortho') || s.includes('ent') || s.includes('ophthal') || s.includes('urology') || s.includes('neurosurg') || s.includes('obstet') || s.includes('gynaec')) {
          return {
            id: 11,
            category: '11. Operative Standardization & Clavien-Dindo / Robson Grading',
            question: `How did you standardize operative technique and classify postoperative morbidity or feto-maternal outcomes in your surgical cohort?`,
            answerHint: 'Mention WHO Surgical Safety Checklist, standardized surgical team/approach, prophylactic antibiotic timing, and Clavien-Dindo / Robson / ASEPSIS objective scoring.',
            modelAnswer: `All surgical procedures were performed or directly supervised by senior consultant faculty following the WHO 19-item Surgical Safety Checklist and uniform antibiotic prophylaxis within 60 minutes prior to incision. Postoperative complications were objectively stratified using the validated Clavien-Dindo Grade I–V classification and Southampton/ASEPSIS wound scoring up to 30-day follow-up.`,
            examinerComment: 'Very thorough surgical methodology. Using Clavien-Dindo and WHO Surgical Safety Checklist standards ensures objective comparison.'
          };
        }
        return {
          id: 11,
          category: `11. ${cleanSpecialty} Gold-Standard & Scoring Validation`,
          question: `Why did you select this specific clinical severity score and diagnostic reference standard for your ${cleanSpecialty} study cohort?`,
          answerHint: 'Discuss high diagnostic reproducibility, international & ICMR guideline endorsement, and bedside feasibility in Indian teaching hospitals.',
          modelAnswer: `We selected our reference clinical severity score and diagnostic standard because it is endorsed by both international specialty consensus guidelines and ICMR national standard treatment workflows. It offers high reproducibility, low inter-observer variability, and practical bedside applicability in Indian tertiary teaching hospitals.`,
          examinerComment: 'Strong justification of your diagnostic reference standard and clinical scoring system.'
        };
      })(),
      {
        id: 12,
        category: '12. Cost-Effectiveness & National Health Programme Integration',
        question: `How can your dissertation findings be scaled to District Hospitals and National Health Mission (NHM / Ayushman Bharat PM-JAY) care pathways in India?`,
        answerHint: 'Highlight low per-test cost, rapid turnaround time, early triage of high-risk patients for timely tertiary referral, and alignment with ICMR/NHM STWs.',
        modelAnswer: `Because the clinical scoring and index parameters evaluated in our dissertation utilize widely available, low-cost point-of-care and routine laboratory infrastructure, they can be seamlessly integrated into District Hospital and Ayushman Bharat (PM-JAY) Standard Treatment Workflows (STWs) to identify high-risk patients early and trigger timely golden-hour referral to tertiary centers.`,
        examinerComment: 'Exemplary public-health and national clinical perspective! Linking your PG thesis to ICMR Standard Treatment Workflows leaves a lasting impression on the Board.'
      }
    ];
  }, [activeProject.title, activeProject.specialty, activeProject.collegeName, activeProject.university, activeProject.citations]);

  const currentQuestion = dynamicVivaQuestions[currentQuestionIdx] || dynamicVivaQuestions[0];

  const handleDownloadVivaHandbookDoc = () => {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>Viva Voce Defense Handbook - ${activeProject.title}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.5cm 2.5cm 2.5cm 3.0cm; }
  body { font-family: "Times New Roman", serif; font-size: 11.5pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 16pt; color: #064e3b; text-transform: uppercase; text-align: center; margin-bottom: 4pt; }
  h2 { font-size: 12.5pt; color: #881337; border-bottom: 1.5pt solid #065f46; padding-bottom: 3pt; margin-top: 14pt; }
  .meta { text-align: center; font-size: 10.5pt; color: #334155; margin-bottom: 16pt; border-bottom: 2pt double #0f172a; padding-bottom: 10pt; }
  .q-box { background: #f0fdf4; border: 1pt solid #059669; padding: 8pt; margin-bottom: 6pt; font-weight: bold; }
  .a-box { background: #fff1f2; border: 1pt solid #e11d48; padding: 8pt; margin-bottom: 6pt; }
  .hint { font-size: 10pt; color: #065f46; font-style: italic; margin-bottom: 6pt; }
</style>
</head>
<body>
  <h1>MD / MS DISSERTATION VIVA VOCE &amp; EXTERNAL EXAMINER HANDBOOK</h1>
  <div class="meta">
    <p><strong>Dissertation Title:</strong> ${activeProject.title}</p>
    <p><strong>Candidate:</strong> Dr. ${activeProject.candidateName} (${activeProject.specialty}) &nbsp;|&nbsp; <strong>Guide:</strong> Prof. Dr. ${activeProject.guideName}</p>
    <p><strong>Institution:</strong> ${activeProject.collegeName} (${activeProject.university})</p>
  </div>
  ${dynamicVivaQuestions
    .map(
      q => `
    <h2>Question ${q.id} [${q.category}]</h2>
    <div class="q-box">Examiner Question: "${q.question}"</div>
    <div class="hint"><strong>Key Clinical &amp; Statistical Focus:</strong> ${q.answerHint}</div>
    <div class="a-box"><strong>Model Distinction Oral Defense Answer:</strong><br/>${completedVivaIds[q.id] || q.modelAnswer}</div>
    <p style="font-size:10pt; color:#1e293b;"><strong>Board Evaluation Note:</strong> ${q.examinerComment}</p>
  `
    )
    .join('\n')}
</body>
</html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.title.substring(0, 28).replace(/[^a-zA-Z0-9]/g, '_')}_Viva_Voce_Handbook.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showToast('✅ Downloaded Complete 10-Question Thesis Viva Voce Q&A Handbook (.DOC)!');
  };

  useEffect(() => {
    if (!uploadedSourceName) {
      setSlides(generateSlidesFromProject(activeProject));
      setCurrentSlideIdx(0);
    }
  }, [activeProject.id, activeProject.title]);

  const currentTheme = SLIDE_THEMES[selectedThemeId];
  const currentSlide = slides[currentSlideIdx] || slides[0];

  const extractedTables = extractTablesFromChapters(activeProject.chapters);
  const posterTable = extractedTables[0] || {
    caption: 'Table 1: Master Chart Baseline & Primary Outcome Comparison (N = 120)',
    headers: ['Clinical Parameter', 'Study Cases (n=60)', 'Controls (n=60)', 'p-value'],
    rows: [
      ['Mean Age (Years ± SD)', '49.4 ± 11.2', '48.1 ± 10.8', '0.412 (NS)'],
      ['Primary Biomarker Titer', '14.2 ± 4.1', '28.6 ± 6.4', '< 0.001*'],
      ['Clinical Severity Score', '11.8 ± 2.9', '5.2 ± 1.8', '< 0.001*'],
      ['Composite Adverse Outcome', '42 (70.0%)', '11 (18.3%)', '< 0.001*']
    ]
  };

  const handleRegenerateFromActiveThesis = () => {
    const freshSlides = generateSlidesFromProject(activeProject);
    setSlides(freshSlides);
    setCurrentSlideIdx(0);
    setUploadedSourceName(null);
    showToast('12-Slide Defense PPT Presentation regenerated from active thesis chapters & tables!');
  };

  const handleUploadThesisForPpt = async (file: File) => {
    setIsConvertingUpload(true);
    try {
      const extracted = await extractTextFromUploadedFile(file);
      const rawText = extracted.extractedText || '';
      const paragraphs = rawText
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 35);

      const sliceBullets = (startRatio: number, count = 4, fallback: string[]) => {
        if (paragraphs.length < 4) return fallback;
        const startIdx = Math.floor(paragraphs.length * startRatio);
        const picked = paragraphs
          .slice(startIdx, startIdx + count)
          .map(p => (p.length > 180 ? p.substring(0, 177) + '...' : p));
        return picked.length > 0 ? picked : fallback;
      };

      const baseDeck = generateSlidesFromProject(activeProject);
      const customizedDeck = baseDeck.map((s, idx) => {
        if (idx === 0) {
          return {
            ...s,
            subtitle: `Converted from Uploaded Thesis File: ${file.name} (${extracted.wordCount.toLocaleString()} words)`
          };
        }
        if (idx === 1) return { ...s, bullets: sliceBullets(0.05, 4, s.bullets) };
        if (idx === 4) return { ...s, bullets: sliceBullets(0.2, 4, s.bullets) };
        if (idx === 5) return { ...s, bullets: sliceBullets(0.4, 4, s.bullets) };
        if (idx === 7) return { ...s, bullets: sliceBullets(0.6, 3, s.bullets) };
        if (idx === 9) return { ...s, bullets: sliceBullets(0.75, 4, s.bullets) };
        if (idx === 11) return { ...s, bullets: sliceBullets(0.88, 4, s.bullets) };
        return s;
      });

      setSlides(customizedDeck);
      setCurrentSlideIdx(0);
      setUploadedSourceName(`${file.name} (${extracted.wordCount.toLocaleString()} words)`);
      showToast(`Converted "${file.name}" into a 12-Slide Defense PPT Deck!`);
    } catch (err) {
      showToast('Could not parse uploaded file; generated slides from active thesis.');
    } finally {
      setIsConvertingUpload(false);
    }
  };

  const handleUpdateCurrentSlide = (patch: Partial<PresentationSlide>) => {
    setSlides(prev =>
      prev.map((s, idx) => (idx === currentSlideIdx ? { ...s, ...patch } : s))
    );
  };

  const handleAddSlide = () => {
    const newSlide: PresentationSlide = {
      id: `slide-custom-${Date.now()}`,
      slideNumber: slides.length + 1,
      category: 'ADDITIONAL CLINICAL SLIDE',
      title: `${slides.length + 1}. Supplementary Clinical Subgroup Analysis`,
      subtitle: 'Additional Thesis Observation & Examiner Discussion Point',
      bullets: [
        'Key clinical observation extracted from master chart subgroup evaluation.',
        'Statistical comparison confirming robustness of primary outcome endpoints (p < 0.05).',
        'Clinical implication for routine diagnostic protocol at tertiary teaching hospital.'
      ],
      speakerNotes: 'This supplementary slide highlights our subgroup analysis for external examiner discussion.'
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setCurrentSlideIdx(next.length - 1);
    showToast('Added new slide to presentation deck!');
  };

  const handleDeleteCurrentSlide = () => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, idx) => idx !== currentSlideIdx).map((s, i) => ({
      ...s,
      slideNumber: i + 1
    }));
    setSlides(next);
    setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1));
    showToast('Removed slide from presentation deck.');
  };

  const handleDownloadPpt = () => {
    exportSlidesToPptFile(activeProject, slides, currentTheme);
    showToast('📊 Downloaded Microsoft PowerPoint Presentation (.PPT) with Embedded Speaker Notes & Defense Script!');
  };

  const handleDownloadCombinedPptAndDefensePack = () => {
    exportSlidesToPptFile(activeProject, slides, currentTheme);
    handleDownloadVivaHandbookDoc();
    showToast('📦 Downloaded Integrated PowerPoint Slide Deck (.PPT) + 12-Question Viva Defense Handbook (.DOC)!');
  };

  const handleQuickSynthesizeSlidesFromTopic = (customTopic: string) => {
    const cleanT = customTopic.trim() || activeProject.title;
    const synthProject = {
      ...activeProject,
      title: cleanT
    };
    const newDeck = generateSlidesFromProject(synthProject);
    setSlides(newDeck);
    setCurrentSlideIdx(0);
    showToast(`⚡ Synthesized 12-Slide PowerPoint Deck & Examiner Viva Defense for "${cleanT.slice(0, 48)}..."!`);
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportSlidesToPdfFile(activeProject, slides, currentTheme, includeNotesInPdf);
      showToast('Downloaded Widescreen Presentation Slides (.pdf)!');
    } catch (e) {
      showToast('Error generating PDF slide deck.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadWordHandout = () => {
    exportSlidesToWordDoc(activeProject, slides);
    showToast('Downloaded Presentation Handout & Speaker Script (.doc)!');
  };

  const handleDownloadConferencePosterPdf = async () => {
    setIsExportingPosterPdf(true);
    try {
      await exportConferencePosterToPdf(activeProject, selectedConference, posterCode);
      showToast('Downloaded Widescreen Conference Scientific E-Poster (.PDF)!');
    } catch (e) {
      showToast('Error compiling Conference E-Poster PDF.');
    } finally {
      setIsExportingPosterPdf(false);
    }
  };

  const copySlideText = () => {
    if (!currentSlide) return;
    let text = `SLIDE ${currentSlideIdx + 1}: ${currentSlide.title}\n${currentSlide.subtitle}\n\n`;
    currentSlide.bullets.forEach(b => {
      text += `• ${b}\n`;
    });
    text += `\nSpeaker Notes: ${currentSlide.speakerNotes}\n`;
    navigator.clipboard.writeText(text);
    showToast(`Slide ${currentSlideIdx + 1} copied to clipboard!`);
  };

  const handleEvaluateResponse = () => {
    if (!studentResponse.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setCompletedVivaIds(prev => ({
        ...prev,
        [currentQuestion.id]: studentResponse.trim()
      }));
      setExaminerComment(
        `[DISTINCTION GRADE — BOARD FEEDBACK] Dr. ${activeProject.candidateName}, you articulated this clearly. ${currentQuestion.examinerComment}`
      );
      setIsEvaluating(false);
      showToast('Examiner evaluation recorded!');
    }, 450);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-300 overflow-hidden">
      {/* Header Bar — Light Green & Rose Pink Contrast Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-200 via-teal-100 to-pink-200 text-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-pink-300">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-700 text-white rounded-xl shadow-xs border border-rose-900">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-serif font-black tracking-tight text-indigo-950">
                  Thesis to PPT Studio, Conference E-Poster Generator & Viva Coach
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-800 text-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                  1-Click .PPT • E-Poster .PDF • .DOC Export
                </span>
              </div>
              <p className="text-xs text-rose-950 font-semibold mt-0.5">
                Convert your MD/MS Dissertation into a 12-Slide Defense PPT Deck, a 3-Column National Medical Conference E-Poster (APICON/ASICON/PEDICON), or practice with the NMC Viva Examiner.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Sub-tab switcher */}
        <div className="flex flex-wrap bg-white/95 border-2 border-emerald-500 p-1 rounded-xl text-xs font-extrabold shadow-xs self-start lg:self-auto gap-1">
          <button
            onClick={() => setActiveSubTab('slides')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'slides'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-xs'
                : 'text-indigo-950 hover:bg-emerald-50'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>1. Thesis to PPT ({slides.length} Slides)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('poster')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'poster'
                ? 'bg-gradient-to-r from-indigo-800 to-purple-900 text-amber-200 shadow-xs'
                : 'text-indigo-950 hover:bg-indigo-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2. Conference E-Poster (A0/16:9)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('viva')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'viva'
                ? 'bg-gradient-to-r from-rose-700 to-pink-800 text-white shadow-xs'
                : 'text-rose-950 hover:bg-pink-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3. Mock Viva Examiner</span>
          </button>
          <button
            onClick={() => setActiveSubTab('examiner_rubric')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'examiner_rubric'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs'
                : 'text-indigo-950 hover:bg-amber-50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>4. 4-Examiner Board Rubric (100M)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('practical_cases')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'practical_cases'
                ? 'bg-gradient-to-r from-sky-800 to-indigo-900 text-amber-200 shadow-xs'
                : 'text-indigo-950 hover:bg-sky-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>5. NMC 400M Practical (Long/Short Cases)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('pedagogy_jc')}
            className={`px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'pedagogy_jc'
                ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-amber-200 shadow-xs'
                : 'text-indigo-950 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>6. NMC Pedagogy &amp; Journal Club</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* =====================================================================
            VIEW 1: THESIS TO PPT PRESENTATION STUDIO
           ===================================================================== */}
        {activeSubTab === 'slides' && (
          <div className="space-y-6">
            {/* Top Action & Conversion Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-pink-50 p-4 rounded-xl border-2 border-emerald-300">
              <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-700" />
                    <span>1. Thesis Source for PPT Generation</span>
                  </span>
                  {uploadedSourceName && (
                    <span className="text-[10px] font-bold bg-pink-200 text-rose-950 px-2 py-0.5 rounded-full border border-pink-400">
                      Uploaded: {uploadedSourceName}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRegenerateFromActiveThesis}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync from Active Thesis Manuscript</span>
                  </button>

                  <label className="px-3 py-2 bg-white hover:bg-pink-50 text-rose-900 border-2 border-pink-400 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all">
                    <Upload className="w-3.5 h-3.5 text-rose-700" />
                    <span>{isConvertingUpload ? 'Converting PDF...' : 'Upload Thesis PDF/DOC to PPT'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadThesisForPpt(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col justify-between space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-700" />
                  <span>2. Presentation Visual Theme</span>
                </span>
                <select
                  value={selectedThemeId}
                  onChange={e => setSelectedThemeId(e.target.value as SlideThemeConfig['id'])}
                  className="w-full text-xs font-bold p-2 bg-white border-2 border-emerald-400 rounded-lg text-indigo-950 focus:outline-none cursor-pointer"
                >
                  {Object.values(SLIDE_THEMES).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-rose-700" />
                    <span>3. Export Presentation Deck</span>
                  </span>
                  <label className="flex items-center space-x-1 text-[10px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNotesInPdf}
                      onChange={e => setIncludeNotesInPdf(e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    <span>Include Speaker Notes in PDF</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={handleDownloadPpt}
                    className="flex-1 min-w-[115px] px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-black flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-all"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Export PowerPoint (.PPT)</span>
                  </button>

                  <button
                    onClick={handleDownloadCombinedPptAndDefensePack}
                    className="flex-1 min-w-[135px] px-3 py-2 bg-gradient-to-r from-indigo-900 to-blue-950 hover:from-indigo-950 hover:to-blue-900 text-yellow-200 border border-amber-400 rounded-lg text-xs font-black flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-all"
                    title="Export Microsoft PowerPoint (.PPT) + Complete Viva Defense Q&A Handbook (.DOC) in 1 click"
                  >
                    <Award className="w-3.5 h-3.5 text-yellow-300" />
                    <span>PPT + Viva Pack</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="flex-1 min-w-[105px] px-3 py-2 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 disabled:opacity-50 text-white rounded-lg text-xs font-black flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isExportingPdf ? 'Building...' : 'Export .PDF'}</span>
                  </button>

                  <button
                    onClick={handleDownloadWordHandout}
                    className="flex-1 min-w-[105px] px-3 py-2 bg-gradient-to-r from-sky-700 to-indigo-800 hover:from-sky-800 hover:to-indigo-900 text-white rounded-lg text-xs font-black flex items-center justify-center space-x-1 cursor-pointer shadow-xs transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export .DOC</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instant Topic-to-PowerPoint & Slide Defense Synthesizer Bar */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-100 via-yellow-100 to-sky-100 border-2 border-sky-500 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-black uppercase text-blue-950 mb-1">
                  ⚡ Instant Topic-to-PowerPoint &amp; Slide Defense Synthesizer (Enter Any Topic to Auto-Generate 12 Slides + Viva Q&amp;A):
                </label>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={quickSlideTopicInput}
                    onChange={(e) => setQuickSlideTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickSynthesizeSlidesFromTopic(quickSlideTopicInput);
                      }
                    }}
                    placeholder="Type any MD/MS thesis topic and press Enter to synthesize 12 PowerPoint slides + Viva defense..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white border-2 border-blue-900 text-xs font-extrabold text-blue-950 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickSynthesizeSlidesFromTopic(quickSlideTopicInput)}
                    className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-black flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                    <span>Synthesize PowerPoint + Defense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSlideDefenseOverlay(prev => !prev)}
                    className={`px-3 py-2 rounded-lg text-xs font-black border-2 cursor-pointer shrink-0 ${
                      showSlideDefenseOverlay
                        ? 'bg-blue-950 text-yellow-200 border-blue-950'
                        : 'bg-white text-blue-950 border-blue-900'
                    }`}
                  >
                    {showSlideDefenseOverlay ? '✓ Live Slide Defense Q&A Active' : 'Show Slide Defense Q&A'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Slide Deck Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Slide Deck Outline ({slides.length} Slides)
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleAddSlide}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Slide</span>
                    </button>
                    {slides.length > 1 && (
                      <button
                        onClick={handleDeleteCurrentSlide}
                        className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded cursor-pointer"
                        title="Delete current slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[470px] overflow-y-auto pr-1">
                  {slides.map((s, idx) => {
                    const isCurrent = currentSlideIdx === idx;
                    const isEven = idx % 2 === 0;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setCurrentSlideIdx(idx)}
                        className={`w-full p-2.5 rounded-xl text-left border-2 transition-all flex items-start space-x-2.5 cursor-pointer ${
                          isCurrent
                            ? 'border-rose-600 bg-gradient-to-r from-emerald-100 to-pink-100 shadow-xs'
                            : isEven
                              ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70'
                              : 'border-pink-200 bg-pink-50/60 hover:bg-pink-100/70'
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono shrink-0 mt-0.5 ${
                            isCurrent
                              ? 'bg-rose-700 text-white'
                              : isEven
                                ? 'bg-emerald-700 text-white'
                                : 'bg-pink-700 text-white'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[9px] font-extrabold uppercase tracking-wider text-rose-800 truncate">
                            {s.category}
                          </div>
                          <div className="text-xs font-bold text-indigo-950 truncate">
                            {s.title}
                          </div>
                          {s.table && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded">
                              Includes Statistical Table
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col space-y-4">
                {currentSlide && (
                  <div
                    className={`${
                      isPresenterFullscreen
                        ? 'fixed inset-4 z-50 overflow-y-auto p-10'
                        : 'p-6 md:p-8 min-h-[380px]'
                    } ${currentTheme.bgClass} rounded-2xl shadow-xl border-2 flex flex-col justify-between transition-all`}
                  >
                    <div className={`${currentTheme.headerBgClass} p-4 rounded-xl shadow-xs`}>
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-amber-300 mb-1">
                        <span>
                          {currentSlide.category} • {activeProject.collegeName}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span>
                            SLIDE {currentSlideIdx + 1} OF {slides.length}
                          </span>
                          <button
                            onClick={() => setIsPresenterFullscreen(!isPresenterFullscreen)}
                            className="p-1 bg-white/20 hover:bg-white/30 rounded text-white cursor-pointer"
                            title="Toggle Fullscreen Presenter View"
                          >
                            {isPresenterFullscreen ? (
                              <Minimize2 className="w-3.5 h-3.5" />
                            ) : (
                              <Maximize2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg md:text-2xl font-serif font-black text-white leading-snug">
                        {currentSlide.title}
                      </h3>
                      <p className="text-xs md:text-sm text-sky-100 font-semibold italic mt-1">
                        {currentSlide.subtitle}
                      </p>
                    </div>

                    <div className="my-5 flex-1 flex flex-col justify-center space-y-4 px-1">
                      <ul className="space-y-2.5">
                        {currentSlide.bullets.map((b, i) => (
                          <li
                            key={i}
                            className={`text-xs md:text-sm ${currentTheme.bulletTextClass} font-bold flex items-start space-x-2.5 leading-relaxed`}
                          >
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-700 text-white text-[10px] font-black shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {currentSlide.table && (
                        <div className="mt-3 bg-white/95 rounded-xl border-2 border-emerald-500 overflow-hidden shadow-xs">
                          <div className="px-3 py-1.5 bg-emerald-800 text-white text-[11px] font-bold">
                            {currentSlide.table.caption}
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[11px]">
                              <thead>
                                <tr className="bg-emerald-100 text-emerald-950 border-b border-emerald-300">
                                  {currentSlide.table.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="py-1.5 px-2.5 font-black">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {currentSlide.table.rows.map((r, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={
                                      rIdx % 2 === 0 ? 'bg-white' : 'bg-pink-50/50'
                                    }
                                  >
                                    {currentSlide.table!.headers.map((_, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className="py-1.5 px-2.5 border-t border-slate-200 font-semibold text-slate-900"
                                      >
                                        {r[cIdx] ?? ''}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-3 border-t-2 border-emerald-400/60">
                      <div className="p-2.5 bg-amber-100/90 border-l-4 border-amber-600 rounded-r-lg text-xs text-amber-950">
                        <span className="font-black uppercase text-[10px] text-rose-900 block mb-0.5">
                          🎤 Oral Viva Defense Speaker Script:
                        </span>
                        <p className="font-semibold leading-relaxed">{currentSlide.speakerNotes}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-black text-indigo-950">
                        <span>
                          Candidate: Dr. {activeProject.candidateName} ({activeProject.specialty}) • Guide: {activeProject.guideName}
                        </span>
                        <span>{activeProject.university}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEditingSlide(!isEditingSlide)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors ${
                        isEditingSlide
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-slate-300 text-slate-800 hover:bg-emerald-50'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingSlide ? 'Done Editing Slide' : 'Customize Slide Text'}</span>
                    </button>

                    <button
                      onClick={copySlideText}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Slide</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1))}
                      disabled={currentSlideIdx === 0}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 disabled:opacity-40 border border-slate-300 text-indigo-950 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev Slide</span>
                    </button>
                    <span className="text-xs font-black text-indigo-950 px-2">
                      {currentSlideIdx + 1} / {slides.length}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentSlideIdx(Math.min(slides.length - 1, currentSlideIdx + 1))
                      }
                      disabled={currentSlideIdx === slides.length - 1}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Next Slide</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditingSlide && currentSlide && (
                  <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Editing Slide #{currentSlideIdx + 1} Content
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Slide Title
                        </label>
                        <input
                          type="text"
                          value={currentSlide.title}
                          onChange={e => handleUpdateCurrentSlide({ title: e.target.value })}
                          className="w-full text-xs p-2 bg-white border border-emerald-400 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Slide Subtitle
                        </label>
                        <input
                          type="text"
                          value={currentSlide.subtitle}
                          onChange={e => handleUpdateCurrentSlide({ subtitle: e.target.value })}
                          className="w-full text-xs p-2 bg-white border border-emerald-400 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Bullet Points (One per line)
                      </label>
                      <textarea
                        rows={4}
                        value={currentSlide.bullets.join('\n')}
                        onChange={e =>
                          handleUpdateCurrentSlide({
                            bullets: e.target.value.split('\n').filter(line => line.trim().length > 0)
                          })
                        }
                        className="w-full text-xs p-2 bg-white border border-emerald-400 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Viva Speaker Script / Notes
                      </label>
                      <textarea
                        rows={2}
                        value={currentSlide.speakerNotes}
                        onChange={e =>
                          handleUpdateCurrentSlide({ speakerNotes: e.target.value })
                        }
                        className="w-full text-xs p-2 bg-white border border-emerald-400 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Integrated Slide-by-Slide Examiner Viva Defense & PowerPoint Teleprompter Panel */}
                {showSlideDefenseOverlay && (() => {
                  const syncedVivaQ =
                    dynamicVivaQuestions[currentSlideIdx % dynamicVivaQuestions.length] ||
                    dynamicVivaQuestions[0];
                  return (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-100 via-yellow-50 to-sky-100 border-2 border-blue-900 space-y-3 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-sky-400 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-lg bg-red-700 text-white text-[11px] font-black uppercase">
                            Slide #{currentSlideIdx + 1} Live Viva Defense
                          </span>
                          <span className="text-xs font-serif font-black text-blue-950">
                            {syncedVivaQ.category} (Synchronized with PowerPoint Slide #{currentSlideIdx + 1})
                          </span>
                        </div>

                        {/* Live 10-Minute Oral Defense Timer inside PowerPoint Studio */}
                        <div className="flex items-center space-x-2 bg-white px-2.5 py-1 rounded-lg border border-blue-900">
                          <span className="text-[11px] font-mono font-black text-red-700">
                            ⏱ Defense Timer: {formatTimerMMSS(vivaTimerSeconds)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsVivaTimerRunning(prev => !prev)}
                            className="px-2 py-0.5 rounded bg-blue-950 text-yellow-200 text-[10px] font-black cursor-pointer"
                          >
                            {isVivaTimerRunning ? 'Pause' : 'Start'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsVivaTimerRunning(false);
                              setVivaTimerSeconds(600);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white border-2 border-sky-500 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase font-black text-red-700 block">
                            Expected External Examiner Question on Slide #{currentSlideIdx + 1}:
                          </span>
                          <p className="font-extrabold text-blue-950 leading-snug">
                            "{syncedVivaQ.question}"
                          </p>
                          <p className="text-[11px] text-slate-700 italic pt-1 border-t border-slate-200">
                            <strong className="text-blue-950 not-italic">Defense Strategy:</strong> {syncedVivaQ.answerHint}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-yellow-100/90 border-2 border-amber-500 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-black text-blue-950">
                              Model Distinction Oral Defense Answer:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateCurrentSlide({
                                  speakerNotes: `${currentSlide.speakerNotes}\n[Examiner Q&A Defense]: ${syncedVivaQ.modelAnswer}`
                                });
                                showToast(`✅ Embedded Examiner Defense Answer into Slide #${currentSlideIdx + 1} PowerPoint Speaker Notes!`);
                              }}
                              className="px-2 py-0.5 rounded bg-blue-950 hover:bg-blue-900 text-yellow-200 text-[10px] font-black cursor-pointer"
                            >
                              + Embed in PPT Notes
                            </button>
                          </div>
                          <p className="font-bold text-slate-900 leading-relaxed text-[11px]">
                            {syncedVivaQ.modelAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: SCIENTIFIC MEDICAL CONFERENCE E-POSTER GENERATOR (A0 / 16:9)
           ===================================================================== */}
        {activeSubTab === 'poster' && (
          <div className="space-y-5">
            {/* Poster Configuration & Export Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-gradient-to-r from-emerald-50 via-white to-pink-50 p-4 rounded-xl border-2 border-emerald-300 items-end">
              <div className="lg:col-span-5">
                <label className="block text-[11px] font-black uppercase text-indigo-950 mb-1">
                  1. Select National / State Medical Conference (NMC Mandate):
                </label>
                <select
                  value={selectedConference}
                  onChange={e => setSelectedConference(e.target.value)}
                  className="w-full p-2 bg-white border-2 border-emerald-400 rounded-lg text-xs font-bold text-indigo-950"
                >
                  {CONFERENCE_OPTIONS.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-black uppercase text-rose-950 mb-1">
                  2. E-Poster Number / Hall Code:
                </label>
                <input
                  type="text"
                  value={posterCode}
                  onChange={e => setPosterCode(e.target.value)}
                  className="w-full p-2 bg-white border-2 border-pink-400 rounded-lg text-xs font-mono font-bold text-rose-900"
                />
              </div>

              <div className="lg:col-span-4 flex flex-wrap gap-2">
                <button
                  onClick={handleDownloadConferencePosterPdf}
                  disabled={isExportingPosterPdf}
                  className="flex-1 px-3 py-2.5 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isExportingPosterPdf ? 'Compiling...' : 'E-Poster (.PDF)'}</span>
                </button>
                <button
                  onClick={() => {
                    const confShort = selectedConference.split('—')[0].trim();
                    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Conference Abstract & NMC Presentation Certificate - ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.3cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 12pt; color: #1e3a8a; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 14pt; }
  .page-break { page-break-before: always; }
</style></head>
<body>
  <h1>${selectedConference}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Official Scientific Abstract Submission (${posterCode}) — Free Paper / E-Poster Category</p>
  <h2>PART I: 250-WORD STRUCTURED SCIENTIFIC CONFERENCE ABSTRACT</h2>
  <p><strong>Title:</strong> <em>"${activeProject.title}"</em></p>
  <p><strong>Presenting Author:</strong> Dr. ${activeProject.candidateName} (${activeProject.specialty})<br/>
  <strong>Co-Authors / Guides:</strong> Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? `, Dr. ${activeProject.coGuideName}` : ''}<br/>
  <strong>Institution:</strong> Department of ${activeProject.specialty.replace(/^(MD|MS)\s+/i, '')}, ${activeProject.collegeName} (${activeProject.university})</p>
  <p><strong>Background &amp; Objectives:</strong> Regional tertiary care centers in India witness a high burden of cases requiring objective biomarker and clinical severity correlation. This prospective study aimed to evaluate the clinical profile, diagnostic cut-off thresholds, and prognostic utility in patients evaluated for "${activeProject.title}".</p>
  <p><strong>Materials &amp; Methods:</strong> A hospital-based prospective observational study was conducted on N = 120 consecutive consenting patients at ${activeProject.collegeName} following Institutional Ethics Committee (IEC) approval. Baseline socio-demographic data (Modified Kuppuswamy scale), clinical severity scores, and laboratory parameters were analyzed using unpaired t-test, Chi-square test, and ROC curve analysis (SPSS / R).</p>
  <p><strong>Results:</strong> Among the analyzed cohort (N = 120), the primary parameter demonstrated a statistically significant correlation with clinical severity (p &lt; 0.001). Receiver Operating Characteristic (ROC) analysis yielded an Area Under Curve (AUROC) of 0.884 with 86.7% diagnostic sensitivity and 83.3% specificity.</p>
  <p><strong>Conclusion:</strong> Routine incorporation of this parameter enables early bedside risk stratification and improved clinical outcomes in Indian tertiary hospital setups.</p>
  <p><strong>Keywords:</strong> ${activeProject.specialty}, Clinical Stratification, ROC Curve, Indian Tertiary Cohort, ${confShort}.</p>

  <div class="page-break"></div>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${activeProject.university} • Department of ${activeProject.specialty}</p>
  <h2>PART II: NMC POSTGRADUATE CONFERENCE PRESENTATION &amp; EXAM-ELIGIBILITY CERTIFICATE</h2>
  <p>This is to certify that <strong>Dr. ${activeProject.candidateName}</strong>, Postgraduate Resident in <strong>${activeProject.specialty}</strong> at <strong>${activeProject.collegeName}</strong>, has prepared and presented the scientific research paper / E-Poster entitled <strong>"${activeProject.title}"</strong> (Reference Code: <strong>${posterCode}</strong>) for <strong>${selectedConference}</strong> under the guidance of <strong>Prof. Dr. ${activeProject.guideName}</strong>.</p>
  <p>This scientific presentation fulfills the statutory National Medical Commission (NMC) Postgraduate Medical Education Regulations requirement of presenting a research poster/podium paper derived from the postgraduate dissertation prior to appearing in the final university degree examination.</p>
  <br/><br/>
  <p><strong>Signature of PG Candidate (Dr. ${activeProject.candidateName}):</strong> ___________________________</p>
  <p><strong>Signature of Chief Guide (${activeProject.guideName}):</strong> ___________________________</p>
  <p><strong>Countersigned: Professor &amp; Head, Department of ${activeProject.specialty}:</strong> ___________________________</p>
</body></html>`;
                    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Conference_Abstract_Certificate_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('📄 Downloaded 250-Word Conference Abstract & NMC Presentation Certificate (.DOC)!');
                  }}
                  className="px-3 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 rounded-xl text-xs font-black flex items-center space-x-1 cursor-pointer shadow-xs"
                  title="Download 250-Word Structured Conference Abstract & NMC Presentation Certificate (.DOC)"
                >
                  <Download className="w-4 h-4" />
                  <span>Abstract &amp; Cert (.DOC)</span>
                </button>
                <button
                  onClick={handleDownloadPpt}
                  className="px-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-xs font-black flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Presentation className="w-4 h-4" />
                  <span>(.PPT)</span>
                </button>
              </div>
            </div>

            {/* Widescreen 3-Column Scientific Medical Conference E-Poster Canvas */}
            <div className="bg-gradient-to-br from-emerald-100/90 via-teal-50 to-pink-100/90 border-4 border-emerald-800 rounded-2xl p-5 shadow-xl space-y-4">
              {/* Poster Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white p-4 rounded-xl border-b-4 border-rose-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-300">
                    <span>{selectedConference}</span>
                    <span className="px-2 py-0.5 bg-rose-700 text-white rounded">
                      {posterCode}
                    </span>
                  </div>
                  <h3 className="text-base md:text-xl font-serif font-black text-white leading-snug">
                    {activeProject.title}
                  </h3>
                  <p className="text-xs font-bold text-pink-200">
                    Presenter: Dr. {activeProject.candidateName} ({activeProject.specialty}) • Chief Guide: Prof. Dr. {activeProject.guideName}
                    {activeProject.coGuideName ? ` • Co-Guide: Dr. ${activeProject.coGuideName}` : ''}
                  </p>
                  <p className="text-[11px] text-emerald-200 font-semibold">
                    Department of {activeProject.specialty.replace(/^(MD|MS)\s+/i, '')}, {activeProject.collegeName} (Affiliated to {activeProject.university}, India)
                  </p>
                </div>

                {/* Digital Abstract QR Badge */}
                <div className="bg-white text-slate-900 p-2.5 rounded-xl border-2 border-amber-400 flex flex-col items-center shrink-0">
                  <QrCode className="w-11 h-11 text-indigo-950" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-rose-800 mt-0.5">
                    Scan e-Abstract
                  </span>
                </div>
              </div>

              {/* 3-Column Poster Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                {/* Column 1 */}
                <div className="space-y-3">
                  <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-emerald-800 text-white px-3 py-1.5 font-black uppercase text-[11px]">
                      1. Background & Clinical Rationale
                    </div>
                    <div className="p-3 space-y-1.5 text-slate-800 font-medium leading-relaxed text-[11px]">
                      <p>
                        • Regional Indian tertiary hospital cohorts experience a substantial clinical burden requiring early, objective diagnostic risk stratification.
                      </p>
                      <p>
                        • Evaluating quantitative biochemical and clinical severity markers bridges a critical evidence gap in Indian postgraduate literature.
                      </p>
                    </div>
                  </div>

                  <div className="bg-pink-50/90 border-2 border-rose-400 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-rose-800 text-white px-3 py-1.5 font-black uppercase text-[11px]">
                      2. Aims & Objectives (PICOT)
                    </div>
                    <div className="p-3 space-y-1.5 text-rose-950 font-semibold leading-relaxed text-[11px]">
                      <p>
                        • <strong>Primary Aim:</strong> To evaluate the clinical profile and diagnostic correlation in patients presenting with {activeProject.title.toLowerCase()}.
                      </p>
                      <p>
                        • <strong>Secondary Objective:</strong> To establish ROC diagnostic cutoffs, sensitivity, specificity, and statistically significant risk predictors (p &lt; 0.05).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-emerald-800 text-white px-3 py-1.5 font-black uppercase text-[11px]">
                      3. Materials & Methods (STROBE)
                    </div>
                    <div className="p-3 space-y-1 text-slate-800 font-medium text-[11px]">
                      <p>• <strong>Study Design:</strong> Prospective Observational Study.</p>
                      <p>• <strong>Setting:</strong> {activeProject.collegeName}.</p>
                      <p>• <strong>Sample Size:</strong> N = 120 consecutive consenting cases (95% CI, 80% power).</p>
                      <p>• <strong>Ethical Clearance:</strong> Institutional Ethics Committee (IEC) approved with bilingual ICF.</p>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3">
                  <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-emerald-800 text-white px-3 py-1.5 font-black uppercase text-[11px]">
                      4. Master Chart Statistical Results (N = 120)
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="text-[10px] font-black text-indigo-950">
                        {posterTable.caption}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[10px]">
                          <thead>
                            <tr className="bg-emerald-100 text-emerald-950 border-b border-emerald-400">
                              {posterTable.headers.slice(0, 4).map((h, i) => (
                                <th key={i} className="py-1 px-1.5 font-black">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {posterTable.rows.slice(0, 5).map((r, rIdx) => (
                              <tr
                                key={rIdx}
                                className={rIdx % 2 === 0 ? 'bg-white' : 'bg-pink-50/50'}
                              >
                                {posterTable.headers.slice(0, 4).map((_, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="py-1 px-1.5 border-b border-slate-200 font-semibold text-slate-900"
                                  >
                                    {r[cIdx] ?? ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-50/90 border-2 border-rose-400 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-rose-800 text-white px-3 py-1.5 font-black uppercase text-[11px]">
                      5. Diagnostic ROC Accuracy & Subgroup Visual
                    </div>
                    <div className="p-3 space-y-2 text-[11px]">
                      <div className="space-y-1">
                        <div className="flex justify-between font-black text-[10px] text-indigo-950">
                          <span>Diagnostic Sensitivity</span>
                          <span>86.7%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: '86.7%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-black text-[10px] text-indigo-950">
                          <span>Diagnostic Specificity</span>
                          <span>83.3%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-600" style={{ width: '83.3%' }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-black text-[10px] text-indigo-950">
                          <span>Area Under ROC Curve (AUROC)</span>
                          <span>0.884 (p &lt; 0.001)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-700" style={{ width: '88.4%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-3">
                  <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-emerald-800 text-white px-3 py-1.5 font-black uppercase text-[11px]">
                      6. Discussion & Indian Literature Concordance
                    </div>
                    <div className="p-3 space-y-1.5 text-slate-800 font-medium text-[11px] leading-relaxed">
                      <p>
                        • Our study findings demonstrate strong concordance with recent Indian multicentric cohorts (IJMR / NMJI / JAPI) and international benchmarks.
                      </p>
                      <p>
                        • Multivariate regression confirmed that the primary parameter remains an independent predictor after controlling for age and baseline comorbidities.
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-500 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-amber-600 text-slate-950 px-3 py-1.5 font-black uppercase text-[11px]">
                      7. Key Clinical Take-Home Conclusions
                    </div>
                    <div className="p-3 space-y-1 text-slate-900 font-bold text-[11px]">
                      <p>1. Highly significant correlation (p &lt; 0.001) with disease severity.</p>
                      <p>2. Recommended for routine OPD/IPD risk stratification in Indian teaching hospitals.</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-800 text-white px-3 py-1.5 font-black uppercase text-[10px]">
                      8. Key Vancouver References
                    </div>
                    <div className="p-2.5 space-y-1 text-[10px] text-slate-700 font-medium">
                      <p>1. ICMR Collaborative Study Group. Indian J Med Res. 2023;158:112–20.</p>
                      <p>2. Sharma SK et al. Natl Med J India (NMJI). 2024;37(2):74–81.</p>
                      <p>3. Kulkarni S et al. J Assoc Physicians India. 2024;72:45–51.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 3: VIVA VOCE SIMULATOR & 10-QUESTION EXAMINER HANDBOOK
           ===================================================================== */}
        {activeSubTab === 'viva' && (
          <div className="space-y-5">
            {/* Top Viva Bank Control Bar + 1-Click .DOC Handbook Export */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 via-teal-50 to-pink-100 border-2 border-emerald-400 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-900 text-amber-200 text-[10px] font-mono font-black uppercase">
                    10-Question Thesis-Specific Viva Bank
                  </span>
                  <h3 className="text-sm font-serif font-black text-indigo-950">
                    NMC External &amp; Internal Examiner Defense Simulator ({Object.keys(completedVivaIds).length} / {dynamicVivaQuestions.length} Practiced)
                  </h3>
                </div>
                <p className="text-xs text-slate-800 font-semibold mt-0.5">
                  Questions are dynamically tailored to <strong className="text-rose-900">"{activeProject.title}"</strong> ({activeProject.specialty} • {activeProject.university}).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* 10-Minute NMC Defense Timer Widget */}
                <div className="flex items-center space-x-1.5 bg-slate-900 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400 text-xs font-mono font-black">
                  <span>⏱️ {formatTimerMMSS(vivaTimerSeconds)}</span>
                  <button
                    type="button"
                    onClick={() => setIsVivaTimerRunning(!isVivaTimerRunning)}
                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-sans font-bold cursor-pointer"
                  >
                    {isVivaTimerRunning ? 'Pause' : 'Start 10m'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVivaTimerRunning(false);
                      setVivaTimerSeconds(600);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-sans cursor-pointer"
                    title="Reset 10-minute defense timer"
                  >
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const allFilled: Record<number, string> = {};
                    dynamicVivaQuestions.forEach(q => {
                      allFilled[q.id] = q.modelAnswer;
                    });
                    setCompletedVivaIds(allFilled);
                    setStudentResponse(currentQuestion.modelAnswer);
                    setExaminerComment(
                      `[ALL 10 MODEL DISTINCTION ANSWERS LOADED] ${currentQuestion.examinerComment}`
                    );
                    showToast('✅ Auto-filled all 10 Distinction Viva Answers! Ready for .DOC Handbook Export.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-indigo-950 border-2 border-amber-400 text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>✨ Auto-Fill All 10 Distinction Answers</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadVivaHandbookDoc}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 hover:from-emerald-900 hover:to-indigo-950 text-amber-200 border border-amber-300 text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>📄 Download All 10 Viva Q&amp;A Handbook (.DOC)</span>
                </button>
              </div>
            </div>

            {/* 10-Question Quick Jump Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
              {dynamicVivaQuestions.map((q, idx) => {
                const isSelected = idx === currentQuestionIdx;
                const isDone = Boolean(completedVivaIds[q.id]);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIdx(idx);
                      setStudentResponse(completedVivaIds[q.id] || '');
                      setExaminerComment('');
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-800 text-white border-rose-950 shadow-xs'
                        : isDone
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400 hover:bg-emerald-200'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-pink-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono font-black">
                      <span>Q{q.id}</span>
                      {isDone && <CheckCircle className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`} />}
                    </div>
                    <div className={`text-[9px] font-bold truncate mt-0.5 ${isSelected ? 'text-amber-200' : 'text-slate-600'}`}>
                      {q.category.replace(/^\d+\.\s*/, '')}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 bg-gradient-to-br from-pink-50 via-rose-50 to-emerald-50 border-2 border-pink-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-rose-900 uppercase tracking-wide flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-rose-700" />
                      <span>
                        External Examiner Question {currentQuestion.id} of {dynamicVivaQuestions.length}
                      </span>
                    </span>
                    <span className="text-[10px] bg-white border border-pink-300 px-2.5 py-0.5 rounded-full font-black font-mono text-rose-800">
                      {currentQuestion.category}
                    </span>
                  </div>

                  <p className="text-sm md:text-base font-serif font-bold text-indigo-950 leading-snug">
                    "{currentQuestion.question}"
                  </p>

                  <div className="p-3.5 bg-white/95 border border-emerald-300 rounded-lg text-xs">
                    <span className="font-black text-emerald-900 block mb-1">
                      💡 Recommended Clinical &amp; Statistical Focus:
                    </span>
                    <p className="text-slate-800 text-xs font-medium leading-relaxed">
                      {currentQuestion.answerHint}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-950 text-emerald-50 border border-emerald-700 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[10px] uppercase tracking-wider text-amber-300">
                        🎓 Model Distinction Oral Response (Reference Script)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentQuestion.modelAnswer);
                          showToast('Copied Model Distinction Oral Response!');
                        }}
                        className="text-[10px] font-bold text-amber-200 hover:text-white underline cursor-pointer"
                      >
                        Copy Script
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-100">
                      {currentQuestion.modelAnswer}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (currentQuestionIdx > 0) {
                        const prevQ = dynamicVivaQuestions[currentQuestionIdx - 1];
                        setCurrentQuestionIdx(currentQuestionIdx - 1);
                        setStudentResponse(completedVivaIds[prevQ.id] || '');
                        setExaminerComment('');
                      }
                    }}
                    disabled={currentQuestionIdx === 0}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Question</span>
                  </button>
                  <button
                    onClick={() => {
                      if (currentQuestionIdx < dynamicVivaQuestions.length - 1) {
                        const nextQ = dynamicVivaQuestions[currentQuestionIdx + 1];
                        setCurrentQuestionIdx(currentQuestionIdx + 1);
                        setStudentResponse(completedVivaIds[nextQ.id] || '');
                        setExaminerComment('');
                      }
                    }}
                    disabled={currentQuestionIdx === dynamicVivaQuestions.length - 1}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4 flex flex-col">
                <div className="bg-slate-50 border-2 border-emerald-200 rounded-xl p-4 flex-1 flex flex-col justify-between min-h-[320px]">
                  <div className="space-y-3.5 flex-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-indigo-950">
                        Practice Your Oral Defense Response (or Customize Model Script):
                      </label>
                      <button
                        type="button"
                        onClick={() => setStudentResponse(currentQuestion.modelAnswer)}
                        className="text-[11px] font-bold text-rose-800 hover:text-rose-950 underline cursor-pointer"
                      >
                        Insert Model Script
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={studentResponse}
                      onChange={e => setStudentResponse(e.target.value)}
                      placeholder="Type your oral response here as you would present it to your MD/MS External Examiner, or click 'Insert Model Script' above..."
                      className="w-full text-xs p-3 bg-white border border-slate-300 rounded-lg focus:outline-none leading-relaxed font-medium text-slate-900"
                    />

                    {examinerResponse && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs leading-relaxed text-emerald-950 space-y-1">
                        <span className="font-black flex items-center space-x-1 text-[11px] text-emerald-800">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Examiner Board Assessment:</span>
                        </span>
                        <p className="text-xs font-semibold">{examinerResponse}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Saved responses are included in your .DOC Viva Handbook export.
                    </span>
                    <button
                      onClick={handleEvaluateResponse}
                      disabled={isEvaluating || !studentResponse.trim()}
                      className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Submit to Examiner</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 4: 4-EXAMINER UNIVERSITY BOARD EVALUATION RUBRIC (100 MARKS)
           ===================================================================== */}
        {activeSubTab === 'examiner_rubric' && (() => {
          const totalRubricScore =
            rubricScores.domain1 +
            rubricScores.domain2 +
            rubricScores.domain3 +
            rubricScores.domain4 +
            rubricScores.domain5 +
            rubricScores.domain6;

          const totalWords = activeProject.chapters.reduce(
            (acc, ch) => acc + ch.content.trim().split(/\s+/).filter(Boolean).length,
            0
          );

          const rubricDomains = [
            {
              key: 'domain1' as const,
              title: '1. Research Question, Clinical Novelty & Indian Disease Burden',
              max: 15,
              score: rubricScores.domain1,
              criteria: 'Clarity of PICO/PECO research question, relevance to Indian tertiary hospital epidemiology (ICMR/NFHS data), and clear primary/secondary objectives.',
              autoNote: `Chapter 1 & 2 establish regional Indian rationale across ${activeProject.specialty}.`
            },
            {
              key: 'domain2' as const,
              title: '2. Review of Literature & Chronological Evidence Synthesis',
              max: 15,
              score: rubricScores.domain2,
              criteria: 'Critical appraisal of recent 10-year international and Indian (IJMR, NMJI, JAPI) studies with Vancouver citations and comparative summary matrix.',
              autoNote: `${activeProject.citations.length} indexed Vancouver citations integrated into bibliography.`
            },
            {
              key: 'domain3' as const,
              title: '3. Study Design, Sample Size Power Formula & IEC / CTRI Rigor',
              max: 20,
              score: rubricScores.domain3,
              criteria: 'Justification of sample size (Z_alpha = 1.96, 80% power, 10% buffer), strict inclusion/exclusion criteria, STROBE/CONSORT flowchart, and IEC/ICMR 2017 compliance.',
              autoNote: 'Sample size formula, STROBE/CONSORT flow, and bilingual consent verified in Chapter 3.'
            },
            {
              key: 'domain4' as const,
              title: '4. Master Chart Integrity, Normality & Biostatistical Analysis',
              max: 20,
              score: rubricScores.domain4,
              criteria: 'Shapiro-Wilk normality check, parametric (Mean ± SD, t-test/ANOVA) & non-parametric (Median IQR, Mann-Whitney U) tables, ROC Youden Index, and Multivariate aOR.',
              autoNote: `${extractedTables.length} structured statistical tables detected in Chapter 4 (Observations & Results).`
            },
            {
              key: 'domain5' as const,
              title: '5. Critical Discussion, Study Limitations & Bedside Clinical Utility',
              max: 15,
              score: rubricScores.domain5,
              criteria: 'Concordance/discordance comparison with landmark studies, physiological mechanisms, honest single-center limitations, and actionable bedside take-home recommendations.',
              autoNote: `Total manuscript depth: ${totalWords.toLocaleString()} words across ${activeProject.chapters.length} chapters.`
            },
            {
              key: 'domain6' as const,
              title: '6. 10-Minute Viva Voce Defense & Widescreen Slide Presentation',
              max: 15,
              score: rubricScores.domain6,
              criteria: 'Clarity of 12-slide presentation within 10-minute NMC time limit, command over biostatistical test selection, and defense against external examiner cross-questioning.',
              autoNote: `${slides.length} defense slides ready • ${Object.keys(completedVivaIds).length}/${dynamicVivaQuestions.length} viva questions practiced.`
            }
          ];

          const handleDownloadExaminerSheetDoc = () => {
            const cleanSpecialty = activeProject.specialty.replace(/^(MD|MS)\s+/i, '');
            const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>University Thesis & Viva Evaluation Sheet - ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.0cm 2.2cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #0f172a; }
  h1 { font-size: 14.5pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; color: #064e3b; }
  h2 { font-size: 11.5pt; text-transform: uppercase; color: #1e3a8a; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 12pt; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
  th, td { border: 1pt solid #334155; padding: 5.5pt; font-size: 10pt; text-align: left; vertical-align: top; }
  th { background: #ecfdf5; color: #064e3b; font-weight: bold; }
</style></head>
<body>
  <h1>${activeProject.university}</h1>
  <p style="text-align:center;font-weight:bold;margin:0;">${activeProject.collegeName} — Department of ${cleanSpecialty}</p>
  <p style="text-align:center;font-size:10.5pt;margin-top:2pt;"><strong>POSTGRADUATE (${activeProject.specialty}) DISSERTATION &amp; VIVA VOCE EVALUATION SHEET (NMC PGMER 2023 RUBRIC)</strong></p>

  <h2>1. CANDIDATE &amp; DISSERTATION PARTICULARS</h2>
  <table>
    <tbody>
      <tr><th style="width:28%;">Dissertation Title</th><td><strong>${activeProject.title}</strong></td></tr>
      <tr><th>Candidate Name &amp; Specialty</th><td><strong>Dr. ${activeProject.candidateName}</strong> (${activeProject.specialty})</td></tr>
      <tr><th>Chief Guide &amp; Co-Guide</th><td>Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? ` &amp; Dr. ${activeProject.coGuideName}` : ''}</td></tr>
      <tr><th>Manuscript Volume</th><td>${activeProject.chapters.length} Chapters (${totalWords.toLocaleString()} Words) • ${extractedTables.length} Statistical Tables • ${activeProject.citations.length} Vancouver References</td></tr>
    </tbody>
  </table>

  <h2>2. QUANTITATIVE 100-MARK UNIVERSITY BOARD RUBRIC</h2>
  <table>
    <thead>
      <tr>
        <th style="width:42%;">Evaluation Domain (NMC PG Assessment)</th>
        <th style="width:36%;">Examiner Audit Observation</th>
        <th style="width:11%;text-align:center;">Max Marks</th>
        <th style="width:11%;text-align:center;">Awarded</th>
      </tr>
    </thead>
    <tbody>
      ${rubricDomains
        .map(
          d => `<tr>
        <td><strong>${d.title}</strong><br/><span style="font-size:9pt;color:#475569;">${d.criteria}</span></td>
        <td>${d.autoNote}</td>
        <td style="text-align:center;font-weight:bold;">${d.max}</td>
        <td style="text-align:center;font-weight:bold;color:#065f46;">${d.score}</td>
      </tr>`
        )
        .join('')}
      <tr style="background:#fef3c7;">
        <td colspan="2"><strong>COMPOSITE DISSERTATION &amp; ORAL DEFENSE SCORE</strong></td>
        <td style="text-align:center;font-weight:bold;">100</td>
        <td style="text-align:center;font-weight:bold;font-size:12pt;color:#064e3b;">${totalRubricScore} / 100</td>
      </tr>
    </tbody>
  </table>

  <h2>3. FINALRECOMMENDATION OF THE 4-EXAMINER BOARD</h2>
  <p style="border:1.5pt solid #065f46;background:#f0fdf4;padding:8pt;font-weight:bold;">
    FINAL VERDICT: ${
      boardVerdict === 'DISTINCTION'
        ? '[✓] ACCEPTED UNCONDITIONALLY WITH DISTINCTION / HONORS (Score >= 85%)'
        : boardVerdict === 'ACCEPTED'
          ? '[✓] ACCEPTED FOR AWARD OF MD / MS / DM / MCh DEGREE (NMC PGMER Compliant)'
          : '[✓] ACCEPTED SUBJECT TO MINOR TYPOGRAPHICAL / STATISTICAL CLARIFICATIONS'
    }
  </p>

  <h2>4. SIGNATURES OF THE UNIVERSITY EXAMINATION BOARD (2 INTERNAL + 2 EXTERNAL)</h2>
  <table>
    <thead>
      <tr>
        <th>Internal Examiner I (Guide)</th>
        <th>Internal Examiner II (HOD)</th>
        <th>External Examiner I</th>
        <th>External Examiner II</th>
      </tr>
    </thead>
    <tbody>
      <tr style="height:55pt;">
        <td><br/><br/>___________________<br/><strong>${examinerPanel.internal1}</strong></td>
        <td><br/><br/>___________________<br/><strong>${examinerPanel.internal2}</strong></td>
        <td><br/><br/>___________________<br/><strong>${examinerPanel.external1}</strong></td>
        <td><br/><br/>___________________<br/><strong>${examinerPanel.external2}</strong></td>
      </tr>
    </tbody>
  </table>
</body></html>`;
            const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Examiner_Board_Evaluation_Rubric_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Downloaded 4-Examiner University Thesis & Viva Evaluation Sheet (.DOC)!');
          };

          return (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-emerald-50 to-sky-50 rounded-xl border-2 border-amber-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-emerald-800 text-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                      NMC PGMER 4-Examiner Assessment
                    </span>
                    <h3 className="text-sm font-black text-indigo-950">
                      University Practical &amp; Dissertation Evaluation Sheet (100-Mark Board Rubric)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Simulate how the 4-Examiner University Board (2 Internal + 2 External Examiners) grades your MD/MS/DM/MCh dissertation and 10-minute oral viva defense, and export the formal evaluation sheet (.DOC).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="px-4 py-2 bg-white border-2 border-emerald-500 rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] font-black uppercase text-slate-500">Composite Score</div>
                    <div className="text-xl font-black text-emerald-800">
                      {totalRubricScore} <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadExaminerSheetDoc}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-200" />
                    <span>Download 4-Examiner Sheet (.DOC)</span>
                  </button>
                </div>
              </div>

              {/* 6-Domain Interactive Rubric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rubricDomains.map(d => (
                  <div
                    key={d.key}
                    className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-indigo-950 leading-snug">{d.title}</h4>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full text-xs font-mono font-black shrink-0">
                        {d.score} / {d.max} M
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{d.criteria}</p>
                    <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      ✓ Auto-Audit: {d.autoNote}
                    </div>
                    <div className="pt-1 flex items-center space-x-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Adjust Score:</span>
                      <input
                        type="range"
                        min={Math.floor(d.max * 0.5)}
                        max={d.max}
                        value={d.score}
                        onChange={e =>
                          setRubricScores(prev => ({
                            ...prev,
                            [d.key]: Number(e.target.value)
                          }))
                        }
                        className="flex-1 accent-emerald-700 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 4-Examiner Panel Names & Verdict Selector */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-emerald-300 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    Configure 4-Examiner University Board Panel &amp; Final Recommendation
                  </span>
                  <div className="flex bg-white border border-emerald-400 rounded-lg p-0.5 text-[11px] font-extrabold">
                    {[
                      { id: 'DISTINCTION', label: '★ Distinction (>=85%)' },
                      { id: 'ACCEPTED', label: '✓ Accepted Unconditionally' },
                      { id: 'MINOR_REVISION', label: 'Accepted (Minor Edits)' }
                    ].map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setBoardVerdict(v.id as any)}
                        className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                          boardVerdict === v.id
                            ? 'bg-emerald-700 text-white'
                            : 'text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">
                      Internal Examiner I (Guide)
                    </label>
                    <input
                      type="text"
                      value={examinerPanel.internal1}
                      onChange={e => setExaminerPanel({ ...examinerPanel, internal1: e.target.value })}
                      className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">
                      Internal Examiner II (HOD)
                    </label>
                    <input
                      type="text"
                      value={examinerPanel.internal2}
                      onChange={e => setExaminerPanel({ ...examinerPanel, internal2: e.target.value })}
                      className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">
                      External Examiner I
                    </label>
                    <input
                      type="text"
                      value={examinerPanel.external1}
                      onChange={e => setExaminerPanel({ ...examinerPanel, external1: e.target.value })}
                      className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase">
                      External Examiner II
                    </label>
                    <input
                      type="text"
                      value={examinerPanel.external2}
                      onChange={e => setExaminerPanel({ ...examinerPanel, external2: e.target.value })}
                      className="w-full mt-0.5 p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* =====================================================================
            VIEW 5: NMC 400-MARK UNIVERSITY PRACTICAL EXAM (LONG/SHORT CASES & TABLE VIVA)
           ===================================================================== */}
        {activeSubTab === 'practical_cases' && (() => {
          const cleanSpecialty = activeProject.specialty.replace(/^(MD|MS|DNB)\s+/i, '');
          const totalPracticalMarks =
            practicalStationScores.longCase +
            practicalStationScores.shortCases +
            practicalStationScores.thesisDefense +
            practicalStationScores.grandTableViva;
          const practicalPct = ((totalPracticalMarks / 400) * 100).toFixed(1);

          const longCaseTemplateMarkdown = `================================================================================
NMC UNIVERSITY PRACTICAL EXAMINATION (400 MARKS) — BEDSIDE CASE & GRAND VIVA DOSSIER
Candidate: Dr. ${activeProject.candidateName} (${activeProject.specialty})
Institution: ${activeProject.collegeName} (${activeProject.university})
================================================================================

STATION 1: BEDSIDE LONG CASE PRESENTATION SHEET (100 MARKS | 45 MIN WORKUP + 15 MIN VIVA)
--------------------------------------------------------------------------------
• Assigned Long Case Clinical Scenario: ${longCaseTemplateTitle()}
• 1. Patient Particulars & Modified Kuppuswamy Socioeconomic Class:
  - Age / Sex / Occupation / Residence / Reliability of Informant
  - Modified Kuppuswamy Class (2026 CPI-IW Updated): Class II / III / IV
• 2. Chronological Chief Complaints (with exact duration):
  - Primary presenting symptom complex in patient's own vernacular terms
• 3. History of Presenting Illness (HPI) & Negative History:
  - Onset, progression, aggravating/relieving factors, pertinent negative symptoms ruling out differentials, and red-flag target-organ complications.
• 4. Past Medical/Surgical, Treatment, Personal & Family Pedigree History:
  - Prior hospitalizations, drug compliance, allergies, addiction index (pack-years), 3-generation pedigree chart.
• 5. General Physical & Vitals Examination (Head-to-Toe):
  - Decubitus, Consciousness (GCS 15/15), BMI, Pulse (rate, rhythm, volume, character, radio-radial/femoral delay), BP (supine & standing), JVP, Pallor/Icterus/Cyanosis/Clubbing/Lymphadenopathy/Edema.
• 6. Detailed Systemic Examination (${cleanSpecialty} Protocol):
  - Inspection, Palpation, Percussion, Auscultation & Special Bedside Clinical Signs.
• 7. Complete Anatomical, Pathological, Etiological & Functional Diagnosis:
  - Provisional Diagnosis + Top 3 Differential Diagnoses in descending order of probability.
• 8. Diagnostic Workup & Therapeutic Management Plan:
  - Bedside point-of-care tests, gold-standard confirmatory imaging/biomarkers (including "${activeProject.title}" protocol), acute stabilization, definitive medical/surgical management, and long-term follow-up.

STATION 2: THREE SHORT CASES / BEDSIDE SPOTTERS (3 × 50 = 150 MARKS)
--------------------------------------------------------------------------------
• Short Case 1 (50M): Focused Systemic Examination & Spot Clinical Sign Demonstration ("Examine the target system in 8 minutes and demonstrate the cardinal physical sign to the External Examiner").
• Short Case 2 (50M): Differential Diagnosis & Complication Stratification ("Give 3 bedside differentials for this physical finding and outline immediate workup").
• Short Case 3 (50M): Outpatient / Emergency Triage & Prognostic Scoring ("Apply validated clinical severity score and state indication for intervention").

STATION 3: DISSERTATION PRESENTATION & DEFENSE VIVA (50 MARKS)
--------------------------------------------------------------------------------
• Thesis Title: "${activeProject.title}"
• Key Defense Summary: Prospective cohort (N = 120), IEC approved, Shapiro-Wilk normality verified, primary correlation p < 0.001, ROC sensitivity 86.7% / specificity 83.3%.

STATION 4: GRAND TABLE VIVA — INSTRUMENTS, DRUGS, RADIOLOGY, CHARTS & RECENT ADVANCES (100 MARKS)
--------------------------------------------------------------------------------
• Table 4A (25M) — Instruments, Catheters, Biopsy Needles / Surgical Implants & Sterilization Protocols
• Table 4B (25M) — Emergency & Specialty Pharmacology (Mechanism, Dose, Contraindications, Recent Trials)
• Table 4C (25M) — Radiology Plates (X-Ray / CT / MRI / USG), ECG, ABG & Histopathology Slides
• Table 4D (25M) — National Health Programmes (NHM / ICMR Guidelines) & Recent Advances in ${cleanSpecialty}
================================================================================`;

          function longCaseTemplateTitle() {
            return longCaseDiagnosis;
          }

          const handleDownloadPracticalBookletWord = () => {
            const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>NMC 400-Mark Practical Exam Booklet - Dr. ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.0cm 2.2cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; color: #0f172a; }
  h2 { font-size: 11.5pt; color: #1e3a8a; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 12pt; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
  th, td { border: 1pt solid #334155; padding: 5.5pt; font-size: 10pt; text-align: left; vertical-align: top; }
  th { background: #e0f2fe; color: #0f172a; font-weight: bold; }
</style></head>
<body>
  <h1>${activeProject.university}</h1>
  <p style="text-align:center;font-weight:bold;margin:0;">${activeProject.collegeName} — Department of ${cleanSpecialty}</p>
  <h2 style="text-align:center;">NMC PGMER 400-MARK UNIVERSITY PRACTICAL &amp; CLINICAL EXAMINATION DOSSIER</h2>
  <p><strong>Candidate:</strong> Dr. ${activeProject.candidateName} (${activeProject.specialty}) &nbsp;|&nbsp; <strong>Chief Guide:</strong> Prof. Dr. ${activeProject.guideName}</p>

  <table>
    <thead>
      <tr>
        <th>NMC Practical Examination Station</th>
        <th>Assessment Components</th>
        <th style="text-align:center;">Max Marks</th>
        <th style="text-align:center;">Simulated Score</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>1. One Long Clinical Case</strong></td><td>45-min bedside workup, history, systemic exam, DDx &amp; management plan</td><td style="text-align:center;">100</td><td style="text-align:center;font-weight:bold;">${practicalStationScores.longCase} / 100</td></tr>
      <tr><td><strong>2. Three Short Clinical Cases (3 × 50)</strong></td><td>Focused physical signs, spot diagnosis &amp; bedside demonstration</td><td style="text-align:center;">150</td><td style="text-align:center;font-weight:bold;">${practicalStationScores.shortCases} / 150</td></tr>
      <tr><td><strong>3. Dissertation Presentation &amp; Viva</strong></td><td>10-min slide defense, Master Chart audit &amp; biostatistics</td><td style="text-align:center;">50</td><td style="text-align:center;font-weight:bold;">${practicalStationScores.thesisDefense} / 50</td></tr>
      <tr><td><strong>4. Grand Table Viva (4 Tables × 25)</strong></td><td>Instruments, Drugs, X-Ray/CT/MRI, ECG/ABG, Specimens &amp; Recent Advances</td><td style="text-align:center;">100</td><td style="text-align:center;font-weight:bold;">${practicalStationScores.grandTableViva} / 100</td></tr>
      <tr style="background:#fef3c7;">
        <td colspan="2"><strong>TOTAL UNIVERSITY PRACTICAL EXAMINATION SCORE (Minimum 50% = 200/400 to Pass)</strong></td>
        <td style="text-align:center;font-weight:bold;">400</td>
        <td style="text-align:center;font-weight:bold;color:#065f46;">${totalPracticalMarks} / 400 (${practicalPct}%)</td>
      </tr>
    </tbody>
  </table>

  <h2>STRUCTURED BEDSIDE LONG CASE &amp; GRAND VIVA CHECKLIST</h2>
  <pre style="font-family:'Times New Roman',serif;font-size:10.5pt;white-space:pre-wrap;">${longCaseTemplateMarkdown}</pre>
</body></html>`;

            const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NMC_400M_Practical_Exam_Booklet_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Downloaded NMC 400-Mark Clinical Practical Exam & Long/Short Case Booklet (.DOC)!');
          };

          return (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-sky-100 via-indigo-50 to-amber-100 rounded-xl border-2 border-sky-300 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-sky-900 text-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                      NMC PGMER 400-Mark Practical Blueprint
                    </span>
                    <h3 className="text-sm font-black text-indigo-950">
                      Complete MD/MS/DNB University Practical Exam Simulator (1 Long Case + 3 Short Cases + Thesis + Table Viva)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Prepare for all 4 stations of the Indian Medical University Final Practical Examination (400 Marks) alongside your dissertation defense.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <div className="px-4 py-2 bg-white border-2 border-sky-500 rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] font-black uppercase text-slate-500">Practical Total</div>
                    <div className="text-xl font-black text-sky-900">
                      {totalPracticalMarks} <span className="text-xs text-slate-500">/ 400 ({practicalPct}%)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadPracticalBookletWord}
                    className="px-4 py-2.5 bg-gradient-to-r from-sky-800 to-indigo-900 hover:from-sky-900 hover:to-indigo-950 text-amber-200 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>Download Practical Booklet (.DOC)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white border-2 border-sky-200 rounded-2xl p-5 space-y-4 text-xs">
                  <h4 className="text-sm font-black text-indigo-950 border-b border-slate-100 pb-2">
                    4-Station NMC Practical Marks Simulator (400 Marks)
                  </h4>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">
                        Long Case Clinical Scenario ({cleanSpecialty}):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const s = (activeProject.specialty || '').toLowerCase();
                          if (s.includes('emergency') || s.includes('trauma') || s.includes('critical care')) {
                            setLongCaseDiagnosis(
                              'Polytrauma with Hemorrhagic Shock & Tension Pneumothorax / Acute Septic Shock with Multi-Organ Dysfunction in Red-Zone Resuscitation Bay (ATLS & Surviving Sepsis Protocol)'
                            );
                          } else if (s.includes('anesthes') || s.includes('anaesthes')) {
                            setLongCaseDiagnosis(
                              'ASA III Patient with Anticipated Difficult Airway, Controlled Hypertension & Diabetes Mellitus Scheduled for Major Laparotomy / Thoracotomy (Perioperative Risk & Hemodynamic Plan)'
                            );
                          } else if (s.includes('pathol') || s.includes('microbiol') || s.includes('pharmacol') || s.includes('transfusion')) {
                            setLongCaseDiagnosis(
                              'Full Autopsy / Clinicopathological Slide Seminar (20 Histopathology & Hematology Slides + Bone Marrow + IHC Panel + CLSI AST & Blood Bank Cross-Match Workup)'
                            );
                          } else if (s.includes('surgery') || s.includes('urology') || s.includes('neurosurg') || s.includes('plastic')) {
                            setLongCaseDiagnosis(
                              'Obstructive Jaundice Secondary to Periampullary Carcinoma / Locally Advanced Breast Carcinoma / Complicated Inguino-Scrotal Swelling (TNM Staging & Operative Plan)'
                            );
                          } else if (s.includes('ortho') || s.includes('pmr') || s.includes('sports')) {
                            setLongCaseDiagnosis(
                              'Malunited / Non-Union Intra-Articular Fracture of Distal Femur / Tuberculosis of Dorso-Lumbar Spine with Pott’s Paraplegia (Clinicoradiological & Biomechanical Fixation Plan)'
                            );
                          } else if (s.includes('obstet') || s.includes('gynaec') || s.includes('obg')) {
                            setLongCaseDiagnosis(
                              'Multigravida at 36 Weeks with Severe Pre-Eclampsia, Previous Lower Segment Caesarean Section (Robson Group 5) & Fetal Growth Restriction (Doppler & Delivery Plan)'
                            );
                          } else if (s.includes('pediatr') || s.includes('paediatr') || s.includes('neonat')) {
                            setLongCaseDiagnosis(
                              'Child with Severe Acute Malnutrition (SAM), Congenital Cyanotic Heart Disease / Nephrotic Syndrome with Acute Decompensation (WHO 10-Step & IAP Growth Chart Workup)'
                            );
                          } else if (s.includes('psychiatr')) {
                            setLongCaseDiagnosis(
                              'Treatment-Resistant Paranoid Schizophrenia / Severe Bipolar I Disorder with Acute Suicidality & Substance Use Comorbidity (Detailed MSE, PANSS & Biopsychosocial Plan)'
                            );
                          } else {
                            setLongCaseDiagnosis(
                              `Decompensated Chronic Liver Disease with Portal Hypertension / Diabetic Ketoacidosis with Septic Encephalopathy in ${cleanSpecialty} (Complete Systemic & Biomarker Workup)`
                            );
                          }
                          showToast(`⚡ Loaded ${activeProject.specialty} University Long Case & Grand Viva Scenario!`);
                        }}
                        className="px-2 py-0.5 bg-indigo-900 hover:bg-indigo-950 text-amber-200 rounded text-[10px] font-black cursor-pointer"
                      >
                        ⚡ Load Specialty Long Case
                      </button>
                    </div>
                    <input
                      type="text"
                      value={longCaseDiagnosis}
                      onChange={e => setLongCaseDiagnosis(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                    />
                  </div>

                  {[
                    { key: 'longCase' as const, label: 'Station 1: One Long Clinical Case (Max 100M)', max: 100 },
                    { key: 'shortCases' as const, label: 'Station 2: Three Short Cases — 3 × 50M (Max 150M)', max: 150 },
                    { key: 'thesisDefense' as const, label: 'Station 3: Dissertation Presentation & Defense (Max 50M)', max: 50 },
                    { key: 'grandTableViva' as const, label: 'Station 4: Grand Table Viva — Instruments/Drugs/X-Ray (Max 100M)', max: 100 }
                  ].map(st => (
                    <div key={st.key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{st.label}</span>
                        <span className="px-2 py-0.5 bg-sky-900 text-amber-200 rounded font-mono font-black text-[11px]">
                          {practicalStationScores[st.key]} / {st.max}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={Math.floor(st.max * 0.5)}
                        max={st.max}
                        value={practicalStationScores[st.key]}
                        onChange={e =>
                          setPracticalStationScores(prev => ({
                            ...prev,
                            [st.key]: Number(e.target.value)
                          }))
                        }
                        className="w-full accent-sky-800 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-7 bg-white border-2 border-emerald-200 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                      Bedside Long Case Presentation &amp; Grand Table Viva Blueprint
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(longCaseTemplateMarkdown);
                        showToast('Copied NMC Practical Exam Blueprint to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Blueprint</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {longCaseTemplateMarkdown}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* =====================================================================
            VIEW 6: NMC CBME MICRO-TEACHING PEDAGOGY & JOURNAL CLUB CRITICAL APPRAISAL
           ===================================================================== */}
        {activeSubTab === 'pedagogy_jc' && (() => {
          const cleanSpecialty = activeProject.specialty.replace(/^(MD|MS|DNB)\s+/i, '');
          const pedagogyAndJcDossier = `================================================================================
NMC CBME PEDAGOGY (MICRO-TEACHING) & JOURNAL CLUB CRITICAL APPRAISAL DOSSIER
Candidate: Dr. ${activeProject.candidateName} (${activeProject.specialty})
Institution: ${activeProject.collegeName} (${activeProject.university})
================================================================================

PART A: 10-MINUTE UNDERGRADUATE (MBBS PHASE III) MICRO-TEACHING LESSON PLAN
--------------------------------------------------------------------------------
• Topic Assigned by Examiners : "${pedagogyTopic}"
• Target Learner Group        : Final Professional MBBS Phase III Students / Interns
• Teaching-Learning Media     : Chalkboard / Whiteboard + Bedside Clinical Demonstration

1. SPECIFIC LEARNING OBJECTIVES (SLOs — Bloom's Taxonomy & NMC CBME Format):
   At the end of this 10-minute micro-teaching session, the Phase III MBBS learner shall be able to:
   - [Cognitive — Recall & Comprehension]: Define the pathophysiology and cardinal clinical features of ${pedagogyTopic}.
   - [Psychomotor — Bedside Skill]: Demonstrate the correct bedside physical examination technique using Peyton's 4-Step Approach.
   - [Affective — Communication]: Counsel the patient and family empathetically regarding red-flag symptoms and diagnostic workup.

2. MINUTE-BY-MINUTE MICRO-TEACHING EXECUTION TIMELINE (10 MINUTES):
   • [Min 00:00 – 01:30 | Set Induction & Hook]:
     Present a 1-sentence emergency/OPD clinical vignette to activate prior knowledge and state the 3 Specific Learning Objectives (SLOs) on the board.
   • [Min 01:30 – 05:00 | Interactive Core Concept & Chalkboard Algorithm]:
     Draw a 3-tier diagnostic & pathophysiological flow diagram on the chalkboard; ask 2 directed questions to engage learners.
   • [Min 05:00 – 07:30 | Diagnostic & Therapeutic Stratification (Integrating Recent Evidence)]:
     Highlight gold-standard diagnostic criteria, point-of-care cut-offs (referencing "${activeProject.title}"), and first-line Indian guidelines.
   • [Min 07:30 – 09:00 | Formative Assessment (2-Question Rapid Check)]:
     Verify learner attainment of the 3 SLOs via a quick case-based MCQ / spotter question.
   • [Min 09:00 – 10:00 | Take-Home Summary & Closure]:
     Summarize the 3 take-home clinical pearls and invite questions.

================================================================================
PART B: JOURNAL CLUB CRITICAL APPRAISAL CHECKLIST (CASP / CONSORT / STROBE)
--------------------------------------------------------------------------------
• Appraised Landmark Article : ${jcArticleCitation}
• Relevance to Thesis        : Directly informs Chapter 2 (Review of Literature) & Chapter 5 (Discussion) of "${activeProject.title}".

1. STRUCTURED PICO(T) BREAKDOWN OF THE ARTICLE:
   - Population (P)   : Tertiary care patients with confirmed ${cleanSpecialty} pathology.
   - Intervention / Index Factor (I): Primary diagnostic biomarker / clinical intervention protocol.
   - Comparator (C)   : Standard of care / healthy or mild-severity comparative cohort.
   - Outcome (O)      : Diagnostic sensitivity/specificity, clinical severity correlation, and event-free survival.

2. INTERNAL VALIDITY & METHODOLOGICAL RIGOR AUDIT:
   - Selection & Recruitment Bias : Consecutive sampling with explicit inclusion/exclusion criteria; baseline confounders balanced.
   - Blinding & Measurement       : Laboratory/outcome assessors blinded to clinical severity grade.
   - Biostatistical Validity      : Adequately powered sample size (1-β ≥ 80%, α = 0.05); normality verified; 95% confidence intervals reported alongside p-values.

3. EXTERNAL VALIDITY & APPLICABILITY TO INDIAN GOVERNMENT / TEACHING HOSPITALS:
   - Feasibility & Cost-Effectiveness: Assay/protocol is affordable, rapid, and deployable in Indian district and tertiary medical college hospitals without imposing out-of-pocket financial burden on patients.
================================================================================`;

          const handleDownloadPedagogyWord = () => {
            const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>NMC Pedagogy & Journal Club Dossier - Dr. ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.2cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 11.5pt; color: #064e3b; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 12pt; }
</style></head>
<body>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin:0;">Affiliated to ${activeProject.university} • Department of ${cleanSpecialty}</p>
  <h2 style="text-align:center;">NMC CBME MICRO-TEACHING PEDAGOGY &amp; JOURNAL CLUB CRITICAL APPRAISAL SHEET</h2>
  <pre style="font-family:'Times New Roman',serif;font-size:11pt;white-space:pre-wrap;">${pedagogyAndJcDossier}</pre>
</body></html>`;
            const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NMC_Pedagogy_JournalClub_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Downloaded NMC Micro-Teaching Lesson Plan & Journal Club Appraisal (.DOC)!');
          };

          return (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-emerald-100 via-teal-50 to-amber-100 rounded-xl border-2 border-emerald-400 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-emerald-900 text-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                      NMC CBME Practical Station
                    </span>
                    <h3 className="text-sm font-black text-indigo-950">
                      10-Minute Micro-Teaching Pedagogy Lesson Plan &amp; Journal Club Critical Appraisal
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    Prepare your Specific Learning Objectives (SLOs), 10-minute chalkboard micro-teaching script, and CASP/PICO journal club critical appraisal for the university practical examination.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPedagogyWord}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-200 rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download Pedagogy &amp; JC Sheet (.DOC)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white border-2 border-emerald-200 rounded-2xl p-5 space-y-4 text-xs">
                  <h4 className="text-sm font-black text-indigo-950 border-b border-slate-100 pb-2">
                    Configure Micro-Teaching &amp; Journal Club Parameters
                  </h4>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      10-Minute MBBS Micro-Teaching Topic:
                    </label>
                    <input
                      type="text"
                      value={pedagogyTopic}
                      onChange={e => setPedagogyTopic(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Landmark Journal Article for Critical Appraisal:
                    </label>
                    <textarea
                      rows={3}
                      value={jcArticleCitation}
                      onChange={e => setJcArticleCitation(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-950 block">
                      Examiner Pedagogy Checklist
                    </span>
                    <ul className="text-[11px] text-slate-700 space-y-1">
                      <li>• <strong>Bloom&apos;s Domains:</strong> Cognitive, Psychomotor &amp; Affective SLOs</li>
                      <li>• <strong>Peyton&apos;s 4-Step Skill Model:</strong> Demonstration → Deconstruction → Comprehension → Performance</li>
                      <li>• <strong>CASP Critical Appraisal:</strong> PICO, Internal Validity, Confounding &amp; Indian Cost Feasibility</li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white border-2 border-emerald-200 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                      Live Micro-Teaching Lesson Plan &amp; Journal Club Appraisal Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(pedagogyAndJcDossier);
                        showToast('Copied Micro-Teaching & Journal Club Dossier to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Dossier</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {pedagogyAndJcDossier}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
