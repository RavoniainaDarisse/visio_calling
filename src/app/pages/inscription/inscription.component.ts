import { Component } from '@angular/core';
import axios from 'axios';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-inscription',
  standalone: true, // ✅ important pour Angular standalone
  imports: [FormsModule], 
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'] // ➤ c’est "styleUrls" avec un "s" à la fin
})
export class InscriptionComponent {

  formData = {
    uid: '',
    name: '',
    email: '',
    phone: ''
  };

  inscriptionUser() {
    const apiUrl = 'https://27273256cc1f5651.api-in.cometchat.io/v3/users';

    const headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'apikey': '3d7bd1112ac37eda55219f59c68583e9f5c35dd0'
    };

    const userData = {
      uid: this.formData.uid,
      name: this.formData.name,
      avatar: `https://i.pravatar.cc/150?u=${this.formData.uid}`,
      role: 'default',
      metadata: {
        "@private": {
          email: this.formData.email,
          contactNumber: this.formData.phone
        }
      },
      withAuthToken: true
    };

    axios.post(apiUrl, userData, { headers })
      .then(response => {
        console.log('✅ Utilisateur inscrit :', response.data);
        alert('Inscription réussie !');
      })
      .catch(error => {
        console.error('❌ Erreur pendant l\'inscription :', error);
        alert('Erreur : inscription échouée.');
      });
  }
}
