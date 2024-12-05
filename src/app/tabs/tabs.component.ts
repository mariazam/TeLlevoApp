import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {  location, qrCodeOutline, homeOutline ,carSportOutline, personOutline, locationOutline} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [IonicModule],  
})
export class TabsComponent implements OnInit {

  constructor() {
    addIcons({
      location,
      locationOutline,
      qrCodeOutline,
      homeOutline,
      carSportOutline,
      personOutline
    });
  }

  ngOnInit() {}
}
