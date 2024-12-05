import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Router} from '@angular/router';

@Component({
  selector: 'app-confirmacion-pasejero',
  templateUrl: './confirmacion-pasejero.component.html',
  styleUrls: ['./confirmacion-pasejero.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ConfirmacionPasejeroComponent implements OnInit {

  auth = getAuth();

  userPasajero: any = {};


  @Input() carrera: any;

  @ViewChild(IonModal, { static: true }) modal!: IonModal;

  FormConfimacionPasaje!: FormGroup;

  // Control para saber qué formulario mostrar
  selectedForm: string | null = null;

  constructor(private storageService: StorageService, private router: Router) { }

  ngOnInit() {
    // Aquí puedes acceder al objeto `detalleCarrera` y trabajar con él
    console.log("Detalles de la carrera:", this.carrera);

    this.FormConfimacionPasaje = new FormGroup({
      cantidadPersonas: new FormControl('', [Validators.required, Validators.min(1)]),
      destino: new FormControl('', [Validators.required,]),
      // equipaje: new FormControl(false),

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
  }

  // Método para confirmar y enviar los datos
  confirm() {
    this.FormConfimacionPasaje.markAllAsTouched();
    if (this.FormConfimacionPasaje.valid) {

      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          this.userPasajero = await this.storageService.obtenerDato('userPasajero', user.uid);

          const viaje = {
            cantidadPersonas: this.FormConfimacionPasaje.get('cantidadPersonas')?.value,
            destino: this.FormConfimacionPasaje.get('destino')?.value,
            identificador: Date.now().toString(), //genera un identificador
            nombre: this.userPasajero.nombre,
            telefono: this.userPasajero.telefono,
            puntuacion: false,
            uid: user.uid
          }
          const newCarrera = {
            ...this.carrera,
            disponibilidad: this.carrera.disponibilidad - viaje.cantidadPersonas,
            viajePasajero: [...this.carrera.viajePasajero, viaje] // Crea un nuevo array con los elementos existentes + el nuevo viaje
          };

          const newUserPasajero = {...this.userPasajero,
            enViaje: true
          }
          console.log('nueva carrera', newCarrera);

          const resultadoDelModificar = await this.storageService.modificarDato('carreras', newCarrera.identificador, newCarrera);
          if (resultadoDelModificar) {
            console.log('Objeto modificado exitosamente.');
            
            // window.location.reload(); // Recarga la página después de cerrar el modal
            
            this.router.navigate(['pasajero/home']);
          } else {
            console.log('No se encontró el objeto para modificar.');
          }
          const resultadoDelModificar2 = await this.storageService.modificarDato('userPasajero', this.userPasajero.identificador, newUserPasajero);
          if (resultadoDelModificar) {
            console.log('Objeto modificado exitosamente.');
            this.router.navigate(['pasajero/home']);
          } else {
            console.log('No se encontró el objeto para modificar.');
          }

          

        } else {
          console.log("usuario no esta logiado");
        }
      });







      // this.pasajero.equipaje= this.FormConfimacionPasaje.get('equipaje')?.value;




      // Cerrar el modal después de confirmar
      this.modal.dismiss(null, 'confirm');
    }
  }

  datosUsuario() {

  }

  async storageFunction() {
    await this.storageService.init();
  }

  // Método para seleccionar qué formulario mostrar
  showForm(formType: string) {
    this.selectedForm = formType;
  }






}