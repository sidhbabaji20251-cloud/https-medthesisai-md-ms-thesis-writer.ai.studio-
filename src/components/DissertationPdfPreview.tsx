import React, { useState } from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer, 
  BlobProvider 
} from '@react-pdf/renderer';
import { 
  Download, 
  Printer, 
  FileText, 
  CheckCircle, 
  RotateCw, 
  Highlighter, 
  MessageSquare, 
  Trash2, 
  Plus, 
  Tag, 
  ChevronRight, 
  Bookmark, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export interface DissertationAnnotation {
  id: string;
  chapterId?: string;
  chapterName?: string;
  selectedText?: string;
  note: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  createdAt: string;
  author?: string;
}

// Styles for React-PDF document
const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 55,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1e293b'
  },
  coverPage: {
    padding: 60,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
  },
  universityTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 8
  },
  dissertationLabel: {
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20
  },
  thesisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
    marginVertical: 25,
    lineHeight: 1.4
  },
  degreeText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#334155',
    marginBottom: 4
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 30
  },
  authorBlock: {
    marginVertical: 15,
    textAlign: 'center'
  },
  authorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  guideBlock: {
    marginVertical: 20,
    textAlign: 'center'
  },
  guideName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  collegeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20
  },
  yearText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4
  },
  chapterHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#059669',
    paddingBottom: 6,
    marginBottom: 16
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase'
  },
  chapterSubtitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
    fontSize: 10,
    color: '#334155'
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#94a3b8'
  },
  headerText: {
    position: 'absolute',
    top: 25,
    left: 55,
    right: 55,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'right',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4
  },
  citationItem: {
    marginBottom: 8,
    fontSize: 9,
    lineHeight: 1.4,
    color: '#334155'
  }
});

export interface PdfProps {
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
    citations: Array<{ id: string; title: string; authors: string; source: string; pubdate: string; doi?: string; citationKey: string }>;
    annotations?: DissertationAnnotation[];
  };
}

export interface DissertationPdfPreviewModalProps extends PdfProps {
  onClose: () => void;
  onSaveAnnotations?: (annotations: DissertationAnnotation[]) => void;
}

// Clean markdown text for PDF display
function cleanMarkdownForPdf(md: string) {
  return md
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[\d+\]/g, '$&')
    .replace(/\|.*?\|/g, '')
    .replace(/-{3,}/g, '')
    .trim();
}

