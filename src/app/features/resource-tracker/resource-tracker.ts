import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Resource {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly ratingDescriptions: readonly [string, string, string, string, string];
}

interface ResourceDraft {
  name: string;
  description: string;
  ratingDescriptions: [string, string, string, string, string];
}

interface CalendarDay {
  readonly key: string;
  readonly label: string;
  readonly weekday: string;
}

interface CalendarWeek {
  readonly key: string;
  readonly label: string;
  readonly days: readonly CalendarDay[];
}

type Rating = 1 | 2 | 3 | 4 | 5;
type DailyRatings = Record<string, Record<string, Rating | undefined>>;

const ratingScale: readonly Rating[] = [1, 2, 3, 4, 5];
const weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Component({
  selector: 'app-resource-tracker',
  imports: [FormsModule, RouterLink],
  templateUrl: './resource-tracker.html',
  styleUrl: './resource-tracker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceTracker {
  protected readonly ratingScale = ratingScale;
  protected readonly weeksToShow = 6;
  protected readonly weekOffset = signal(0);
  protected readonly resources = signal<readonly Resource[]>([
    {
      id: 'sleep',
      name: 'Sleep',
      description: 'Track the quality and duration of nightly sleep.',
      ratingDescriptions: [
        'Slept less than 5 hours a night.',
        'Slept less than 6 hours a night.',
        'Slept around 7 hours.',
        'Slept around 7.5 hours.',
        'Slept 8+ hours or woke up fully recovered.',
      ],
    },
  ]);
  protected readonly dailyRatings = signal<DailyRatings>({});
  protected readonly draft: ResourceDraft = {
    name: '',
    description: '',
    ratingDescriptions: ['', '', '', '', ''],
  };

  protected readonly weeks = computed(() => this.createWeeks(this.weekOffset(), this.weeksToShow));

  protected addResource(): void {
    const name = this.draft.name.trim();
    const description = this.draft.description.trim();
    const ratingDescriptions = this.draft.ratingDescriptions.map(
      (text) => text.trim(),
    ) as ResourceDraft['ratingDescriptions'];

    if (!name || !description || ratingDescriptions.some((text) => !text)) {
      return;
    }

    this.resources.update((resources) => [
      ...resources,
      {
        id: this.createResourceId(name),
        name,
        description,
        ratingDescriptions,
      },
    ]);

    this.draft.name = '';
    this.draft.description = '';
    this.draft.ratingDescriptions = ['', '', '', '', ''];
  }

  protected previousWeeks(): void {
    this.weekOffset.update((offset) => offset - this.weeksToShow);
  }

  protected nextWeeks(): void {
    this.weekOffset.update((offset) => offset + this.weeksToShow);
  }

  protected currentWeeks(): void {
    this.weekOffset.set(0);
  }

  protected getRating(dayKey: string, resourceId: string): Rating | '' {
    return this.dailyRatings()[dayKey]?.[resourceId] ?? '';
  }

  protected setRating(dayKey: string, resourceId: string, value: string): void {
    const parsed = Number(value);

    if (!ratingScale.includes(parsed as Rating)) {
      return;
    }

    this.dailyRatings.update((ratings) => ({
      ...ratings,
      [dayKey]: {
        ...(ratings[dayKey] ?? {}),
        [resourceId]: parsed as Rating,
      },
    }));
  }

  protected weeklyAverage(week: CalendarWeek, resourceId: string): number | null {
    const values = week.days
      .map((day) => this.dailyRatings()[day.key]?.[resourceId])
      .filter((rating): rating is Rating => rating !== undefined);

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  }

  protected weeklyOverallScore(week: CalendarWeek): number | null {
    const resourceIds = this.resources().map((resource) => resource.id);
    const values = week.days.flatMap((day) =>
      resourceIds
        .map((resourceId) => this.dailyRatings()[day.key]?.[resourceId])
        .filter((rating): rating is Rating => rating !== undefined),
    );

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  }

  protected formatScore(score: number | null): string {
    return score === null ? '—' : score.toFixed(1);
  }

  private createWeeks(offset: number, count: number): readonly CalendarWeek[] {
    const firstMonday = this.startOfCurrentWeek();
    firstMonday.setDate(firstMonday.getDate() + offset);

    return Array.from({ length: count }, (_, weekIndex) => {
      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + weekIndex * 7);
      const days = Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);

        return {
          key: this.toDateKey(date),
          label: new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(date),
          weekday: weekdayLabels[dayIndex],
        } satisfies CalendarDay;
      });

      return {
        key: this.toDateKey(weekStart),
        label: `Week of ${new Intl.DateTimeFormat('en', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(weekStart)}`,
        days,
      } satisfies CalendarWeek;
    });
  }

  private startOfCurrentWeek(): Date {
    const today = new Date();
    const day = today.getDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + distanceToMonday);

    return monday;
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private createResourceId(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${slug || 'resource'}-${Date.now()}`;
  }
}
