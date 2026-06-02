# Feature "Générateur de PDFs"

## Knowledge gaps

### Questions à l'équipe Produit

- Est-ce que la génération est manuelle (trigger utilisateur) ou automatique (cron job) ?
- Est-ce que la personnalisation du template HTML est une préférence client ? Est-ce qu'il n'existe pas une solution MVP sans personnalisation à outrance dans un premier temps ?
- Si une génération de document échoue en cours de route, est-ce que l'on considère la facture comme émise quand même et on propose de re-générer la facture ultérieurement mais sans permettre la modification ?
- Quel est le temps de génération attendu ? L'utilisateur attend combien de temps : secondes, minutes, pas pertinent ?
- Quelle est la taille moyenne d'un document ? Quelques pages ou vraiment des centaines régulièrement ?
- Est-ce qu'il est possible pour l'utilisateur de générer des PDFs en masse ?
- Combien de temps doit-on sauvegarder les documents générés ? Quel est le standard, d'autant plus avec l'arrivée de la réforme de facturation de septembre 2026 ?

### Questions à l'équipe Tech

- Est-ce que Puppeteer ou Playwright sont déjà en place côté API ?
- Est-ce qu'il y a un système de retry déjà en place côté API ?
- En cas d'échec de génération, est-ce qu'il y a un système d'alerting qui existe déjà et qui remonte les erreurs à l'équipe (type Sentry) ?
- Est-ce qu'il y a déjà un bucket S3 ? Peut-il être utilisé pour le stockage des PDFs générés ?

---

## Critères de succès

- En tant qu'utilisateur, je ne suis pas gêné dans mes autres actions par la génération de PDFs.
- En tant qu'utilisateur ou admin, je ne peux pas modifier un document déjà généré.
- En tant qu'utilisateur, je dois pouvoir accéder à tous mes documents générés.
- En tant qu'utilisateur, je peux modifier le template HTML utilisé pour générer mes documents.
- En tant qu'utilisateur, je peux rééditer un ancien document tel qu'il a été initialement généré, même si le template a évolué depuis (immutabilité).
- Le système tient une charge de 10.000 PDFs par jour en moyenne avec un temps de livraison à l'utilisateur inférieur à X minutes (X étant à définir avec l'équipe produit).

---

## Architecture macro

### Flux de bout en bout

1. Avant tout clic, le front appelle l'API `POST /invoice/save` pour sauvegarder toutes les informations de la facture en base après chaque modification des éléments de la facture.
2. L'utilisateur clique sur "Générer ma facture" dans l'interface.
3. Le front appelle l'API `POST /invoice/:id/generate`.
4. L'API valide la demande, crée un enregistrement en base avec le statut `PENDING`, puis envoie un message dans une queue AWS SQS.
5. L'API répond immédiatement par une `202 Accepted` afin de ne pas faire attendre l'utilisateur.
6. Un worker Fargate écoute la queue en continu. Il reçoit le message et vérifie si le statut en base est toujours `PENDING`. Si oui, il récupère les données de la facture en base et commence la génération du PDF.
7. Une fois le PDF généré, le worker Fargate met à jour le statut en base à `GENERATED`, enregistre le PDF dans un S3 et envoie directement le mail avec le PDF en pièce jointe via un service dédié d'emailing (selon ce qui est déjà implémenté).
8. Une fois le mail envoyé, le statut de la génération en base passe à `SENT`.
9. Les logs d'éventuelles erreurs remontent dans Sentry et le statut en base passe à `ERROR`.

### Gestion des erreurs

- Vérifier la possibilité de configurer des retry afin de gérer le cas où un worker Fargate tombe en cours de génération.
- Configurer une alerte qui prévient l'équipe tech dans le cas où, malgré les retry, la génération ne se fait toujours pas.
- Prévoir le développement d'un script ou d'une commande de backup pour renvoyer en queue toutes les générations qui sont en statut `ERROR` afin de rattraper les données une fois le bug corrigé.
- Prévenir côté utilisateur par email que la génération a échoué ainsi que la marche à suivre (actions spécifiques ou standby).

---

## Cadrage technique

### Lib de génération de PDF

**Contrainte** : génération de PDF sur la base d'un template HTML.

**Options considérées** :

