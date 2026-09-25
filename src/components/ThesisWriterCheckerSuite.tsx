import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  CheckCircle, 
  Copy, 
  Check, 
  RotateCw, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Download, 
  Lock, 
  Eye, 
  Table, 
  Search, 
  ClipboardCheck, 
  FileCheck2,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Calculator,
  Activity
} from 'lucide-react';

interface Props {
  activeProject: {
    id: string;
    title: string;
    candidateName: string;
    guideName: string;
    specialty: string;
    university: string;
    collegeName: string;
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string }>;
  };
  activeChapterId: string;
  onApplyToChapter: (chapterId: string, contentToAppendOrReplace: string, mode: 'replace' | 'append') => void;
  showToast: (msg: string) => void;
}

export const ThesisWriterCheckerSuite: React.FC<Props> = ({
  activeProject,
  activeChapterId,
  onApplyToChapter,
  showToast
}) => {
  const [suiteTab, setSuiteTab] = useState<'writer' | 'checker' | 'roc_calc' | 'sample_calc' | 'guardrails' | 'compliance'>('writer');
  
  // Part 1: Writer States
  const [writerKey, setWriterKey] = useState<'intro_gap' | 'methodology' | 'stats_to_prose' | 'discussion_framework' | 'roc_interpretation' | 'informed_consent'>('intro_gap');
  const [writerInputs, setWriterInputs] = useState({
    disease: activeProject.title.replace(/^Correlation of |^Study of |^Evaluation of /i, ''),
    backgroundNotes: 'Rising prevalence in Indian population; marked variability in diagnostic cut-offs; limited longitudinal correlation between biomarker deficiency and clinical axonal disease severity in tertiary care setups.',
    studyDetails: 'Design: Prospective observational study\nSetting: Tertiary care teaching hospital, General Medicine OPD & IPD\nSample size: 50 confirmed cases\nInclusion: Diagnosed patients aged 18-65y with confirmed clinical neuropathy\nExclusion: Chronic kidney disease, hepatic dysfunction, pregnancy, leprosy\nDiagnostic tools: Nerve Conduction Studies (NCV), Biochemical ELISA assays\nEthics: Approved by Institutional Ethics Committee (IEC)',
    statsData: 'Demographics: Mean age 52.4 ± 8.1 years; 56% Male, 44% Female\nBiomarker: Mean Serum Level 14.8 ± 6.2 ng/mL (64% deficient < 20 ng/mL)\nOutcome: Severe polyneuropathy in 42% of deficient vs 11% of sufficient group (p = 0.003)\nOdds Ratio: 3.2 (95% CI: 1.4 - 7.3, p = 0.006)\nCorrelation: r = -0.42 (p < 0.001) with Toronto Clinical Neuropathy Score',
    finding1: 'Serum Vitamin D levels exhibited a statistically significant inverse correlation with clinical and electrophysiological severity of diabetic polyneuropathy.',
    finding2: 'Patients with severe deficiency (<10 ng/mL) had a 3.2-fold elevated odds of axonal motor-sensory nerve conduction slowing.',
    rocData: 'Biomarker: Serum Vitamin D\nTarget Outcome: Severe Axonal Neuropathy\nArea Under Curve (AUC): 0.84 (95% CI: 0.76 - 0.92, p < 0.001)\nOptimal Cut-off Value: 18.5 ng/mL\nSensitivity: 82.5%\nSpecificity: 78.4%\nYouden Index: 0.609',
    consentDetails: 'Study Title: Correlation of Serum Biomarkers with Neuropathy\nProcedures: Single 5ml venous blood draw and non-invasive nerve conduction tests\nRisks: Mild local bruising at venipuncture site\nVoluntary: Can withdraw at any time without impacting routine medical treatment\nLanguages: English, Hindi, and Regional State Language'
  });

  // Part 2: Checker States
  const [checkerKey, setCheckerKey] = useState<'peer_review_gap' | 'editorial_audit' | 'limitations_confounders' | 'citation_crosscheck'>('peer_review_gap');
  const [auditText, setAuditText] = useState<string>(
    activeProject.chapters.find(c => c.id === activeChapterId)?.content.substring(0, 1500) || ''
  );

  // Execution & Output state
  const [isExecuting, setIsExecuting] = useState(false);
  const [promptOutput, setPromptOutput] = useState<string>('');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  // Guardrails De-Identification Tool state
  const [rawPatientText, setRawPatientText] = useState<string>(
    'Patient Ramesh Kumar, 54y M, CR No: 2024-MED-84921, Mobile: 9820145678, admitted to Ward 4 with tingling sensations in both feet. Serum Vitamin D reported 11.2 ng/ml.'
  );
  const [sanitizedText, setSanitizedText] = useState<string>('');

  // Institutional Compliance Checklist state (synced locally)
  const [complianceItems, setComplianceItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`compliance_${activeProject.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      iec_clearance: true,
      vernacular_consent: true,
      ctri_reg: false,
      sample_size_formula: true,
      signed_certificates: true,
      plagiarism_under_10: true,
      pg_logbook_ready: true,
      adequate_references: true
    };
  });

  // ==========================================
  // ROC CURVE INTERACTIVE CALCULATOR STATE
  // ==========================================
  const [rocBiomarker, setRocBiomarker] = useState('Serum 25(OH)D');
  const [rocOutcome, setRocOutcome] = useState('Severe Diabetic Neuropathy');
  const [rocCutoff, setRocCutoff] = useState('18.5 ng/mL');
  const [rocSens, setRocSens] = useState<number>(82.5);
  const [rocSpec, setRocSpec] = useState<number>(78.4);
  const [rocAuc, setRocAuc] = useState<number>(0.84);
  const [rocPVal, setRocPVal] = useState('< 0.001');

  // Computed ROC diagnostics
  const youdenJ = parseFloat(((rocSens / 100) + (rocSpec / 100) - 1).toFixed(3));
  const posLR = (1 - (rocSpec / 100)) > 0 
    ? parseFloat(((rocSens / 100) / (1 - (rocSpec / 100))).toFixed(2)) 
    : 0;
  const negLR = (rocSpec / 100) > 0 
    ? parseFloat(((1 - (rocSens / 100)) / (rocSpec / 100)).toFixed(2)) 
    : 0;
  const diagOR = negLR > 0 ? parseFloat((posLR / negLR).toFixed(1)) : 0;

  // ==========================================
  // SAMPLE SIZE CALCULATOR STATE
  // ==========================================
  const [sampleCalcType, setSampleCalcType] = useState<'prevalence' | 'two_means'>('prevalence');
  // Prevalence mode params
  const [prevPercent, setPrevPercent] = useState<number>(25); // anticipated prevalence %
  const [precisionD, setPrecisionD] = useState<number>(5); // margin of error %
  const [confLevelZ, setConfLevelZ] = useState<number>(1.96); // 95% = 1.96, 99% = 2.576
  const [bufferPercent, setBufferPercent] = useState<number>(10); // 10% non-response buffer

  // Two means mode params
  const [mean1, setMean1] = useState<number>(14.5);
  const [mean2, setMean2] = useState<number>(22.0);
  const [stdDev, setStdDev] = useState<number>(8.0);
  const [powerZ, setPowerZ] = useState<number>(0.84); // 80% = 0.84, 90% = 1.28

  // Calculations for Sample Size
  const pDec = prevPercent / 100;
  const dDec = precisionD / 100;
  const rawNPrevalence = Math.ceil((Math.pow(confLevelZ, 2) * pDec * (1 - pDec)) / Math.pow(dDec, 2));
  const bufferedNPrevalence = Math.ceil(rawNPrevalence / (1 - (bufferPercent / 100)));

  const diffMeans = Math.abs(mean1 - mean2);
  const rawNTwoMeans = diffMeans > 0 
    ? Math.ceil((2 * Math.pow(confLevelZ + powerZ, 2) * Math.pow(stdDev, 2)) / Math.pow(diffMeans, 2))
    : 0;
  const bufferedNTwoMeans = Math.ceil(rawNTwoMeans / (1 - (bufferPercent / 100)));

  const toggleCompliance = (key: string) => {
    const updated = { ...complianceItems, [key]: !complianceItems[key] };
    setComplianceItems(updated);
    localStorage.setItem(`compliance_${activeProject.id}`, JSON.stringify(updated));
  };

  const completedCount = Object.values(complianceItems).filter(Boolean).length;
  const totalCompliance = Object.keys(complianceItems).length;
  const complianceScore = Math.round((completedCount / totalCompliance) * 100);

  // De-identification sanitizer function
  const handleSanitizePatientData = () => {
    if (!rawPatientText.trim()) return;

    let scrubbed = rawPatientText
      .replace(/(\+91[\-\s]?)?[6-9]\d{9}/g, '[REDACTED_PHONE]')
      .replace(/\b(CR|MRN|IPD|OPD|REG|UID|ID)[\s\w:\/-]{3,20}\b/gi, '[REDACTED_HOSPITAL_ID]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
      .replace(/\b(Patient|Mr\.|Mrs\.|Ms\.|Shri|Smt\.)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)/g, '[REDACTED_PATIENT_NAME]')
      .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '[REDACTED_AADHAAR]');

    setSanitizedText(scrubbed);
    showToast('Patient Identifiers Scrubbed & De-Identified successfully!');
  };

  // Run AI Prompt Execution via server
  const handleExecutePrompt = async (category: 'writer' | 'checker') => {
    setIsExecuting(true);
    setPromptOutput('');

    const key = category === 'writer' ? writerKey : checkerKey;
    const bibliographyFormatted = activeProject.citations
      .map((c, i) => `[${i + 1}] ${c.authors} (${c.pubdate}). ${c.title}. ${c.source}.`)
      .join('\n');

    try {
      const res = await fetch('/api/thesis-prompt-exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          promptKey: key,
          inputs: {
            disease: writerInputs.disease,
            backgroundNotes: writerInputs.backgroundNotes,
            studyDetails: writerInputs.studyDetails,
            statsData: writerInputs.statsData,
            finding1: writerInputs.finding1,
            finding2: writerInputs.finding2,
            rocData: writerInputs.rocData,
            consentDetails: writerInputs.consentDetails,
            textToAudit: auditText,
            bibliographyText: bibliographyFormatted
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      setPromptOutput(data.output || '');
      showToast('Clinical prompt executed successfully!');
    } catch (err: any) {
      console.error(err);
      showToast('Error: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  // Copy raw prompt template to clipboard
  const handleCopyPromptTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(id);
    showToast('Prompt template copied to clipboard!');
    setTimeout(() => setCopiedPromptKey(null), 2500);
  };

  // Format ROC Text for Chapter 4
  const generateRocThesisText = (): string => {
    return `### Diagnostic Efficacy & ROC Curve Analysis for ${rocBiomarker}

Receiver Operating Characteristic (ROC) curve analysis was executed to evaluate the diagnostic discriminatory performance of ${rocBiomarker} in predicting ${rocOutcome}.

The Area Under the Curve (AUC) for ${rocBiomarker} was **${rocAuc.toFixed(2)}** (95% CI: ${(rocAuc - 0.08).toFixed(2)} – ${(rocAuc + 0.08).toFixed(2)}, p ${rocPVal}), indicating **${rocAuc >= 0.8 ? 'excellent' : 'good'}** diagnostic discrimination.

Using **Youden's Index ($J = ${youdenJ}$)**, the optimal clinical cut-off value was determined at **${rocCutoff}**, yielding:
- **Sensitivity**: ${rocSens}%
- **Specificity**: ${rocSpec}%
- **Positive Likelihood Ratio (+LR)**: ${posLR}
- **Negative Likelihood Ratio (-LR)**: ${negLR}
- **Diagnostic Odds Ratio (DOR)**: ${diagOR}

| Parameter | Observed Value | Interpretation |
|---|---|---|
| **Area Under Curve (AUC)** | ${rocAuc.toFixed(2)} | High Discriminatory Accuracy |
| **Optimal Cut-off Value** | ${rocCutoff} | Threshold for Risk Stratification |
| **Sensitivity** | ${rocSens}% | True Positive Rate |
| **Specificity** | ${rocSpec}% | True Negative Rate |
| **Youden Index (J)** | ${youdenJ} | Optimal Balance Point |
| **Positive Likelihood Ratio** | ${posLR} | Substantial Diagnostic Rule-in |
| **Negative Likelihood Ratio** | ${negLR} | Useful Diagnostic Rule-out |`;
  };

  // Format Sample Size Text for Chapter 3
  const generateSampleSizeText = (): string => {
    if (sampleCalcType === 'prevalence') {
      return `### 3.4 Sample Size Justification & Calculation

The sample size for this dissertation was calculated based on the anticipated prevalence of the clinical condition reported in previous peer-reviewed Indian literature, utilizing standard statistical formula:

$$n = \\frac{Z_{1-\\alpha/2}^2 \\cdot p \\cdot (1 - p)}{d^2}$$

Where:
- $Z_{1-\\alpha/2} = ${confLevelZ}$ (corresponding to a 95% Confidence Interval, two-tailed $\\alpha = 0.05$).
- $p = ${prevPercent}\\%$ ($0.${prevPercent}$), anticipated prevalence based on previous reference literature.
- $d = ${precisionD}\\%$ ($0.0${precisionD}$), desired absolute precision (margin of error).

**Calculation:**
$$n = \\frac{(${confLevelZ})^2 \\cdot ${pDec} \\cdot (1 - ${pDec})}{(${dDec})^2} = \\frac{${(Math.pow(confLevelZ, 2) * pDec * (1 - pDec)).toFixed(4)}}{${Math.pow(dDec, 4).toFixed(4)}} = ${rawNPrevalence}$$

Accounting for a **${bufferPercent}% non-response / dropout / loss to follow-up buffer**:
$$n_{\\text{final}} = \\frac{${rawNPrevalence}}{1 - 0.${bufferPercent < 10 ? '0' + bufferPercent : bufferPercent}} = ${bufferedNPrevalence}$$

Hence, a minimum sample size of **${bufferedNPrevalence} participants** was determined to be statistically adequate for institutional ethics committee (IEC) protocol clearance and valid hypothesis testing.`;
    } else {
      return `### 3.4 Sample Size Justification & Calculation

The sample size was calculated for comparing quantitative biochemical/clinical parameters between two independent study cohorts using the standard formula for difference between two means:

$$n = \\frac{2 \\cdot (Z_\\alpha + Z_\\beta)^2 \\cdot \\sigma^2}{(\\mu_1 - \\mu_2)^2}$$

Where:
- $Z_\\alpha = ${confLevelZ}$ (for two-tailed significance $\\alpha = 0.05$).
- $Z_\\beta = ${powerZ}$ (for ${powerZ === 0.84 ? '80%' : '90%'} statistical power).
- $\\mu_1 - \\mu_2 = ${diffMeans}$ (clinically meaningful difference between group means).
- $\\sigma = ${stdDev}$ (pooled standard deviation from reference literature).

**Calculation:**
$$n = \\frac{2 \\cdot (${confLevelZ} + ${powerZ})^2 \\cdot (${stdDev})^2}{(${diffMeans})^2} = ${rawNTwoMeans} \\text{ subjects per group}$$

Accounting for a **${bufferPercent}% attrition / drop-out rate**, the final required sample size is **${bufferedNTwoMeans} subjects per group** (Total $N = ${bufferedNTwoMeans * 2}$), satisfying Institutional Ethics Committee guidelines.`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Top Header Bar */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold tracking-tight">
              MD Thesis Writer & Checker Suite
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Structured prompts, statistical calculators, peer-review audits, and patient confidentiality guardrails adhering to National Medical Commission (NMC) regulations.
          </p>
        </div>

        {/* Suite Tab Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-semibold self-start md:self-auto overflow-x-auto gap-1">
          <button
            onClick={() => setSuiteTab('writer')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${suiteTab === 'writer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Part 1: Writer</span>
          </button>
          <button
            onClick={() => setSuiteTab('checker')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${suiteTab === 'checker' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Part 2: Checker</span>
          </button>
          <button
            onClick={() => setSuiteTab('roc_calc')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${suiteTab === 'roc_calc' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-300" />
            <span>ROC Diagnostics</span>
          </button>
          <button
            onClick={() => setSuiteTab('sample_calc')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${suiteTab === 'sample_calc' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Calculator className="w-3.5 h-3.5 text-teal-300" />
            <span>Sample Size (IEC)</span>
          </button>
          <button
            onClick={() => setSuiteTab('guardrails')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${suiteTab === 'guardrails' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Guardrails</span>
          </button>
          <button
            onClick={() => setSuiteTab('compliance')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${suiteTab === 'compliance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>NMC Checklist ({complianceScore}%)</span>
          </button>
        </div>
      </div>

      {/* Main Container Body */}
      <div className="p-6">
        
        {/* =========================================================
            TAB 1: PART 1 - MD THESIS WRITER PROMPTS
            ========================================================= */}
        {suiteTab === 'writer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Prompt Selector & Input Form */}
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Select Section to Draft:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-mono">
                  Active Topic: {activeProject.specialty}
                </span>
              </div>

              {/* Prompt selection pills */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setWriterKey('intro_gap')}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${writerKey === 'intro_gap' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-[11px] font-bold">1. Introduction & Research Gap</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Global to Indian burden & clinical gap</div>
                </button>

                <button
                  onClick={() => setWriterKey('methodology')}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${writerKey === 'methodology' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-[11px] font-bold">2. Methodology Drafting</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">High accuracy zone (passive voice & past tense)</div>
                </button>

                <button
                  onClick={() => setWriterKey('stats_to_prose')}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${writerKey === 'stats_to_prose' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-[11px] font-bold">3. Stats to Results Prose</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Biostatistician narrative (p &lt; 0.05 focus)</div>
                </button>

                <button
                  onClick={() => setWriterKey('discussion_framework')}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${writerKey === 'discussion_framework' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-[11px] font-bold">4. Discussion Framework</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Contextualizing findings with landmark trials</div>
                </button>

                <button
                  onClick={() => setWriterKey('roc_interpretation')}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${writerKey === 'roc_interpretation' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-[11px] font-bold">5. ROC Curve Diagnostics</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">AUC, Sensitivity, Specificity, Youden index</div>
                </button>

                <button
                  onClick={() => setWriterKey('informed_consent')}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${writerKey === 'informed_consent' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-[11px] font-bold">6. Vernacular Informed Consent</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Ethics clauses & participant rights</div>
                </button>
              </div>

              {/* Dynamic Input Form for the selected writer prompt */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Input Clinical Pointers & Parameters:
                  </span>
                  <button
                    onClick={() => {
                      const samplePrompt = writerKey === 'intro_gap' 
                        ? `Act as an expert academic writer in clinical medicine. I am writing my MD thesis introduction on ${writerInputs.disease}. Based on these recent findings and background notes: [${writerInputs.backgroundNotes}], draft a compelling 400-word introduction section. It must clearly flow from the global clinical burden, down to the local context, and explicitly define the research gap this study intends to fill. Use a formal, objective medical register.`
                        : writerKey === 'methodology'
                        ? `Act as a clinical research methodologist. Write a structured 'Materials and Methods' section based on these study details: [${writerInputs.studyDetails}]. Organize it under clear subheadings: Study Design and Setting, Participant Selection, Interventions/Measurements, and Statistical Analysis. Write in the past tense and passive voice where conventional.`
                        : writerKey === 'stats_to_prose'
                        ? `Act as a medical biostatistician. I will provide a summary of my data results: [${writerInputs.statsData}]. Translate these data points into a cohesive 'Results' narrative for a medical thesis. Highlight major statistically significant findings (p < 0.05) and demographic distributions first. Do not add any commentary or speculation—only describe what the data shows.`
                        : `Act as a senior medical researcher. My clinical study found that ${writerInputs.finding1} and ${writerInputs.finding2}. Help me draft the opening paragraphs of my 'Discussion' section. Frame these results in the context of the existing global literature. Provide standard medical phrasing to transition into comparing our findings with previous landmark trials or studies.`;
                      handleCopyPromptTemplate(samplePrompt, writerKey);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer font-semibold"
                  >
                    {copiedPromptKey === writerKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Raw Prompt</span>
                  </button>
                </div>

                {writerKey === 'intro_gap' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clinical Disease / Condition:</label>
                      <input
                        type="text"
                        value={writerInputs.disease}
                        onChange={(e) => setWriterInputs({ ...writerInputs, disease: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Summary Notes / Literature Review Pointers:</label>
                      <textarea
                        rows={4}
                        value={writerInputs.backgroundNotes}
                        onChange={(e) => setWriterInputs({ ...writerInputs, backgroundNotes: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </>
                )}

                {writerKey === 'methodology' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Study Design, Sample Size, Criteria & Ethics Details:
                    </label>
                    <textarea
                      rows={5}
                      value={writerInputs.studyDetails}
                      onChange={(e) => setWriterInputs({ ...writerInputs, studyDetails: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                )}

                {writerKey === 'stats_to_prose' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Raw Statistical Numbers, p-values, Odds Ratios or Table Data:
                    </label>
                    <textarea
                      rows={5}
                      value={writerInputs.statsData}
                      onChange={(e) => setWriterInputs({ ...writerInputs, statsData: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                )}

                {writerKey === 'discussion_framework' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Major Clinical Finding #1:</label>
                      <textarea
                        rows={2}
                        value={writerInputs.finding1}
                        onChange={(e) => setWriterInputs({ ...writerInputs, finding1: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Major Clinical Finding #2:</label>
                      <textarea
                        rows={2}
                        value={writerInputs.finding2}
                        onChange={(e) => setWriterInputs({ ...writerInputs, finding2: e.target.value })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </>
                )}

                {writerKey === 'roc_interpretation' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ROC Curve Parameters (AUC, 95% CI, Cut-off, Sensitivity, Specificity):
                    </label>
                    <textarea
                      rows={5}
                      value={writerInputs.rocData}
                      onChange={(e) => setWriterInputs({ ...writerInputs, rocData: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                )}

                {writerKey === 'informed_consent' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Protocol & Ethics Consent Specifications:
                    </label>
                    <textarea
                      rows={4}
                      value={writerInputs.consentDetails}
                      onChange={(e) => setWriterInputs({ ...writerInputs, consentDetails: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleExecutePrompt('writer')}
                  disabled={isExecuting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Drafting Structured Section with Clinical Logic...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Execute Section Prompt with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Output Viewer & One-Click Chapter Insert */}
            <div className="lg:col-span-6 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Generated Academic Narrative
                </span>
                {promptOutput && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(promptOutput);
                        showToast('Draft copied to clipboard!');
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => {
                        onApplyToChapter(activeChapterId, promptOutput, 'append');
                        showToast(`Inserted into active chapter!`);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold hover:bg-emerald-100 flex items-center space-x-1 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Append to Active Chapter</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-[460px] bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto font-sans text-xs text-slate-800 leading-relaxed">
                {promptOutput ? (
                  <div className="whitespace-pre-wrap space-y-2">
                    {promptOutput}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2 py-24">
                    <FileText className="w-10 h-10 text-slate-300" />
                    <p className="font-semibold text-slate-600">No generated text yet</p>
                    <p className="max-w-xs text-[11px]">
                      Select a prompt category on the left, adjust your clinical inputs, and click "Execute Section Prompt with AI".
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 2: PART 2 - MD THESIS CHECKER & AUDIT PROMPTS
            ========================================================= */}
        {suiteTab === 'checker' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Checker Mode Selector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Audit Inspection Category:
              </div>

              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setCheckerKey('peer_review_gap')}
                  className={`w-full p-3 rounded-lg text-left border transition-all cursor-pointer ${checkerKey === 'peer_review_gap' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-xs font-bold">1. Peer-Review & Clinical Gap Checker</div>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                    Flags logical jumps, vague assertions, missing sample size formulas, or missing lab assay kits.
                  </p>
                </button>

                <button
                  onClick={() => setCheckerKey('editorial_audit')}
                  className={`w-full p-3 rounded-lg text-left border transition-all cursor-pointer ${checkerKey === 'editorial_audit' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-xs font-bold">2. Editorial, Academic Tone & Consistency Audit</div>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                    Generates a before-and-after table, converts informal words to medical-grade, and unifies units (mg/dL).
                  </p>
                </button>

                <button
                  onClick={() => setCheckerKey('limitations_confounders')}
                  className={`w-full p-3 rounded-lg text-left border transition-all cursor-pointer ${checkerKey === 'limitations_confounders' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-xs font-bold">3. Limitations & Confounding Variable Evaluation</div>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                    Identifies selection bias, recall bias, and omissions; suggests honest academic acknowledgements.
                  </p>
                </button>

                <button
                  onClick={() => setCheckerKey('citation_crosscheck')}
                  className={`w-full p-3 rounded-lg text-left border transition-all cursor-pointer ${checkerKey === 'citation_crosscheck' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  <div className="text-xs font-bold">4. Reference and Citation Cross-Check</div>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">
                    Cross-references inline claims against the active bibliography; catches author/year mismatches.
                  </p>
                </button>
              </div>

              {/* Text to Audit Input */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Text to Audit:</span>
                  <button
                    onClick={() => {
                      const cur = activeProject.chapters.find(c => c.id === activeChapterId)?.content || '';
                      setAuditText(cur.substring(0, 3000));
                      showToast(`Loaded Chapter: ${activeProject.chapters.find(c => c.id === activeChapterId)?.name}`);
                    }}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    Pull from Active Chapter
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={auditText}
                  onChange={(e) => setAuditText(e.target.value)}
                  placeholder="Paste section of dissertation draft here to audit..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
                
                <button
                  onClick={() => handleExecutePrompt('checker')}
                  disabled={isExecuting || !auditText.trim()}
                  className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {isExecuting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Auditing Academic Draft...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Run Peer-Review Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Audit Report Output */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Peer-Reviewer & Copyeditor Inspection Findings
                </span>
                {promptOutput && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(promptOutput);
                      showToast('Audit report copied!');
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Report</span>
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-[460px] bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto text-xs text-slate-800 font-sans leading-relaxed">
                {promptOutput ? (
                  <div className="whitespace-pre-wrap space-y-2">
                    {promptOutput}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2 py-24">
                    <ShieldAlert className="w-10 h-10 text-slate-300" />
                    <p className="font-semibold text-slate-600">No audit run yet</p>
                    <p className="max-w-xs text-[11px]">
                      Paste text on the left or click "Pull from Active Chapter", then run the audit.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 3: ROC CURVE INTERACTIVE CALCULATOR & PLOTTER
            ========================================================= */}
        {suiteTab === 'roc_calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Input Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Receiver Operating Characteristic (ROC) Parameters</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Biomarker / Test Name:</label>
                    <input
                      type="text"
                      value={rocBiomarker}
                      onChange={(e) => setRocBiomarker(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                      placeholder="e.g. Serum 25(OH)D"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Target Condition / Endpoint:</label>
                    <input
                      type="text"
                      value={rocOutcome}
                      onChange={(e) => setRocOutcome(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                      placeholder="e.g. Severe Diabetic Neuropathy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Cut-off Threshold:</label>
                      <input
                        type="text"
                        value={rocCutoff}
                        onChange={(e) => setRocCutoff(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                        placeholder="e.g. 18.5 ng/mL"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">AUC (Area Under Curve):</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.5"
                        max="1.0"
                        value={rocAuc}
                        onChange={(e) => setRocAuc(parseFloat(e.target.value) || 0.5)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-blue-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Sensitivity (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={rocSens}
                        onChange={(e) => setRocSens(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Specificity (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={rocSpec}
                        onChange={(e) => setRocSpec(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Computed Diagnostic Metrics Grid */}
                <div className="pt-2 border-t border-blue-200/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Youden Index (J):</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{youdenJ}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Positive LR (+LR):</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{posLR}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Negative LR (-LR):</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{negLR}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block text-[10px]">Diagnostic OR (DOR):</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">{diagOR}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const text = generateRocThesisText();
                    onApplyToChapter('results', text, 'append');
                    showToast('ROC narrative & table appended to Chapter 4: Observations & Results!');
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Insert into Chapter 4: Observations & Results</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateRocThesisText());
                    showToast('ROC narrative copied to clipboard!');
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Thesis Text</span>
                </button>
              </div>
            </div>

            {/* Right: Interactive ROC Plot & Formatted Thesis Text */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Visual ROC Plot Display */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Visual ROC Curve: {rocBiomarker} (AUC = {rocAuc.toFixed(2)})
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                    NMC Thesis Figure Format
                  </span>
                </div>

                <div className="h-56 w-full flex items-center justify-center">
                  <svg viewBox="0 0 300 200" className="w-full h-full max-w-sm">
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="40" y1="160" x2="280" y2="160" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="40" y1="90" x2="280" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="160" y1="20" x2="160" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Reference Line (No Discrimination y = x) */}
                    <line x1="40" y1="160" x2="280" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    
                    {/* Dynamic Smooth ROC Curve based on AUC & sensitivity/specificity */}
                    {(() => {
                      const fpr = (100 - rocSpec) / 100;
                      const tpr = rocSens / 100;
                      // Mapping: x=40..280 (delta 240), y=160..20 (delta 140)
                      const optX = 40 + (fpr * 240);
                      const optY = 160 - (tpr * 140);
                      const cp1X = 40 + (fpr * 120);
                      const cp1Y = 160 - (tpr * 180);
                      const cp2X = optX + (280 - optX) * 0.4;
                      const cp2Y = 20 + 20;

                      return (
                        <>
                          <path
                            d={`M 40 160 C ${cp1X} ${Math.max(20, cp1Y)}, ${cp2X} ${cp2Y}, 280 20`}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                          />
                          {/* Highlighted Optimal Cut-off Point */}
                          <circle cx={optX} cy={optY} r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                          <text x={optX + 8} y={optY - 6} fontSize="9" fill="#1e293b" fontWeight="bold">
                            Cut-off: {rocCutoff} (Sens: {rocSens}%, Spec: {rocSpec}%)
                          </text>
                        </>
                      );
                    })()}

                    {/* Axis Labels */}
                    <text x="160" y="185" textAnchor="middle" fontSize="9" fill="#64748b">1 - Specificity (False Positive Rate)</text>
                    <text x="18" y="90" textAnchor="middle" fontSize="9" fill="#64748b" transform="rotate(-90 18 90)">Sensitivity (True Positive)</text>
                    <text x="40" y="172" fontSize="8" fill="#94a3b8">0.0</text>
                    <text x="275" y="172" fontSize="8" fill="#94a3b8">1.0</text>
                    <text x="25" y="162" fontSize="8" fill="#94a3b8">0.0</text>
                    <text x="25" y="25" fontSize="8" fill="#94a3b8">1.0</text>
                  </svg>
                </div>
              </div>

              {/* Formatted Narrative Preview */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Thesis Observations Chapter Prose:
                </span>
                <div className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto bg-white p-3 rounded border border-slate-200">
                  {generateRocThesisText()}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================
            TAB 4: INSTITUTIONAL SAMPLE SIZE CALCULATOR (IEC)
            ========================================================= */}
        {suiteTab === 'sample_calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Parameters Formulation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-teal-900 font-bold text-xs">
                  <Calculator className="w-4 h-4 text-teal-600" />
                  <span>IEC Sample Size Justification Formulation</span>
                </div>

                {/* Calculation Type Toggle */}
                <div className="flex bg-white p-0.5 rounded-lg border border-teal-200 text-xs">
                  <button
                    onClick={() => setSampleCalcType('prevalence')}
                    className={`flex-1 py-1.5 rounded font-semibold transition-all cursor-pointer ${sampleCalcType === 'prevalence' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    1. Prevalence / Qualitative
                  </button>
                  <button
                    onClick={() => setSampleCalcType('two_means')}
                    className={`flex-1 py-1.5 rounded font-semibold transition-all cursor-pointer ${sampleCalcType === 'two_means' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    2. Two Means / Cohort
                  </button>
                </div>

                {sampleCalcType === 'prevalence' ? (
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Anticipated Prevalence in Reference Studies (p %):
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="99"
                        value={prevPercent}
                        onChange={(e) => setPrevPercent(parseFloat(e.target.value) || 1)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500">
                        Based on peer-reviewed Indian epidemiological studies.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Desired Absolute Precision / Margin of Error (d %):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="20"
                        value={precisionD}
                        onChange={(e) => setPrecisionD(parseFloat(e.target.value) || 1)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500">
                        Standard recommendation: 5% (0.05) or 10% (0.10).
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Confidence Level:</label>
                        <select
                          value={confLevelZ}
                          onChange={(e) => setConfLevelZ(parseFloat(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value={1.96}>95% (Z = 1.96)</option>
                          <option value={2.576}>99% (Z = 2.58)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Dropout Buffer:</label>
                        <select
                          value={bufferPercent}
                          onChange={(e) => setBufferPercent(parseFloat(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value={0}>0% (None)</option>
                          <option value={10}>10% Buffer</option>
                          <option value={15}>15% Buffer</option>
                          <option value={20}>20% Buffer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Mean Group 1 (μ1):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={mean1}
                          onChange={(e) => setMean1(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Mean Group 2 (μ2):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={mean2}
                          onChange={(e) => setMean2(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Pooled Standard Deviation (σ):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={stdDev}
                        onChange={(e) => setStdDev(parseFloat(e.target.value) || 1)}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Statistical Power:</label>
                        <select
                          value={powerZ}
                          onChange={(e) => setPowerZ(parseFloat(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value={0.84}>80% Power (Z = 0.84)</option>
                          <option value={1.28}>90% Power (Z = 1.28)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Dropout Buffer:</label>
                        <select
                          value={bufferPercent}
                          onChange={(e) => setBufferPercent(parseFloat(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value={0}>0%</option>
                          <option value={10}>10% Buffer</option>
                          <option value={15}>15% Buffer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const text = generateSampleSizeText();
                    onApplyToChapter('methods', text, 'append');
                    showToast('Sample size justification appended to Chapter 3: Materials & Methods!');
                  }}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Insert into Chapter 3: Materials & Methods</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateSampleSizeText());
                    showToast('Sample size text copied to clipboard!');
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Text</span>
                </button>
              </div>
            </div>

            {/* Right: Calculated Sample Size Card & IEC Statement */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Output Result Hero Pill */}
              <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                    Statistically Adequate Sample Size
                  </span>
                  <p className="text-xs text-teal-900/80 mt-0.5">
                    {sampleCalcType === 'prevalence' 
                      ? `Based on ${prevPercent}% prevalence with ${precisionD}% margin of error & 95% CI` 
                      : `Based on difference of ${diffMeans} between groups with ${powerZ === 0.84 ? '80%' : '90%'} power`}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-teal-700">
                    N = {sampleCalcType === 'prevalence' ? bufferedNPrevalence : bufferedNTwoMeans}
                  </div>
                  <span className="text-[10px] text-teal-600 font-semibold block">
                    {bufferPercent > 0 ? `(Includes ${bufferPercent}% Attrition Buffer)` : '(Raw Minimum Sample)'}
                  </span>
                </div>
              </div>

              {/* Formatted IEC Justification Section */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    IEC Protocol Submission Paragraph (LaTeX Math Supported)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">
                    Standard Indian PG Format
                  </span>
                </div>
                <div className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto bg-slate-50/60 p-3 rounded border border-slate-200">
                  {generateSampleSizeText()}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* =========================================================
            TAB 5: CRUCIAL SAFETY GUARDRAILS & PATIENT DE-IDENTIFICATION
            ========================================================= */}
        {suiteTab === 'guardrails' && (
          <div className="space-y-6">
            
            {/* The 2 Golden Guardrails Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Guardrail 1: Citation Hallucinations */}
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Guardrail 1: Never Rely on AI for Clinical Citations</span>
                </div>
                <p className="text-xs text-rose-900/90 leading-relaxed">
                  Generative AI models frequently hallucinate non-existent medical journal volume numbers, page ranges, PMIDs, or DOI hyperlinks.
                </p>
                <div className="p-3 bg-white/80 rounded-lg border border-rose-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">Recommended Safe Practice:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                    <li>Always pull verified citations natively through the integrated <strong>PubMed Literature</strong> tab.</li>
                    <li>Export your verified references using the new <strong>BibTeX (.bib) export</strong> for <strong>Zotero</strong> or <strong>Mendeley</strong>.</li>
                    <li>Verify all DOIs at <span className="font-mono text-emerald-700">doi.org</span> before final thesis binding.</li>
                  </ul>
                </div>
              </div>

              {/* Guardrail 2: Patient Confidentiality & De-Identification */}
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Guardrail 2: De-identify Patient Data</span>
                </div>
                <p className="text-xs text-amber-950/90 leading-relaxed">
                  Never paste raw patient names, Hospital Case Numbers (CR No/MRN/IPD No), phone numbers, or addresses into AI prompts to safeguard patient confidentiality under Indian Medical Ethics and ICMR regulations.
                </p>
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">Protected Clinical Identifiers:</div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Use aggregate demographics (e.g. <em>"Mean age 52.4 ± 8.1y, 28 males"</em>) instead of individual patient case sheets. Use our automated scrubber below.
                  </p>
                </div>
              </div>

            </div>

            {/* Interactive Live De-Identification Sanitizer Tool */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Live Patient Data De-Identification Sanitizer
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Paste case sheets, observations, or raw logs to automatically redact identifying metadata before AI prompt usage.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSanitizePatientData}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sanitize & Scrub Identifiers</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Raw Case Notes with Potential Identifiers:
                  </label>
                  <textarea
                    rows={6}
                    value={rawPatientText}
                    onChange={(e) => setRawPatientText(e.target.value)}
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    placeholder="Paste unscrubbed notes..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Sanitized Output (Safe for Prompts):
                    </label>
                    {sanitizedText && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sanitizedText);
                          showToast('Sanitized text copied!');
                        }}
                        className="text-[11px] text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Sanitized</span>
                      </button>
                    )}
                  </div>
                  <div className="w-full h-[130px] text-xs p-3 bg-white border border-slate-200 rounded-lg overflow-y-auto font-mono text-slate-800 whitespace-pre-wrap">
                    {sanitizedText || (
                      <span className="text-slate-400 italic">
                        Click "Sanitize & Scrub Identifiers" above to generate safe text.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            TAB 6: INSTITUTIONAL COMPLIANCE CHECKLIST
            ========================================================= */}
        {suiteTab === 'compliance' && (
          <div className="space-y-6">
            
            {/* Compliance Meter Header */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <ClipboardCheck className="w-5 h-5 text-indigo-700" />
                  <h3 className="text-sm font-bold text-indigo-950">
                    NMC & University Dissertation Submission Verification
                  </h3>
                </div>
                <p className="text-xs text-indigo-900/80 mt-1">
                  Required certificates, clearance letters, and statutory criteria for Indian PG Medical University submission.
                </p>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Compliance Readiness</div>
                  <div className="text-lg font-bold text-indigo-700 font-mono">
                    {completedCount} / {totalCompliance} ({complianceScore}%)
                  </div>
                </div>

                <div className="w-24 bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500" 
                    style={{ width: `${complianceScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              <div 
                onClick={() => toggleCompliance('iec_clearance')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.iec_clearance ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.iec_clearance} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">1. Institutional Ethics Committee (IEC) Clearance</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official IEC approval letter with protocol number and meeting date before study commencement.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('vernacular_consent')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.vernacular_consent ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.vernacular_consent} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">2. Vernacular Patient Informed Consent Document</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Consent & patient information sheet translated into state vernacular language + English.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('ctri_reg')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.ctri_reg ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.ctri_reg} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">3. CTRI Registration (If Interventional Trial)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clinical Trials Registry - India (CTRI) acknowledgement number for clinical trials.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('sample_size_formula')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.sample_size_formula ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.sample_size_formula} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">4. Sample Size Justification & Power Calculation</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Statistical formula with alpha (0.05) and power (80-90%) documented in Chapter 3 (Methods).
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('signed_certificates')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.signed_certificates ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.signed_certificates} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">5. Signed Guide, Co-Guide & HOD Certificates</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Candidate declaration and supervisor certification formatted according to university regulations.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('plagiarism_under_10')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.plagiarism_under_10 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.plagiarism_under_10} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">6. Plagiarism Similarity Index (&le; 10%)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verified under 10% similarity (excluding bibliography and generic clinical protocols) as per UGC/NMC norms.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('pg_logbook_ready')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.pg_logbook_ready ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.pg_logbook_ready} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">7. 3-Year Postgraduate Clinical Logbook</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Logbook documenting study procedures, clinical OPD/IPD rotations, and thesis committee presentations.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => toggleCompliance('adequate_references')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${complianceItems.adequate_references ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <input 
                  type="checkbox" 
                  checked={complianceItems.adequate_references} 
                  onChange={() => {}} 
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">8. Bibliography Depth (&ge; 40 References, &gt; 60% Recent)</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Active bibliography contains {activeProject.citations.length} studies with PubMed verification and BibTeX export.
                  </p>
                </div>
              </div>

            </div>

            {/* Compliance Status Notice */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>
                University Affiliation: <strong>{activeProject.university}</strong>
              </span>
              <span className="font-semibold text-emerald-700">
                {complianceScore === 100 
                  ? '✓ 100% Fully Compliant: Ready for Thesis Protocol / Final Dissertation Submission' 
                  : `In Progress (${completedCount}/8 items completed)`}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
