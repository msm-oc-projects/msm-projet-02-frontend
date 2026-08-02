# Notes d'analyse de l'architecture du starter TéléSport

## Objet

Ce document constitue le sous-livrable de l'étape 1 du projet TéléSport. Il
recense les problèmes techniques, structurels et visuels observés dans le
starter avant toute refactorisation.

L'analyse s'appuie sur :

- le starter officiel Angular ;
- les spécifications fonctionnelles TéléSport ;
- l'ensemble des fichiers de `src/app` ;
- le jeu de données `src/assets/mock/olympic.json` ;
- la configuration Angular, TypeScript, npm, Karma et les environnements ;
- un contrôle réel du build, des tests, du serveur et du rendu desktop/mobile.

Le code source du starter n'a pas été modifié pendant cette étape. Seuls
`node_modules/` et `dist/`, ignorés par Git et régénérables, ont été produits
pour réaliser les contrôles.

## Résultats des contrôles

| Contrôle | Résultat | Observation |
|---|---|---|
| `npm ci` | échec | `package.json` et `package-lock.json` sont désynchronisés pour `chokidar` et `readdirp` |
| installation sans réécrire le lockfile | réussite | `npm install --package-lock=false --registry=https://registry.npmjs.org` |
| audit npm après installation | vigilance | 53 vulnérabilités signalées : 6 faibles, 14 modérées, 32 élevées et 1 critique |
| `npm run build` | réussite | bundle de production généré, 467,87 kB avant compression estimée |
| `npm start` | réussite | compilation réussie et serveur disponible sur `http://127.0.0.1:4200` |
| `npm run lint` | échec | aucun script ni outil de lint n'est configuré |
| tests Karma | échec | `app.component.spec.ts` utilise une propriété `title` supprimée de `AppComponent` |
| route `/` | fonctionnelle | les cinq pays, les deux KPI et le graphique circulaire s'affichent |
| route `/country/France` | fonctionnelle | les KPI et l'évolution des médailles s'affichent |
| route invalide | non conforme | page presque vide, KPI à zéro, aucun message ni redirection |
| affichage mobile | partiel | contenu visible, mais graphique et légende très petits et peu exploitables |

L'installation signale aussi plusieurs dépendances obsolètes. Aucune correction
automatique de type `npm audit fix --force` n'a été appliquée pendant l'audit,
car elle pourrait modifier le starter et introduire des ruptures de version.

## Éléments déjà satisfaisants

- le mode strict TypeScript et les contrôles stricts des templates sont activés ;
- les pages d'accueil, de détail et 404 sont séparées ;
- le routage possède une route par défaut et une route générique `**` ;
- `provideHttpClient()` est utilisé plutôt qu'une API Angular obsolète ;
- le jeu de données est placé dans les assets et non écrit directement dans un
  tableau au sein d'un composant ;
- aucun fichier source ne dépasse 300 lignes ;
- le build de production et `ng serve` fonctionnent ;
- une première adaptation de largeur existe pour le graphique de détail.

> **Commentaire personnel —** Le starter est suffisamment petit pour être
> compris rapidement et ses trois pages donnent une base exploitable. Le
> problème principal n'est pas la taille des fichiers, mais le nombre de
> responsabilités concentrées dans les deux pages métier.

## Synthèse priorisée

