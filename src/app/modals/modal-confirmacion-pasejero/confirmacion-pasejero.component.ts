import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';

@Component({
  selector: 'app-confirmacion-pasejero',
  templateUrl: './confirmacion-pasejero.component.html',
  styleUrls: ['./confirmacion-pasejero.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ConfirmacionPasejeroComponent implements OnInit {

  uid: string | null = null;
  userPasajero: any = {};
  @Input() carrera: any;

  @ViewChild(IonModal, { static: true }) modal!: IonModal;

  FormConfimacionPasaje!: FormGroup;

  // Control para saber qué formulario mostrar
  selectedForm: string | null = null;

  constructor(private router: Router, private authService: AuthService, private firestoreService: FirestoreService) { }

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
    this.modal.dismiss(null, 'cancel');
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

        console.log('this.userPasajero', this.userPasajero);

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

        const resp = await this.firestoreService.addDocument('viaje', NuevoViaje);

        if (resp) {
          console.log("exitoso")
        }

        const newUserPasajero = {
          ...this.userPasajero[0],
          enViaje: true
        }
        console.log("sape", newUserPasajero)

        const respUpdute = await this.firestoreService.updateDocument("usuarios", newUserPasajero.id, newUserPasajero)
        console.log("exitoso", respUpdute)

        const newCarrera = {
          ...this.carrera,
          disponibilidad: this.carrera.disponibilidad - NuevoViaje.cantidadPersonas
        };

        console.log("ppppp", newCarrera)

        const resp2 = await this.firestoreService.updateDocument('carreras', newCarrera.id, newCarrera);


        console.log("pesp2", resp2)

        window.location.href = '/pasajero/viaje-actual';


      } catch (error) {
        console.error('Error al obtener el usuario o conductor:', error);
      }

      // Cerrar el modal después de confirmar
      this.modal.dismiss(null, 'confirm');
    }
  }




  // Método para seleccionar qué formulario mostrar
  showForm(formType: string) {
    this.selectedForm = formType;
  }






}