import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Big7Key = 'energy' | 'fat' | 'saturatedFat' | 'carbohydrates' | 'sugars' | 'protein' | 'salt';
type NutritionValue = Record<Big7Key, number>;
type LoadState = 'idle' | 'loading' | 'success' | 'error';

interface AiRecipePayload {
  title?: string;
  servingSizeGram?: number;
  perServing?: Partial<NutritionValue>;
  per100g?: Partial<NutritionValue>;
}

interface Big7Nutrient {
  key: Big7Key;
  label: string;
  unit: string;
  max: number;
  step: number;
}

interface DietAdaptation {
  goal: string;
  description: string;
  changes: string[];
}

interface RecipeAnalysis {
  title: string;
  source: string;
  url: string;
  servingSize: number;
  per100g: NutritionValue;
  perServing: NutritionValue;
  confidence: string;
  adaptations: DietAdaptation[];
}

interface RecipeSuggestion {
  title: string;
  source: string;
  url: string;
  match: number;
  reason: string;
  nutrition: NutritionValue;
}

interface RecipeSource {
  name: string;
  host: string;
  searchUrl: (query: string) => string;
}

const nutrients: Big7Nutrient[] = [
  { key: 'energy', label: 'Energie', unit: 'kcal', max: 900, step: 10 },
  { key: 'fat', label: 'Fett', unit: 'g', max: 80, step: 1 },
  { key: 'saturatedFat', label: 'Gesättigte Fettsäuren', unit: 'g', max: 30, step: 0.5 },
  { key: 'carbohydrates', label: 'Kohlenhydrate', unit: 'g', max: 140, step: 1 },
  { key: 'sugars', label: 'Zucker', unit: 'g', max: 60, step: 1 },
  { key: 'protein', label: 'Protein', unit: 'g', max: 80, step: 1 },
  { key: 'salt', label: 'Salz', unit: 'g', max: 8, step: 0.1 },
];

const defaultRemaining: NutritionValue = {
  energy: 550,
  fat: 22,
  saturatedFat: 7,
  carbohydrates: 58,
  sugars: 16,
  protein: 35,
  salt: 2.1,
};

const recipeSources: RecipeSource[] = [
  { name: 'Fooby', host: 'fooby.ch', searchUrl: (query) => `https://fooby.ch/de/rezepte.html?query=${encodeURIComponent(query)}` },
  { name: 'Migusto', host: 'migusto.migros.ch', searchUrl: (query) => `https://migusto.migros.ch/de/suche.html?query=${encodeURIComponent(query)}` },
  { name: 'Betty Bossi', host: 'bettybossi.ch', searchUrl: (query) => `https://www.bettybossi.ch/de/Rezept/List?query=${encodeURIComponent(query)}` },
];

const emptyNutrition: NutritionValue = {
  energy: 0,
  fat: 0,
  saturatedFat: 0,
  carbohydrates: 0,
  sugars: 0,
  protein: 0,
  salt: 0,
};

