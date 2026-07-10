import type { jsPDF } from 'jspdf'

export interface PdfQuestion {
  text: string
  answer: string
  tone: 'positive' | 'negative' | 'neutral'
}

export interface PdfSection {
  title: string
  answered: number
  total: number
  questions: PdfQuestion[]
}

export interface PdfMetaItem {
  label: string
  value: string
  // Rendered smaller and non-bold (e.g. secondary dates)
  small?: boolean
}

export interface AssessmentPdfData {
  fileName: string
  reportTitle: string
  associationName: string
  associationLogo: string | null
  conafohdLogo: string | null
  radarImage: string | null
  meta: PdfMetaItem[]
  sectionsHeading: string
  sections: PdfSection[]
  footerText: string
}

const BLUE: [number, number, number] = [50, 92, 142]
const INK: [number, number, number] = [30, 41, 59]
const SLATE: [number, number, number] = [71, 85, 105]
const MUTED: [number, number, number] = [148, 163, 184]
const GREEN: [number, number, number] = [34, 139, 87]
const RED: [number, number, number] = [200, 60, 60]
const LINE: [number, number, number] = [226, 232, 240]

/**
 * Builds the finalized-assessment report as a vector PDF (selectable, crisp
 * text) entirely client-side. Layout is drawn with jsPDF primitives; the radar
 * chart and logos are embedded as images provided by the caller.
 */
