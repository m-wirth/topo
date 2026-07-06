import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardTile {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly thumbnailUrl?: string;
  readonly thumbnailAlt?: string;
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
      description: 'Analysiere Rezept-Links oder wechsle zu separaten Rezeptvorschlägen nach Nährwertbudget.',
      route: '/nutrition/analyze',
    },
    {
      eyebrow: 'Recipes',
      title: 'Welt-Rezeptsammlung',
      description: 'Wähle ein Land auf der Weltkarte und öffne Rezepte aus Italien, Thailand, Indien, Japan oder Griechenland im Lesermodus.',
      route: '/recipes',
    },
    {
      eyebrow: 'Resources',
      title: 'Ressourcen Tracker',
      description: 'Ressourcen, Kapazitäten und Status werden später zentral nachvollziehbar.',
      route: '/resources',
      thumbnailUrl: 'assets/icons/resources.svg',
      thumbnailAlt: 'Resources app balance scale icon',
    },
    {
      eyebrow: 'Mapper',
      title: 'Swisstopo Karten Generator',
      description: 'Swisstopo-Karten und Exporte werden später über diesen Bereich vorbereitet.',
      route: '/mapper',
    },
  ];
}
