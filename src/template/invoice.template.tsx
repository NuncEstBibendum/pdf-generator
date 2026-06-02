import React from 'react';
import { Company, Invoice, InvoiceLine, VatSummary } from './invoice.types';

const InvoiceHeader = ({ invoice }: { invoice: Invoice }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '40px',
    }}
  >
    <div>
      <h2>{invoice.seller.name}</h2>
      <p>{invoice.seller.address}</p>
      <p>SIRET : {invoice.seller.siret}</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <h1>FACTURE #{invoice.number}</h1>
      <p>Date : {invoice.issueDate.toLocaleDateString('fr-FR')}</p>
    </div>
  </div>
);

const InvoiceBuyer = ({ buyer }: { buyer: Company }) => (
  <div style={{ marginBottom: '40px' }}>
    <h3>Facturé à</h3>
    <p>{buyer.name}</p>
    <p>{buyer.address}</p>
    <p>SIRET : {buyer.siret}</p>
  </div>
);

const InvoiceTableRow = ({ line }: { line: InvoiceLine }) => {
  if (line.quantity === 0) {
    return null;
  }

  const totalHT = line.quantity * line.unitPrice;

  return (
    <tr>
      <td>{line.description || '—'}</td>
      <td style={{ textAlign: 'right' }}>{line.quantity}</td>
      <td style={{ textAlign: 'right' }}>
        {(line.unitPrice / 100).toFixed(2)} €
      </td>
      <td style={{ textAlign: 'right' }}>
        {(line.vatRate * 100).toFixed(0)} %
      </td>
      <td style={{ textAlign: 'right' }}>{(totalHT / 100).toFixed(2)} €</td>
    </tr>
  );
};

const InvoiceTable = ({ lines }: { lines: InvoiceLine[] }) => (
  <table
    style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}
  >
    <thead>
      <tr style={{ backgroundColor: '#f5f5f5' }}>
        <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
        <th style={{ textAlign: 'right', padding: '8px' }}>Qté</th>
        <th style={{ textAlign: 'right', padding: '8px' }}>PU HT</th>
        <th style={{ textAlign: 'right', padding: '8px' }}>TVA</th>
        <th style={{ textAlign: 'right', padding: '8px' }}>Total HT</th>
      </tr>
    </thead>
    <tbody>
      {lines.map((line, index) => (
        <InvoiceTableRow key={index} line={line} />
      ))}
    </tbody>
  </table>
);

const InvoiceVatSummary = ({
  vatSummaries,
}: {
  vatSummaries: VatSummary[];
}) => (
  <div style={{ marginBottom: '16px' }}>
    {vatSummaries.map((vat, index) => (
      <div
        key={index}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <span>
          TVA {(vat.rate * 100).toFixed(0)} % (base :{' '}
          {(vat.baseAmount / 100).toFixed(2)} €)
        </span>
        <span>{(vat.vatAmount / 100).toFixed(2)} €</span>
      </div>
    ))}
  </div>
);

const InvoiceTotals = ({ invoice }: { invoice: Invoice }) => (
  <div style={{ textAlign: 'right', marginBottom: '40px' }}>
    <InvoiceVatSummary vatSummaries={invoice.vatSummaries} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Total HT</span>
      <span>{(invoice.totalExcludingTax / 100).toFixed(2)} €</span>
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'bold',
      }}
    >
      <span>Total TTC</span>
      <span>{(invoice.totalIncludingTax / 100).toFixed(2)} €</span>
    </div>
  </div>
);

export const InvoiceTemplate = ({ invoice }: { invoice: Invoice }) => (
  <html lang="fr">
    <head>
      <meta charSet="utf-8" />
      <style>{`
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border-bottom: 1px solid #eee; }
      `}</style>
    </head>
    <body>
      <InvoiceHeader invoice={invoice} />
      <InvoiceBuyer buyer={invoice.buyer} />
      <InvoiceTable lines={invoice.lines} />
      <InvoiceTotals invoice={invoice} />
    </body>
  </html>
);
