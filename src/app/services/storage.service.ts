import { Injectable } from '@angular/core';

import { IonicStorageModule, Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  //variables auxiliares
  datos: any[] = [];
  dato: any = {};

  private storage: Storage | null = null;// definiendo la propiedad 'storage'


  constructor(private storageInstance: Storage) {
    this.init();// inicializo almacenamiento 
  }
  //construccion inicializacion 
  async init() {

    const storage = await this.storageInstance.create();

    if (!this.storage) {
      this.storage = await this.storageInstance.create();

    }

  }// fin init 

  async agregarCarrera(key: string, jsonAgregar: any) {
    this.datos = await this.storage?.get(key) || []; // llave -valor
    let existe = await this.obtenerDato(key, jsonAgregar.identificador)

    if (existe == undefined) {
      this.datos.push(jsonAgregar)
      await this.storage?.set(key, this.datos)
      return true;

    }
    return false;


  }


  async agregarUserPasajero(key: string, jsonAgregar: any) {
    console.log("storage",jsonAgregar)
    this.datos = await this.storage?.get(key) || []; // llave -valor
    let existe = await this.obtenerDato(key, jsonAgregar.identificador)

    if (existe == undefined) {
      this.datos.push(jsonAgregar)
      await this.storage?.set(key, this.datos)
      return true;

    }
    return false;
  }

  async agregarUserConductor(key: string, jsonAgregar: any) {
    console.log("storage",jsonAgregar)
    this.datos = await this.storage?.get(key) || []; // llave -valor
    let existe = await this.obtenerDato(key, jsonAgregar.identificador)

    if (existe == undefined) {
      this.datos.push(jsonAgregar)
      await this.storage?.set(key, this.datos)
      return true;

    }
    return false;
  }

  async obtenerDato(key: string, uid: string) {
    this.datos = await this.storage?.get(key) || []
    this.dato = this.datos.find(valor => valor.uid == uid)
    return this.dato;
  }

  async obtenerDatoPorIdentificador(key: string, identificador: string) {
    this.datos = await this.storage?.get(key) || [];
    this.dato = this.datos.find(valor => valor.identificador == identificador)
    return this.dato;
  }

// se trae la carrera mientras que su estado sea igual al estado que le paso por parametro
  async obtenerDatoCarreraEnProceso(key: string, uid: string, estado?: string) {
    this.datos = await this.storage?.get(key) || [];
    this.dato = this.datos.find(valor => 
      valor.uid === uid && (estado ? valor.estado === estado : true)
    );
    return this.dato;
  }

  // se trae la carrera mientras que su estado sea distinto de el estado que le paso por parametro
  async obtenerDatoCarreraExcluyendoEstado(key: string, uid: string, estado?: string) {
    this.datos = await this.storage?.get(key) || [];
    this.dato = this.datos.find(valor => 
      valor.uid === uid && (estado ? valor.estado !== estado : true) 
    );
    return this.dato;
  }

  async obtenerCarrerasPorEstado(key: string, estado: string) {
    this.datos = await this.storage?.get(key) || [];
    const datosFiltrados = this.datos.filter(valor => valor.estado === estado);
    return datosFiltrados;
  }

  async obtenerCarreraPorUidPasajero(key: string, uidPasajero: string) {
    // Obtener el array de carreras del storage
    this.datos = await this.storage?.get(key) || [];
  
    // Buscar la carrera que cumpla con las condiciones
    this.dato = this.datos.find(carrera => 
      carrera.estado !== "finalizada" && 
      carrera.viajePasajero.some((pasajero:any) => pasajero.uid === uidPasajero)
    );
  
    return this.dato; // Retorna el objeto carrera que cumple con los requisitos o undefined si no existe
  }
  
  async modificarDato(key: string, identificador: string, nuevoObjeto: any) {

    this.datos = await this.storage?.get(key) || [];
  
    const indice = this.datos.findIndex(valor => valor.identificador === identificador);
  
    if (indice !== -1) {
      this.datos[indice] = nuevoObjeto; // Reemplazar el objeto antiguo con el nuevo
      await this.storage?.set(key, this.datos); // Guardar los datos modificados en el almacenamiento
      return true; // Indicar que la modificación fue exitosa
    } 
    return false; // Indicar que no se encontró el objeto para modificar
  }

  async eliminarDato(key: string, identificador: string) {
    // Obtener los datos actuales
    this.datos = await this.storage?.get(key) || [];
  
    // Encontrar el índice del elemento a eliminar
    const index = this.datos.findIndex(valor => valor.identificador === identificador);
  
    if (index !== -1) {
      // Si el elemento existe, elimínalo
      this.datos.splice(index, 1);
  
      // Guardar los datos actualizados en el almacenamiento
      await this.storage?.set(key, this.datos);
      console.log(`Elemento con identificador ${identificador} eliminado correctamente.`);
      return true;
    } else {
      console.log(`Elemento con identificador ${identificador} no encontrado.`);
      return false;
    }
  }

  async eliminarPasajeroDeCarrera(key: string, identificadorCarrera: string, uidPasajero: string) {
    // Obtener el array de carreras del storage
    this.datos = await this.storage?.get(key) || [];
  
    // Encontrar la carrera con el identificador dado
    const carrera = this.datos.find(c => c.identificador === identificadorCarrera);
  
    if (carrera) {
      // Encontrar el índice del pasajero en el array viajePasajero
      const indexPasajero = carrera.viajePasajero.findIndex((p:any) => p.uid === uidPasajero);
  
      // Verificar si el pasajero existe
      if (indexPasajero !== -1) {
        // Eliminar el pasajero del array viajePasajero
        carrera.viajePasajero.splice(indexPasajero, 1);
  
        // Guardar los datos actualizados en el storage
        await this.storage?.set(key, this.datos);
  
        console.log(`Pasajero con uid ${uidPasajero} eliminado de la carrera con identificador ${identificadorCarrera}.`);
        return true;
      } else {
        console.log(`Pasajero con uid ${uidPasajero} no encontrado en la carrera con identificador ${identificadorCarrera}.`);
        return false;
      }
    } else {
      console.log(`Carrera con identificador ${identificadorCarrera} no encontrada.`);
      return false;
    }
  }

  async modificarPasajeroDeCarrera(key: string, identificadorCarrera: string, uidPasajero: string, nuevosDatos: any) {
    // Obtener el array de carreras del storage
    this.datos = await this.storage?.get(key) || [];
  
    // Encontrar la carrera con el identificador dado
    const carrera = this.datos.find(c => c.identificador === identificadorCarrera);
  
    if (carrera) {
      // Encontrar el índice del pasajero en el array viajePasajero
      const indexPasajero = carrera.viajePasajero.findIndex((p: any) => p.uid === uidPasajero);
  
      // Verificar si el pasajero existe
      if (indexPasajero !== -1) {
        // Modificar los datos del pasajero en el array viajePasajero
        carrera.viajePasajero[indexPasajero] = {
          ...carrera.viajePasajero[indexPasajero],
          ...nuevosDatos // Aquí se aplican las modificaciones
        };
  
        // Guardar los datos actualizados en el storage
        await this.storage?.set(key, this.datos);
  
        console.log(`Pasajero con uid ${uidPasajero} modificado en la carrera con identificador ${identificadorCarrera}.`);
        return true;
      } else {
        console.log(`Pasajero con uid ${uidPasajero} no encontrado en la carrera con identificador ${identificadorCarrera}.`);
        return false;
      }
    } else {
      console.log(`Carrera con identificador ${identificadorCarrera} no encontrada.`);
      return false;
    }
  }
  
  async obtenerViajePasajero(key: string, identificadorCarrera: string, uidPasajero: string) {
    // Obtener el array de carreras del storage
    this.datos = await this.storage?.get(key) || [];
  
    // Encontrar la carrera con el identificador dado
    const carrera = this.datos.find(c => c.identificador === identificadorCarrera);
  
    if (carrera) {
      // Buscar el viaje del pasajero en el array viajePasajero
      const viajePasajero = carrera.viajePasajero.find((p: any) => p.uid === uidPasajero);
  
      if (viajePasajero) {
        console.log(`Viaje del pasajero con uid ${uidPasajero} encontrado en la carrera con identificador ${identificadorCarrera}.`);
        return viajePasajero;
      } else {
        console.log(`Pasajero con uid ${uidPasajero} no encontrado en la carrera con identificador ${identificadorCarrera}.`);
        return null;
      }
    } else {
      console.log(`Carrera con identificador ${identificadorCarrera} no encontrada.`);
      return null;
    }
  }
  
  

}// fin class StorageService
