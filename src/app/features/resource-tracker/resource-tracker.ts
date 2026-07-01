import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resource-tracker',
  imports: [RouterLink],
  templateUrl: '../../shared/placeholder-page.html',
  styleUrl: '../../shared/placeholder-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceTracker {
  protected readonly title = 'Resources';
  protected readonly description = 'Der Ressourcen Tracker ist als Navigationsziel vorbereitet.';
  protected readonly comingSoon =
    'Hier entsteht eine Übersicht für Ressourcen, Kapazitäten, Verantwortlichkeiten und Statusinformationen.';
}
