/*
 * Copyright (c) 2019 the Octant contributors. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';

import {
  ContentService,
  ContentUpdate,
  ContentUpdateMessage,
} from './content.service';
import { WebsocketServiceMock } from '../../../../data/services/websocket/mock';
import {
  BackendService,
  WebsocketService,
} from '../../../../data/services/websocket/websocket.service';
import { Router } from '@angular/router';
import {
  Filter,
  LabelFilterService,
} from '../label-filter/label-filter.service';
import { Title } from '@angular/platform-browser';

describe('ContentService', () => {
  let service: ContentService;
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContentService,
        LabelFilterService,
        {
          provide: WebsocketService,
          useClass: WebsocketServiceMock,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: Title,
          useValue: jasmine.createSpyObj('Title', ['getTitle', 'setTitle']),
        },
      ],
    });

    service = TestBed.inject(ContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('content update', () => {
    const update: ContentUpdate = {
      content: { extensionComponent: null, title: [], viewComponents: [] },
      namespace: 'default',
      contentPath: '/path',
      queryParams: {},
    };

    beforeEach(() => {
      const backendService = TestBed.inject(WebsocketService);
      backendService.triggerHandler(ContentUpdateMessage, update);
    });

    it('triggers a content change', () => {
      service.current.subscribe(current =>
        expect(current).toEqual({
          content: update.content,
          currentPath: '/path',
        })
      );
    });

    it('updates the title with namespace', () => {
      const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      router.navigate.and.callFake(() => {
        return new Promise(resolve => resolve(true));
      });
      const backendService = TestBed.inject(WebsocketService);
      let newUpdate = Object.assign(
        update,
        { contentPath: '/newPath' },
        {
          content: {
            viewComponents: [],
            title: [{ config: { value: 'foo-title' } }],
          },
        }
      );
      backendService.triggerHandler(ContentUpdateMessage, newUpdate);

      const titleServiceSpy = TestBed.inject(Title) as jasmine.SpyObj<Title>;
      expect(titleServiceSpy.setTitle).toHaveBeenCalledOnceWith(
        'Octant | foo-title | default'
      );
      service.title.subscribe(title => {
        expect(title).toEqual({
          namespace: 'default',
          title: 'foo-title',
          path: '/newPath',
        });
      });
    });

    it('updates the title without namespace', () => {
      const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      router.navigate.and.callFake(() => {
        return new Promise(resolve => resolve(true));
      });
      const backendService = TestBed.inject(WebsocketService);
      let newUpdate = Object.assign(
        update,
        { contentPath: '/new-path', namespace: '' },
        {
          content: {
            viewComponents: [],
            title: [{ config: { value: 'foo-title' } }],
          },
        }
      );
      backendService.triggerHandler(ContentUpdateMessage, newUpdate);

      const titleServiceSpy = TestBed.inject(Title) as jasmine.SpyObj<Title>;
      expect(titleServiceSpy.setTitle).toHaveBeenCalledOnceWith(
        'Octant | foo-title'
      );
      service.title.subscribe(title => {
        expect(title).toEqual({
          namespace: '',
          title: 'foo-title',
          path: '/new-path',
        });
      });
    });
  });

  describe('label filters updated', () => {
    let labelFilterService: LabelFilterService;

    const filters = [{ key: 'foo', value: 'bar' }];

    beforeEach(() => {
      labelFilterService = TestBed.inject(LabelFilterService);
      labelFilterService.filters.next(filters);
    });

    it('updates local filters', () => {
      expect(service.currentFilters).toEqual(filters);
    });
  });

  describe('set content path', () => {
    let backendService: BackendService;
    let filters: Filter[];

    beforeEach(() => {
      backendService = TestBed.inject(WebsocketService);
      spyOn(backendService, 'sendMessage');
    });

    it('sends a setContentPath message to the server', () => {
      service.setContentPath('path', {});
      expect(backendService.sendMessage).toHaveBeenCalledWith(
        'action.octant.dev/setContentPath',
        {
          contentPath: 'path',
          params: {},
        }
      );
    });

    describe('with filters defined', () => {
      beforeEach(() => {
        filters = [{ key: 'foo', value: 'bar' }];
        const labelFilterService = TestBed.inject(LabelFilterService);
        labelFilterService.filters.next(filters);
      });

      it('sends a setContentPath message to the server', () => {
        service.setContentPath('path', { filters });
        expect(backendService.sendMessage).toHaveBeenCalledWith(
          'action.octant.dev/setContentPath',
          {
            contentPath: 'path',
            params: { filters },
          }
        );
      });
    });
  });
});
