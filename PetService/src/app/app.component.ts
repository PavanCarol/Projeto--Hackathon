import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, signal } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet> `,
})
export class AppComponent {
  title = 'PetService';
}
