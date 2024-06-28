import { Routes } from '@angular/router';
import { HomeComponent } from './components/dashboard/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MensagemComponent } from './components/dashboard/mensagem/mensagem.component';
import { ClinicaComponent } from './components/dashboard/clinica/clinica.component';
import { ConfiguracaoComponent } from './components/dashboard/configuracao/configuracao.component';

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
    component: RegisterComponent,
  },
  {
    path: 'clinica',
    component: ClinicaComponent,
  },
  {
    path: 'mensagem',
    component: MensagemComponent,
  },
  {
    path: 'configuration',
    component: ConfiguracaoComponent,
  },
];
