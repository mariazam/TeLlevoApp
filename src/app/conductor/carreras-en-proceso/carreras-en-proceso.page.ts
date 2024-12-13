import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Menu2Component } from '../../menu2-conductor/menu2.component';
import { TabsComponent } from '../../tabs/tabs.component';
import { addIcons } from 'ionicons';
import { personCircleOutline, locationOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-carreras-en-proceso',
  templateUrl: './carreras-en-proceso.page.html',
  styleUrls: ['./carreras-en-proceso.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, Menu2Component]
})
export class CarrerasEnProcesoPage {

  nombreUser: string = "";
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
    addIcons({
      personCircleOutline,
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
        this.nombreUser = this.userConductorJson.nombre
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
    try {
      // Confirmación antes de iniciar la carrera
      const result = await Swal.fire({
        icon: 'question',
        title: '¿Está seguro?',
        text: 'Esto iniciará la carrera.',
        showCancelButton: true,
        confirmButtonText: 'Sí, iniciar carrera',
        cancelButtonText: 'No, cancelar',
        heightAuto: false,
      });
  
      if (result.isConfirmed) {
        const newCarreraExistente = {
          ...this.carreraExistenteJson,
          estado: "iniciada",
        };
  
        this.respuesta = await this.firestoreService.updateDocument('carreras', this.carreraExistenteJson.id, newCarreraExistente);
  
        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: 'Carrera iniciada',
          text: 'La carrera se ha iniciado correctamente.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        });
  
        // Recargar la página para reflejar los cambios
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al iniciar la carrera:", error);
  
      // Mostrar mensaje de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al iniciar la carrera',
        text: 'Ocurrió un problema al iniciar la carrera. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
    }
  }


  async finalizarCarrera() {
    
    try {

      // Confirmación previa antes de finalizar la carrera
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Está seguro?',
      text: 'Esto finalizará la carrera y actualizará el estado de los pasajeros.',
      showCancelButton: true,
      confirmButtonText: 'Sí, finalizar carrera',
      cancelButtonText: 'No, cancelar',
      heightAuto: false,
    });

    if (!result.isConfirmed) {
      return; // Salir si el usuario cancela la acción
    }

    //actualiza el estado de los pasajero 
    if (this.viajes.length > 0) {
      for (const viaje of this.viajes) {
        
        this.userPasajero = await this.firestoreService.getDocumentsByUidAndField('usuarios', "uid", viaje.idPasajero);
        this.userPasajeroJson = this.userPasajero[0]

        const newUserPasajero = {
          ...this.userPasajeroJson,
          enViaje: false
        }

        const newViaje = {
          ...viaje,
          estado: false
        }

        // Actualiza la base de datos
        await this.firestoreService.updateDocument('usuarios', this.userPasajeroJson.id, newUserPasajero);
        await this.firestoreService.updateDocument('viaje', viaje.id, newViaje);
      };
    }

    const newCarreraExistente = {
      ...this.carreraExistenteJson,
      estado: "finalizada"
    }

    await this.firestoreService.updateDocument('carreras', this.carreraExistenteJson.id, newCarreraExistente);

     // Mostrar mensaje de éxito
     await Swal.fire({
      icon: 'success',
      title: 'Carrera finalizada',
      text: 'La carrera se ha finalizado correctamente y se han actualizado los estados.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
    });

    // Redirigir o actualizar vista
    window.location.href = '/conductor/home';

  } catch (error) {

    // Mostrar mensaje de error
    await Swal.fire({
      icon: 'error',
      title: 'Error al finalizar la carrera',
      text: 'Ocurrió un problema al intentar finalizar la carrera. Por favor, inténtelo nuevamente.',
      confirmButtonText: 'Aceptar',
      heightAuto: false,
    });
  }

  }

  async eliminarCarrera() {
    const fechaHora = this.carreraExistenteJson.hora;
    const fechaHoraDate = new Date(fechaHora);
    const ahora = new Date();

    const diferenciaMs = fechaHoraDate.getTime() - ahora.getTime();
    const treintaMinutosMs = 30 * 60 * 1000;

    if (diferenciaMs <= treintaMinutosMs) {
      // Mostrar alerta usando SweetAlert2
      await Swal.fire({
        icon: 'warning',
        title: 'No se puede cancelar la carrera',
        text: 'No es posible cancelar la carrera con menos de 30 minutos de antelación.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
      return;
    }


    try {

      // Confirmación antes de eliminar la carrera
      const result = await Swal.fire({
        icon: 'question',
        title: '¿Está seguro?',
        text: 'Esto cancelará la carrera y notificará a los pasajeros.',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar carrera',
        cancelButtonText: 'No, volver',
        heightAuto: false,
      });

      if (result.isConfirmed) {
        for (const viaje of this.viajes) {

          this.userPasajero = await this.firestoreService.getDocumentsByUidAndField('usuarios', "uid", viaje.idPasajero);
          this.userPasajeroJson = this.userPasajero[0]

          const newUserPasajero = {
            ...this.userPasajeroJson,
            enViaje: false
          }


          await this.firestoreService.updateDocument('usuarios', this.userPasajeroJson.id, newUserPasajero);

          await this.firestoreService.deleteDocument('viaje', viaje.id);
        };

        await this.firestoreService.deleteDocument("carreras", this.carreraExistenteJson.id);

        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: 'Carrera cancelada',
          text: 'La carrera se ha cancelado correctamente.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        });

        window.location.href = '/conductor/home';

      }
    } catch (error) {

      // Mostrar mensaje de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al cancelar',
        text: 'Ocurrió un problema al cancelar la carrera. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
    }
  }

  verRecorrido(viaje: any) {
    // Navegar a la página de recorrido
    this.router.navigate(['/conductor/mapa'], {
      queryParams: { idV: viaje.id }
    });
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
