import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  Layers, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Download, 
  CheckCircle, 
  MessageSquare, 
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';

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
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; citationKey: string }>;
  };
  showToast: (msg: string) => void;
}

const MOCK_VIVA_QUESTIONS = [
  {
    id: 1,
    question: "Why did you choose this specific clinical dissertation topic and what is the primary clinical significance of your study?",
    answerHint: "Focus on the rising burden in Indian population, the specific gap (such as lack of quantitative correlation with nerve action potentials), and therapeutic risk stratification.",
    examinerComment: "Excellent response. Always connect your background burden directly to regional Indian datasets (like ICMR statistics)."
  },
  {
    id: 2,
    question: "How did you justify and calculate your sample size? Is a study population of 50 statistically powered?",
    answerHint: "Mention the prevalence formula n = (Z_alpha^2 * p * q) / d^2. If clinical prevalence was estimated at 25%, d = 5% margin of error gives exactly n=50.",
    examinerComment: "Very precise. Explicitly quoting your margin of error (d = 0.05) and alpha level protects your methodology from academic objections."
  },
  {
    id: 3,
    question: "Which statistical tests did you select to analyze the correlation, and why was a Pearson coefficient preferred over Spearman?",
    answerHint: "Pearson is used if continuous biological data is normally distributed; if the variables exhibit non-normal distributions or ordinal scores, Spearman rank-order correlation is mathematically required.",
    examinerComment: "Correct. Always state that normality was checked via Kolmogorov-Smirnov/Shapiro-Wilk before selecting the correlation model."
  },
  {
    id: 4,
    question: "What are the primary confounding variables in this study and how did you adjust for them in your results?",
    answerHint: "Major confounders include HbA1c, patient age, and duration of diabetes. These were adjusted using multivariate regression models.",
    examinerComment: "Outstanding. Acknowledging confounders and explaining regression adjustment shows high clinical maturity."
  }
];

