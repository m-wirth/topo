import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AppTile {
  readonly title: string;
  readonly description: string;
  readonly route: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly appTiles: readonly AppTile[] = [
    {
      title: 'Ressourcen Tracker',
      description: 'Einstiegspunkt für die spätere Ressourcen-Planung.',
      route: '/ressourcen-tracker',
    },
    {
      title: 'Swisstopo Karten Generator',
      description: 'Einstiegspunkt für die spätere Karten-Erstellung.',
      route: '/swisstopo-karten-generator',
    },
    {
      title: 'Rezept zu Nutrition Seite',
      description: 'Einstiegspunkt für die spätere Rezept- und Nährwertseite.',
      route: '/rezept-zu-nutrition',
    },
  ];
}
