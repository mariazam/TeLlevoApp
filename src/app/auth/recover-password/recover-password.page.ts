import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-firebase.service';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule, RouterModule]
})
export class RecoverPasswordPage {

  recoverForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private authFirebaseService : AuthService ) {

    this.recoverForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
        ]
      ]
    })
  }

  onSubmit() {
    this.recoverForm.markAllAsTouched();
    if (this.recoverForm.valid) {
      const email = this.recoverForm.get('email')?.value;
  
      this.authFirebaseService.recoverPassword(email)
        .then(() => {
          Swal.fire({
            title: '¡Correo enviado!',
            text: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            heightAuto: false,
          }).then(() => {
            this.router.navigate(['/login']);
          });
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al enviar el correo. Por favor, inténtalo nuevamente.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
            allowOutsideClick: false,
            heightAuto: false,
          });
        });
    } else {
      Swal.fire({
        title: 'Formulario no válido',
        text: 'Por favor, ingresa un correo electrónico válido.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        allowOutsideClick: false,
        heightAuto: false,
      });
    }
  }
  
}
