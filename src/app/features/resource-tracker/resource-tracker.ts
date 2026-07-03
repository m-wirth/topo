import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Rating, ratingScale, ResourceTrackerStore } from './resource-tracker-store';

@Component({
  selector: 'app-resource-tracker',
  imports: [FormsModule, RouterLink],
  templateUrl: './resource-tracker.html',
  styleUrl: './resource-tracker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceTracker {
  protected readonly ratingScale = ratingScale;
  protected readonly store = inject(ResourceTrackerStore);
  protected readonly resources = this.store.resources;
  protected readonly notification = this.store.notification;
  protected readonly week = this.store.week;

  protected removeResource(resourceId: string): void {
    this.store.removeResource(resourceId);
    this.store.showNotification({ kind: 'success', text: 'Resource removed.' });
  }

  protected clearNotification(): void {
    this.store.clearNotification();
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

  protected getWeeklyComment(weekKey: string): string {
    return this.store.getWeeklyComment(weekKey);
  }

  protected setWeeklyComment(weekKey: string, comment: string): void {
    this.store.setWeeklyComment(weekKey, comment);
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

  protected ratingClass(score: Rating | number | null | undefined): string {
    const severity = this.store.ratingSeverity(score);

    return severity === null ? 'rating-level--empty' : `rating-level--${severity}`;
  }

  protected ratingLabel(score: Rating | number | null | undefined): string {
    return this.store.ratingSeverityLabel(score);
  }
}
