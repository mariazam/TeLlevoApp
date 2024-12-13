import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { TabsComponent } from './tabs/tabs.component';
import { ConductorPage } from './conductor/home-conductor/home-conductor.page';
import { CarrerasEnProcesoPage } from './conductor/carreras-en-proceso/carreras-en-proceso.page';
import { PerfilUsuarioPage } from './conductor/perfil-usuario/perfil-usuario.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'recover-password',
    loadComponent: () => import('./auth/recover-password/recover-password.page').then(m => m.RecoverPasswordPage),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./auth/sign-up/sign-up.page').then(m => m.SignUpPage),
  },
  //conductor
  {
    path: 'conductor/home',
    canActivate: [AuthGuard],
    data: { role: 'conductor' }, // Solo para conductores
    component: ConductorPage
  },
  {
    path: 'conductor/carreras-en-proceso',
    canActivate: [AuthGuard],
    component: CarrerasEnProcesoPage,
    data: { role: 'conductor' }, // Solo para conductores
  },
  {
    path: 'conductor/perfil-usuario',
    canActivate: [AuthGuard],
    component: PerfilUsuarioPage,
    data: { role: 'conductor' }, // Solo para conductores
  },
  {
    path: 'conductor/mapa',
    canActivate: [AuthGuard],
    data: { role: 'conductor' }, // Solo para conductores
    loadComponent: () => import('./maps/maps.page').then(m => m.MapsPage)
  },
  //pasajero
  {
    path: 'pasajero/home',
    canActivate: [AuthGuard],
    data: { role: 'pasajero' }, // Solo para pasajeros
    loadComponent: () => import('./pasajero/home-pasajero/home-pasajero.page').then(m => m.HomePasajeroPage)
  },
  {
    path: 'pasajero/perfil-usuario',
    canActivate: [AuthGuard],
    data: { role: 'pasajero' }, // Solo para pasajeros
    loadComponent: () => import('./pasajero/perfil-usuario/perfil-usuario.page').then(m => m.PerfilUsuarioPage)
  },
  {
    path: 'pasajero/viaje-actual',
    canActivate: [AuthGuard],
    data: { role: 'pasajero' }, // Solo para pasajeros
    loadComponent: () => import('./pasajero/viaje-actual/viaje-actual.page').then(m => m.ViajeActualPage)
  },
  {
    path: 'pasajero/detalle-viaje',
    canActivate: [AuthGuard],
    data: { role: 'pasajero' }, // Solo para pasajeros
    loadComponent: () => import('./pasajero/detalle-viaje/detalle-viaje.page').then(m => m.DetalleViajePage)
  },
  {
    path: 'pasajero/mapa',
    canActivate: [AuthGuard],
    data: { role: 'pasajero' }, // Solo para conductores
    loadComponent: () => import('./maps/maps.page').then(m => m.MapsPage)
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
