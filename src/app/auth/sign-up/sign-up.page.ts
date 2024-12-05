import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { carSportOutline, peopleOutline } from 'ionicons/icons';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule]
})

export class SignUpPage {

  formPasajero!: FormGroup;
  formCondutor!: FormGroup;
  // Variable para controlar qué formulario mostrar
  selectedForm: boolean = true;
  //de pdf
  fileError: boolean = false;
  selectedFile: File | null = null;



  constructor(private fb: FormBuilder, private router: Router,
    private firestoreService: FirestoreService,
    private authFirebaseService: AuthService) {

    addIcons({ carSportOutline, peopleOutline });

    // validasiones pasajero
    this.formPasajero = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9 ]*$'),
        ]
      ],
      apellido: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9 ]*$'),
        ]

      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
        ]
      ],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('^[0-9]*$')
        ]
      ],
      password2: ['', Validators.required],
    }, {
      validators: this.passwordsMatchValidator,  // Validador personalizado para comprobar que coincidan
      updateOn: 'change'  // La validación se ejecutará al enviar el formulario
    });

    // validasiones conductor
    this.formCondutor = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z0-9 ]*$'),
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
        ]
      ],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[0-9]{10,15}$/)
        ]
      ],
      patente: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          // Validators.pattern('^[A-Z]{2}-[A-Z]{2}-[0-9]{2}$'),
        ]

      ],
      modelo: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
        ]

      ],
      anno: [
        '',
        [
          Validators.required,
          Validators.min(1000),
          Validators.max(9999)
        ]

      ],
      capacidad: [
        '',
        [
          Validators.required,
          Validators.max(10),
          Validators.min(1)
        ]

      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('^[0-9]*$')
        ]
      ],
      password2: ['', Validators.required],
    }, {
      validators: this.passwordsMatchValidator,  // Validador personalizado para comprobar que coincidan
      updateOn: 'change'  // La validación se ejecutará al enviar el formulario
    });
  }




  //pasar a user.servece
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const password2 = control.get('password2')?.value;

    return password === password2 ? null : { passwordsMismatch: true };
  }

  // Método para seleccionar el formulario
  showForm(formType: boolean) {
    this.selectedForm = formType;
    this.formPasajero.reset();
    this.formCondutor.reset();
    console.log(this.selectedForm);
  }


  // Métodos para manejar el envío del formulario
  async submitPasajero() {
    this.formPasajero.markAllAsTouched();

    if (this.formPasajero.valid) {
      const pasajero = {
        nombre: this.formPasajero.get('nombre')?.value,
        apellido: this.formPasajero.get('apellido')?.value,
        email: this.formPasajero.get('email')?.value,
        telefono: this.formPasajero.get('telefono')?.value,
        enViaje: false,
        uid: '',
        tipo: "pasajero"
      }
      //crear cuenta en firebase auth
      try {
        // Espera hasta que Firebase genere el UID
        const userCredential = await this.authFirebaseService.register(
          pasajero.email,
          this.formPasajero.get('password')?.value
        );

        // Asigna el UID al pasajero
        const user = userCredential.user;
        pasajero.uid = user.uid;


        console.log('Datos del pasajero:', pasajero);

        let resp = await this.firestoreService.addDocument("usuarios", pasajero)
        if (resp) {
          alert('usuario pasajero agregada')
          this.router.navigate(['login']);
        } else {
          alert('usuario pasajero no agregada')
        }
      } catch (error) {
        console.error('Error en la creación del usuario:', error);
      }

    }

    else {
      console.error('Formulario no valido');
    }

  }

  async submitConductor() {
    if (this.formCondutor.valid) {
      this.formCondutor.markAllAsTouched();
      const conductor = {
        nombre: this.formCondutor.get('nombre')?.value,
        email: this.formCondutor.get('email')?.value,
        telefono: this.formCondutor.get('telefono')?.value,
        patente: this.formCondutor.get('patente')?.value,
        modelo: this.formCondutor.get('modelo')?.value,
        anno: this.formCondutor.get('anno')?.value,
        capacidad: this.formCondutor.get('capacidad')?.value,
        uid: '',
        tipo: "conductor",
        valoracion: []
      }

      //crear cuenta en firebase auth
      try {
        // Espera hasta que Firebase genere el UID
        const userCredential = await this.authFirebaseService.register(
          conductor.email,
          this.formCondutor.get('password')?.value
        );

        // Asigna el UID al pasajero
        const user = userCredential.user;
        conductor.uid = user.uid;


        let resp = await this.firestoreService.addDocument("usuarios", conductor)
        if (resp) {
          alert('usuario pasajero agregada')
          this.router.navigate(['login']);
        } else {
          alert('usuario pasajero no agregada')
        }
      } catch (error) {
        console.error('Error en la creación del usuario:', error);
      }


    }
    else {
      console.error('Formulario no valido');
    }

  }
}



