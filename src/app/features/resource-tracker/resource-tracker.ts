import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Rating, ratingScale, ResourceTrackerStore } from './resource-tracker-store';

@Component({
  selector: 'app-resource-tracker',
  imports: [RouterLink],
  templateUrl: './resource-tracker.html',
  styleUrl: './resource-tracker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceTracker {
  protected readonly ratingScale = ratingScale;
  protected readonly store = inject(ResourceTrackerStore);
  protected readonly resources = this.store.resources;
  protected readonly week = this.store.week;

  protected removeResource(resourceId: string): void {
    this.store.removeResource(resourceId);
  }

  protected previousWeek(): void {
    this.store.previousWeek();
  }

  protected nextWeek(): void {
    this.store.nextWeek();
  }

  protected currentWeek(): void {
    this.store.currentWeek();
  }

  protected getRating(dayKey: string, resourceId: string): Rating | undefined {
    return this.store.getRating(dayKey, resourceId);
  }

  protected setRating(dayKey: string, resourceId: string, rating: Rating): void {
    this.store.setRating(dayKey, resourceId, rating);
  }

  protected weeklyAverage(resourceId: string): number | null {
    return this.store.weeklyAverage(resourceId);
  }

  protected weeklyOverallScore(): number | null {
    return this.store.weeklyOverallScore();
  }

  protected formatScore(score: number | null): string {
    return this.store.formatScore(score);
  }
}
