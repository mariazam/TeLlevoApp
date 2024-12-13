import { Component, OnInit, Input  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.scss'],
  standalone: true,
  imports:[RouterModule]

})
export class Menu2Component  implements OnInit {
  @Input() nombreUser!: string; // Nombre del usuario que se pasará desde la página

  constructor(private router: Router) {
    
  }

  ngOnInit() {}

  closeNavbar() {
    const navbar = document.getElementById('navbarNav');
    if (navbar?.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }

}
