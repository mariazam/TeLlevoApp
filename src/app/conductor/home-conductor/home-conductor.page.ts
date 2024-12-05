import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabsComponent } from '../../tabs/tabs.component';
import { Menu2Component } from '../../menu2/menu2.component';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { personCircleOutline } from 'ionicons/icons';
import { NuevaCarreraComponent } from '../../modals/modal-nueva-carrera/nueva-carrera.component';
import { IonModal } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';


@Component({
  selector: 'app-conductor',
  templateUrl: './home-conductor.page.html',
  styleUrls: ['./home-conductor.page.scss'],
  standalone: true,
  imports: [IonicModule, TabsComponent, Menu2Component, CommonModule, FormsModule, NuevaCarreraComponent]

})
export class ConductorPage implements OnInit {

  uid: string | null = null;
  userConductor: any = [];
  nombreUser: string = "";
  carreraExistente: any = {};
  viajes: any = [];


  carreraExistenteActiva: boolean = false;

  @ViewChild(IonModal, { static: true }) modal!: IonModal;

  constructor(private router: Router, private authService: AuthService, private firestoreService: FirestoreService) {
    addIcons({ personCircleOutline })
  }

  ngOnInit() {
    this.datosUsuario();
  }

  async datosUsuario() {
    try {
      // Obtener el UID del usuario autenticado
      const uid = await this.authService.getCurrentUser();
      this.uid = uid;

      // Obtener datos del conductor
      this.userConductor = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uid);

      if (this.userConductor.length > 0) {
        this.nombreUser = this.capitalizeFirstLetter(this.userConductor[0].nombre);
      } else {
        console.error("No se encontró información del conductor.");
        return;
      }

      console.log("uiddddddddddddddd",this.uid)

      // Obtener la carrera existente (estado = finalizada)
      this.carreraExistente = await this.firestoreService.getDocumentsByUidAndField(
        'carreras',
        "uid",
        this.uid,
        "estado",
        "finalizada",
        true
      );
      console.log("kadjfnadkjfnadsfnñldskfnañ",this.carreraExistente)

      if (this.carreraExistente.length > 0) {
        // Si existe una carrera finalizada, buscar viajes asociados
        this.viajes = await this.firestoreService.getDocumentsByUidAndField(
          "viaje",
          "idCarrera",
          this.carreraExistente[0].id
        );

        console.log("Viajes asociados a la carrera finalizada:", this.viajes);
      } else {
        console.log("No se encontraron carreras.");
        this.carreraExistente = [];
        this.viajes = [];
      }

      // Verificar si hay una carrera en proceso
      this.carreraExistenteActiva = this.carrerraEnProceso();

    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }


  //Nuevas carreras
  carrerraEnProceso(): boolean {

    if (this.carreraExistente !== undefined && this.carreraExistente.length > 0) {
      return true
    }
    else {
      return false
    }
  }

  // Método para abrir el modal
  abrirNuevaCarreraModal() {
    this.modal.present();
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str; // Retorna el string original si está vacío

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // async carreraEnProceso(uid: string) {
  //   this.router.navigate(['/conductor/carreras-en-proceso'], { queryParams: { id: uid } });
  // }

}
