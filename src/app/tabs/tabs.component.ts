import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
// import { addIcons } from 'ionicons';
// import {  location, qrCodeOutline, homeOutline ,carSportOutline, personOutline, locationOutline} from 'ionicons/icons';
import { MatTabsModule } from '@angular/material/tabs';
import { ConductorPage } from '../conductor/home-conductor/home-conductor.page';
import { CarrerasEnProcesoPage } from '../conductor/carreras-en-proceso/carreras-en-proceso.page';
import { PerfilUsuarioPage } from '../conductor/perfil-usuario/perfil-usuario.page';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [MatTabsModule, ConductorPage, CarrerasEnProcesoPage, PerfilUsuarioPage],  
})
export class TabsComponent implements OnInit {

  constructor() {
    // addIcons({
    //   location,
    //   locationOutline,
    //   qrCodeOutline,
    //   homeOutline,
    //   carSportOutline,
    //   personOutline
    // });
  }

  ngOnInit() {}
}
