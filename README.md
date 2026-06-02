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
