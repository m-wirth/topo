import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((module) => module.Home),
    title: 'Topo Dashboard',
  },
  {
    path: 'nutrition',
    redirectTo: 'nutrition/analyze',
    pathMatch: 'full',
  },
  {
    path: 'nutrition/analyze',
    loadComponent: () =>
      import('./features/recipe-nutrition/recipe-nutrition').then((module) => module.RecipeNutrition),
    title: 'Nutrition Link Analyse',
    data: { mode: 'analyze' },
  },
  {
    path: 'nutrition/suggestions',
    loadComponent: () =>
      import('./features/recipe-nutrition/recipe-nutrition').then((module) => module.RecipeNutrition),
    title: 'Nutrition Rezeptvorschläge',
    data: { mode: 'suggestions' },
  },
  {
    path: 'resources/new',
    loadComponent: () => import('./features/resource-tracker/resource-form').then((module) => module.ResourceForm),
    title: 'New Resource',
  },
  {
    path: 'resources/:resourceId/edit',
    loadComponent: () => import('./features/resource-tracker/resource-form').then((module) => module.ResourceForm),
    title: 'Edit Resource',
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./features/resource-tracker/resource-tracker').then((module) => module.ResourceTracker),
    title: 'Resources',
  },
  {
    path: 'mapper',
    loadComponent: () =>
      import('./features/swisstopo-map-generator/swisstopo-map-generator').then(
        (module) => module.SwisstopoMapGenerator,
      ),
    title: 'Mapper',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
