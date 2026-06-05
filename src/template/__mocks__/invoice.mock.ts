import { Invoice } from '../invoice.types';

export const baseInvoice: Invoice = {
  number: 'FA-2026-001',
  validatedAt: new Date('2026-06-03'),
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
      quantity: 7,
      unitPrice: 15000,
      vatRate: 0.1,
    },
    {
      description: 'Fourniture matériaux',
      quantity: 3,
      unitPrice: 20000,
      vatRate: 0.2,
    },
    {
      description: "Main d'oeuvre",
      quantity: 8,
      unitPrice: 10000,
      vatRate: 0.055,
    },
    {
      description: 'Ligne à ne pas afficher',
      quantity: 0,
      unitPrice: 0,
      vatRate: 0,
    },
  ],
  vatSummaries: [
    { rate: 0.1, baseAmount: 105000, vatAmount: 10500 },
    { rate: 0.2, baseAmount: 60000, vatAmount: 12000 },
    { rate: 0.055, baseAmount: 80000, vatAmount: 4400 },
  ],
  totalExcludingTax: 245000,
  totalIncludingTax: 271900,
};
