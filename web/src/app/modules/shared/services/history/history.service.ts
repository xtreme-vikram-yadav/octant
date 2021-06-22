import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContentService } from '../content/content.service';

export interface ContentRoute {
  title: string;
  path: string;
}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  history: BehaviorSubject<ContentRoute[]>;
  private previousRoutes: ContentRoute[];
  private HISTORY_SIZE = 10;

  constructor(private contentService: ContentService) {
    this.history = new BehaviorSubject<ContentRoute[]>([]);
    this.previousRoutes = [];

    this.contentService.title.subscribe(nsTitle => {
      if (
        nsTitle.title?.length > 0 &&
        nsTitle.path !== '' &&
        nsTitle.path !== this.previousRoutes[0]?.path
      ) {
        const historyEntry = nsTitle.namespace
          ? `${nsTitle.title} | ${nsTitle.namespace}`
          : nsTitle.title;
        this.previousRoutes.unshift({
          title: historyEntry,
          path: nsTitle.path,
        });
        this.previousRoutes = this.previousRoutes.slice(
          0,
          this.HISTORY_SIZE + 1
        );

        this.history.next(this.previousRoutes.slice(1));
      }
    });
  }
}