@Component({
  selector: 'app-recipe-nutrition',
  imports: [FormsModule, RouterLink],
  templateUrl: './recipe-nutrition.html',
  styleUrl: './recipe-nutrition.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeNutrition {
  protected readonly nutrients = nutrients;
  protected readonly recipeUrl = signal('');
  protected readonly apiKey = signal(localStorage.getItem('topo.openaiApiKey') ?? '');
  protected readonly analysis = signal<RecipeAnalysis | null>(null);
  protected readonly importState = signal<LoadState>('idle');
  protected readonly importMessage = signal('');
  protected readonly remaining = signal<NutritionValue>({ ...defaultRemaining });
  protected readonly suggestions = signal<RecipeSuggestion[]>([]);
  protected readonly suggestionState = signal<LoadState>('idle');
  protected readonly suggestionMessage = signal('');
  protected readonly queryFromRemaining = computed(() => this.createSearchQuery(this.remaining()));

  protected async analyzeRecipe(event: Event): Promise<void> {
    event.preventDefault();
    const url = this.recipeUrl().trim();
    if (!url) return;

    this.importState.set('loading');
    this.importMessage.set('Rezeptseite wird live gelesen …');
    this.analysis.set(null);

    try {
      const markdown = await this.fetchReadablePage(url);
      const parsed = this.extractRecipeData(markdown, url);
      const completed = await this.ensureNutrition(parsed, markdown, url);

      this.analysis.set({ ...completed, adaptations: this.createAdaptations(completed.perServing) });
      this.importState.set('success');
      this.importMessage.set('Live-Daten wurden aus der Rezeptseite gelesen; fehlende oder unstrukturierte Werte wurden bei Bedarf per AI geschätzt.');
    } catch (error) {
      this.importState.set('error');
      this.importMessage.set(this.errorMessage(error));
    }
  }

  protected async searchRecipes(event?: Event): Promise<void> {
    event?.preventDefault();
    this.suggestionState.set('loading');
    this.suggestionMessage.set('Drei Rezeptquellen werden live durchsucht …');
    this.suggestions.set([]);

    try {
      const target = this.remaining();
      const query = this.queryFromRemaining();
      const results = await Promise.all(recipeSources.map((source) => this.findBestFromSource(source, query, target)));
      const suggestions = results.filter((result): result is RecipeSuggestion => result !== null).sort((a, b) => b.match - a.match);
      this.suggestions.set(suggestions);
      this.suggestionState.set('success');
      this.suggestionMessage.set(`${suggestions.length} echte Rezepttreffer aus ${recipeSources.length} Quellen gefunden.`);
    } catch (error) {
      this.suggestionState.set('error');
      this.suggestionMessage.set(this.errorMessage(error));
    }
  }

  protected updateRecipeUrl(value: string): void {
    this.recipeUrl.set(value);
  }

  protected updateApiKey(value: string): void {
    this.apiKey.set(value.trim());
    if (value.trim()) localStorage.setItem('topo.openaiApiKey', value.trim());
    else localStorage.removeItem('topo.openaiApiKey');
  }

  protected updateRemaining(key: Big7Key, value: string): void {
    const nextValue = Number(value);
    this.remaining.update((current) => ({ ...current, [key]: Number.isFinite(nextValue) ? nextValue : 0 }));
  }

  protected valueFor(nutrition: NutritionValue, nutrient: Big7Nutrient): string {
    const value = nutrition[nutrient.key];
    return nutrient.step < 1 ? value.toFixed(1) : Math.round(value).toString();
  }

  private async findBestFromSource(source: RecipeSource, query: string, target: NutritionValue): Promise<RecipeSuggestion | null> {
    const searchMarkdown = await this.fetchReadablePage(source.searchUrl(query));
    const urls = await this.findRecipeUrlsFromSearch(searchMarkdown, source, query);
    const candidates = await Promise.all(urls.slice(0, 5).map(async (url) => {
      const markdown = await this.fetchReadablePage(url);
      const parsed = this.extractRecipeData(markdown, url, source.name);
      const recipe = await this.ensureNutrition(parsed, markdown, url);
      return this.toSuggestion(recipe, target);
    }));

    return candidates.sort((a, b) => b.match - a.match)[0] ?? null;
  }

  private async fetchReadablePage(url: string): Promise<string> {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error(`Die Seite konnte nicht gelesen werden (${response.status}).`);
    const text = await response.text();
    if (text.length < 200) throw new Error('Die Rezeptseite lieferte zu wenig auswertbaren Inhalt.');
    return text;
  }

  private extractRecipeData(markdown: string, url: string, source = this.detectSource(url)): RecipeAnalysis {
    const title = this.findFirst(markdown, [/^Title:\s*(.+)$/im, /^#\s+(.+)$/im]) ?? 'Gelesenes Rezept';
    const servingSize = this.extractServingSize(markdown);
    const perServing = this.extractNutrition(markdown);
    const per100g = servingSize > 0 ? this.scaleNutrition(perServing, 100 / servingSize) : { ...emptyNutrition };

    return {
      title: title.replace(/\s+\|\s+.*$/, '').trim(),
      source,
      url,
      servingSize,
      per100g,
      perServing,
      confidence: this.hasCompleteNutrition(perServing) ? 'aus Rezeptseite gelesen' : 'unvollständig gelesen',
      adaptations: [],
    };
  }

  private extractNutrition(markdown: string): NutritionValue {
    return {
      energy: this.findNutrient(markdown, ['kcal', 'kalorien', 'energie', 'calories']),
      fat: this.findNutrient(markdown, ['fett', 'fat']),
      saturatedFat: this.findNutrient(markdown, ['gesättigte', 'gesaettigte', 'saturated']),
      carbohydrates: this.findNutrient(markdown, ['kohlenhydrate', 'carbohydrate', 'carbs']),
      sugars: this.findNutrient(markdown, ['zucker', 'sugar']),
      protein: this.findNutrient(markdown, ['protein', 'eiweiss', 'eiweiß']),
      salt: this.findNutrient(markdown, ['salz', 'salt']),
    };
  }

  private findNutrient(markdown: string, labels: string[]): number {
    const lines = markdown.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (!labels.some((label) => lower.includes(label))) continue;
      const match = line.match(/(\d+(?:[.,]\d+)?)\s*(?:g|kcal|cal)?/i);
      if (match) return Number(match[1].replace(',', '.'));
    }
    return 0;
  }

  private extractServingSize(markdown: string): number {
    const value = this.findFirst(markdown, [
      /(?:portion|serving)[^\n]{0,40}(\d+(?:[.,]\d+)?)\s*g/i,
      /(?:ergibt|für|fuer)[^\n]{0,40}(\d+)\s*(?:portion|person)/i,
    ]);
    const parsed = Number(value?.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 20 ? parsed : 350;
  }

  private extractLinks(markdown: string, host: string): string[] {
    const matches = [...markdown.matchAll(/https?:\/\/[^\s)\]]+/g)].map((match) => match[0].replace(/[.,;]+$/, ''));
    return [...new Set(matches)].filter((url) => url.includes(host) && /rezept|recipe/i.test(url));
  }

  private async findRecipeUrlsFromSearch(markdown: string, source: RecipeSource, query: string): Promise<string[]> {
    const regexLinks = this.extractLinks(markdown, source.host);
    if (regexLinks.length > 0) return regexLinks;
    if (!this.apiKey()) {
      throw new Error(`Keine Rezeptlinks für ${source.name} gefunden. Bitte API-Key hinterlegen, damit AI die Suchseite ohne fixes Format interpretieren kann.`);
    }

    return this.extractLinksWithAi(markdown, source, query);
  }

  private async ensureNutrition(parsed: RecipeAnalysis, markdown: string, url: string): Promise<RecipeAnalysis> {
    if (this.hasCompleteNutrition(parsed.perServing)) return parsed;
    if (!this.apiKey()) {
      throw new Error('Die Rezeptseite enthält keine vollständig lesbaren Big-7-Labels. Bitte API-Key hinterlegen, damit AI die Werte aus Zutaten, Portionen und Text schätzen kann.');
    }

    return this.completeWithAi(parsed, markdown, url);
  }

  private async extractLinksWithAi(markdown: string, source: RecipeSource, query: string): Promise<string[]> {
    const prompt = `Du siehst den geladenen Inhalt einer Rezept-Suchseite. Finde echte Rezept-Detail-URLs für ${source.name} zum Suchprofil "${query}". Es gibt kein fixes HTML-Format. Antworte nur als JSON: {"urls":["https://..."]}. Inhalt:

${markdown.slice(0, 10000)}`;
    const text = await this.callOpenAi(prompt);
    const json = this.parseJson<{ urls?: string[] }>(text);
    return [...new Set(json?.urls ?? [])].filter((url) => url.includes(source.host));
  }

  private async completeWithAi(parsed: RecipeAnalysis, markdown: string, url: string): Promise<RecipeAnalysis> {
    const key = this.apiKey();
    if (!key) return parsed;

    const prompt = `Extrahiere oder schätze aus diesem unstrukturierten Rezepttext die Big-7-Nährwerte. Falls explizite Nährwertlabels fehlen, berechne plausible Werte aus Zutaten, Mengen und Portionen. Antworte nur als JSON mit title, servingSizeGram, perServing und per100g. URL: ${url}\n\n${markdown.slice(0, 12000)}`;
    const text = await this.callOpenAi(prompt);
    const ai = this.parseJson<AiRecipePayload>(text);
    if (!ai) return parsed;

    return {
      ...parsed,
      title: ai.title ?? parsed.title,
      servingSize: Number(ai.servingSizeGram ?? parsed.servingSize),
      perServing: this.normalizeNutrition(ai.perServing ?? parsed.perServing),
      per100g: this.normalizeNutrition(ai.per100g ?? parsed.per100g),
      confidence: 'mit AI aus unstrukturiertem Rezeptinhalt geschätzt',
    };
  }

  private async callOpenAi(prompt: string): Promise<string> {
    const key = this.apiKey();
    if (!key) throw new Error('Für diese unstrukturierte Seite wird ein OpenAI API-Key benötigt.');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt }),
    });
    if (!response.ok) throw new Error(`AI-Fallback fehlgeschlagen (${response.status}).`);
    const data = await response.json();
    return data.output_text ?? data.output?.flatMap((item: { content?: { text?: string }[] }) => item.content ?? []).map((content: { text?: string }) => content.text ?? '').join('') ?? '';
  }

  private parseJson<T>(text: string): T | null {
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return null;
    return JSON.parse(json) as T;
  }

  private normalizeNutrition(value: Partial<NutritionValue>): NutritionValue {
    return Object.fromEntries(nutrients.map((nutrient) => [nutrient.key, Number(value[nutrient.key] ?? 0)])) as NutritionValue;
  }

  private toSuggestion(recipe: RecipeAnalysis, target: NutritionValue): RecipeSuggestion {
    const distance = nutrients.reduce((sum, nutrient) => sum + Math.abs(recipe.perServing[nutrient.key] - target[nutrient.key]) / nutrient.max, 0);
    const match = Math.max(1, Math.min(99, Math.round(100 - distance * 38)));
    return {
      title: recipe.title,
      source: recipe.source,
      url: recipe.url,
      match,
      reason: `Live gelesene Portion passt am besten zu ${this.bestMatchingNutrient(recipe.perServing, target)}.`,
      nutrition: recipe.perServing,
    };
  }

  private createAdaptations(nutrition: NutritionValue): DietAdaptation[] {
    return [
      { goal: 'High Protein', description: 'Proteinanteil erhöhen, ohne die Kalorien stark zu steigern.', changes: ['Magerquark, Skyr, Tofu, Poulet oder Hülsenfrüchte ergänzen.', 'Ölmenge leicht reduzieren und Protein-Beilage verdoppeln.'] },
      { goal: 'Low Carb', description: 'Kohlenhydrate und Zucker reduzieren.', changes: ['Pasta, Reis oder Kartoffeln teilweise durch Zucchetti, Blumenkohlreis oder Salat ersetzen.', nutrition.carbohydrates > 60 ? 'Süsse Saucen halbieren und mehr Kräuter/Säure einsetzen.' : 'Kohlenhydrat-Beilage beibehalten, Portion aber kleiner wählen.'] },
      { goal: 'Vegetarisch', description: 'Fleisch/Fisch durch pflanzliche Proteinträger austauschen.', changes: ['Poulet oder Fisch durch Tofu, Tempeh, Linsen oder Kichererbsen ersetzen.', 'Umami mit Pilzen, Sojasauce oder gerösteten Nüssen aufbauen.'] },
      { goal: 'Herzfreundlich', description: 'Salz und gesättigte Fettsäuren senken.', changes: ['Salz über Kräuter, Zitrone und Gewürze ersetzen.', nutrition.saturatedFat > 12 ? 'Rahm, Butter oder Käse durch Joghurt, Olivenöl oder Nuss-Topping ersetzen.' : 'Ungesättigte Fettquellen priorisieren und Käse als Akzent nutzen.'] },
    ];
  }

  private createSearchQuery(target: NutritionValue): string {
    if (target.protein >= 35 && target.carbohydrates <= 30) return 'high protein low carb';
    if (target.carbohydrates <= 25) return 'low carb';
    if (target.protein >= 35) return 'proteinreich';
    if (target.fat <= 15) return 'leicht fettarm';
    return 'gesund ausgewogen';
  }

  private hasCompleteNutrition(nutrition: NutritionValue): boolean {
    return nutrients.every((nutrient) => nutrition[nutrient.key] > 0);
  }

  private scaleNutrition(nutrition: NutritionValue, factor: number): NutritionValue {
    return Object.fromEntries(nutrients.map((nutrient) => [nutrient.key, Number((nutrition[nutrient.key] * factor).toFixed(1))])) as NutritionValue;
  }

  private bestMatchingNutrient(recipe: NutritionValue, target: NutritionValue): string {
    return nutrients.reduce((best, nutrient) => Math.abs(recipe[nutrient.key] - target[nutrient.key]) < Math.abs(recipe[best.key] - target[best.key]) ? nutrient : best, nutrients[0]).label;
  }

  private detectSource(url: string): string {
    const hostname = this.safeHostname(url);
    return recipeSources.find((source) => hostname.includes(source.host))?.name ?? hostname;
  }

  private safeHostname(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private findFirst(markdown: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = markdown.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden echter Rezeptdaten.';
  }
}
