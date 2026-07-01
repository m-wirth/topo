import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-swisstopo-map-generator',
  imports: [RouterLink],
  templateUrl: '../../shared/placeholder-page.html',
  styleUrl: '../../shared/placeholder-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwisstopoMapGenerator {
  protected readonly title = 'Mapper';
  protected readonly description = 'Der Swisstopo Karten Generator ist als Navigationsziel vorbereitet.';
  protected readonly comingSoon =
    'Hier entsteht ein Generator für Swisstopo-Karten, Kartenausschnitte und vorbereitete Export-Workflows.';
}
