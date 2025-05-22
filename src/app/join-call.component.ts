// src/app/join-call/join-call.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CallingService } from './calling.service';
import { CallComponent } from './call/call.component';

@Component({
  selector: 'app-join-call',
  standalone: true,
  imports: [CommonModule, CallComponent],
  templateUrl: './join-call.component.html',
  // styleUrl: './app.component.css',
})
export class JoinCallComponent {
  constructor(public callingService: CallingService) {}

  setCallId(callId: string) {
    this.callingService.setCallId(callId);
  }
}
