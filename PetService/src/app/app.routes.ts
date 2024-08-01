import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MensagemComponent } from './components/pet-service/mensagem/mensagem.component';
import { CalendarioComponent } from './components/pet-service/calendario/calendario.component';
import { PetServiceComponent } from './components/pet-service/pet-service.component';
import { ClinicaVeterinariaComponent } from './components/pet-service/Clinica/clinica-veterinaria/clinica-veterinaria.component';
import { InformacaoVeterinarioComponent } from './components/pet-service/Clinica/informacao-veterinario/informacao-veterinario.component';
import { ConfiguracaoComponent } from './components/pet-service/configuracao/configuracao.component';
import { DashboardComponent } from './components/pet-service/dashboard/dashboard.component';
import { PerfilComponent } from './components/pet-service/perfil/perfil.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent, // Rota específica para login
  },
  {
    path: 'cadastro',
    component: RegisterComponent,
  },

  // {
  //   path: 'mensagem',
  //   component: MensagemComponent,
  // },
  {
    path: '',
    component: PetServiceComponent,
    canActivate: [AuthGuard], // Adicione o guard aqui
    children: [
      {
        path: 'home',
        component: DashboardComponent,
      },
      {
        path: 'calendar',
        component: CalendarioComponent,
      },
      {
        path: 'clinic',
        component: ClinicaVeterinariaComponent,
      },
      {
        path: 'information/:id',
        component: InformacaoVeterinarioComponent,
      },
      {
        path:'mensagem',
        component:MensagemComponent
      },
      // {
      //   path: 'settings',
      //   component: ConfiguracaoComponent,
      // },
      {
        path: 'perfil',
        component: PerfilComponent,
      },
    ],
  },
];
