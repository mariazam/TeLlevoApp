import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth-firebase.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule, RouterModule]
})
export class LoginPage {
  uid = '';
  usuario: any = {}
  loginForm!: FormGroup;

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
          Swal.fire({
            title: '¡Bienvenido, Conductor!',
            text: 'Has iniciado sesión exitosamente.',
            icon: 'success',
            confirmButtonText: 'Continuar',
            allowOutsideClick: false,
            heightAuto: false,
          }).then(() => {
            this.router.navigate(['conductor/home']);
          });
        } else if (this.usuario[0].tipo === 'pasajero') {
          Swal.fire({
            title: '¡Bienvenido, Pasajero!',
            text: 'Has iniciado sesión exitosamente.',
            icon: 'success',
            confirmButtonText: 'Continuar',
            allowOutsideClick: false,
            heightAuto: false,
          }).then(() => {
            this.router.navigate(['pasajero/home']);
          });
        }
      } catch (error: any) {
        Swal.fire({
          title: 'Error de Inicio de Sesión',
          text: 'Credenciales inválidas. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Cerrar',
          heightAuto: false,
        });
      }
    } else {
      Swal.fire({
        title: 'Formulario no válido',
        text: 'Por favor, revisa los campos.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        heightAuto: false,
      });

    }
  }

}//FIn
