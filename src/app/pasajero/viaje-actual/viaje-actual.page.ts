import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { IonicModule } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';
import { MenuComponent } from "../../menu-pasajero/menu.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-viaje-actual',
  templateUrl: './viaje-actual.page.html',
  styleUrls: ['./viaje-actual.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, MenuComponent]
})
export class ViajeActualPage implements OnInit {

  auth = getAuth();
  nombreUser = ""
  userPasajero: any = {}
  userConductor: any = {}
  valor: number | null = null; // Variable para almacenar el valor ingresado
  mensajeError: string = ''; // Variable para almacenar el mensaje de error
  valoracion: number = 0

  uidPasajero: string | null = null;
  uidConductor: string | null = null;


  viajeActual: any = {}
  userPasajeroJson: any = {};
  carreraExistente: any = {};
  viajeActualJson: any = {};
  userConductorJson: any = {};


  constructor(private storageService: StorageService, private router: Router,
    private authService: AuthService, private firestoreService: FirestoreService
  ) { }

  ngOnInit() {
    this.datosUsuario()
  }

  async datosUsuario() {
    try {
      this.uidPasajero = await this.authService.getCurrentUser(); // Obtener el UID del usuario autenticado


      this.userPasajero = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uidPasajero); // Esperar los datos del conductor
      this.userPasajeroJson = this.userPasajero[0]
      this.nombreUser = this.userPasajeroJson.nombre


      this.viajeActual = await this.firestoreService.getDocumentsByUidAndField("viaje", "idPasajero", this.uidPasajero, "estado", true);
      this.viajeActualJson = this.viajeActual[0]


      this.carreraExistente = await this.firestoreService.getDocumentById('carreras', this.viajeActualJson.idCarrera);

      this.uidConductor = this.carreraExistente.uid
      this.userConductor = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uidConductor);
      this.userConductorJson = this.userConductor[0]

      this.valoracion = this.calcularPromedio(this.userConductorJson.valoracion)

    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }


  calcularPromedio(numeros: number[]): number {

    if (numeros == undefined) {
      return 0
    }
    else if (numeros.length === 0) return 0;

    const suma = numeros.reduce((acc, num) => acc + num, 0);
    const promedio = suma / numeros.length;

    return Math.round(promedio * 10) / 10; // Redondear a un decimal
  }


  esValorValido(): boolean {
    return this.valor !== null && this.valor >= 1 && this.valor <= 5;
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

  async cancelarViaje() {

    // Suponiendo que 'horaInicio' es la variable que contiene la fecha y hora en formato "2024-11-06T12:00:00"
    const fechaHora = this.carreraExistente.hora;

    // Convertir 'fechaHora' a un objeto Date
    const fechaHoraDate = new Date(fechaHora);

    // Obtener la fecha y hora actual
    const ahora = new Date();

    // Calcular la diferencia en milisegundos
    const diferenciaMs = fechaHoraDate.getTime() - ahora.getTime();

    // Convertir 30 minutos a milisegundos
    const treintaMinutosMs = 30 * 60 * 1000; // 30 minutos * 60 segundos * 1000 milisegundos

    // Verificar si la diferencia es menor o igual a 30 minutos
    if (diferenciaMs <= treintaMinutosMs) {
      // Mostrar SweetAlert explicando el motivo del rechazo
      Swal.fire({
        icon: 'error',
        title: 'Cancelación no permitida',
        text: 'No se puede cancelar la carrera con menos de 30 minutos de antelación.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
      return; // Salir de la función para evitar continuar
    }

    // Confirmación para cancelar el viaje
    const confirmResult = await Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: '¿Deseas cancelar el viaje? Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      heightAuto: false,
    });

    if (!confirmResult.isConfirmed) {
      // Si el usuario cancela, salir de la función
      return;
    }

    try {
      const newUserPasajero = {
        ...this.userPasajeroJson,
        enViaje: false
      }

      await this.firestoreService.updateDocument("usuarios", this.userPasajeroJson.id, newUserPasajero)

      const newCarrera = {
        ...this.carreraExistente,
        disponibilidad: this.carreraExistente.disponibilidad + this.viajeActualJson.cantidadPersonas
      }

      await this.firestoreService.updateDocument("carreras", this.carreraExistente.id, newCarrera)


      await this.firestoreService.deleteDocument("viaje", this.viajeActualJson.id);

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: 'Viaje cancelado',
        text: 'El viaje ha sido cancelado con éxito.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });

      // Redirigir al usuario
      window.location.href = '/pasajero/home';
    } catch (error) {
      // Manejo de errores con SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Error al cancelar el viaje',
        text: 'Ocurrió un problema al intentar cancelar el viaje. Por favor, inténtalo de nuevo más tarde.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
      console.error('Error al cancelar el viaje:', error);
    }
  }

  async valorar() {
    if (this.esValorValido()) {

      try {

        const newViaje = {
          ...this.viajeActualJson,
          puntuacion: true
        }

        await this.firestoreService.updateDocument("viaje", this.viajeActualJson.id, newViaje)

        const newUserConductor = {
          ...this.userConductorJson,
          valoracion: [...this.userConductorJson.valoracion, this.valor]
        }

        await this.firestoreService.updateDocument("usuarios", this.userConductorJson.id, newUserConductor)

        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Valoración enviada!',
          text: 'Gracias por valorar al conductor.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        });

        // Recargar la página o redirigir si es necesario
        window.location.reload();

      } catch (error) {
        // Mostrar error con SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar la valoración',
          text: 'Ocurrió un problema al procesar tu valoración. Por favor, inténtalo nuevamente más tarde.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        });
      }
    } else {
      // Mostrar mensaje de error con SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Valoración inválida',
        text: 'Por favor, ingresa un valor entre 1 y 5.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
    }
  }

  verRecorrido() {
    // Navegar a la página de recorrido
    this.router.navigate(['/pasajero/mapa'], {
      queryParams: { idV: this.viajeActualJson.id }
    });
  }
}
