import { Invoice } from '../invoice.types';

export const baseInvoice: Invoice = {
  number: 'FA-2026-001',
  issueDate: new Date('2026-01-31'),
  seller: {
    name: 'Bâtiment Pro SAS',
    address: '12 rue de la Paix, 75001 Paris',
    siret: '123 456 789 00012',
  },
  buyer: {
    name: 'Maçonnerie Dupont',
    address: '5 avenue des Artisans, 69001 Lyon',
    siret: '987 654 321 00034',
  },
  lines: [
    {
      description: 'Pose de carrelage',
      quantity: 10,
      unitPrice: 15000,
      vatRate: 0.1,
    },
    {
      description: 'Fourniture matériaux',
      quantity: 5,
      unitPrice: 20000,
      vatRate: 0.2,
    },
    {
      description: 'Ligne à ne pas afficher',
      quantity: 0,
      unitPrice: 0,
      vatRate: 0,
    },
  ],
  vatSummaries: [
    { rate: 0.1, baseAmount: 150000, vatAmount: 15000 },
    { rate: 0.2, baseAmount: 100000, vatAmount: 20000 },
  ],
  totalExcludingTax: 250000,
  totalIncludingTax: 285000,
};
