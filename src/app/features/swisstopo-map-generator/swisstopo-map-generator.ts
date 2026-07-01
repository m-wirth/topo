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
  protected readonly title = 'Swisstopo Karten Generator';
  protected readonly description = 'Platzhalterseite für den späteren Swisstopo Karten Generator.';
}
