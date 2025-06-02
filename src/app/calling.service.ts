import { Injectable, computed, signal } from '@angular/core';
import { Call, StreamVideoClient, User } from '@stream-io/video-client';

@Injectable({
  providedIn: 'root',
})
export class CallingService {
  callId = signal<string | undefined>(undefined);

  call = computed<Call | undefined>(() => {
    const currentCallId = this.callId();
    if (currentCallId !== undefined) {
      const call = this.client.call('default', currentCallId);

      call.join({ create: true }).then(async () => {
        call.camera.enable();
        call.microphone.enable();
      });
      return call;
    } else {
      return undefined;
    }
  });

  client: StreamVideoClient;

  constructor() {
    const apiKey = 'mmhfdzb5evj2';
    const token ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0Nhcm5vcl9KYXgiLCJ1c2VyX2lkIjoiQ2Fybm9yX0pheCIsInZhbGlkaXR5X2luX3NlY29uZHMiOjYwNDgwMCwiaWF0IjoxNzQ4NTk2ODIwLCJleHAiOjE3NDkyMDE2MjB9.L39KSAVPO0dg7bQhZCCMihZqux3l3WDr3eCptA_NsLA';
    
    if (!apiKey || !token) {
      alert('Please provide an api key and a token in CallingService')
    }
    const user: User = { id: 'Carnor_Jax' };

    this.client = new StreamVideoClient({ apiKey, token, user });
  }

  setCallId(callId: string | undefined) {
    if (callId === undefined) {
      this.call()?.leave();
    }
    this.callId.set(callId);
  }
}
