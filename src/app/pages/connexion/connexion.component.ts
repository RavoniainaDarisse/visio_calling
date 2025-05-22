import { Component } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-connexion',
  standalone: true,  
  imports: [FormsModule], 
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent {
  uid: string = '';

  constructor(private router: Router) {}

  login() {
    if (!this.uid) {
      console.error('L\'UID ne peut pas être vide');
      return;
    }

    const url = `https://27273256cc1f5651.api-in.cometchat.io/v3/users/${this.uid}/auth_tokens`;
    const headers = {
      'accept': 'application/json',
      'apikey': '3d7bd1112ac37eda55219f59c68583e9f5c35dd0',
      'content-type': 'application/json'
    };

    const data = {
      force: true
    };

    axios
      .post(url, data, { headers })
      .then((response) => {
        console.log('Connexion réussie', response.data);
        localStorage.setItem('userUID', this.uid);  // Enregistrer l'UID de l'utilisateur
        this.router.navigate(['/message']);  // Rediriger vers la page des messages
      })
      .catch((error) => {
        console.error('Erreur de connexion', error);
      });
  }
}
