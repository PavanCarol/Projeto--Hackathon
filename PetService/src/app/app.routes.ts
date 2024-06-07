import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { DialogRegisterComponent } from './components/dialog-register/dialog-register.component';
export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'cadastro',
    component: DialogRegisterComponent,
  },
];
