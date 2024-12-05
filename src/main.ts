import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom } from '@angular/core';
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from './environments/environment';

// Inicializa la app de Firebase
const firebaseApp: FirebaseApp = initializeApp(environment.firebaseConfig);

bootstrapApplication(AppComponent, {
  providers: [
    // Proveedor de FirebaseApp para inyección en servicios o componentes
    { provide: 'firebaseApp', useValue: firebaseApp },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(
      IonicStorageModule.forRoot(),
      AngularFireModule.initializeApp(environment.firebaseConfig),
      AngularFirestoreModule
    ),
  ],
});
