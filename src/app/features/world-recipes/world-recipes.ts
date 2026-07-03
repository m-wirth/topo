import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type CountryKey = 'italy' | 'thailand' | 'india' | 'japan' | 'greece';

interface Recipe {
  readonly title: string;
  readonly intro: string;
  readonly prepTime: string;
  readonly difficulty: string;
  readonly servings: string;
  readonly ingredients: readonly string[];
  readonly steps: readonly string[];
}

interface RecipeCountry {
  readonly key: CountryKey;
  readonly name: string;
  readonly mapLabel: string;
  readonly cuisineNote: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly recipes: readonly Recipe[];
}

const countries: readonly RecipeCountry[] = [
  {
    key: 'italy',
    name: 'Italien',
    mapLabel: 'IT',
    cuisineNote: 'Mediterrane Klassiker mit Pasta, Reis und viel Aroma.',
    position: { x: 48, y: 43 },
    recipes: [
      {
        title: 'Spaghetti Carbonara',
        intro: 'Cremige Pasta ohne Rahm, gebunden mit Ei, Pecorino und knusprigem Guanciale.',
        prepTime: '25 Min.',
        difficulty: 'Mittel',
        servings: '2 Personen',
        ingredients: ['220 g Spaghetti', '90 g Guanciale oder Pancetta', '2 Eigelb', '35 g Pecorino Romano', 'Schwarzer Pfeffer'],
        steps: ['Pasta in kräftig gesalzenem Wasser al dente kochen.', 'Guanciale langsam auslassen, bis er goldbraun ist.', 'Eigelb, Pecorino und Pfeffer mit wenig Pastawasser glatt rühren.', 'Pasta in der Pfanne schwenken, vom Herd ziehen und die Ei-Käse-Mischung cremig unterziehen.'],
      },
      {
        title: 'Risotto alla Milanese',
        intro: 'Safranrisotto mit samtiger Textur und nussigem Parmesan-Finish.',
        prepTime: '35 Min.',
        difficulty: 'Mittel',
        servings: '3 Personen',
        ingredients: ['250 g Risottoreis', '1 kleine Zwiebel', '1 l Gemüsebouillon', '1 Briefchen Safran', '60 g Parmesan', '40 g Butter'],
        steps: ['Zwiebel fein würfeln und in Butter glasig dünsten.', 'Reis zugeben und rühren, bis die Körner leicht transparent sind.', 'Nach und nach heisse Bouillon und Safran einarbeiten.', 'Mit Parmesan und kalter Butter cremig fertigstellen.'],
      },
      {
        title: 'Bruschetta al Pomodoro',
        intro: 'Geröstetes Brot mit Tomaten, Basilikum und Olivenöl als schneller Antipasto.',
        prepTime: '15 Min.',
        difficulty: 'Einfach',
        servings: '4 Stück',
        ingredients: ['4 Scheiben Ciabatta', '3 reife Tomaten', '1 Knoblauchzehe', 'Basilikum', 'Olivenöl', 'Meersalz'],
        steps: ['Brot rösten und mit Knoblauch einreiben.', 'Tomaten würfeln und mit Basilikum, Öl und Salz mischen.', 'Tomaten kurz ziehen lassen.', 'Auf dem warmen Brot verteilen und sofort servieren.'],
      },
    ],
  },
  {
    key: 'thailand', name: 'Thailand', mapLabel: 'TH', cuisineNote: 'Balance aus Schärfe, Säure, Süsse und frischen Kräutern.', position: { x: 72, y: 55 },
    recipes: [
      { title: 'Pad Thai', intro: 'Gebratene Reisnudeln mit Tamarinde, Ei, Tofu und Erdnüssen.', prepTime: '30 Min.', difficulty: 'Mittel', servings: '2 Personen', ingredients: ['180 g Reisnudeln', '120 g Tofu', '2 Eier', '2 EL Tamarindenpaste', '1 EL Fischsauce oder Sojasauce', 'Erdnüsse', 'Limette'], steps: ['Nudeln einweichen.', 'Tofu anbraten, Eier stocken lassen.', 'Sauce aus Tamarinde, Zucker und Sauce einrühren.', 'Nudeln schwenken und mit Erdnüssen sowie Limette servieren.'] },
      { title: 'Grünes Thai-Curry', intro: 'Duftendes Kokoscurry mit Gemüse, Thai-Basilikum und grüner Currypaste.', prepTime: '35 Min.', difficulty: 'Einfach', servings: '3 Personen', ingredients: ['2 EL grüne Currypaste', '400 ml Kokosmilch', '300 g Gemüse', '200 g Poulet oder Tofu', 'Thai-Basilikum', 'Jasminreis'], steps: ['Currypaste im Kokosfett anrösten.', 'Kokosmilch angiessen und Fleisch oder Tofu garen.', 'Gemüse zugeben und bissfest köcheln.', 'Mit Basilikum abschliessen und zu Reis reichen.'] },
      { title: 'Som Tam', intro: 'Knackiger Papayasalat mit Limette, Chili, Erdnüssen und Tomaten.', prepTime: '20 Min.', difficulty: 'Einfach', servings: '2 Personen', ingredients: ['1 grüne Papaya', '2 Chilis', '1 Limette', '1 EL Palmzucker', '1 EL Fischsauce oder Sojasauce', 'Erdnüsse', 'Cherrytomaten'], steps: ['Papaya in feine Streifen hobeln.', 'Chili, Zucker, Limettensaft und Sauce zerstossen.', 'Tomaten und Papaya locker einarbeiten.', 'Mit Erdnüssen bestreuen.'] },
    ],
  },
  {
    key: 'india', name: 'Indien', mapLabel: 'IN', cuisineNote: 'Gewürzreiche Gerichte mit Hülsenfrüchten, Reis und cremigen Saucen.', position: { x: 65, y: 51 },
    recipes: [
      { title: 'Chana Masala', intro: 'Kichererbsencurry mit Tomaten, Ingwer und Garam Masala.', prepTime: '30 Min.', difficulty: 'Einfach', servings: '3 Personen', ingredients: ['400 g Kichererbsen', '1 Zwiebel', '2 Tomaten', 'Ingwer', 'Garam Masala', 'Koriander'], steps: ['Zwiebel, Knoblauch und Ingwer anbraten.', 'Gewürze kurz rösten.', 'Tomaten und Kichererbsen zugeben.', 'Sämig köcheln und mit Koriander servieren.'] },
      { title: 'Butter Chicken', intro: 'Mildes Poulet in Tomaten-Butter-Sauce mit wärmenden Gewürzen.', prepTime: '45 Min.', difficulty: 'Mittel', servings: '4 Personen', ingredients: ['500 g Poulet', 'Joghurt', 'Tomatenpassata', 'Butter', 'Garam Masala', 'Rahm'], steps: ['Poulet in Joghurt und Gewürzen marinieren.', 'Anbraten und beiseitestellen.', 'Tomatensauce mit Butter einkochen.', 'Poulet darin garziehen und mit Rahm abrunden.'] },
      { title: 'Masoor Dal', intro: 'Rote Linsen mit Kreuzkümmel, Kurkuma und aromatischem Tadka.', prepTime: '25 Min.', difficulty: 'Einfach', servings: '3 Personen', ingredients: ['220 g rote Linsen', 'Kurkuma', 'Kreuzkümmel', '1 Zwiebel', '2 Knoblauchzehen', 'Koriander'], steps: ['Linsen mit Kurkuma weich kochen.', 'Zwiebel, Knoblauch und Kreuzkümmel in Öl braten.', 'Tadka unter die Linsen rühren.', 'Mit Reis oder Naan servieren.'] },
    ],
  },
  {
    key: 'japan', name: 'Japan', mapLabel: 'JP', cuisineNote: 'Klare Umami-Aromen, Reis, Brühen und präzise Zubereitung.', position: { x: 83, y: 41 },
    recipes: [
      { title: 'Miso-Ramen', intro: 'Nudelsuppe mit Miso-Brühe, Gemüse, Ei und Frühlingszwiebeln.', prepTime: '40 Min.', difficulty: 'Mittel', servings: '2 Personen', ingredients: ['2 Portionen Ramen-Nudeln', '2 EL Miso', '700 ml Gemüsebrühe', 'Pak Choi', 'Eier', 'Frühlingszwiebeln'], steps: ['Brühe erhitzen und Miso einrühren.', 'Gemüse kurz garen.', 'Nudeln separat kochen.', 'Alles in Schalen anrichten und mit Ei toppen.'] },
      { title: 'Okonomiyaki', intro: 'Herzhafter Kohl-Pfannkuchen mit würziger Sauce.', prepTime: '30 Min.', difficulty: 'Einfach', servings: '2 Personen', ingredients: ['250 g Weisskohl', '120 g Mehl', '2 Eier', 'Dashi oder Wasser', 'Okonomiyaki-Sauce', 'Mayonnaise'], steps: ['Teig aus Mehl, Ei und Dashi rühren.', 'Kohl unterheben.', 'Dick in der Pfanne ausbacken.', 'Mit Sauce und Mayonnaise garnieren.'] },
      { title: 'Onigiri', intro: 'Gefüllte Reisbällchen mit Nori, perfekt für unterwegs.', prepTime: '25 Min.', difficulty: 'Einfach', servings: '6 Stück', ingredients: ['300 g Sushireis', 'Nori-Blätter', 'Salz', 'Lachs oder Umeboshi', 'Sesam'], steps: ['Reis kochen und handwarm abkühlen lassen.', 'Hände salzen und Reis formen.', 'Füllung in die Mitte geben.', 'Mit Nori umwickeln.'] },
    ],
  },
  {
    key: 'greece', name: 'Griechenland', mapLabel: 'GR', cuisineNote: 'Frische Kräuter, Olivenöl, Gemüse und cremiger Feta.', position: { x: 52, y: 47 },
    recipes: [
      { title: 'Horiatiki', intro: 'Griechischer Bauernsalat mit Tomaten, Gurke, Oliven und Feta.', prepTime: '15 Min.', difficulty: 'Einfach', servings: '2 Personen', ingredients: ['Tomaten', 'Gurke', 'rote Zwiebel', 'Feta', 'Oliven', 'Oregano', 'Olivenöl'], steps: ['Gemüse grob schneiden.', 'Mit Oliven und Feta anrichten.', 'Mit Oregano, Öl und Salz würzen.', 'Ohne Blattsalat servieren.'] },
      { title: 'Spanakopita', intro: 'Knuspriger Filoteig mit Spinat-Feta-Füllung.', prepTime: '50 Min.', difficulty: 'Mittel', servings: '4 Personen', ingredients: ['Filoteig', '500 g Spinat', '200 g Feta', 'Dill', 'Frühlingszwiebeln', 'Olivenöl'], steps: ['Spinat zusammenfallen lassen und ausdrücken.', 'Mit Feta, Dill und Zwiebeln mischen.', 'Filoteig lagenweise ölen und füllen.', 'Goldbraun backen.'] },
      { title: 'Souvlaki', intro: 'Marinierte Grillspiesschen mit Zitrone, Oregano und Tzatziki.', prepTime: '35 Min.', difficulty: 'Einfach', servings: '3 Personen', ingredients: ['500 g Poulet oder Schwein', 'Zitrone', 'Oregano', 'Knoblauch', 'Olivenöl', 'Tzatziki'], steps: ['Fleisch würfeln und marinieren.', 'Auf Spiesse stecken.', 'Heiss grillieren oder braten.', 'Mit Pita und Tzatziki servieren.'] },
    ],
  },
];

@Component({
  selector: 'app-world-recipes',
  imports: [RouterLink],
  templateUrl: './world-recipes.html',
  styleUrl: './world-recipes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldRecipes {
  protected readonly countries = countries;
  protected readonly selectedCountryKey = signal<CountryKey>('italy');
  protected readonly selectedRecipe = signal<Recipe | null>(null);
  protected readonly selectedCountry = computed(() => countries.find((country) => country.key === this.selectedCountryKey()) ?? countries[0]);

  protected selectCountry(country: RecipeCountry): void {
    this.selectedCountryKey.set(country.key);
    this.selectedRecipe.set(null);
  }

  protected openRecipe(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
  }

  protected closeReader(): void {
    this.selectedRecipe.set(null);
  }
}
