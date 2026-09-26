import React, { useState, useRef, useEffect } from 'react';
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
  Copy,
  Check,
  Pin,
  UserCheck,
  Send,
  Share2,
  ExternalLink,
  Minimize2,
  Maximize2,
  Filter,
  Sparkles,
  Upload,
  CheckSquare
} from 'lucide-react';

export interface AnnotationReply {
  id: string;
  author: string;
  role: 'guide' | 'candidate' | 'coguide' | 'examiner';
  text: string;
  createdAt: string;
}

export interface DissertationAnnotation {
  id: string;
  chapterId?: string;
  chapterName?: string;
  selectedText?: string;
  note: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  createdAt: string;
  author?: string;
  role?: 'guide' | 'candidate' | 'coguide' | 'examiner';
  status?: 'open' | 'in_progress' | 'resolved';
  isStickyOnPage?: boolean;
  pageX?: number; // percentage 5..72
  pageY?: number; // percentage 5..85
  minimized?: boolean;
  replies?: AnnotationReply[];
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
  stickyCalloutBox: {
    marginTop: 8,
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
    borderRadius: 3
  },
  stickyCalloutHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 3
  },
  stickyCalloutQuote: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#78350f',
    marginBottom: 3
  },
  stickyCalloutBody: {
    fontSize: 9,
    color: '#451a03'
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
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 10,
    marginBottom: 5
  },
  subSectionHeading: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4
  },
  legendQuoteBox: {
    marginTop: 4,
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 2.5,
    borderLeftColor: '#0d9488',
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#334155'
  },
  tableContainer: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 2,
    overflow: 'hidden'
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0284c7'
  },
  tableGroupRow: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0c4a6e',
    borderRightWidth: 0.5,
    borderRightColor: '#bae6fd'
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 5,
    fontSize: 8.5,
    color: '#1e293b',
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0'
  },
  tocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  tocTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  tocMeta: {
    fontSize: 9,
    color: '#475569'
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
    frontMatter?: string;
    logbook?: string;
    annotations?: DissertationAnnotation[];
  };
  includeAnnotationsInPdf?: boolean;
  includeTableOfContents?: boolean;
  includeFrontMatter?: boolean;
}

export interface DissertationPdfPreviewModalProps extends PdfProps {
  onClose: () => void;
  onSaveAnnotations?: (annotations: DissertationAnnotation[]) => void;
  onJumpToChapter?: (chapterId: string) => void;
  initialChapterId?: string;
}

// Clean inline markdown markers for PDF text blocks
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

// Clean markdown text for A4 reader view
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

// Parse a chapter's Markdown content into structured blocks (headings, paragraphs, legends, and statistical tables) for React-PDF
type PdfContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'legend'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'table'; headers: string[]; rows: Array<{ cells: string[]; isGroupRow: boolean }> };

