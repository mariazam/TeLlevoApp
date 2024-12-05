import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) { }

  //obtengo la collection 

  getDocuments(collectionName: string) {
    return this.firestore.collection(collectionName).valueChanges({ idField: 'id' });
  }
  //creo la collection
  addDocument(collectionName: string, data: any) {
    return this.firestore.collection(collectionName).add(data);
  }
  //actualizo la collection 

  updateDocument(collectionName: string, documentId: string, data: any) {
    return this.firestore.collection(collectionName).doc(documentId).update(data);
  }

  async updateByIdOrField(
    collectionName: string,
    identifier: { id?: string; field?: string; value?: any },
    updateData: { [key: string]: any } = { enViaje: true } // Por defecto establece enViaje = true
  ) {
    try {
      let documentRef: any;

      // Validación estricta para buscar por campo
      if (identifier.field !== undefined && identifier.value !== undefined) {
        const querySnapshot = this.firestore.collection(collectionName, (ref) =>
          ref.where(identifier.field!, '==', identifier.value)
        );

        const result = await firstValueFrom(querySnapshot.snapshotChanges());
        if (result.length === 0) {
          throw new Error(
            `No se encontró ningún documento con ${identifier.field} = '${identifier.value}' en la colección '${collectionName}'.`
          );
        }

        // Usamos el primer documento que coincida
        const docSnapshot = result[0];
        documentRef = docSnapshot.payload.doc.ref;
      } else if (identifier.id) {
        // Actualizar por ID
        documentRef = this.firestore.collection(collectionName).doc(identifier.id);
      } else {
        throw new Error('Debes proporcionar un ID o un campo y valor para actualizar el documento.');
      }

      // Actualizar el documento con los datos proporcionados
      await documentRef.update(updateData);

      return { id: documentRef.id, ...updateData }; // Retorna el ID y los datos actualizados
    } catch (error) {
      console.error(`Error al actualizar el documento en '${collectionName}':`, error);
      throw error;
    }
  }
  //elimino
  deleteDocument(collectionName: string, documentId: string) {
    return this.firestore.collection(collectionName).doc(documentId).delete();
  }

  // Buscar usuario por uid RETORNA array[] CUIDADO!!!!!!!!!!!!!!!!!!
  async getDocumentsByUidAndField(
    collectionName: string,
    uidField: string,
    uidValue: any,
    field?: string,
    value?: any,
    invertir: boolean = false
  ) {
    try {
      // Combinación de filtros
      const querySnapshot = this.firestore.collection(collectionName, (ref) => {
        let query = ref.where(uidField, '==', uidValue); // Filtrar por UID
        if (field && value !== undefined) {
          query = invertir
            ? query.where(field, '!=', value) // Agregar filtro inverso
            : query.where(field, '==', value); // Agregar filtro normal
        }
        return query;
      });

      const result = await firstValueFrom(querySnapshot.valueChanges({ idField: 'id' }));

      if (result.length === 0) {
        console.warn(
          `No se encontraron documentos en '${collectionName}' con ${uidField} = '${uidValue}' y ${field} ${invertir ? '!=' : '=='} '${value}'.`
        );
      }

      return result;
    } catch (error) {
      console.error(`Error en la búsqueda combinada en '${collectionName}':`, error);
      throw error;
    }
  }




  async getDocumentById(collectionName: string, documentId: string) {
    try {
      // Obtener la referencia del documento
      const documentRef = this.firestore.collection(collectionName).doc(documentId);

      // Convertir el Observable a una Promesa
      const document = await firstValueFrom(documentRef.valueChanges());

      if (!document) {
        throw new Error(`No se encontró ningún documento con ID '${documentId}' en la colección '${collectionName}'.`);
      }

      return { id: documentId, ...document }; // Retornar los datos junto con el ID
    } catch (error) {
      console.error(`Error al buscar el documento con ID '${documentId}' en '${collectionName}':`, error);
      throw error;
    }
  }
}
