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

import { Effect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import {
  AppStore,
  ViewerActionTypes,
  ViewFileAction,
  ViewNodeAction,
  getCurrentFolder,
  getAppSelection,
  FullscreenViewerAction
} from '@alfresco/aca-shared/store';
import {
  Router,
  UrlTree,
  UrlSegmentGroup,
  PRIMARY_OUTLET,
  UrlSegment
} from '@angular/router';
import { Store, createSelector } from '@ngrx/store';
import { AppExtensionService } from '../../extensions/extension.service';

export const fileToPreview = createSelector(
  getAppSelection,
  getCurrentFolder,
  (selection, folder) => {
    return {
      selection,
      folder
    };
  }
);

@Injectable()
export class ViewerEffects {
  constructor(
    private store: Store<AppStore>,
    private actions$: Actions,
    private router: Router,
    private extensions: AppExtensionService
  ) {}

  @Effect({ dispatch: false })
  fullscreenViewer$ = this.actions$.pipe(
    ofType<FullscreenViewerAction>(ViewerActionTypes.FullScreen),
    map(() => {
      this.enterFullScreen();
    })
  );

  @Effect({ dispatch: false })
  viewNode$ = this.actions$.pipe(
    ofType<ViewNodeAction>(ViewerActionTypes.ViewNode),
    map(action => {
      if (action.location) {
        const location = this.getNavigationCommands(action.location);

        this.router.navigate(
          [...location, { outlets: { viewer: ['view', action.nodeId] } }],
          {
            queryParams: {
              source: action.location
            }
          }
        );
      } else {
        this.router.navigate([
          'view',
          { outlets: { viewer: [action.nodeId] } }
        ]);
      }
    })
  );

  @Effect({ dispatch: false })
  viewFile$ = this.actions$.pipe(
    ofType<ViewFileAction>(ViewerActionTypes.ViewFile),
    map(action => {
      if (action.payload && action.payload.entry) {
        const { id, nodeId, isFile } = <any>action.payload.entry;

        if (
          this.extensions.canPreviewNode(action.payload) &&
          (isFile || nodeId)
        ) {
          this.displayPreview(nodeId || id, action.parentId);
        }
      } else {
        this.store
          .select(fileToPreview)
          .pipe(take(1))
          .subscribe(result => {
            if (result.selection && result.selection.file) {
              const { id, nodeId, isFile } = <any>result.selection.file.entry;

              if (
                this.extensions.canPreviewNode(action.payload) &&
                (isFile || nodeId)
              ) {
                const parentId = result.folder ? result.folder.id : null;
                this.displayPreview(nodeId || id, parentId);
              }
            }
          });
      }
    })
  );

  private displayPreview(nodeId: string, parentId: string) {
    if (!nodeId) {
      return;
    }

    let previewLocation = this.router.url;
    if (previewLocation.lastIndexOf('/') > 0) {
      previewLocation = previewLocation.substr(
        0,
        this.router.url.indexOf('/', 1)
      );
    }
    previewLocation = previewLocation.replace(/\//g, '');

    const path = [previewLocation];
    if (parentId) {
      path.push(parentId);
    }
    path.push('preview', nodeId);
    this.router.navigateByUrl(path.join('/'));
  }

  enterFullScreen() {
    const container = <any>(
      document.documentElement.querySelector(
        '.adf-viewer__fullscreen-container'
      )
    );
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    }
  }

  private getNavigationCommands(url: string): any[] {
    const urlTree: UrlTree = this.router.parseUrl(url);
    const urlSegmentGroup: UrlSegmentGroup =
      urlTree.root.children[PRIMARY_OUTLET];

    if (!urlSegmentGroup) {
      return [url];
    }

    const urlSegments: UrlSegment[] = urlSegmentGroup.segments;

    return urlSegments.reduce(function(acc, item) {
      acc.push(item.path, item.parameters);
      return acc;
    }, []);
  }
}
