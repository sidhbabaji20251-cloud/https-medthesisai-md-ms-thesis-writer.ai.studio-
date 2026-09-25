import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  FileText, 
  ShieldAlert, 
  Download, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Check, 
  Settings, 
  Globe, 
  Award, 
  HelpCircle, 
  User, 
  Bookmark, 
  Sparkles, 
  PenTool, 
  Layout, 
  Clipboard, 
  Cloud,
  FileCheck,
  ChevronRight,
  BookMarked,
  Layers,
  ArrowRight,
  BarChart2,
  TrendingUp,
  Eye,
  ExternalLink,
  Copy,
  FileCode,
  MessageSquare,
  ClipboardCheck,
  Share2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { PDFViewer, BlobProvider } from '@react-pdf/renderer';
import { 
  DissertationPdfPreviewModal, 
  ThesisPdfDocument, 
  DissertationAnnotation 
} from './components/DissertationPdfPreview';
import { ThesisWriterCheckerSuite } from './components/ThesisWriterCheckerSuite';
import { InstitutionalComplianceModal } from './components/InstitutionalComplianceModal';
import { ProtocolBuilder } from './components/ProtocolBuilder';
import { PublicationAI } from './components/PublicationAI';
import { DefenseVivaPrep } from './components/DefenseVivaPrep';

// Indian Medical Universities
const INDIAN_UNIVERSITIES = [
  "National Medical Commission (NMC) Guidelines",
  "Atal Medical and Research University (AMRU), Mandi, Himachal Pradesh",
  "Pt. B.D. Sharma University of Health Sciences (UHSR), Rohtak, Haryana",
  "Kerala University of Health Sciences (KUHS), Thrissur, Kerala",
  "Tripura University (Central University), Suryamaninagar, Agartala, Tripura",
  "Mizoram University (Central University), Aizawl, Mizoram (Zoram Medical College)",
  "The West Bengal University of Health Sciences (WBUHS), Kolkata, West Bengal",
  "Maharishi Markandeshwar (Deemed to be University) - MMU, Mullana-Ambala, Haryana",
  "Maharishi Markandeshwar University - MMU, Kumarhatti-Solan, Himachal Pradesh",
  "NIMS University Rajasthan, Jaipur",
  "All India Institute of Medical Sciences (AIIMS)",
  "Maharashtra University of Health Sciences (MUHS)",
  "Rajiv Gandhi University of Health Sciences (RGUHS), Karnataka",
  "Dr. NTR University of Health Sciences, Andhra Pradesh",
  "Rajasthan University of Health Sciences (RUHS), Jaipur",
  "Baba Farid University of Health Sciences (BFUHS), Punjab",
  "Tamil Nadu Dr. M.G.R. Medical University, Chennai",
  "Atal Bihari Vajpayee Medical University (ABVMU), Uttar Pradesh",
  "King George's Medical University (KGMU), Lucknow, UP",
  "Srimanta Sankaradeva University of Health Sciences (SSUHS), Assam",
  "Bihar University of Health Sciences (BUHS), Patna"
];

// Typical PG Medical Specialties in India (Pre-clinical, Para-clinical, Clinical & Super-specialties)
const MEDICAL_SPECIALTIES = [
  // User Requested MD Subjects
  "MD Anatomy",
  "MD Physiology",
  "MD Biochemistry",
  "MD Microbiology",
  "MD Pathology",
  "MD Pharmacology",
  "MD Forensic Medicine & Toxicology",
  "MD Community Medicine (PSM)",
  "MD Psychiatry",
  "MD / DM Cardiology",
  "MD / DM Neurology",
  "MS / MCh Urology",
  "MD / DM Endocrinology",

  // Clinical Specialties
  "MD General Medicine",
  "MS General Surgery",
  "MD Pediatrics",
  "MD Obstetrics & Gynaecology",
  "MS Orthopaedics",
  "MD Anesthesiology",
  "MS Ophthalmology",
  "MS ENT (Otorhinolaryngology)",
  "MD Radio-diagnosis",
  "MD Pulmonary Medicine / Respiratory Medicine",
  "MD Dermatology, Venereology & Leprosy",
  "MD Emergency Medicine",
  "MD Radiation Oncology / Radiotherapy"
];

// Recommended word count targets per dissertation chapter (typical Indian PG Medical guidelines)
interface ChapterTarget {
  minWords: number;
  targetWords: number;
  maxWords: number;
  recommendation: string;
}

const RECOMMENDED_CHAPTER_TARGETS: Record<string, ChapterTarget> = {
  intro: {
    minWords: 800,
    targetWords: 1500,
    maxWords: 2500,
    recommendation: 'Recommended: 1,200 – 1,800 words (Background, Indian epidemiology & clear primary/secondary objectives)'
  },
  litreview: {
    minWords: 2000,
    targetWords: 3500,
    maxWords: 5000,
    recommendation: 'Recommended: 3,000 – 4,000 words (Comprehensive historical & contemporary peer-reviewed literature)'
  },
  methods: {
    minWords: 1200,
    targetWords: 2000,
    maxWords: 3000,
    recommendation: 'Recommended: 1,500 – 2,200 words (Study design, IEC approval, sample size formula, protocols)'
  },
  results: {
    minWords: 1000,
    targetWords: 2000,
    maxWords: 3500,
    recommendation: 'Recommended: 1,500 – 2,500 words (Demographics, clinical tables, statistical correlations & p-values)'
  },
  discussion: {
    minWords: 1500,
    targetWords: 2800,
    maxWords: 4000,
    recommendation: 'Recommended: 2,500 – 3,200 words (Comparison with Indian/global trials, limitations & conclusion)'
  },
  references: {
    minWords: 400,
    targetWords: 1000,
    maxWords: 2500,
    recommendation: 'Recommended: 40 – 70 peer-reviewed references (Vancouver / APA / Chicago)'
  }
};

// Pre-packaged starting chapters for Indian MD/MS dissertation
interface Chapter {
  id: string;
  name: string;
  description: string;
  content: string;
}

interface Citation {
  id: string;
  title: string;
  authors: string;
  source: string;
  pubdate: string;
  doi?: string;
  url?: string;
  citationKey: string;
}

interface PlagiarismMatch {
  url: string;
  journal: string;
  similarity: number;
  inputText: string;
  matchedText: string;
  status: string;
}

interface PlagiarismReport {
  status: string;
  overallScore: number;
  matches: PlagiarismMatch[];
  recommendations: string;
  rawReport?: string;
}

interface Project {
  id: string;
  title: string;
  candidateName: string;
  guideName: string;
  coGuideName: string;
  specialty: string;
  university: string;
  collegeName: string;
  academicYear: string;
  chapters: Chapter[];
  citations: Citation[];
  frontMatter: string;
  logbook: string;
  annotations?: DissertationAnnotation[];
}

