import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PerfilUsuarioPage implements OnInit {

  auth = getAuth();

  uid: string | null = null;
  userPasajero: any = [];
  userPasajero2: any = {};
  nombreUser:string = "";
  apellidoUser:string = "";

  constructor(private router: Router,private authService: AuthService, private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    this.datosUsuario()
  }

  async datosUsuario() {
    try {
      const uid = await this.authService.getCurrentUser(); // Obtener el UID del usuario autenticado
      this.uid = uid;
      
  
      this.userPasajero = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uid); // Esperar los datos del conductor
      this.nombreUser = this.capitalizeFirstLetter(this.userPasajero[0].nombre);
      this.userPasajero2 = this.userPasajero[0]
      
    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }

  async cerrarSesion() {
    try {
      
      this.router.navigate(['/login']);
    }
    catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str; // Retorna el string original si está vacío

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
