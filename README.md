"# TeLlevoApp" 

1 descargar
2 npm install

## Configuración de Entornos

3. crea una carpeta environments en la carpeta raiz del proyecto `src/environments`
4. Crear archivo environment.ts `src/environments/environment.ts`.
5. Si necesitas un entorno de producción, crea `src/environments/environment.prod.ts`.
6. Ajusta los valores según tu configuración.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "tu_api_key",
    authDomain: "tu_authDomain",
    projectId: "tu_projectId",
    storageBucket: "tu_storageBucket",
    messagingSenderId: "tu_messagingSenderId",
    appId: "tu_appId"
  }
};

7. ionic serve.




