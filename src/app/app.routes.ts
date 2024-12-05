import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

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
  {
    path: 'conductor',
    loadComponent: () => import('./tabs/tabs.component').then(m => m.TabsComponent),
    canActivate: [AuthGuard],
    data: { role: 'conductor' }, // Solo para conductores
    children: [

      {
        path: 'home',
        loadComponent: () => import('./conductor/home-conductor/home-conductor.page').then(m => m.ConductorPage)
      },
      {
        path: 'carreras-en-proceso',
        loadComponent: () => import('./conductor/carreras-en-proceso/carreras-en-proceso.page').then(m => m.CarrerasEnProcesoPage)
      },
      {
        path: 'perfil-usuario',
        loadComponent: () => import('./conductor/perfil-usuario/perfil-usuario.page').then( m => m.PerfilUsuarioPage)
      },
      {
        path: 'mapa',
        loadComponent: () => import('./maps/maps.page').then( m => m.MapsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: 'pasajero',
    loadComponent: () => import('./tabs-pasajero/tabs-pasajero.component').then(m => m.TabsPasajeroComponent),
    canActivate: [AuthGuard],
    data: { role: 'pasajero' }, // Solo para pasajeros
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pasajero/home-pasajero/home-pasajero.page').then(m => m.HomePasajeroPage)
      },
      {
        path: 'perfil-usuario',
        loadComponent: () => import('./pasajero/perfil-usuario/perfil-usuario.page').then( m => m.PerfilUsuarioPage)
      },
      {
        path: 'viaje-actual',
        loadComponent: () => import('./pasajero/viaje-actual/viaje-actual.page').then( m => m.ViajeActualPage)
      },
      {
        path: 'mapa',
        loadComponent: () => import('./maps/maps.page').then( m => m.MapsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'detalle-viaje',
        loadComponent: () => import('./pasajero/detalle-viaje/detalle-viaje.page').then(m => m.DetalleViajePage)
         },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
