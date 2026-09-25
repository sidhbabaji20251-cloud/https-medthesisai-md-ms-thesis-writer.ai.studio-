import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Building2, 
  ShieldCheck, 
  Award, 
  Check, 
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  candidateName: string;
  guideName: string;
  coGuideName?: string;
  specialty: string;
  university: string;
  collegeName: string;
  academicYear: string;
}

interface Props {
  project: Project;
  onClose: () => void;
  onAttachToFrontMatter?: (checklistText: string) => void;
  showToast: (msg: string) => void;
}

interface ChecklistItem {
  id: string;
  category: 'Ethics & Regulatory' | 'Signatures & Certifications' | 'Academic Integrity' | 'Curricular Milestones' | 'Physical Submission Standards';
  title: string;
  description: string;
  requiredFor: string;
  checked: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: 'iec',
    category: 'Ethics & Regulatory',
    title: 'Institutional Ethics Committee (IEC) Clearance Letter',
    description: 'Protocol approval letter with official IEC reference number, meeting date, and committee stamp before starting patient recruitment.',
    requiredFor: 'Mandatory for all clinical/biomedical studies (NMC Clause 13.9)',
    checked: true
  },
  {
    id: 'consent',
    category: 'Ethics & Regulatory',
    title: 'Bilingual Informed Consent & Patient Information Sheet',
    description: 'Signed consent forms in local state vernacular language (Hindi/Marathi/Bengali/Malayalam/Tamil etc.) + English.',
    requiredFor: 'Mandatory under ICMR Bioethics Guidelines 2017',
    checked: true
  },
  {
    id: 'ctri',
    category: 'Ethics & Regulatory',
    title: 'Clinical Trials Registry - India (CTRI) Registration',
    description: 'Prospective trial registration acknowledgement number from ctri.nic.in.',
    requiredFor: 'Required for interventional trials / drug comparisons',
    checked: false
  },
  {
    id: 'guide_cert',
    category: 'Signatures & Certifications',
    title: 'Guide & Co-Guide Bonafide Endorsement Certificate',
    description: 'Original signature of Professor/Guide and Co-Guide confirming active direct supervision.',
    requiredFor: 'University Exam Board Requirement',
    checked: true
  },
  {
    id: 'hod_cert',
    category: 'Signatures & Certifications',
    title: 'Head of Department (HOD) Forwarding Certificate',
    description: 'Endorsement from HOD verifying that adequate clinical facilities and patient material were provided.',
    requiredFor: 'Departmental Clearance',
    checked: true
  },
  {
    id: 'dean_clearance',
    category: 'Signatures & Certifications',
    title: 'Dean / Principal / Director Submission Forwarding Letter',
    description: 'Official institutional forwarding docket signed by Head of the Medical College.',
    requiredFor: 'Final University Dispatch',
    checked: true
  },
  {
    id: 'plag_report',
    category: 'Academic Integrity',
    title: 'Plagiarism Verification Report (Similarity Index ≤ 10%)',
    description: 'Official certificate from Central Library verifying similarity is within statutory limits (excluding references & standard clinical protocols).',
    requiredFor: 'NMC / UGC Academic Integrity Regulations',
    checked: true
  },
  {
    id: 'data_audit',
    category: 'Academic Integrity',
    title: 'Original Patient Case Record Sheets & Statistical Audit',
    description: 'Primary clinical master chart and statistical output sheets archived for verification by external examiners.',
    requiredFor: 'Viva Voce & Practical Exam Inspection',
    checked: true
  },
  {
    id: 'logbook',
    category: 'Curricular Milestones',
    title: '3-Year Certified Postgraduate Logbook',
    description: 'Complete record of procedures performed/assisted, clinical cases, seminars, and journal clubs, signed by Unit Chief.',
    requiredFor: 'NMC Eligibility to appear in PG Degree Examination',
    checked: true
  },
  {
    id: 'paper_present',
    category: 'Curricular Milestones',
    title: 'State/National Medical Conference Paper/Poster Presentation',
    description: 'Certificate of oral/poster presentation based on dissertation research at recognized medical conference.',
    requiredFor: 'NMC Post-Graduate Medical Education Regulations (PGMER)',
    checked: true
  },
  {
    id: 'journal_pub',
    category: 'Curricular Milestones',
    title: 'Scientific Journal Manuscript Submission / Publication',
    description: 'Proof of manuscript submission, acceptance, or publication in an indexed peer-reviewed medical journal.',
    requiredFor: 'Recommended by NMC Academic Board',
    checked: false
  },
  {
    id: 'hardbound_spec',
    category: 'Physical Submission Standards',
    title: 'Hardbound Thesis Copies with Color-Coded University Spine',
    description: 'Standard A4 Executive Bond paper (85-100 GSM), 1.5 line spacing, 2.0-inch left margin for binding; minimum 4 physical copies.',
    requiredFor: 'Registrar (Evaluation) Dispatch',
    checked: true
  },
  {
    id: 'soft_copy',
    category: 'Physical Submission Standards',
    title: 'Digital PDF Submission (CD / Pen Drive / University Portal)',
    description: 'Clean, bookmarked single PDF file matching printed hard copy verbatim with all signatures scanned.',
    requiredFor: 'Institutional Repository & Shodhganga / University Server',
    checked: true
  }
];

