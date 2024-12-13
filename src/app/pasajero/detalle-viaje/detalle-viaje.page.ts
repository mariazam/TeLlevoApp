import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { personCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ConfirmacionPasejeroComponent } from 'src/app/modals/modal-confirmacion-pasejero/confirmacion-pasejero.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth-firebase.service';


@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.page.html',
  styleUrls: ['./detalle-viaje.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ConfirmacionPasejeroComponent]
})
export class DetalleViajePage implements OnInit {

  id = "";
  uid: string|null = "";
  user: any = [];
  valor: number = 0

  carreraExistente : any = {}
  userConductor : any = {}


  constructor(private route: ActivatedRoute,private authService: AuthService, private firestoreService: FirestoreService, private router2: Router
  ) {
    addIcons({ personCircleOutline })
  }

  ngOnInit() {
    this.obtenerCarrera();
    
  }

  hasKeys(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
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
  

  async obtenerCarrera() {
    this.route.queryParams.forEach(async params => {
      this.id = params['id'];
      if (this.id) {
        this.carreraExistente = await this.firestoreService.getDocumentById('carreras', this.id);   
        this.userConductor = await this.firestoreService.getDocumentsByUidAndField("usuarios","tipo","conductor","uid",this.carreraExistente.uid);
        this.valor = this.calcularPromedio(this.userConductor[0].valoracion);

      } else {
        console.log("ID no encontrado en los parámetros de la URL.");
      }
    });
  }
  calcularPromedio(numeros: number[]): number {
    if( numeros === undefined || numeros.length === 0 ){
      return 0;
    }
  
    const suma = numeros.reduce((acc, num) => acc + num, 0);
    const promedio = suma / numeros.length;
    
    return Math.round(promedio * 10) / 10; // Redondear a un decimal
  }
  
  



  capitalizeFirstLetter(str: string): string {
    if (!str) return str; // Retorna el string original si está vacío

    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async volver () {
    this.router2.navigate(['/pasajero/home']);
  }


}