// React-PDF Document Component
export const ThesisPdfDocument: React.FC<PdfProps> = ({ project }) => (
  <Document
    title={project.title}
    author={`Dr. ${project.candidateName}`}
    subject={`MD/MS Dissertation - ${project.specialty}`}
    keywords="Medical, Dissertation, Thesis, PubMed, NMC, India"
  >
    {/* Page 1: Official Front / Title Page */}
    <Page size="A4" style={pdfStyles.coverPage}>
      <View>
        <Text style={pdfStyles.universityTitle}>{project.university || 'State Health University'}</Text>
        <Text style={pdfStyles.dissertationLabel}>Dissertation Submitted For Postgraduate Degree</Text>
      </View>

      <View>
        <Text style={pdfStyles.degreeText}>A dissertation titled</Text>
        <Text style={pdfStyles.thesisTitle}>"{project.title}"</Text>
        <Text style={pdfStyles.degreeText}>Submitted in partial fulfillment of the requirements for the degree of</Text>
        <Text style={pdfStyles.specialtyText}>{project.specialty}</Text>
      </View>

      <View style={{ marginVertical: 20 }}>
        <View style={pdfStyles.authorBlock}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Submitted By:</Text>
          <Text style={pdfStyles.authorName}>Dr. {project.candidateName || '[Candidate Name]'}</Text>
          <Text style={{ fontSize: 9, color: '#475569' }}>Postgraduate Resident</Text>
        </View>

        <View style={pdfStyles.guideBlock}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Under the Guidance & Supervision of:</Text>
          <Text style={pdfStyles.guideName}>{project.guideName || '[Guide Name]'}</Text>
          <Text style={{ fontSize: 9, color: '#475569' }}>Professor & Head of Department</Text>
          {project.coGuideName && (
            <Text style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>
              Co-Guide: {project.coGuideName}
            </Text>
          )}
        </View>
      </View>

      <View>
        <Text style={pdfStyles.collegeText}>{project.collegeName || '[Medical College Name]'}</Text>
        <Text style={pdfStyles.yearText}>Academic Session: {project.academicYear || '2024 - 2026'}</Text>
      </View>
    </Page>

    {/* Page 2: Candidate Declaration & Guide Certificate */}
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.headerText}>
        {project.specialty} | {project.collegeName}
      </Text>

      <View style={{ marginBottom: 25 }}>
        <View style={pdfStyles.chapterHeader}>
          <Text style={pdfStyles.chapterTitle}>Declaration by the Candidate</Text>
        </View>
        <Text style={pdfStyles.paragraph}>
          I hereby declare that the dissertation entitled "{project.title}" is a bona fide record of research work done by me under the direct guidance and supervision of {project.guideName} at {project.collegeName}.
        </Text>
        <Text style={pdfStyles.paragraph}>
          This work has not been submitted previously to this or any other university for the award of any medical degree, diploma, or fellowship.
        </Text>
        <View style={{ marginTop: 25, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Date: ________________</Text>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Place: {project.collegeName.split(',')[1] || 'India'}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Dr. {project.candidateName}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Candidate Signature</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View style={pdfStyles.chapterHeader}>
          <Text style={pdfStyles.chapterTitle}>Certificate of the Guide</Text>
        </View>
        <Text style={pdfStyles.paragraph}>
          This is to certify that this dissertation titled "{project.title}" is a bonafide work carried out by Dr. {project.candidateName}, a postgraduate student in {project.specialty}, under my direct supervision and guidance, in satisfaction of the dissertation regulations of {project.university}.
        </Text>
        <View style={{ marginTop: 35, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Head of Department</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Seal & Signature</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{project.guideName}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Guide & Professor</Text>
          </View>
        </View>
      </View>

      <Text
        style={pdfStyles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>

    {/* Subsequent Pages: Dissertation Chapters */}
    {project.chapters.map((ch, index) => {
      const cleanContent = cleanMarkdownForPdf(ch.content);
      const paragraphs = cleanContent.split('\n\n').filter(p => p.trim().length > 0);

      return (
        <Page key={ch.id} size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.headerText}>
            MD/MS Dissertation: Chapter {index + 1} | {project.candidateName}
          </Text>

          <View style={pdfStyles.chapterHeader}>
            <Text style={pdfStyles.chapterTitle}>{ch.name}</Text>
            <Text style={pdfStyles.chapterSubtitle}>{ch.description}</Text>
          </View>

          <View>
            {paragraphs.map((p, pIdx) => (
              <Text key={pIdx} style={pdfStyles.paragraph}>
                {p}
              </Text>
            ))}
          </View>

          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      );
    })}

    {/* Bibliography / References Page */}
    {project.citations.length > 0 && (
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.headerText}>
          References & Bibliography | {project.university}
        </Text>

        <View style={pdfStyles.chapterHeader}>
          <Text style={pdfStyles.chapterTitle}>Comprehensive Academic References</Text>
          <Text style={pdfStyles.chapterSubtitle}>Formatted in APA style according to NMC dissertation guidelines</Text>
        </View>

        <View>
          {project.citations.map((c, cIdx) => (
            <Text key={c.id} style={pdfStyles.citationItem}>
              [{cIdx + 1}] {c.authors} ({c.pubdate}). {c.title}. {c.source}. {c.doi ? `DOI: ${c.doi}` : ''}
            </Text>
          ))}
        </View>

        <Text
          style={pdfStyles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    )}
  </Document>
);

// Color dictionary for highlight tags
const COLOR_CONFIG: Record<DissertationAnnotation['color'], { bg: string; border: string; text: string; label: string; badge: string }> = {
  yellow: {
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-900',
    label: 'Guide Feedback',
    badge: 'bg-amber-500'
  },
  green: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    label: 'Verified & Approved',
    badge: 'bg-emerald-500'
  },
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
    label: 'Literature Query',
    badge: 'bg-blue-500'
  },
  pink: {
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    text: 'text-rose-900',
    label: 'Requires Revision',
    badge: 'bg-rose-500'
  },
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-900',
    label: 'Clinical Observation',
    badge: 'bg-purple-500'
  }
};

