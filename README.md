# Dennlys Parc - Reproduction et Optimisation Eco-Conception (Astro)

## Contexte
Ce projet reproduit la page d'accueil de `dennlys-parc.com` dans Astro, puis applique des optimisations de performance et d'eco-conception sans casser l'identite visuelle.

## Projet deploye
- https://dennlys-parc-digital-ecodesign-audi.vercel.app/

## Demonstration et projection
Le document `eco-action.png` presente une ebauche de premier niveau (demonstration/projection). Ce n'est ni une source de reference, ni un livrable technique final.

![Plan d'action eco-conception](./eco-action.png)

## Objectifs
- Conserver un rendu visuel tres proche du site source.
- Ameliorer les scores Lighthouse (surtout Performance).
- Reduire l'empreinte EcoIndex via:
  - moins de poids au chargement initial,
  - moins de JavaScript execute au demarrage,
  - moins de requetes critiques.

## Etat actuel (mai 2026)
- Stack: Astro `6.3.x`, Node `>=22.12`, pnpm `10`.
- Application: une page principale (`src/pages/index.astro`) composee via composants `src/components/home/*`.
- Assets locaux principaux: `public/assets/*`, `public/utils/fbfeed/*`, `public/date.js`.
- Police locale: `GROBOLD` (woff/woff2/ttf/eot/svg).
- Optimisation build active: `compressHTML` + generation `.gz` et `.br` (Vite compression).
- Tests unitaires actifs sur `src/utils/attractionFilters.js` avec Vitest + couverture V8.

## Optimisations deja appliquees (axe EcoIndex)
1. **Compression de sortie**
- `astro.config.mjs` active `compressHTML`.
- `vite-plugin-compression` genere `.gz` et `.br`.

2. **Reduction du cout initial de la page**
- Script inline horaires externalise (`home-hours.js`).
- Script scroll externalise (`home-scroll-effects.js`).

3. **Deferral des contenus lourds tiers**
- Le bloc Facebook inline volumineux a ete retire du HTML initial.
- Le feed Facebook est charge a la demande via:
  - `public/assets/js/home-facebook-feed.js`
  - `public/assets/data/facebook-feed.html`
- Le script `cff.js` n'est plus charge globalement au boot, mais uniquement quand la section Facebook devient visible.

4. **Deferral newsletter**
- Le formulaire Mailjet est charge uniquement a l'approche de la section via `home-newsletter.js`.

5. **Suppression du badge EcoIndex front**
- Le script externe `ecoindex_badge.js` a ete retire du footer pour eviter un cout reseau/JS supplementaire.

## Architecture
```text
src/
  components/home/
    HomeLayout.astro
    HomeBot.astro
    HomeHeader.astro
    HomeMain.astro
    HomeFooter.astro
  pages/
    index.astro
  styles/
    home.scss

public/
  assets/
    css/
    js/
    data/
    images/
    fonts/
    video/
  utils/fbfeed/
  date.js
  manifest.json

.github/
  greenit/
    scenarios.yaml
  workflows/
    sonarqube.yml
    greenit-analysis.yml

tests/
  attractionFilters.test.js
```

## Branches Git
- `main`: base clone de la home.
- `optimisation`: travaux d'optimisation Lighthouse / EcoIndex.

## Commandes utiles
```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm test:coverage
```

## Mesure et suivi qualite
### Lighthouse local
Le projet contient `.lighthouserc.json` (desktop) pour verifier les categories principales.

### CI "Responsible CI" (SonarQube + Lighthouse)
Workflow: `.github/workflows/sonarqube.yml`

Il execute:
1. Build + tests avec couverture.
2. Scan SonarQube (bloquant si `SONAR_TOKEN`/`SONAR_HOST_URL` manquants).
3. Budget eco/perf via Lighthouse CI et publication de liens de rapport dans le summary GitHub.

### CI EcoIndex (GitHub Actions)
Le workflow [greenit-analysis.yml](/Users/christophe/Web/DP ECO DENNLYS/.github/workflows/greenit-analysis.yml) execute une mesure EcoIndex automatisee via GreenIT Analysis CLI.

#### Declencheurs
- `push` sur `main`
- `pull_request`
- `workflow_dispatch` (manuel)

#### Scenario mesure
Le scenario est defini dans [scenarios.yaml](/Users/christophe/Web/DP ECO DENNLYS/.github/greenit/scenarios.yaml).
Actuellement, une seule page est mesuree:
- `http://127.0.0.1:5173/`

#### Ce que fait la CI
1. Installe les dependances (`pnpm install --frozen-lockfile`).
2. Build Astro (`pnpm run build`).
3. Lance le serveur preview local (`pnpm run serve:lhci`).
4. Clone et build l'image Docker de `GreenIT-Analysis-cli`.
5. Execute l'analyse et genere un rapport HTML.
6. Publie les artefacts GitHub.

#### Artefacts produits
L'artefact `greenit-analysis-report` contient:
- `artifacts/greenit/output/report.html` : rapport EcoIndex
- `artifacts/greenit/greenit.log` : log complet de l'analyse GreenIT
- `artifacts/greenit/app.log` : log serveur Astro preview
- `artifacts/greenit/input/url.yaml` : scenario utilise pendant le run

#### Garde-fous integres
- Le workflow echoue explicitement si `report.html` n'est pas genere ou vide (`test -s ...`).
- Le log GreenIT est toujours capture dans l'artefact (`tee artifacts/greenit/greenit.log`).

#### Debug rapide si "pas de data"
1. Ouvrir `greenit.log` dans l'artefact pour l'erreur primaire (timeout, selecteur, navigation...).
2. Verifier le scenario et les selecteurs dans `.github/greenit/scenarios.yaml`.
3. Verifier `app.log` pour confirmer que la preview Astro a bien demarre sur `127.0.0.1:5173`.
4. Relancer manuellement via `workflow_dispatch` apres correction.

### Cibles recommendees (ordre prioritaire)
1. Performance Lighthouse >= 90
2. Diminution du poids initial HTML/JS/CSS
3. Limitation des scripts tiers en chemin critique
4. Stabilite visuelle (CLS) et vitesse d'affichage (LCP)

## Limitations connues
- Plusieurs scripts tiers restent charges globalement dans `HomeLayout.astro` (jQuery, tarteaucitron, rellax).
- Le hero video (`bg-full-hd.mp4`) reste un element potentiellement couteux selon le contexte reseau/appareil.
- Le perimetre GreenIT actuel couvre seulement la home (`/`), pas les autres parcours.

## Prochaines etapes d'optimisation (proposees)
1. Migrer les medias critiques (images hero) vers pipeline image Astro avec dimensions explicites.
2. Reevaluer le chargement de `rellax` (passage en defer/on-visible ou suppression si non critique).
3. Etendre le scenario GreenIT a d'autres pages representant des parcours reellement visites.
4. Ajouter un suivi historique simple des tendances EcoIndex/Lighthouse (tableau de bord ou badges CI).

## Ameliorations continues
L'objectif est de passer d'une logique "audit ponctuel" a une logique "pilotage continu" avec seuils, mesures comparables et actions cadences.

### Plan d'action 30 jours (stabilisation)
1. Fixer un perimetre de reference (home + 1 parcours cle) pour Lighthouse et GreenIT.
2. Baseline: archiver les scores actuels dans un fichier de suivi versionne (`docs/perf-baseline.md`).
3. Ajouter une routine hebdomadaire de revue CI (15 min) avec decision: conserver / corriger / investiguer.
4. Mettre des seuils minimaux explicites sur les metriques critiques (Performance, LCP, poids total transferre).

### Plan d'action 60 jours (industrialisation)
1. Etendre `scenarios.yaml` a plusieurs pages (home, acces, calendrier, billetterie si applicable).
2. Standardiser les artefacts de preuve: rapport HTML GreenIT + lien Lighthouse + resume markdown.
3. Ajouter un changelog eco-perf par PR (variation attendue et variation observee).
4. Definir une regle "no regression majeure" avant merge sur `main`.

### Plan d'action 90 jours (optimisation structurelle)
1. Reduire les scripts tiers en chemin critique (chargement conditionnel ou suppression des scripts non essentiels).
2. Traiter les medias lourds (video hero, images) avec budget de poids par page.
3. Introduire des budgets techniques documentes:
   - JS initial maximal,
   - nombre de requetes maximal,
   - poids total maximal.
4. Mettre en place un tableau de tendance mensuel (scores + poids + principales causes de variation).

### Cadence recommandee
1. Hebdomadaire: lecture des runs CI et tri des regressions.
2. Mensuelle: revue des tendances et ajustement des budgets.
3. Trimestrielle: revue d'architecture (tiers, assets, parcours mesures).

## Contraintes projet
- Priorite: maintenir le rendu visuel du site d'origine.
- Les optimisations se font de maniere progressive et reversible (commits atomiques).
