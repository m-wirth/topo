import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((module) => module.Home),
    title: 'Topo Apps',
  },
  {
    path: 'ressourcen-tracker',
    loadComponent: () =>
      import('./features/resource-tracker/resource-tracker').then((module) => module.ResourceTracker),
    title: 'Ressourcen Tracker',
  },
  {
    path: 'swisstopo-karten-generator',
    loadComponent: () =>
      import('./features/swisstopo-map-generator/swisstopo-map-generator').then(
        (module) => module.SwisstopoMapGenerator,
      ),
    title: 'Swisstopo Karten Generator',
  },
  {
    path: 'rezept-zu-nutrition',
    loadComponent: () =>
      import('./features/recipe-nutrition/recipe-nutrition').then((module) => module.RecipeNutrition),
    title: 'Rezept zu Nutrition Seite',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
