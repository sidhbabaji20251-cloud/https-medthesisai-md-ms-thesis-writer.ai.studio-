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
  const [activeModalTab, setActiveModalTab] = useState<'checklist' | 'certificates' | 'binding_spec'>('checklist');

  // Tab 2: Statutory Front-Matter Certificates & Abbreviations State
  const [hodName, setHodName] = useState<string>(`Prof. Dr. ${project.guideName || 'R. K. Verma'}`);
  const [deanName, setDeanName] = useState<string>('Prof. Dr. S. N. Deshmukh, Dean & Principal');
  const [biostatName, setBiostatName] = useState<string>('Dr. A. K. Kulkarni, Assistant Professor of Biostatistics');
  const [placeCity, setPlaceCity] = useState<string>('New Delhi / Mumbai / Bengaluru');
  const [customAbbrevs, setCustomAbbrevs] = useState<string>(
    'AUC-ROC | Area Under the Receiver Operating Characteristic Curve\nCI | Confidence Interval\nCTRI | Clinical Trials Registry - India\nICMR | Indian Council of Medical Research\nIEC | Institutional Ethics Committee\nIQR | Interquartile Range\nNMC | National Medical Commission\nNPV | Negative Predictive Value\nOR / aOR | Odds Ratio / Adjusted Odds Ratio\nPPV | Positive Predictive Value\nSD | Standard Deviation'
  );

  // Tab 3: Hardbound Spine & Binding Specification State
  const [rexineColor, setRexineColor] = useState<'maroon' | 'ruby_crimson' | 'navy' | 'emerald' | 'oxford_sapphire' | 'black'>('maroon');
  const [paperGsm, setPaperGsm] = useState<string>('100 GSM Executive Bond (Acid-Free Archival)');
  const [leftMarginInch, setLeftMarginInch] = useState<string>('1.5 inches (3.8 cm) for Hardbinding Gutter');
  const [copyCount, setCopyCount] = useState<number>(5);

  const generateStatutoryCertificatesText = (): string => {
    const cleanDept = project.specialty.replace(/^MD\s+|^MS\s+|^DNB\s+/i, '');
    const abbrevLines = customAbbrevs
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const [abbr, ...rest] = line.split('|');
        return `| **${(abbr || '').trim()}** | ${(rest.join('|') || '').trim()} |`;
      })
      .join('\n');

    return `================================================================================
STATUTORY FRONT-MATTER CERTIFICATES, DECLARATIONS & ABBREVIATIONS
${(project.collegeName || 'Government Medical College & Hospital').toUpperCase()}
Affiliated to ${project.university || 'State University of Health Sciences'}
================================================================================

CERTIFICATE I: DECLARATION BY THE POSTGRADUATE CANDIDATE
--------------------------------------------------------------------------------
I hereby solemnly declare that this dissertation entitled:
"${project.title}"
is a bonafide and genuine record of original clinical and laboratory research work carried out by me under the direct supervision and guidance of ${project.guideName}, Professor, Department of ${cleanDept}, ${project.collegeName}.

I further declare that this dissertation or any part thereof has not been submitted previously by me or any other candidate to this or any other University or National Board for the award of any degree, diploma, or fellowship.

Date: ___________________                      Signature of Candidate: ___________________
Place: ${placeCity}                            Dr. ${project.candidateName}
                                               Postgraduate Resident (${project.specialty})


CERTIFICATE II: CERTIFICATE BY THE CHIEF GUIDE & CO-GUIDE
--------------------------------------------------------------------------------
This is to certify that the dissertation entitled:
"${project.title}"
is a bonafide research work done by Dr. ${project.candidateName} in partial fulfillment of the regulations of ${project.university} for the award of the degree of ${project.specialty}. This work was carried out under my direct supervision and personal guidance in the Department of ${cleanDept} during the academic session ${project.academicYear || '2024–2026'}.

Signature of Chief Guide: ___________________   Signature of Co-Guide: ___________________
${project.guideName}                            ${project.coGuideName || 'N/A'}
Professor & Chief Guide                         Department of ${cleanDept}
Department of ${cleanDept}


CERTIFICATE III: ENDORSEMENT BY THE HEAD OF DEPARTMENT & DEAN / PRINCIPAL
--------------------------------------------------------------------------------
This is to certify that the dissertation entitled "${project.title}" is a bonafide record of research work carried out by Dr. ${project.candidateName} under the guidance of ${project.guideName}. All institutional laboratory, inpatient/outpatient, and library facilities were extended for this work, and it complies with National Medical Commission (NMC) Postgraduate Medical Education Regulations.

Signature & Seal of HOD: ____________________   Signature & Seal of Dean: ____________________
${hodName}                                      ${deanName}
Professor & Head, Dept. of ${cleanDept}         ${project.collegeName}


CERTIFICATE IV: COPYRIGHT & SHODHGANGA REPOSITORY UNDERTAKING
--------------------------------------------------------------------------------
I, Dr. ${project.candidateName}, hereby grant non-exclusive royalty-free permission to ${project.collegeName} and ${project.university} to archive, reproduce, and make available this dissertation in the University Digital Repository / INFLIBNET Shodhganga for academic and non-commercial research purposes after degree conferral.


ACKNOWLEDGEMENTS
--------------------------------------------------------------------------------
I express my profound gratitude and sincere reverence to my esteemed Chief Guide, ${project.guideName}, Department of ${cleanDept}, for their constant mentorship, bed-side clinical insights, and meticulous scrutiny throughout this study.${project.coGuideName ? ` I am deeply grateful to my Co-Guide, ${project.coGuideName}, for their invaluable technical guidance.` : ''}

I extend my respectful thanks to ${hodName}, Professor and Head of the Department of ${cleanDept}, and ${deanName}, ${project.collegeName}, for providing the institutional facilities and ethical clearance (${iecNumber}) necessary to conduct this research. I also thank ${biostatName} for guidance in statistical validation. Above all, I bow in gratitude to all the patients and their families who consented to participate in this study.


LIST OF STANDARD ABBREVIATIONS
--------------------------------------------------------------------------------
| Abbreviation | Full Medical / Statistical Expansion |
|---|---|
${abbrevLines}
================================================================================`;
  };

  const handleDownloadCertificatesWord = () => {
    const cleanDept = project.specialty.replace(/^MD\s+|^MS\s+|^DNB\s+/i, '');
    const abbrevRowsHtml = customAbbrevs
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const [abbr, ...rest] = line.split('|');
        return `<tr><td style="width:25%;font-weight:bold;">${(abbr || '').trim()}</td><td>${(rest.join('|') || '').trim()}</td></tr>`;
      })
      .join('');

    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Statutory Front Matter Certificates - Dr. ${project.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.5cm 2.5cm 2.5cm 3.8cm; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #0f172a; }
  h1 { font-size: 15pt; text-align: center; text-transform: uppercase; margin-bottom: 4pt; }
  h2 { font-size: 13pt; text-align: center; text-transform: uppercase; text-decoration: underline; margin-top: 18pt; margin-bottom: 12pt; }
  .page-break { page-break-before: always; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 6pt 8pt; font-size: 11pt; vertical-align: top; }
  th { background: #e0f2fe; font-weight: bold; text-align: left; }
</style></head>
<body>
  <h1>${project.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${project.university}<br/>Department of ${cleanDept}</p>

  <h2>DECLARATION BY THE CANDIDATE</h2>
  <p style="text-align:justify;">I hereby solemnly declare that this dissertation entitled <strong>"${project.title}"</strong> is a bonafide and genuine record of original research work carried out by me under the direct supervision and guidance of <strong>${project.guideName}</strong>, Department of ${cleanDept}, ${project.collegeName}, in partial fulfillment of the regulations of ${project.university} for the award of the degree of <strong>${project.specialty}</strong>.</p>
  <p style="text-align:justify;">This work or any part thereof has not been submitted previously for the award of any other degree or diploma.</p>
  <br/><br/>
  <p><strong>Date:</strong> ___________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Signature of Candidate:</strong> ___________________<br/>
  <strong>Place:</strong> ${placeCity} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Dr. ${project.candidateName}</strong> (${project.specialty})</p>

  <div class="page-break"></div>
  <h1>${project.collegeName}</h1>
  <h2>CERTIFICATE BY THE GUIDE &amp; ENDORSEMENT BY HOD &amp; DEAN</h2>
  <p style="text-align:justify;">This is to certify that the dissertation entitled <strong>"${project.title}"</strong> is a bonafide record of clinical and laboratory research work carried out by <strong>Dr. ${project.candidateName}</strong> under our direct supervision and guidance during the academic session <strong>${project.academicYear || '2024–2026'}</strong>, in partial fulfillment of the regulations for the degree of <strong>${project.specialty}</strong>.</p>
  <br/><br/>
  <table style="border:none;">
    <tr>
      <td style="border:none;width:50%;"><strong>Signature of Chief Guide</strong><br/><br/>___________________________<br/><strong>${project.guideName}</strong><br/>Department of ${cleanDept}</td>
      <td style="border:none;width:50%;"><strong>Signature of Co-Guide</strong><br/><br/>___________________________<br/><strong>${project.coGuideName || 'N/A'}</strong><br/>Department of ${cleanDept}</td>
    </tr>
    <tr>
      <td style="border:none;width:50%;padding-top:28pt;"><strong>Forwarded by Head of Department</strong><br/><br/>___________________________<br/><strong>${hodName}</strong><br/>Professor &amp; Head, Dept. of ${cleanDept}</td>
      <td style="border:none;width:50%;padding-top:28pt;"><strong>Approved &amp; Forwarded by Dean / Principal</strong><br/><br/>___________________________<br/><strong>${deanName}</strong><br/>${project.collegeName}</td>
    </tr>
  </table>

  <div class="page-break"></div>
  <h2>ACKNOWLEDGEMENTS</h2>
  <p style="text-align:justify;">I express my deepest gratitude to my revered Chief Guide, <strong>${project.guideName}</strong>, for their unfailing encouragement, clinical wisdom, and meticulous supervision at every stage of this dissertation.${project.coGuideName ? ` I also thank my Co-Guide, <strong>${project.coGuideName}</strong>, for their constant guidance.` : ''}</p>
  <p style="text-align:justify;">I am grateful to <strong>${hodName}</strong>, Head of the Department of ${cleanDept}, and <strong>${deanName}</strong>, ${project.collegeName}, for permitting me to utilize the clinical and laboratory facilities and granting Institutional Ethics Committee approval (<strong>${iecNumber}</strong>). I thank <strong>${biostatName}</strong> for statistical consultation, and above all, I express my heartfelt gratitude to all the patients who participated in this study.</p>

  <h2>LIST OF ABBREVIATIONS</h2>
  <table>
    <thead><tr><th>Abbreviation</th><th>Full Medical / Statistical Term</th></tr></thead>
    <tbody>${abbrevRowsHtml}</tbody>
  </table>
</body></html>`;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_Statutory_Certificates_FrontMatter.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 Downloaded Printable Word (.DOC) Statutory Certificates, Acknowledgements & Abbreviations Booklet!');
  };

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

  // Download printable Microsoft Word (.DOC) Official Scrutiny Docket & Forwarding Letter
  const handleDownloadWordDocket = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const rowsHtml = items
      .map(
        (item, idx) => `
      <tr>
        <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
        <td><strong>${item.title}</strong><br/><span style="font-size:9.5pt;color:#475569;">${item.description}</span></td>
        <td>${item.requiredFor}</td>
        <td style="text-align:center;font-weight:bold;color:${item.checked ? '#047857' : '#b45309'};">
          ${item.checked ? '✓ VERIFIED' : 'PENDING'}
        </td>
      </tr>`
      )
      .join('');

    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Institutional Scrutiny Docket - Dr. ${project.candidateName}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.2cm; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #0f172a; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; }
  h2 { font-size: 12pt; text-align: center; text-transform: uppercase; border-bottom: 1.5pt solid #0f172a; padding-bottom: 4pt; margin-top: 10pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th, td { border: 1pt solid #475569; padding: 5pt 6pt; font-size: 10pt; vertical-align: top; }
  th { background: #e0f2fe; color: #0f172a; font-weight: bold; text-align: left; }
</style></head>
<body>
  <h1>${project.collegeName || 'Government Medical College & Hospital'}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${project.university} • Department of ${project.specialty}</p>
  <h2>INSTITUTIONAL COMPLIANCE DOCKET &amp; UNIVERSITY FORWARDING SCRUTINY SHEET</h2>
  <p><strong>Date of Scrutiny:</strong> ${dateStr} &nbsp;|&nbsp; <strong>Academic Session:</strong> ${project.academicYear || '2024–2026'} &nbsp;|&nbsp; <strong>Readiness Score:</strong> ${completedCount}/${totalCount} (${percent}%)</p>
  <table>
    <tr>
      <th style="width:25%;">Candidate Name</th><td>Dr. ${project.candidateName} (${project.specialty})</td>
      <th style="width:25%;">Chief Guide</th><td>${project.guideName}${project.coGuideName ? ` (Co-Guide: ${project.coGuideName})` : ''}</td>
    </tr>
    <tr>
      <th>Dissertation Title</th><td colspan="3"><em>"${project.title}"</em></td>
    </tr>
    <tr>
      <th>IEC Clearance No.</th><td>${iecNumber} (${iecDate})</td>
      <th>CTRI / Plagiarism Index</th><td>${ctriNumber} | Similarity: <strong>${plagScore}% (&le;10% Compliant)</strong></td>
    </tr>
  </table>

  <table>
    <thead>
      <tr>
        <th style="width:6%;text-align:center;">S.No</th>
        <th style="width:48%;">Statutory NMC / University Compliance Requirement</th>
        <th style="width:30%;">Regulatory Authority</th>
        <th style="width:16%;text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <p style="margin-top:16pt;"><strong>Institutional Forwarding Undertaking:</strong> Certified that the above postgraduate dissertation has been scrutinized and complies with all ethical, biostatistical, anti-plagiarism, and physical binding norms prescribed by the National Medical Commission (NMC) and ${project.university}.</p>
  <br/>
  <table style="border:none;">
    <tr>
      <td style="border:none;width:33%;"><strong>Signature of Candidate</strong><br/>Dr. ${project.candidateName}</td>
      <td style="border:none;width:33%;"><strong>Signature of Chief Guide</strong><br/>${project.guideName}</td>
      <td style="border:none;width:34%;"><strong>Countersigned: HOD &amp; Dean/Principal</strong><br/>${project.collegeName}</td>
    </tr>
  </table>
</body></html>`;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_Institutional_Scrutiny_Docket.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📄 Downloaded Official Word (.DOC) Institutional Scrutiny Docket & Forwarding Sheet!');
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
    <div className="fixed inset-0 z-50 bg-sky-950/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-sky-50 via-white to-amber-50 rounded-xl shadow-2xl border-2 border-sky-300 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header — Light Sky Blue & Warm Yellow */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-200 via-sky-100 to-amber-100 text-slate-900 flex items-center justify-between border-b-2 border-amber-300 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-300/80 text-amber-950 border border-amber-400 rounded-lg">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-tight text-sky-950">
                  Indian Medical College Institutional Compliance Scrutiny
                </h3>
                <span className="text-[10px] bg-amber-200 text-amber-950 border border-amber-400 px-2 py-0.5 rounded-full font-bold">
                  NMC & University Statutory Docket
                </span>
              </div>
              <p className="text-[11px] text-sky-900 font-medium">
                Official postgraduate dissertation submission verification tailored for Indian medical colleges.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadWordDocket}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Word Docket (.DOC)</span>
            </button>
            <button
              onClick={handleDownloadChecklist}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Checklist (.txt)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white hover:bg-sky-50 text-sky-950 rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-sky-300 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-700 hover:text-slate-950 p-1 rounded-md text-sm font-bold cursor-pointer"
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

          {/* Tab Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-xl border border-sky-200 shadow-2xs">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveModalTab('checklist')}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  activeModalTab === 'checklist'
                    ? 'bg-sky-800 text-white shadow-2xs'
                    : 'text-sky-950 hover:bg-sky-50'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>1. NMC Scrutiny Checklist ({completedCount}/{totalCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('certificates')}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  activeModalTab === 'certificates'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-950 hover:bg-emerald-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>2. Statutory Certificates, Acknowledgements &amp; Abbreviations</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('binding_spec')}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition-all ${
                  activeModalTab === 'binding_spec'
                    ? 'bg-amber-400 text-slate-950 border border-amber-500 shadow-2xs'
                    : 'text-amber-950 hover:bg-amber-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. Hardbound Spine, Color-Code &amp; 5-Copy Spec</span>
              </button>
            </div>
          </div>

          {/* Interactive Checklist Categories (TAB 1) */}
          {activeModalTab === 'checklist' && (
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
          )}

          {/* TAB 2: STATUTORY FRONT-MATTER CERTIFICATES, ACKNOWLEDGEMENTS & ABBREVIATIONS */}
          {activeModalTab === 'certificates' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-emerald-300 shadow-xs space-y-3.5 text-xs">
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono uppercase font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Mandatory University Front Matter
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Statutory Declarations, Guide/HOD/Dean Certificates &amp; Abbreviations
                  </h4>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD) Name &amp; Designation:</label>
                  <input
                    type="text"
                    value={hodName}
                    onChange={e => setHodName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dean / Principal / Director Name:</label>
                  <input
                    type="text"
                    value={deanName}
                    onChange={e => setDeanName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Biostatistician Consulted:</label>
                    <input
                      type="text"
                      value={biostatName}
                      onChange={e => setBiostatName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Place of Submission:</label>
                    <input
                      type="text"
                      value={placeCity}
                      onChange={e => setPlaceCity(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Standard Abbreviations List (<code className="text-[10px]">ABBR | Full Expansion</code> per line):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const s = project.specialty.toLowerCase();
                        const base = 'AUC-ROC | Area Under the Receiver Operating Characteristic Curve\nCI | Confidence Interval\nCTRI | Clinical Trials Registry - India\nICMR | Indian Council of Medical Research\nIEC | Institutional Ethics Committee\nIQR | Interquartile Range\nNMC | National Medical Commission\nOR / aOR | Odds Ratio / Adjusted Odds Ratio\nSD | Standard Deviation';
                        let extra = '';
                        if (s.includes('emergency') || s.includes('critical care') || s.includes('trauma') || s.includes('disaster')) {
                          extra = '\nABG | Arterial Blood Gas\nATLS | Advanced Trauma Life Support\nE-FAST | Extended Focused Assessment with Sonography for Trauma\nESI | Emergency Severity Index\nGCS | Glasgow Coma Scale\nMAP | Mean Arterial Pressure\nNEWS2 | National Early Warning Score 2\nqSOFA | Quick Sequential Organ Failure Assessment\nROSC | Return of Spontaneous Circulation\nRUSH | Rapid Ultrasound in Shock and Hypotension';
                        } else if (s.includes('anesthes') || s.includes('anaesthes') || s.includes('pain')) {
                          extra = '\nASA | American Society of Anesthesiologists Physical Status\nEtCO2 | End-Tidal Carbon Dioxide\nMAC | Minimum Alveolar Concentration / Monitored Anesthesia Care\nMAP | Mean Arterial Pressure\nPACU | Post-Anesthesia Care Unit\nPONV | Postoperative Nausea and Vomiting\nTOF | Train-of-Four Neuromuscular Monitoring\nVAS | Visual Analog Scale for Pain';
                        } else if (s.includes('pathol') || s.includes('microbiol') || s.includes('pharmacol') || s.includes('biochem') || s.includes('transfusion') || s.includes('lab')) {
                          extra = '\nADR | Adverse Drug Reaction\nAST | Antimicrobial Susceptibility Testing\nCLSI | Clinical and Laboratory Standards Institute\nELISA | Enzyme-Linked Immunosorbent Assay\nFFPE | Formalin-Fixed Paraffin-Embedded\nIHC | Immunohistochemistry\nMDR | Multidrug-Resistant\nMIC | Minimum Inhibitory Concentration';
                        } else if (s.includes('obstet') || s.includes('gynaec') || s.includes('obg') || s.includes('pediatric') || s.includes('neonat')) {
                          extra = '\nAPGAR | Appearance, Pulse, Grimace, Activity, Respiration\nCTG | Cardiotocography\nFGR | Fetal Growth Restriction\nLSCS | Lower Segment Cesarean Section\nNICU | Neonatal Intensive Care Unit\nPI | Pulsatility Index\nROBSN | Robson Ten-Group Classification System\nSNAPPE-II | Score for Neonatal Acute Physiology with Perinatal Extension-II';
                        } else {
                          extra = '\nBMI | Body Mass Index\neGFR | Estimated Glomerular Filtration Rate\nHbA1c | Glycated Hemoglobin\nNPV | Negative Predictive Value\nPPV | Positive Predictive Value\nSOFA | Sequential Organ Failure Assessment';
                        }
                        setCustomAbbrevs(base + extra);
                        showToast(`✨ Loaded standard abbreviations for ${project.specialty}!`);
                      }}
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold cursor-pointer"
                    >
                      + Load {project.specialty} Abbrevs
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={customAbbrevs}
                    onChange={e => setCustomAbbrevs(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  {onAttachToFrontMatter && (
                    <button
                      type="button"
                      onClick={() => {
                        onAttachToFrontMatter(generateStatutoryCertificatesText());
                        showToast('✅ Attached Statutory Candidate/Guide/HOD/Dean Certificates & Abbreviations to Front Matter!');
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>1-Click Attach All Certificates to Front Matter</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadCertificatesWord}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Ready-to-Sign Word (.DOC) Certificates Booklet</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Live Statutory Front-Matter Certificates &amp; Abbreviations Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generateStatutoryCertificatesText());
                      showToast('Copied Statutory Certificates & Abbreviations to clipboard!');
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 max-h-[410px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {generateStatutoryCertificatesText()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HARDBOUND SPINE, COLOR-CODE & 5-COPY DISTRIBUTION SPEC */}
          {activeModalTab === 'binding_spec' && (() => {
            const colorMap = {
              maroon: {
                label: 'Imperial Maroon / Burgundy Rexine with Gold Foil Embossing (MD Medicine & Clinical Specialties)',
                bg: 'bg-[#5c101d] text-amber-300 border-amber-400',
                spineBg: 'bg-[#4a0b16] text-amber-300 border-amber-400'
              },
              ruby_crimson: {
                label: 'Tactical Ruby-Crimson Rexine with Gold Foil Embossing (MD Emergency Medicine, Anesthesiology & Critical Care)',
                bg: 'bg-[#701222] text-amber-200 border-amber-300',
                spineBg: 'bg-[#540c18] text-amber-200 border-amber-300'
              },
              navy: {
                label: 'Royal Navy Blue Rexine with Gold Foil Embossing (MS General Surgery, Ortho, ENT, Ophthal, Radiology)',
                bg: 'bg-[#0f2547] text-amber-300 border-amber-400',
                spineBg: 'bg-[#091933] text-amber-300 border-amber-400'
              },
              emerald: {
                label: 'Forest Green Rexine with Gold Foil Embossing (MD/MS OBG, Pediatrics, Community Medicine)',
                bg: 'bg-[#0c3b2e] text-amber-300 border-amber-400',
                spineBg: 'bg-[#07261d] text-amber-300 border-amber-400'
              },
              oxford_sapphire: {
                label: 'Oxford Sapphire-Slate Rexine with Gold Foil Embossing (MD Pathology, Microbiology, Pharmacology, Transfusion & Lab)',
                bg: 'bg-[#1e2952] text-amber-200 border-amber-300',
                spineBg: 'bg-[#141c38] text-amber-200 border-amber-300'
              },
              black: {
                label: 'Jet Black Leatherette with Gold Foil Embossing (Super-Specialty DM / MCh / NBE DNB)',
                bg: 'bg-slate-900 text-amber-300 border-amber-400',
                spineBg: 'bg-slate-950 text-amber-300 border-amber-400'
              }
            };
            const activeRexine = colorMap[rexineColor];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-amber-300 shadow-xs space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-mono uppercase font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                      University Hardbinding &amp; Print Specification
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      Rexine Color-Coding, Gold Foil Spine &amp; Copy Distribution
                    </h4>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Specialty Hardbound Rexine Color:</label>
                    <select
                      value={rexineColor}
                      onChange={e => setRexineColor(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                    >
                      <option value="maroon">Imperial Maroon / Burgundy (MD Medicine &amp; Clinical Branches)</option>
                      <option value="ruby_crimson">Tactical Ruby-Crimson (MD Emergency Medicine, Anesthesiology &amp; Critical Care)</option>
                      <option value="navy">Royal Navy Blue (MS Surgery, Ortho, Ophthal, ENT &amp; Radiology)</option>
                      <option value="emerald">Forest Green (MD/MS OBG, Pediatrics, Community Medicine)</option>
                      <option value="oxford_sapphire">Oxford Sapphire (MD Pathology, Microbiology, Pharmacology, Transfusion &amp; Lab)</option>
                      <option value="black">Executive Black (DM / MCh / DNB Broad &amp; Super-Specialty)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Archival Bond Paper Grade:</label>
                    <input
                      type="text"
                      value={paperGsm}
                      onChange={e => setPaperGsm(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Left Binding Gutter:</label>
                      <input
                        type="text"
                        value={leftMarginInch}
                        onChange={e => setLeftMarginInch(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Hardbound Copies:</label>
                      <input
                        type="number"
                        min={4}
                        max={8}
                        value={copyCount}
                        onChange={e => setCopyCount(Number(e.target.value) || 5)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-sky-950 block">
                      Mandatory {copyCount}-Copy Distribution Allocation
                    </span>
                    <ul className="text-[11px] text-slate-700 space-y-1">
                      <li>• <strong>Copy 1 (Original Signed):</strong> University Registrar (Evaluation)</li>
                      <li>• <strong>Copy 2:</strong> College Central Library Archival Section</li>
                      <li>• <strong>Copy 3:</strong> Departmental Seminar Library ({project.specialty})</li>
                      <li>• <strong>Copy 4:</strong> Chief Dissertation Guide ({project.guideName})</li>
                      <li>• <strong>Copy 5:</strong> Candidate's Personal Practical &amp; Viva Voce Examination Copy</li>
                    </ul>
                  </div>
                </div>

                {/* Right: Live Visual Hardbound Cover & Gold-Foil Spine Preview */}
                <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Visual Hardbound Rexine Cover &amp; Gold-Embossed Spine Mockup
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      A4 • 1.5 Line Spacing • 12pt Times New Roman
                    </span>
                  </div>

                  <div className="flex items-stretch justify-center gap-4 py-2">
                    {/* Spine Visual */}
                    <div className={`w-14 rounded-l-md border-2 ${activeRexine.spineBg} flex flex-col items-center justify-between py-4 px-1 shadow-lg`}>
                      <span className="text-[9px] font-serif font-black tracking-widest uppercase text-center leading-tight">
                        {project.specialty.split(' ')[0] || 'MD/MS'}
                      </span>
                      <div className="my-2 text-[9px] font-serif font-bold tracking-wider uppercase text-center [writing-mode:vertical-rl] rotate-180 max-h-48 overflow-hidden">
                        DR. {project.candidateName.toUpperCase()} • {project.title.substring(0, 34).toUpperCase()}...
                      </div>
                      <span className="text-[9px] font-mono font-bold">
                        {(project.academicYear || '2026').slice(-4)}
                      </span>
                    </div>

                    {/* Hardbound Front Cover Visual */}
                    <div className={`flex-1 max-w-md rounded-r-lg border-2 ${activeRexine.bg} p-6 shadow-xl flex flex-col justify-between text-center min-h-[340px]`}>
                      <div className="space-y-1 border-b border-amber-400/40 pb-3">
                        <div className="text-[10px] font-serif font-bold tracking-widest uppercase opacity-90">
                          {project.university}
                        </div>
                        <div className="text-xs font-serif font-black uppercase">
                          {project.collegeName}
                        </div>
                      </div>

                      <div className="my-4 space-y-2">
                        <div className="text-[9px] uppercase tracking-widest opacity-80">
                          Dissertation Submitted in Partial Fulfillment for
                        </div>
                        <div className="text-sm font-serif font-black uppercase tracking-wide underline decoration-amber-400/60">
                          {project.specialty}
                        </div>
                        <div className="p-3 rounded border border-amber-400/50 bg-black/15 text-xs font-serif font-bold leading-snug">
                          "{project.title}"
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] font-serif border-t border-amber-400/40 pt-3">
                        <div>
                          <span className="opacity-80">Submitted by:</span> <strong>Dr. {project.candidateName}</strong>
                        </div>
                        <div>
                          <span className="opacity-80">Under the Guidance of:</span> <strong>{project.guideName}</strong>
                        </div>
                        <div className="text-[10px] font-mono pt-1 opacity-90">
                          ACADEMIC SESSION: {project.academicYear || '2024 – 2026'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong>Print-Shop Specification Note:</strong> {activeRexine.label} • Paper: {paperGsm} • Left Binding Margin: {leftMarginInch} • Top/Bottom/Right Margins: 1.0 inch (2.54 cm).
                  </div>
                </div>
              </div>
            );
          })()}

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
