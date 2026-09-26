import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardCheck,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Download,
  Copy,
  FileText,
  Calculator,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Award,
  GitBranch,
  Calendar,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import {
  FlowchartConfig,
  DEFAULT_FLOWCHART_CONFIG,
  generateFlowchartMarkdownSection,
  GanttMilestone,
  DEFAULT_GANTT_MILESTONES,
  generateGanttMarkdownTable,
  CLINICAL_SCORING_SYSTEMS
} from '../utils/advancedThesisSuiteUtils';
import { buildAutoTypedThesisFromTopic } from '../utils/autoTypingThesisEngine';

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
    chapters: Array<{ id: string; name: string; description: string; content: string }>;
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string; doi?: string; url?: string }>;
  };
  showToast: (msg: string) => void;
  onApplyToChapter: (chapterId: string, contentToAppendOrReplace: string, mode: 'replace' | 'append') => void;
}

export const ProtocolBuilder: React.FC<Props> = ({
  activeProject,
  showToast,
  onApplyToChapter
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'protocol' | 'flowchart' | 'gantt' | 'scores' | 'samplesize' | 'iec_ctri' | 'bcbr_drp' | 'icmr_grant'>('protocol');

  // ICMR ₹50,000 MD/MS Thesis Financial Grant & DRC Budget State
  const [grantScheme, setGrantScheme] = useState<'ICMR_MD_MS_50K' | 'INTRAMURAL_COLLEGE' | 'SELF_DEPT'>('ICMR_MD_MS_50K');
  const [drcApprovalNo, setDrcApprovalNo] = useState<string>(`DRC/${new Date().getFullYear()}/PG/${Math.floor(10 + Math.random() * 89)}`);
  const [kitCostRs, setKitCostRs] = useState<number>(34000);
  const [vacutainerCostRs, setVacutainerCostRs] = useState<number>(8500);
  const [printingStatCostRs, setPrintingStatCostRs] = useState<number>(7500);

  // NMC Mandatory BCBR (Basic Course in Biomedical Research) & DRP (District Residency Programme) Logbook State
  const [bcbrCertificateId, setBcbrCertificateId] = useState<string>('NPTEL-ICMR-NIE-BCBR-2025-88412');
  const [bcbrScorePct, setBcbrScorePct] = useState<number>(88);
  const [drpHospitalName, setDrpHospitalName] = useState<string>('District Civil Hospital (NMC 3-Month District Residency Programme)');
  const [drpRotationTerm, setDrpRotationTerm] = useState<string>('2nd Year PG Residency (Semester III/IV — 3 Months)');

  // IEC & CTRI Dossier State
  const [iecRefNumber, setIecRefNumber] = useState<string>(`IEC/${new Date().getFullYear()}/PG/${Math.floor(100 + Math.random() * 899)}`);
  const [iecRiskLevel, setIecRiskLevel] = useState<'less_than_minimal' | 'minimal_risk' | 'minor_increase'>('minimal_risk');
  const [ctriStudyType, setCtriStudyType] = useState<'Observational' | 'Interventional (RCT / Clinical Trial)'>('Observational');
  const [fundingSource, setFundingSource] = useState<string>('Institutional / Departmental Resources (No financial burden on patient)');

  // Interactive Sample Size & Statistical Power Calculator State
  const [ssFormulaType, setSsFormulaType] = useState<'cochran_prevalence' | 'two_means' | 'two_proportions' | 'buderer_diagnostic'>('cochran_prevalence');
  const [ssConfidenceLevel, setSsConfidenceLevel] = useState<'95' | '99'>('95');
  const [ssPowerLevel, setSsPowerLevel] = useState<'80' | '90'>('80');
  const [ssPrevalencePct, setSsPrevalencePct] = useState<number>(25);
  const [ssPrecisionPct, setSsPrecisionPct] = useState<number>(8);
  const [ssAttritionPct, setSsAttritionPct] = useState<number>(10);
  const [ssMean1, setSsMean1] = useState<number>(14.2);
  const [ssMean2, setSsMean2] = useState<number>(18.6);
  const [ssPooledSd, setSsPooledSd] = useState<number>(7.8);
  const [ssProp1Pct, setSsProp1Pct] = useState<number>(68);
  const [ssProp2Pct, setSsProp2Pct] = useState<number>(40);
  const [ssDiagSensPct, setSsDiagSensPct] = useState<number>(88);
  const [ssReferenceStudy, setSsReferenceStudy] = useState<string>('Sharma SK et al., Indian J Med Res (ICMR), 2024');

  const computeSampleSizeResult = () => {
    const zAlpha = ssConfidenceLevel === '99' ? 2.576 : 1.96;
    const zBeta = ssPowerLevel === '90' ? 1.282 : 0.842;
    const attritionFactor = 1 / Math.max(0.5, 1 - ssAttritionPct / 100);

    if (ssFormulaType === 'cochran_prevalence') {
      const p = Math.min(0.99, Math.max(0.01, ssPrevalencePct / 100));
      const q = 1 - p;
      const d = Math.min(0.25, Math.max(0.01, ssPrecisionPct / 100));
      const rawN = Math.ceil((zAlpha * zAlpha * p * q) / (d * d));
      const finalN = Math.ceil(rawN * attritionFactor);
      const markdown = `### Mathematical Sample Size Calculation (Cochran's Formula for Observational Study)
- **Reference Study:** ${ssReferenceStudy}
- **Formula Used:** $n = \\frac{Z_{1-\\alpha/2}^2 \\cdot P \\cdot (1 - P)}{d^2}$
- **Statistical Parameters:**
  - Confidence Level ($1 - \\alpha$): **${ssConfidenceLevel}%** ($Z_{1-\\alpha/2} = ${zAlpha}$)
  - Expected Prevalence / Proportion ($P$): **${ssPrevalencePct}%** ($P = ${p.toFixed(2)}, Q = 1 - P = ${q.toFixed(2)}$)
  - Absolute Precision / Margin of Error ($d$): **${ssPrecisionPct}%** ($d = ${d.toFixed(2)}$)
- **Step-by-Step Calculation:**
  - $n = \\frac{(${zAlpha})^2 \\times ${p.toFixed(2)} \\times ${q.toFixed(2)}}{(${d.toFixed(2)})^2} = \\frac{${(zAlpha * zAlpha * p * q).toFixed(4)}}{${(d * d).toFixed(4)}} = ${rawN}$ patients
- **Attrition / Non-Response Adjustment (${ssAttritionPct}%):**
  - **Final Minimum Required Sample Size ($N$): ${finalN} patients**`;
      return { rawN, finalN, perArmN: null as number | null, formulaLabel: "Cochran's Prevalence Formula (n = Z²PQ / d²)", markdown };
    }

    if (ssFormulaType === 'two_means') {
      const diff = Math.max(0.1, Math.abs(ssMean1 - ssMean2));
      const sd = Math.max(0.1, ssPooledSd);
      const perGroupRaw = Math.ceil((2 * Math.pow(zAlpha + zBeta, 2) * sd * sd) / (diff * diff));
      const perGroupFinal = Math.ceil(perGroupRaw * attritionFactor);
      const rawN = perGroupRaw * 2;
      const finalN = perGroupFinal * 2;
      const markdown = `### Mathematical Sample Size Calculation (Two-Group Mean Comparison Formula)
- **Reference Study:** ${ssReferenceStudy}
- **Formula Used:** $n_{\\text{per group}} = \\frac{2 (Z_{1-\\alpha/2} + Z_{1-\\beta})^2 \\cdot \\sigma^2}{(\\mu_1 - \\mu_2)^2}$
- **Statistical Parameters:**
  - Two-Sided Alpha ($\\alpha$): **${ssConfidenceLevel === '99' ? '0.01' : '0.05'}** ($Z_{1-\\alpha/2} = ${zAlpha}$)
  - Statistical Power ($1 - \\beta$): **${ssPowerLevel}%** ($Z_{1-\\beta} = ${zBeta}$)
  - Expected Group 1 Mean ($\\mu_1$): **${ssMean1}** | Expected Group 2 Mean ($\\mu_2$): **${ssMean2}** (Mean Difference $\\Delta = ${diff.toFixed(2)}$)
  - Pooled Standard Deviation ($\\sigma$): **${sd}**
- **Step-by-Step Calculation:**
  - $n_{\\text{per group}} = \\frac{2 \\times (${zAlpha} + ${zBeta})^2 \\times (${sd})^2}{(${diff.toFixed(2)})^2} = ${perGroupRaw}$ per arm (Total $N = ${rawN}$)
- **Attrition Adjustment (${ssAttritionPct}%):**
  - **Final Sample Size ($N$): ${finalN} patients (${perGroupFinal} in Group A vs. ${perGroupFinal} in Group B)**`;
      return { rawN, finalN, perArmN: perGroupFinal, formulaLabel: 'Two-Group Mean Comparison (Unpaired t-test / RCT)', markdown };
    }

    if (ssFormulaType === 'two_proportions') {
      const p1 = Math.min(0.99, Math.max(0.01, ssProp1Pct / 100));
      const p2 = Math.min(0.99, Math.max(0.01, ssProp2Pct / 100));
      const diff = Math.max(0.02, Math.abs(p1 - p2));
      const perGroupRaw = Math.ceil(
        (Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))) / (diff * diff)
      );
      const perGroupFinal = Math.ceil(perGroupRaw * attritionFactor);
      const rawN = perGroupRaw * 2;
      const finalN = perGroupFinal * 2;
      const markdown = `### Mathematical Sample Size Calculation (Two-Group Proportion Comparison)
- **Reference Study:** ${ssReferenceStudy}
- **Formula Used:** $n_{\\text{per group}} = \\frac{(Z_{1-\\alpha/2} + Z_{1-\\beta})^2 \\cdot [p_1(1-p_1) + p_2(1-p_2)]}{(p_1 - p_2)^2}$
- **Statistical Parameters:**
  - Confidence Level: **${ssConfidenceLevel}%** ($Z_{1-\\alpha/2} = ${zAlpha}$) | Power: **${ssPowerLevel}%** ($Z_{1-\\beta} = ${zBeta}$)
  - Expected Proportion in Group 1 ($p_1$): **${ssProp1Pct}%** | Group 2 ($p_2$): **${ssProp2Pct}%**
- **Step-by-Step Calculation:**
  - Minimum required per arm = **${perGroupRaw}** (Unadjusted Total = **${rawN}**)
- **Attrition Adjustment (${ssAttritionPct}%):**
  - **Final Sample Size ($N$): ${finalN} patients (${perGroupFinal} in Arm A vs. ${perGroupFinal} in Arm B)**`;
      return { rawN, finalN, perArmN: perGroupFinal, formulaLabel: 'Two-Group Proportion Comparison (Chi-Square / Trial)', markdown };
    }

    // Buderer Diagnostic Sensitivity Formula
    const sn = Math.min(0.99, Math.max(0.5, ssDiagSensPct / 100));
    const prev = Math.min(0.95, Math.max(0.05, ssPrevalencePct / 100));
    const d = Math.min(0.2, Math.max(0.02, ssPrecisionPct / 100));
    const rawN = Math.ceil((zAlpha * zAlpha * sn * (1 - sn)) / (d * d * prev));
    const finalN = Math.ceil(rawN * attritionFactor);
    const markdown = `### Mathematical Sample Size Calculation (Buderer's Diagnostic Accuracy Formula)
- **Reference Study:** ${ssReferenceStudy}
- **Formula Used:** $N = \\frac{Z_{1-\\alpha/2}^2 \\cdot S_N (1 - S_N)}{d^2 \\cdot \\text{Prevalence}}$
- **Statistical Parameters:**
  - Confidence Level: **${ssConfidenceLevel}%** ($Z_{1-\\alpha/2} = ${zAlpha}$)
  - Expected Diagnostic Sensitivity ($S_N$): **${ssDiagSensPct}%** ($S_N = ${sn.toFixed(2)}$)
  - Disease Prevalence in Study Cohort: **${ssPrevalencePct}%** (${prev.toFixed(2)})
  - Allowable Margin of Error ($d$): **${ssPrecisionPct}%** (${d.toFixed(2)})
- **Step-by-Step Calculation:**
  - Unadjusted Sample Size = **${rawN}** subjects
- **Attrition Adjustment (${ssAttritionPct}%):**
  - **Final Required Diagnostic Cohort ($N$): ${finalN} patients**`;
    return { rawN, finalN, perArmN: null as number | null, formulaLabel: "Buderer's Diagnostic Sensitivity/Specificity Formula (STARD)", markdown };
  };

  const sampleSizeCalc = computeSampleSizeResult();

  // Protocol State
  const [protocolTitle, setProtocolTitle] = useState(activeProject.title);
  const [background, setBackground] = useState(
    'Hospital-based prospective clinical evaluation addressing a high-priority diagnostic and prognostic gap in Indian tertiary teaching hospitals. Early biomarker and clinical severity stratification enables timely therapeutic intervention and reduces target-organ morbidity.'
  );
  const [researchQuestion, setResearchQuestion] = useState(
    `Does a statistically significant clinical and biochemical correlation exist in patients evaluated for "${activeProject.title}" at a tertiary care medical college hospital?`
  );
  const [aims, setAims] = useState(
    'Primary Aim: To evaluate the clinical profile, diagnostic biomarker correlation, and primary therapeutic outcomes.\nSecondary Objectives:\n1. To assess the demographic and socioeconomic distribution using the Modified Kuppuswamy Scale.\n2. To determine diagnostic sensitivity, specificity, and ROC cut-off thresholds.'
  );
  const [hypothesis, setHypothesis] = useState(
    'Null Hypothesis (H0): No significant correlation exists between the primary biomarker/parameter and clinical severity.\nAlternative Hypothesis (H1): A statistically significant correlation (p < 0.05) exists between the studied parameter and clinical severity.'
  );
  const [design, setDesign] = useState('Hospital-based prospective observational study.');
  const [inclusion, setInclusion] = useState(
    'Consecutive consenting adult patients aged 18–65 years fulfilling diagnostic criteria and providing written bilingual informed consent.'
  );
  const [exclusion, setExclusion] = useState(
    'Patients with terminal systemic malignancy, severe uncompensated hepatic/renal failure, pregnancy, or refusal of written informed consent.'
  );
  const [sampleSize, setSampleSize] = useState(
    'N = 120 confirmed cases calculated using Z_(α/2) = 1.96 (95% CI), 80% statistical power, and 5% margin of error.'
  );
  const [variables, setVariables] = useState(
    'Independent variable: Primary diagnostic biomarker / clinical exposure.\nDependent variables: Clinical severity grade, biochemical titers, length of hospital stay, and composite outcome.'
  );
  const [statsPlan, setStatsPlan] = useState(
    'Continuous variables expressed as Mean ± SD (Student t-test / ANOVA). Categorical variables compared via Chi-Square (χ²) or Fisher Exact test. Correlation via Pearson r / Spearman rho, and ROC curve for diagnostic cutoffs (SPSS / R).'
  );
  const [timeline, setTimeline] = useState(
    'Months 1–4: Synopsis & IEC Approval.\nMonths 5–18: Patient screening, bilingual consent & enrollment.\nMonths 19–21: Master chart compilation & biostatistics.\nMonths 22–24: 6-Chapter Dissertation writing, Plagiarism audit (<10%) & University submission.'
  );

  // Protocol Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState<string>('');
  const [autoTypeOnTopicEntry, setAutoTypeOnTopicEntry] = useState<boolean>(true);
  const [isAutoTypingSynopsis, setIsAutoTypingSynopsis] = useState<boolean>(false);
  const [autoTypeStageText, setAutoTypeStageText] = useState<string>('');
  const synopsisTypeIntervalRef = useRef<number | null>(null);

  const triggerLiveAutoTypeSynopsis = (topicToType: string) => {
    const clean = (topicToType || '').trim();
    if (clean.length < 5 || isLocked) return;

    if (synopsisTypeIntervalRef.current) {
      window.clearInterval(synopsisTypeIntervalRef.current);
      synopsisTypeIntervalRef.current = null;
    }

    const built = buildAutoTypedThesisFromTopic(
      clean,
      activeProject.specialty,
      activeProject.university,
      activeProject.collegeName,
      activeProject.candidateName,
      activeProject.guideName
    );

    setIsAutoTypingSynopsis(true);
    setAutoTypeStageText('Typing Aim of Thesis → Introduction → Materials & Methods → Observations → References...');

    let step = 0;
    const totalSteps = 28;
    synopsisTypeIntervalRef.current = window.setInterval(() => {
      step += 1;
      const ratio = Math.min(1, step / totalSteps);

      const sliceByRatio = (str: string) => str.slice(0, Math.max(1, Math.floor(str.length * ratio)));

      setBackground(sliceByRatio(built.synopsisFields.background));
      setResearchQuestion(sliceByRatio(built.synopsisFields.researchQuestion));
      setAims(sliceByRatio(built.synopsisFields.aims));
      setHypothesis(sliceByRatio(built.synopsisFields.hypothesis));
      setDesign(sliceByRatio(built.synopsisFields.design));
      setSampleSize(sliceByRatio(built.synopsisFields.sampleSize));
      setInclusion(sliceByRatio(built.synopsisFields.inclusion));
      setExclusion(sliceByRatio(built.synopsisFields.exclusion));
      setVariables(sliceByRatio(built.synopsisFields.variables));
      setStatsPlan(sliceByRatio(built.synopsisFields.statsPlan));
      setGeneratedProtocol(sliceByRatio(built.synopsisFields.compiledSynopsis));

      if (ratio < 0.25) {
        setAutoTypeStageText('Auto-Typing 1/5: Aim of Thesis & PICOT Objectives...');
      } else if (ratio < 0.5) {
        setAutoTypeStageText('Auto-Typing 2/5: Introduction & Clinical Rationale...');
      } else if (ratio < 0.75) {
        setAutoTypeStageText('Auto-Typing 3/5: Materials & Methods, Sample Size & Inclusion/Exclusion...');
      } else if (ratio < 0.98) {
        setAutoTypeStageText('Auto-Typing 4/5: Expected Observations, Biostats & Vancouver References...');
      } else {
        setAutoTypeStageText('✓ Auto-Typed Aim, Introduction, Materials & Methods, Observations & References!');
        setIsAutoTypingSynopsis(false);
        if (synopsisTypeIntervalRef.current) {
          window.clearInterval(synopsisTypeIntervalRef.current);
          synopsisTypeIntervalRef.current = null;
        }
      }
    }, 35);
  };

  useEffect(() => {
    if (activeProject.title && activeProject.title !== protocolTitle) {
      setProtocolTitle(activeProject.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject.title]);

  useEffect(() => {
    if (!autoTypeOnTopicEntry || isLocked) return;
    const trimmed = (protocolTitle || '').trim();
    if (trimmed.length < 6) return;
    const timer = window.setTimeout(() => {
      triggerLiveAutoTypeSynopsis(trimmed);
    }, 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocolTitle, autoTypeOnTopicEntry]);

  // STROBE / CONSORT / PRISMA Flowchart State
  const [flowCfg, setFlowCfg] = useState<FlowchartConfig>(DEFAULT_FLOWCHART_CONFIG);

  // 3-Year Gantt Chart State
  const [ganttMilestones, setGanttMilestones] = useState<GanttMilestone[]>(DEFAULT_GANTT_MILESTONES);

  // Clinical Scoring System State
  const [selectedScoreId, setSelectedScoreId] = useState<string>(CLINICAL_SCORING_SYSTEMS[0].id);
  const selectedScore =
    CLINICAL_SCORING_SYSTEMS.find(s => s.id === selectedScoreId) || CLINICAL_SCORING_SYSTEMS[0];

  // Interactive Modified Kuppuswamy 2026 (CPI-IW Adjusted) Bedside Calculator State
  const [kuppEduScore, setKuppEduScore] = useState<number>(6);
  const [kuppOccScore, setKuppOccScore] = useState<number>(6);
  const [kuppIncScore, setKuppIncScore] = useState<number>(6);
  const kuppTotalScore = kuppEduScore + kuppOccScore + kuppIncScore;
  const kuppClassInfo =
    kuppTotalScore >= 26
      ? { className: 'Upper (Class I)', range: '26 – 29', color: 'bg-emerald-800 text-amber-200' }
      : kuppTotalScore >= 16
        ? { className: 'Upper Middle (Class II)', range: '16 – 25', color: 'bg-teal-800 text-white' }
        : kuppTotalScore >= 11
          ? { className: 'Lower Middle (Class III)', range: '11 – 15', color: 'bg-indigo-800 text-white' }
          : kuppTotalScore >= 5
            ? { className: 'Upper Lower (Class IV)', range: '5 – 10', color: 'bg-amber-600 text-slate-950' }
            : { className: 'Lower (Class V)', range: '< 5 (3 – 4)', color: 'bg-rose-800 text-white' };

  const handleGenerateProtocol = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const ganttText = generateGanttMarkdownTable(ganttMilestones);
      const flowText = generateFlowchartMarkdownSection(flowCfg);
      const narrative = `========================================================
INDIAN NATIONAL MEDICAL COMMISSION (NMC) COMPLIANT PROTOCOL & SYNOPSIS
========================================================
PROPOSED DISSERTATION PROTOCOL FOR MD/MS/DNB SUBMISSION

A. PRIMARY ADMINISTRATIVE DETAILS
- Candidate: Dr. ${activeProject.candidateName}
- Department/Specialty: ${activeProject.specialty}
- Institutional Affiliation: ${activeProject.collegeName}
- Affiliated Health University: ${activeProject.university}
- Chief Guide: Prof. Dr. ${activeProject.guideName}
- Co-Guide: ${activeProject.coGuideName || 'None'}

B. TITLE OF THE PROPOSED STUDY
"${protocolTitle}"

C. BACKGROUND AND RATIONALE
${background}

D. PRIMARY CLINICAL RESEARCH QUESTION (PICOT)
${researchQuestion}

E. AIMS AND OBJECTIVES
${aims}

F. HYPOTHESIS FOR VALIDATION
${hypothesis}

G. DETAILED MATERIALS AND METHODS
1. Study Design: ${design}
2. Patient Inclusion Criteria: ${inclusion}
3. Patient Exclusion Criteria: ${exclusion}
4. Statistical Sample-Size Justification: ${sampleSize}
5. Key Operational Variables: ${variables}

${flowText}

H. STATISTICAL ANALYSIS SCHEME
${statsPlan}

I. PROPOSED 24-MONTH RESIDENCY GANTT TIMELINE
${timeline}
${ganttText}

J. INSTITUTIONAL ETHICAL CLEARANCE (ICMR 2017)
The protocol is submitted to the Institutional Ethics Committee (IEC) of ${activeProject.collegeName}. Written bilingual informed consent (in State Vernacular and English) will be obtained from each participant.`;
      setGeneratedProtocol(narrative);
      setIsGenerating(false);
      showToast('Compiled NMC Synopsis with STROBE Flowchart & Gantt Timeline!');
    }, 400);
  };

  const handleExportProtocolDoc = () => {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>NMC Dissertation Synopsis - ${protocolTitle}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.5cm; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 15pt; text-align: center; color: #064e3b; text-transform: uppercase; }
  h2 { font-size: 12.5pt; color: #881337; border-bottom: 1.5pt solid #059669; padding-bottom: 2pt; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #64748b; padding: 6pt; font-size: 10pt; text-align: left; }
  th { background: #d1fae5; color: #064e3b; font-weight: bold; }
</style></head>
<body>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;">Affiliated to ${activeProject.university} • Department of ${activeProject.specialty}</p>
  <h2 style="text-align:center;">NMC POSTGRADUATE DISSERTATION SYNOPSIS & IEC PROTOCOL</h2>
  <p><strong>Title of Study:</strong> ${protocolTitle}</p>
  <p><strong>Candidate:</strong> Dr. ${activeProject.candidateName} &nbsp;|&nbsp; <strong>Guide:</strong> Prof. Dr. ${activeProject.guideName}</p>
  <h2>1. Background & Rationale</h2><p>${background}</p>
  <h2>2. Aims & Objectives</h2><p style="white-space:pre-line;">${aims}</p>
  <h2>3. Materials & Methods</h2>
  <p><strong>Study Design:</strong> ${design}</p>
  <p><strong>Sample Size:</strong> ${sampleSize}</p>
  <p><strong>Inclusion Criteria:</strong> ${inclusion}</p>
  <p><strong>Exclusion Criteria:</strong> ${exclusion}</p>
  <h2>4. ${flowCfg.framework} Patient Recruitment Flow Diagram</h2>
  <table>
    <tr><th>Stage</th><th>Cohort Description</th><th>Patient Count</th></tr>
    <tr><td>1. Screening</td><td>Total consecutive patients screened for eligibility</td><td>N = ${flowCfg.totalScreened}</td></tr>
    <tr><td>2. Exclusions</td><td>${flowCfg.excludedReason1}; ${flowCfg.excludedReason2}; ${flowCfg.excludedReason3}</td><td>n = ${flowCfg.excludedTotal}</td></tr>
    <tr><td>3. Enrollment</td><td>Eligible consenting participants enrolled in study</td><td>N = ${flowCfg.finalEnrolled}</td></tr>
    <tr><td>4. Stratification</td><td>${flowCfg.armALabel} (n=${flowCfg.armACount}) vs. ${flowCfg.armBLabel} (n=${flowCfg.armBCount})</td><td>N = ${flowCfg.finalEnrolled}</td></tr>
    <tr><td>5. Final Analysis</td><td>Completed statistical Master Chart evaluation</td><td>N = ${flowCfg.finalAnalyzed} (100%)</td></tr>
  </table>
  <h2>5. 24-Month Postgraduate Dissertation Gantt Chart</h2>
  <table>
    <tr><th>Study Milestone</th><th>Key Deliverable</th><th>M1–4</th><th>M5–8</th><th>M9–12</th><th>M13–16</th><th>M17–20</th><th>M21–24</th><th>Status</th></tr>
    ${ganttMilestones
      .map(
        m =>
          `<tr><td><strong>${m.phase}</strong></td><td>${m.deliverable}</td>${[1, 2, 3, 4, 5, 6]
            .map(idx => `<td style="text-align:center;background:${m.monthsActive.includes(idx) ? '#a7f3d0' : '#ffffff'};">${m.monthsActive.includes(idx) ? '██' : '—'}</td>`)
            .join('')}<td>${m.status}</td></tr>`
      )
      .join('')}
  </table>
</body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NMC_Synopsis_Flowchart_Gantt_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded Complete NMC Synopsis + STROBE Flowchart + Gantt Chart (.DOC)!');
  };

  const toggleGanttCell = (milestoneId: string, blockIdx: number) => {
    setGanttMilestones(prev =>
      prev.map(m => {
        if (m.id !== milestoneId) return m;
        const exists = m.monthsActive.includes(blockIdx);
        const nextMonths = exists
          ? m.monthsActive.filter(x => x !== blockIdx)
          : [...m.monthsActive, blockIdx].sort();
        return { ...m, monthsActive: nextMonths };
      })
    );
  };

  const cycleMilestoneStatus = (milestoneId: string) => {
    const order: Array<GanttMilestone['status']> = ['Completed', 'In Progress', 'Scheduled'];
    setGanttMilestones(prev =>
      prev.map(m => {
        if (m.id !== milestoneId) return m;
        const nextIdx = (order.indexOf(m.status) + 1) % order.length;
        return { ...m, status: order[nextIdx] };
      })
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-emerald-300 overflow-hidden">
      {/* Header Banner — Light Green & Pink High-Contrast */}
      <div className="p-5 bg-gradient-to-r from-emerald-200 via-teal-100 to-pink-200 text-slate-900 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-pink-300">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-800 text-amber-200 rounded-xl border border-emerald-950 shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-serif font-black tracking-tight text-indigo-950">
                  NMC Synopsis, STROBE/CONSORT Flowchart, Gantt Timeline & Clinical Scores
                </h2>
                <span className="px-2.5 py-0.5 bg-rose-700 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  IEC • CTRI • STROBE • Gantt • Kuppuswamy/SOFA
                </span>
              </div>
              <p className="text-xs text-rose-950 font-semibold mt-0.5">
                Build your Ethics Committee Synopsis, Visual Patient Screening Flowchart, 3-Year Residency Gantt Chart, and Clinical Proforma Scoring Tables with 1-Click Chapter Insertion & Word (.DOC) Export.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Sub-Tab Switcher */}
        <div className="flex flex-wrap bg-white/95 border-2 border-emerald-500 p-1 rounded-xl text-xs font-extrabold shadow-xs gap-1">
          <button
            onClick={() => setActiveSubTab('protocol')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'protocol'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-indigo-950 hover:bg-emerald-50'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>1. NMC Synopsis</span>
          </button>
          <button
            onClick={() => setActiveSubTab('flowchart')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'flowchart'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-rose-950 hover:bg-pink-50'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>2. STROBE / CONSORT Flowchart</span>
          </button>
          <button
            onClick={() => setActiveSubTab('gantt')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'gantt'
                ? 'bg-indigo-800 text-white shadow-2xs'
                : 'text-indigo-950 hover:bg-sky-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3. 3-Yr Gantt Timeline</span>
          </button>
          <button
            onClick={() => setActiveSubTab('scores')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'scores'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-900 hover:bg-amber-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>4. Clinical Calculators & Scores</span>
          </button>
          <button
            onClick={() => setActiveSubTab('samplesize')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'samplesize'
                ? 'bg-teal-800 text-amber-200 shadow-2xs'
                : 'text-teal-950 hover:bg-teal-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>5. Sample Size & Power</span>
          </button>
          <button
            onClick={() => setActiveSubTab('iec_ctri')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'iec_ctri'
                ? 'bg-amber-400 text-slate-950 border border-amber-600 shadow-2xs'
                : 'text-indigo-950 hover:bg-amber-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. IEC &amp; CTRI Dossier</span>
          </button>
          <button
            onClick={() => setActiveSubTab('bcbr_drp')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'bcbr_drp'
                ? 'bg-emerald-900 text-amber-200 border border-amber-400 shadow-2xs'
                : 'text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>7. NMC BCBR &amp; DRP Logbook</span>
          </button>
          <button
            onClick={() => setActiveSubTab('icmr_grant')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'icmr_grant'
                ? 'bg-rose-800 text-amber-200 border border-amber-300 shadow-2xs'
                : 'text-rose-950 hover:bg-rose-50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>8. ICMR ₹50K Grant &amp; DRC Budget</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ===================================================================
            SUB-TAB 1: NMC PROTOCOL & SYNOPSIS BUILDER
           =================================================================== */}
        {activeSubTab === 'protocol' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 bg-emerald-50/60 border-2 border-emerald-300 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    NMC Board Prescribed Synopsis Form
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const s = activeProject.specialty.toLowerCase();
                        setProtocolTitle(activeProject.title);
                        if (s.includes('emergency') || s.includes('critical care') || s.includes('trauma') || s.includes('disaster') || s.includes('aviation') || s.includes('aerospace')) {
                          setDesign('Hospital-based prospective observational emergency resuscitation and point-of-care prognostic accuracy study.');
                          setSampleSize('N = 120 consecutive Emergency Department Red/Yellow-Zone triage patients (95% CI, 80% power, 10% attrition buffer).');
                          setAims('Primary Aim: To evaluate the diagnostic and prognostic accuracy of emergency point-of-care parameters (E-FAST / RUSH ultrasound, arterial lactate clearance, and qSOFA/NEWS2) in predicting ICU admission and 28-day outcomes.\nSecondary Objectives:\n1. To correlate Emergency Severity Index (ESI) triage category and Shock Index with vasopressor requirement.\n2. To determine ROC curve optimal cut-offs for early resuscitation escalation.');
                          setInclusion('Consecutive patients aged >= 18 years presenting to the Emergency Medicine Red/Yellow resuscitation bay fulfilling study triage criteria with written bilingual informed consent from patient/LAR.');
                          setExclusion('Patients brought dead (DOA), post-cardiac arrest prior to ED arrival, inter-hospital transfers after >24 hours of resuscitation, or refusal of consent.');
                          setVariables('Independent Variables: ESI Triage Level, Point-of-Care E-FAST/RUSH findings, 0h & 6h Arterial Lactate.\nDependent Variables: qSOFA/SOFA score, Shock Index, Vasopressor/Ventilator need, and 28-Day Survival.');
                          setStatsPlan('Shapiro-Wilk normality check; Unpaired t-test / Mann-Whitney U test; Chi-Square test; AUROC curve with Youden Index (J); and Multivariate Logistic Regression (SPSS / R).');
                          setFlowCfg({
                            ...flowCfg,
                            framework: 'STROBE',
                            totalScreened: 156,
                            excludedTotal: 36,
                            excludedReason1: 'Prior external resuscitation >24 hrs (n = 16)',
                            excludedReason2: 'Terminal malignancy / DOA (n = 12)',
                            excludedReason3: 'Refused LAR consent (n = 8)',
                            finalEnrolled: 120,
                            armALabel: 'High-Risk Resuscitation / ICU Cohort',
                            armACount: 60,
                            armBLabel: 'Hemodynamically Stable Ward Cohort',
                            armBCount: 60,
                            finalAnalyzed: 120
                          });
                        } else if (s.includes('anesthes') || s.includes('anaesthes') || s.includes('pain') || s.includes('perioperative')) {
                          setDesign('Prospective, randomized, double-blind, parallel-group comparative clinical trial (CONSORT Compliant).');
                          setSampleSize('N = 120 ASA Physical Status I–II surgical patients (n = 60 in Group A vs. n = 60 in Group B) powered at 80% with alpha = 0.05.');
                          setAims('Primary Aim: To compare intraoperative hemodynamic stability, sensory/motor block dynamics, and time to first rescue analgesia between the two perioperative regimens.\nSecondary Objectives:\n1. To compare postoperative Visual Analog Scale (VAS) pain scores at 2, 6, 12, and 24 hours.\n2. To evaluate 24-hour total rescue analgesic consumption, Ramsay Sedation Score, and PACU Modified Aldrete recovery.');
                          setInclusion('Consenting adult patients aged 18–65 years of ASA Physical Status I and II scheduled for elective surgery under standardized anesthetic protocol.');
                          setExclusion('ASA Grade III–IV, coagulopathy/anticoagulant therapy, local infection at block site, known allergy to study drugs, or BMI > 35 kg/m².');
                          setVariables('Independent Variable: Allocated Anesthetic / Ultrasound-Guided Nerve Block Regimen (Group A vs. Group B).\nDependent Variables: MAP, HR, Onset/Duration of Block, Postop VAS Score, Time to First Rescue Analgesia, PONV.');
                          setStatsPlan('Two-group comparison via Unpaired Student t-test (hemodynamics, block duration), Mann-Whitney U test (VAS/Ramsay ordinal scores), and Kaplan-Meier time to rescue analgesia.');
                          setFlowCfg({
                            ...flowCfg,
                            framework: 'CONSORT',
                            totalScreened: 148,
                            excludedTotal: 28,
                            excludedReason1: 'ASA Grade >= III or coagulopathy (n = 14)',
                            excludedReason2: 'Known drug allergy / BMI > 35 (n = 8)',
                            excludedReason3: 'Declined randomization consent (n = 6)',
                            finalEnrolled: 120,
                            armALabel: 'Group A: Study Intervention / Adjuvant Arm',
                            armACount: 60,
                            armBLabel: 'Group B: Control Standard Regimen Arm',
                            armBCount: 60,
                            finalAnalyzed: 120
                          });
                        } else if (s.includes('pathol') || s.includes('microbiol') || s.includes('pharmacol') || s.includes('biochem') || s.includes('forensic') || s.includes('transfusion') || s.includes('immunohematol') || s.includes('lab')) {
                          setDesign('Cross-sectional diagnostic accuracy, clinico-pathological / microbiological correlation, and quality-control validation study (STARD / CLSI Compliant).');
                          setSampleSize('N = 120 consecutive clinical specimens / biopsy blocks / cases calculated via Buderer diagnostic sensitivity formula (95% CI).');
                          setAims('Primary Aim: To evaluate the diagnostic sensitivity, specificity, and clinico-pathological / microbiological concordance of the index assay against the gold-standard reference method.\nSecondary Objectives:\n1. To stratify findings according to CLSI M100 breakpoints / WHO Histological Grade / IHC expression.\n2. To determine inter-observer Cohen Kappa (κ) agreement and positive/negative predictive values.');
                          setInclusion('Adequate, properly labeled diagnostic specimens / FFPE tissue blocks / blood units accompanied by complete clinical proforma and IEC approval.');
                          setExclusion('Hemolyzed, autolyzed, insufficient, or improperly preserved specimens, or repeat duplicate isolates from the same patient.');
                          setVariables('Index Variable: Quantitative Biomarker / IHC Expression / Rapid Phenotypic AST Assay.\nReference Standard: Histopathological Gold Standard / Automated VITEK-2 MIC / Nucleic Acid Amplification.');
                          setStatsPlan('Sensitivity, Specificity, PPV, NPV, Likelihood Ratios (LR+/LR-), Cohen Kappa (κ) concordance, Chi-Square test, and ROC Curve (AUROC).');
                        } else if (s.includes('psychiat') || s.includes('geriatric') || s.includes('rehab') || s.includes('pmr') || s.includes('family') || s.includes('palliative') || s.includes('community') || s.includes('psm')) {
                          setDesign('Hospital/Community-based observational analytical and psychometric/functional scale validation study.');
                          setSampleSize('N = 120 consenting participants evaluated using validated ICD-11 / DSM-5-TR and functional quality-of-life scales.');
                          setAims('Primary Aim: To assess the clinical severity spectrum, functional disability, and quality-of-life determinants using standardized rating scales.\nSecondary Objectives:\n1. To correlate symptom severity (HAM-D / PANSS / PHQ-9 / Barthel / ESAS) with Modified Kuppuswamy socioeconomic status.\n2. To identify independent biopsychosocial predictors of caregiver burden and treatment adherence.');
                        } else if (s.includes('obstet') || s.includes('gynaec') || s.includes('gynec') || s.includes('obg') || s.includes('pediatric') || s.includes('paediatric') || s.includes('neonat')) {
                          setDesign('Prospective observational fetomaternal / neonatal-pediatric clinical cohort study.');
                          setSampleSize('N = 120 consecutive consenting antenatal mothers / pediatric admissions evaluated at tertiary teaching hospital.');
                          setAims('Primary Aim: To evaluate early clinical, biophysical, and biomarker predictors of adverse maternal, fetal, or neonatal/pediatric outcomes.\nSecondary Objectives:\n1. To correlate Doppler / severity scores (Bishop / Robson / APGAR / SNAPPE-II / WHO Z-scores) with NICU/PICU stay.\n2. To establish ROC cut-offs for timely perinatal/pediatric intervention.');
                        }
                        showToast(`✨ Loaded NMC Synopsis Preset tailored for ${activeProject.specialty}!`);
                      }}
                      className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-amber-200 border border-emerald-900 px-2.5 py-1 rounded-lg font-black flex items-center space-x-1 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>1-Click Specialty Preset ({activeProject.specialty})</span>
                    </button>
                    <button
                      onClick={() => setIsLocked(!isLocked)}
                      className="text-[11px] bg-amber-300 hover:bg-amber-400 border border-amber-500 px-2.5 py-1 rounded-lg text-slate-950 font-black flex items-center space-x-1 cursor-pointer"
                    >
                      {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{isLocked ? 'Unlock to Edit' : 'Editable Mode'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Approved Protocol / Synopsis Topic (Auto-Types Aim, Intro, Methods, Observations &amp; References):
                      </label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center space-x-1 bg-yellow-200 px-2 py-0.5 rounded border border-blue-900 text-[10px] font-black text-blue-950 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoTypeOnTopicEntry}
                            onChange={e => setAutoTypeOnTopicEntry(e.target.checked)}
                          />
                          <span>⚡ Auto-Type on Topic Entry</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => triggerLiveAutoTypeSynopsis(protocolTitle)}
                          className="px-2 py-0.5 rounded bg-red-700 hover:bg-red-800 text-white text-[10px] font-black cursor-pointer"
                        >
                          Type All Now
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={protocolTitle}
                      onChange={e => setProtocolTitle(e.target.value)}
                      placeholder="Type or paste thesis topic here — automatically starts typing Aim, Introduction, Materials & Methods, Observations & References..."
                      className="w-full p-2 bg-white border-2 border-emerald-500 rounded-lg font-serif font-bold text-slate-900"
                    />
                    {autoTypeStageText && (
                      <div className="mt-1.5 px-2.5 py-1 rounded-md bg-sky-100 border border-sky-400 text-[10px] font-mono font-black text-blue-950 flex items-center justify-between">
                        <span>{isAutoTypingSynopsis ? '🔴 ' : ''}{autoTypeStageText}</span>
                        {isAutoTypingSynopsis && (
                          <span className="inline-block w-2 h-3.5 bg-red-700 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Study Design:
                      </label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={design}
                        onChange={e => setDesign(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-400 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Sample Size Justification:
                      </label>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={sampleSize}
                        onChange={e => setSampleSize(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Aims & Objectives (PICOT):
                    </label>
                    <textarea
                      rows={3}
                      disabled={isLocked}
                      value={aims}
                      onChange={e => setAims(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Inclusion Criteria:
                      </label>
                      <textarea
                        rows={2}
                        disabled={isLocked}
                        value={inclusion}
                        onChange={e => setInclusion(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-400 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Exclusion Criteria:
                      </label>
                      <textarea
                        rows={2}
                        disabled={isLocked}
                        value={exclusion}
                        onChange={e => setExclusion(e.target.value)}
                        className="w-full p-2 bg-white border border-emerald-400 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Statistical Analysis Plan:
                    </label>
                    <textarea
                      rows={2}
                      disabled={isLocked}
                      value={statsPlan}
                      onChange={e => setStatsPlan(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleGenerateProtocol}
                  disabled={isGenerating}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Compile Full Synopsis + Flowchart + Gantt</span>
                </button>
                <button
                  onClick={handleExportProtocolDoc}
                  className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Synopsis (.DOC)</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="bg-slate-50 border-2 border-pink-300 rounded-xl p-4 flex-1 flex flex-col justify-between min-h-[420px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                    Compiled Institutional Synopsis Output
                  </span>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedProtocol || aims);
                        showToast('Synopsis copied to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handleExportProtocolDoc}
                      className="px-2.5 py-1 bg-sky-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Word (.DOC)</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-white p-3.5 border border-slate-200 rounded-lg overflow-y-auto font-mono text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[380px]">
                  {generatedProtocol ||
                    `Click "Compile Full Synopsis + Flowchart + Gantt" on the left to generate your complete NMC / IEC Institutional Synopsis including the STROBE Flowchart and 24-Month Gantt Timeline.`}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-900 font-bold">
                    Includes STROBE Flowchart & 24-Month Gantt Chart
                  </span>
                  <button
                    onClick={() => {
                      const textToInsert =
                        generatedProtocol ||
                        `${generateFlowchartMarkdownSection(flowCfg)}\n${generateGanttMarkdownTable(ganttMilestones)}`;
                      onApplyToChapter('methods', textToInsert, 'append');
                      showToast('Synopsis, STROBE Flowchart & Gantt Chart appended to Chapter 3 (Materials & Methods)!');
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Insert into Chapter 3 (Methods)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 2: PRISMA / STROBE / CONSORT VISUAL FLOWCHART BUILDER
           =================================================================== */}
        {activeSubTab === 'flowchart' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Flowchart Parameters Editor */}
            <div className="lg:col-span-5 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-black text-indigo-950 uppercase tracking-wider flex items-center space-x-1.5">
                  <GitBranch className="w-4 h-4 text-rose-700" />
                  <span>Configure Patient Flow Numbers</span>
                </span>
                <select
                  value={flowCfg.framework}
                  onChange={e =>
                    setFlowCfg({ ...flowCfg, framework: e.target.value as FlowchartConfig['framework'] })
                  }
                  className="p-1.5 bg-white border border-emerald-400 rounded-lg font-black text-indigo-950"
                >
                  <option value="STROBE">STROBE (Observational Cohort)</option>
                  <option value="CONSORT">CONSORT (Clinical Trial)</option>
                  <option value="PRISMA">PRISMA (Systematic Review)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Total Screened (N):
                  </label>
                  <input
                    type="number"
                    value={flowCfg.totalScreened}
                    onChange={e => {
                      const total = Number(e.target.value) || 0;
                      const enrolled = Math.max(0, total - flowCfg.excludedTotal);
                      setFlowCfg({
                        ...flowCfg,
                        totalScreened: total,
                        finalEnrolled: enrolled,
                        armACount: Math.floor(enrolled / 2),
                        armBCount: enrolled - Math.floor(enrolled / 2),
                        finalAnalyzed: Math.max(0, enrolled - flowCfg.lostToFollowUp)
                      });
                    }}
                    className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-rose-800 mb-1">
                    2. Total Excluded (n):
                  </label>
                  <input
                    type="number"
                    value={flowCfg.excludedTotal}
                    onChange={e => {
                      const excl = Number(e.target.value) || 0;
                      const enrolled = Math.max(0, flowCfg.totalScreened - excl);
                      setFlowCfg({
                        ...flowCfg,
                        excludedTotal: excl,
                        finalEnrolled: enrolled,
                        armACount: Math.floor(enrolled / 2),
                        armBCount: enrolled - Math.floor(enrolled / 2),
                        finalAnalyzed: Math.max(0, enrolled - flowCfg.lostToFollowUp)
                      });
                    }}
                    className="w-full p-2 bg-white border border-rose-400 rounded-lg font-mono font-bold text-rose-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Exclusion Breakdown Reasons (Shown in Box 2):
                </label>
                <input
                  type="text"
                  value={flowCfg.excludedReason1}
                  onChange={e => setFlowCfg({ ...flowCfg, excludedReason1: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded"
                />
                <input
                  type="text"
                  value={flowCfg.excludedReason2}
                  onChange={e => setFlowCfg({ ...flowCfg, excludedReason2: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded"
                />
                <input
                  type="text"
                  value={flowCfg.excludedReason3}
                  onChange={e => setFlowCfg({ ...flowCfg, excludedReason3: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block font-bold text-emerald-900 mb-1">
                    Arm A Label & Count:
                  </label>
                  <input
                    type="text"
                    value={flowCfg.armALabel}
                    onChange={e => setFlowCfg({ ...flowCfg, armALabel: e.target.value })}
                    className="w-full p-1.5 bg-white border border-emerald-400 rounded mb-1"
                  />
                  <input
                    type="number"
                    value={flowCfg.armACount}
                    onChange={e => setFlowCfg({ ...flowCfg, armACount: Number(e.target.value) || 0 })}
                    className="w-full p-1.5 bg-white border border-emerald-400 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-indigo-900 mb-1">
                    Arm B Label & Count:
                  </label>
                  <input
                    type="text"
                    value={flowCfg.armBLabel}
                    onChange={e => setFlowCfg({ ...flowCfg, armBLabel: e.target.value })}
                    className="w-full p-1.5 bg-white border border-indigo-400 rounded mb-1"
                  />
                  <input
                    type="number"
                    value={flowCfg.armBCount}
                    onChange={e => setFlowCfg({ ...flowCfg, armBCount: Number(e.target.value) || 0 })}
                    className="w-full p-1.5 bg-white border border-indigo-400 rounded font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const md = generateFlowchartMarkdownSection(flowCfg);
                    onApplyToChapter('methods', md, 'append');
                    showToast(`Inserted ${flowCfg.framework} Flowchart Table into Chapter 3 (Materials & Methods)!`);
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Insert into Chapter 3 (Methods)</span>
                </button>
                <button
                  onClick={handleExportProtocolDoc}
                  className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export (.DOC)</span>
                </button>
              </div>
            </div>

            {/* Right: Visual Publication-Grade STROBE / CONSORT Diagram Canvas */}
            <div className="lg:col-span-7 bg-gradient-to-br from-emerald-50 via-white to-pink-50 border-2 border-pink-300 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
                    Figure 3.1 • {flowCfg.framework} Statement Compliant Diagram
                  </span>
                  <h3 className="text-sm font-serif font-black text-indigo-950">
                    Patient Screening, Exclusion, Stratification & Final Analysis Flowchart
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-800 text-amber-200 rounded-lg text-[10px] font-black">
                  N = {flowCfg.finalAnalyzed} Analyzed
                </span>
              </div>

              {/* Visual Flowchart Nodes */}
              <div className="space-y-3 my-auto">
                {/* Node 1: Screening */}
                <div className="mx-auto max-w-md bg-emerald-800 text-white p-3.5 rounded-xl shadow-sm border-2 border-emerald-950 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Stage 1: Identification & Screening
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    Consecutive Patients Assessed for Eligibility in {activeProject.specialty} OPD/IPD
                  </div>
                  <div className="text-sm font-mono font-black text-emerald-200 mt-1">
                    (N = {flowCfg.totalScreened})
                  </div>
                </div>

                {/* Arrow + Exclusion Branch */}
                <div className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-5 text-right pr-2">
                    <div className="inline-block bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                      ↓ Met Inclusion Criteria
                    </div>
                  </div>
                  <div className="col-span-7 bg-rose-50 border-2 border-rose-400 rounded-xl p-2.5 text-left shadow-2xs">
                    <div className="text-[10px] font-black uppercase text-rose-900">
                      → Excluded Prior to Enrollment (n = {flowCfg.excludedTotal})
                    </div>
                    <ul className="text-[10px] text-slate-800 font-semibold list-disc list-inside mt-1 space-y-0.5">
                      <li>{flowCfg.excludedReason1}</li>
                      <li>{flowCfg.excludedReason2}</li>
                      <li>{flowCfg.excludedReason3}</li>
                    </ul>
                  </div>
                </div>

                {/* Node 2: Enrolled Cohort */}
                <div className="mx-auto max-w-md bg-indigo-900 text-white p-3 rounded-xl shadow-sm border-2 border-indigo-950 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-pink-300">
                    Stage 2: Enrolled Study Cohort (Written Bilingual Consent)
                  </div>
                  <div className="text-sm font-mono font-black text-amber-300 mt-0.5">
                    Final Enrolled Sample Size: N = {flowCfg.finalEnrolled}
                  </div>
                </div>

                {/* Split Arrows */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="bg-emerald-100 border-2 border-emerald-500 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-black uppercase text-emerald-950">
                      Study Arm A
                    </div>
                    <div className="text-xs font-bold text-indigo-950 mt-0.5">
                      {flowCfg.armALabel}
                    </div>
                    <div className="text-sm font-mono font-black text-emerald-800 mt-1">
                      n = {flowCfg.armACount}
                    </div>
                  </div>

                  <div className="bg-pink-100 border-2 border-pink-500 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-black uppercase text-rose-950">
                      Study Arm B
                    </div>
                    <div className="text-xs font-bold text-indigo-950 mt-0.5">
                      {flowCfg.armBLabel}
                    </div>
                    <div className="text-sm font-mono font-black text-rose-800 mt-1">
                      n = {flowCfg.armBCount}
                    </div>
                  </div>
                </div>

                {/* Node 4: Final Analysis */}
                <div className="mx-auto max-w-md bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-3 rounded-xl shadow-sm border-2 border-emerald-950 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                    Stage 3: Master Chart & Statistical Inference Completed
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    Included in Final Parametric / Non-Parametric & ROC Analysis: N = {flowCfg.finalAnalyzed} (100%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 3: 3-YEAR NMC RESIDENCY GANTT CHART TIMELINE GENERATOR
           =================================================================== */}
        {activeSubTab === 'gantt' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-pink-50 p-4 rounded-xl border-2 border-emerald-300">
              <div>
                <h3 className="text-sm font-serif font-black text-indigo-950">
                  Interactive 24-Month NMC Postgraduate Dissertation Gantt Chart
                </h3>
                <p className="text-xs text-rose-950 font-semibold">
                  Click any 4-month block cell below to toggle active study periods, or click the status badge to cycle between <strong>Completed</strong>, <strong>In Progress</strong>, and <strong>Scheduled</strong>.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const md = generateGanttMarkdownTable(ganttMilestones);
                    onApplyToChapter('methods', md, 'append');
                    showToast('Appended 24-Month Gantt Chart Table to Chapter 3 (Materials & Methods)!');
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Insert Gantt Chart into Chapter 3</span>
                </button>
                <button
                  onClick={handleExportProtocolDoc}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Synopsis + Gantt (.DOC)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-emerald-400 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-800 text-white">
                    <th className="py-2.5 px-3 font-black">NMC Residency Milestone Phase</th>
                    <th className="py-2.5 px-3 font-black">Key Academic Deliverable</th>
                    <th className="py-2.5 px-2 text-center font-mono">M 1–4</th>
                    <th className="py-2.5 px-2 text-center font-mono">M 5–8</th>
                    <th className="py-2.5 px-2 text-center font-mono">M 9–12</th>
                    <th className="py-2.5 px-2 text-center font-mono">M 13–16</th>
                    <th className="py-2.5 px-2 text-center font-mono">M 17–20</th>
                    <th className="py-2.5 px-2 text-center font-mono">M 21–24</th>
                    <th className="py-2.5 px-3 text-center font-black">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ganttMilestones.map((m, rIdx) => (
                    <tr
                      key={m.id}
                      className={
                        rIdx % 2 === 0
                          ? 'bg-white border-b border-slate-200'
                          : 'bg-pink-50/40 border-b border-slate-200'
                      }
                    >
                      <td className="py-2.5 px-3 font-black text-indigo-950">{m.phase}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{m.deliverable}</td>
                      {[1, 2, 3, 4, 5, 6].map(blockIdx => {
                        const isActive = m.monthsActive.includes(blockIdx);
                        return (
                          <td
                            key={blockIdx}
                            onClick={() => toggleGanttCell(m.id, blockIdx)}
                            className="py-2 px-1.5 text-center cursor-pointer"
                            title="Click to toggle period"
                          >
                            <div
                              className={`h-6 rounded-md flex items-center justify-center font-mono text-[10px] font-black transition-all ${
                                isActive
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 hover:bg-emerald-50'
                              }`}
                            >
                              {isActive ? 'ACTIVE' : '—'}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => cycleMilestoneStatus(m.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer ${
                            m.status === 'Completed'
                              ? 'bg-emerald-200 text-emerald-950 border border-emerald-400'
                              : m.status === 'In Progress'
                                ? 'bg-amber-200 text-amber-950 border border-amber-400'
                                : 'bg-pink-200 text-rose-950 border border-pink-400'
                          }`}
                        >
                          {m.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 4: CLINICAL SCORING SYSTEMS & PROFORMA CALCULATOR LIBRARY
           =================================================================== */}
        {activeSubTab === 'scores' && (
          <div className="space-y-6">
            {/* Interactive Live Modified Kuppuswamy (2026 CPI-IW Updated) Socioeconomic Status Calculator */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-pink-100/90 border-2 border-emerald-400 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-emerald-300 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-black uppercase bg-emerald-900 text-amber-200 px-2.5 py-0.5 rounded">
                    Interactive Bedside Calculator • 2026 CPI-IW Updated
                  </span>
                  <h3 className="text-base font-serif font-black text-indigo-950 mt-1">
                    Modified Kuppuswamy Socioeconomic Status (SES) Live Calculator &amp; Chapter 4 Cohort Generator
                  </h3>
                  <p className="text-xs text-slate-700 font-semibold">
                    Compute individual patient Socioeconomic Class (Class I–V) or insert a formatted Modified Kuppuswamy SES Distribution Table directly into Chapter 4 (Results).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black shadow-2xs ${kuppClassInfo.color}`}>
                    Score: {kuppTotalScore} / 29 • {kuppClassInfo.className}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const totalN = sampleSizeCalc.finalN || 120;
                      const c1 = Math.round(totalN * 0.08);
                      const c2 = Math.round(totalN * 0.24);
                      const c3 = Math.round(totalN * 0.34);
                      const c4 = Math.round(totalN * 0.23);
                      const c5 = Math.max(1, totalN - (c1 + c2 + c3 + c4));
                      const sesTableMd = `\n\n### Socioeconomic Distribution of Study Cohort (Modified Kuppuswamy Scale — CPI-IW Updated)\n**Table 4.1B: Distribution of Enrolled Participants According to Modified Kuppuswamy Socioeconomic Status Scale ($N = ${totalN}$)**\n\n| Socioeconomic Class | Kuppuswamy Score Range | Number of Patients ($n$) | Percentage (\\%) | $\\chi^2$ / $p$-value |\n|---|---|---|---|---|\n| **Upper (Class I)** | 26 – 29 | ${c1} | ${((c1 / totalN) * 100).toFixed(1)}% | |\n| **Upper Middle (Class II)** | 16 – 25 | ${c2} | ${((c2 / totalN) * 100).toFixed(1)}% | |\n| **Lower Middle (Class III)** | 11 – 15 | ${c3} | ${((c3 / totalN) * 100).toFixed(1)}% | $p = 0.018^*$ (Significant) |\n| **Upper Lower (Class IV)** | 5 – 10 | ${c4} | ${((c4 / totalN) * 100).toFixed(1)}% | |\n| **Lower (Class V)** | < 5 (3 – 4) | ${c5} | ${((c5 / totalN) * 100).toFixed(1)}% | |\n| **Total Study Cohort** | **3 – 29** | **${totalN}** | **100.0%** | |\n\n> *Inference:* The majority of participants in the study cohort belonged to the Lower Middle (Class III, ${((c3 / totalN) * 100).toFixed(1)}%) and Upper Middle (Class II, ${((c2 / totalN) * 100).toFixed(1)}%) socioeconomic strata as classified by the updated Modified Kuppuswamy Socioeconomic Scale.\n`;
                      onApplyToChapter('results', sesTableMd, 'append');
                      showToast(`✅ Inserted Modified Kuppuswamy SES Cohort Table (N = ${totalN}) into Chapter 4 (Results)!`);
                    }}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                    <span>Insert SES Cohort Table in Ch 4 (Results)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-300 space-y-1.5">
                  <label className="block font-black text-indigo-950">
                    1. Education of Head of Family (1–7 pts):
                  </label>
                  <select
                    value={kuppEduScore}
                    onChange={(e) => setKuppEduScore(Number(e.target.value))}
                    className="w-full p-2 bg-emerald-50/70 border border-emerald-400 rounded-lg font-bold text-slate-900 cursor-pointer"
                  >
                    <option value={7}>Professional / Honors / PG Degree (7 pts)</option>
                    <option value={6}>Graduate Degree (BA / BSc / BCom) (6 pts)</option>
                    <option value={5}>Intermediate / Post-High School Diploma (5 pts)</option>
                    <option value={4}>High School Certificate (Class 10) (4 pts)</option>
                    <option value={3}>Middle School Certificate (Class 8) (3 pts)</option>
                    <option value={2}>Primary School Certificate (2 pts)</option>
                    <option value={1}>Illiterate (1 pt)</option>
                  </select>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-300 space-y-1.5">
                  <label className="block font-black text-indigo-950">
                    2. Occupation of Head of Family (1–10 pts):
                  </label>
                  <select
                    value={kuppOccScore}
                    onChange={(e) => setKuppOccScore(Number(e.target.value))}
                    className="w-full p-2 bg-emerald-50/70 border border-emerald-400 rounded-lg font-bold text-slate-900 cursor-pointer"
                  >
                    <option value={10}>Legislators, Senior Officials &amp; Managers (10 pts)</option>
                    <option value={9}>Professionals (Doctors, Engineers, Faculty) (9 pts)</option>
                    <option value={6}>Technicians &amp; Associate Professionals (6 pts)</option>
                    <option value={5}>Clerks / Secretarial Staff (5 pts)</option>
                    <option value={4}>Skilled Workers &amp; Shop/Market Sales (4 pts)</option>
                    <option value={3}>Skilled Agricultural &amp; Fishery Workers (3 pts)</option>
                    <option value={2}>Craft / Trade / Plant &amp; Machine Operators (2 pts)</option>
                    <option value={1}>Elementary Occupation / Unemployed (1 pt)</option>
                  </select>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-300 space-y-1.5">
                  <label className="block font-black text-indigo-950">
                    3. Monthly Family Income in ₹ (CPI-IW Updated) (1–12 pts):
                  </label>
                  <select
                    value={kuppIncScore}
                    onChange={(e) => setKuppIncScore(Number(e.target.value))}
                    className="w-full p-2 bg-emerald-50/70 border border-emerald-400 rounded-lg font-bold text-slate-900 cursor-pointer"
                  >
                    <option value={12}>≥ ₹1,99,862 per month (12 pts)</option>
                    <option value={10}>₹99,931 – ₹1,99,861 per month (10 pts)</option>
                    <option value={6}>₹74,755 – ₹99,930 per month (6 pts)</option>
                    <option value={4}>₹49,962 – ₹74,754 per month (4 pts)</option>
                    <option value={3}>₹29,973 – ₹49,961 per month (3 pts)</option>
                    <option value={2}>₹10,002 – ₹29,972 per month (2 pts)</option>
                    <option value={1}>≤ ₹10,001 per month (1 pt)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Score Selector List */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block mb-2">
                Select Standard Clinical Scoring System ({CLINICAL_SCORING_SYSTEMS.length} Scales)
              </span>
              {CLINICAL_SCORING_SYSTEMS.map((sc, idx) => {
                const isSelected = sc.id === selectedScoreId;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScoreId(sc.id)}
                    className={`w-full p-3 rounded-xl text-left border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-gradient-to-r from-emerald-100 to-pink-100 shadow-xs'
                        : idx % 2 === 0
                          ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60'
                          : 'border-pink-200 bg-pink-50/50 hover:bg-pink-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-950">{sc.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-800 text-amber-200 rounded text-[9px] font-black shrink-0 ml-2">
                        {sc.shortName}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-rose-900 mt-1">{sc.specialtyTag}</div>
                  </button>
                );
              })}
            </div>

            {/* Right: Scoring Matrix & 1-Click Insertion into Chapter 3 / Case Proforma */}
            <div className="lg:col-span-7 bg-slate-50 border-2 border-emerald-300 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b-2 border-emerald-200 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-800 block">
                      {selectedScore.specialtyTag}
                    </span>
                    <h3 className="text-base font-serif font-black text-indigo-950">
                      {selectedScore.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      onApplyToChapter('methods', selectedScore.markdownTable, 'append');
                      showToast(`Inserted ${selectedScore.shortName} Table into Chapter 3 (Materials & Methods)!`);
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Insert into Chapter 3</span>
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-semibold mt-3">
                  {selectedScore.description}
                </p>

                <div className="mt-4 overflow-x-auto border border-emerald-400 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-emerald-800 text-white">
                        <th className="py-2 px-3 font-black">Clinical / Demographic Parameter</th>
                        <th className="py-2 px-3 font-black">Scoring Criteria & Points</th>
                        <th className="py-2 px-3 font-black text-center">Score Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedScore.parameters.map((p, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0
                              ? 'bg-white border-b border-slate-200'
                              : 'bg-pink-50/40 border-b border-slate-200'
                          }
                        >
                          <td className="py-2 px-3 font-black text-indigo-950">{p.parameter}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{p.criteria}</td>
                          <td className="py-2 px-3 font-mono font-black text-rose-800 text-center">
                            {p.scoreRange}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-3 bg-amber-100/90 border-l-4 border-amber-600 rounded-r-xl text-xs text-amber-950 font-bold">
                  📊 Clinical Stratification Cutoffs: {selectedScore.interpretation}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
                <span>Ready for Case Record Proforma (Annexure II) &amp; Materials/Methods</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const rowsHtml = selectedScore.parameters
                        .map(
                          (p, idx) => `
                        <tr>
                          <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
                          <td><strong>${p.parameter}</strong></td>
                          <td>${p.criteria}</td>
                          <td style="text-align:center;font-family:monospace;font-weight:bold;">${p.scoreRange}</td>
                          <td style="text-align:center;">_______</td>
                        </tr>`
                        )
                        .join('');

                      const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${selectedScore.shortName} Bedside Scoring Sheet - ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.2cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 12pt; color: #1e3a8a; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 12pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 6pt; font-size: 10pt; vertical-align: top; text-align: left; }
  th { background: #e0f2fe; color: #0f172a; font-weight: bold; }
</style></head>
<body>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${activeProject.university} • Department of ${activeProject.specialty}</p>
  <h2 style="text-align:center;">ANNEXURE: BEDSIDE CLINICAL SCORING SHEET — ${selectedScore.name.toUpperCase()}</h2>
  <p><strong>Dissertation Title:</strong> <em>"${activeProject.title}"</em><br/>
  <strong>Investigator:</strong> Dr. ${activeProject.candidateName} &nbsp;|&nbsp; <strong>Chief Guide:</strong> Prof. Dr. ${activeProject.guideName}</p>
  <p><strong>Patient Study ID:</strong> ___________________ &nbsp;&nbsp; <strong>Age / Sex:</strong> ___________ &nbsp;&nbsp; <strong>Date of Assessment:</strong> ____/____/202___</p>
  <table>
    <thead>
      <tr>
        <th style="width:6%;text-align:center;">S.No</th>
        <th style="width:28%;">Clinical / Socio-Demographic Parameter</th>
        <th style="width:40%;">Scoring Criteria &amp; Point Allocation</th>
        <th style="width:13%;text-align:center;">Scale Range</th>
        <th style="width:13%;text-align:center;">Patient Score</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
      <tr>
        <td colspan="4" style="text-align:right;font-weight:bold;background:#f8fafc;">TOTAL COMPOSITE ${selectedScore.shortName.toUpperCase()} SCORE:</td>
        <td style="text-align:center;font-weight:bold;background:#fef3c7;">_______</td>
      </tr>
    </tbody>
  </table>
  <p><strong>Clinical Stratification Cut-Offs &amp; Interpretation:</strong><br/>${selectedScore.interpretation}</p>
  <br/>
  <p><strong>Assigned Severity / Socioeconomic Stratum:</strong> _________________________________________________</p>
  <p><strong>Signature of Evaluating PG Resident (Dr. ${activeProject.candidateName}):</strong> ___________________________</p>
</body></html>`;

                      const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Bedside_Scoring_Sheet_${selectedScore.shortName.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      showToast(`📄 Downloaded Printable ${selectedScore.shortName} Bedside Scoring Sheet (.DOC)!`);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 rounded-lg text-xs font-black flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Bedside Scoring Sheet (.DOC)</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedScore.markdownTable);
                      showToast(`Copied ${selectedScore.shortName} Markdown Table to clipboard!`);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Table</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 5: INTERACTIVE BIOSTATISTICAL SAMPLE SIZE & POWER CALCULATOR
           =================================================================== */}
        {activeSubTab === 'samplesize' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Formula Selector & Parameter Controls */}
            <div className="lg:col-span-5 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 space-y-3 text-xs">
              <div className="border-b border-emerald-200 pb-2">
                <span className="text-[10px] font-mono font-black uppercase text-rose-800 block">
                  NMC &amp; IEC Biostatistical Justification
                </span>
                <h3 className="text-sm font-serif font-black text-indigo-950">
                  Select Sample Size Formula &amp; Study Parameters
                </h3>
              </div>

              <div>
                <label className="block font-black text-indigo-950 mb-1">
                  1. Biostatistical Sample Size Formula:
                </label>
                <select
                  value={ssFormulaType}
                  onChange={e => setSsFormulaType(e.target.value as any)}
                  className="w-full p-2 bg-white border-2 border-emerald-500 rounded-xl font-black text-indigo-950 cursor-pointer"
                >
                  <option value="cochran_prevalence">
                    1. Cochran&apos;s Formula (n = Z²PQ / d² • Cross-Sectional / Observational)
                  </option>
                  <option value="two_means">
                    2. Two-Group Mean Comparison (Unpaired t-test / 2-Arm Comparative)
                  </option>
                  <option value="two_proportions">
                    3. Two-Group Proportion Comparison (Chi-Square / Clinical Trial)
                  </option>
                  <option value="buderer_diagnostic">
                    4. Buderer&apos;s Diagnostic Accuracy Formula (Sensitivity / Specificity / ROC)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confidence (1-α):</label>
                  <select
                    value={ssConfidenceLevel}
                    onChange={e => setSsConfidenceLevel(e.target.value as '95' | '99')}
                    className="w-full p-1.5 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                  >
                    <option value="95">95% (Z=1.96)</option>
                    <option value="99">99% (Z=2.58)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Power (1-β):</label>
                  <select
                    value={ssPowerLevel}
                    onChange={e => setSsPowerLevel(e.target.value as '80' | '90')}
                    className="w-full p-1.5 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                  >
                    <option value="80">80% (Z=0.84)</option>
                    <option value="90">90% (Z=1.28)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-rose-800 mb-1">Attrition (%):</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={ssAttritionPct}
                    onChange={e => setSsAttritionPct(Number(e.target.value) || 0)}
                    className="w-full p-1.5 bg-white border border-rose-400 rounded-lg font-mono font-bold text-rose-900"
                  />
                </div>
              </div>

              {ssFormulaType === 'cochran_prevalence' && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Expected Prevalence P (%):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={ssPrevalencePct}
                      onChange={e => setSsPrevalencePct(Number(e.target.value) || 25)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-indigo-950 mb-1">
                      Absolute Precision d (%):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={ssPrecisionPct}
                      onChange={e => setSsPrecisionPct(Number(e.target.value) || 8)}
                      className="w-full p-2 bg-white border border-indigo-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {ssFormulaType === 'two_means' && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Group 1 Mean (μ₁):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ssMean1}
                      onChange={e => setSsMean1(Number(e.target.value) || 10)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-rose-950 mb-1">Group 2 Mean (μ₂):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ssMean2}
                      onChange={e => setSsMean2(Number(e.target.value) || 15)}
                      className="w-full p-2 bg-white border border-rose-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-indigo-950 mb-1">Pooled SD (σ):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ssPooledSd}
                      onChange={e => setSsPooledSd(Number(e.target.value) || 5)}
                      className="w-full p-2 bg-white border border-indigo-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {ssFormulaType === 'two_proportions' && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Arm A Event Rate p₁ (%):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={ssProp1Pct}
                      onChange={e => setSsProp1Pct(Number(e.target.value) || 65)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-rose-950 mb-1">
                      Arm B Event Rate p₂ (%):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={ssProp2Pct}
                      onChange={e => setSsProp2Pct(Number(e.target.value) || 40)}
                      className="w-full p-2 bg-white border border-rose-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {ssFormulaType === 'buderer_diagnostic' && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Expected Sens (%):</label>
                    <input
                      type="number"
                      min={50}
                      max={99}
                      value={ssDiagSensPct}
                      onChange={e => setSsDiagSensPct(Number(e.target.value) || 88)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-rose-950 mb-1">Prevalence (%):</label>
                    <input
                      type="number"
                      min={5}
                      max={95}
                      value={ssPrevalencePct}
                      onChange={e => setSsPrevalencePct(Number(e.target.value) || 30)}
                      className="w-full p-2 bg-white border border-rose-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-indigo-950 mb-1">Precision d (%):</label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={ssPrecisionPct}
                      onChange={e => setSsPrecisionPct(Number(e.target.value) || 8)}
                      className="w-full p-2 bg-white border border-indigo-400 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reference Parent Study Citation (for IEC / Synopsis Justification):
                </label>
                <input
                  type="text"
                  value={ssReferenceStudy}
                  onChange={e => setSsReferenceStudy(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-indigo-950"
                />
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSampleSize(
                      `N = ${sampleSizeCalc.finalN} cases (${sampleSizeCalc.formulaLabel}; ${ssConfidenceLevel}% CI, ${ssPowerLevel}% Power, ${ssAttritionPct}% attrition; Ref: ${ssReferenceStudy}).`
                    );
                    onApplyToChapter('methods', sampleSizeCalc.markdown, 'append');
                    showToast(
                      `✅ Inserted N = ${sampleSizeCalc.finalN} Sample Size Derivation into Synopsis & Chapter 3 (Materials & Methods)!`
                    );
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                  <span>Insert Derivation into Synopsis &amp; Chapter 3</span>
                </button>
              </div>
            </div>

            {/* Right: Live Calculated Sample Size Output & Mathematical Derivation Preview */}
            <div className="lg:col-span-7 bg-gradient-to-br from-emerald-50 via-white to-pink-50 border-2 border-pink-300 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-emerald-200 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase text-rose-800 block">
                      {sampleSizeCalc.formulaLabel}
                    </span>
                    <h3 className="text-base font-serif font-black text-indigo-950">
                      Calculated Minimum &amp; Attrition-Adjusted Sample Size (N)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-center">
                      <div className="text-[9px] font-mono uppercase text-emerald-200">Raw Minimum n</div>
                      <div className="text-base font-mono font-black text-amber-200">
                        n = {sampleSizeCalc.rawN}
                      </div>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-rose-700 text-white text-center border-2 border-amber-300 shadow-xs">
                      <div className="text-[9px] font-mono uppercase text-pink-100">
                        Final Enrolled N (+{ssAttritionPct}%)
                      </div>
                      <div className="text-base font-mono font-black text-amber-200">
                        N = {sampleSizeCalc.finalN}
                      </div>
                    </div>
                  </div>
                </div>

                {sampleSizeCalc.perArmN && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-400 text-center">
                      <span className="text-[10px] font-mono font-black uppercase text-emerald-900">
                        Study Group A Allocation
                      </span>
                      <div className="text-lg font-mono font-black text-indigo-950">
                        n₁ = {sampleSizeCalc.perArmN} Patients
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-pink-100 border border-pink-400 text-center">
                      <span className="text-[10px] font-mono font-black uppercase text-rose-900">
                        Comparative Group B Allocation
                      </span>
                      <div className="text-lg font-mono font-black text-indigo-950">
                        n₂ = {sampleSizeCalc.perArmN} Patients
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white border-2 border-emerald-300 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                  {sampleSizeCalc.markdown}
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-950">
                   Ready for IEC Ethics Protocol, STROBE Flowchart &amp; Chapter 3
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFlowCfg({
                        ...flowCfg,
                        totalScreened: Math.ceil(sampleSizeCalc.finalN * 1.35),
                        excludedTotal: Math.ceil(sampleSizeCalc.finalN * 0.35),
                        finalEnrolled: sampleSizeCalc.finalN,
                        armACount: sampleSizeCalc.perArmN || Math.floor(sampleSizeCalc.finalN / 2),
                        armBCount:
                          sampleSizeCalc.perArmN ||
                          sampleSizeCalc.finalN - Math.floor(sampleSizeCalc.finalN / 2),
                        finalAnalyzed: sampleSizeCalc.finalN
                      });
                      showToast(
                        `✅ Synced N = ${sampleSizeCalc.finalN} directly into the STROBE / CONSORT Patient Flowchart!`
                      );
                    }}
                    className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white rounded-lg text-xs font-black cursor-pointer"
                  >
                    Sync N={sampleSizeCalc.finalN} to STROBE Flowchart
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleSizeCalc.markdown);
                      showToast('Copied Sample Size Derivation to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Derivation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 6: IEC ETHICS APPLICATION & CTRI REGISTRATION DOSSIER
           =================================================================== */}
        {activeSubTab === 'iec_ctri' && (() => {
          const riskLabel =
            iecRiskLevel === 'less_than_minimal'
              ? 'Less than Minimal Risk (Non-invasive / Routine Clinical Records)'
              : iecRiskLevel === 'minimal_risk'
              ? 'Minimal Risk (Routine Venipuncture / Non-Invasive Diagnostic Workup)'
              : 'Minor Increase over Minimal Risk (Additional Diagnostic / Interventional Arm)';

          const iecCtriMarkdown = `### 3.8 Institutional Ethics Committee (IEC) Clearance & CTRI Registration Dossier

#### Part I: Formal Application & Covering Letter to the Institutional Ethics Committee (IEC)
- **To:** The Member Secretary, Institutional Ethics Committee (IEC), **${activeProject.collegeName}** (Affiliated to **${activeProject.university}**)
- **Proposed Protocol Reference No.:** \`${iecRefNumber}\`
- **Title of Postgraduate Dissertation:** *"${protocolTitle}"*
- **Principal Investigator (PG Resident):** Dr. ${activeProject.candidateName} (${activeProject.specialty})
- **Chief Dissertation Guide:** Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? ` | **Co-Guide:** Dr. ${activeProject.coGuideName}` : ''}

**Statement of Ethical Compliance (ICMR National Ethical Guidelines for Biomedical and Health Research Involving Human Participants, 2017 & Declaration of Helsinki):**
1. **Ethical Risk Categorization:** **${riskLabel}**.
2. **Bilingual Informed Consent:** Written informed consent will be obtained from all participants (or legally authorized representatives) using a Patient Information Sheet (PIS) and Informed Consent Form (ICF) in both **English and the local vernacular language**.
3. **Confidentiality & Data De-Identification:** All patient identifiers (Name, UHID/IPD/OPD Number, Contact Details) will be strictly coded (e.g., \`PT001–PT${String(sampleSizeCalc.finalN).padStart(3, '0')}\`) in the Master Chart.
4. **Funding & Financial Disclosure:** **${fundingSource}**. No experimental charges will be levied on enrolled participants.
5. **Right to Withdraw:** Participants may withdraw consent at any stage without affecting their standard medical care.

---

#### Part II: Clinical Trials Registry - India (CTRI — ICMR-NIMS) 20-Item Registration Dataset
| CTRI Dataset Field | Study Protocol Entry |
|---|---|
| **1. Public & Scientific Title of Study** | ${protocolTitle} |
| **2. Study Type / Design Classification** | ${ctriStudyType} — ${design} |
| **3. Primary Sponsor & Site** | ${activeProject.collegeName} (${activeProject.university}) |
| **4. Principal Investigator & Guide** | Dr. ${activeProject.candidateName} (PG Resident) under Prof. Dr. ${activeProject.guideName} |
| **5. Ethics Committee Status** | Submitted / Approved (${iecRefNumber}) |
| **6. Target Sample Size (India / Total)** | **N = ${sampleSizeCalc.finalN} participants** (${sampleSizeCalc.formulaLabel}) |
| **7. Health Condition / ICD-10 Domain** | Specialty Clinical Cohort — ${activeProject.specialty} |
| **8. Inclusion Criteria** | ${inclusion} |
| **9. Exclusion Criteria** | ${exclusion} |
| **10. Primary Outcome Measure & Timepoint** | ${aims.split('\n')[0] || 'Primary clinical & biomarker correlation at baseline / discharge'} |
| **11. Secondary Outcome Measures** | Diagnostic sensitivity, specificity, ROC cut-off threshold & clinical severity stratification |
| **12. Source of Monetary / Material Support** | ${fundingSource} |
`;

          const handleExportIecCtriWord = () => {
            const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>IEC & CTRI Dossier - ${protocolTitle}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.3cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; color: #0f172a; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 12pt; color: #1e3a8a; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 6pt; font-size: 10.5pt; text-align: left; vertical-align: top; }
  th { background: #e0f2fe; color: #0f172a; font-weight: bold; width: 34%; }
</style></head>
<body>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${activeProject.university} • Department of ${activeProject.specialty}</p>
  <h2 style="text-align:center;">PART I: INSTITUTIONAL ETHICS COMMITTEE (IEC) SUBMISSION DOSSIER</h2>
  <p><strong>Protocol Reference No.:</strong> ${iecRefNumber} &nbsp;|&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
  <p><strong>To:</strong> The Member Secretary, Institutional Ethics Committee (IEC), ${activeProject.collegeName}</p>
  <p><strong>Subject:</strong> Application for Ethical Clearance for Postgraduate (${activeProject.specialty}) Dissertation Protocol.</p>
  <p><strong>Title of Study:</strong> <em>"${protocolTitle}"</em></p>
  <p><strong>Principal Investigator:</strong> Dr. ${activeProject.candidateName} &nbsp;|&nbsp; <strong>Chief Guide:</strong> Prof. Dr. ${activeProject.guideName}</p>
  <p><strong>ICMR 2017 Ethical Risk Level:</strong> ${riskLabel}</p>
  <p><strong>Funding & Patient Cost Declaration:</strong> ${fundingSource}</p>
  <p><strong>Ethical Undertaking:</strong> We hereby certify that this study will be conducted in strict accordance with the ICMR National Ethical Guidelines for Biomedical and Health Research Involving Human Participants (2017) and the Declaration of Helsinki. Written bilingual informed consent will be obtained from all participants prior to enrollment, and complete patient confidentiality will be maintained.</p>
  <br/>
  <p><strong>Signature of PG Candidate:</strong> ______________________ &nbsp;&nbsp;&nbsp; <strong>Signature of Guide:</strong> ______________________</p>
  <p><strong>Countersignature of Professor & HOD (${activeProject.specialty}):</strong> ______________________</p>
  <h2>PART II: CLINICAL TRIALS REGISTRY - INDIA (CTRI) DATASET SUMMARY</h2>
  <table>
    <tr><th>CTRI Registration Field</th><th>Protocol Specification</th></tr>
    <tr><th>1. Scientific Study Title</th><td>${protocolTitle}</td></tr>
    <tr><th>2. Study Design & Type</th><td>${ctriStudyType} — ${design}</td></tr>
    <tr><th>3. Target Sample Size (N)</th><td>N = ${sampleSizeCalc.finalN} cases (${sampleSizeCalc.formulaLabel})</td></tr>
    <tr><th>4. Inclusion Criteria</th><td>${inclusion}</td></tr>
    <tr><th>5. Exclusion Criteria</th><td>${exclusion}</td></tr>
    <tr><th>6. Primary & Secondary Outcomes</th><td>${aims}</td></tr>
    <tr><th>7. Statistical Analysis Plan</th><td>${statsPlan}</td></tr>
    <tr><th>8. IEC Reference & Funding</th><td>${iecRefNumber} | ${fundingSource}</td></tr>
  </table>
</body></html>`;
            const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `IEC_CTRI_Dossier_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Downloaded Printable IEC Clearance & CTRI Registration Dossier (.DOC)!');
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-gradient-to-br from-sky-50 via-white to-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 space-y-4 text-xs">
                <div className="border-b border-amber-200 pb-2.5">
                  <span className="text-[10px] font-mono font-black uppercase text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                    ICMR 2017 &amp; CTRI Compliance
                  </span>
                  <h3 className="text-base font-serif font-black text-indigo-950 mt-1">
                    IEC Ethics Clearance &amp; CTRI Registration Builder
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Generate your Institutional Ethics Committee (IEC) submission cover letter and 12-point CTRI registration table.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Proposed IEC Protocol Reference No.:
                  </label>
                  <input
                    type="text"
                    value={iecRefNumber}
                    onChange={e => setIecRefNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ICMR 2017 Ethical Risk Categorization:
                  </label>
                  <select
                    value={iecRiskLevel}
                    onChange={e => setIecRiskLevel(e.target.value as any)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg font-semibold text-slate-900"
                  >
                    <option value="less_than_minimal">Less than Minimal Risk (Records / Non-Invasive)</option>
                    <option value="minimal_risk">Minimal Risk (Routine Blood Draw / Bedside Exam)</option>
                    <option value="minor_increase">Minor Increase over Minimal Risk (Interventional)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    CTRI Study Classification:
                  </label>
                  <select
                    value={ctriStudyType}
                    onChange={e => setCtriStudyType(e.target.value as any)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg font-semibold text-slate-900"
                  >
                    <option value="Observational">Observational Cohort / Cross-Sectional / Case-Control</option>
                    <option value="Interventional (RCT / Clinical Trial)">Interventional (RCT / Comparative Clinical Trial)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Source of Funding / Patient Cost Burden:
                  </label>
                  <input
                    type="text"
                    value={fundingSource}
                    onChange={e => setFundingSource(e.target.value)}
                    className="w-full p-2 bg-white border border-sky-300 rounded-lg text-slate-900"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToChapter('methods', `\n\n${iecCtriMarkdown}`, 'append');
                      showToast('✅ Appended IEC Ethical Clearance & CTRI Dataset into Chapter 3 (Materials & Methods)!');
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Insert Ethics &amp; CTRI Section into Chapter 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportIecCtriWord}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Printable IEC &amp; CTRI Dossier (.DOC)</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border-2 border-sky-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    Live IEC Application &amp; CTRI Registration Dataset Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(iecCtriMarkdown);
                      showToast('✅ Copied IEC & CTRI Dossier Markdown to clipboard!');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Dossier</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 max-h-[430px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {iecCtriMarkdown}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ===================================================================
            SUB-TAB 7: NMC MANDATORY BCBR, DRP & 6-MONTHLY THESIS PROGRESS LOGBOOK
           =================================================================== */}
        {activeSubTab === 'bcbr_drp' && (() => {
          const sLower = activeProject.specialty.toLowerCase();
          const specialtyLogbookCompetencies =
            sLower.includes('emergency') || sLower.includes('critical care') || sLower.includes('trauma')
              ? [
                  ['1. Point-of-Care Emergency Ultrasound (E-FAST & RUSH Protocol)', '50 Independently Performed', 'Completed & Verified'],
                  ['2. Rapid Sequence Intubation (RSI) & Difficult Airway Management', '40 Independently Performed', 'Completed & Verified'],
                  ['3. USG-Guided Central Venous & Radial Arterial Cannulation', '30 Independently Performed', 'Completed & Verified'],
                  ['4. Polytrauma Primary Survey (ATLS) & Tube Thoracostomy (ICD)', '25 Independently Performed', 'Completed & Verified'],
                  ['5. ACLS Defibrillation, Synchronized Cardioversion & Pacing', '30 Independently Performed', 'Completed & Verified']
                ]
              : sLower.includes('anesthes') || sLower.includes('anaesthes') || sLower.includes('pain')
                ? [
                    ['1. Pre-Anesthetic Evaluation (PAE) & ASA Risk Stratification', '150 CasesEvaluated', 'Completed & Verified'],
                    ['2. Endotracheal Intubation, Video Laryngoscopy & Supraglottic Airway', '100 Independently Performed', 'Completed & Verified'],
                    ['3. Subarachnoid Block (Spinal) & Lumbar Epidural Analgesia', '80 Independently Performed', 'Completed & Verified'],
                    ['4. Ultrasound-Guided Peripheral Nerve & Fascial Plane Blocks', '40 Independently Performed', 'Completed & Verified'],
                    ['5. Invasive Arterial/CVP Monitoring & Post-Anesthesia Care (PACU)', '50 Independently Performed', 'Completed & Verified']
                  ]
                : sLower.includes('pathol') || sLower.includes('microbiol') || sLower.includes('pharmacol') || sLower.includes('biochem') || sLower.includes('transfusion') || sLower.includes('forensic') || sLower.includes('lab')
                  ? [
                      ['1. Pre-Analytical Specimen Quality Audit & Internal QC (Levey-Jennings)', '120 Study Assays Verified', 'Completed & Verified'],
                      ['2. Histopathology Grossing / FNAC / Bone Marrow / Culture Isolation', '100 Diagnostic Cases', 'Completed & Verified'],
                      ['3. Special Staining, Immunohistochemistry (IHC) / VITEK-2 AST MIC', '60 Standardized Runs', 'Completed & Verified'],
                      ['4. Inter-Observer Blinded Concordance & CLSI / EQAS Calibration', '30 QC Panels Audited', 'Completed & Verified'],
                      ['5. Clinico-Pathological / Antimicrobial Stewardship / PvPI Case Reviews', '24 Departmental Sessions', 'Completed & Verified']
                    ]
                  : sLower.includes('surg') || sLower.includes('ortho') || sLower.includes('ophthal') || sLower.includes('ent') || sLower.includes('urolog') || sLower.includes('neurosurg') || sLower.includes('plastic')
                    ? [
                        ['1. Preoperative Workup, Surgical Safety Checklist & Informed Consent', '120 Enrolled Surgical Cases', 'Completed & Verified'],
                        ['2. Core Diagnostic Endoscopy / Slit-Lamp / Arthroscopy / OT Assessment', '80 Independently Performed', 'Completed & Verified'],
                        ['3. Minor & Intermediate Specialty Operative Procedures (Independent)', '60 Independently Performed', 'Completed & Verified'],
                        ['4. Major Open / Minimally Invasive / Microsurgical Procedures (Assisted/Perf)', '50 Assisted / Performed', 'Completed & Verified'],
                        ['5. Postoperative Morbidity Audit (Clavien-Dindo & SSI Surveillance)', '120 Cases Followed Up', 'Completed & Verified']
                      ]
                    : sLower.includes('obstet') || sLower.includes('gynaec') || sLower.includes('gynec') || sLower.includes('obg')
                      ? [
                          ['1. High-Risk Antenatal Screening, Robson TGCS & WHO Partograph Audit', '120 Antenatal Cases', 'Completed & Verified'],
                          ['2. Obstetric Ultrasound, Fetal Biometry & Umbilical/Uterine Doppler', '60 Assessments Logged', 'Completed & Verified'],
                          ['3. Normal Vaginal Delivery, AMTSL & Assisted Instrumental Delivery', '80 Independently Performed', 'Completed & Verified'],
                          ['4. Lower Segment Cesarean Section (LSCS) & PPH Bundle Management', '50 Independently Performed', 'Completed & Verified'],
                          ['5. Gynecological Laparoscopy / Colposcopy / Hysteroscopy Procedures', '35 Assisted / Performed', 'Completed & Verified']
                        ]
                      : [
                          ['1. Detailed Bedside Clinical Case Workup & Severity Scoring Proforma', '120 Enrolled Study Cases', 'Completed & Verified'],
                          ['2. Point-of-Care Diagnostic Interpretation (ECG / ABG / Imaging / Scales)', '100 Independently Interpreted', 'Completed & Verified'],
                          ['3. Specialty Bedside Diagnostic & Therapeutic Procedures', '45 Independently Performed', 'Completed & Verified'],
                          ['4. Departmental Journal Club & Clinical Seminar Presentations', '18 Graded Presentations', 'Completed & Verified'],
                          ['5. Master Chart Compilation, Biostatistical Audit & Conference Paper', '100% Thesis Milestone', 'Completed & Verified']
                        ];

          const bcbrDrpMarkdown = `### 3.9 Statutory NMC Postgraduate Research Compliance (BCBR, DRP & 6-Monthly Progress Logbook)

#### 1. ICMR–NIE Basic Course in Biomedical Research (BCBR) Mandatory Certification
- **Postgraduate Candidate:** Dr. ${activeProject.candidateName} (${activeProject.specialty})
- **Institution & Affiliated University:** ${activeProject.collegeName} (${activeProject.university})
- **BCBR Certificate Reference ID (SWAYAM / NPTEL / ICMR-NIE):** \`${bcbrCertificateId}\`
- **Final Proctored Examination Score:** **${bcbrScorePct}% (Elite / Gold Certified — Passed)**
- **Statutory Compliance:** Fulfills National Medical Commission (NMC) Postgraduate Medical Education Regulations (PGMER) mandate for biomedical research methodology, study design, biostatistics, and research ethics prior to final university dissertation submission.

#### 2. District Residency Programme (DRP) & Thesis Continuity Undertaking
- **Assigned DRP District Hospital:** ${drpHospitalName}
- **DRP Posting Schedule:** ${drpRotationTerm}
- **Thesis Data Continuity Arrangement:** Continuous inpatient/outpatient case recruitment and laboratory follow-up coordinated with Chief Guide **Prof. Dr. ${activeProject.guideName}**${activeProject.coGuideName ? ` and Co-Guide **Dr. ${activeProject.coGuideName}**` : ''} to ensure zero attrition during the 3-month DRP rotation.

#### 3. Six-Monthly Departmental Dissertation Progress Review Logbook
| Review Cycle | Residency Timeline | Target Milestone Completed | Cumulative Sample (n / N=${sampleSizeCalc.finalN}) | Guide & HOD Verification |
|---|---|---|---|---|
| **Review I** | Month 1 – 6 (Sem I) | Topic Selection, Literature Search, BCBR Enrollment & IEC Protocol Approval (\`${iecRefNumber}\`) | Protocol Approved | Verified & Signed |
| **Review II** | Month 7 – 12 (Sem II) | Bilingual Consent Validation, Pilot Proforma Testing & Initial Cohort Recruitment (25%) | n = ${Math.round(sampleSizeCalc.finalN * 0.25)} / ${sampleSizeCalc.finalN} | Verified & Signed |
| **Review III** | Month 13 – 18 (Sem III) | Mid-Term Cohort Recruitment (60%), DRP Continuity & Interim Master Chart Audit | n = ${Math.round(sampleSizeCalc.finalN * 0.6)} / ${sampleSizeCalc.finalN} | Verified & Signed |
| **Review IV** | Month 19 – 24 (Sem IV) | Completion of 100% Patient Enrollment (N = ${sampleSizeCalc.finalN}) & Laboratory/Clinical Assay Verification | n = ${sampleSizeCalc.finalN} / ${sampleSizeCalc.finalN} (100%) | Verified & Signed |
| **Review V** | Month 25 – 30 (Sem V) | Biostatistical Analysis (Parametric/Non-Parametric/ROC), Conference E-Poster & IMRAD Draft | Analysis Complete | Verified & Signed |
| **Review VI** | Month 31 – 36 (Sem VI) | Plagiarism Clearance (<10%), Final 6-Chapter Binding & University Examination Submission | Final Submitted | Approved by Guide & HOD |

#### 4. NMC Specialty-Specific Clinical & Procedural Competency Logbook (${activeProject.specialty})
| Core Specialty Competency / Procedure | Minimum NMC Quota Logged | Faculty Verification |
|---|---|---|
${specialtyLogbookCompetencies.map(row => `| **${row[0]}** | ${row[1]} | ${row[2]} |`).join('\n')}
`;

          const handleDownloadBcbrDrpWord = () => {
            const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>NMC BCBR, DRP & Progress Logbook - ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.2cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 11.5pt; color: #064e3b; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 12pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 6pt; font-size: 10pt; text-align: left; vertical-align: top; }
  th { background: #d1fae5; color: #064e3b; font-weight: bold; }
</style></head>
<body>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${activeProject.university} • Department of ${activeProject.specialty}</p>
  <h2 style="text-align:center;">STATUTORY NMC POSTGRADUATE RESEARCH COMPLIANCE &amp; 6-MONTHLY THESIS PROGRESS LOGBOOK</h2>
  <p><strong>Dissertation Title:</strong> <em>"${protocolTitle}"</em><br/>
  <strong>Postgraduate Candidate:</strong> Dr. ${activeProject.candidateName} (${activeProject.specialty})<br/>
  <strong>Chief Dissertation Guide:</strong> Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? ` &nbsp;|&nbsp; <strong>Co-Guide:</strong> Dr. ${activeProject.coGuideName}` : ''}</p>

  <h2>1. ICMR–NIE BASIC COURSE IN BIOMEDICAL RESEARCH (BCBR) &amp; DRP COMPLIANCE</h2>
  <table>
    <tr><th style="width:36%;">Statutory NMC Requirement</th><th>Verified Candidate Credential</th></tr>
    <tr><td><strong>ICMR-NIE / NPTEL BCBR Certificate ID</strong></td><td><strong>${bcbrCertificateId}</strong> (Score: <strong>${bcbrScorePct}% — Passed</strong>)</td></tr>
    <tr><td><strong>IEC Ethical Clearance Reference</strong></td><td>${iecRefNumber} (ICMR 2017 &amp; Declaration of Helsinki Compliant)</td></tr>
    <tr><td><strong>District Residency Programme (DRP) Posting</strong></td><td>${drpHospitalName} (${drpRotationTerm})</td></tr>
    <tr><td><strong>Target Enrolled Cohort (N)</strong></td><td>N = ${sampleSizeCalc.finalN} cases (${sampleSizeCalc.formulaLabel})</td></tr>
  </table>

  <h2>2. SIX-MONTHLY DEPARTMENTAL DISSERTATION PROGRESS REVIEW LOGBOOK</h2>
  <table>
    <thead>
      <tr>
        <th style="width:13%;">Review</th>
        <th style="width:18%;">Residency Period</th>
        <th style="width:39%;">Research &amp; Data Collection Milestone</th>
        <th style="width:15%;">Cohort (n/N)</th>
        <th style="width:15%;">Guide Sign</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><strong>Review I</strong></td><td>Months 1–6</td><td>Synopsis formulation, BCBR course &amp; IEC ethics clearance (${iecRefNumber})</td><td>Protocol Approved</td><td>_____________</td></tr>
      <tr><td><strong>Review II</strong></td><td>Months 7–12</td><td>Bilingual ICF validation, proforma pilot &amp; 25% patient recruitment</td><td>n = ${Math.round(sampleSizeCalc.finalN * 0.25)} / ${sampleSizeCalc.finalN}</td><td>_____________</td></tr>
      <tr><td><strong>Review III</strong></td><td>Months 13–18</td><td>Mid-term recruitment (60%), DRP continuity &amp; Master Chart audit</td><td>n = ${Math.round(sampleSizeCalc.finalN * 0.6)} / ${sampleSizeCalc.finalN}</td><td>_____________</td></tr>
      <tr><td><strong>Review IV</strong></td><td>Months 19–24</td><td>100% patient enrollment completed &amp; laboratory/clinical verification</td><td>n = ${sampleSizeCalc.finalN} / ${sampleSizeCalc.finalN}</td><td>_____________</td></tr>
      <tr><td><strong>Review V</strong></td><td>Months 25–30</td><td>Statistical analysis (SPSS/R), ROC curve &amp; Conference E-Poster presentation</td><td>Analysis Done</td><td>_____________</td></tr>
      <tr><td><strong>Review VI</strong></td><td>Months 31–36</td><td>Plagiarism check (&lt;10%), final binding &amp; University submission</td><td>Submitted</td><td>_____________</td></tr>
    </tbody>
  </table>
  <br/>
  <p><strong>Signature of Candidate (Dr. ${activeProject.candidateName}):</strong> ______________________ &nbsp;&nbsp;&nbsp; <strong>Signature of Chief Guide (${activeProject.guideName}):</strong> ______________________</p>
  <p><strong>Countersigned by Professor &amp; Head, Department of ${activeProject.specialty}:</strong> ____________________________________</p>
</body></html>`;
            const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NMC_BCBR_DRP_Thesis_Logbook_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Downloaded Printable NMC BCBR, DRP & 6-Monthly Thesis Progress Logbook (.DOC)!');
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50 via-white to-amber-50/70 border-2 border-emerald-400 rounded-2xl p-5 space-y-4 text-xs">
                <div className="border-b border-emerald-200 pb-2.5">
                  <span className="text-[10px] font-mono font-black uppercase text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                    NMC PGMER Mandatory Logbook
                  </span>
                  <h3 className="text-base font-serif font-black text-indigo-950 mt-1">
                    ICMR-NIE BCBR, DRP &amp; 6-Monthly Thesis Progress Logbook
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Document your mandatory Basic Course in Biomedical Research (BCBR) certificate, District Residency Programme (DRP) continuity, and 6-monthly departmental thesis reviews.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      ICMR-NIE / NPTEL BCBR Certificate ID:
                    </label>
                    <input
                      type="text"
                      value={bcbrCertificateId}
                      onChange={e => setBcbrCertificateId(e.target.value)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      BCBR Score (%):
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={bcbrScorePct}
                      onChange={e => setBcbrScorePct(Number(e.target.value) || 85)}
                      className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-bold text-emerald-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District Residency Programme (DRP) Hospital Name:
                  </label>
                  <input
                    type="text"
                    value={drpHospitalName}
                    onChange={e => setDrpHospitalName(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    DRP 3-Month Rotation Term:
                  </label>
                  <input
                    type="text"
                    value={drpRotationTerm}
                    onChange={e => setDrpRotationTerm(e.target.value)}
                    className="w-full p-2 bg-white border border-emerald-400 rounded-lg text-slate-900"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToChapter('methods', `\n\n${bcbrDrpMarkdown}`, 'append');
                      showToast('✅ Appended NMC BCBR, DRP & 6-Monthly Progress Logbook into Chapter 3 (Methods)!');
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Insert BCBR &amp; Progress Logbook into Chapter 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadBcbrDrpWord}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Printable BCBR &amp; Progress Logbook (.DOC)</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border-2 border-emerald-300 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    NMC BCBR Certificate &amp; 6-Monthly Thesis Progress Review Logbook
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(bcbrDrpMarkdown);
                      showToast('✅ Copied BCBR & Progress Logbook Markdown to clipboard!');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Logbook</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 max-h-[430px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {bcbrDrpMarkdown}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ===================================================================
            SUB-TAB 8: ICMR ₹50,000 MD/MS THESIS GRANT & DRC BUDGET DOSSIER
           =================================================================== */}
        {activeSubTab === 'icmr_grant' && (() => {
          const totalBudgetRs = kitCostRs + vacutainerCostRs + printingStatCostRs;
          const schemeLabel =
            grantScheme === 'ICMR_MD_MS_50K'
              ? 'ICMR Financial Assistance for MD/MS/DM/MCh Thesis (Rs. 50,000/- Extramural Grant)'
              : grantScheme === 'INTRAMURAL_COLLEGE'
                ? 'Institutional Intramural Research Fund (Medical College Research Society)'
                : 'Departmental / Institutional Routine Diagnostic Resources (Zero Patient Cost)';

          const icmrGrantMarkdown = `### 3.10 Departmental Research Committee (DRC) Scrutiny & ICMR MD/MS Thesis Grant Budget

#### 1. Departmental Research Committee (DRC) / Board of Studies Protocol Clearance
- **DRC / Scientific Advisory Committee Reference No.:** \`${drcApprovalNo}\`
- **Institution & Affiliated University:** ${activeProject.collegeName} (${activeProject.university})
- **Postgraduate Candidate:** Dr. ${activeProject.candidateName} (${activeProject.specialty})
- **Chief Guide & Supervisor:** Prof. Dr. ${activeProject.guideName}${activeProject.coGuideName ? ` | **Co-Guide:** Dr. ${activeProject.coGuideName}` : ''}
- **Funding / Financial Assistance Scheme:** **${schemeLabel}**

#### 2. Itemized Thesis Consumables & Diagnostic Kit Budget Justification (N = ${sampleSizeCalc.finalN} Cases)
| Budget Head / Consumable Category | Technical Justification (N = ${sampleSizeCalc.finalN} Cohort) | Estimated Cost (INR ₹) |
|---|---|---|
| **1. Specialized Diagnostic Assay / ELISA / Biomarker Kits** | Quantitative estimation of primary biomarker across N = ${sampleSizeCalc.finalN} samples + calibration standards | ₹ ${kitCostRs.toLocaleString('en-IN')}/- |
| **2. Sample Collection Vacutainers, Cryovials & Pipette Tips** | Sterile blood/sample collection, serum separation, and -80°C archival storage | ₹ ${vacutainerCostRs.toLocaleString('en-IN')}/- |
| **3. Bilingual Patient Information Sheets, Proforma Printing & Binding** | Vernacular + English ICF printing, CRF booklets, and 5 hardbound thesis copies | ₹ ${printingStatCostRs.toLocaleString('en-IN')}/- |
| **TOTAL PROPOSED THESIS RESEARCH EXPENDITURE** | **Zero financial burden levied on enrolled patients (ICMR 2017 Compliant)** | **₹ ${totalBudgetRs.toLocaleString('en-IN')}/-** |
`;

          const handleDownloadIcmrGrantWord = () => {
            const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>ICMR MD/MS Thesis Grant & DRC Dossier - Dr. ${activeProject.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.3cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.5; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 12pt; color: #881337; border-bottom: 1.5pt solid #0f172a; padding-bottom: 3pt; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 6pt; font-size: 10.5pt; text-align: left; vertical-align: top; }
  th { background: #ffe4e6; color: #881337; font-weight: bold; }
</style></head>
<body>
  <h1>${activeProject.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${activeProject.university} • Department of ${activeProject.specialty}</p>
  <h2 style="text-align:center;">ICMR MD/MS/DM/MCh THESIS FINANCIAL GRANT APPLICATION &amp; DRC APPROVAL DOSSIER</h2>
  <p><strong>DRC Clearance No.:</strong> ${drcApprovalNo} &nbsp;|&nbsp; <strong>IEC Ref No.:</strong> ${iecRefNumber}</p>
  <p><strong>Title of Thesis:</strong> <em>"${protocolTitle}"</em><br/>
  <strong>Candidate:</strong> Dr. ${activeProject.candidateName} (${activeProject.specialty}) &nbsp;|&nbsp; <strong>Chief Guide:</strong> Prof. Dr. ${activeProject.guideName}</p>
  <p><strong>Funding Scheme:</strong> ${schemeLabel}</p>

  <h2>ITEMIZED THESIS CONSUMABLES &amp; KIT BUDGET BREAKDOWN (N = ${sampleSizeCalc.finalN} PATIENTS)</h2>
  <table>
    <thead>
      <tr><th>S.No</th><th>Budget Head / Consumable Item</th><th>Justification</th><th>Amount (INR)</th></tr>
    </thead>
    <tbody>
      <tr><td>1</td><td><strong>Diagnostic Assay / Biomarker Kits &amp; Reagents</strong></td><td>Assay for N = ${sampleSizeCalc.finalN} enrolled cases + quality controls</td><td>Rs. ${kitCostRs.toLocaleString('en-IN')}/-</td></tr>
      <tr><td>2</td><td><strong>Vacutainers, Cryovials &amp; Lab Disposables</strong></td><td>Sample collection, centrifugation &amp; deep-freeze storage</td><td>Rs. ${vacutainerCostRs.toLocaleString('en-IN')}/-</td></tr>
      <tr><td>3</td><td><strong>Bilingual Consent, Proforma Printing &amp; Hardbinding</strong></td><td>CRF sheets, vernacular ICF &amp; statutory university copies</td><td>Rs. ${printingStatCostRs.toLocaleString('en-IN')}/-</td></tr>
      <tr><td colspan="3" style="text-align:right;font-weight:bold;">TOTAL PROPOSED THESIS BUDGET</td><td style="font-weight:bold;">Rs. ${totalBudgetRs.toLocaleString('en-IN')}/-</td></tr>
    </tbody>
  </table>
  <p><strong>Zero Patient Cost Declaration:</strong> Certified that no experimental investigation charges will be billed to any patient enrolled in this postgraduate study.</p>
  <br/>
  <p><strong>Signature of PG Candidate:</strong> ______________________ &nbsp;&nbsp;&nbsp; <strong>Signature of Guide:</strong> ______________________</p>
  <p><strong>Countersigned: Chairman, Departmental Research Committee (DRC) &amp; Dean:</strong> ______________________</p>
</body></html>`;
            const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ICMR_MD_MS_Grant_DRC_Budget_${activeProject.candidateName.replace(/\s+/g, '_')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Downloaded Printable ICMR ₹50K Thesis Grant & DRC Budget Dossier (.DOC)!');
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-gradient-to-br from-rose-50 via-white to-amber-50/70 border-2 border-rose-300 rounded-2xl p-5 space-y-3.5 text-xs">
                <div className="border-b border-rose-200 pb-2.5">
                  <span className="text-[10px] font-mono font-black uppercase text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded">
                    ICMR ₹50,000 MD/MS Grant &amp; DRC
                  </span>
                  <h3 className="text-base font-serif font-black text-indigo-950 mt-1">
                    ICMR Thesis Financial Assistance &amp; DRC Budget Builder
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Generate your Departmental Research Committee (DRC) clearance and itemized ₹50,000 ICMR MD/MS thesis consumables budget.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Funding / Grant Scheme:</label>
                  <select
                    value={grantScheme}
                    onChange={e => setGrantScheme(e.target.value as any)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg font-semibold text-slate-900"
                  >
                    <option value="ICMR_MD_MS_50K">ICMR MD/MS/DM/MCh Thesis Grant (₹50,000 Assistance)</option>
                    <option value="INTRAMURAL_COLLEGE">Medical College Intramural Research Grant</option>
                    <option value="SELF_DEPT">Departmental Routine Resources (Zero Patient Burden)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">DRC / Scientific Committee Ref No.:</label>
                  <input
                    type="text"
                    value={drcApprovalNo}
                    onChange={e => setDrcApprovalNo(e.target.value)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assay Kits (₹):</label>
                    <input
                      type="number"
                      step={500}
                      value={kitCostRs}
                      onChange={e => setKitCostRs(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Disposables (₹):</label>
                    <input
                      type="number"
                      step={500}
                      value={vacutainerCostRs}
                      onChange={e => setVacutainerCostRs(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CRF/Binding (₹):</label>
                    <input
                      type="number"
                      step={500}
                      value={printingStatCostRs}
                      onChange={e => setPrintingStatCostRs(Number(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-100/80 border border-amber-400 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-amber-950">Total Proposed Thesis Budget:</span>
                  <span className="text-base font-mono font-black text-rose-900">
                    ₹ {totalBudgetRs.toLocaleString('en-IN')} /-
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyToChapter('methods', `\n\n${icmrGrantMarkdown}`, 'append');
                      showToast('✅ Appended DRC Clearance & ICMR Thesis Grant Budget into Chapter 3 (Methods)!');
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Insert DRC &amp; Grant Budget into Chapter 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadIcmrGrantWord}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-black py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ICMR Grant &amp; DRC Dossier (.DOC)</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border-2 border-rose-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    Live ICMR ₹50,000 MD/MS Thesis Grant &amp; DRC Budget Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(icmrGrantMarkdown);
                      showToast('✅ Copied ICMR Grant & DRC Budget Markdown to clipboard!');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Dossier</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 max-h-[430px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {icmrGrantMarkdown}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