| Priorité | Problème | Risque principal | Direction de correction |
|---:|---|---|---|
| Critique | accès HTTP et données dans les pages | couplage, duplication, tests difficiles | créer un `DataService` typé |
| Critique | 19 occurrences de `any` | erreurs masquées malgré le mode strict | créer `Olympic` et `Participation` |
| Critique | route utilisant le nom au lieu de l'identifiant | non-conformité à `/country/:id` | naviguer et rechercher par `id` |
| Critique | pays invalide non géré | page vide et erreur d'exécution possible | afficher une erreur ou rediriger |
| Élevée | tests obsolètes et incomplets | régressions non détectées | réparer et compléter les tests |
| Élevée | absence des états loading/empty/error | expérience ambiguë | modéliser et afficher les trois états |
| Élevée | logique métier dans les composants | faible réutilisabilité | déplacer calculs et accès aux données |
| Élevée | gestion manuelle fragile de Chart.js | fuite de ressources et couplage au DOM | encapsuler création et destruction |
| Élevée | graphiques non accessibles | navigation clavier/lecteur d'écran impossible | ajouter texte alternatif et interactions clavier |
| Moyenne | en-tête dupliqué | incohérences futures | créer `HeaderComponent` réutilisable |
| Moyenne | souscriptions impératives | cycle de vie difficile à maîtriser | composer les flux RxJS et gérer la destruction |
| Moyenne | styles globaux génériques | collisions et couplage aux balises | rapprocher les styles des composants |
| Moyenne | responsive incomplet | graphique peu lisible sur mobile | définir les trois paliers demandés |
| Moyenne | `npm ci` inutilisable | installation non reproductible | remettre le lockfile en cohérence |
| Moyenne | lint absent | qualité non contrôlée automatiquement | configurer ESLint et un script `lint` |
| Faible | conventions de code hétérogènes | lecture et revue ralenties | appliquer formatage et conventions Angular |
| Faible | README incomplet et partiellement inexact | prise en main difficile | documenter installation, structure et décisions |

## 1. Architecture et séparation des responsabilités

### 1.1 Accès aux données dans les composants

`HomeComponent` et `CountryComponent` injectent directement `HttpClient`,
connaissent l'URL de `olympic.json` et déclenchent eux-mêmes le chargement.

Conséquences :

- l'URL est dupliquée ;
- un futur passage à une API obligerait à modifier plusieurs pages ;
- la stratégie de gestion des erreurs serait répétée ;
- les composants sont plus difficiles à tester isolément.

La spécification demande explicitement un `DataService` central dans
`src/app/services/data.service.ts`.

> **Commentaire personnel —** Je considère ce point comme la dette la plus
> importante. Le remplacement du fichier JSON par une API doit pouvoir se faire
> dans le service sans réécrire les pages.

### 1.2 Logique métier concentrée dans les pages

Les pages calculent directement :

- le nombre de pays ;
- le nombre d'éditions uniques ;
- le total des médailles ;
- le total des athlètes ;
- les séries destinées aux graphiques.

Elles gèrent en plus le chargement, les erreurs, le routage et la création de
Chart.js. Une modification fonctionnelle risque donc d'affecter plusieurs
responsabilités dans la même classe.

### 1.3 Composant partagé manquant

Les templates `home` et `country` dupliquent la structure titre + indicateurs.
Les libellés, conteneurs et classes `.center`/`.split` sont répétés au lieu
d'utiliser le `HeaderComponent` demandé.

### 1.4 Architecture annoncée mais absente

Le README annonce des dossiers `components`, `core/services` et `core/models`,
mais aucun n'existe dans le starter. Les spécifications demandent désormais
`models/`, `services/`, un composant partagé et des pages conteneurs.

## 2. Typage TypeScript et traitement des données

### 2.1 Utilisation massive de `any`

L'analyse relève 19 occurrences du mot-clé ou du type `any`, notamment :

- `HttpClient.get<any[]>()` ;
- les éléments des `map`, `find` et `reduce` ;
- les accumulateurs de totaux ;
- `totalEntries`.

Le mode strict perd ainsi une grande partie de son intérêt. Les interfaces
`Olympic` et `Participation` fournies par la spécification doivent devenir les
types de référence de toute la chaîne.

### 2.2 Conversions numériques inutiles

Dans `CountryComponent`, les nombres de médailles et d'athlètes sont convertis
en chaînes avec `toString()`, puis reconvertis avec `parseInt()` avant leur
addition. Cette transformation est inutile et fragilise le calcul.

### 2.3 Accès à un résultat potentiellement absent

Le code utilise `selectedCountry.country` avant de garantir que `find()` a
retourné un pays. Pour une URL invalide, aucun comportement métier clair n'est
défini. Le rendu observé reste presque vide avec des KPI à zéro, au lieu du
message ou de la redirection exigés.

### 2.4 Contrat de route incorrect

Le starter déclare `/country/:countryName` et le graphique navigue avec le nom
du pays. Les spécifications imposent `/country/:id`. Un nom contient des
espaces, peut changer et n'est pas une clé métier aussi stable que l'identifiant.

> **Commentaire personnel —** Le typage des modèles et l'usage de l'identifiant
> doivent être traités avant la refactorisation visuelle. Ils définissent le
> contrat interne sur lequel les composants pourront s'appuyer.

