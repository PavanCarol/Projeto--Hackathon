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
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

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
import { RegisterComponent } from './app/components/register/register.component';
import { LoginComponent } from './app/components/login/login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogInfoComponent } from './app/dialog/dialog-info/dialog-info.component';
import { ConfirmacaoAntesComponent } from './app/dialog/confirmacao-antes/confirmacao-antes.component';
import { DialogConfirmacaoExcluirCategoriaComponent } from './app/dialog/dialog-confirmacao-excluir-categoria/dialog-confirmacao-excluir-categoria.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    PetServiceComponent,
    DialogInfoComponent,
    DialogConfirmacaoExcluirCategoriaComponent,
    ConfirmacaoAntesComponent,
  ],
  imports: [
    CommonModule,
    MenuComponent,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDialogModule,
  ],
  exports: [RouterModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
