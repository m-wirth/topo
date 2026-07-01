import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((module) => module.Home),
    title: 'Topo Dashboard',
  },
  {
    path: 'nutrition',
    loadComponent: () =>
      import('./features/recipe-nutrition/recipe-nutrition').then((module) => module.RecipeNutrition),
    title: 'Nutrition',
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