## 3. RxJS, chargement et erreurs

### 3.1 Souscriptions impératives

`CountryComponent` souscrit séparément à `paramMap` puis à l'appel HTTP. Le
chargement dépend donc d'une variable locale modifiée par une autre
souscription. Le flux devrait relier le paramètre et la récupération du pays,
par exemple avec une composition RxJS adaptée.

### 3.2 Cycle de vie non maîtrisé

La souscription à `paramMap` n'est pas explicitement libérée. L'appel HTTP se
termine seul, mais le flux du routeur reste actif pendant la vie du composant.
Une stratégie uniforme (`async` pipe ou destruction automatique) rendrait le
cycle de vie explicite.

### 3.3 Opérateur `pipe()` vide

Les deux appels HTTP utilisent `.pipe()` sans aucun opérateur. Cette syntaxe
ajoute du bruit et donne l'impression qu'une transformation ou une gestion
d'erreur existe alors que ce n'est pas le cas.

### 3.4 États non affichés

La propriété `error` n'est utilisée dans aucun template. Il n'existe ni état de
chargement, ni message « Aucune donnée », ni erreur claire avec possibilité de
retour. L'utilisateur ne peut donc pas distinguer une attente, une absence de
données et une panne.

### 3.5 Journaux de développement

Deux `console.log` sont présents dans `HomeComponent`, dont un journalise tout
le jeu de données. Ils doivent être supprimés du code final ou remplacés par
une stratégie de journalisation justifiée.

## 4. Graphiques et cycle de vie Angular

### 4.1 Accès direct au DOM par identifiant

Chart.js est construit avec les chaînes `DashboardPieChart` et `countryChart`.
Cette approche dépend d'identifiants globaux et contourne les références de vue
Angular. Elle complique la réutilisation et les tests.

### 4.2 Destruction des graphiques absente

Les instances sont créées dans `ngOnInit`, mais aucun `destroy()` n'est appelé
à la destruction de la page. Une réinitialisation ou une navigation répétée
peut conserver des ressources ou provoquer un conflit de canvas.

### 4.3 Navigation intégrée à la configuration du graphique

Le clic Chart.js, l'extraction du libellé et la navigation sont définis dans la
même méthode que la configuration graphique. La logique d'interaction est donc
fortement liée à la bibliothèque de rendu.

### 4.4 Interpolation dans `<canvas>`

`{{ pieChart }}` et `{{ lineChart }}` sont placés entre les balises `canvas`.
Ce contenu n'est qu'un fallback textuel et ne constitue ni un binding utile ni
une description accessible du graphique.

## 5. Interface, responsive et accessibilité

### 5.1 Structure sémantique insuffisante

Les titres de page et les KPI reposent surtout sur des `div` et des `p`. Le
titre principal du composant partagé devrait être un vrai titre hiérarchique,
et les indicateurs une structure compréhensible par les technologies
d'assistance.

### 5.2 Graphiques inaccessibles

Les canvas ne possèdent ni `aria-label`, ni description textuelle des valeurs.
Le graphique d'accueil est cliquable à la souris, mais aucun contrôle clavier
équivalent ni focus visible n'est fourni.

### 5.3 Responsive incomplet

Une seule media query existe dans la page de détail. Les paliers desktop,
tablette et mobile demandés ne sont pas modélisés. Sur une capture de 390 px,
la légende occupe plusieurs lignes et le graphique circulaire devient très
petit, donc peu lisible.

### 5.4 Styles trop globaux

Les classes génériques `.center` et `.split` sont définies dans
`src/styles.scss` avec des sélecteurs descendants comme `div` et `p`. Ces
styles peuvent affecter accidentellement de futurs composants. Les fichiers
SCSS de `HomeComponent` et `AppComponent` sont pourtant vides.

### 5.5 Cohérence visuelle et marque

Le logo `teleSport.png` est présent dans les assets mais inutilisé. La page
conserve un titre générique « Olympic games app », des liens par défaut du
navigateur et de grands espaces non structurés. Aucun design system minimal
pour couleurs, espacements, typographie ou focus n'est défini.

### 5.6 Langue du document

