# Architecture front-end de TéléSport

## Objectif

L'application présente les résultats olympiques par pays sur un dashboard et
une page de détail. Son architecture sépare l'accès aux données, l'orchestration
des pages et le rendu graphique afin de faciliter la maintenance et le futur
remplacement du fichier JSON par une API REST.

## Arborescence

```text
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   ├── medal-evolution-chart/
│   │   └── medals-chart/
│   ├── models/
│   │   ├── indicator.model.ts
│   │   ├── olympic.model.ts
│   │   └── participation.model.ts
│   ├── pages/
│   │   ├── country-detail/
│   │   ├── dashboard/
│   │   └── not-found/
│   ├── services/
│   │   └── data.service.ts
│   ├── app-routing.module.ts
│   ├── app.component.*
│   └── app.module.ts
├── assets/
│   └── mock/olympic.json
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

Chaque composant, page et service possède un fichier de test voisin avec le
suffixe `.spec.ts`.

## Responsabilités

### Pages conteneurs

| Page | Rôle |
|---|---|
| `DashboardComponent` | demande la liste au service, calcule les indicateurs globaux et déclenche la navigation après la sélection d'un pays |
| `CountryDetailComponent` | lit l'identifiant de route, demande le pays correspondant et calcule ses indicateurs |
| `NotFoundComponent` | informe l'utilisateur qu'une route n'existe pas et propose un retour au dashboard |

Les pages connaissent le routeur et `DataService`. Elles pilotent les états
`loading`, `empty`, `error` et `success`, mais elles ne réalisent aucun appel
HTTP et ne créent aucun graphique directement.

### Composants de présentation

| Composant | Entrées et sorties | Rôle |
|---|---|---|
| `HeaderComponent` | titre et indicateurs | affiche un en-tête réutilisable sans connaître la source des données |
| `MedalsChartComponent` | liste des pays ; émet un identifiant | affiche le nombre total de médailles par pays et signale la sélection |
| `MedalEvolutionChartComponent` | participations d'un pays | affiche l'évolution des médailles au fil des éditions |

Les composants de présentation utilisent `ChangeDetectionStrategy.OnPush`.
Les composants graphiques encapsulent Chart.js et détruisent leur instance à
la destruction Angular pour éviter les ressources orphelines.

### Modèles

Les interfaces `Olympic`, `Participation` et `Indicator` décrivent les contrats
échangés entre le service, les pages et les composants. Les collections métier
sont exposées en lecture seule et aucun type `any` n'est utilisé.

## Accès aux données

`DataService` est l'unique point d'accès aux données olympiques :

- il est fourni par l'injecteur racine avec `providedIn: 'root'` ;
- il charge actuellement `assets/mock/olympic.json` avec `HttpClient` ;
- il expose la liste complète et la recherche d'un pays par identifiant ;
- il partage la réponse avec RxJS afin d'éviter les chargements redondants ;
- il laisse les erreurs remonter aux pages, qui choisissent le message à
  afficher.

L'emplacement de la source est défini par `olympicsUrl` dans les fichiers
d'environnement Angular. Les composants ne connaissent ni cette URL ni le
format de transport.

## Flux de données

### Dashboard

```text
DataService
  → DashboardComponent
  → HeaderComponent + MedalsChartComponent
  → événement countrySelected(id)
  → Router /country/:id
```

### Détail

```text
Router /country/:id
  → CountryDetailComponent
  → DataService.getOlympicById(id)
  → HeaderComponent + MedalEvolutionChartComponent
```

Le flux est unidirectionnel : les pages fournissent des entrées aux composants
et les composants remontent uniquement des événements métier.

## Routage

| URL | Page |
|---|---|
| `/` | dashboard |
| `/country/:id` | détail d'un pays |
| `/not-found` | page introuvable |
| toute autre URL | redirection vers `/not-found` |

L'identifiant numérique est préféré au nom du pays : il est stable, non ambigu
et directement compatible avec une future ressource REST.

## Patterns et choix techniques

- **Singleton Angular :** l'injecteur racine fournit une instance partagée de
  `DataService`.
- **Container / Presentational :** les pages orchestrent, les composants
  affichent.
- **Observer :** les données et paramètres de route sont composés avec des
  `Observable` RxJS et consommés avec l'`async` pipe.
- **Injection de dépendances :** les pages obtiennent le service et le routeur
  par l'injecteur Angular.
- **Façade de données :** `DataService` masque la source concrète aux pages.

Un store global comme NgRx n'est pas nécessaire pour deux pages et une source
en lecture seule. Deux composants de graphique spécialisés restent également
plus simples qu'un composant universel fortement paramétrable.

## Passage futur à une API REST

La migration demandera principalement de remplacer `olympicsUrl` par l'URL du
back-end. Si la réponse de l'API diffère des modèles d'affichage, l'adaptation
sera réalisée dans `DataService`.

Les pages et les composants pourront rester inchangés tant que le service
conserve ses contrats. Des intercepteurs HTTP pourront ensuite gérer des besoins
transversaux comme l'authentification ou certaines erreurs globales.

## Vérification

Les commandes principales sont :

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
npm start
```

Les tests couvrent notamment le chargement des données, la recherche par
identifiant, les composants de présentation et la navigation. Le dashboard et
la page `/country/1` ont également été contrôlés dans un navigateur.
