import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-firebase.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule]
})
export class LoginPage {
  uid = '';
  usuario: any = {}
  loginForm!: FormGroup;
  isAlertOpen = false; // Controlar el estado del IonAlert
  alertHeader = ''; // Encabezado dinámico del alerta
  alertMessage = ''; // Mensaje dinámico del alerta
  alertCssClass = '';

  constructor(private fb: FormBuilder, private router: Router,
    private authFirebaseService: AuthService,
    private firestoreService: FirestoreService,) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$'),
        ]

      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('^[0-9]*$'),
        ]


      ]
    })

  }//fin constructor

  async onLogin() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      try {
        // Autenticar al usuario con Firebase
        const userCredential = await this.authFirebaseService.login(email, password);
        const user = userCredential.user;
        this.uid = user.uid;

        this.usuario = await this.firestoreService.getDocumentsByUidAndField('usuarios', 'uid', this.uid);

        // Mostrar alerta y redirigir según el tipo de usuario
        if (this.usuario[0].tipo === 'conductor') {
          this.alertHeader = '¡Bienvenido, Conductor!';
          this.alertMessage = 'Has iniciado sesión exitosamente.';
          this.isAlertOpen = true;
          this.alertCssClass = 'success-alert';

          setTimeout(() => {
            this.isAlertOpen = false; // Cerrar alerta
            this.router.navigate(['conductor/home']);
          }, 3000);
        } else if (this.usuario[0].tipo === 'pasajero') {
          this.alertHeader = '¡Bienvenido, Pasajero!';
          this.alertMessage = 'Has iniciado sesión exitosamente.';
          this.isAlertOpen = true;
          this.alertCssClass = 'success-alert';

          setTimeout(() => {
            this.isAlertOpen = false; // Cerrar alerta
            this.router.navigate(['pasajero/home']);
          }, 3000);
        }
      } catch (error: any) {
        // Manejo de errores
        this.alertHeader = 'Error de Inicio de Sesión';
        this.alertMessage = 'Credenciales invalidas' // Obtener mensaje personalizado
        this.alertCssClass = 'error-alert';
        this.isAlertOpen = true;
      }
    } else {
      console.error('Formulario no válido');
    }
  }

  resetAlert() {
    this.isAlertOpen = false;
  }
  }//FIn
