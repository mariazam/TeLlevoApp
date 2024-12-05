import { Injectable, Inject } from '@angular/core';
import { getAuth, Auth, signInWithEmailAndPassword,onAuthStateChanged,
   createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = getAuth(this.firebaseApp);
  private uid = "";

  constructor(@Inject('firebaseApp') private firebaseApp: FirebaseApp) { }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
  recoverPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  getCurrentUser(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.uid = user.uid;
          // console.log("Usuario logueado:", user);
          resolve(this.uid); // Retorna el UID del usuario
        } else {
          console.log("Usuario no está logueado");
          resolve(null); // No hay usuario logueado
        }
      }, (error) => {
        reject(error); // Manejo de errores
      });
    });
  }


}
