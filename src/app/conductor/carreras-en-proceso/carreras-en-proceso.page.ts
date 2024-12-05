import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Menu2Component } from '../../menu2/menu2.component';
import { TabsComponent } from '../../tabs/tabs.component';
import { addIcons } from 'ionicons';
import { personCircleOutline, locationOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';


@Component({
  selector: 'app-carreras-en-proceso',
  templateUrl: './carreras-en-proceso.page.html',
  styleUrls: ['./carreras-en-proceso.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, Menu2Component, TabsComponent]
})
export class CarrerasEnProcesoPage {


  id = "";
  respuesta: any = {};
  uid: string | null = null;
  userConductor: any = [];
  userConductorJson: any = {};
  userPasajero: any = [];
  userPasajeroJson: any = {};
  hora: string = "";
  fecha: string = "";

  deshabilitar: boolean = false;
  carreraExistente: any = [];
  carreraExistenteJson: any = {};
  viajes: any = [];
  uidViajes: string[] = []

  constructor(private router2: Router,
    private firestoreService: FirestoreService, private router: Router,
    private authService: AuthService) {
    addIcons({ personCircleOutline,
      locationOutline
     })
  }




  ngOnInit() {

    this.datosCarrera();

  }

  async datosCarrera() {
    try {
      // Obtener el UID del usuario autenticado
      const uid = await this.authService.getCurrentUser();
      this.uid = uid;

      // Obtener datos del conductor
      this.userConductor = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uid);
      if (this.userConductor.length > 0) {
        this.userConductorJson = this.userConductor[0];
      } else {
        console.error("No se encontró información del conductor.");
        return;
      }

      // Obtener carreras existentes (estado: finalizada)
      this.carreraExistente = await this.firestoreService.getDocumentsByUidAndField(
        'carreras',
        "uid",
        this.uid,
        "estado",
        "finalizada",
        true
      );

      if (this.carreraExistente.length > 0) {
        this.carreraExistenteJson = this.carreraExistente[0];
        console.log("carrera", this.carreraExistente);

        // Extraer hora y fecha
        this.hora = this.extraerHora(this.carreraExistenteJson.hora);
        this.fecha = this.extraerFecha(this.carreraExistenteJson.hora);

        // Obtener viajes asociados
        this.viajes = await this.firestoreService.getDocumentsByUidAndField(
          'viaje',
          "idCarrera",
          this.carreraExistenteJson.id,
          "estado",
          true
        );

        // Deshabilitar el botón si no hay pasajeros
        if (this.viajes.length === 0) {
          this.deshabilitar = true;
        } else {
          this.deshabilitar = false;
        }
      } else {
        console.log("No se encontraron carreras.");
        this.carreraExistente = [];
        this.carreraExistenteJson = null;
        this.viajes = [];
        this.deshabilitar = true;
      }
    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }

  async iniciarCarrera() {

    const newCarreraExistente = {
      ...this.carreraExistenteJson,
      estado: "iniciada"
    }

    this.respuesta = await this.firestoreService.updateDocument('carreras', this.carreraExistenteJson.id, newCarreraExistente);

    window.location.reload();

  }


  async finalizarCarrera() {
    // try {

    //actualiza el estado de los pasajero 
    if (this.viajes.length > 0) {
      console.log("entra", this.viajes)
      for (const viaje of this.viajes) {
        console.log("entra23", viaje)


        this.userPasajero = await this.firestoreService.getDocumentsByUidAndField('usuarios', "uid", viaje.idPasajero);
        this.userPasajeroJson = this.userPasajero[0]
        console.log("pasajero finalizar 2222", this.userPasajero)

        const newUserPasajero = {
          ...this.userPasajeroJson,
          enViaje: false
        }

        const newViaje = {
          ...viaje,
          estado: false
        }

        const respuesta = await this.firestoreService.updateDocument('usuarios', this.userPasajeroJson.id, newUserPasajero);

        const respuesta2 = await this.firestoreService.updateDocument('viaje', viaje.id, newViaje);

        // console.log("se modifico el usuario:", newUserPasajero.nombre)


      };
    }

    const newCarreraExistente = {
      ...this.carreraExistenteJson,
      estado: "finalizada"
    }

    const respuesta = await this.firestoreService.updateDocument('carreras', this.carreraExistenteJson.id, newCarreraExistente);


    alert("Carrera finalizada con exito")
    window.location.href = '/conductor/home';

  }

  async eliminarCarrera() {
    const fechaHora = this.carreraExistenteJson.hora;
    const fechaHoraDate = new Date(fechaHora);
    const ahora = new Date();

    const diferenciaMs = fechaHoraDate.getTime() - ahora.getTime();
    const treintaMinutosMs = 30 * 60 * 1000;

    if (diferenciaMs <= treintaMinutosMs) {
      alert("No se puede cancelar la carrera con menos de 30 minutos de antelación.");
      return;
    }


    try {

      for (const viaje of this.viajes) {

        this.userPasajero = await this.firestoreService.getDocumentsByUidAndField('usuarios', "uid", viaje.idPasajero);
        this.userPasajeroJson = this.userPasajero[0]

        const newUserPasajero = {
          ...this.userPasajeroJson,
          enViaje: false
        }


        const respuesta = await this.firestoreService.updateDocument('usuarios', this.userPasajeroJson.id, newUserPasajero);

        const respuesta2 = await this.firestoreService.deleteDocument('viaje', viaje.id);

        // console.log("se modifico el usuario:", newUserPasajero.nombre)


      };

      await this.firestoreService.deleteDocument("carreras", this.carreraExistenteJson.id);
      alert("Carrera cancelada");
      window.location.href = '/conductor/home';



    } catch (error) {
      console.error("Error al cancelar la carrera:", error);
      alert("Error al cancelar");
    }
  }

  verRecorrido(viaje: any) {
    // Navegar a la página de recorrido
    this.router.navigate(['/conductor/mapa'],{
      queryParams: { idV: viaje.id }});
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
  
  capitalizeFirstLetter(str: string): string {
    if (!str) return str; // Retorna el string original si está vacío

    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
