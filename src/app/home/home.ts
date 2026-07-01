import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardTile {
  readonly eyebrow: string;
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
  protected readonly dashboardTiles: readonly DashboardTile[] = [
    {
      eyebrow: 'Nutrition',
      title: 'Rezept zu Nutrition Seite',
      description: 'Rezeptdaten werden später in strukturierte Nährwertinformationen übersetzt.',
      route: '/nutrition',
    },
    {
      eyebrow: 'Resources',
      title: 'Ressourcen Tracker',
      description: 'Ressourcen, Kapazitäten und Status werden später zentral nachvollziehbar.',
      route: '/resources',
    },
    {
      eyebrow: 'Mapper',
      title: 'Swisstopo Karten Generator',
      description: 'Swisstopo-Karten und Exporte werden später über diesen Bereich vorbereitet.',
      route: '/mapper',
    },
  ];
}
