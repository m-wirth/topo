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
  protected readonly title = 'Rezept zu Nutrition Seite';
  protected readonly description = 'Platzhalterseite für die spätere Rezept-zu-Nutrition-Seite.';
}
