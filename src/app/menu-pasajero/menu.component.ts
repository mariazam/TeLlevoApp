import { Component, OnInit, Input  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports:[RouterModule]
})
export class MenuComponent  implements OnInit {
  @Input() nombreUser!: string; // Nombre del usuario que se pasará desde la página
  constructor() { }

  ngOnInit() {}

  closeNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar?.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }

}
