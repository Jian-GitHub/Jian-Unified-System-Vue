// Invoice types — kept entirely in-browser for the public guest mode.
// Once the Invoice backend lands, only the persistence adapter changes.

export type InvoiceState = 'draft' | 'finalised' | 'void'

export interface InvoiceDraft {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  serviceStart: string
  serviceEnd: string
  fromName: string
  fromAddress: string
  billTo: string
  billToCountry: string
  description: string
  amountCents: number
  terms: string
  phone: string
  state: InvoiceState
  createdAt: string
  updatedAt: string
  voidReason?: string
}

export interface InvoiceFormState {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  serviceStart: string
  serviceEnd: string
  fromName: string
  fromAddress: string
  billTo: string
  billToCountry: string
  description: string
  amountInput: string
  terms: string
  phone: string
}

export interface IssuerProfile {
  fromName: string
  fromAddress: string
  phone: string
  defaultBillTo: string
  defaultBillToCountry: string
  defaultDescription: string
  defaultTerms: string
}
