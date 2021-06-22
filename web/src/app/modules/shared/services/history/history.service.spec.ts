import { TestBed } from '@angular/core/testing';
import { doesNotMatch } from 'assert';
import { ContentService } from '../content/content.service';
import { ContentServiceMock } from '../content/mock';

import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let contentService;
  let service: HistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HistoryService,
        { provide: ContentService, useClass: ContentServiceMock },
      ],
    });

    contentService = TestBed.inject(ContentService);
    service = TestBed.inject(HistoryService);
  });

  it('does not include the current visited page', () => {
    Array(2)
      .fill(0)
      .forEach((cp, i) => {
        contentService.pushTitle(`title-${i}`, `path-${i}`, `ns-${i}`);
      });

    service.history.subscribe(h => {
      expect([{ title: 'title-0 | ns-0', path: 'path-0' }]).toEqual(h);
    });
  });

  it('emits last 10 entries at max', () => {
    Array(21)
      .fill(0)
      .forEach((cp, i) =>
        contentService.pushTitle(`title-${i}`, `path-${i}`, `ns-${i}`)
      );

    let expected = Array(10)
      .fill(0)
      .map((_, i) => {
        return {
          title: `title-${i + 10} | ns-${i + 10}`,
          path: `path-${i + 10}`,
        };
      })
      .reverse();

    service.history.subscribe(h => {
      expect(expected).toEqual(h);
    });
  });

  it('does not update history when title is not available', () => {
    let contentResponses = Array(2)
      .fill(0)
      .map((_, i) => {
        return { title: `title-${i} | ns-${i}`, path: `path-${i}` };
      });

    Array(2)
      .fill(0)
      .forEach((_, i) => {
        contentService.pushTitle(`title-${i}`, `path-${i}`, `ns-${i}`);
      });
    contentService.pushTitle(null, '/workloads/namespace/milan', 'default');

    service.history.subscribe(h => {
      expect(contentResponses.slice(0, 1)).toEqual(h);
    });
  });

  it('does not update history when path does not change', () => {
    let contentResponses = Array(2)
      .fill(0)
      .map((_, i) => {
        return { title: `title-${i} | ns-${i}`, path: `path-${i}` };
      });

    Array(2)
      .fill(0)
      .forEach((_, i) => {
        contentService.pushTitle(`title-${i}`, `path-${i}`, `ns-${i}`);
      });
    contentService.pushTitle('title-1', 'path-1', 'ns-1');

    service.history.subscribe(h => {
      expect(contentResponses.slice(0, 1)).toEqual(h);
    });
  });

  it('does not include namespace when not available', () => {
    let contentResponses = Array(2)
      .fill(0)
      .map((_, i) => {
        return { title: `title-${i}`, path: `path-${i}` };
      });

    Array(2)
      .fill(0)
      .forEach((_, i) => {
        contentService.pushTitle(`title-${i}`, `path-${i}`, '');
      });

    service.history.subscribe(h => {
      expect(contentResponses.slice(0, 1)).toEqual(h);
    });
  });
});