export const DefenseVivaPrep: React.FC<Props> = ({
  activeProject,
  showToast
}) => {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<'viva' | 'slides'>('viva');

  // Viva States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [studentResponse, setStudentResponse] = useState('');
  const [examinerResponse, setExaminerComment] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Slide State
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const currentQuestion = MOCK_VIVA_QUESTIONS[currentQuestionIdx];

  const handleEvaluateResponse = () => {
    if (!studentResponse.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setExaminerComment(`[EVALUATION FEEDBACK] Dr. ${activeProject.candidateName}, you articulated this well. ${currentQuestion.examinerComment}`);
      setIsEvaluating(false);
      showToast('Examiner evaluation generated!');
    }, 700);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < MOCK_VIVA_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setStudentResponse('');
      setExaminerComment('');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setStudentResponse('');
      setExaminerComment('');
    }
  };

  // Compile Slide deck
  const DEFENSE_SLIDES = [
    {
      title: "DISSERTATION DEFENSE PRESENTATION",
      subtitle: activeProject.title,
      bullets: [
        `Candidate: Dr. ${activeProject.candidateName} (${activeProject.specialty})`,
        `Supervisor / Guide: Prof. Dr. ${activeProject.guideName}`,
        `Institution: ${activeProject.collegeName}`,
        `University: ${activeProject.university}`
      ]
    },
    {
      title: "1. BACKGROUND & Burden",
      subtitle: "Study Context & Scientific Progression",
      bullets: [
        "Metabolic microvascular conditions are a rising public health crisis in South Asian populations.",
        "Diabetic peripheral neuropathy is often diagnosed late, leading to irreversible nerve conduction failure.",
        "Emerging local trials indicate high rates of metabolic and biomarker variations among Indian postgraduates."
      ]
    },
    {
      title: "2. RATIONALE & RESEARCH GAP",
      subtitle: "Why this study is important",
      bullets: [
        "Most previous Indian literature focused purely on clinical scores without objective neurophysiological correlation.",
        "Marked regional variability exists in clinical diagnostics and patient risk factors.",
        "This dissertation directly addresses the quantitative link between biochemical titers and nerve conduction amplitudes."
      ]
    },
    {
      title: "3. PRIMARY OBJECTIVES",
      subtitle: "Aims for study validation",
      bullets: [
        "Primary Aim: To evaluate correlation between Serum Biomarkers and nerve conduction velocities.",
        "Secondary Objective 1: Map the demographic prevalence of risk factors.",
        "Secondary Objective 2: Determine optimal biochemical diagnostic cut-offs using ROC analysis."
      ]
    },
    {
      title: "4. STUDY METHODOLOGY",
      subtitle: "Materials & Protocols",
      bullets: [
        "Study Design: Hospital-based prospective observational study.",
        "Location: Tertiary teaching hospital clinics.",
        "Sample Size: 50 confirmed participants meeting stringent selection criteria.",
        "Ethics: Fully approved by Institutional Ethics Committee (IEC)."
      ]
    },
    {
      title: "5. INCLUSION & EXCLUSION CRITERIA",
      subtitle: "Participant Selection Protocol",
      bullets: [
        "Inclusion: Consenting diabetic patients aged 18-65y with symptomatic neuropathy.",
        "Exclusion: Pregnant women, chronic renal failure, or active supplementation inside 3 months.",
        "Informed Written Consent: Bilingual (Vernacular and English) obtained."
      ]
    },
    {
      title: "6. OBSERVATIONS: DEMOGRAPHICS",
      subtitle: "Subject Baseline Characteristics",
      bullets: [
        "Total study sample: N = 50 cases.",
        "Age distribution: Mean age 52.4 ± 8.1 years; predominantly male (56%).",
        "Glycemic control: Elevated HbA1c average indicating high-risk clinical cohort."
      ]
    },
    {
      title: "7. STATISTICAL CORRELATIONS",
      subtitle: "Primary Analytical Findings",
      bullets: [
        "Statistically significant inverse correlation observed between biomarker levels and Toronto clinical neuropathy score (p = 0.003).",
        "Significantly lower sensory nerve amplitudes registered in deficient cohorts.",
        "Multivariate regression confirmed independent associations of glycemic status."
      ]
    },
    {
      title: "8. DISCUSSION & TRIAL COMPARISONS",
      subtitle: "Conforming with Landmark Literature",
      bullets: [
        "Our findings are congruent with major Indian multi-center studies.",
        "Highlight the diagnostic benefit of active biochemical screening in diabetic neuropathy clinics.",
        "Confirms physiological neuroprotective theories of calcium receptor signaling."
      ]
    },
    {
      title: "9. STRENGTHS & CLINICAL LIMITATIONS",
      subtitle: "Critical Study Evaluation",
      bullets: [
        "Strengths: High-fidelity electrophysiological measurements, no subjective recall bias.",
        "Limitations: Relatively small sample size (n=50) in a single-center tertiary hospital limits generalization."
      ]
    },
    {
      title: "10. CONCLUSION & TAKE-HOME MESSAGE",
      subtitle: "Direct Clinical Application",
      bullets: [
        "Active screening for biochemical markers is highly recommended in patients with diabetic polyneuropathy.",
        "Supports early nutritional or supplement interventions to prevent nerve axonal damage.",
        "Welfare Statement: This open-access medical resource is created for academic postgraduate research welfare."
      ]
    }
  ];

  const currentSlide = DEFENSE_SLIDES[currentSlideIdx];

  const handleNextSlide = () => {
    if (currentSlideIdx < DEFENSE_SLIDES.length - 1) {
      setCurrentSlideIdx(currentSlideIdx + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(currentSlideIdx - 1);
    }
  };

  const copySlideText = () => {
    let text = `SLIDE ${currentSlideIdx + 1}: ${currentSlide.title}\n${currentSlide.subtitle}\n\n`;
    currentSlide.bullets.forEach(b => {
      text += `- ${b}\n`;
    });
    navigator.clipboard.writeText(text);
    showToast(`Slide ${currentSlideIdx + 1} content copied to clipboard!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Header bar */}
      <div className="p-5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-serif font-bold tracking-tight">
              Postgraduate Viva Prep & Defense PPT Generator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Prepare for your thesis defense exam with interactive mock examiners, and generate structured academic slide structures in 1-click.
          </p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('viva')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${activeSubTab === 'viva' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'}`}
          >
            Mock Viva Voce
          </button>
          <button
            onClick={() => setActiveSubTab('slides')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${activeSubTab === 'slides' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-400 hover:text-white'}`}
          >
            Defense Slide Deck
          </button>
        </div>
      </div>

      <div className="p-6">
        
        {/* VIEW 1: VIVA SIMULATOR */}
        {activeSubTab === 'viva' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Examiner Question & Hint */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wide flex items-center space-x-1">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>External Examiner Question {currentQuestion.id} of {MOCK_VIVA_QUESTIONS.length}</span>
                  </span>
                  <span className="text-[10px] bg-white border border-purple-200 px-2 py-0.5 rounded font-bold font-mono text-purple-700">
                    EXAM BOARD
                  </span>
                </div>

                <p className="text-sm font-serif font-bold text-slate-900 leading-snug">
                  "{currentQuestion.question}"
                </p>

                {/* Hint collapsible */}
                <div className="p-3 bg-white border border-purple-100 rounded-lg text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">💡 Recommended Focus:</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{currentQuestion.answerHint}</p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Question</span>
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIdx === MOCK_VIVA_QUESTIONS.length - 1}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive typing & evaluation feedback */}
            <div className="lg:col-span-6 space-y-4 flex flex-col">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-3.5 flex-1">
                  <label className="block text-xs font-bold text-slate-700">Type Your Defense Answer / Explanation:</label>
                  <textarea
                    rows={4}
                    value={studentResponse}
                    onChange={(e) => setStudentResponse(e.target.value)}
                    placeholder="Type your academic response here as you would explain to your medical thesis board..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none"
                  />

                  {examinerResponse && (
                    <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-lg text-xs leading-relaxed text-purple-950 font-sans space-y-1">
                      <span className="font-bold flex items-center space-x-1 text-[11px] text-purple-800">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span>Examiner Assessment:</span>
                      </span>
                      <p className="text-[11px] font-medium">{examinerResponse}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Aim for precise, statistics-driven explanations.</span>
                  <button
                    onClick={handleEvaluateResponse}
                    disabled={isEvaluating || !studentResponse.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all shadow-xs"
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
        )}

        {/* VIEW 2: DEFENSE SLIDES */}
        {activeSubTab === 'slides' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Slides checklist / thumbnails index */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Dissertation Presentation Slides List
              </span>

              <div className="space-y-1 max-h-80 overflow-y-auto pr-1 text-xs">
                {DEFENSE_SLIDES.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIdx(idx)}
                    className={`w-full p-2.5 rounded-lg text-left border transition-all flex items-center space-x-2 cursor-pointer ${currentSlideIdx === idx ? 'border-purple-600 bg-purple-50 text-purple-950 font-semibold' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span className="font-mono text-slate-400">#{idx + 1}</span>
                    <span className="truncate">{slide.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Beautiful visual slide viewer preview card */}
            <div className="lg:col-span-8 flex flex-col space-y-3">
              
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 rounded-2xl shadow-xl min-h-[320px] flex flex-col justify-between relative border border-slate-800">
                
                {/* Visual slide banner top */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                    {activeProject.collegeName || 'National Medical College'}
                  </span>
                  <span className="text-xs font-mono font-bold text-white/50">
                    Slide {currentSlideIdx + 1} of {DEFENSE_SLIDES.length}
                  </span>
                </div>

                {/* Main slide body content */}
                <div className="my-6 space-y-3 flex-1 flex flex-col justify-center">
                  <div>
                    <h3 className="text-lg md:text-xl font-serif font-bold text-white leading-tight">
                      {currentSlide.title}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium italic mt-0.5">{currentSlide.subtitle}</p>
                  </div>

                  <ul className="space-y-1.5 pt-2">
                    {currentSlide.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer elements */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-slate-400">
                  <span>MD/MS Thesis Defense Committee</span>
                  <span>Dr. ${activeProject.candidateName}</span>
                </div>
              </div>

              {/* Navigation & export tool actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={copySlideText}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Slide</span>
                  </button>
                  <button
                    onClick={() => {
                      // Download slide content as txt file
                      let textStr = `=== DISSERTATION DEFENSE PRESENTATION ===\n\n`;
                      DEFENSE_SLIDES.forEach((s, idx) => {
                        textStr += `SLIDE ${idx + 1}: ${s.title}\n${s.subtitle}\n`;
                        s.bullets.forEach(b => {
                          textStr += `- ${b}\n`;
                        });
                        textStr += `\n`;
                      });

                      const blob = new Blob([textStr], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Thesis_Defense_Presentation_Slides.txt`;
                      a.click();
                      showToast('Thesis Defense Slides presentation downloaded!');
                    }}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Slides (.txt)</span>
                  </button>
                </div>

                <div className="flex space-x-1.5">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIdx === 0}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIdx === DEFENSE_SLIDES.length - 1}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