export class AssessmentPdfService {
  static async generate(data: AssessmentPdfData): Promise<void> {
    // Load the (heavy) PDF library on demand so it is code-split out of the
    // main bundle and only fetched when a user actually exports a report.
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 40
    const contentW = pageW - margin * 2

    let y = margin

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - margin) {
        AssessmentPdfService.addFooter(doc, data.footerText, pageW, pageH, margin)
        doc.addPage()
        y = margin
      }
    }

    // ---- Header band: logos (both left-aligned) + association name --------
    const logoH = 46
    if (data.conafohdLogo) {
      AssessmentPdfService.tryImage(doc, data.conafohdLogo, margin, y, 110, logoH)
    }
    if (data.associationLogo) {
      AssessmentPdfService.tryImage(doc, data.associationLogo, margin + 122, y, 110, logoH)
    }

    y += logoH + 18
    // Shrink the association name to fit the content width (long NGO names)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK)
    let nameSize = 12
    doc.setFontSize(nameSize)
    while (doc.getTextWidth(data.associationName) > contentW && nameSize > 9) {
      nameSize -= 0.5
      doc.setFontSize(nameSize)
    }
    const nameLines = doc.splitTextToSize(data.associationName, contentW) as string[]
    doc.text(nameLines, margin, y)
    y += (nameLines.length - 1) * (nameSize + 2)

    y += 8
    doc.setDrawColor(...LINE)
    doc.setLineWidth(1)
    doc.line(margin, y, pageW - margin, y)

    // ---- Report title -----------------------------------------------------
    y += 28
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...BLUE)
    doc.text(data.reportTitle, margin, y)

    // ---- Meta strip (card) ------------------------------------------------
    y += 22
    const metaPadX = 16
    const metaPadY = 14
    const colGap = 12
    const colW = (contentW - metaPadX * 2 - colGap * (data.meta.length - 1)) / data.meta.length
    let maxValueLines = 1
    const metaValueLines = data.meta.map((item) => {
      doc.setFont('helvetica', item.small ? 'normal' : 'bold')
      doc.setFontSize(item.small ? 9.5 : 12)
      const lines = doc.splitTextToSize(item.value, colW) as string[]
      maxValueLines = Math.max(maxValueLines, lines.length)
      return lines
    })
    const metaCardH = metaPadY * 2 + 10 + 6 + maxValueLines * 14
    ensureSpace(metaCardH + 12)
    AssessmentPdfService.card(doc, margin, y, contentW, metaCardH)
    data.meta.forEach((item, i) => {
      const x = margin + metaPadX + (colW + colGap) * i
      const top = y + metaPadY
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(item.label.toUpperCase(), x, top + 6)
      doc.setFont('helvetica', item.small ? 'normal' : 'bold')
      doc.setFontSize(item.small ? 9.5 : 12)
      doc.setTextColor(item.small ? SLATE[0] : INK[0], item.small ? SLATE[1] : INK[1], item.small ? SLATE[2] : INK[2])
      doc.text(metaValueLines[i], x, top + 24)
    })
    y += metaCardH + 16

    // ---- Radar chart (card) -----------------------------------------------
    if (data.radarImage) {
      const pad = 14
      const imgW = contentW - pad * 2
      const imgH = imgW * (560 / 900)
      const cardH = imgH + pad * 2
      ensureSpace(cardH + 16)
      AssessmentPdfService.card(doc, margin, y, contentW, cardH)
      doc.addImage(data.radarImage, 'PNG', margin + pad, y + pad, imgW, imgH)
      y += cardH + 20
    }

    // ---- Sections (always start on a fresh page) --------------------------
    AssessmentPdfService.addFooter(doc, data.footerText, pageW, pageH, margin)
    doc.addPage()
    y = margin
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...SLATE)
    doc.text(data.sectionsHeading.toUpperCase(), margin, y + 4)
    y += 18

    const lineH = 13
    const cardPadX = 16
    const cardPadTop = 14
    const cardPadBottom = 14
    const headerH = 24
    const innerW = contentW - cardPadX * 2
    const answerW = 150
    const questionW = innerW - answerW - 16

    data.sections.forEach((section, si) => {
      // Measure the section so its card can be drawn as one rounded block
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      const rows = section.questions.map((q) => {
        const qLines = doc.splitTextToSize(q.text, questionW) as string[]
        const aLines = doc.splitTextToSize(q.answer, answerW) as string[]
        const maxLines = Math.max(qLines.length, aLines.length)
        return { qLines, aLines, tone: q.tone, h: maxLines * lineH + 8, maxLines }
      })
      const bodyH = rows.reduce((s, r) => s + r.h, 0)
      const cardH = cardPadTop + headerH + bodyH + cardPadBottom

      const fits = cardH <= pageH - margin * 2
      if (fits) {
        ensureSpace(cardH + 12)
        AssessmentPdfService.card(doc, margin, y, contentW, cardH)
      } else {
        ensureSpace(headerH + 40)
      }

      const innerX = margin + cardPadX
      const innerRight = margin + contentW - cardPadX
      let cy = y + cardPadTop

      // Section header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...INK)
      doc.text(`${si + 1}. ${section.title}`, innerX, cy + 10)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(...BLUE)
      doc.text(`${section.answered}/${section.total}`, innerRight, cy + 10, { align: 'right' })
      cy += headerH
      doc.setDrawColor(...LINE)
      doc.setLineWidth(0.8)
      doc.line(innerX, cy - 8, innerRight, cy - 8)

      rows.forEach((row, ri) => {
        if (!fits) {
          // Section spans multiple pages: flow rows individually
          if (cy + row.h > pageH - margin) {
            AssessmentPdfService.addFooter(doc, data.footerText, pageW, pageH, margin)
            doc.addPage()
            y = margin
            cy = margin
          }
        }
        // Vertically centre each text block within the full row height (~10pt
        // baseline ascent) so question and answer read on the same line
        const qFirst = cy + (row.h - row.qLines.length * lineH) / 2 + 10
        const aFirst = cy + (row.h - row.aLines.length * lineH) / 2 + 10

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(...SLATE)
        doc.text(row.qLines, innerX, qFirst)

        const tone = row.tone === 'positive' ? GREEN : row.tone === 'negative' ? RED : SLATE
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...tone)
        doc.text(row.aLines, innerRight, aFirst, { align: 'right' })

        cy += row.h
        if (ri < rows.length - 1) {
          doc.setDrawColor(241, 245, 249)
          doc.setLineWidth(0.6)
          doc.line(innerX, cy, innerRight, cy)
        }
      })

      y = (fits ? y + cardH : cy + cardPadBottom) + 14
    })

    AssessmentPdfService.addFooter(doc, data.footerText, pageW, pageH, margin)
    doc.save(data.fileName)
  }

  // Draws an app-card-style rounded panel: white fill, subtle border, 8pt radius.
  private static card(doc: jsPDF, x: number, y: number, w: number, h: number): void {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.8)
    doc.roundedRect(x, y, w, h, 8, 8, 'FD')
  }

  private static addFooter(
    doc: jsPDF,
    text: string,
    pageW: number,
    pageH: number,
    margin: number,
  ): void {
    const page = doc.getCurrentPageInfo().pageNumber
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(text, margin, pageH - margin / 2)
    doc.text(String(page), pageW - margin, pageH - margin / 2, { align: 'right' })
  }

  // Embeds an image scaled to fit within the (maxW × maxH) box while preserving
  // its natural aspect ratio. Images never break the layout if decoding fails.
  private static tryImage(
    doc: jsPDF,
    dataUrl: string,
    x: number,
    y: number,
    maxW: number,
    maxH: number,
    align: 'left' | 'right' = 'left',
  ): void {
    try {
      const props = doc.getImageProperties(dataUrl)
      const scale = Math.min(maxW / props.width, maxH / props.height)
      const width = props.width * scale
      const height = props.height * scale
      const drawX = align === 'right' ? x + (maxW - width) : x
      // Vertically centre within the box so logos of different ratios align
      const drawY = y + (maxH - height) / 2
      doc.addImage(dataUrl, props.fileType, drawX, drawY, width, height)
    } catch {
      // Skip images that cannot be decoded (e.g. unreachable logo URL)
    }
  }
}
