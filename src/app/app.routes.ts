import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { BienvenueComponent } from './pages/bienvenue/bienvenue.component';
import { ChatComponent } from './pages/chat/chat.component';
import { authGuard } from './guards/auth.guard'; // Import the guard
import { InscriptionComponent } from './pages/inscription/inscription.component';
import { JoinCallComponent } from './join-call.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'bienvenue', component: BienvenueComponent },
  { path: 'video', component: JoinCallComponent }, // 👈 nouvelle route
  {
    path: 'message',
    component: ChatComponent,
    canActivate: [authGuard],
  },
];
