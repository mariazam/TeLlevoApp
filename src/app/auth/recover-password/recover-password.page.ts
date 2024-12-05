import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-firebase.service';


@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule]
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

      this.authFirebaseService.recoverPassword( email)
        .then(() => {
          
          console.log("se envio el correo")
          this.router.navigate(['/login']);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
        });
    } else {
      console.error('Formulario no valido');
    }
  }
}