// Preview Window Container Component with Interactive Highlights & Notes
export const DissertationPdfPreviewModal: React.FC<DissertationPdfPreviewModalProps> = ({ 
  project, 
  onClose,
  onSaveAnnotations 
}) => {
  const [previewMode, setPreviewMode] = useState<'interactive' | 'reader'>('reader');
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);
  
  // Annotation state initialized from project
  const [annotations, setAnnotations] = useState<DissertationAnnotation[]>(project.annotations || []);
  
  // New Note Form state
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [newChapterId, setNewChapterId] = useState<string>(project.chapters[0]?.id || 'intro');
  const [newColor, setNewColor] = useState<DissertationAnnotation['color']>('yellow');
  const [reviewerName, setReviewerName] = useState<string>(`Dr. ${project.candidateName} (Candidate)`);
  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Helper to persist annotations back to parent project state
  const saveAndPropagate = (updated: DissertationAnnotation[]) => {
    setAnnotations(updated);
    if (onSaveAnnotations) {
      onSaveAnnotations(updated);
    }
  };

  // Text selection handler in Paged A4 Reader
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      const text = selection.toString().trim();
      setSelectedText(text);
      setIsAddingNote(true);
      setShowNotesDrawer(true);
    }
  };

  // Create new annotation
  const handleAddAnnotation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNote.trim() && !selectedText.trim()) return;

    const targetChapter = project.chapters.find(c => c.id === newChapterId);
    const newEntry: DissertationAnnotation = {
      id: `ann-${Date.now()}`,
      chapterId: newChapterId,
      chapterName: targetChapter?.name || 'General Dissertation Note',
      selectedText: selectedText.trim() || undefined,
      note: newNote.trim(),
      color: newColor,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      author: reviewerName.trim() || 'Dissertation Reviewer'
    };

    const updated = [newEntry, ...annotations];
    saveAndPropagate(updated);

    // Reset form
    setSelectedText('');
    setNewNote('');
    setIsAddingNote(false);
  };

  // Delete annotation
  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    saveAndPropagate(updated);
  };

  // Copy all feedback as a structured revision checklist
  const handleCopyReviewSummary = async () => {
    if (annotations.length === 0) return;
    const summary = `# DISSERTATION REVISION CHECKLIST & REVIEW NOTES\n\nTitle: ${project.title}\nCandidate: Dr. ${project.candidateName}\nTotal Review Notes: ${annotations.length}\n\n` +
      annotations.map((a, i) => (
        `### Note ${i + 1} [${COLOR_CONFIG[a.color].label}] - ${a.chapterName}\n` +
        `- Author: ${a.author || 'Reviewer'}\n` +
        `- Date: ${a.createdAt}\n` +
        (a.selectedText ? `- Highlighted Passage: "${a.selectedText}"\n` : '') +
        `- Action Note: ${a.note}\n`
      )).join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  // Helper to render text with highlighted sections in the A4 reader
  const renderHighlightedContent = (content: string, chapterId: string) => {
    const clean = cleanMarkdownForPdf(content);
    const chapterAnnotations = annotations.filter(a => a.chapterId === chapterId && a.selectedText);

    if (chapterAnnotations.length === 0) {
      return clean;
    }

    // Split paragraphs
    const paragraphs = clean.split('\n\n');
    return (
      <div className="space-y-3">
        {paragraphs.map((para, pIdx) => {
          let hasHighlight = false;
          let activeAnnotation: DissertationAnnotation | null = null;

          for (const ann of chapterAnnotations) {
            if (ann.selectedText && para.toLowerCase().includes(ann.selectedText.toLowerCase())) {
              hasHighlight = true;
              activeAnnotation = ann;
              break;
            }
          }

          if (hasHighlight && activeAnnotation && activeAnnotation.selectedText) {
            const regex = new RegExp(`(${activeAnnotation.selectedText.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
            const parts = para.split(regex);
            const colorClass = COLOR_CONFIG[activeAnnotation.color].bg;

            return (
              <p key={pIdx} className="leading-relaxed">
                {parts.map((part, partIdx) => {
                  if (part.toLowerCase() === activeAnnotation!.selectedText!.toLowerCase()) {
                    return (
                      <mark 
                        key={partIdx} 
                        className={`${colorClass} px-1 py-0.5 rounded border border-amber-300/60 font-medium cursor-pointer relative group`}
                        title={`Note by ${activeAnnotation!.author}: ${activeAnnotation!.note}`}
                      >
                        {part}
                        <span className="ml-1 text-[9px] font-bold uppercase opacity-75">
                          💬
                        </span>
                      </mark>
                    );
                  }
                  return part;
                })}
              </p>
            );
          }

          return <p key={pIdx} className="leading-relaxed">{para}</p>;
        })}
      </div>
    );
  };

  const filteredAnnotations = filterChapter === 'all' 
    ? annotations 
    : annotations.filter(a => a.chapterId === filterChapter);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-tight">
                  Dissertation PDF Preview & Reviewer Annotations
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Saved to Project State
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Leave highlights & feedback notes for Guide reviews, supervisor checks, and defense preparation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPreviewMode('reader')}
                className={`px-3 py-1 rounded font-medium transition-all ${previewMode === 'reader' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Interactive A4 Layout with text selection and highlight rendering"
              >
                Paged A4 Layout (Annotatable)
              </button>
              <button
                onClick={() => setPreviewMode('interactive')}
                className={`px-3 py-1 rounded font-medium transition-all ${previewMode === 'interactive' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Compiled React-PDF viewer with print & export tools"
              >
                React-PDF Document
              </button>
            </div>

            {/* Toggle Notes Drawer */}
            <button
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                showNotesDrawer 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Notes & Highlights</span>
              <span className="ml-1 bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {annotations.length}
              </span>
            </button>

            {/* Direct Download via BlobProvider */}
            <BlobProvider document={<ThesisPdfDocument project={project} />}>
              {({ url, loading }) => (
                <a
                  href={url || '#'}
                  download={`${project.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Dissertation.pdf`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${loading ? 'bg-slate-700 text-slate-400 pointer-events-none' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </a>
              )}
            </BlobProvider>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body: Split between Preview and Notes Drawer */}
        <div className="flex-1 bg-slate-100 overflow-hidden flex relative">
          
          {/* Main Document Preview Area */}
          <div className="flex-1 h-full overflow-hidden relative">
            {previewMode === 'interactive' ? (
              <div className="w-full h-full">
                <PDFViewer width="100%" height="100%" showToolbar={true} className="border-0">
                  <ThesisPdfDocument project={project} />
                </PDFViewer>
              </div>
            ) : (
              /* Styled Paged A4 Reader View with Text Selection */
              <div 
                onMouseUp={handleTextSelection}
                className="h-full overflow-y-auto p-8 flex flex-col items-center space-y-8 select-text"
              >
                {/* Floating Quick Selection Tooltip Notification */}
                <div className="bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-slate-700 flex items-center space-x-2 shrink-0 sticky top-2 z-10 backdrop-blur-xs">
                  <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tip: Select any paragraph text to quickly highlight and attach a Guide/Review note.</span>
                </div>

                {/* Cover Page */}
                <div className="w-[660px] min-h-[920px] bg-white shadow-xl rounded border border-slate-300 p-16 flex flex-col justify-between text-center font-serif text-slate-800 shrink-0">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      {project.university}
                    </h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                      Dissertation for Post Graduate Degree
                    </p>
                  </div>

                  <div className="py-12 space-y-4">
                    <span className="text-xs text-slate-500 italic block">A dissertation titled</span>
                    <h1 className="text-xl font-bold text-emerald-800 leading-snug px-4">
                      "{project.title}"
                    </h1>
                    <span className="text-xs text-slate-600 block mt-4">
                      Submitted in partial fulfillment of the requirements for the award of the degree of
                    </span>
                    <p className="text-base font-bold text-slate-900 uppercase">
                      {project.specialty}
                    </p>
                  </div>

                  <div className="space-y-6 text-xs font-sans">
                    <div>
                      <span className="text-slate-500 block">Submitted By:</span>
                      <span className="text-sm font-bold text-slate-900 block mt-0.5">Dr. {project.candidateName}</span>
                      <span className="text-slate-500 block text-[11px]">Postgraduate Resident</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Under the Guidance of:</span>
                      <span className="text-sm font-bold text-slate-900 block mt-0.5">{project.guideName}</span>
                      <span className="text-slate-500 block text-[11px]">Professor & Head of Department</span>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                      <p className="font-bold text-slate-900 text-sm">{project.collegeName}</p>
                      <p className="text-slate-500 mt-1">Academic Batch: {project.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* Individual Chapters */}
                {project.chapters.map((ch, idx) => (
                  <div 
                    key={ch.id} 
                    id={`preview-chapter-${ch.id}`}
                    className="w-[660px] min-h-[920px] bg-white shadow-xl rounded border border-slate-300 p-16 flex flex-col justify-between font-serif text-slate-800 shrink-0"
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200 pb-2 mb-8 font-sans">
                        <span>MD/MS DISSERTATION</span>
                        <span>CHAPTER {idx + 1}</span>
                      </div>

                      <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-600 mb-6">
                        <h2 className="text-lg font-bold text-slate-900">
                          {ch.name}
                        </h2>
                        <button
                          onClick={() => {
                            setNewChapterId(ch.id);
                            setIsAddingNote(true);
                            setShowNotesDrawer(true);
                          }}
                          className="text-[11px] font-sans font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Note</span>
                        </button>
                      </div>

                      <div className="text-xs font-sans leading-relaxed text-slate-700">
                        {renderHighlightedContent(ch.content, ch.id)}
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 font-sans">
                      Page {idx + 2} • {project.university}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Highlights & Reviewer Notes Drawer */}
          {showNotesDrawer && (
            <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-lg z-20 shrink-0">
              
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Reviewer Notes ({annotations.length})
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleCopyReviewSummary}
                    className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 cursor-pointer text-xs flex items-center space-x-1"
                    title="Copy all notes as checklist"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>

              {/* Add Note Form */}
              {isAddingNote && (
                <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">New Dissertation Annotation</span>
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Target Chapter */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Target Chapter:</label>
                    <select
                      value={newChapterId}
                      onChange={(e) => setNewChapterId(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {project.chapters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quoted / Selected Text */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Highlighted Text Snippet (Optional):
                    </label>
                    <input
                      type="text"
                      value={selectedText}
                      onChange={(e) => setSelectedText(e.target.value)}
                      placeholder="e.g. sample size formula, prevalence in Maharashtra"
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none italic"
                    />
                  </div>

                  {/* Highlight Color / Purpose */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Color & Category:</label>
                    <div className="flex space-x-2">
                      {(Object.keys(COLOR_CONFIG) as Array<DissertationAnnotation['color']>).map(col => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewColor(col)}
                          className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${COLOR_CONFIG[col].badge} ${newColor === col ? 'scale-125 border-slate-900 shadow-xs' : 'border-white opacity-70'}`}
                          title={COLOR_CONFIG[col].label}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Category: <span className="font-semibold text-slate-700">{COLOR_CONFIG[newColor].label}</span>
                    </span>
                  </div>

                  {/* Note comment */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Reviewer Note / Action Item:</label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write feedback, corrections, guide suggestions, or data checks..."
                      rows={3}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Author Name */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Reviewer Signature:</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddAnnotation()}
                      disabled={!newNote.trim() && !selectedText.trim()}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-bold"
                    >
                      Save to Project
                    </button>
                  </div>
                </div>
              )}

              {/* Filter by Chapter */}
              <div className="p-2.5 border-b border-slate-200 bg-white flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-semibold">Filter:</span>
                <select
                  value={filterChapter}
                  onChange={(e) => setFilterChapter(e.target.value)}
                  className="text-[11px] p-1 bg-slate-50 border border-slate-200 rounded max-w-[200px]"
                >
                  <option value="all">All Chapters ({annotations.length})</option>
                  {project.chapters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredAnnotations.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold">No annotations yet</p>
                    <p className="text-[11px] text-slate-400 px-4">
                      Highlight any text in the A4 layout or click "+ Add Note" to save feedback directly into this dissertation project.
                    </p>
                  </div>
                ) : (
                  filteredAnnotations.map(item => {
                    const col = COLOR_CONFIG[item.color] || COLOR_CONFIG.yellow;
                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-lg border ${col.border} ${col.bg} relative space-y-1.5 shadow-2xs transition-all`}
                      >
                        <div className="flex items-start justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.text} bg-white/70 border ${col.border}`}>
                            {col.label}
                          </span>
                          <button
                            onClick={() => handleDeleteAnnotation(item.id)}
                            className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                            title="Delete annotation"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {item.selectedText && (
                          <div className="text-[11px] italic text-slate-700 bg-white/60 p-1.5 rounded border border-black/5 leading-snug">
                            "{item.selectedText}"
                          </div>
                        )}

                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {item.note}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-black/5">
                          <span className="font-semibold">{item.chapterName?.split('.')[0] || 'Note'}</span>
                          <span>{item.author} • {item.createdAt}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer Status */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Syncs to active project state</span>
                </span>
                <span>{annotations.length} recorded</span>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>NMC Dissertation Draft with Integrated Guide & Reviewer Feedback Annotations.</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview Layout</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
