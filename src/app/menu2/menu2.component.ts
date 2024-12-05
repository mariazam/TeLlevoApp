import { Component, OnInit } from '@angular/core';
import {IonicModule} from '@ionic/angular';
import { addIcons  } from 'ionicons';
import{home, informationCircle,gitNetworkOutline} from 'ionicons/icons'

@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.scss'],
  standalone: true,
  imports:[IonicModule]

})
export class Menu2Component  implements OnInit {

  constructor() {
    addIcons({home,
       informationCircle,
       gitNetworkOutline
      })
  }

  


  ngOnInit() {}

}
