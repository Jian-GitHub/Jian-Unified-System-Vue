// Invoice PDF rendering. Mirrors the layout used by the standalone Invoice
// Maker app — minimalist A4 with thin rules, no colour blocks. Runs entirely
// in the browser; no server call required.

import { jsPDF } from 'jspdf'
import { downloadBlob, formatCurrencyAmount } from '@/utils/format'
import type { InvoiceDraft } from '@/types/invoice'

const COLOURS = {
  ink: [24, 34, 44] as [number, number, number],
  muted: [102, 113, 125] as [number, number, number],
  accent: [26, 119, 115] as [number, number, number],
  rule: [213, 219, 224] as [number, number, number],
}

const LEFT = 24
const RIGHT = 186

function money(nzd: number) {
  return formatCurrencyAmount(nzd)
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDateShort(iso: string | undefined): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function servicePeriod(start: string, end: string): string {
  if (!start || !end) return '—'
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  return sameYear
    ? `${formatDateShort(start)} – ${formatDate(end)}`
    : `${formatDate(start)} – ${formatDate(end)}`
}

export function renderInvoicePdf(invoice: InvoiceDraft): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  doc.setProperties({
    title: `Invoice ${invoice.invoiceNumber}`,
    author: invoice.fromName,
    subject: `Invoice to ${invoice.billTo}`,
  })

  const text = (
    value: string | string[],
    x: number,
    y: number,
    size: number,
    colour: [number, number, number] = COLOURS.ink,
    weight: 'normal' | 'bold' = 'normal',
    align: 'left' | 'right' = 'left',
  ) => {
    doc.setFont('helvetica', weight)
    doc.setFontSize(size)
    doc.setTextColor(colour[0], colour[1], colour[2])
    doc.text(value, x, y, { align })
  }

  const line = (x1: number, x2: number, y: number, colour: [number, number, number] = COLOURS.rule, width = 0.25) => {
    doc.setDrawColor(colour[0], colour[1], colour[2])
    doc.setLineWidth(width)
    doc.line(x1, y, x2, y)
  }

  const wrap = (value: string, maxWidth: number, maxLines: number) =>
    (doc.splitTextToSize(value || '—', maxWidth) as string[]).slice(0, maxLines)

  // Title + invoice number
  text('INVOICE', LEFT, 31, 29, COLOURS.ink, 'bold')
  text('INVOICE NUMBER', RIGHT, 24, 7.5, COLOURS.muted, 'bold', 'right')
  text(invoice.invoiceNumber || '—', RIGHT, 31, 11, COLOURS.ink, 'bold', 'right')
  line(LEFT, RIGHT, 42, COLOURS.accent, 0.5)

  // Date columns
  const dateCols = [
    { x: LEFT, label: 'ISSUE DATE', value: formatDate(invoice.issueDate) },
    { x: 79, label: 'DUE DATE', value: formatDate(invoice.dueDate) },
    { x: 134, label: 'SERVICE PERIOD', value: servicePeriod(invoice.serviceStart, invoice.serviceEnd) },
  ]
  dateCols.forEach((c) => {
    text(c.label, c.x, 57, 7.2, COLOURS.muted, 'bold')
    text(c.value, c.x, 64, 10)
  })

  // Parties
  text('FROM', LEFT, 92, 7.5, COLOURS.accent, 'bold')
  text(invoice.fromName || '—', LEFT, 101, 11.5, COLOURS.ink, 'bold')
  text(wrap(invoice.fromAddress, 62, 5), LEFT, 109, 9.5, COLOURS.muted)
  text('BILL TO', 112, 92, 7.5, COLOURS.accent, 'bold')
  text(invoice.billTo || '—', 112, 101, 11.5, COLOURS.ink, 'bold')
  text(invoice.billToCountry || '', 112, 109, 9.5, COLOURS.muted)

  // Line item
  line(LEFT, RIGHT, 152)
  text('DESCRIPTION', LEFT, 160, 7.5, COLOURS.muted, 'bold')
  text('AMOUNT', RIGHT, 160, 7.5, COLOURS.muted, 'bold', 'right')
  line(LEFT, RIGHT, 165)
  const amountNzd = invoice.amountCents / 100
  text(wrap(invoice.description, 108, 3), LEFT, 177, 10.5)
  text(money(amountNzd), RIGHT, 181, 10.5, COLOURS.ink, 'bold', 'right')
  line(LEFT, RIGHT, 190)

  // Total
  text('TOTAL DUE', RIGHT, 210, 8, COLOURS.muted, 'bold', 'right')
  text(money(amountNzd), RIGHT, 223, 20, COLOURS.ink, 'bold', 'right')
  line(122, RIGHT, 229, COLOURS.accent, 0.42)

  // Terms
  text('TERMS & CONDITIONS', LEFT, 247, 7.5, COLOURS.accent, 'bold')
  line(LEFT, 102, 252)
  text(wrap(invoice.terms, 78, 3), LEFT, 262, 9.5)

  // Footer
  line(LEFT, RIGHT, 275)
  text(invoice.fromName || '—', LEFT, 283, 8.5, COLOURS.muted)
  text(`Invoice ${invoice.invoiceNumber || '—'}`, RIGHT, 283, 8.5, COLOURS.muted, 'normal', 'right')

  return doc.output('blob')
}

export function downloadInvoicePdf(invoice: InvoiceDraft) {
  const blob = renderInvoicePdf(invoice)
  const filename = `Invoice_${invoice.invoiceNumber || invoice.id}.pdf`
  downloadBlob(blob, filename, 'application/pdf')
}

export function invoiceEmailSubject(invoice: InvoiceDraft): string {
  return `Invoice - ${invoice.fromName || 'Jian Qi'}`
}

export function invoiceEmailBody(invoice: InvoiceDraft): string {
  return `Hello,\n\nPlease find my invoice attached.\n\nKind regards,\n${invoice.fromName || 'Jian Qi'}\n${invoice.phone || ''}`.trim()
}

export function invoiceEmailText(invoice: InvoiceDraft): string {
  return `Subject: ${invoiceEmailSubject(invoice)}\n\n${invoiceEmailBody(invoice)}`
}
