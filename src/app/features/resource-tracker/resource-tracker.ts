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

  protected scoreBackground(score: number | null): string {
    return this.scoreColor(score);
  }

  protected weeklySummaryBackground(score: number | null): string {
    const baseColor = this.scoreColor(score);
    const endColor = this.mixColors(baseColor, '#0f172a', 0.32);

    return `linear-gradient(160deg, ${baseColor}, ${endColor})`;
  }

  private scoreColor(score: number | null | undefined): string {
    if (score === null || score === undefined) {
      return '#475569';
    }

    if (score < 2.8) {
      return this.interpolateColor('#dc2626', '#f97316', this.clamp((score - 1) / 1.8));
    }

    if (score <= 3.2) {
      return this.interpolateColor('#38bdf8', '#2563eb', this.clamp((score - 2.8) / 0.4));
    }

    return this.interpolateColor('#2563eb', '#16a34a', this.clamp((score - 3.2) / 0.8));
  }

  private interpolateColor(start: string, end: string, amount: number): string {
    const from = this.hexToRgb(start);
    const to = this.hexToRgb(end);
    const rgb = from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));

    return this.rgbToHex(rgb);
  }

  private mixColors(color: string, mixWith: string, amount: number): string {
    return this.interpolateColor(color, mixWith, this.clamp(amount));
  }

  private hexToRgb(hex: string): [number, number, number] {
    const normalizedHex = hex.replace('#', '');

    return [
      Number.parseInt(normalizedHex.slice(0, 2), 16),
      Number.parseInt(normalizedHex.slice(2, 4), 16),
      Number.parseInt(normalizedHex.slice(4, 6), 16),
    ];
  }

  private rgbToHex(rgb: readonly number[]): string {
    return `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  private clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
  }
}
