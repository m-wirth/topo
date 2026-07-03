import { computed, effect, Injectable, signal } from '@angular/core';

export interface Resource {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly ratingDescriptions: readonly [string, string, string, string, string];
}

export interface ResourceDraft {
  id: string | null;
  name: string;
  description: string;
  ratingDescriptions: [string, string, string, string, string];
}

export interface CalendarDay {
  readonly key: string;
  readonly label: string;
  readonly weekday: string;
  readonly shortWeekday: string;
}

export interface CalendarWeek {
  readonly key: string;
  readonly label: string;
  readonly days: readonly CalendarDay[];
}

export type Rating = 1 | 2 | 3 | 4 | 5;
type DailyRatings = Record<string, Record<string, Rating | undefined>>;
type WeeklyComments = Record<string, string | undefined>;

export interface ResourceTrackerNotification {
  readonly kind: 'success' | 'error';
  readonly text: string;
}

export interface StoredResourceTrackerState {
  readonly resources?: readonly Resource[];
  readonly dailyRatings?: DailyRatings;
  readonly weeklyComments?: WeeklyComments;
}

export const ratingScale: readonly Rating[] = [1, 2, 3, 4, 5];
const weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shortWeekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const storageKey = 'topo.resource-tracker.v1';
const defaultResources: readonly Resource[] = [
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
];

@Injectable({ providedIn: 'root' })
export class ResourceTrackerStore {
  readonly weekOffset = signal(0);
  readonly resources = signal<readonly Resource[]>(defaultResources);
  readonly dailyRatings = signal<DailyRatings>({});
  readonly weeklyComments = signal<WeeklyComments>({});
  readonly notification = signal<ResourceTrackerNotification | null>(null);
  readonly week = computed(() => this.createWeek(this.weekOffset()));

  constructor() {
    const storedState = this.readStoredState();

    if (storedState?.resources) {
      this.resources.set(storedState.resources);
    }

    if (storedState?.dailyRatings) {
      this.dailyRatings.set(storedState.dailyRatings);
    }

    if (storedState?.weeklyComments) {
      this.weeklyComments.set(storedState.weeklyComments);
    }

    effect(() => {
      this.writeStoredState({
        resources: this.resources(),
        dailyRatings: this.dailyRatings(),
        weeklyComments: this.weeklyComments(),
      });
    });
  }

  createEmptyDraft(resource?: Resource): ResourceDraft {
    return resource
      ? {
          id: resource.id,
          name: resource.name,
          description: resource.description,
          ratingDescriptions: [...resource.ratingDescriptions],
        }
      : {
          id: null,
          name: '',
          description: '',
          ratingDescriptions: ['', '', '', '', ''],
        };
  }

  saveResourceDraft(draft: ResourceDraft): Resource | null {
    const resource = this.normalizeDraft(draft);

    if (!resource) {
      return null;
    }

    if (draft.id) {
      this.resources.update((resources) =>
        resources.map((existingResource) =>
          existingResource.id === draft.id ? { ...resource, id: existingResource.id } : existingResource,
        ),
      );
    } else {
      this.resources.update((resources) => [...resources, resource]);
    }

    this.persistCurrentState();

    return resource;
  }

  removeResource(resourceId: string): void {
    this.resources.update((resources) => resources.filter((resource) => resource.id !== resourceId));
    this.dailyRatings.update((ratings) => {
      const nextRatings: DailyRatings = {};

      Object.entries(ratings).forEach(([dayKey, resourceRatings]) => {
        const { [resourceId]: _removedRating, ...remainingRatings } = resourceRatings;
        nextRatings[dayKey] = remainingRatings;
      });

      return nextRatings;
    });
    this.persistCurrentState();
  }

  previousWeek(): void {
    this.weekOffset.update((offset) => offset - 7);
  }

  nextWeek(): void {
    this.weekOffset.update((offset) => offset + 7);
  }

  currentWeek(): void {
    this.weekOffset.set(0);
  }

  getRating(dayKey: string, resourceId: string): Rating | undefined {
    return this.dailyRatings()[dayKey]?.[resourceId];
  }

  setRating(dayKey: string, resourceId: string, rating: Rating): void {
    this.dailyRatings.update((ratings) => ({
      ...ratings,
      [dayKey]: {
        ...(ratings[dayKey] ?? {}),
        [resourceId]: ratings[dayKey]?.[resourceId] === rating ? undefined : rating,
      },
    }));
    this.persistCurrentState();
  }

  getWeeklyComment(weekKey: string): string {
    return this.weeklyComments()[weekKey] ?? '';
  }

  setWeeklyComment(weekKey: string, comment: string): void {
    const trimmedComment = comment.trim();

    this.weeklyComments.update((comments) => {
      if (!trimmedComment) {
        const { [weekKey]: _removedComment, ...remainingComments } = comments;
        return remainingComments;
      }

      return {
        ...comments,
        [weekKey]: comment,
      };
    });
    this.persistCurrentState();
  }

  weeklyAverage(resourceId: string): number | null {
    const values = this.week()
      .days.map((day) => this.dailyRatings()[day.key]?.[resourceId])
      .filter((rating): rating is Rating => rating !== undefined);

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  }

  weeklyOverallScore(): number | null {
    const resourceIds = this.resources().map((resource) => resource.id);
    const values = this.week().days.flatMap((day) =>
      resourceIds
        .map((resourceId) => this.dailyRatings()[day.key]?.[resourceId])
        .filter((rating): rating is Rating => rating !== undefined),
    );

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  }

  formatScore(score: number | null): string {
    return score === null ? '—' : score.toFixed(1);
  }

  showNotification(notification: ResourceTrackerNotification): void {
    this.notification.set(notification);
  }

  clearNotification(): void {
    this.notification.set(null);
  }

  private normalizeDraft(draft: ResourceDraft): Resource | null {
    const name = draft.name.trim();
    const description = draft.description.trim();
    const ratingDescriptions = draft.ratingDescriptions.map(
      (text) => text.trim(),
    ) as ResourceDraft['ratingDescriptions'];

    if (!name || !description || ratingDescriptions.some((text) => !text)) {
      return null;
    }

    return {
      id: draft.id ?? this.createResourceId(name),
      name,
      description,
      ratingDescriptions,
    };
  }

  private createWeek(offset: number): CalendarWeek {
    const weekStart = this.startOfCurrentWeek();
    weekStart.setDate(weekStart.getDate() + offset);
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);

      return {
        key: this.toDateKey(date),
        label: new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(date),
        weekday: weekdayLabels[dayIndex],
        shortWeekday: shortWeekdayLabels[dayIndex],
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
    };
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

  private readStoredState(): StoredResourceTrackerState | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    const storedState = storage.getItem(storageKey);

    if (!storedState) {
      return null;
    }

    try {
      return JSON.parse(storedState) as StoredResourceTrackerState;
    } catch {
      storage.removeItem(storageKey);
      return null;
    }
  }

  private persistCurrentState(): void {
    this.writeStoredState({
      resources: this.resources(),
      dailyRatings: this.dailyRatings(),
      weeklyComments: this.weeklyComments(),
    });
  }

  private writeStoredState(state: StoredResourceTrackerState): void {
    this.getStorage()?.setItem(storageKey, JSON.stringify(state));
  }

  private getStorage(): Storage | null {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  }
}
