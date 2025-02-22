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

import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AppStore,
  ViewNodeAction,
  getAppSelection
} from '@alfresco/aca-shared/store';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { SharedLinkEntry } from '@alfresco/js-api';

@Component({
  selector: 'app-view-node',
  template: `
    <button
      *ngIf="data.iconButton"
      mat-icon-button
      [attr.title]="data.title | translate"
      (click)="onClick()"
    >
      <mat-icon>visibility</mat-icon>
    </button>

    <button *ngIf="data.menuButton" mat-menu-item (click)="onClick()">
      <mat-icon>visibility</mat-icon>
      <span>{{ data.title | translate }}</span>
    </button>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'app-view-node' }
})
export class ViewNodeComponent {
  @Input() data: any;

  constructor(private store: Store<AppStore>, private router: Router) {}

  onClick() {
    this.store
      .select(getAppSelection)
      .pipe(take(1))
      .subscribe(selection => {
        const id =
          (<SharedLinkEntry>selection.file).entry.nodeId ||
          (<any>selection.file).entry.guid ||
          selection.file.entry.id;

        this.store.dispatch(new ViewNodeAction(id, this.router.url));
      });
  }
}