`index.html` déclare `lang="en"`. Ce choix doit être aligné avec la langue
réelle retenue pour l'interface et les maquettes afin que les lecteurs d'écran
prononcent correctement le contenu.

> **Commentaire personnel —** Le starter est techniquement visible sur mobile,
> mais « visible » ne signifie pas encore « lisible et utilisable ». La taille
> du graphique, la navigation clavier et les états d'interface doivent être
> validés explicitement.

## 6. Routage et navigation

- le paramètre de détail est un nom au lieu de l'identifiant demandé ;
- une URL de pays inconnu ne produit ni redirection ni message clair ;
- les liens retour utilisent `routerLink=""` plutôt que le chemin explicite
  `routerLink="/"` demandé ;
- `CountryComponent` injecte `Router` sans l'utiliser ;
- la route explicite `not-found` et la route générique affichent le même
  composant, mais aucune politique de redirection n'est documentée.

## 7. Tests et outillage qualité

### 7.1 Suite de tests cassée

`app.component.spec.ts` attend une propriété `title` qui n'existe plus et un
élément `.content span` absent du template. La compilation des tests s'arrête
donc avant leur exécution.

### 7.2 Tests de pages trop superficiels

Les tests `home` et `country` vérifient seulement la création du composant. Ils
ne configurent pas explicitement leurs dépendances HTTP/router, ne testent pas
les calculs, le rendu, les erreurs, la navigation ou le cycle de vie des
graphiques.

### 7.3 Lint absent

Le `package.json` ne contient aucun script `lint` et le workspace ne configure
pas ESLint. La recommandation `ng lint` ne peut donc pas être appliquée au
starter dans son état actuel.

### 7.4 Installation non reproductible

`npm ci` refuse le lockfile fourni. Un développeur qui suit le README ne peut
donc pas obtenir une installation propre et reproductible sans contournement ou
réparation du lockfile.

### 7.5 Avertissements de configuration

Angular signale :

- `browserTarget` déprécié au profit de `buildTarget` ;
- un décalage entre la cible TypeScript déclarée et la cible ES2022 appliquée
  par le CLI.

Ces avertissements ne bloquent pas le démarrage, mais doivent être traités lors
du nettoyage de la configuration.

## 8. Lisibilité et conventions

Le code mélange guillemets simples et doubles, espacements, points-virgules,
visibilités explicites et implicites. Plusieurs noms sont imprécis :

- `totalJOs` mélange français et anglais ;
- `totalEntries` signifie en réalité nombre de participations ;
- les variables `i` et `f` se répètent dans des transformations imbriquées ;
- `buildPieChart` et `buildChart` ne suivent pas la même convention ;
- le test de `CountryComponent` est nommé `DetailComponent`.

Une configuration de formatage et de lint permettrait d'automatiser ces règles
au lieu de les faire dépendre de chaque développeur.

## 9. Écart avec les critères d'acceptation

| Critère demandé | État du starter | Écart à traiter |
|---|---|---|
| `ng serve` sans erreur | conforme avec avertissements | moderniser la configuration |
| dashboard fonctionnel | partiel | architecture, états et accessibilité |
| clic pays vers `/country/:id` | non conforme | route par nom actuellement |
| détail KPI + évolution | partiel | typage et gestion des états |
| identifiant invalide géré | non conforme | page vide sans message |
| responsive sur trois paliers | non conforme | une seule règle partielle |
| `DataService` central | non conforme | HTTP dans les composants |
| interfaces TypeScript | non conforme | 19 occurrences de `any` |
| `README.md` complet | non conforme | contenu minimal et architecture inexacte |
| `ARCHITECTURE.md` présent | non conforme | fichier absent |

## Conclusion personnelle

Le starter démarre et illustre le parcours principal, mais il ne constitue pas
encore une base maintenable. La priorité est de définir les modèles, centraliser
les données, corriger le contrat de route et clarifier les états. Ensuite, la
création d'un en-tête réutilisable, l'encapsulation des graphiques, les tests et
l'accessibilité pourront être traitées sans dupliquer la logique.

Je conserverai le comportement fonctionnel utile, mais je ne chercherai pas à
déplacer le code existant à l'identique : la refactorisation devra réduire les
responsabilités des pages et préparer explicitement le remplacement du JSON
local par une API.
