import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-firebase.service'; // Tu servicio de autenticación
import { FirestoreService } from '../services/firestore.service'; // Tu servicio de Firestore


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, // Servicio de autenticación
    private firestoreService: FirestoreService, // Servicio de Firestore
    private router: Router // Router para redirecciones
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Obtener el UID del usuario actual
      const uid = await this.authService.getCurrentUser();

      if (!uid) {
        // Si no hay usuario autenticado, redirigir al login
        this.router.navigate(['/login']);
        return false;
      }

      // Usar FirestoreService para obtener el usuario desde Firestore
      const user: any[] = await this.firestoreService.getDocumentsByUidAndField(
        'usuarios', // Colección
        'uid', // Campo UID
        uid // Valor del UID
      );

      if (user.length === 0) {
        // Si no se encuentra el usuario en Firestore, redirigir al login
        this.router.navigate(['/login']);
        return false;
      }

      const userData = user[0]; // Obtener el primer resultado (debería ser único)
      const requiredRole = route.data['role']; // Obtener el rol requerido desde la configuración de la ruta

      // Verificar si el rol del usuario coincide con el requerido
      if (userData['tipo'] !== requiredRole) {
        console.log(`Acceso denegado. Se requiere rol: ${requiredRole}`);
        this.router.navigate(['/login']);
        return false;
      }

      return true; // Permitir el acceso si cumple las condiciones
    } catch (error) {
      console.error('Error en el guard de autenticación:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
