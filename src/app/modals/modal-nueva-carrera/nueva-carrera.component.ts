

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonModal } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nueva-carrera',
  templateUrl: './nueva-carrera.component.html',
  styleUrls: ['./nueva-carrera.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule]
})

export class NuevaCarreraComponent implements OnInit {

  uid: string | null = null;
  error: string | null = null;
  carreras: any[] = [];
  userConductor: any = [];

  @ViewChild(IonModal, { static: true }) modal!: IonModal;

  formNuevaCarrera!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router,
    private authService: AuthService, private firestoreService: FirestoreService
  ) {
    const horaFechaActual = this.getLocalISOString();
    // validasiones conductor
    this.formNuevaCarrera = this.fb.group({


      disponibilidad: [
        '',
        [
          Validators.required,
        ]
      ],
      hora: [
        horaFechaActual,
        [
          Validators.required,
          // Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
      inicioRuta: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
      finRuta: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
      precio: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
      comentarioA: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
    },
      { validators: this.capacidadMenorOIgualDisponibilidad.bind(this) }
    )
  }



  ngOnInit() {
    this.datosUsuario();
  }

  capacidadMenorOIgualDisponibilidad(formGroup: AbstractControl): ValidationErrors | null {
    const disponibilidadControl = formGroup.get('disponibilidad');
    const disponibilidad = disponibilidadControl?.value;

    // Verifica si userConductor está inicializado y tiene la propiedad 'capacidad'
    if (this.userConductor[0]?.capacidad == null || disponibilidad == null) {
      return null; // No realizamos la validación si no están disponibles los datos
    }

    // Limpiar el error previamente establecido, si existe
    if (disponibilidadControl?.hasError('capacidadMayorQueDisponibilidad')) {
      disponibilidadControl.setErrors(null);
    }

    // Validar disponibilidad contra capacidad
    if (disponibilidad > Number(this.userConductor[0].capacidad)) {
      // Establecer el error directamente en el control de disponibilidad
      disponibilidadControl?.setErrors({ capacidadMayorQueDisponibilidad: true });
      return { capacidadMayorQueDisponibilidad: true };
    }

    return null;
  }


  async datosUsuario() {
    try {
      const uid = await this.authService.getCurrentUser(); // Obtener el UID del usuario autenticado
      this.uid = uid;

      this.userConductor = await this.firestoreService.getDocumentsByUidAndField("usuarios", "uid", this.uid); // Esperar los datos del conductor
      console.log('Datos del conductor:', this.userConductor);

      console.log('CONDUCTOR:', this.userConductor);
    } catch (error) {
      console.error('Error al obtener el usuario o conductor:', error);
    }
  }

  async agregar() {
    const nuevaCarrera = {
      nombre: this.userConductor[0].nombre,
      patente: this.userConductor[0].patente,
      disponibilidad: this.formNuevaCarrera.get('disponibilidad')?.value,
      hora: this.formNuevaCarrera.get('hora')?.value,
      inicioRuta: this.formNuevaCarrera.get('inicioRuta')?.value,
      finRuta: this.formNuevaCarrera.get('finRuta')?.value,
      precio: this.formNuevaCarrera.get('precio')?.value,
      comentarioA: this.formNuevaCarrera.get('comentarioA')?.value,
      uid: this.uid,
      estado: "espera",
    };

    await this.firestoreService.addDocument('carreras', nuevaCarrera);
  }

  // Método para cancelar y cerrar el modal
  cancel() {
    this.formNuevaCarrera.reset();
  }

  // Método para confirmar y realizar alguna acción
  async confirm() {
    this.formNuevaCarrera.markAllAsTouched();
    if (this.formNuevaCarrera.valid) {
      try {
        await this.agregar(); // Llama al método para agregar la nueva carrera
        Swal.fire({
          icon: 'success',
          title: '¡Carrera agregada!',
          text: 'La carrera se ha agregado exitosamente.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar',
          heightAuto: false,
        }).then(() => {
          this.formNuevaCarrera.reset();
          window.location.href = '/conductor/carreras-en-proceso'; // Redirigir después de éxito
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al agregar la carrera. Inténtelo nuevamente.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Cerrar',
          heightAuto: false,
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, complete el formulario correctamente antes de continuar.',
        confirmButtonColor: '#f0ad4e',
        confirmButtonText: 'Entendido',
        heightAuto: false,
      });
    }
  }


  getLocalISOString(): string {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // Obtener el desfase horario en milisegundos
    const localDate = new Date(now.getTime() - tzOffset); // Ajustar la fecha a la hora local
    return localDate.toISOString().slice(0, -1); // Eliminar la "Z" al final para mantener coherencia con ion-datetime
  }
}  