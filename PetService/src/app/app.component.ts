
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Component,
  computed,
  signal,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
@Component({
  selector: 'app-root',
  template: `
  <mat-toolbar class="mat-elevation-z3">
    <button mat-icon-button (click)="collapsed.set(!collapsed())">
      <mat-icon>menu </mat-icon>
    </button>
  </mat-toolbar>
  <mat-sidenav-container>
    <mat-sidenav opened mode="side" [style.width]="sidenavWidth()">
      <app-menu/>
    </mat-sidenav>
    <mat-sidenav-content class="content" [style.margin-left]="sidenavWidth()">
      <router-outlet></router-outlet>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [` 
  mat-toolbar{
    position:relative;
    z-index: 5;
  }
    .content{
      padding:24px;
    }
  mat-sidenav-container{
    height: calc(100vh - 64px);
  }
    `],
})
export class AppComponent {
  title = 'PetService';

  collapsed= signal(false);

  sidenavWidth = computed(
    ()=> this.collapsed() ? '65px':'250px'
  );
}
