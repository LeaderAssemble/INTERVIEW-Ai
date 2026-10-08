import jsPDF from 'jspdf';
import { InterviewSession, Feedback } from '../types';
import { format } from 'date-fns';

export async function generateSessionReport(
  session: InterviewSession,
  onProgress?: (percent: number) => void
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  onProgress?.(10);

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Interview Session Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  const categoryName = session.category.toUpperCase();
  doc.text(`Category: ${categoryName}`, 20, yPos);
  yPos += 7;

  const dateStr = format(new Date(session.startedAt), 'PPP pp');
  doc.text(`Date: ${dateStr}`, 20, yPos);
  yPos += 7;

  const durationMin = Math.floor(session.duration / 60);
  const durationSec = session.duration % 60;
  doc.text(`Duration: ${durationMin}m ${durationSec}s`, 20, yPos);
  yPos += 7;

  doc.text(`Questions Answered: ${session.answers.length}`, 20, yPos);
  yPos += 15;

  onProgress?.(20);

  doc.setDrawColor(226, 232, 240);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Overall Score', 20, yPos);
  yPos += 10;

  const score = session.overallScore || 0;
  const scoreColor = getScoreColorRgb(score);
  doc.setFontSize(36);
  doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
  doc.text(`${score}%`, 20, yPos);
  yPos += 15;

  if (session.feedbacks.length > 0) {
    const avgMetrics = calculateAverageMetrics(session.feedbacks);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Clarity: ${avgMetrics.clarity}%  |  Relevance: ${avgMetrics.relevance}%  |  Completeness: ${avgMetrics.completeness}%  |  Confidence: ${avgMetrics.confidence}%`, 20, yPos);
  }
  yPos += 20;

  onProgress?.(30);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Question Details', 20, yPos);
  yPos += 10;

  for (let i = 0; i < session.questions.length; i++) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const question = session.questions[i];
    const answer = session.answers[i];
    const feedback = session.feedbacks[i];

    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 8, 2, 2, 'S');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(`Question ${i + 1}`, 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    const questionLines = doc.splitTextToSize(question.text, pageWidth - 40);
    doc.text(questionLines, 20, yPos);
    yPos += questionLines.length * 5 + 5;

    if (answer) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text('Your Answer:', 20, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const answerLines = doc.splitTextToSize(answer.transcript, pageWidth - 40);
      doc.text(answerLines.slice(0, 5), 20, yPos);
      yPos += Math.min(answerLines.length, 5) * 4 + 8;
    }

    if (feedback) {
      doc.setFont('helvetica', 'bold');
      const feedbackColor = getScoreColorRgb(feedback.overallScore);
      doc.setTextColor(feedbackColor.r, feedbackColor.g, feedbackColor.b);
      doc.setFontSize(12);
      doc.text(`Score: ${feedback.overallScore}%`, 20, yPos);
      yPos += 10;
    }

    onProgress?.(30 + Math.round((i / session.questions.length) * 40));
    yPos += 5;
  }

  onProgress?.(80);

  if (session.feedbacks.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Key Improvements', 20, yPos);
    yPos += 10;

    const allImprovements = session.feedbacks.flatMap(f => f.improvements);
    const topImprovements = [...new Set(allImprovements)].slice(0, 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);

    topImprovements.forEach((improvement) => {
      const lines = doc.splitTextToSize(`\u2022 ${improvement}`, pageWidth - 45);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 25, yPos);
        yPos += 6;
      });
      yPos += 2;
    });

    yPos += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Strengths', 20, yPos);
    yPos += 10;

    const allStrengths = session.feedbacks.flatMap(f => f.strengths);
    const topStrengths = [...new Set(allStrengths)].slice(0, 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);

    topStrengths.forEach((strength) => {
      const lines = doc.splitTextToSize(`\u2022 ${strength}`, pageWidth - 45);
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 25, yPos);
        yPos += 6;
      });
      yPos += 2;
    });
  }

  onProgress?.(90);

  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by InterviewAI - Mock Interview Platform', pageWidth / 2, footerY, { align: 'center' });
  doc.text(format(new Date(), 'PPP'), pageWidth / 2, footerY + 5, { align: 'center' });

  const fileName = `interview-report-${session.category}-${format(new Date(session.startedAt), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);

  onProgress?.(100);
}

function getScoreColorRgb(score: number): { r: number; g: number; b: number } {
  if (score >= 85) return { r: 34, g: 197, b: 94 };
  if (score >= 70) return { r: 59, g: 130, b: 246 };
  if (score >= 55) return { r: 251, g: 146, b: 60 };
  return { r: 239, g: 68, b: 68 };
}

function calculateAverageMetrics(feedbacks: Feedback[]): {
  clarity: number;
  relevance: number;
  completeness: number;
  confidence: number;
} {
  const avg = {
    clarity: 0,
    relevance: 0,
    completeness: 0,
    confidence: 0,
  };

  feedbacks.forEach(f => {
    avg.clarity += f.clarity;
    avg.relevance += f.relevance;
    avg.completeness += f.completeness;
    avg.confidence += f.confidence;
  });

  const len = feedbacks.length;
  return {
    clarity: Math.round(avg.clarity / len),
    relevance: Math.round(avg.relevance / len),
    completeness: Math.round(avg.completeness / len),
    confidence: Math.round(avg.confidence / len),
  };
}
