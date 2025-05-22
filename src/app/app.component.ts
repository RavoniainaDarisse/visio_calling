// src/app/app.component.ts

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  // Méthode pour se déconnecter
  logout() {
    localStorage.removeItem('userUID'); // Supprime l'UID de l'utilisateur connecté
    this.router.navigate(['/bienvenue']); // Redirige vers la page de bienvenue
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('userUID'); // Retourne true si l'UID existe
  }
}
