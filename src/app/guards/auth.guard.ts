import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if the user is logged in (e.g., by checking localStorage or a service)
  const userUID = localStorage.getItem('userUID'); // Example: Check for authentication token

  if (userUID) {
    return true; // Allow access to the route
  } else {
    // Redirect to the login page or another appropriate page
    router.navigate(['/bienvenue']); // Redirect to the welcome page
    return false; // Block access to the route
  }
};