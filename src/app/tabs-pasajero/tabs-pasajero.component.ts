import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { carSportOutline, personOutline, qrCodeOutline, homeOutline, locationOutline } from 'ionicons/icons';


@Component({
  selector: 'app-tabs-pasajero',
  templateUrl: './tabs-pasajero.component.html',
  styleUrls: ['./tabs-pasajero.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class TabsPasajeroComponent  implements OnInit {

  constructor() { 
    addIcons({
      carSportOutline,
      personOutline,
      locationOutline,
      homeOutline,

    });
  }

  ngOnInit() {}

}
