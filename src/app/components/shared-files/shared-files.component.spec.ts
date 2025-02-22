/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2019 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  AlfrescoApiService,
  NodeFavoriteDirective,
  DataTableComponent,
  AppConfigPipe,
  UploadService
} from '@alfresco/adf-core';
import { DocumentListComponent } from '@alfresco/adf-content-services';
import { SharedFilesComponent } from './shared-files.component';
import { AppTestingModule } from '../../testing/app-testing.module';
import { Router } from '@angular/router';
import { ContentManagementService } from '../../services/content-management.service';

describe('SharedFilesComponent', () => {
  let fixture: ComponentFixture<SharedFilesComponent>;
  let component: SharedFilesComponent;
  let alfrescoApi: AlfrescoApiService;
  let page;
  let uploadService: UploadService;
  let contentManagementService: ContentManagementService;
  const mockRouter = {
    url: 'shared-files'
  };

  beforeEach(() => {
    page = {
      list: {
        entries: [{ entry: { id: 1 } }, { entry: { id: 2 } }],
        pagination: { data: 'data' }
      }
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppTestingModule],
      declarations: [
        DataTableComponent,
        NodeFavoriteDirective,
        DocumentListComponent,
        SharedFilesComponent,
        AppConfigPipe
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(SharedFilesComponent);
    uploadService = TestBed.get(UploadService);
    contentManagementService = TestBed.get(ContentManagementService);
    component = fixture.componentInstance;

    alfrescoApi = TestBed.get(AlfrescoApiService);
    alfrescoApi.reset();

    spyOn(alfrescoApi.sharedLinksApi, 'findSharedLinks').and.returnValue(
      Promise.resolve(page)
    );
  });

  it('should call document list reload on linksUnshared event', fakeAsync(() => {
    spyOn(component, 'reload');

    fixture.detectChanges();
    contentManagementService.linksUnshared.next();
    tick(500);

    expect(component.reload).toHaveBeenCalled();
  }));

  it('should call document list reload on fileUploadComplete event', fakeAsync(() => {
    spyOn(component, 'reload');

    fixture.detectChanges();
    uploadService.fileUploadComplete.next();
    tick(500);

    expect(component.reload).toHaveBeenCalled();
  }));

  it('should call document list reload on fileUploadDeleted event', fakeAsync(() => {
    spyOn(component, 'reload');

    fixture.detectChanges();
    uploadService.fileUploadDeleted.next();
    tick(500);

    expect(component.reload).toHaveBeenCalled();
  }));

  it('should call showPreview method', () => {
    const node = <any>{ entry: {} };
    spyOn(component, 'showPreview');
    fixture.detectChanges();

    component.preview(node);
    expect(component.showPreview).toHaveBeenCalledWith(node, mockRouter.url);
  });
});
