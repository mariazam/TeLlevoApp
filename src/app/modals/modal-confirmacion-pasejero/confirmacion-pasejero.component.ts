import { Component, NgZone , Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirmacion-pasejero',
  templateUrl: './confirmacion-pasejero.component.html',
  styleUrls: ['./confirmacion-pasejero.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ConfirmacionPasejeroComponent implements OnInit {

  uid: string | null = null;
  userPasajero: any = {};
  @Input() carrera: any;

  FormConfimacionPasaje!: FormGroup;

  // Control para saber qué formulario mostrar
  selectedForm: string | null = null;

  constructor(private ngZone: NgZone, private router: Router, private authService: AuthService, private firestoreService: FirestoreService) { }

  ngOnInit() {
    console.log("Detalles de la carrera:", this.carrera);

    this.FormConfimacionPasaje = new FormGroup({
      cantidadPersonas: new FormControl('', [Validators.required, Validators.min(1)]),
      destino: new FormControl('', [Validators.required,]),

    }, { validators: this.cantidadPersonasMenorOIgualDisponibilidad.bind(this) });
  }

  cantidadPersonasMenorOIgualDisponibilidad(formGroup: AbstractControl): ValidationErrors | null {
    const cantidadPersonasControl = formGroup.get('cantidadPersonas');
    const cantidadPersonas = cantidadPersonasControl?.value;

    // Limpiar el error previamente establecido, si existe
    if (cantidadPersonasControl?.hasError('cantidadPersonasMayorQueDisponibilidad')) {
      cantidadPersonasControl.setErrors(null);
    }

    // Validar disponibilidad contra capacidad
    if (this.carrera.disponibilidad != null && cantidadPersonas != null && cantidadPersonas > Number(this.carrera.disponibilidad)) {
      // Establecer el error directamente en el control de disponibilidad
      cantidadPersonasControl?.setErrors({ cantidadPersonasMayorQueDisponibilidad: true });
      return { cantidadPersonasMayorQueDisponibilidad: true };
    }

    return null;
  }


  cancel() {
    this.router.navigate(['/pasajero/home']);
  }

  // Método para confirmar y enviar los datos
  async confirm() {
    this.FormConfimacionPasaje.markAllAsTouched();
    if (this.FormConfimacionPasaje.valid) {

      try {
        const uid = await this.authService.getCurrentUser(); // Obtener el UID del usuario autenticado
        this.uid = uid;
        this.userPasajero = await this.firestoreService.getDocumentsByUidAndField('usuarios', 'uid', this.uid);

        const NuevoViaje = {
          cantidadPersonas: this.FormConfimacionPasaje.get('cantidadPersonas')?.value,
          destino: this.FormConfimacionPasaje.get('destino')?.value,
          nombre: this.userPasajero[0].nombre,
          telefono: this.userPasajero[0].telefono,
          puntuacion: false,
          idPasajero: this.uid,
          idCarrera: this.carrera.id,
          idConductor: this.carrera.uid,
          estado: true
        };

        await this.firestoreService.addDocument('viaje', NuevoViaje);

        const newUserPasajero = {
          ...this.userPasajero[0],
          enViaje: true
        }

        await this.firestoreService.updateDocument("usuarios", newUserPasajero.id, newUserPasajero)


        const newCarrera = {
          ...this.carrera,
          disponibilidad: this.carrera.disponibilidad - NuevoViaje.cantidadPersonas
        };

        await this.firestoreService.updateDocument('carreras', newCarrera.id, newCarrera);

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Viaje reservado!',
          text: 'Se ha reservado el viaje exitosamente.',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        }).then(() => {
          window.location.href = '/pasajero/home';
        });


      } catch (error) {
        // Mostrar mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error al reservar el viaje',
          text: 'Hubo un problema al intentar reservar el viaje. Por favor, inténtelo más tarde.',
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
      }
    }
    else {
      // Mostrar alerta si el formulario no es válido
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, complete todos los campos requeridos antes de continuar.',
        confirmButtonText: 'Aceptar',
        heightAuto: false,
      });
    }
  }

  openModal() {
    this.ngZone.runOutsideAngular(() => {
      const modalButton = document.getElementById('modalButton');
      modalButton?.click();
    });
  }

}