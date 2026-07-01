import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ratingScale, ResourceDraft, ResourceTrackerStore } from './resource-tracker-store';

@Component({
  selector: 'app-resource-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './resource-form.html',
  styleUrl: './resource-tracker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ResourceTrackerStore);

  protected readonly ratingScale = ratingScale;
  protected readonly resourceId = this.route.snapshot.paramMap.get('resourceId');
  protected readonly resource = computed(() =>
    this.resourceId ? this.store.resources().find((resource) => resource.id === this.resourceId) : undefined,
  );
  protected readonly draft = signal<ResourceDraft>(this.store.createEmptyDraft(this.resource()));
  protected readonly isEditing = this.resourceId !== null;

  protected saveResource(): void {
    const savedResource = this.store.saveResourceDraft(this.draft());

    if (!savedResource) {
      return;
    }

    void this.router.navigate(['/resources']);
  }

  protected updateDraftName(name: string): void {
    this.draft.update((draft) => ({ ...draft, name }));
  }

  protected updateDraftDescription(description: string): void {
    this.draft.update((draft) => ({ ...draft, description }));
  }

  protected updateDraftRatingDescription(index: number, description: string): void {
    this.draft.update((draft) => {
      const ratingDescriptions = [...draft.ratingDescriptions] as ResourceDraft['ratingDescriptions'];
      ratingDescriptions[index] = description;

      return { ...draft, ratingDescriptions };
    });
  }
}
