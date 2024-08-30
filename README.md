
---

# FactuClient

<img style="width:50%" src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3R3MmRvcDR3Znd5N3RoczF4MjV1ZWJrc2t6Y2tuNWt6eWU0ZzV3NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FAEEL82CUc1JPBas1V/giphy.webp" alt="Image Invoice" >

**FactuClient** es una aplicación de gestión diseñada para facilitar la creación, visualización y manejo de albaranes y facturas de clientes. Los usuarios pueden crear perfiles de clientes, gestionar sus datos, generar facturas a partir de albaranes existentes, y descargar o compartir estas facturas y albaranes en formato PDF. Este proyecto es parte del proyecto final del BootCamp de ISDICODERS.

## Tecnologías Utilizadas

**Frontend:**
- **React** - Biblioteca de JavaScript para construir interfaces de usuario.
- **Vite** - Herramienta de desarrollo rápida para proyectos de frontend.
- **TailwindCSS** - Framework de CSS para diseño responsivo.
- **React-PDF** - Librería para generar y visualizar documentos PDF en aplicaciones React.

**Backend:**
- **Node.js** - Entorno de ejecución para JavaScript en el servidor.
- **Express** - Framework web para Node.js.
- **MongoDB** - Base de datos NoSQL para almacenamiento de datos.
- **Mongoose** - ODM para MongoDB en Node.js.

**Testing:**
- **Mocha** - Framework de pruebas para JavaScript.
- **Chai** - Librería de aserciones para pruebas.

## Instalación

### Requisitos Previos

- Node.js (versión 14 o superior)
- MongoDB (en ejecución y accesible)

### Instrucciones

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/FactuClient.git
   cd FactuClient
   ```

2. **Instalar las dependencias del frontend:**

   ```bash
   cd factuclient
   npm install
   ```

3. **Instalar las dependencias del backend:**

   ```bash
   cd ../api
   npm install
   ```

4. **Configurar las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```plaintext
   PORT=3000
   MONGODB_URL=mongodb://localhost:27017/tu-base-de-datos
   ```

5. **Iniciar el servidor:**

   ```bash
   cd api
   npm run start
   ```

6. **Iniciar el frontend:**

   ```bash
   cd factuclient
   npm run dev
   ```

## Uso

Una vez que el servidor y el frontend están en funcionamiento, puedes acceder a la aplicación en [http://localhost:3000](http://localhost:3000). Aquí puedes:

- **Crear Clientes:** Añadir nuevos clientes con sus respectivos datos.
- **Gestionar Clientes:** Editar y actualizar los perfiles de los clientes existentes.
- **Visualizar Albaranes y Facturas:** Revisar todas las facturas y albaranes asociados a cada cliente.
- **Crear Facturas a partir de Albaranes:** Generar facturas directamente desde los albaranes existentes.
- **Descargar y Compartir PDFs:** Utilizando la librería React-PDF, puedes generar, descargar y compartir albaranes y facturas en formato PDF con un solo clic.

## Estructura del Proyecto

```
FactuClient/
├── api/                  
│   ├── coverage/             # Reportes de cobertura de pruebas
│   ├── handlers/             # Manejadores de rutas y lógica de controladores
│   ├── logic/                # Lógica de negocio y funciones utilitarias
│   ├── model/                # Modelos de datos de Mongoose
│   ├── test/                 # Pruebas unitarias con Mocha y Chai
│   ├── utils/                # Funciones utilitarias y helpers
│   ├── routes.js             # Definición de las rutas de la API
│   └── server.js             # Configuración e inicio del servidor
├── doc/                      # Documentacion proyecto modelo de datos
├── com/                      # Package validate, errors.
├── FactuClient/              # Código fuente del frontend
│   ├── dist/                 # Archivos estáticos generados para producción
│   ├── public/               # Recursos públicos, como imágenes y favicons
│   ├── src/                  # Código fuente principal de la aplicación React
│   ├── utils/                # Funciones utilitarias específicas del frontend
│   ├── index.html            # Archivo HTML principal
│   ├── tailwind.config.js    # Configuración de TailwindCSS
│   └── vite.config.js        # Configuración de Vite
├── .env                      # Variables de entorno
├── .gitignore                # Archivos y carpetas ignorados por Git
├── README.md                 # Documentación principal del proyecto
```

## Testing

El backend de la aplicación está testeado en más del 95% utilizando Mocha y Chai. Para ejecutar las pruebas:

```bash
cd api
npm run test
```

## Licencia

Este proyecto está bajo la licencia MIT. Puedes consultar el archivo [LICENSE](LICENSE) para más detalles.

## Autores

- **Jose A. Cantó** - Desarrollador Principal y Autor del Proyecto


---
