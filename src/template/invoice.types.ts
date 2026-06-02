export interface Company {
  name: string;
  address: string;
  siret: string;
}

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface VatSummary {
  rate: number;
  baseAmount: number;
  vatAmount: number;
}

export interface Invoice {
  number: string;
  issueDate: Date;
  seller: Company;
  buyer: Company;
  lines: InvoiceLine[];
  vatSummaries: VatSummary[];
  totalExcludingTax: number;
  totalIncludingTax: number;
}
