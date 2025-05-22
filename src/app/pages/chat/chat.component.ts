import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  users: any[] = [];
  messages: any[] = [];
  messageText: string = '';
  selectedUser: string | null = null;
  currentUserUID: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.getUsers();
    this.pollForNewMessages(); // Polling pour vérifier les nouveaux messages
  }

  // Récupère l'utilisateur connecté depuis le localStorage
  getCurrentUser() {
    this.currentUserUID = localStorage.getItem('userUID');
    console.log('UID connecté :', this.currentUserUID);
    if (!this.currentUserUID) {
      console.error('Utilisateur non connecté.');
    }
  }

  // Récupère la liste des utilisateurs depuis l'API CometChat
  getUsers() {
    const url = 'https://27273256cc1f5651.api-in.cometchat.io/v3/users?perPage=100&page=1';
    const headers = {
      'accept': 'application/json',
      'apikey': '3d7bd1112ac37eda55219f59c68583e9f5c35dd0'
    };

    axios.get(url, { headers })
      .then((response) => {
        this.users = response.data.data.filter((user: any) => user.uid !== this.currentUserUID); // Exclure l'utilisateur connecté
        console.log('Utilisateurs :', this.users);
      })
      .catch((error) => {
        console.error('Erreur récupération utilisateurs', error);
      });
  }

  // Sélectionne un utilisateur et charge ses messages
  selectUser(userId: string) {
    if (userId === this.currentUserUID) {
      console.error('Vous ne pouvez pas discuter avec vous-même.');
      return;
    }
    this.selectedUser = userId;
    console.log('Utilisateur sélectionné :', userId);
    this.getMessagesWithUser(userId);
  }

  // Récupère les messages d'une conversation spécifique
  getMessagesWithUser(userId: string) {
    if (!this.currentUserUID || !userId) {
      console.error('UID manquant pour récupérer les messages.');
      return;
    }

    // Générer le conversationId en triant les UID pour garantir la cohérence
    const sortedUIDs = [this.currentUserUID, userId].sort();
    const conversationId = `${sortedUIDs[0]}_user_${sortedUIDs[1]}`;

    const url = `https://27273256cc1f5651.api-in.cometchat.io/v3/messages?conversationId=${conversationId}&perPage=50`;
    const headers = {
      'accept': 'application/json',
      'apikey': '3d7bd1112ac37eda55219f59c68583e9f5c35dd0'
    };

    axios.get(url, { headers })
      .then((response) => {
        this.messages = response.data.data;
        if (this.messages.length === 0) {
          console.log(`Aucun message trouvé pour la conversation avec ${userId}.`);
        } else {
          console.log('Messages avec', userId, ':', this.messages);
        }
      })
      .catch((error) => {
        console.error('Erreur récupération messages :', error);
      });
  }

  // Envoie un message à l'utilisateur sélectionné
  sendMessage() {
    if (!this.selectedUser || !this.messageText || !this.currentUserUID) {
      console.error('Sélectionnez un utilisateur et entrez un message.');
      return;
    }

    const url = 'https://27273256cc1f5651.api-in.cometchat.io/v3/messages';
    const headers = {
      'accept': 'application/json',
      'apikey': '3d7bd1112ac37eda55219f59c68583e9f5c35dd0',
      'content-type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'onBehalfOf': this.currentUserUID
    };

    const data = {
      receiver: this.selectedUser,
      receiverType: 'user',
      category: 'message',
      type: 'text',
      data: {
        text: this.messageText,
      }
    };

    axios.post(url, data, { headers })
      .then((response) => {
        console.log('Message envoyé :', response.data);
        this.messageText = '';
        this.getMessagesWithUser(this.selectedUser!); // Actualiser les messages après envoi
      })
      .catch((error) => {
        console.error('Erreur envoi message :', error);
      });
  }

  // Polling pour vérifier les nouveaux messages toutes les 5 secondes
  pollForNewMessages() {
    setInterval(() => {
      if (this.selectedUser) {
        this.getMessagesWithUser(this.selectedUser);
      }
    }, 5000); // Vérifie les nouveaux messages toutes les 5 secondes
  }
}