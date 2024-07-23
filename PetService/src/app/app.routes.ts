import { Routes } from '@angular/router';
import { HomeComponent } from './components/dashboard/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MensagemComponent } from './components/dashboard/mensagem/mensagem.component';
import { ConfiguracaoComponent } from './components/dashboard/configuracao/configuracao.component';
import { ClinicaComponent } from './components/dashboard/ClinicaVeterinaria/clinica/clinica.component';
import { InformationVetComponent } from './components/dashboard/ClinicaVeterinaria/information-vet/information-vet.component';

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
    path: 'configuracao',
    component: ConfiguracaoComponent,
  },
  {
    path: 'InformacaoVet/:id',
    component: InformationVetComponent,
  },
];
