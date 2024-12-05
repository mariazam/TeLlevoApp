import { Component, OnInit, OnDestroy, ChangeDetectorRef  } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Menu2Component } from '../../menu2/menu2.component'
import { personCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';

@Component({
  selector: 'app-home-pasajero',
  templateUrl: './home-pasajero.page.html',
  styleUrls: ['./home-pasajero.page.scss'],
  standalone: true,
  imports: [IonicModule, Menu2Component, CommonModule, FormsModule]
})
export class HomePasajeroPage implements OnInit, OnDestroy {

  private routerSubscription!: Subscription;


  uid: string | null = null;
  userPasajero: any = [];
  userPasajeroJson : any = {};
  nombreUser:string = "";
  carreraExistente : any = {};






  constructor(private router: Router, private storageService: StorageService, private cdr: ChangeDetectorRef,
    private authService: AuthService, private firestoreService: FirestoreService) {
    addIcons({ personCircleOutline });
  }

  ngOnInit() {

    this.datosUsuario();
    // Escuchar eventos de navegación
    this.routerSubscription = this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.datosUsuario(); // Llama a datosUsuario() cada vez que se navega
      });


  }

  async datosUsuario() {
    try {
      const uid = await this.authService.getCurrentUser(); // Obtener el UID del usuario autenticado
      this.uid = uid;
  
      this.userPasajero = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uid); // Esperar los datos del conductor
      this.carreraExistente = await this.firestoreService.getDocumentsByUidAndField('carreras', 'estado', 'espera');
      this.userPasajeroJson = this.userPasajero[0]
      this.nombreUser = this.capitalizeFirstLetter(this.userPasajeroJson.nombre);
      // this.uid= this.carreraExistente.uid;
      console.log("carreraExistente",this.carreraExistente)
      console.log("uid",this.uid)
      
    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }


  detalleViaje(id: string) {
    this.router.navigate(['pasajero/detalle-viaje'], { queryParams: { id: id } });
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str; // Retorna el string original si está vacío

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  ngOnDestroy() {
    // Limpia la suscripción para evitar pérdidas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  extraerHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }
  extraerFecha(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

}
