# PDF Generator

Le livrable contient uniquement la brique de templating côté NestJS/React. Le cadrage produit, les choix d'architecture et les arbitrages techniques sont documentés dans [`FEATURE.md`](./FEATURE.md).

## Périmètre

- `src/template/invoice.template.tsx` : template React qui produit le HTML final d'une facture.
- `src/template/template.service.ts` : service NestJS qui rend le template en HTML statique.
- `src/template/template.service.spec.ts` : tests unitaires couvrant des cas de rendu.

La pipeline complète de génération PDF, les workers, SQS, S3 et Playwright sont décrits au niveau architecture, mais ne sont pas implémentés dans ce repo.

## Installation

```bash
npm install
```

## Lancer les tests

```bash
npm test
```

## Lancer le projet en local

```bash
npm run start:dev
```

## Appeler le générateur

```
POST http://localhost:3000/template/invoice
```

Appeler cet endpoint avec le body json suivant pour tester :

```
{
  "number": "FA-2026-001",
  "issueDate": "2026-06-03",
  "seller": {
    "name": "Bâtiment Pro SAS",
    "address": "12 rue de la Paix, 75001 Paris",
    "siret": "123 456 789 00012"
  },
  "buyer": {
    "name": "Maçonnerie Dupont",
    "address": "5 avenue des Artisans, 69001 Lyon",
    "siret": "987 654 321 00034"
  },
  "lines": [
    {
      "description": "Pose de carrelage",
      "quantity": 7,
      "unitPrice": 15000,
      "vatRate": 0.1
    },
    {
      "description": "Fourniture matériaux",
      "quantity": 3,
      "unitPrice": 20000,
      "vatRate": 0.2
    },
    {
      "description": "Main d'oeuvre",
      "quantity": 8,
      "unitPrice": 10000,
      "vatRate": 0.055
    },
    {
      "description": "Ligne à ne pas afficher",
      "quantity": 0,
      "unitPrice": 0,
      "vatRate": 0
    }
  ],
  "vatSummaries": [
    {
      "rate": 0.1,
      "baseAmount": 105000,
      "vatAmount": 10500
    },
    {
      "rate": 0.2,
      "baseAmount": 60000,
      "vatAmount": 12000
    },
    {
      "rate": 0.055,
      "baseAmount": 80000,
      "vatAmount": 4400
    }
  ],
  "totalExcludingTax": 245000,
  "totalIncludingTax": 271900
}
```
