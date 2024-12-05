import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class NotFoundPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

}
