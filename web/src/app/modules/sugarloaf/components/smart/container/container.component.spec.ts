/*
 * Copyright (c) 2020 the Octant contributors. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClarityModule, ClrPopoverToggleService } from '@clr/angular';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContainerComponent } from './container.component';
import { NamespaceComponent } from '../namespace/namespace.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { PreferencesComponent } from '../../../../shared/components/presentation/preferences/preferences.component';
import { HelperComponent } from '../../../../shared/components/smart/helper/helper.component';
import { InputFilterComponent } from '../input-filter/input-filter.component';
import { NotifierComponent } from '../notifier/notifier.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { ContextSelectorComponent } from '../../../../shared/components/smart/context-selector/context-selector.component';
import { DefaultPipe } from '../../../../shared/pipes/default/default.pipe';
import { FilterTextPipe } from '../../../pipes/filtertext/filtertext.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { WebsocketService } from '../../../../../data/services/websocket/websocket.service';
import { WebsocketServiceMock } from '../../../../../data/services/websocket/mock';
import { ClarityIcons } from '@clr/icons';
import { ThemeSwitchButtonComponent } from '../theme-switch/theme-switch-button.component';
import { QuickSwitcherComponent } from '../quick-switcher/quick-switcher.component';

import { UploaderComponent } from '../uploader/uploader.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { windowProvider, WindowToken } from '../../../../../window';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-ngx';
import { ApplyYAMLComponent } from '../apply-yaml/apply-yaml.component';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { HistoryServiceMock } from '../../../../shared/services/history/mock';
import { before } from 'lodash';
import { DropdownView } from 'src/app/modules/shared/models/content';
import { delay } from 'rxjs/operators';

describe('AppComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: HistoryService, useClass: HistoryServiceMock },
          { provide: WebsocketService, useClass: WebsocketServiceMock },
          { provide: WindowToken, useFactory: windowProvider },
          { provide: window, useValue: ClarityIcons },
          ClrPopoverToggleService,
        ],
        imports: [
          BrowserModule,
          RouterTestingModule,
          ClarityModule,
          HttpClientTestingModule,
          FormsModule,
          NgSelectModule,
          ReactiveFormsModule,
          BrowserAnimationsModule,
          SharedModule,
        ],
        declarations: [
          ApplyYAMLComponent,
          ContainerComponent,
          NamespaceComponent,
          PageNotFoundComponent,
          HelperComponent,
          PreferencesComponent,
          InputFilterComponent,
          NotifierComponent,
          NavigationComponent,
          ContextSelectorComponent,
          DefaultPipe,
          FilterTextPipe,
          ThemeSwitchButtonComponent,
          QuickSwitcherComponent,
          UploaderComponent,
          OverlayScrollbarsComponent,
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create the home', () => {
    expect(component).toBeTruthy();
  });

  describe('at startup', () => {
    it('opens a websocket connection', inject(
      [WebsocketService],
      (websocketService: WebsocketServiceMock) => {
        fixture.detectChanges();
        expect(websocketService.isOpen).toBeTruthy();
      }
    ));
  });

  xdescribe('with history updates', () => {
    let historyService;

    beforeEach(() => {
      historyService = TestBed.inject(HistoryService);
    });

    it('shows a message when there is not history available', () => {
      historyService.pushHistory([]);
      const expectedConfig = {
        metadata: {
          type: 'dropdown',
          title: [
            {
              metadata: { type: 'text' },
              config: { value: 'history' },
            },
          ],
        },
        config: {
          position: 'bottom-left',
          type: 'icon',
          action: null,
          useSelection: true,
          items: [
            {
              name: 'default',
              type: 'text',
              label: 'No History',
            },
          ],
        },
      } as DropdownView;

      historyService.history.pipe(delay(2000)).subscribe(history => {
        expect(expectedConfig).toEqual(component.historyDropdownConfig);
      });
    });

    it('sets dropdown config for the received history', () => {
      historyService.pushHistory([{ title: 'foo-title', path: 'foo-path' }]);
      const expectedConfig = {
        metadata: {
          type: 'dropdown',
          title: [
            {
              metadata: { type: 'text' },
              config: { value: 'history' },
            },
          ],
        },
        config: {
          position: 'bottom-left',
          type: 'icon',
          action: null,
          useSelection: true,
          items: [
            {
              name: 'foo-title',
              type: 'link',
              label: 'foo-title',
              url: 'foo-path',
            },
          ],
        },
      } as DropdownView;

      historyService.history.pipe(delay(2000)).subscribe(_ => {
        expect(expectedConfig).toEqual(component.historyDropdownConfig);
      });
    });
  });
});
