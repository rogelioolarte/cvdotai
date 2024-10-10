import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', pathMatch: 'full', component: HomePageComponent, title: 'CV.AI' },
  { path: 'about', pathMatch: 'full', component: AboutPageComponent, title: 'About' },
  { path: '**', component: NotFoundComponent }
];
