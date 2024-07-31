import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app/app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
} from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PetServiceComponent } from './app/components/pet-service/pet-service.component';

import { routes } from './app/app.routes';
import { MenuComponent } from './app/components/pet-service/menu/menu.component';
import { AuthInterceptor } from './app/auth.interceptor';
import { AuthGuard } from './app/guards/auth.guard';
import { AuthService } from './app/services/auth.service';

@NgModule({
  declarations: [AppComponent, PetServiceComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MenuComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthService, AuthGuard
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