const DEFAULT_CHAPTERS: Chapter[] = [
  { 
    id: 'intro', 
    name: '1. Introduction & Objectives', 
    description: 'Background of the clinical condition, global & Indian epidemiological burden, rationale for the study, and clear primary & secondary objectives.',
    content: `# Chapter 1: Introduction & Objectives\n\n## 1.1 Clinical Background\n\n[Provide details on the clinical entity, pathophysiology, and relevance to contemporary medical science...]\n\n## 1.2 Epidemiology & Indian Burden\n\n[Discuss global statistics vs specific prevalence and incidence rates in the Indian population...]\n\n## 1.3 Rationale for the Study\n\n[Why is this research important? What gaps does it address in Indian tertiary healthcare setups?]\n\n## 1.4 Research Questions & Hypotheses\n\n[Identify clear clinical research questions...]\n\n## 1.5 Objectives of the Study\n### 1.5.1 Primary Objective:\n- To evaluate clinical outcomes in targeted patient demographics.\n\n### 1.5.2 Secondary Objectives:\n- To correlate biochemical biomarkers with disease severity.\n- To analyze the demographic distribution of risk factors.`
  },
  { 
    id: 'litreview', 
    name: '2. Review of Literature', 
    description: 'Detailed analysis of previous literature, key national/international trials, and historical progression with embedded automated citations.',
    content: `# Chapter 2: Review of Literature\n\n## 2.1 Historical Perspectives\n\n## 2.2 Pathophysiological Mechanisms & Recent Insights\n\n## 2.3 International Clinical Trials & Standard Consensus Guides\n\n## 2.4 Indian Studies & Regional Variations\n\n[Ensure to cite PubMed sources using automated reference markers like [1], [2]...]`
  },
  { 
    id: 'methods', 
    name: '3. Materials & Methods', 
    description: 'Study design, location, duration, sample size calculations with mathematical formulae, inclusion & exclusion criteria, and statistical tests used.',
    content: `# Chapter 3: Materials & Methods\n\n## 3.1 Study Design\n- **Type of Study**: Hospital-based prospective observational study.\n- **Study Site**: Tertiary care teaching hospital, Department of Clinical Sciences.\n- **Study Duration**: 18 months (typically from November 2024 to April 2026).\n\n## 3.2 Ethics Approval\nEthical clearance obtained from the Institutional Ethics Committee (IEC No: IEC/2024/MD-MS/102). Informed written consent obtained from all participants prior to enrollment.\n\n## 3.3 Study Population & Selection\n### 3.3.1 Inclusion Criteria:\n- Patients aged 18 to 65 years presenting with clinical symptoms.\n- Signed informed consent.\n\n### 3.3.2 Exclusion Criteria:\n- Pregnant or lactating women.\n- History of significant organ failure (renal, hepatic, cardiac).\n- Refusal to consent.\n\n## 3.4 Sample Size Calculation\nUsing standard formula:\n$$n = \\frac{Z_{1-\\alpha/2}^2 \\cdot p \\cdot (1-p)}{d^2}$$\nWhere:\n- $Z_{1-\\alpha/2} = 1.96$ for 95% Confidence Interval.\n- $p$ = Anticipated prevalence from literature.\n- $d$ = Absolute precision (5% margin of error).\n\n## 3.5 Operational Protocols & Laboratory Analysis\n\n## 3.6 Statistical Methodology\nData compiled in MS Excel and analyzed using SPSS Version 25.0. Qualitative variables compared using Chi-Square test. Quantitative data expressed as Mean ± SD.`
  },
  { 
    id: 'results', 
    name: '4. Observations & Results', 
    description: 'Presentation of patient characteristics, laboratory outcomes, clinical tables, statistical correlations (p-values), and demographic charts.',
    content: `# Chapter 4: Observations & Results\n\n## 4.1 Demographic Characteristics\n\n| Parameters | Number of Cases (N) | Percentage (%) |\n|------------|---------------------|----------------|\n| **Age Group (Years)** | | |\n| < 30 | 12 | 24.0% |\n| 30 - 45 | 18 | 36.0% |\n| 46 - 60 | 15 | 30.0% |\n| > 60 | 5 | 10.0% |\n| **Gender** | | |\n| Male | 28 | 56.0% |\n| Female | 22 | 44.0% |\n| **Total** | **50** | **100%** |\n\n## 4.2 Clinical Correlation & Laboratory Parameters\n\n## 4.3 Statistical Comparison of Biomarkers vs Severity`
  },
  { 
    id: 'discussion', 
    name: '5. Discussion & Summary', 
    description: 'Comparative review against Indian and global literature, pathophysiological explanation, clinical implications, limitations, and future scope.',
    content: `# Chapter 5: Discussion & Summary\n\n## 5.1 Discussion of Major Findings\n\n## 5.2 Correlation with National / International Literature\n\n## 5.3 Limitations of the Study\n\n## 5.4 Conclusion & Future Clinical Recommendations`
  },
  { 
    id: 'references', 
    name: '6. References', 
    description: 'Automated formatting of all incorporated journals and articles in APA, MLA, or Chicago formats.',
    content: `# Chapter 6: References\n\n1. Clinical Trials Registry - India (CTRI). Standard procedures for clinical dissertation reports. 2024.\n2. National Medical Commission guidelines for Postgraduate Medical Dissertations. New Delhi, India.`
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Correlation of Serum Vitamin D Levels with Disease Severity in Patients of Type 2 Diabetes Mellitus with Distal Symmetrical Polyneuropathy',
    candidateName: 'Siddharth Sharma',
    guideName: 'Prof. Dr. Rajesh K. Mishra',
    coGuideName: 'Dr. Neeta Grover',
    specialty: 'MD General Medicine',
    university: 'Maharashtra University of Health Sciences (MUHS)',
    collegeName: 'Grant Government Medical College & Sir J.J. Group of Hospitals, Mumbai',
    academicYear: '2024 - 2026',
    chapters: DEFAULT_CHAPTERS,
    citations: [
      {
        id: "c1",
        title: "Vitamin D deficiency and diabetic neuropathy: a systematic review and meta-analysis",
        authors: "Anand M, Kumar S",
        source: "Indian Journal of Endocrinology and Metabolism",
        pubdate: "2023",
        doi: "10.4103/ijem.ijem_200_23",
        url: "https://pubmed.ncbi.nlm.nih.gov/3120092/",
        citationKey: "[1]"
      },
      {
        id: "c2",
        title: "Serum 25-hydroxyvitamin D status in patients with distal symmetrical polyneuropathy: An Indian perspective",
        authors: "Patel R, Deshmukh V, Joshi A",
        source: "Journal of the Association of Physicians of India",
        pubdate: "2024",
        doi: "10.5005/japi-2024-118",
        url: "https://pubmed.ncbi.nlm.nih.gov/3421189/",
        citationKey: "[2]"
      },
      {
        id: "c3",
        title: "Pathogenesis and clinical evaluation of diabetic peripheral neuropathy: Clinical guidelines",
        authors: "Feldman EL, Callaghan BC, Pop-Busui R",
        source: "The Lancet Diabetes & Endocrinology",
        pubdate: "2022",
        doi: "10.1016/S2213-8587(22)00041-8",
        url: "https://pubmed.ncbi.nlm.nih.gov/3512210/",
        citationKey: "[3]"
      },
      {
        id: "c4",
        title: "Microvascular complications of type 2 diabetes mellitus: Epidemiological data from South Asia",
        authors: "Mohan V, Deepa M, Anjana RM",
        source: "Diabetes Care",
        pubdate: "2021",
        doi: "10.2337/dc21-s012",
        url: "https://pubmed.ncbi.nlm.nih.gov/3345891/",
        citationKey: "[4]"
      },
      {
        id: "c5",
        title: "Neuroprotective potential of cholecalciferol supplementation in chronic axonal neuropathies",
        authors: "Gupta S, Mukherjee P",
        source: "Indian Journal of Endocrinology and Metabolism",
        pubdate: "2024",
        doi: "10.4103/ijem.ijem_344_24",
        url: "https://pubmed.ncbi.nlm.nih.gov/3820491/",
        citationKey: "[5]"
      },
      {
        id: "c6",
        title: "Mechanisms of vitamin D receptor signaling in peripheral nerve regeneration and repair",
        authors: "Baeza-Raja V, Chudasama Y",
        source: "Journal of Clinical Endocrinology & Metabolism",
        pubdate: "2020",
        doi: "10.1210/clinem/dgaa124",
        url: "https://pubmed.ncbi.nlm.nih.gov/3218764/",
        citationKey: "[6]"
      }
    ],
    frontMatter: '',
    logbook: '',
    annotations: [
      {
        id: "ann-init-1",
        chapterId: "intro",
        chapterName: "1. Introduction & Objectives",
        selectedText: "Epidemiology & Indian Burden",
        note: "Guide review: Ensure ICMR-INDIAB study statistics are incorporated for regional diabetic neuropathy burden in Western India.",
        color: "yellow",
        createdAt: "25 Sep 2026, 09:15 AM",
        author: "Prof. Dr. Rajesh K. Mishra (Guide)"
      },
      {
        id: "ann-init-2",
        chapterId: "methods",
        chapterName: "3. Materials & Methods",
        selectedText: "Sample Size Calculation",
        note: "Ethics board approved: Margin of error (d = 0.05) with 95% Confidence Interval is verified for 50 cases.",
        color: "green",
        createdAt: "25 Sep 2026, 10:30 AM",
        author: "Dr. Siddharth Sharma (Candidate)"
      }
    ]
  }
];

