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
  protected readonly title = 'Ressourcen Tracker';
  protected readonly description = 'Platzhalterseite für den späteren Ressourcen Tracker.';
}
