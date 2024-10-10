import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [ MatCardModule, MatButtonModule ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent {
  private router = inject(Router);

  goToHome() {
    this.router.navigate(['/']);
  }
}
