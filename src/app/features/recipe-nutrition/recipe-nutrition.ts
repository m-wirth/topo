import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-nutrition',
  imports: [RouterLink],
  templateUrl: '../../shared/placeholder-page.html',
  styleUrl: '../../shared/placeholder-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeNutrition {
  protected readonly title = 'Nutrition';
  protected readonly description = 'Die Rezept-zu-Nutrition-Seite ist als Navigationsziel vorbereitet.';
  protected readonly comingSoon =
    'Hier entsteht eine Seite, die Rezepte aufnimmt und daraus strukturierte Nährwertinformationen ableitet.';
}
