import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute} from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';

declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class MapsPage implements OnInit, OnDestroy {
  mapa: any;
  marker: any;
  // currentLocation: any; // Variable para almacenar la ubicación actual
  // search: any;
  par_id: string = '';
  viaje: any = {};
  carrera: any = {};
  direccionInicio: string = '';
  direccionFin: string = '';
  coordenadasInicio: any = null;
  coordenadasFin: any = null; 
  

  // Variables para direcciones
  directionsService: any;
  directionsRenderer: any;

  constructor(private router: ActivatedRoute, private firestoreService: FirestoreService) {
    addIcons({ searchOutline });
  }

  async ngOnInit() {
    this.router.queryParams.subscribe(async (params) => {
      this.resetState();
      this.par_id = params['idV'];
  
      // Esperar a que datosCarrera obtenga las direcciones
      if (this.par_id) {
        await this.datosCarrera(); // Cargar datos del viaje y la carrera

        if (this.direccionInicio && this.direccionFin) {
          this.obtenerCoordenadasYCalcularRuta(); // Dibujar la ruta
        } else {
          alert('Faltan las direcciones de inicio o fin.');
        }
      }
    });
  }

  ngOnDestroy() {
    // Limpiar el mapa o cualquier referencia si es necesario
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
    }
  }

  resetState() {
    this.viaje = {};
    this.carrera = {};
    this.direccionInicio = '';
    this.direccionFin = '';
    this.coordenadasInicio = null;
    this.coordenadasFin = null;
  }

  async datosCarrera() {
      
    this.viaje = await this.firestoreService.getDocumentById("viaje",this.par_id)
    
    this.carrera = await this.firestoreService.getDocumentById("carreras",this.viaje.idCarrera)

    this.direccionInicio = this.carrera.inicioRuta
    this.direccionFin = this.viaje.destino
    
  }

  async obtenerCoordenadasYCalcularRuta() {
    // Crear instancia del servicio de Geocoding
    const geocoder = new google.maps.Geocoder();

    // Obtener coordenadas para la dirección de inicio
    geocoder.geocode({ address: this.direccionInicio }, (results: any, status: any) => {
      if (status === google.maps.GeocoderStatus.OK) {
        this.coordenadasInicio = results[0].geometry.location;
        console.log('Coordenadas de inicio:', this.coordenadasInicio);

        // Obtener coordenadas para la dirección de fin
        geocoder.geocode({ address: this.direccionFin }, (results: any, status: any) => {
          if (status === google.maps.GeocoderStatus.OK) {
            this.coordenadasFin = results[0].geometry.location;
            console.log('Coordenadas de fin:', this.coordenadasFin);

            // Dibujar el mapa y calcular la ruta
            this.dibujarMapa();
            this.calcularRuta();
          } else {
            alert('No se pudo obtener las coordenadas de la dirección de fin.');
          }
        });
      } else {
        alert('No se pudo obtener las coordenadas de la dirección de inicio.');
      }
    });
  }

   
  dibujarMapa() {
    const mapElement = document.getElementById('map');
    if (mapElement && this.coordenadasInicio) {
      this.mapa = new google.maps.Map(mapElement, {
        center: this.coordenadasInicio,
        zoom: 15,
      });

      // Inicializar DirectionsService y DirectionsRenderer
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.mapa);

      const trayecto = document.getElementById('trayecto') as HTMLElement;
      this.directionsRenderer.setPanel(trayecto);
    }
  }

  calcularRuta() {
    if (!this.coordenadasInicio || !this.coordenadasFin) {
      console.error('Coordenadas de inicio o fin no están definidas.');
      return;
    }

    const request = {
      origin: this.coordenadasInicio,
      destination: this.coordenadasFin,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
      } else {
        console.error('Error al calcular la ruta:', status);
        alert('Error al calcular la ruta.');
      }
    });
  }
}