- **Puppeteer / Playwright** : rendu HTML fidèle, WYSIWYG, cohérent avec la contrainte de génération à partir de HTML. Lenteur potentielle au montage d'un Chromium headless.
- **PDFKit** : construction programmatique élément par élément. Génération PDF assez peu gourmande en ressources. Solution écartée, car elle ne génère pas à partir d'un HTML.

Je retiens Playwright comme choix car il est maintenu plus activement que Puppeteer, supporte plusieurs navigateurs et a une API plus moderne. En pratique, les deux sont proches et si Puppeteer est déjà en place dans la codebase, ce serait un argument pour le retenir afin de ne pas introduire une nouvelle dépendance.

Cela peut néanmoins engendrer une complexité d'infrastructure supplémentaire car Chromium est gourmand en ressources. Il faudra donc dimensionner les workers en conséquence et gérer le pool.

### Versioning des templates

**Contrainte** : un document émis ne doit jamais changer, même si le template évolue après coup.

**Options considérées** :

- **Immutabilité des templates** : un template ne se modifie jamais. Toute modification crée un nouveau template avec un nouvel ID. Chaque document émis référence l'ID du template utilisé au moment de l'émission.
- **Snapshot au moment de l'émission** : le template est modifiable, mais on sauvegarde un snapshot de ses paramètres dans le document au moment de l'émission. Complexe, engendre une répétition de données non pertinentes au sein du document. On sauvegarderait des données de template au sein des données de factures/devis.
- **PDF only** : on considère que le PDF stocké sur S3 est la source de vérité. Simple, mais on perd la possibilité de régénérer à l'identique en cas de besoin.

Je retiens le choix de l'immutabilité des templates. Cela permet de garder un historique de tous les templates utilisés et de pouvoir régénérer des documents anciens même si le template a changé entre temps. Cela suppose également que les données de factures sont elles aussi sauvegardées de manière immutables lors de la génération de la facture.

Cela peut néanmoins engendrer de la complexité pour gérer de la rétrocompatibilité si on ajoute de nouvelles données au modèle de template en base. De plus, il faut veiller à suivre la version de template active à un instant T.

**Schéma de données** :

- Table `Document` : `id`, `validatedAt`, `kind` (`INVOICE` ou `QUOTATION`), `s3Url`, `templateId`, `userId`.
- Table `Template` : `id`, `logoUrl`, `color`, `titlePosition`, autres paramètres pertinents, `isDefault`, `kind` (`INVOICE` ou `QUOTATION`), `createdAt`, `deletedAt` (soft delete).

### Délai de livraison des PDFs

Avant de se positionner sur une solution technique, il faut estimer le temps de traitement d'un PDF d'une page, d'un PDF de 100 pages et de 100 PDFs d'une page. Cela permettra d'avoir une idée du temps de traitement de 10.000 PDFs par jour en moyenne par un unique worker.

Si on fait les hypothèses suivantes :

- 1 worker peut traiter 1000 générations par heure, soit 16,6 générations par minute.
- On doit traiter 10.000 générations par jour.
- On a un objectif de livraison de 3 minutes.

On a :

- 1 worker peut traiter environ 50 générations en 3 minutes.
- On aura donc un nombre de workers égal à `ceil(nombre de générations en queue / 50)`.
- Dès que la queue se vide, on diminue le nombre de workers par tranche de 50 documents.

En utilisant un service de worker avec de l'autoscaling basé sur la taille de la queue SQS, on pourra maintenir un temps de livraison à peu près constant quelle que soit la charge.

Cela suppose néanmoins que la facturation des workers prenne en compte uniquement le temps de travail effectif et pas un prix forfaitaire à la création d'un worker ou autre, ce qui pourrait poser des problèmes opérationnels.

Cette solution engendre potentiellement un problème de cold start, puisque lancer un nouveau worker avec Chromium prend un peu de temps, ce qui peut ralentir la génération des premiers documents lors d'une montée de charge. On peut néanmoins définir une contremesure de garder un minimum de 2-3 workers actifs en permanence pour absorber les premiers pics sans latence.

Il est même envisageable, dans une optique d'amélioration continue, d'anticiper les pics de demande selon des horaires/jours précis une fois qu'on aura acquis de l'historique sur la génération après livraison de la feature.
