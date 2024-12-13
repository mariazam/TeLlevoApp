import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth, signOut } from "firebase/auth";
import { StorageService } from 'src/app/services/storage.service';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';
import { Menu2Component } from '../../menu2-conductor/menu2.component';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, Menu2Component]
})
export class PerfilUsuarioPage implements OnInit {

  auth = getAuth();
  valor: number = 0
  uid: string | null = null;
  userConductor: any = [];
  nombreUser:string = "";


  constructor(private router: Router, private storageService: StorageService,
     private authService: AuthService, private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.datosUsuario()
  }

  async datosUsuario() {
    try {
      const uid = await this.authService.getCurrentUser(); // Obtener el UID del usuario autenticado
      this.uid = uid;
  
      this.userConductor = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uid); // Esperar los datos del conductor
      this.nombreUser = this.capitalizeFirstLetter(this.userConductor[0].nombre);
      
      if(this.userConductor.length > 0){
        this.valor = this.calcularPromedio(this.userConductor[0].valoracion)
      }
      
      
    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }



  calcularPromedio(numeros: number[]): number {
    console.log(numeros);
    if (numeros.length === 0) return 0;
  
    const suma = numeros.reduce((acc, num) => acc + num, 0);
    const promedio = suma / numeros.length;
    
    return Math.round(promedio * 10) / 10; // Redondear a un decimal
  }
  
  

  async cerrarSesion() {
    try {
      await signOut(this.auth);
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