export const InstitutionalComplianceModal: React.FC<Props> = ({
  project,
  onClose,
  onAttachToFrontMatter,
  showToast
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(`inst_compliance_${project.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_ITEMS;
  });

  const [iecNumber, setIecNumber] = useState<string>('IEC/2024/MD-MS/102');
  const [iecDate, setIecDate] = useState<string>('15-Nov-2024');
  const [ctriNumber, setCtriNumber] = useState<string>('CTRI/2024/11/072481');
  const [plagScore, setPlagScore] = useState<number>(6.5);

  const toggleItem = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(updated);
    localStorage.setItem(`inst_compliance_${project.id}`, JSON.stringify(updated));
  };

  const completedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  // Generate formal institutional checklist text document
  const generateChecklistContent = (): string => {
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let content = `================================================================================
INSTITUTIONAL COMPLIANCE DOCKET & SCRUTINY CHECKLIST
POSTGRADUATE MEDICAL DISSERTATION SUBMISSION
According to National Medical Commission (NMC) & University Guidelines
================================================================================

Date of Scrutiny: ${dateStr}
Medical College / Hospital: ${project.collegeName || 'Government Medical College & Hospital'}
Affiliated Health University: ${project.university || 'State University of Health Sciences'}
Postgraduate Degree / Specialty: ${project.specialty}
Academic Batch / Session: ${project.academicYear || '2024 - 2026'}

CANDIDATE & SUPERVISION PARTICULARS:
- Name of Candidate: Dr. ${project.candidateName || '[Candidate Name]'}
- Chief Guide: ${project.guideName || '[Guide Name]'}, Professor & Head
- Co-Guide: ${project.coGuideName || 'None assigned'}
- Title of Dissertation: "${project.title}"

ETHICAL & STATUTORY REGISTRATIONS:
- Institutional Ethics Committee (IEC) Letter No: ${iecNumber}
- IEC Clearance Date: ${iecDate}
- CTRI Registration Number: ${ctriNumber}
- Official Plagiarism Similarity Index: ${plagScore}% (Statutory limit: <= 10%)

--------------------------------------------------------------------------------
COMPREHENSIVE COMPLIANCE VERIFICATION MATRIX (${completedCount}/${totalCount} Verified - ${percent}%)
--------------------------------------------------------------------------------
`;

    const categories = Array.from(new Set(items.map(i => i.category)));
    categories.forEach(cat => {
      content += `\n[ ${cat.toUpperCase()} ]\n`;
      const catItems = items.filter(i => i.category === cat);
      catItems.forEach((item, idx) => {
        const mark = item.checked ? '[X] COMPLIED' : '[ ] PENDING ';
        content += `${idx + 1}. ${mark} - ${item.title}\n`;
        content += `   Details: ${item.description}\n`;
        content += `   Authority: ${item.requiredFor}\n\n`;
      });
    });

    content += `--------------------------------------------------------------------------------
INSTITUTIONAL SCRUTINY & FORWARDING SIGNATURES
--------------------------------------------------------------------------------

1. Candidate Signature:
   Dr. ${project.candidateName}
   Postgraduate Resident, Department of ${project.specialty.replace(/^MD\s+|^MS\s+/i, '')}
   Date: ________________________

2. Guide & Supervisor Verification:
   I have scrutinized the dissertation and verify that all statutory clinical,
   ethical, and formatting criteria stipulated by ${project.university} have been satisfied.
   Signature: ___________________
   ${project.guideName}
   Professor & Guide, Department of ${project.specialty.replace(/^MD\s+|^MS\s+/i, '')}

3. Head of the Department:
   Forwarded to the Dean / Principal for onward dispatch to the University.
   Signature with Departmental Seal: ___________________
   Date: ________________________

4. Institutional Academic Council / Dean's Office:
   Dissertation Scrutiny Status: [ APPROVED / DEFICIENT ]
   Dean / Principal Seal & Signature: ___________________
   College Dispatch Reference No: _______________________
================================================================================
`;
    return content;
  };

  // Download checklist text file
  const handleDownloadChecklist = () => {
    const text = generateChecklistContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = (project.title || 'Thesis').substring(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${project.candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_Institutional_Compliance_Checklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Institutional Compliance Checklist downloaded successfully!');
  };

  // Append checklist to project Front Matter
  const handleAttach = () => {
    const text = generateChecklistContent();
    if (onAttachToFrontMatter) {
      onAttachToFrontMatter(text);
      showToast('Institutional Compliance Docket attached to Dissertation Front Matter!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-tight">
                  Indian Medical College Institutional Compliance Scrutiny
                </h3>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  NMC & University Statutory Docket
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official postgraduate dissertation submission verification tailored for Indian medical colleges.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadChecklist}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Checklist (.txt)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          
          {/* Institutional Header Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  {project.university || 'State Health University'}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {project.collegeName || 'Government Medical College & Hospital'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Department of {project.specialty} • Session {project.academicYear || '2024-2026'}
                </p>
              </div>

              {/* Compliance Progress Pill */}
              <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Submission Readiness</div>
                  <div className="text-base font-bold text-indigo-700 font-mono">
                    {completedCount} / {totalCount} ({percent}%)
                  </div>
                </div>
                <div className="w-16 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${percent === 100 ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Candidate & Study Details Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Candidate</span>
                <span className="font-bold text-slate-800">Dr. {project.candidateName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Chief Guide</span>
                <span className="font-bold text-slate-800">{project.guideName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Co-Guide</span>
                <span className="font-bold text-slate-800">{project.coGuideName || 'None assigned'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Thesis Topic</span>
                <span className="font-semibold text-slate-800 line-clamp-1" title={project.title}>"{project.title}"</span>
              </div>
            </div>

            {/* Editable Clearance Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">IEC Clearance No:</label>
                <input
                  type="text"
                  value={iecNumber}
                  onChange={(e) => setIecNumber(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">IEC Approval Date:</label>
                <input
                  type="text"
                  value={iecDate}
                  onChange={(e) => setIecDate(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">CTRI Number (Optional):</label>
                <input
                  type="text"
                  value={ctriNumber}
                  onChange={(e) => setCtriNumber(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Plagiarism Index (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={plagScore}
                  onChange={(e) => setPlagScore(parseFloat(e.target.value) || 0)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Interactive Checklist Categories */}
          <div className="space-y-4">
            {Array.from(new Set(items.map(i => i.category))).map(cat => {
              const catItems = items.filter(i => i.category === cat);
              const catCompleted = catItems.filter(i => i.checked).length;

              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {cat}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold font-mono">
                      {catCompleted} / {catItems.length} Verified
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {catItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${item.checked ? 'bg-white hover:bg-slate-50/50' : 'bg-amber-50/30 hover:bg-amber-50/60'}`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${item.checked ? 'text-slate-900' : 'text-amber-950'}`}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {item.requiredFor}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Meets National Medical Commission (NMC) PGMER regulations & Indian Health University statutes.</span>
          </div>

          <div className="flex items-center space-x-2">
            {onAttachToFrontMatter && (
              <button
                onClick={handleAttach}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Append formatted compliance docket to front matter"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Attach to Front Matter</span>
              </button>
            )}

            <button
              onClick={handleDownloadChecklist}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Checklist (.txt)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