function parseChapterBlocksForPdf(markdownContent: string): PdfContentBlock[] {
  const lines = markdownContent.split(/\r?\n/);
  const blocks: PdfContentBlock[] = [];
  let i = 0;

  const parsePipeRow = (rawLine: string): string[] => {
    const trimmed = rawLine.trim().replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map(c => cleanInlineMarkdown(c));
  };

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed || /^-{3,}$/.test(trimmed)) {
      i++;
      continue;
    }

    // Skip top-level # Chapter title if redundant with chapter header
    if (/^#\s+/.test(trimmed)) {
      i++;
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      blocks.push({ type: 'h2', text: cleanInlineMarkdown(trimmed.replace(/^##\s+/, '')) });
      i++;
      continue;
    }

    if (/^#{3,4}\s+/.test(trimmed)) {
      blocks.push({ type: 'h3', text: cleanInlineMarkdown(trimmed.replace(/^#{3,4}\s+/, '')) });
      i++;
      continue;
    }

    // Markdown table block
    if (trimmed.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1])) {
      const headers = parsePipeRow(trimmed);
      i += 2;
      const rows: Array<{ cells: string[]; isGroupRow: boolean }> = [];
      while (i < lines.length && lines[i].trim().includes('|')) {
        const rLine = lines[i].trim();
        if (/^\|?[\s:-]+\|[\s|:-]*$/.test(rLine)) {
          i++;
          continue;
        }
        const rawCells = parsePipeRow(rLine);
        const cells = headers.map((_, cIdx) => rawCells[cIdx] ?? '');
        const nonEmpty = cells.filter(c => c !== '').length;
        const isGroupRow = nonEmpty === 1 && cells[0] !== '' && headers.length > 1;
        rows.push({ cells, isGroupRow });
        i++;
      }
      if (headers.length > 0 && rows.length > 0) {
        blocks.push({ type: 'table', headers, rows });
      }
      continue;
    }

    // Blockquote / Scientific Table Footnote Legend
    if (/^>\s*/.test(trimmed)) {
      blocks.push({ type: 'legend', text: cleanInlineMarkdown(trimmed.replace(/^>\s*/, '')) });
      i++;
      continue;
    }

    // Accumulate contiguous paragraph lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,4}\s+/.test(lines[i].trim()) &&
      !/^>\s*/.test(lines[i].trim()) &&
      !(lines[i].trim().includes('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1]))
    ) {
      paraLines.push(cleanInlineMarkdown(lines[i].trim()));
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    }
  }

  return blocks;
}

// Color dictionary for highlight tags & sticky notes
export const COLOR_CONFIG: Record<DissertationAnnotation['color'], {
  bg: string;
  stickyBg: string;
  stickyHeader: string;
  border: string;
  text: string;
  label: string;
  badge: string;
  pdfHexBg: string;
  pdfHexBorder: string;
}> = {
  yellow: {
    bg: 'bg-amber-200/80',
    stickyBg: 'bg-amber-50',
    stickyHeader: 'bg-amber-200/90',
    border: 'border-amber-300',
    text: 'text-amber-950',
    label: 'Guide Feedback',
    badge: 'bg-amber-500',
    pdfHexBg: '#fef3c7',
    pdfHexBorder: '#d97706'
  },
  green: {
    bg: 'bg-emerald-200/80',
    stickyBg: 'bg-emerald-50',
    stickyHeader: 'bg-emerald-200/90',
    border: 'border-emerald-300',
    text: 'text-emerald-950',
    label: 'Verified & Approved',
    badge: 'bg-emerald-500',
    pdfHexBg: '#d1fae5',
    pdfHexBorder: '#059669'
  },
  blue: {
    bg: 'bg-sky-200/80',
    stickyBg: 'bg-sky-50',
    stickyHeader: 'bg-sky-200/90',
    border: 'border-sky-300',
    text: 'text-sky-950',
    label: 'Literature Query',
    badge: 'bg-sky-500',
    pdfHexBg: '#e0f2fe',
    pdfHexBorder: '#0284c7'
  },
  pink: {
    bg: 'bg-rose-200/80',
    stickyBg: 'bg-rose-50',
    stickyHeader: 'bg-rose-200/90',
    border: 'border-rose-300',
    text: 'text-rose-950',
    label: 'Requires Revision',
    badge: 'bg-rose-500',
    pdfHexBg: '#ffe4e6',
    pdfHexBorder: '#e11d48'
  },
  purple: {
    bg: 'bg-purple-200/80',
    stickyBg: 'bg-purple-50',
    stickyHeader: 'bg-purple-200/90',
    border: 'border-purple-300',
    text: 'text-purple-950',
    label: 'Biostats / Clinical Check',
    badge: 'bg-purple-500',
    pdfHexBg: '#f3e8ff',
    pdfHexBorder: '#9333ea'
  }
};

const STATUS_BADGES: Record<NonNullable<DissertationAnnotation['status']>, { label: string; classes: string }> = {
  open: { label: 'Open Action', classes: 'bg-amber-100 text-amber-800 border-amber-300' },
  in_progress: { label: 'Addressed by Student', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
  resolved: { label: 'Guide Approved ✓', classes: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
};

export interface ExtractedTableIndexItem {
  tableNumber: string;
  title: string;
  chapterId: string;
  chapterName: string;
  chapterIndex: number;
  rowCount: number;
  colCount: number;
}

function extractAllDissertationTables(
  chapters: Array<{ id: string; name: string; description: string; content: string }>
): ExtractedTableIndexItem[] {
  const list: ExtractedTableIndexItem[] = [];
  chapters.forEach((ch, chIdx) => {
    const blocks = parseChapterBlocksForPdf(ch.content);
    let tableIdxInChapter = 0;
    let lastHeading = '';
    blocks.forEach((b) => {
      if (b.type === 'h2' || b.type === 'h3') {
        lastHeading = b.text;
      } else if (b.type === 'table') {
        tableIdxInChapter++;
        const tableNumber = `Table ${chIdx + 1}.${tableIdxInChapter}`;
        const cleanHeading = lastHeading
          ? lastHeading.replace(/^Table\s*[\d.]+[:\s-]*/i, '').trim()
          : `${ch.name.replace(/^\d+\.\s*/, '')} — Clinical Summary (${b.headers.slice(0, 2).join(', ')})`;
        list.push({
          tableNumber,
          title: cleanHeading || `${ch.name} Statistical Table ${tableIdxInChapter}`,
          chapterId: ch.id,
          chapterName: ch.name,
          chapterIndex: chIdx + 1,
          rowCount: b.rows.length,
          colCount: b.headers.length
        });
      }
    });
  });
  return list;
}

function getSpecialtyRexineTheme(specialty: string): {
  name: string;
  bgClass: string;
  spineBgClass: string;
  borderClass: string;
  hexCode: string;
} {
  const s = (specialty || '').toLowerCase();
  if (s.includes('emergency') || s.includes('trauma') || s.includes('critical care') || s.includes('anesthes')) {
    return {
      name: 'MD Emergency Medicine & Critical Care Tactical Ruby-Burgundy Rexine (Gold Foil)',
      bgClass: 'from-red-950 via-rose-950 to-stone-950',
      spineBgClass: 'bg-red-950',
      borderClass: 'border-amber-400',
      hexCode: '#7f1d1d'
    };
  }
  if (s.includes('surgery') || s.includes('ent') || s.includes('ophthal')) {
    return {
      name: 'MS Surgical Maroon / Crimson Rexine (Gold Foil)',
      bgClass: 'from-rose-950 via-red-900 to-rose-950',
      spineBgClass: 'bg-rose-950',
      borderClass: 'border-amber-400',
      hexCode: '#6b1218'
    };
  }
  if (s.includes('pediatric') || s.includes('paediatric')) {
    return {
      name: 'MD Pediatrics Forest Green Rexine (Gold Foil)',
      bgClass: 'from-emerald-950 via-green-900 to-emerald-950',
      spineBgClass: 'bg-emerald-950',
      borderClass: 'border-amber-400',
      hexCode: '#0e3f27'
    };
  }
  if (s.includes('obstet') || s.includes('gynaec')) {
    return {
      name: 'MD/MS OBG Royal Purple Rexine (Gold Foil)',
      bgClass: 'from-purple-950 via-fuchsia-950 to-purple-950',
      spineBgClass: 'bg-purple-950',
      borderClass: 'border-amber-400',
      hexCode: '#3b0764'
    };
  }
  if (s.includes('ortho')) {
    return {
      name: 'MS Orthopaedics Espresso Brown Rexine (Gold Foil)',
      bgClass: 'from-amber-950 via-stone-900 to-amber-950',
      spineBgClass: 'bg-stone-950',
      borderClass: 'border-amber-400',
      hexCode: '#3e2723'
    };
  }
  if (s.includes('dm ') || s.includes('mch ') || s.includes('cardio') || s.includes('neuro') || s.includes('uro')) {
    return {
      name: 'DM/MCh Super-Specialty Imperial Teal Rexine (Gold Foil)',
      bgClass: 'from-teal-950 via-cyan-950 to-teal-950',
      spineBgClass: 'bg-teal-950',
      borderClass: 'border-amber-400',
      hexCode: '#0f3d3e'
    };
  }
  return {
    name: 'MD Broad Specialty Royal Navy Blue Rexine (Gold Foil)',
    bgClass: 'from-slate-950 via-blue-950 to-slate-950',
    spineBgClass: 'bg-blue-950',
    borderClass: 'border-amber-400',
    hexCode: '#112240'
  };
}

// React-PDF Document Component (Pre-formatted, Print-Ready University Manuscript with Tables, TOC, Certificates & Optional Sticky Notes)
export const ThesisPdfDocument: React.FC<PdfProps> = ({
  project,
  includeAnnotationsInPdf = true,
  includeTableOfContents = true,
  includeFrontMatter = true
}) => {
  const annotations = project.annotations || [];
  const totalWords = project.chapters.reduce(
    (sum, ch) => sum + ch.content.split(/\s+/).filter(Boolean).length,
    0
  );
  const extractedTables = extractAllDissertationTables(project.chapters);

  return (
    <Document
      title={project.title}
      author={`Dr. ${project.candidateName}`}
      subject={`MD/MS Dissertation - ${project.specialty}`}
      keywords="Medical, Dissertation, Thesis, PubMed, NMC, India, YADAV MD/MS Thesis Studio"
    >
      {/* Page 1: Official Front / Title Page */}
      <Page size="A4" style={pdfStyles.coverPage}>
        <View>
          <Text style={pdfStyles.universityTitle}>{project.university || 'State Health University'}</Text>
          <Text style={pdfStyles.dissertationLabel}>Dissertation Submitted For Postgraduate Medical Degree</Text>
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

      {/* Page 2: Candidate Declaration, Guide Certificate & Custom Front Matter */}
      {includeFrontMatter && (
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.headerText}>
            {project.specialty} | {project.collegeName}
          </Text>

          <View style={{ marginBottom: 22 }}>
            <View style={pdfStyles.chapterHeader}>
              <Text style={pdfStyles.chapterTitle}>Declaration by the Candidate</Text>
            </View>
            <Text style={pdfStyles.paragraph}>
              I hereby declare that the dissertation entitled "{project.title}" is a bona fide and original record of clinical research work carried out by me under the direct guidance and supervision of {project.guideName} at {project.collegeName}.
            </Text>
            <Text style={pdfStyles.paragraph}>
              This dissertation or any part thereof has not been submitted previously to {project.university} or any other university or institution for the award of any degree, diploma, or fellowship.
            </Text>
            <View style={{ marginTop: 22, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 9, color: '#64748b' }}>Date: ________________</Text>
                <Text style={{ fontSize: 9, color: '#64748b' }}>Place: {project.collegeName.split(',')[1]?.trim() || 'India'}</Text>
              </View>
              <View style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Dr. {project.candidateName}</Text>
                <Text style={{ fontSize: 8, color: '#64748b' }}>Postgraduate Candidate Signature</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <View style={pdfStyles.chapterHeader}>
              <Text style={pdfStyles.chapterTitle}>Certificate by the Guide &amp; Head of Department</Text>
            </View>
            <Text style={pdfStyles.paragraph}>
              This is to certify that the dissertation entitled "{project.title}" is a bona fide record of research work done by Dr. {project.candidateName}, Postgraduate Resident in {project.specialty}, under my direct supervision and guidance in partial fulfillment of the regulations of {project.university}.
            </Text>
            <View style={{ marginTop: 30, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Head of Department ({project.specialty})</Text>
                <Text style={{ fontSize: 8, color: '#64748b' }}>Official Seal &amp; Signature</Text>
              </View>
              <View style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{project.guideName}</Text>
                <Text style={{ fontSize: 8, color: '#64748b' }}>Chief Dissertation Guide &amp; Professor</Text>
              </View>
            </View>
          </View>

          {project.frontMatter && project.frontMatter.trim().length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View style={pdfStyles.chapterHeader}>
                <Text style={pdfStyles.chapterTitle}>Institutional Certificates, Ethics &amp; Consent Annexures</Text>
              </View>
              {cleanMarkdownForPdf(project.frontMatter)
                .split('\n\n')
                .filter(p => p.trim().length > 0)
                .map((p, idx) => (
                  <Text key={idx} style={pdfStyles.paragraph}>
                    {p}
                  </Text>
                ))}
            </View>
          )}

          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* Page 3: Automated Table of Contents & Manuscript Summary */}
      {includeTableOfContents && (
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.headerText}>
            Table of Contents | {project.university}
          </Text>

          <View style={pdfStyles.chapterHeader}>
            <Text style={pdfStyles.chapterTitle}>Table of Contents &amp; Manuscript Structure</Text>
            <Text style={pdfStyles.chapterSubtitle}>
              Complete Print-Ready Dissertation • {project.chapters.length} Chapters • {totalWords.toLocaleString()} Total Words • {project.citations.length} PubMed Citations
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            {project.chapters.map((ch, idx) => {
              const chWords = ch.content.split(/\s+/).filter(Boolean).length;
              const chBlocks = parseChapterBlocksForPdf(ch.content);
              const chTablesCount = chBlocks.filter(b => b.type === 'table').length;
              return (
                <View key={ch.id} style={pdfStyles.tocRow}>
                  <View>
                    <Text style={pdfStyles.tocTitle}>
                      Chapter {idx + 1}: {ch.name.replace(/^\d+\.\s*/, '')}
                    </Text>
                    <Text style={{ fontSize: 8.5, color: '#64748b', marginTop: 1 }}>
                      {ch.description}
                    </Text>
                  </View>
                  <Text style={pdfStyles.tocMeta}>
                    {chWords.toLocaleString()} words{chTablesCount > 0 ? ` • ${chTablesCount} Table(s)` : ''}
                  </Text>
                </View>
              );
            })}

            {project.citations.length > 0 && (
              <View style={pdfStyles.tocRow}>
                <View>
                  <Text style={pdfStyles.tocTitle}>
                    Comprehensive Bibliography &amp; Verified References
                  </Text>
                  <Text style={{ fontSize: 8.5, color: '#64748b', marginTop: 1 }}>
                    Indexed PubMed / MEDLINE citations formatted per NMC guidelines
                  </Text>
                </View>
                <Text style={pdfStyles.tocMeta}>{project.citations.length} References</Text>
              </View>
            )}

            {project.logbook && project.logbook.trim().length > 0 && (
              <View style={pdfStyles.tocRow}>
                <View>
                  <Text style={pdfStyles.tocTitle}>Annexure: Clinical Case Logbook &amp; Master Record</Text>
                  <Text style={{ fontSize: 8.5, color: '#64748b', marginTop: 1 }}>
                    Postgraduate clinical case entries and ethical record verification
                  </Text>
                </View>
                <Text style={pdfStyles.tocMeta}>Attached</Text>
              </View>
            )}
          </View>

          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* Page 3B: Automated List of Tables & Clinical Figures Index */}
      {includeTableOfContents && extractedTables.length > 0 && (
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.headerText}>
            List of Tables &amp; Figures | {project.university}
          </Text>

          <View style={pdfStyles.chapterHeader}>
            <Text style={pdfStyles.chapterTitle}>List of Statistical Tables &amp; Clinical Figures</Text>
            <Text style={pdfStyles.chapterSubtitle}>
              Automated Index of {extractedTables.length} Clinical &amp; Biostatistical Tables across Chapters 1–{project.chapters.length}
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            {extractedTables.map((tb, idx) => (
              <View key={idx} style={pdfStyles.tocRow}>
                <View style={{ maxWidth: '76%' }}>
                  <Text style={pdfStyles.tocTitle}>
                    {tb.tableNumber}: {tb.title}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>
                    {tb.chapterName}
                  </Text>
                </View>
                <Text style={pdfStyles.tocMeta}>
                  {tb.rowCount} rows × {tb.colCount} cols
                </Text>
              </View>
            ))}
          </View>

          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* Subsequent Pages: Dissertation Chapters with Native Statistical Tables */}
      {project.chapters.map((ch, index) => {
        const blocks = parseChapterBlocksForPdf(ch.content);
        const chapterNotes = includeAnnotationsInPdf
          ? annotations.filter(a => a.chapterId === ch.id)
          : [];

        return (
          <Page key={ch.id} size="A4" style={pdfStyles.page}>
            <Text style={pdfStyles.headerText} fixed>
              MD/MS Dissertation: {ch.name} | Dr. {project.candidateName}
            </Text>

            <View style={pdfStyles.chapterHeader}>
              <Text style={pdfStyles.chapterTitle}>{ch.name}</Text>
              <Text style={pdfStyles.chapterSubtitle}>{ch.description}</Text>
            </View>

            <View>
              {blocks.map((block, bIdx) => {
                if (block.type === 'h2') {
                  return (
                    <Text key={bIdx} style={pdfStyles.sectionHeading}>
                      {block.text}
                    </Text>
                  );
                }
                if (block.type === 'h3') {
                  return (
                    <Text key={bIdx} style={pdfStyles.subSectionHeading}>
                      {block.text}
                    </Text>
                  );
                }
                if (block.type === 'legend') {
                  return (
                    <View key={bIdx} style={pdfStyles.legendQuoteBox}>
                      <Text>{block.text}</Text>
                    </View>
                  );
                }
                if (block.type === 'table') {
                  return (
                    <View key={bIdx} style={pdfStyles.tableContainer}>
                      {/* Table Header Row */}
                      <View style={pdfStyles.tableHeaderRow}>
                        {block.headers.map((h, hIdx) => (
                          <Text
                            key={hIdx}
                            style={[
                              pdfStyles.tableHeaderCell,
                              hIdx === block.headers.length - 1 ? { borderRightWidth: 0 } : {}
                            ]}
                          >
                            {h}
                          </Text>
                        ))}
                      </View>
                      {/* Table Body Rows */}
                      {block.rows.map((row, rIdx) => {
                        if (row.isGroupRow) {
                          return (
                            <View key={rIdx} style={pdfStyles.tableGroupRow}>
                              <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#78350f' }}>
                                {row.cells[0]}
                              </Text>
                            </View>
                          );
                        }
                        return (
                          <View
                            key={rIdx}
                            style={rIdx % 2 === 1 ? pdfStyles.tableRowAlt : pdfStyles.tableRow}
                          >
                            {block.headers.map((_, cIdx) => (
                              <Text
                                key={cIdx}
                                style={[
                                  pdfStyles.tableCell,
                                  cIdx === block.headers.length - 1 ? { borderRightWidth: 0 } : {},
                                  rIdx === block.rows.length - 1 && /^total\b/i.test(row.cells[0] || '')
                                    ? { fontWeight: 'bold', color: '#0f172a' }
                                    : {}
                                ]}
                              >
                                {row.cells[cIdx] ?? ''}
                              </Text>
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  );
                }
                return (
                  <Text key={bIdx} style={pdfStyles.paragraph}>
                    {block.text}
                  </Text>
                );
              })}
            </View>

            {/* Render Guide & Candidate Sticky Notes Callouts on the PDF Chapter Page if enabled */}
            {chapterNotes.length > 0 && (
              <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 10 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0f172a', marginBottom: 6, textTransform: 'uppercase' }}>
                  📌 Guide & Candidate Sticky Notes ({chapterNotes.length})
                </Text>
                {chapterNotes.map((ann) => {
                  const colCfg = COLOR_CONFIG[ann.color] || COLOR_CONFIG.yellow;
                  return (
                    <View
                      key={ann.id}
                      style={[
                        pdfStyles.stickyCalloutBox,
                        {
                          backgroundColor: colCfg.pdfHexBg,
                          borderLeftColor: colCfg.pdfHexBorder
                        }
                      ]}
                    >
                      <Text style={pdfStyles.stickyCalloutHeader}>
                        [{colCfg.label}] • {ann.author || 'Reviewer'} ({ann.createdAt}) • Status: {(ann.status || 'open').toUpperCase()}
                      </Text>
                      {ann.selectedText ? (
                        <Text style={pdfStyles.stickyCalloutQuote}>
                          Highlighted Passage: "{ann.selectedText}"
                        </Text>
                      ) : null}
                      <Text style={pdfStyles.stickyCalloutBody}>
                        Note: {ann.note}
                      </Text>
                      {ann.replies && ann.replies.length > 0 && (
                        <View style={{ marginTop: 4, paddingLeft: 6, borderLeftWidth: 1, borderLeftColor: '#94a3b8' }}>
                          {ann.replies.map(r => (
                            <Text key={r.id} style={{ fontSize: 8, color: '#334155', marginTop: 2 }}>
                              ↳ {r.author}: {r.text} ({r.createdAt})
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            <Text
              style={pdfStyles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              fixed
            />
          </Page>
        );
      })}

      {/* Optional Clinical Logbook Annexure Page */}
      {includeFrontMatter && project.logbook && project.logbook.trim().length > 0 && (
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.headerText} fixed>
            Clinical Logbook Annexure | Dr. {project.candidateName}
          </Text>
          <View style={pdfStyles.chapterHeader}>
            <Text style={pdfStyles.chapterTitle}>Annexure: Postgraduate Clinical Dissertation Logbook</Text>
            <Text style={pdfStyles.chapterSubtitle}>Verified clinical case entries and longitudinal research record</Text>
          </View>
          {cleanMarkdownForPdf(project.logbook)
            .split('\n')
            .filter(l => l.trim().length > 0)
            .map((line, lIdx) => (
              <Text key={lIdx} style={pdfStyles.paragraph}>
                {line}
              </Text>
            ))}
          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
            fixed
          />
        </Page>
      )}

      {/* Bibliography / References Page */}
      {project.citations.length > 0 && (
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.headerText} fixed>
            References & Bibliography | {project.university}
          </Text>

          <View style={pdfStyles.chapterHeader}>
            <Text style={pdfStyles.chapterTitle}>Comprehensive Academic References</Text>
            <Text style={pdfStyles.chapterSubtitle}>Formatted in APA / Vancouver style according to NMC dissertation guidelines</Text>
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
};

// Preview Window Container Component with Interactive Highlights & On-Page Sticky Notes
export const DissertationPdfPreviewModal: React.FC<DissertationPdfPreviewModalProps> = ({ 
  project, 
  onClose,
  onSaveAnnotations,
  onJumpToChapter,
  initialChapterId
}) => {
  const [previewMode, setPreviewMode] = useState<'interactive' | 'reader'>('reader');
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);
  const [includeAnnotationsInPdf, setIncludeAnnotationsInPdf] = useState<boolean>(true);
  const [showHardboundAndTablesIndex, setShowHardboundAndTablesIndex] = useState<boolean>(true);
  const extractedTables = extractAllDissertationTables(project.chapters);
  const rexineTheme = getSpecialtyRexineTheme(project.specialty);

  // Annotation state initialized from project
  const [annotations, setAnnotations] = useState<DissertationAnnotation[]>(project.annotations || []);

  // Active collaboration role persona switcher
  const [activePersona, setActivePersona] = useState<'guide' | 'candidate' | 'coguide' | 'examiner'>('guide');
  const [reviewerName, setReviewerName] = useState<string>(`${project.guideName} (Thesis Guide)`);

  // Update default reviewer signature when persona switches
  const handlePersonaSwitch = (role: 'guide' | 'candidate' | 'coguide' | 'examiner') => {
    setActivePersona(role);
    if (role === 'guide') {
      setReviewerName(`${project.guideName} (Thesis Guide)`);
      setNewColor('yellow');
    } else if (role === 'candidate') {
      setReviewerName(`Dr. ${project.candidateName} (Candidate)`);
      setNewColor('blue');
    } else if (role === 'coguide') {
      setReviewerName(`${project.coGuideName || 'Co-Guide'} (Co-Guide)`);
      setNewColor('purple');
    } else {
      setReviewerName('External University Examiner');
      setNewColor('pink');
    }
  };

  // Pin-on-Page Sticky Note placement mode
  const [pinStickyMode, setPinStickyMode] = useState<boolean>(false);
  const [activeFocusedAnnotationId, setActiveFocusedAnnotationId] = useState<string | null>(null);
  const [draggingStickyId, setDraggingStickyId] = useState<string | null>(null);

  // Floating selection toolbar state
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean;
    text: string;
    chapterId: string;
    x: number;
    y: number;
    quickNote: string;
    color: DissertationAnnotation['color'];
  } | null>(null);

  // New Note Form state in drawer
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [newChapterId, setNewChapterId] = useState<string>(initialChapterId || project.chapters[0]?.id || 'intro');
  const [newColor, setNewColor] = useState<DissertationAnnotation['color']>('yellow');
  const [newIsStickyOnPage, setNewIsStickyOnPage] = useState<boolean>(true);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);

  // Filtering & reply inputs
  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const readerScrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerLocalToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3500);
  };

  // Scroll to initialChapterId if passed
  useEffect(() => {
    if (initialChapterId && previewMode === 'reader') {
      const el = document.getElementById(`preview-chapter-${initialChapterId}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
      }
    }
  }, [initialChapterId, previewMode]);

  // Helper to persist annotations back to parent project state
  const saveAndPropagate = (updated: DissertationAnnotation[]) => {
    setAnnotations(updated);
    if (onSaveAnnotations) {
      onSaveAnnotations(updated);
    }
  };

  // Text selection handler inside a specific chapter A4 page
  const handleChapterMouseUp = (e: React.MouseEvent, chapterId: string) => {
    if (pinStickyMode) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 2) {
      const text = selection.toString().trim();
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      setSelectionPopup({
        visible: true,
        text,
        chapterId,
        x: Math.max(220, Math.min(window.innerWidth - 340, rect.left + rect.width / 2)),
        y: Math.max(80, rect.top - 12),
        quickNote: '',
        color: activePersona === 'guide' ? 'yellow' : 'blue'
      });
      setSelectedText(text);
      setNewChapterId(chapterId);
    }
  };

  // Click on A4 page to drop a sticky note when in Pin Sticky Note mode
  const handlePageClickForPin = (e: React.MouseEvent<HTMLDivElement>, chapterId: string) => {
    if (!pinStickyMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(4, Math.min(68, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const yPct = Math.max(6, Math.min(84, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setNewChapterId(chapterId);
    setPendingPinCoords({ x: xPct, y: yPct });
    setNewIsStickyOnPage(true);
    setIsAddingNote(true);
    setShowNotesDrawer(true);
    setPinStickyMode(false);
    triggerLocalToast('📌 Sticky Note location pinned! Enter your comment in the drawer.');
  };

  // Dragging an existing on-page sticky note around an A4 page
  const handlePageMouseMove = (e: React.MouseEvent<HTMLDivElement>, chapterId: string) => {
    if (!draggingStickyId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(2, Math.min(68, Math.round(((e.clientX - rect.left - 90) / rect.width) * 100)));
    const yPct = Math.max(4, Math.min(86, Math.round(((e.clientY - rect.top - 18) / rect.height) * 100)));

    setAnnotations(prev =>
      prev.map(a =>
        a.id === draggingStickyId && a.chapterId === chapterId
          ? { ...a, pageX: xPct, pageY: yPct }
          : a
      )
    );
  };

  const handlePageMouseUpDrag = () => {
    if (draggingStickyId) {
      saveAndPropagate(annotations);
      setDraggingStickyId(null);
    }
  };

  // Instant highlight creation from Floating Selection Toolbar
  const handleCreateFromSelectionPopup = (customColor?: DissertationAnnotation['color'], withSticky = true) => {
    if (!selectionPopup) return;
    const targetChapter = project.chapters.find(c => c.id === selectionPopup.chapterId);
    const chosenColor = customColor || selectionPopup.color;
    const noteText = selectionPopup.quickNote.trim() || `${COLOR_CONFIG[chosenColor].label}: Highlighted for discussion.`;

    const existingInChapter = annotations.filter(a => a.chapterId === selectionPopup.chapterId && a.isStickyOnPage);
    const offsetIndex = existingInChapter.length % 5;

    const newEntry: DissertationAnnotation = {
      id: `ann-${Date.now()}`,
      chapterId: selectionPopup.chapterId,
      chapterName: targetChapter?.name || 'Dissertation Manuscript',
      selectedText: selectionPopup.text,
      note: noteText,
      color: chosenColor,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      author: reviewerName.trim() || 'Reviewer',
      role: activePersona,
      status: 'open',
      isStickyOnPage: withSticky,
      pageX: 56 + (offsetIndex * 3),
      pageY: 16 + (offsetIndex * 14),
      minimized: false,
      replies: []
    };

    const updated = [newEntry, ...annotations];
    saveAndPropagate(updated);
    setSelectionPopup(null);
    setActiveFocusedAnnotationId(newEntry.id);
    window.getSelection()?.removeAllRanges();
    triggerLocalToast('✨ Text highlighted & Sticky Note attached to page!');
  };

  // Create new annotation from Drawer Form
  const handleAddAnnotation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNote.trim() && !selectedText.trim()) return;

    const targetChapter = project.chapters.find(c => c.id === newChapterId);
    const existingInChapter = annotations.filter(a => a.chapterId === newChapterId && a.isStickyOnPage);
    const offsetIndex = existingInChapter.length % 5;

    const newEntry: DissertationAnnotation = {
      id: `ann-${Date.now()}`,
      chapterId: newChapterId,
      chapterName: targetChapter?.name || 'General Dissertation Note',
      selectedText: selectedText.trim() || undefined,
      note: newNote.trim() || 'Highlighted section for Guide review.',
      color: newColor,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      author: reviewerName.trim() || 'Dissertation Reviewer',
      role: activePersona,
      status: 'open',
      isStickyOnPage: newIsStickyOnPage,
      pageX: pendingPinCoords ? pendingPinCoords.x : 54 + (offsetIndex * 3),
      pageY: pendingPinCoords ? pendingPinCoords.y : 18 + (offsetIndex * 14),
      minimized: false,
      replies: []
    };

    const updated = [newEntry, ...annotations];
    saveAndPropagate(updated);

    // Reset form
    setSelectedText('');
    setNewNote('');
    setPendingPinCoords(null);
    setIsAddingNote(false);
    setActiveFocusedAnnotationId(newEntry.id);
    triggerLocalToast('📌 Sticky Note saved to Dissertation PDF!');
  };

  // Delete annotation
  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    saveAndPropagate(updated);
    if (activeFocusedAnnotationId === id) setActiveFocusedAnnotationId(null);
  };

  // Toggle status (open -> in_progress -> resolved)
  const handleCycleStatus = (id: string) => {
    const order: Array<NonNullable<DissertationAnnotation['status']>> = ['open', 'in_progress', 'resolved'];
    const updated = annotations.map(a => {
      if (a.id !== id) return a;
      const nextIdx = (order.indexOf(a.status || 'open') + 1) % order.length;
      return { ...a, status: order[nextIdx] };
    });
    saveAndPropagate(updated);
  };

  // Toggle minimize state of on-page sticky note
  const handleToggleMinimizeSticky = (id: string) => {
    const updated = annotations.map(a =>
      a.id === id ? { ...a, minimized: !a.minimized } : a
    );
    saveAndPropagate(updated);
  };

  // Add a threaded reply to a sticky note
  const handleAddReply = (annotationId: string) => {
    const text = (replyDrafts[annotationId] || '').trim();
    if (!text) return;

    const newReply: AnnotationReply = {
      id: `rep-${Date.now()}`,
      author: reviewerName,
      role: activePersona,
      text,
      createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = annotations.map(a => {
      if (a.id !== annotationId) return a;
      const nextStatus = activePersona === 'candidate' && a.status === 'open' ? 'in_progress' : a.status;
      return {
        ...a,
        status: nextStatus,
        replies: [...(a.replies || []), newReply]
      };
    });

    saveAndPropagate(updated);
    setReplyDrafts(prev => ({ ...prev, [annotationId]: '' }));
  };

  // Export annotations JSON packet so Guide and Student can exchange files
  const handleExportAnnotationsJson = () => {
    const packet = {
      exportedAt: new Date().toISOString(),
      thesisTitle: project.title,
      candidateName: project.candidateName,
      guideName: project.guideName,
      annotations
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.candidateName.replace(/\s+/g, '_')}_Guide_StickyNotes.json`;
    a.click();
    triggerLocalToast('📦 Exported Guide-Student Sticky Notes packet (.json)!');
  };

  // Import annotations JSON packet from Guide or Student
  const handleImportAnnotationsJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const importedList: DissertationAnnotation[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.annotations)
            ? parsed.annotations
            : [];
        if (importedList.length > 0) {
          const existingIds = new Set(annotations.map(a => a.id));
          const merged = [
            ...importedList.filter(a => !existingIds.has(a.id)),
            ...annotations
          ];
          saveAndPropagate(merged);
          triggerLocalToast(`✅ Imported ${importedList.length} Sticky Notes & Highlights!`);
        }
      } catch {
        triggerLocalToast('⚠️ Could not parse Sticky Notes JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Copy all feedback as a structured revision checklist for WhatsApp / Email
  const handleCopyReviewSummary = async () => {
    if (annotations.length === 0) return;
    const summary =
      `📋 *YADAV MD/MS THESIS STUDIO — GUIDE & CANDIDATE STICKY NOTES*\n` +
      `*Thesis:* ${project.title}\n` +
      `*Candidate:* Dr. ${project.candidateName} | *Guide:* ${project.guideName}\n` +
      `*Total Sticky Notes & Highlights:* ${annotations.length}\n\n` +
      annotations.map((a, i) => (
        `*${i + 1}. [${COLOR_CONFIG[a.color].label}] — ${a.chapterName}* (${STATUS_BADGES[a.status || 'open'].label})\n` +
        `• Reviewer: ${a.author || 'Reviewer'} (${a.createdAt})\n` +
        (a.selectedText ? `• Highlighted Text: "${a.selectedText}"\n` : '') +
        `• Sticky Note: ${a.note}\n` +
        (a.replies && a.replies.length > 0
          ? a.replies.map(r => `   ↳ Reply (${r.author}): ${r.text}`).join('\n') + '\n'
          : '')
      )).join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      triggerLocalToast('📋 Complete Sticky Notes & Guide Review Checklist copied for WhatsApp / Email!');
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  // Scroll to a chapter & focus an annotation when clicked in the drawer
  const scrollToAnnotationOnPage = (ann: DissertationAnnotation) => {
    setPreviewMode('reader');
    setActiveFocusedAnnotationId(ann.id);
    if (ann.chapterId) {
      const el = document.getElementById(`preview-chapter-${ann.chapterId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Helper to render text with MULTIPLE highlighted sections per paragraph in the A4 reader
  const renderHighlightedContent = (content: string, chapterId: string) => {
    const clean = cleanMarkdownForPdf(content);
    const chapterAnnotations = annotations.filter(
      a => a.chapterId === chapterId && a.selectedText && a.selectedText.trim().length > 1
    );

    const paragraphs = clean.split('\n\n');

    return (
      <div className="space-y-3.5">
        {paragraphs.map((para, pIdx) => {
          if (chapterAnnotations.length === 0) {
            return <p key={pIdx} className="leading-relaxed text-justify">{para}</p>;
          }

          // Find all annotations whose selectedText appears in this paragraph
          const matchingAnns = chapterAnnotations.filter(ann =>
            ann.selectedText && para.toLowerCase().includes(ann.selectedText.toLowerCase())
          );

          if (matchingAnns.length === 0) {
            return <p key={pIdx} className="leading-relaxed text-justify">{para}</p>;
          }

          // Build a combined regex for all matched phrases (longest first so substrings don't clobber)
          const sortedAnns = [...matchingAnns].sort(
            (a, b) => (b.selectedText?.length || 0) - (a.selectedText?.length || 0)
          );
          const pattern = sortedAnns
            .map(a => a.selectedText!.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
            .join('|');
          const regex = new RegExp(`(${pattern})`, 'gi');
          const parts = para.split(regex);

          return (
            <p key={pIdx} className="leading-relaxed text-justify">
              {parts.map((part, partIdx) => {
                const matchedAnn = sortedAnns.find(
                  a => a.selectedText && a.selectedText.toLowerCase() === part.toLowerCase()
                );

                if (matchedAnn) {
                  const colCfg = COLOR_CONFIG[matchedAnn.color] || COLOR_CONFIG.yellow;
                  const isFocused = activeFocusedAnnotationId === matchedAnn.id;
                  return (
                    <mark
                      key={partIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFocusedAnnotationId(matchedAnn.id);
                        setShowNotesDrawer(true);
                      }}
                      className={`${colCfg.bg} ${colCfg.text} px-1.5 py-0.5 rounded-xs border-b-2 ${colCfg.border} font-medium cursor-pointer relative group transition-all ${
                        isFocused ? 'ring-2 ring-slate-900 shadow-sm' : 'hover:brightness-95'
                      }`}
                    >
                      {part}
                      <span className="ml-1 inline-flex items-center px-1 py-0.2 rounded bg-slate-900/80 text-white text-[9px] font-sans font-bold align-middle">
                        📌 {(matchedAnn.replies?.length || 0) + 1}
                      </span>

                      {/* Hover Sticky Preview Popover */}
                      <span className="hidden group-hover:block absolute left-0 bottom-full mb-1.5 w-64 p-2.5 rounded-lg shadow-xl border border-slate-300 bg-amber-50 text-slate-900 text-[11px] font-sans z-30 pointer-events-none">
                        <span className="flex items-center justify-between font-bold text-[10px] text-amber-900 border-b border-amber-200 pb-1 mb-1">
                          <span>{colCfg.label}</span>
                          <span>{STATUS_BADGES[matchedAnn.status || 'open'].label}</span>
                        </span>
                        <span className="block font-medium text-slate-800 leading-snug">
                          {matchedAnn.note}
                        </span>
                        <span className="block text-[9px] text-slate-500 mt-1">
                          — {matchedAnn.author} • Click to open sticky thread
                        </span>
                      </span>
                    </mark>
                  );
                }

                return <React.Fragment key={partIdx}>{part}</React.Fragment>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  const filteredAnnotations = annotations.filter(a => {
    const chMatch = filterChapter === 'all' || a.chapterId === filterChapter;
    const stMatch = filterStatus === 'all' || (a.status || 'open') === filterStatus;
    return chMatch && stMatch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-sky-950/45 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3">
      <div className="bg-gradient-to-br from-sky-50 via-white to-amber-50 rounded-xl shadow-2xl border-2 border-sky-300 w-full max-w-[1400px] h-[95vh] flex flex-col overflow-hidden relative">

        {/* Local Toast Notification */}
        {shareToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-sky-100 via-amber-100 to-yellow-100 text-slate-900 px-4 py-2.5 rounded-full shadow-2xl border-2 border-amber-400 text-xs font-bold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* Floating Contextual Text Selection Highlighter & Sticky Note Bar */}
        {selectionPopup && selectionPopup.visible && (
          <div
            style={{ left: `${selectionPopup.x}px`, top: `${selectionPopup.y}px` }}
            className="fixed z-50 -translate-x-1/2 -translate-y-full bg-gradient-to-br from-sky-100 via-white to-amber-100 text-slate-900 p-3 rounded-xl shadow-2xl border-2 border-amber-400 w-80 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-amber-300 pb-1.5">
              <span className="text-[11px] font-bold text-sky-900 flex items-center space-x-1.5">
                <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                <span>Highlight &amp; Pin Sticky Note</span>
              </span>
              <button
                onClick={() => setSelectionPopup(null)}
                className="text-slate-500 hover:text-slate-900 text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-[10px] text-slate-700 italic line-clamp-2 bg-amber-50/90 px-2 py-1 rounded border border-amber-200">
              "{selectionPopup.text}"
            </div>

            {/* Color Swatches */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-700 font-semibold">Highlight Color:</span>
              <div className="flex items-center space-x-1.5">
                {(Object.keys(COLOR_CONFIG) as Array<DissertationAnnotation['color']>).map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectionPopup({ ...selectionPopup, color: col })}
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-transform ${COLOR_CONFIG[col].badge} ${
                      selectionPopup.color === col ? 'scale-125 border-sky-900' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                    title={COLOR_CONFIG[col].label}
                  />
                ))}
              </div>
            </div>

            {/* Quick Sticky Note Comment */}
            <input
              type="text"
              value={selectionPopup.quickNote}
              onChange={(e) => setSelectionPopup({ ...selectionPopup, quickNote: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFromSelectionPopup();
              }}
              placeholder={`Add ${ activePersona === 'guide' ? 'Guide feedback' : 'sticky note' } (or press Enter)...`}
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleCreateFromSelectionPopup(selectionPopup.color, false)}
                className="flex-1 py-1.5 px-2 bg-sky-100 hover:bg-sky-200 text-sky-950 rounded-lg text-[11px] font-semibold cursor-pointer border border-sky-300"
              >
                Highlight Only
              </button>
              <button
                type="button"
                onClick={() => handleCreateFromSelectionPopup(selectionPopup.color, true)}
                className="flex-1 py-1.5 px-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs border border-amber-500"
              >
                <Pin className="w-3 h-3" />
                <span>Highlight + Sticky</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Top Collaboration Bar — Light Sky Blue & Warm Yellow */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-sky-200 via-sky-100 to-amber-100 text-slate-900 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-300 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-300/80 text-amber-950 rounded-xl border border-amber-400 shadow-xs">
              <Highlighter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight font-serif text-sky-950">
                  PDF Preview, Highlighter &amp; Guide Sticky Notes Studio
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold">
                  Auto-Synced
                </span>
              </div>
              <p className="text-[11px] text-sky-900 font-medium">
                Select text to highlight or drop draggable Post-it Sticky Notes on any page to collaborate with your Thesis Guide.
              </p>
            </div>
          </div>

          {/* Active Persona Switcher (Guide vs Student) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white/90 border border-sky-300 p-0.5 rounded-lg text-[11px] shadow-2xs">
              <span className="px-2 text-sky-900 font-bold hidden xl:inline">Role:</span>
              <button
                onClick={() => handlePersonaSwitch('guide')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activePersona === 'guide' ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                👨‍🏫 Thesis Guide
              </button>
              <button
                onClick={() => handlePersonaSwitch('candidate')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activePersona === 'candidate' ? 'bg-sky-500 text-white shadow-2xs' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                🩺 PG Candidate
              </button>
              <button
                onClick={() => handlePersonaSwitch('examiner')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activePersona === 'examiner' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                🎓 Examiner
              </button>
            </div>

            {/* Pin Sticky Note on Page Mode Button */}
            {previewMode === 'reader' && (
              <button
                onClick={() => setPinStickyMode(!pinStickyMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                  pinStickyMode
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md scale-105'
                    : 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200'
                }`}
                title="Click anywhere on an A4 page to pin a draggable Sticky Note"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{pinStickyMode ? 'Click Any Page to Drop Note...' : 'Pin Sticky Note on Page'}</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/90 border border-sky-300 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPreviewMode('reader')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  previewMode === 'reader' ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                Interactive A4 &amp; Sticky Notes
              </button>
              <button
                onClick={() => setPreviewMode('interactive')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  previewMode === 'interactive' ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                Compiled React-PDF
              </button>
            </div>

            {/* Toggle Notes Drawer */}
            <button
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                showNotesDrawer 
                  ? 'bg-amber-300 text-slate-950 border-amber-500 shadow-2xs' 
                  : 'bg-white text-slate-800 border-sky-300 hover:bg-amber-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>Sticky Notes</span>
              <span className="ml-1 bg-sky-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {annotations.length}
              </span>
            </button>

            {/* Direct Download via BlobProvider */}
            <BlobProvider document={<ThesisPdfDocument project={project} includeAnnotationsInPdf={includeAnnotationsInPdf} />}>
              {({ url, loading }) => (
                <a
                  href={url || '#'}
                  download={`${project.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Annotated_Dissertation.pdf`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs ${
                    loading ? 'bg-slate-200 text-slate-500 pointer-events-none' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Building PDF...</span>
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
              className="text-slate-700 hover:text-slate-950 p-1.5 rounded-lg bg-white/80 hover:bg-amber-200 border border-sky-300 text-sm font-bold cursor-pointer"
              title="Close Preview"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body: Split between A4 Preview Canvas and Collaboration Sticky Notes Drawer */}
        <div className="flex-1 bg-gradient-to-br from-sky-100/90 via-amber-50/70 to-blue-100/90 overflow-hidden flex relative">
          
          {/* Main Document Preview Area */}
          <div className="flex-1 h-full overflow-hidden relative">
            {previewMode === 'interactive' ? (
              <div className="w-full h-full flex flex-col">
                <div className="bg-gradient-to-r from-sky-100 via-amber-50 to-yellow-100 text-slate-900 px-4 py-2 text-xs flex items-center justify-between border-b border-amber-300">
                  <div className="flex items-center space-x-2 font-semibold text-sky-950">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Compiled React-PDF Preview ({annotations.length} Guide &amp; Candidate Sticky Notes embedded inside PDF chapters)
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer text-amber-950 font-bold bg-amber-200/70 px-2.5 py-1 rounded-md border border-amber-400">
                    <input
                      type="checkbox"
                      checked={includeAnnotationsInPdf}
                      onChange={(e) => setIncludeAnnotationsInPdf(e.target.checked)}
                      className="rounded border-amber-500"
                    />
                    <span>Include Sticky Notes &amp; Highlights in Compiled PDF</span>
                  </label>
                </div>
                <div className="flex-1">
                  <PDFViewer width="100%" height="100%" showToolbar={true} className="border-0">
                    <ThesisPdfDocument project={project} includeAnnotationsInPdf={includeAnnotationsInPdf} />
                  </PDFViewer>
                </div>
              </div>
            ) : (
              /* Styled Paged A4 Reader View with Text Highlighting & Draggable On-Page Sticky Notes */
              <div 
                ref={readerScrollRef}
                className={`h-full overflow-y-auto p-4 sm:p-8 flex flex-col items-center space-y-8 select-text ${
                  pinStickyMode ? 'cursor-crosshair' : ''
                }`}
              >
                {/* Top Instruction & Chapter Quick-Jump Bar */}
                <div className="bg-gradient-to-r from-sky-100 via-amber-100 to-yellow-100 text-slate-900 text-xs px-4 py-2.5 rounded-xl shadow-md border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 w-full max-w-[740px] sticky top-1 z-30 backdrop-blur-xs">
                  <div className="flex items-center space-x-2 font-semibold text-sky-950">
                    <Highlighter className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {pinStickyMode
                        ? '📌 Click anywhere on any A4 page below to drop a Sticky Note at that exact position!'
                        : 'Select any text on the A4 pages to highlight, or drag pinned Sticky Notes around the margins.'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 overflow-x-auto">
                    <button
                      onClick={() => setShowHardboundAndTablesIndex(!showHardboundAndTablesIndex)}
                      className={`px-2.5 py-0.5 border rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        showHardboundAndTablesIndex
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : 'bg-white text-slate-700 border-sky-300 hover:bg-amber-50'
                      }`}
                      title="Toggle Hardbound Rexine Cover, Gold Spine & List of Tables Preview"
                    >
                      {showHardboundAndTablesIndex ? '✓ Hardbound Spine & List of Tables' : '+ Show Hardbound & List of Tables'}
                    </button>
                    {project.chapters.map((ch, idx) => (
                      <button
                        key={ch.id}
                        onClick={() => {
                          const el = document.getElementById(`preview-chapter-${ch.id}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-sky-600 text-sky-950 hover:text-white border border-sky-300 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors"
                      >
                        Ch {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* University Hardbound Rexine Cover + Vertical Gold-Foil Spine Visual Inspection Card */}
                {showHardboundAndTablesIndex && (
                  <div className="w-full max-w-[720px] bg-white rounded-xl shadow-xl border-2 border-amber-300 p-5 shrink-0 font-sans">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-amber-200">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          University Hardbound Rexine &amp; Gold-Foil Spine Proof
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          {rexineTheme.name} ({rexineTheme.hexCode})
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        100 GSM Executive Bond • 1.5&quot; Left Margin • 5 Hardbound Copies
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-4">
                      {/* Vertical Book Spine Mockup */}
                      <div
                        className={`sm:w-16 ${rexineTheme.spineBgClass} border-2 ${rexineTheme.borderClass} rounded-lg p-2.5 flex sm:flex-col items-center justify-between text-amber-300 shadow-inner shrink-0`}
                      >
                        <span className="text-[9px] font-serif font-extrabold tracking-widest uppercase text-center border-b border-amber-400/40 pb-1">
                          {project.specialty.split(' ')[0] || 'MD/MS'}
                        </span>
                        <span className="text-[10px] font-serif font-bold tracking-wider uppercase sm:[writing-mode:vertical-rl] sm:rotate-180 py-2 text-amber-200 text-center">
                          DR. {(project.candidateName || 'CANDIDATE').toUpperCase()} • {project.title.slice(0, 38).toUpperCase()}...
                        </span>
                        <span className="text-[9px] font-mono font-bold text-amber-300 border-t border-amber-400/40 pt-1">
                          {project.academicYear || '2024-26'}
                        </span>
                      </div>

                      {/* Hardbound Front Board Gold-Foil Embossed Preview */}
                      <div
                        className={`flex-1 bg-gradient-to-br ${rexineTheme.bgClass} border-2 ${rexineTheme.borderClass} rounded-lg p-6 text-center text-amber-200 font-serif shadow-lg flex flex-col justify-between min-h-[250px]`}
                      >
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                            {project.university}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-amber-200/80 mt-0.5">
                            {project.collegeName}
                          </p>
                        </div>

                        <div className="my-4 py-3 border-y border-amber-400/40">
                          <p className="text-[10px] italic text-amber-100/80">DISSERTATION ON</p>
                          <p className="text-sm font-bold text-amber-300 leading-snug mt-1 uppercase">
                            &ldquo;{project.title}&rdquo;
                          </p>
                          <p className="text-[11px] font-bold text-amber-200 mt-2 uppercase tracking-wider">
                            {project.specialty}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-amber-200/90 font-sans pt-1">
                          <div className="text-left">
                            <span className="block text-[9px] text-amber-300/70 uppercase">Candidate:</span>
                            <span className="font-bold text-amber-200">DR. {project.candidateName.toUpperCase()}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[9px] text-amber-300/70 uppercase">Chief Guide:</span>
                            <span className="font-bold text-amber-200">{project.guideName.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Page */}
                <div className="w-full max-w-[720px] min-h-[960px] bg-white shadow-xl rounded-sm border border-slate-300 p-12 sm:p-16 flex flex-col justify-between text-center font-serif text-slate-800 shrink-0 relative">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      {project.university}
                    </h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                      Dissertation for Postgraduate Medical Degree
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
                      <span className="text-slate-500 block">Under the Guidance &amp; Supervision of:</span>
                      <span className="text-sm font-bold text-slate-900 block mt-0.5">{project.guideName}</span>
                      <span className="text-slate-500 block text-[11px]">Professor &amp; Head of Department</span>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                      <p className="font-bold text-slate-900 text-sm">{project.collegeName}</p>
                      <p className="text-slate-500 mt-1">Academic Session: {project.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* Automated List of Tables & Clinical Figures (Roman Numeral Page iv) */}
                {showHardboundAndTablesIndex && (
                  <div className="w-full max-w-[720px] bg-white shadow-xl rounded-sm border border-slate-300 p-10 sm:p-14 flex flex-col justify-between font-serif text-slate-800 shrink-0 relative">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200 pb-2 mb-6 font-sans">
                        <span>FRONT MATTER • LIST OF TABLES &amp; FIGURES</span>
                        <span>ROMAN PAGE iv</span>
                      </div>

                      <div className="pb-2.5 border-b-2 border-emerald-600 mb-5">
                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                          List of Statistical Tables &amp; Clinical Figures
                        </h2>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">
                          Automatically indexed across Chapters 1–{project.chapters.length} ({extractedTables.length} Tables detected)
                        </p>
                      </div>

                      {extractedTables.length === 0 ? (
                        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center font-sans text-xs text-slate-600">
                          No Markdown statistical tables detected yet in your chapters. Insert tables via the <strong>Biostats &amp; Master Chart</strong> tab or <strong>Writer &amp; Checker Suite</strong> to auto-populate this index.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 font-sans text-xs">
                          {extractedTables.map((tb, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                const el = document.getElementById(`preview-chapter-${tb.chapterId}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              className="py-2.5 flex items-center justify-between gap-3 hover:bg-sky-50/80 px-2 rounded cursor-pointer transition-colors"
                              title="Click to scroll directly to this table's chapter"
                            >
                              <div>
                                <span className="font-mono font-extrabold text-sky-900 mr-2">
                                  {tb.tableNumber}:
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {tb.title}
                                </span>
                                <span className="block text-[10px] text-slate-500 mt-0.5">
                                  {tb.chapterName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                {tb.rowCount}×{tb.colCount} • Jump →
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 mt-8 font-sans flex items-center justify-between">
                      <span>{project.university}</span>
                      <span>Page iv (Front Matter)</span>
                    </div>
                  </div>
                )}

                {/* Individual Chapters with On-Page Pinned Sticky Notes */}
                {project.chapters.map((ch, idx) => {
                  const pageStickies = annotations.filter(
                    a => a.chapterId === ch.id && (a.isStickyOnPage !== false)
                  );

                  return (
                    <div 
                      key={ch.id} 
                      id={`preview-chapter-${ch.id}`}
                      onMouseUp={(e) => {
                        handlePageMouseUpDrag();
                        handleChapterMouseUp(e, ch.id);
                      }}
                      onMouseMove={(e) => handlePageMouseMove(e, ch.id)}
                      onClick={(e) => handlePageClickForPin(e, ch.id)}
                      className="w-full max-w-[720px] min-h-[960px] bg-white shadow-xl rounded-sm border border-slate-300 p-10 sm:p-16 flex flex-col justify-between font-serif text-slate-800 shrink-0 relative"
                    >
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200 pb-2 mb-6 font-sans">
                          <span>YADAV MD/MS THESIS STUDIO • MANUSCRIPT PROOF</span>
                          <span>CHAPTER {idx + 1}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-emerald-600 mb-6">
                          <h2 className="text-lg font-bold text-slate-900">
                            {ch.name}
                          </h2>
                          <div className="flex items-center space-x-1.5 font-sans">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewChapterId(ch.id);
                                setNewIsStickyOnPage(true);
                                setIsAddingNote(true);
                                setShowNotesDrawer(true);
                              }}
                              className="text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md border border-amber-300 flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Pin className="w-3 h-3 text-amber-700" />
                              <span>+ Sticky Note</span>
                            </button>
                            {onJumpToChapter && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onJumpToChapter(ch.id);
                                }}
                                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1 cursor-pointer transition-colors"
                                title="Edit this chapter in Manuscript Editor"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Edit Chapter</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-sans leading-relaxed text-slate-700">
                          {renderHighlightedContent(ch.content, ch.id)}
                        </div>
                      </div>

                      {/* Render Draggable On-Page Post-It Sticky Notes */}
                      {pageStickies.map((sticky, sIdx) => {
                        const col = COLOR_CONFIG[sticky.color] || COLOR_CONFIG.yellow;
                        const topPct = sticky.pageY ?? (18 + (sIdx * 15) % 65);
                        const leftPct = sticky.pageX ?? 58;
                        const isFocused = activeFocusedAnnotationId === sticky.id;

                        if (sticky.minimized) {
                          return (
                            <button
                              key={sticky.id}
                              type="button"
                              style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleMinimizeSticky(sticky.id);
                                setActiveFocusedAnnotationId(sticky.id);
                              }}
                              className={`absolute z-20 ${col.stickyHeader} ${col.text} border-2 ${col.border} px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1 text-[11px] font-sans font-bold cursor-pointer hover:scale-105 transition-transform`}
                              title={`Expand Sticky Note by ${sticky.author}`}
                            >
                              <Pin className="w-3 h-3" />
                              <span>Note #{sIdx + 1}</span>
                            </button>
                          );
                        }

                        return (
                          <div
                            key={sticky.id}
                            style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFocusedAnnotationId(sticky.id);
                            }}
                            className={`absolute z-20 w-60 rounded-lg shadow-xl border ${col.border} ${col.stickyBg} font-sans text-left transition-shadow select-none ${
                              isFocused ? 'ring-2 ring-slate-900 z-30' : ''
                            }`}
                          >
                            {/* Sticky Note Drag Handle Header */}
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingStickyId(sticky.id);
                                setActiveFocusedAnnotationId(sticky.id);
                              }}
                              className={`${col.stickyHeader} px-2.5 py-1.5 rounded-t-lg border-b ${col.border} flex items-center justify-between cursor-move`}
                              title="Drag to move Sticky Note anywhere on this page"
                            >
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${col.text} flex items-center space-x-1`}>
                                <Pin className="w-3 h-3" />
                                <span>{col.label}</span>
                              </span>
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleMinimizeSticky(sticky.id);
                                  }}
                                  className="text-slate-600 hover:text-slate-950 p-0.5 cursor-pointer"
                                  title="Minimize Sticky Note to Pin"
                                >
                                  <Minimize2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAnnotation(sticky.id);
                                  }}
                                  className="text-slate-600 hover:text-red-600 p-0.5 cursor-pointer"
                                  title="Delete Sticky Note"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Sticky Note Body */}
                            <div className="p-2.5 space-y-1.5">
                              {sticky.selectedText && (
                                <div className="text-[10px] italic text-slate-700 bg-white/75 px-1.5 py-1 rounded border border-black/10 line-clamp-2">
                                  "{sticky.selectedText}"
                                </div>
                              )}
                              <p className="text-[11px] font-medium text-slate-900 leading-snug">
                                {sticky.note}
                              </p>

                              {/* Threaded Replies Preview inside On-Page Sticky */}
                              {sticky.replies && sticky.replies.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-black/10">
                                  {sticky.replies.map(rep => (
                                    <div key={rep.id} className="text-[10px] bg-white/80 px-1.5 py-1 rounded text-slate-800">
                                      <span className="font-bold">{rep.author.split(' ')[0]}: </span>
                                      <span>{rep.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[9px] text-slate-600">
                                <span className="font-semibold truncate max-w-[120px]">{sticky.author}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCycleStatus(sticky.id);
                                  }}
                                  className={`px-1.5 py-0.5 rounded border font-bold cursor-pointer ${
                                    STATUS_BADGES[sticky.status || 'open'].classes
                                  }`}
                                  title="Click to cycle status (Open -> Addressed -> Guide Approved)"
                                >
                                  {STATUS_BADGES[sticky.status || 'open'].label}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 mt-8 font-sans flex items-center justify-between">
                        <span>{project.university}</span>
                        <span>Page {idx + 2} • {pageStickies.length} Sticky Note(s) on Page</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Guide-Candidate Collaboration & Sticky Notes Drawer */}
          {showNotesDrawer && (
            <div className="w-96 sm:w-[410px] bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-20 shrink-0">
              
              {/* Drawer Header — Light Sky Blue & Warm Yellow */}
              <div className="p-3.5 border-b-2 border-amber-300 bg-gradient-to-r from-sky-100 via-amber-100 to-yellow-100 text-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pin className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider block text-sky-950">
                      Guide &amp; Student Sticky Notes ({annotations.length})
                    </span>
                    <span className="text-[10px] text-sky-800 font-medium">
                      Click any note to locate on PDF or reply in thread
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleCopyReviewSummary}
                    className="p-1.5 text-sky-900 hover:bg-amber-200/70 rounded-lg cursor-pointer text-xs flex items-center space-x-1"
                    title="Copy all Sticky Notes for WhatsApp / Email to Guide"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                  <button
                    onClick={handleExportAnnotationsJson}
                    className="p-1.5 text-sky-900 hover:bg-amber-200/70 rounded-lg cursor-pointer text-xs"
                    title="Export Sticky Notes Packet (.json) to share with Guide"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-sky-900 hover:bg-amber-200/70 rounded-lg cursor-pointer text-xs"
                    title="Import Guide's Sticky Notes Packet (.json)"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportAnnotationsJson}
                    className="hidden"
                  />
                  <button
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Note</span>
                  </button>
                </div>
              </div>

              {/* Add Note Form */}
              {isAddingNote && (
                <div className="p-4 bg-amber-50/70 border-b border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                      <Pin className="w-3.5 h-3.5 text-amber-600" />
                      <span>New Highlight / Sticky Note</span>
                    </span>
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Target Chapter */}
                  <div className="grid grid-cols-2 gap-2">
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

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Author / Role:</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quoted / Selected Text */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Highlighted Text Passage (Optional):
                    </label>
                    <input
                      type="text"
                      value={selectedText}
                      onChange={(e) => setSelectedText(e.target.value)}
                      placeholder="Select text on page or type phrase to highlight..."
                      className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none italic"
                    />
                  </div>

                  {/* Highlight Color / Purpose */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Sticky Color &amp; Tag:</label>
                      <div className="flex space-x-2">
                        {(Object.keys(COLOR_CONFIG) as Array<DissertationAnnotation['color']>).map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setNewColor(col)}
                            className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${COLOR_CONFIG[col].badge} ${
                              newColor === col ? 'scale-125 border-slate-900 shadow-xs' : 'border-white opacity-70'
                            }`}
                            title={COLOR_CONFIG[col].label}
                          />
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center space-x-1.5 text-[11px] font-semibold text-amber-900 bg-amber-100/80 px-2.5 py-1.5 rounded border border-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsStickyOnPage}
                        onChange={(e) => setNewIsStickyOnPage(e.target.checked)}
                        className="rounded border-amber-400"
                      />
                      <span>Pin Sticky on A4 Page</span>
                    </label>
                  </div>

                  {/* Note comment */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Sticky Note Comment / Guide Action Item:
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write Guide feedback, statistical query, citation reminder, or revision note..."
                      rows={3}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddAnnotation()}
                      disabled={!newNote.trim() && !selectedText.trim()}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                    >
                      Save Sticky Note
                    </button>
                  </div>
                </div>
              )}

              {/* Filter by Chapter & Status */}
              <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterChapter}
                    onChange={(e) => setFilterChapter(e.target.value)}
                    className="text-[11px] p-1 bg-white border border-slate-200 rounded max-w-[165px]"
                  >
                    <option value="all">All Chapters ({annotations.length})</option>
                    {project.chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-[11px] p-1 bg-white border border-slate-200 rounded"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open Action</option>
                  <option value="in_progress">Addressed by Student</option>
                  <option value="resolved">Guide Approved ✓</option>
                </select>
              </div>

              {/* Sticky Notes & Highlights Feed */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                {filteredAnnotations.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 space-y-2">
                    <Pin className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No sticky notes or highlights match this filter</p>
                    <p className="text-[11px] text-slate-400 px-4">
                      Select any text on the A4 PDF preview to highlight it, or click "Pin Sticky Note on Page" in the top bar.
                    </p>
                  </div>
                ) : (
                  filteredAnnotations.map(item => {
                    const col = COLOR_CONFIG[item.color] || COLOR_CONFIG.yellow;
                    const statusObj = STATUS_BADGES[item.status || 'open'];
                    const isFocused = activeFocusedAnnotationId === item.id;

                    return (
                      <div 
                        key={item.id}
                        onClick={() => scrollToAnnotationOnPage(item)}
                        className={`p-3 rounded-xl border ${col.border} ${col.stickyBg} relative space-y-2 shadow-xs transition-all cursor-pointer ${
                          isFocused ? 'ring-2 ring-slate-900 shadow-md' : 'hover:shadow-md'
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${col.stickyHeader} ${col.text} border ${col.border}`}>
                              {col.label}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCycleStatus(item.id);
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${statusObj.classes}`}
                              title="Click to update review status"
                            >
                              {statusObj.label}
                            </button>
                          </div>

                          <div className="flex items-center space-x-1">
                            {onJumpToChapter && item.chapterId && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onJumpToChapter(item.chapterId!);
                                }}
                                className="text-[10px] font-semibold text-emerald-800 hover:underline px-1.5 py-0.5 bg-white/80 rounded border border-emerald-200 cursor-pointer"
                                title="Open chapter in editor to make changes"
                              >
                                Edit Ch
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAnnotation(item.id);
                              }}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              title="Delete Sticky Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Highlighted quote snippet */}
                        {item.selectedText && (
                          <div className="text-[11px] italic text-slate-800 bg-white/80 p-2 rounded-lg border border-amber-300/60 leading-snug flex items-start space-x-1.5">
                            <Highlighter className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>"{item.selectedText}"</span>
                          </div>
                        )}

                        {/* Main Sticky Note text */}
                        <p className="text-xs text-slate-900 font-medium leading-relaxed">
                          {item.note}
                        </p>

                        {/* Metadata line */}
                        <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-black/10">
                          <span className="font-bold text-slate-800">{item.chapterName}</span>
                          <span>{item.author} • {item.createdAt}</span>
                        </div>

                        {/* Threaded Guide <-> Student Replies */}
                        {item.replies && item.replies.length > 0 && (
                          <div className="space-y-1.5 pt-1.5 border-t border-black/10">
                            {item.replies.map(rep => (
                              <div key={rep.id} className="bg-white/85 p-2 rounded-lg border border-black/5 text-[11px]">
                                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                                  <span className="font-bold text-slate-800">{rep.author}</span>
                                  <span>{rep.createdAt}</span>
                                </div>
                                <p className="text-slate-700 leading-snug">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick Reply Input for Guide / Student Collaboration */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1.5 pt-1"
                        >
                          <input
                            type="text"
                            value={replyDrafts[item.id] || ''}
                            onChange={(e) => setReplyDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddReply(item.id);
                            }}
                            placeholder={`Reply as ${activePersona === 'guide' ? 'Guide' : 'Candidate'}...`}
                            className="flex-1 text-[11px] px-2.5 py-1 bg-white/90 border border-black/15 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddReply(item.id)}
                            className="p-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md cursor-pointer"
                            title="Post reply to Sticky Note thread"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer Collaboration Actions */}
              <div className="p-3 bg-gradient-to-r from-sky-100 to-amber-100 text-slate-800 border-t border-amber-300 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {annotations.filter(a => a.status === 'resolved').length}/{annotations.length} Resolved
                    </span>
                  </span>
                  <button
                    onClick={handleCopyReviewSummary}
                    className="text-sky-900 hover:text-sky-700 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3 text-amber-700" />
                    <span>Share Summary on WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer — Light Sky Blue & Warm Yellow */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-sky-200 via-sky-100 to-amber-100 border-t-2 border-amber-300 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-950 shrink-0">
          <div className="flex items-center space-x-2 font-semibold">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Guide-Candidate Collaborative Proofing • Select text to highlight or drag sticky notes on any A4 page.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const rowsHtml = annotations
                  .map((a, idx) => {
                    const statusLabel =
                      a.status === 'resolved'
                        ? '✓ GUIDE APPROVED'
                        : a.status === 'in_progress'
                          ? 'ADDRESSED BY RESIDENT'
                          : 'OPEN ACTION ITEM';
                    const repliesHtml =
                      a.replies && a.replies.length > 0
                        ? `<div style="margin-top:4pt;padding-top:3pt;border-top:0.5pt dashed #94a3b8;font-size:9pt;">` +
                          a.replies
                            .map(r => `<div><strong>${r.author}:</strong> ${r.text}</div>`)
                            .join('') +
                          `</div>`
                        : '';
                    return `
                    <tr>
                      <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
                      <td><strong>${a.chapterName || 'General Manuscript'}</strong><br/><span style="font-size:9pt;color:#475569;">${a.author || 'Guide'} (${a.createdAt})</span></td>
                      <td>${a.selectedText ? `<em style="color:#92400e;">"${a.selectedText}"</em><br/>` : ''}${a.note}${repliesHtml}</td>
                      <td style="text-align:center;font-weight:bold;color:${a.status === 'resolved' ? '#047857' : '#b45309'};">${statusLabel}</td>
                    </tr>`;
                  })
                  .join('');

                const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Guide-Candidate Dissertation Review & Corrections Log - ${project.candidateName}</title>
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
  <h1>${project.collegeName}</h1>
  <p style="text-align:center;font-weight:bold;margin-top:0;">Affiliated to ${project.university} • Department of ${project.specialty}</p>
  <h2 style="text-align:center;">GUIDE–CANDIDATE DISSERTATION PROOFING &amp; CORRECTIONS ACTION LOG</h2>
  <p><strong>Dissertation Title:</strong> <em>"${project.title}"</em><br/>
  <strong>Postgraduate Candidate:</strong> Dr. ${project.candidateName} &nbsp;|&nbsp; <strong>Chief Dissertation Guide:</strong> ${project.guideName}${project.coGuideName ? ` | <strong>Co-Guide:</strong> ${project.coGuideName}` : ''}<br/>
  <strong>Review Summary:</strong> ${annotations.filter(a => a.status === 'resolved').length} of ${annotations.length} Guide Annotations Resolved &amp; Approved</p>
  <table>
    <thead>
      <tr>
        <th style="width:6%;text-align:center;">#</th>
        <th style="width:24%;">Chapter &amp; Reviewer</th>
        <th style="width:52%;">Highlighted Passage, Guide Observation &amp; Resident Response</th>
        <th style="width:18%;text-align:center;">Verification Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="4" style="text-align:center;">All chapters verified with zero pending revisions.</td></tr>'}
    </tbody>
  </table>
  <br/>
  <p><strong>Signature of PG Candidate (Dr. ${project.candidateName}):</strong> ___________________________</p>
  <p><strong>Final Pre-Binding Approval Signature of Guide (${project.guideName}):</strong> ___________________________</p>
</body></html>`;
                const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Guide_Review_Corrections_Log_${project.candidateName.replace(/\s+/g, '_')}.doc`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Guide Review Report (.DOC)</span>
            </button>
            <button
              onClick={handleExportAnnotationsJson}
              className="px-3 py-1 bg-amber-300 border border-amber-500 rounded-lg font-bold text-slate-950 hover:bg-amber-200 flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Review Packet (.json)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-white border border-sky-300 rounded-lg font-bold text-sky-950 hover:bg-sky-50 flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Proof with Notes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