export default function App() {
  const [customPublicUrl, setCustomPublicUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('med_thesis_public_url') || '';
    }
    return '';
  });
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  const isSandboxPreview = typeof window !== 'undefined' && (
    window.location.hostname.startsWith('ais-dev-') ||
    window.location.hostname.startsWith('ais-pre-')
  );

  const getCurrentAppUrl = () => {
    if (customPublicUrl.trim()) {
      return customPublicUrl.trim().replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const handleSavePublicUrl = (val: string) => {
    setCustomPublicUrl(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('med_thesis_public_url', val);
    }
  };

  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('p1');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chapters' | 'protocol' | 'prompt_suite' | 'pubmed' | 'plagiarism' | 'frontmatter' | 'publication_ai' | 'viva_prep' | 'export'>('dashboard');
  const [activeChapterId, setActiveChapterId] = useState<string>('intro');
  
  // Custom forms
  const [newTopic, setNewTopic] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('MD General Medicine');
  const [selectedUniv, setSelectedUniv] = useState('Maharashtra University of Health Sciences (MUHS)');
  
  // State for AI agents
  const [isLoading, setIsLoading] = useState(false);
  const [refineType, setRefineType] = useState<'humanize' | 'grammar' | 'academic_flow'>('humanize');
  const [refinedOutput, setRefinedOutput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // PubMed search state
  const [pubmedQuery, setPubmedQuery] = useState('');
  const [isSearchingPubmed, setIsSearchingPubmed] = useState(false);
  const [pubmedResults, setPubmedResults] = useState<any[]>([]);
  const [pubmedError, setPubmedError] = useState('');
  
  // Plagiarism state
  const [isCheckingPlag, setIsCheckingPlag] = useState(false);
  const [plagReport, setPlagReport] = useState<PlagiarismReport | null>(null);
  
  // Citation style selection
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago'>('APA');

  // Bibliography panel view mode (list vs analytics chart)
  const [biblioView, setBiblioView] = useState<'list' | 'analytics'>('list');
  const [chartMetric, setChartMetric] = useState<'years' | 'journals'>('years');
  
  // College/University Logo Upload placeholder
  const [collegeLogo, setCollegeLogo] = useState<string | null>(null);

  // Cross-device sync status
  const [syncStatus, setSyncStatus] = useState<'synced' | 'unsynced' | 'syncing'>('synced');

  // Toast notification state to avoid window.alert in iframe
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // PDF Preview window modal & embedded preview tab
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [exportPreviewTab, setExportPreviewTab] = useState<'pdf' | 'latex' | 'bibtex'>('pdf');

  // Institutional Compliance Checklist modal
  const [showComplianceModal, setShowComplianceModal] = useState<boolean>(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Load from local/server DB initially
  useEffect(() => {
    const saved = localStorage.getItem('med_thesis_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setProjects(parsed);
          setActiveProjectId(parsed[0].id);
        }
      } catch (e) {
        console.error('Error parsing local storage:', e);
      }
    }
    
    // Attempt cloud pull from server
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          setActiveProjectId(data[0].id);
          setSyncStatus('synced');
        }
      })
      .catch(err => {
        console.log('Skipping backend pull, using local state.', err);
      });
  }, []);

  // Sync to backend and local storage whenever project changes
  const saveAndSyncProjects = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('med_thesis_projects', JSON.stringify(updatedProjects));
    setSyncStatus('syncing');

    try {
      const res = await fetch('/api/projects/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: updatedProjects })
      });
      if (res.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('unsynced');
      }
    } catch (error) {
      console.error('Failed to sync to cloud storage:', error);
      setSyncStatus('unsynced');
    }
  };

  // Helper: Update fields of active project
  const updateActiveProjectField = (key: keyof Project, value: any) => {
    const updated = projects.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, [key]: value };
      }
      return p;
    });
    saveAndSyncProjects(updated);
  };

  // Helper: Update content of active chapter
  const updateChapterContent = (chapterId: string, text: string) => {
    const updatedChapters = activeProject.chapters.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, content: text };
      }
      return ch;
    });
    updateActiveProjectField('chapters', updatedChapters);
  };

  // Initialize new dissertation project
  const handleCreateProject = async () => {
    if (!newTopic.trim()) return;
    setIsLoading(true);
    try {
      // 1. Let's auto-generate outline with references!
      const res = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic,
          department: selectedSpecialty,
          university: selectedUniv
        })
      });
      const data = await res.json();
      
      const outlineContent = data.outline || '# Outline generated';
      
      // Update Literature review chapter with generated outline
      const customChapters = DEFAULT_CHAPTERS.map(ch => {
        if (ch.id === 'litreview') {
          return { ...ch, content: outlineContent };
        }
        return ch;
      });

      const newProj: Project = {
        id: 'p_' + Date.now(),
        title: newTopic,
        candidateName: activeProject.candidateName || 'Dr. Postgraduate Student',
        guideName: activeProject.guideName || 'Prof. Dr. Thesis Guide',
        coGuideName: activeProject.coGuideName || '',
        specialty: selectedSpecialty,
        university: selectedUniv,
        collegeName: activeProject.collegeName || 'National Medical College, New Delhi',
        academicYear: activeProject.academicYear || '2024 - 2026',
        chapters: customChapters,
        citations: [],
        frontMatter: '',
        logbook: ''
      };

      const newList = [newProj, ...projects];
      setProjects(newList);
      setActiveProjectId(newProj.id);
      setNewTopic('');
      setActiveTab('dashboard');
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      showToast('Error initiating project outline. Please check your network or API.');
      setIsLoading(false);
    }
  };

  // Generate complete single chapter via Agent
  const handleAIWriteChapter = async (chapterId: string) => {
    setIsLoading(true);
    const targetChapter = activeProject.chapters.find(ch => ch.id === chapterId);
    if (!targetChapter) return;

    try {
      const res = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeProject.title,
          department: activeProject.specialty,
          chapterName: targetChapter.name,
          additionalNotes: `Integrate standard scientific definitions. Maintain Indian epidemiological context if relevant. Align with typical postgraduate guidelines.`,
          citations: activeProject.citations
        })
      });

      const data = await res.json();
      if (data.content) {
        updateChapterContent(chapterId, data.content);
        showToast(`Successfully generated ${targetChapter.name}!`);
      }
    } catch (e) {
      console.error('Error generating chapter:', e);
      showToast('Failed to generate chapter text.');
    } finally {
      setIsLoading(false);
    }
  };

  // Translate/Humanize Text Flow
  const handleRefineText = async () => {
    const currentText = activeProject.chapters.find(ch => ch.id === activeChapterId)?.content || '';
    if (!currentText.trim()) {
      showToast('Chapter content is empty! Add text first.');
      return;
    }
    setIsRefining(true);
    try {
      const res = await fetch('/api/refine-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          type: refineType
        })
      });
      const data = await res.json();
      if (data.refined) {
        setRefinedOutput(data.refined);
        showToast('Language refinement preview is ready.');
      }
    } catch (e) {
      console.error(e);
      showToast('Error during refinement.');
    } finally {
      setIsRefining(false);
    }
  };

  // PubMed live search
  const handlePubMedSearch = async () => {
    if (!pubmedQuery.trim()) return;
    setIsSearchingPubmed(true);
    setPubmedError('');
    try {
      const res = await fetch(`/api/pubmed?q=${encodeURIComponent(pubmedQuery)}`);
      const data = await res.json();
      if (data.articles) {
        setPubmedResults(data.articles);
      } else {
        setPubmedResults([]);
      }
    } catch (err: any) {
      setPubmedError('PubMed integration error: ' + err.message);
    } finally {
      setIsSearchingPubmed(false);
    }
  };

  // Quick PubMed suggestion for active topic
  useEffect(() => {
    if (activeProject && activeProject.title) {
      // Pre-fill search with key clinical keywords
      const terms = activeProject.title.split(' ').slice(0, 4).join(' ');
      setPubmedQuery(terms);
    }
  }, [activeProjectId]);

  // Insert Citation helper
  const addCitation = (article: any) => {
    const key = `[${activeProject.citations.length + 1}]`;
    const newCitation: Citation = {
      id: 'cit_' + Date.now(),
      title: article.title,
      authors: article.authors,
      source: article.source,
      pubdate: article.pubdate,
      doi: article.doi,
      url: article.url,
      citationKey: key
    };

    const updatedCits = [...activeProject.citations, newCitation];
    updateActiveProjectField('citations', updatedCits);

    // Update References text block dynamically with new APA format
    const apaFormatText = updatedCits.map((c, i) => {
      return `${i + 1}. ${c.authors}. (${c.pubdate}). ${c.title}. *${c.source}*. ${c.doi ? 'DOI: ' + c.doi : ''}`;
    }).join('\n\n');

    const refsChapter = activeProject.chapters.find(ch => ch.id === 'references');
    if (refsChapter) {
      const updatedRefsText = `# Chapter 6: References\n\n${apaFormatText}`;
      updateChapterContent('references', updatedRefsText);
    }

    // Insert citation key at current cursor position in editor if active
    const ch = activeProject.chapters.find(c => c.id === activeChapterId);
    if (ch) {
      updateChapterContent(activeChapterId, ch.content + ` ${key}`);
    }
  };

  // Run Plagiarism agent audit
  const runPlagiarismAudit = async () => {
    const ch = activeProject.chapters.find(c => c.id === activeChapterId);
    if (!ch || !ch.content.trim()) {
      showToast('Please write or generate text in the active chapter before running audit.');
      return;
    }
    setIsCheckingPlag(true);
    try {
      const res = await fetch('/api/check-plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ch.content })
      });
      const data = await res.json();
      setPlagReport(data);
      showToast('Plagiarism audit completed.');
    } catch (e) {
      console.error(e);
      showToast('Plagiarism checking error. Please try again.');
    } finally {
      setIsCheckingPlag(false);
    }
  };

  // Generate Official Frontmatter Documents
  const generateOfficialFrontMatter = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-frontmatter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityName: activeProject.university,
          collegeName: activeProject.collegeName,
          candidateName: activeProject.candidateName,
          guideName: activeProject.guideName,
          coGuideName: activeProject.coGuideName,
          specialty: activeProject.specialty,
          academicYear: activeProject.academicYear,
          thesisTitle: activeProject.title
        })
      });
      const data = await res.json();
      if (data.frontMatter) {
        updateActiveProjectField('frontMatter', data.frontMatter);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Format custom Indian College University layout references
  const getFormattedReference = (c: Citation, style: 'APA' | 'MLA' | 'Chicago', index: number) => {
    if (style === 'APA') {
      return `[${index}] ${c.authors}. (${c.pubdate}). ${c.title}. *${c.source}*.${c.doi ? ' DOI: ' + c.doi : ''}`;
    } else if (style === 'MLA') {
      return `[${index}] ${c.authors}. "${c.title}." *${c.source}*, vol. ${c.pubdate}, pp. ${c.doi || 'N/A'}.`;
    } else {
      return `[${index}] ${c.authors}. "${c.title}." *${c.source}* (${c.pubdate}). ${c.url || ''}`;
    }
  };

  // Generate standardized BibTeX formatted string for citation managers (Zotero, Mendeley, JabRef, EndNote)
  const generateBibTeX = (citations: Citation[]): string => {
    if (citations.length === 0) return '';
    return citations.map((c, index) => {
      const firstAuthor = (c.authors.split(',')[0] || c.authors.split(' ')[0] || 'author')
        .trim()
        .replace(/[^a-zA-Z]/g, '');
      const yearMatch = c.pubdate.match(/\b(19\d\d|20\d\d)\b/);
      const year = yearMatch ? yearMatch[0] : '2024';
      const firstWord = (c.title.split(' ')[0] || 'study').replace(/[^a-zA-Z]/g, '');
      const citeKey = `${firstAuthor}${year}${firstWord}`.toLowerCase() || `citation_${index + 1}`;

      const cleanTitle = c.title ? c.title.replace(/[{}]/g, '') : 'Untitled Study';
      const cleanJournal = c.source ? c.source.replace(/[{}]/g, '') : 'Medical Journal';

      const fields = [
        `  author    = {${c.authors}}`,
        `  title     = {${cleanTitle}}`,
        `  journal   = {${cleanJournal}}`,
        `  year      = {${year}}`
      ];

      if (c.doi) {
        fields.push(`  doi       = {${c.doi}}`);
      }
      if (c.url) {
        fields.push(`  url       = {${c.url}}`);
      }
      fields.push(`  note      = {PMID: ${c.id || 'N/A'}, Diss. Key: ${c.citationKey || `[${index + 1}]`}}`);

      return `@article{${citeKey},\n${fields.join(',\n')}\n}`;
    }).join('\n\n');
  };

  // Export BibTeX file (.bib) for Zotero and Mendeley
  const handleExportBibTeX = () => {
    if (activeProject.citations.length === 0) {
      showToast('No citations to export. Add studies from PubMed first.');
      return;
    }
    const bibtexHeader = `% =======================================================\n% BibTeX Bibliography Export for Zotero, Mendeley & EndNote\n% Generated by MedThesisAI - Postgraduate Medical Dissertation Agent\n% Thesis Title: ${activeProject.title}\n% Candidate: Dr. ${activeProject.candidateName} (${activeProject.specialty})\n% University: ${activeProject.university}\n% =======================================================\n\n`;
    const bibtexContent = bibtexHeader + generateBibTeX(activeProject.citations);

    const blob = new Blob([bibtexContent], { type: 'application/x-bibtex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_references.bib`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('BibTeX (.bib) file exported successfully for Zotero / Mendeley!');
  };

  // Copy BibTeX format to clipboard
  const handleCopyBibTeX = async () => {
    if (activeProject.citations.length === 0) {
      showToast('No citations to copy. Add studies from PubMed first.');
      return;
    }
    const bibtex = generateBibTeX(activeProject.citations);
    try {
      await navigator.clipboard.writeText(bibtex);
      showToast('BibTeX entries copied to clipboard!');
    } catch {
      showToast('Copied BibTeX successfully.');
    }
  };

  // Mock logo file selection helper
  const handleLogoUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCollegeLogo(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-serif flex items-center">
              MedThesisAI <span className="ml-2 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">MD/MS Dissertations</span>
            </h1>
            <p className="text-xs text-slate-500">Postgraduate Academic Co-Author for Indian Medical Colleges</p>
          </div>
        </div>

        {/* Sync Indicator and Projects list */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs">
            {syncStatus === 'syncing' && (
              <span className="flex items-center text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <RotateCw className="w-3.5 h-3.5 mr-1 animate-spin text-slate-600" /> Syncing with Cloud...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <Cloud className="w-3.5 h-3.5 mr-1" /> Cloud Synchronized
              </span>
            )}
            {syncStatus === 'unsynced' && (
              <span className="flex items-center text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Sync Error (Cached Locally)
              </span>
            )}
          </div>

          {/* Project Selector dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500">Active Topic:</label>
            <select 
              value={activeProjectId} 
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium max-w-[280px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Indian Medical PG Welfare & Unified Freeware Sharing Banner */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between text-xs text-emerald-800 gap-4">
        <div className="flex flex-col md:flex-row md:items-start gap-3 flex-1">
          <span className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-[10px] uppercase font-mono tracking-wide self-start shrink-0 mt-0.5">
            100% Freeware • Built-In Server API
          </span>
          <div className="space-y-1.5 flex-1">
            <p className="font-semibold text-emerald-950">
              ⚡ <strong>Open-Access Student Welfare:</strong> MedThesisAI is free for all MD/MS students with the Gemini API key pre-integrated on the backend server.
            </p>
            {isSandboxPreview && !customPublicUrl.trim() ? (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-2.5 text-[11px] leading-relaxed">
                <p className="font-bold text-amber-950">
                  🚨 Why Mobile & Shared Links Show "404 Page Not Found" or "Security Cookie Blocked":
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-900">
                  <li>
                    <strong>ais-pre-... (Shared Preview URL)</strong> returns <code className="bg-amber-100 px-1 rounded">404 Error: Page not found</code> until published in Google AI Studio.
                  </li>
                  <li>
                    <strong>ais-dev-... (Editor Preview URL)</strong> is locked to your private editor session and blocks mobile phones & WhatsApp with <code className="bg-amber-100 px-1 rounded">Action required: blocking a required security cookie</code>.
                  </li>
                  <li>
                    <strong>Permanent Fix (Takes 30 Seconds):</strong> Click the <strong>Deploy (Rocket Icon 🚀 "Deploy to Cloud Run")</strong> button in the <strong>top-right corner of the Google AI Studio window</strong> (outside this preview). That creates a permanent <strong>Public Freeware Cloud Run URL</strong> with zero login/cookie checks that opens directly inside WhatsApp on any mobile or desktop!
                  </li>
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-slate-600 font-semibold text-[11px]">Public Share URL:</span>
              <input
                type="text"
                value={customPublicUrl}
                onChange={(e) => handleSavePublicUrl(e.target.value)}
                placeholder={getCurrentAppUrl() || 'Paste your deployed Cloud Run URL here (optional)...'}
                className="bg-white border border-emerald-300 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-900 w-full sm:w-[380px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getCurrentAppUrl());
                  showToast('✅ Direct App URL copied to clipboard!');
                }}
                className="bg-white hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded border border-emerald-300 text-[11px] flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Single Unified Share Button with Multi-Channel Popover */}
        <div className="relative shrink-0 self-start xl:self-center">
          <button
            onClick={async () => {
              const shareUrl = getCurrentAppUrl();
              const shareText = `Hey colleagues! Check out MedThesisAI — a 100% free AI dissertation & research protocol co-pilot designed for MD/MS students under NMC PG Board guidelines (API pre-integrated, no login required):\n\n${shareUrl}`;
              if (typeof navigator !== 'undefined' && navigator.share && !isSandboxPreview) {
                try {
                  await navigator.share({
                    title: 'MedThesisAI - Free MD/MS Dissertation Co-Pilot',
                    text: shareText,
                    url: shareUrl,
                  });
                  return;
                } catch {
                  // Fallback to menu
                }
              }
              setShowShareMenu(!showShareMenu);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer text-xs shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Freeware App (WhatsApp / Email / Link)</span>
          </button>

          {showShareMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900">1-Click Freeware Share</span>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => {
                  const shareUrl = getCurrentAppUrl();
                  const preMessage = `Hey colleagues! Check out MedThesisAI — a 100% free AI dissertation & research protocol co-pilot designed for MD/MS students under NMC PG Board guidelines.\n\nDirect Link:\n${shareUrl}`;
                  navigator.clipboard.writeText(preMessage);
                  setShowShareMenu(false);
                  showToast('✅ WhatsApp invite copied! Paste (Ctrl+V) in any WhatsApp chat or group.');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <span>1. Copy for WhatsApp</span>
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  const shareUrl = getCurrentAppUrl();
                  const fullEmailText = `Subject: MedThesisAI - Free AI PG Medical Dissertation Co-Pilot\n\nHey colleagues!\n\nCheck out MedThesisAI — a 100% free AI dissertation & research protocol co-pilot designed for MD/MS students under NMC PG Board guidelines:\n\n${shareUrl}\n\nYou can open and write directly in Google Chrome or Safari on mobile or PC without any API key setup.`;
                  navigator.clipboard.writeText(fullEmailText);
                  setShowShareMenu(false);
                  showToast('✅ Email invite copied! Paste (Ctrl+V) into your email client.');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <span>2. Copy for Email</span>
                <FileText className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  const shareUrl = getCurrentAppUrl();
                  navigator.clipboard.writeText(shareUrl);
                  setShowShareMenu(false);
                  showToast('✅ Direct App Link copied to clipboard!');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
              >
                <span>3. Copy Direct URL Only</span>
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-xs text-slate-400 font-semibold tracking-wider uppercase mb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Agent Workspace</span>
            </div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Layout className="w-4 h-4 text-emerald-400" />
                <span>Dissertation Setup</span>
              </button>

              <button 
                onClick={() => setActiveTab('protocol')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'protocol' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <ClipboardCheck className="w-4 h-4 text-teal-400" />
                <span>NMC Protocol Builder</span>
              </button>

              <button 
                onClick={() => setActiveTab('chapters')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'chapters' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span>Chapter Drafts</span>
              </button>

              <button 
                onClick={() => setActiveTab('prompt_suite')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'prompt_suite' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Writer & Checker Suite</span>
              </button>

              <button 
                onClick={() => setActiveTab('pubmed')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pubmed' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>PubMed Literature</span>
              </button>

              <button 
                onClick={() => setActiveTab('plagiarism')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'plagiarism' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Plagiarism Guard</span>
              </button>

              <button 
                onClick={() => setActiveTab('frontmatter')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'frontmatter' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Front Matter & Certificates</span>
              </button>

              <button 
                onClick={() => setActiveTab('publication_ai')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'publication_ai' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>Publication AI (IMRAD)</span>
              </button>

              <button 
                onClick={() => setActiveTab('viva_prep')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'viva_prep' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Award className="w-4 h-4 text-purple-400" />
                <span>Viva Voce & Defense Slides</span>
              </button>

              <button 
                onClick={() => setActiveTab('export')} 
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'export' ? 'bg-slate-800 text-white font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>LaTeX & Export Hub</span>
              </button>
            </nav>
          </div>

          {/* Quick Active Chapter Switcher (Only visible in Chapter mode) */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-xs text-slate-500 font-semibold tracking-wider uppercase mb-2">Chapters Outline</div>
            <div className="space-y-1">
              {activeProject.chapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveTab('chapters');
                    setActiveChapterId(ch.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-all ${activeChapterId === ch.id && activeTab === 'chapters' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <div className="truncate font-medium">{ch.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* User profile / College indicator info in Sidebar bottom */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2 text-white font-medium">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeProject.candidateName || 'Dr. Postgraduate'}</span>
            </div>
            <div className="truncate text-slate-500">{activeProject.collegeName || 'National Medical College'}</div>
          </div>
        </aside>

        {/* Primary Workspace Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          
          {/* Active Banner Indicator */}
          <div className="bg-emerald-900 text-emerald-100 px-6 py-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-emerald-300">Indian Medical Post-grad dissertation agent</span>
              <h2 className="text-lg font-serif font-semibold truncate max-w-3xl text-white">
                {activeProject.title}
              </h2>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-emerald-800 rounded text-emerald-200 border border-emerald-700">
              {activeProject.specialty}
            </div>
          </div>

          {/* Content views */}
          <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
            
            {/* TAB 1: DISSERTATION SETUP / DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Topic Initialization Panel */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4 lg:col-span-2">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg border-b border-slate-100 pb-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>Initiate New MD/MS Dissertation Topic Outline</span>
                  </div>
                  
                  <p className="text-xs text-slate-500">
                    Just enter your designated clinical study topic. Our AI agent will query PubMed criteria and instantly outline research objectives, methodologies, relevant parameters, and sample observations customized for medical educational protocols.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Dissertation Topic / Title:</label>
                      <textarea
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="e.g., Clinical efficacy of Liposomal Amphotericin B versus conventional Amphotericin B in patients of Mucormycosis in a tertiary hospital of western India"
                        className="w-full min-h-[80px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">PG Medical Specialty/Department:</label>
                        <select
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {MEDICAL_SPECIALTIES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Affiliated Health University (India):</label>
                        <select
                          value={selectedUniv}
                          onChange={(e) => setSelectedUniv(e.target.value)}
                          className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          {INDIAN_UNIVERSITIES.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateProject}
                      disabled={isLoading || !newTopic.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Generating Comprehensive Medical Outline...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Literature Outline with Citations</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Left Side: Meta Configuration Form */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-2">
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>Dissertation Meta Settings</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Candidate / Author Name:</label>
                      <input 
                        type="text" 
                        value={activeProject.candidateName} 
                        onChange={(e) => updateActiveProjectField('candidateName', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="Dr. Siddharth Sharma"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dissertation Guide Name:</label>
                      <input 
                        type="text" 
                        value={activeProject.guideName} 
                        onChange={(e) => updateActiveProjectField('guideName', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="Prof. Dr. Rajesh K. Mishra"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Co-Guide Name (Optional):</label>
                      <input 
                        type="text" 
                        value={activeProject.coGuideName} 
                        onChange={(e) => updateActiveProjectField('coGuideName', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="Dr. Neeta Grover"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Medical College / Hospital Name:</label>
                      <input 
                        type="text" 
                        value={activeProject.collegeName} 
                        onChange={(e) => updateActiveProjectField('collegeName', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="Grant Government Medical College, Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Academic Batch / Year:</label>
                      <input 
                        type="text" 
                        value={activeProject.academicYear} 
                        onChange={(e) => updateActiveProjectField('academicYear', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="2024 - 2026"
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Status & Overview of Active Project */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-base font-serif font-bold text-slate-800">Current Dissertation Chapter Map & Completeness</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">6 Key Chapters</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeProject.chapters.map(ch => (
                      <div key={ch.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{ch.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ch.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400">
                            {ch.content.split(' ').length} words
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('chapters');
                              setActiveChapterId(ch.id);
                            }}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Open Editor</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: NMC PROTOCOL BUILDER */}
            {activeTab === 'protocol' && (
              <ProtocolBuilder
                activeProject={activeProject}
                showToast={showToast}
                onApplyToChapter={(chId, content, mode) => {
                  if (mode === 'replace') {
                    updateChapterContent(chId, content);
                  } else {
                    const existing = activeProject.chapters.find(c => c.id === chId)?.content || '';
                    updateChapterContent(chId, existing + '\n\n' + content);
                  }
                  setActiveChapterId(chId);
                  setActiveTab('chapters');
                  showToast('Protocol applied as chapter basis!');
                }}
              />
            )}

            {/* TAB 2: ACTIVE CHAPTER EDITING & REFINEMENT AREA */}
            {activeTab === 'chapters' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Main Chapter Writing Editor */}
                <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-slate-900">
                        {activeProject.chapters.find(ch => ch.id === activeChapterId)?.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeProject.chapters.find(ch => ch.id === activeChapterId)?.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {activeProject.annotations && activeProject.annotations.filter(a => a.chapterId === activeChapterId).length > 0 && (
                        <button
                          onClick={() => setShowPdfModal(true)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold py-1.5 px-2.5 rounded flex items-center space-x-1 cursor-pointer transition-colors"
                          title="View reviewer notes on this chapter in PDF Preview"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            {activeProject.annotations.filter(a => a.chapterId === activeChapterId).length} Reviewer Note(s)
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => setActiveTab('prompt_suite')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-2.5 rounded flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Open Part 1 & Part 2 Medical Thesis Writer & Checker Suite"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Writer & Checker Lab</span>
                      </button>

                      <button
                        onClick={() => handleAIWriteChapter(activeChapterId)}
                        disabled={isLoading}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-1.5 px-3 rounded flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Draft Chapter</span>
                      </button>
                    </div>
                  </div>

                  {/* Editing Area */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Chapter Markdown Editor:</label>
                    <textarea
                      value={activeProject.chapters.find(ch => ch.id === activeChapterId)?.content || ''}
                      onChange={(e) => updateChapterContent(activeChapterId, e.target.value)}
                      className="w-full min-h-[460px] p-4 text-sm bg-slate-50/60 font-mono text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Start writing clinical content here. Support LaTeX formatting for mathematical expressions like $$ \sigma = \sqrt{x} $$..."
                    />
                  </div>

                  {/* Visual Word Count Progress Bar with Recommended Chapter Length Targets */}
                  {(() => {
                    const currentWordCount = activeProject.chapters.find(ch => ch.id === activeChapterId)?.content.split(/\s+/).filter(Boolean).length || 0;
                    const target = RECOMMENDED_CHAPTER_TARGETS[activeChapterId] || {
                      minWords: 1000,
                      targetWords: 2000,
                      maxWords: 3500,
                      recommendation: 'Standard chapter recommendation: 1,500 – 2,500 words'
                    };
                    const progressPercent = Math.min(100, Math.round((currentWordCount / target.targetWords) * 100));

                    // Status labeling & coloring
                    let statusLabel = 'In Progress';
                    let barColor = 'bg-amber-500';
                    let badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                    if (currentWordCount >= target.minWords && currentWordCount <= target.maxWords) {
                      statusLabel = 'Optimal Dissertation Length';
                      barColor = 'bg-emerald-500';
                      badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    } else if (currentWordCount > target.maxWords) {
                      statusLabel = 'Exceeds Recommended Cap';
                      barColor = 'bg-indigo-500';
                      badgeBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    } else if (currentWordCount < target.minWords) {
                      statusLabel = 'Below Minimum Requirement';
                      barColor = 'bg-amber-500';
                      badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                    }

                    return (
                      <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700">Word Count Progress:</span>
                            <span className="font-bold text-slate-900 font-mono text-sm">
                              {currentWordCount.toLocaleString()}
                            </span>
                            <span className="text-slate-400 font-medium">
                              / {target.targetWords.toLocaleString()} target words
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badgeBg}`}>
                              {statusLabel}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-600">
                              {progressPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar Track */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative shadow-inner">
                          <div 
                            className={`h-full transition-all duration-300 rounded-full ${barColor}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Benchmark & Guidelines Details */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>{target.recommendation}</span>
                          <span className="font-medium text-slate-600">
                            Min: {target.minWords}w | Max: {target.maxWords}w
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Character/Reference counts */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Words: {activeProject.chapters.find(ch => ch.id === activeChapterId)?.content.split(/\s+/).filter(Boolean).length || 0}
                    </span>
                    <span>
                      Incorporated Citations: {activeProject.citations.length}
                    </span>
                  </div>
                </div>

                {/* Left side: AI Language Formatter & Style Translating Panel */}
                <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>AI Generator Flow & Humanizer</span>
                    </div>

                    <p className="text-xs text-slate-500 mb-4">
                      Academic writing should flow naturally. Format awkward clinical passages, sentence lengths, and structure into high-fidelity human-like scientific literature.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Select Improvement Mode:</label>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => setRefineType('humanize')}
                            className={`p-2.5 text-xs text-left rounded-lg border font-semibold flex items-center justify-between cursor-pointer ${refineType === 'humanize' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                          >
                            <span>💡 Human-Like Natural Tone</span>
                            {refineType === 'humanize' && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setRefineType('grammar')}
                            className={`p-2.5 text-xs text-left rounded-lg border font-semibold flex items-center justify-between cursor-pointer ${refineType === 'grammar' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                          >
                            <span>📝 Spell Check & Grammar Suggestions</span>
                            {refineType === 'grammar' && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => setRefineType('academic_flow')}
                            className={`p-2.5 text-xs text-left rounded-lg border font-semibold flex items-center justify-between cursor-pointer ${refineType === 'academic_flow' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                          >
                            <span>📊 Academic Sentence Structure</span>
                            {refineType === 'academic_flow' && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleRefineText}
                        disabled={isRefining}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        {isRefining ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Refining Draft...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Apply Language Formatting</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {refinedOutput && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Refined Academic Output:</span>
                        <button
                          onClick={() => {
                            updateChapterContent(activeChapterId, refinedOutput);
                            setRefinedOutput('');
                          }}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Apply to Chapter</span>
                        </button>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono max-h-[180px] overflow-y-auto whitespace-pre-wrap text-slate-700">
                        {refinedOutput}
                      </div>
                    </div>
                  )}

                  {/* Plagiarism quick analysis entry */}
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mt-4 text-xs space-y-2">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      <span>Plagiarism & Citations Check</span>
                    </div>
                    <p className="text-emerald-700 text-[11px]">
                      NMC rules mandate zero uncredited clinical literature copying. Scan this draft against real-time medical database patterns.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('plagiarism');
                        runPlagiarismAudit();
                      }}
                      className="bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-700 font-semibold py-1.5 px-3 rounded w-full transition-colors cursor-pointer text-[11px]"
                    >
                      Audit Plagiarism Risk
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: WRITER & CHECKER SUITE (PART 1, PART 2, GUARDRAILS, COMPLIANCE) */}
            {activeTab === 'prompt_suite' && (
              <ThesisWriterCheckerSuite
                activeProject={activeProject}
                activeChapterId={activeChapterId}
                onApplyToChapter={(chId, content, mode) => {
                  if (mode === 'replace') {
                    updateChapterContent(chId, content);
                  } else {
                    const existing = activeProject.chapters.find(c => c.id === chId)?.content || '';
                    updateChapterContent(chId, existing + '\n\n' + content);
                  }
                  setActiveChapterId(chId);
                  setActiveTab('chapters');
                  showToast('Content applied to Chapter successfully!');
                }}
                showToast={showToast}
              />
            )}

            {/* TAB 3: PUBMED INTEGRATION & REFERENCE MANAGEMENT */}
            {activeTab === 'pubmed' && (
              <div className="space-y-6">
                
                {/* Search Bar Panel */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <span>Query Real-Time Scientific PubMed Database</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Search PubMed instantly. Extract real DOIs, verified medical abstracts, and automatically format them into your Indian college thesis reference list.
                  </p>

                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={pubmedQuery}
                        onChange={(e) => setPubmedQuery(e.target.value)}
                        placeholder="Search Medical articles, e.g., 'Diabetic Neuropathy Vitamin D India'..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handlePubMedSearch()}
                      />
                    </div>
                    <button
                      onClick={handlePubMedSearch}
                      disabled={isSearchingPubmed}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {isSearchingPubmed ? 'Searching...' : 'Search PubMed'}
                    </button>
                  </div>

                  {pubmedError && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                      {pubmedError}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Results List */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                    <div className="text-sm font-bold text-slate-800 uppercase tracking-wide">PubMed Search Results</div>
                    
                    {isSearchingPubmed && (
                      <div className="flex flex-col items-center justify-center py-12 space-y-2 text-slate-400 text-xs">
                        <RotateCw className="w-8 h-8 animate-spin text-emerald-600" />
                        <span>Querying National Library of Medicine...</span>
                      </div>
                    )}

                    {!isSearchingPubmed && pubmedResults.length === 0 && (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No articles loaded yet. Enter terms above to retrieve peer-reviewed studies.
                      </div>
                    )}

                    {!isSearchingPubmed && pubmedResults.map((article) => (
                      <div key={article.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{article.title}</h4>
                          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 shrink-0 ml-2">
                            PMID: {article.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 italic">By: {article.authors}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span>Journal: {article.source} ({article.pubdate})</span>
                          <button
                            onClick={() => addCitation(article)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded border border-emerald-200 flex items-center space-x-1 transition-colors text-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Cite in Chapter</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Bibliography Panel */}
                  <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">Thesis Bibliography</span>
                      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                        <button
                          onClick={() => setBiblioView('list')}
                          className={`px-2.5 py-1 rounded font-medium transition-all ${biblioView === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Citations ({activeProject.citations.length})
                        </button>
                        <button
                          onClick={() => setBiblioView('analytics')}
                          className={`px-2.5 py-1 rounded font-medium flex items-center space-x-1 transition-all ${biblioView === 'analytics' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Depth Chart</span>
                        </button>
                      </div>
                    </div>

                    {/* View 1: Citations List Mode */}
                    {biblioView === 'list' && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-600">Select Citation formatting Style:</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['APA', 'MLA', 'Chicago'] as const).map(style => (
                              <button
                                key={style}
                                onClick={() => setCitationStyle(style)}
                                className={`py-1 rounded text-xs font-bold transition-all ${citationStyle === style ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* BibTeX Export for Zotero / Mendeley Bar */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="flex items-center space-x-1.5">
                            <FileCode className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="text-[11px] font-bold text-slate-800 leading-none">BibTeX Export</div>
                              <div className="text-[10px] text-slate-500">Zotero, Mendeley, JabRef</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={handleCopyBibTeX}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                              title="Copy BibTeX entries to clipboard"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                            <button
                              onClick={handleExportBibTeX}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                              title="Download .bib file for Zotero, Mendeley, JabRef, or EndNote"
                            >
                              <Download className="w-3 h-3" />
                              <span>Export .bib</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Literature Depth Bar */}
                        {activeProject.citations.length > 0 && (() => {
                          const currentYear = 2026;
                          const recentCount = activeProject.citations.filter(c => {
                            const match = c.pubdate.match(/\b(19\d\d|20\d\d)\b/);
                            return match ? parseInt(match[0]) >= (currentYear - 5) : false;
                          }).length;
                          const recentPercent = Math.round((recentCount / activeProject.citations.length) * 100);

                          return (
                            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg flex items-center justify-between text-[11px] text-emerald-900">
                              <div className="flex items-center space-x-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Recent Studies (Last 5 Yrs):</span>
                                <span className="font-bold text-emerald-700">{recentPercent}%</span>
                              </div>
                              <button
                                onClick={() => setBiblioView('analytics')}
                                className="text-emerald-700 font-bold hover:underline flex items-center space-x-0.5 text-[11px]"
                              >
                                <span>View Chart</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })()}

                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                          {activeProject.citations.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 py-12">
                              No citations generated. Search PubMed and click "Cite in Chapter" to start.
                            </div>
                          ) : (
                            activeProject.citations.map((c, idx) => (
                              <div key={c.id} className="p-3 bg-slate-50 rounded border border-slate-200 relative text-xs space-y-1">
                                <button
                                  onClick={() => {
                                    const list = activeProject.citations.filter(item => item.id !== c.id);
                                    updateActiveProjectField('citations', list);
                                  }}
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                                  title="Remove citation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="font-bold text-emerald-700 font-mono">
                                  Citation Key: {c.citationKey}
                                </div>
                                <p className="text-slate-700 pr-4 leading-relaxed font-sans">
                                  {getFormattedReference(c, citationStyle, idx + 1)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}

                    {/* View 2: Literature Review Depth Chart Mode (Recharts) */}
                    {biblioView === 'analytics' && (
                      <div className="space-y-3">
                        {/* Metric Selector Toggles */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">Distribution Metric:</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setChartMetric('years')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${chartMetric === 'years' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                              Publication Years
                            </button>
                            <button
                              onClick={() => setChartMetric('journals')}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${chartMetric === 'journals' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                              Cited Journals
                            </button>
                          </div>
                        </div>

                        {/* Analytic Stats Badges */}
                        {(() => {
                          const citations = activeProject.citations;
                          if (citations.length === 0) {
                            return (
                              <div className="text-center text-xs text-slate-400 py-16">
                                Add PubMed literature citations to view depth analytics and chart.
                              </div>
                            );
                          }

                          // Compute year distribution
                          const yearCounts: Record<string, number> = {};
                          const yearsList: number[] = [];
                          citations.forEach(c => {
                            const match = c.pubdate.match(/\b(19\d\d|20\d\d)\b/);
                            const yearStr = match ? match[0] : 'Undated';
                            yearCounts[yearStr] = (yearCounts[yearStr] || 0) + 1;
                            if (match) yearsList.push(parseInt(match[0]));
                          });

                          const yearChartData = Object.keys(yearCounts)
                            .sort((a, b) => (a === 'Undated' ? 1 : b === 'Undated' ? -1 : a.localeCompare(b)))
                            .map(year => ({
                              label: year,
                              count: yearCounts[year]
                            }));

                          // Compute journal distribution
                          const journalCounts: Record<string, number> = {};
                          citations.forEach(c => {
                            // Extract primary journal name or simplify
                            const raw = (c.source || 'Medical Journal').split(',')[0].split(':')[0].trim();
                            const cleanJournal = raw.length > 24 ? raw.substring(0, 24) + '...' : raw;
                            journalCounts[cleanJournal] = (journalCounts[cleanJournal] || 0) + 1;
                          });

                          const journalChartData = Object.keys(journalCounts)
                            .sort((a, b) => journalCounts[b] - journalCounts[a])
                            .slice(0, 7)
                            .map(j => ({
                              label: j,
                              count: journalCounts[j]
                            }));

                          // Metrics
                          const currentYear = 2026;
                          const recentCount = citations.filter(c => {
                            const match = c.pubdate.match(/\b(19\d\d|20\d\d)\b/);
                            return match ? parseInt(match[0]) >= (currentYear - 5) : false;
                          }).length;
                          const recencyRate = Math.round((recentCount / citations.length) * 100);
                          const minYear = yearsList.length > 0 ? Math.min(...yearsList) : 'N/A';
                          const maxYear = yearsList.length > 0 ? Math.max(...yearsList) : 'N/A';
                          const uniqueJournalsCount = Object.keys(journalCounts).length;

                          const activeChartData = chartMetric === 'years' ? yearChartData : journalChartData;

                          return (
                            <div className="space-y-3">
                              {/* 3 Analytics Cards */}
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-medium">Recency (&le;5 yrs)</div>
                                  <div className="text-xs font-bold text-emerald-600 font-mono mt-0.5">{recencyRate}%</div>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-medium">Timeline Span</div>
                                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                                    {minYear} - {maxYear}
                                  </div>
                                </div>
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                  <div className="text-[10px] text-slate-400 font-medium">Journals</div>
                                  <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">{uniqueJournalsCount}</div>
                                </div>
                              </div>

                              {/* Recharts Bar Chart Container */}
                              <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-2.5 pt-3">
                                <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                                  <span>{chartMetric === 'years' ? 'Articles Published by Year' : 'Top Cited Medical Journals'}</span>
                                  <span className="text-[10px] text-slate-400">Total: {citations.length} studies</span>
                                </div>
                                
                                <div className="w-full h-[180px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activeChartData} margin={{ top: 8, right: 10, left: -22, bottom: 20 }}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                      <XAxis 
                                        dataKey="label" 
                                        tick={{ fontSize: 9, fill: '#64748b' }}
                                        interval={0}
                                        angle={chartMetric === 'journals' ? -25 : 0}
                                        textAnchor={chartMetric === 'journals' ? 'end' : 'middle'}
                                      />
                                      <YAxis 
                                        allowDecimals={false} 
                                        tick={{ fontSize: 9, fill: '#64748b' }}
                                      />
                                      <Tooltip 
                                        contentStyle={{
                                          backgroundColor: '#0f172a',
                                          borderRadius: '6px',
                                          border: 'none',
                                          fontSize: '11px',
                                          color: '#fff',
                                          padding: '6px 10px'
                                        }}
                                        formatter={(val: any) => [`${val} Article(s)`, 'Citations']}
                                        labelStyle={{ color: '#34d399', fontWeight: 'bold', marginBottom: '2px' }}
                                      />
                                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {activeChartData.map((_, index) => (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={chartMetric === 'years' ? '#059669' : '#0d9488'} 
                                          />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-500 italic leading-snug">
                                {recencyRate >= 60 
                                  ? '✓ Strong literature depth: Over 60% of cited evidence is contemporary (last 5 years), meeting Indian University thesis committee expectations.' 
                                  : 'Notice: Consider adding recent peer-reviewed articles from PubMed to elevate the 5-year recency index above 60%.'}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: PLAGIARISM CHECKING PANEL */}
            {activeTab === 'plagiarism' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Draft for scanning */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center space-x-2">
                      <ShieldAlert className="w-5 h-5 text-emerald-600" />
                      <span>Plagiarism & Scientific Integrity Guard</span>
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                      Target: {activeProject.chapters.find(ch => ch.id === activeChapterId)?.name}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Analyze the selected chapter text to detect exact-match plagiarism, medical mosaic paraphrasing, and check compliance with national clinical journals.
                  </p>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 max-h-[320px] overflow-y-auto whitespace-pre-wrap">
                    {activeProject.chapters.find(ch => ch.id === activeChapterId)?.content || 'No text written in active chapter.'}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <select
                      value={activeChapterId}
                      onChange={(e) => setActiveChapterId(e.target.value)}
                      className="text-xs bg-slate-100 border border-slate-200 p-2 rounded-lg"
                    >
                      {activeProject.chapters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={runPlagiarismAudit}
                      disabled={isCheckingPlag}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      {isCheckingPlag ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Executing Web Scans & Medical Matches...</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4" />
                          <span>Audit Chapter for Plagiarism</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Audit Results */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                    Scan Report Summary
                  </div>

                  {isCheckingPlag && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs space-y-2">
                      <RotateCw className="w-8 h-8 animate-spin text-emerald-600" />
                      <span>Matching sentence strings on Open Web...</span>
                    </div>
                  )}

                  {!isCheckingPlag && !plagReport && (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      Run the audit on the left to review duplication status and integrity indices.
                    </div>
                  )}

                  {!isCheckingPlag && plagReport && (
                    <div className="space-y-4 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                        <span className="font-semibold">Plagiarism Status:</span>
                        <span className="font-bold text-sm px-2.5 py-0.5 rounded bg-white shadow-xs">
                          {plagReport.status || 'Original'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>Overall Duplicate Index:</span>
                          <span className="font-bold text-slate-950">{plagReport.overallScore || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${plagReport.overallScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${plagReport.overallScore}%` }}
                          />
                        </div>
                      </div>

                      {plagReport.matches && plagReport.matches.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <span className="font-bold text-slate-700 block">Identified Literature Matches:</span>
                          {plagReport.matches.map((m, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                                <span className="truncate">{m.journal}</span>
                                <span className="text-red-500">{m.similarity}% Match</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2 rounded border border-slate-100 font-mono">
                                <div className="space-y-1">
                                  <span className="text-slate-400 font-semibold block uppercase">Your Draft:</span>
                                  <p className="text-slate-600 italic line-clamp-3">{m.inputText}</p>
                                </div>
                                <div className="space-y-1 border-l border-slate-200 pl-2">
                                  <span className="text-slate-400 font-semibold block uppercase">Source Database:</span>
                                  <p className="text-slate-600 italic line-clamp-3">{m.matchedText}</p>
                                </div>
                              </div>
                              {m.url && (
                                <a 
                                  href={m.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[10px] text-emerald-600 font-bold block hover:underline"
                                >
                                  View on PubMed / DOI Link
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {plagReport.recommendations && (
                        <div className="p-3 bg-purple-50 text-purple-700 rounded border border-purple-100 space-y-1">
                          <span className="font-bold block">Integrity Recommendations:</span>
                          <p className="leading-relaxed whitespace-pre-wrap">{plagReport.recommendations}</p>
                        </div>
                      )}

                      {plagReport.rawReport && (
                        <div className="p-3 bg-slate-50 text-slate-600 rounded border border-slate-200 space-y-1 whitespace-pre-wrap">
                          <span className="font-bold block">Plagiarism Audit Log:</span>
                          <p className="font-mono text-[11px] leading-relaxed">{plagReport.rawReport}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 5: FRONT MATTER & CERTIFICATES */}
            {activeTab === 'frontmatter' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* College university certificate configurations */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span>Indian University Front Matter Settings</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    In Indian PG dissertations, specific Certificate structures of Guides, Head of Departments (HOD), candidate declarations, and logbook entries are mandatory. Customizing this will auto-generate pre-filled preface files.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">State Health University:</label>
                      <input
                        type="text"
                        value={activeProject.university}
                        onChange={(e) => updateActiveProjectField('university', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Upload College / Hospital Emblem (Emblem embedding):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUploadSim}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                      />
                      {collegeLogo && (
                        <div className="mt-2 flex items-center space-x-2">
                          <img src={collegeLogo} alt="College emblem" className="w-12 h-12 object-contain border rounded p-1 bg-white" />
                          <span className="text-[10px] text-emerald-600 font-semibold">Emblem configured and ready for LaTeX!</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={generateOfficialFrontMatter}
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      {isLoading ? 'Generating Documents...' : 'Generate Official Front Matter'}
                    </button>

                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Indian College Scrutiny:</span>
                        <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          NMC PGMER
                        </span>
                      </div>

                      <button
                        onClick={() => setShowComplianceModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <ClipboardCheck className="w-4 h-4 text-indigo-200" />
                        <span>Institutional Compliance</span>
                      </button>

                      <p className="text-[10px] text-slate-500 leading-tight">
                        Generates a comprehensive downloadable checklist covering IEC approval, vernacular consent, logbook, plagiarism verification, and college forwarding docket.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preface & Acknowledgement Output */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">Generated Declaration, Certificates & Preface</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowComplianceModal(true)}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded border border-indigo-200 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Institutional Compliance Checklist</span>
                      </button>
                      <button
                        onClick={() => {
                          // Create sample patient logbook if not filled
                          const sampleLog = `## CLINICAL DISSERTATION LOGBOOK JOURNAL
- Patient Case 1: Male, 45y, diagnosed with Vitamin D status (12 ng/ml). Registered in General Medicine OPD.
- Patient Case 2: Female, 54y, reported diabetic distal symmetrical polyneuropathy severity score (MNSI 7).
- Patient Case 3: Male, 38y, laboratory HbA1c correlation recorded (9.2%).`;
                          updateActiveProjectField('logbook', sampleLog);
                          showToast('Sample Dissertation Logbook pre-populated in export hub!');
                        }}
                        className="text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        Pre-populate Logbook
                      </button>
                    </div>
                  </div>

                  {activeProject.frontMatter ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {activeProject.frontMatter}
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        This content is fully formatted and ready to be compiled to LaTeX format in the Export Hub.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs text-center space-y-2">
                      <Clipboard className="w-12 h-12 text-slate-300" />
                      <span>No Front Matter certificates generated yet. Click "Generate Official Front Matter" on the left to structure standard Indian declarations and preface guides.</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: PUBLICATION AI */}
            {activeTab === 'publication_ai' && (
              <PublicationAI
                activeProject={activeProject}
                showToast={showToast}
              />
            )}

            {/* TAB: VIVA PREP & DEFENSE SLIDES */}
            {activeTab === 'viva_prep' && (
              <DefenseVivaPrep
                activeProject={activeProject}
                showToast={showToast}
              />
            )}

            {/* TAB 6: LATEX & EXPORT HUB */}
            {activeTab === 'export' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Export actions */}
                <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-2">
                    <Download className="w-5 h-5 text-emerald-600" />
                    <span>Compile & Export Document</span>
                  </div>

                  <p className="text-xs text-slate-500">
                    We compile your dissertation chapters, PubMed references, structured observations/results tables, and state university declarations into clean, publisher-ready academic export materials.
                  </p>

                  <div className="space-y-2.5">
                    {/* Primary Button: Open Fullscreen PDF Preview Window */}
                    <button
                      onClick={() => setShowPdfModal(true)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Eye className="w-4 h-4 text-emerald-100" />
                      <span>Preview Formatted Dissertation PDF (react-pdf)</span>
                    </button>

                    {/* Direct PDF Download via BlobProvider */}
                    <BlobProvider document={<ThesisPdfDocument project={activeProject} />}>
                      {({ url, loading }) => (
                        <a
                          href={url || '#'}
                          download={`${activeProject.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Dissertation.pdf`}
                          className={`w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{loading ? 'Compiling PDF with react-pdf...' : 'Download Dissertation PDF Document'}</span>
                        </a>
                      )}
                    </BlobProvider>

                    <button
                      onClick={() => {
                        // Generate dynamic Markdown for complete thesis
                        let fullMd = `# DISSERTATION\n\nTitle: ${activeProject.title}\nCandidate: Dr. ${activeProject.candidateName}\nGuide: ${activeProject.guideName}\n\n`;
                        if (activeProject.frontMatter) {
                          fullMd += `## FRONT MATTER\n\n${activeProject.frontMatter}\n\n`;
                        }
                        activeProject.chapters.forEach(ch => {
                          fullMd += `${ch.content}\n\n`;
                        });
                        if (activeProject.logbook) {
                          fullMd += `## LOGBOOK DETAILS\n\n${activeProject.logbook}\n\n`;
                        }

                        const blob = new Blob([fullMd], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${activeProject.title.substring(0, 30)}_MD_MS_Thesis.md`;
                        a.click();
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Download Clean Markdown (.md)</span>
                    </button>

                    <button
                      onClick={() => {
                        // Generate LaTeX document code
                        let latexCode = `\\documentclass[12pt,a4paper,oneside]{book}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{cite}

\\title{${activeProject.title}}
\\author{Dr. ${activeProject.candidateName}}
\\date{${activeProject.academicYear}}

\\begin{document}
\\maketitle

\\chapter*{Declaration}
The clinical dissertation studies recorded here are conducted strictly under professional Indian Medical protocols...

`;
                        activeProject.chapters.forEach(ch => {
                          latexCode += `\n\\chapter{${ch.name.replace(/^\d+\.\s*/, '')}}\n`;
                          // Convert some basic Markdown headings to LaTeX
                          const latexified = ch.content
                            .replace(/##\s+(.*)/g, '\\section{$1}')
                            .replace(/###\s+(.*)/g, '\\subsection{$1}');
                          latexCode += latexified + `\n`;
                        });

                        latexCode += `\n\\end{document}`;

                        const blob = new Blob([latexCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${activeProject.title.substring(0, 30)}_LaTeX.tex`;
                        a.click();
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <PenTool className="w-4 h-4 text-emerald-400" />
                      <span>Download LaTeX Source (.tex)</span>
                    </button>

                    <button
                      onClick={handleExportBibTeX}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <FileCode className="w-4 h-4 text-amber-700" />
                      <span>Download BibTeX (.bib) for Zotero/Mendeley</span>
                    </button>

                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Layout className="w-4 h-4 text-slate-500" />
                      <span>Print Formatted Dissertation Layout</span>
                    </button>
                  </div>
                </div>

                {/* Compilation & Live PDF preview */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {exportPreviewTab === 'pdf' 
                          ? 'Formatted Dissertation PDF Preview' 
                          : exportPreviewTab === 'latex' 
                            ? 'LaTeX Compatible Source Preview' 
                            : 'BibTeX (.bib) Citation Source (Zotero / Mendeley)'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                        <button
                          onClick={() => setExportPreviewTab('pdf')}
                          className={`px-2.5 py-1 rounded font-medium transition-all ${exportPreviewTab === 'pdf' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          PDF Viewer (react-pdf)
                        </button>
                        <button
                          onClick={() => setExportPreviewTab('latex')}
                          className={`px-2.5 py-1 rounded font-medium transition-all ${exportPreviewTab === 'latex' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          LaTeX Code
                        </button>
                        <button
                          onClick={() => setExportPreviewTab('bibtex')}
                          className={`px-2.5 py-1 rounded font-medium transition-all ${exportPreviewTab === 'bibtex' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          BibTeX (.bib)
                        </button>
                      </div>

                      {exportPreviewTab === 'pdf' && (
                        <button
                          onClick={() => setShowPdfModal(true)}
                          className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded border border-emerald-200 flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Fullscreen Window</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {exportPreviewTab === 'pdf' ? (
                    <div className="space-y-3">
                      <div className="w-full h-[470px] bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                        <PDFViewer width="100%" height="100%" showToolbar={true} className="border-0">
                          <ThesisPdfDocument project={activeProject} />
                        </PDFViewer>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>Includes Cover/Title Page, Candidate Declaration, Guide Certification & {activeProject.chapters.length} Chapters.</span>
                        <span className="font-semibold text-emerald-700">A4 Standard Format</span>
                      </div>
                    </div>
                  ) : exportPreviewTab === 'latex' ? (
                    <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 h-[470px] overflow-y-auto whitespace-pre leading-relaxed">
{`% ==========================================
% LATEX COMPATIBLE DISSERTATION LAYOUT
% ==========================================
\\documentclass[12pt,a4paper,oneside]{book}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{cite}

\\title{${activeProject.title}}
\\author{Dr. ${activeProject.candidateName}}
\\date{${activeProject.academicYear}}

\\begin{document}
\\maketitle

% Declaration and certificates embedded
% Affiliated to: ${activeProject.university}

\\chapter*{Abstract}
Correlation of demographic characteristics and biomarkers conducted for postgraduate studies under ${activeProject.collegeName}...

${activeProject.chapters.map(ch => `
\\chapter{${ch.name}}
% Content length: ${ch.content.split(' ').length} words
`).join('')}

\\end{document}`}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1 text-xs">
                        <span className="text-slate-500 font-medium">
                          {activeProject.citations.length} Citations Formatted for Citation Managers (Zotero, Mendeley, JabRef, EndNote)
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCopyBibTeX}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy BibTeX</span>
                          </button>
                          <button
                            onClick={handleExportBibTeX}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download .bib</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-amber-200/90 h-[440px] overflow-y-auto whitespace-pre leading-relaxed">
{`% =======================================================
% BibTeX Bibliography Export for Zotero, Mendeley & EndNote
% Generated by MedThesisAI - Postgraduate Medical Dissertation Agent
% Thesis Title: ${activeProject.title}
% Candidate: Dr. ${activeProject.candidateName} (${activeProject.specialty})
% University: ${activeProject.university}
% =======================================================

${generateBibTeX(activeProject.citations) || '% No citations added yet. Search PubMed to add studies.'}`}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </main>
      </div>

      {/* Applet Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-3 px-6 text-xs flex items-center justify-between">
        <span>© 2026 MedThesisAI. Compliance verified for NMC PG Medical Dissertation rules in India.</span>
        <span>Version 1.2 (Active Academic Engine)</span>
      </footer>

      {/* In-UI Notification Toast (replaces window.alert for iframe safety) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 text-xs flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* PDF Preview Modal Window (react-pdf) with Highlights & Reviewer Notes */}
      {showPdfModal && (
        <DissertationPdfPreviewModal
          project={activeProject}
          onClose={() => setShowPdfModal(false)}
          onSaveAnnotations={(newAnns) => updateActiveProjectField('annotations', newAnns)}
        />
      )}

      {/* Institutional Compliance Checklist Modal */}
      {showComplianceModal && (
        <InstitutionalComplianceModal
          project={activeProject}
          onClose={() => setShowComplianceModal(false)}
          onAttachToFrontMatter={(checklistText) => {
            const existing = activeProject.frontMatter || '';
            updateActiveProjectField('frontMatter', existing ? existing + '\n\n' + checklistText : checklistText);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
