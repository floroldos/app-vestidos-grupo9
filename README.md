# Sistema de Alquiler de Vestidos

Aplicación web para gestión de alquiler de vestidos desarrollada con Next.js, TypeScript y Tailwind CSS.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 20+** y **npm 10+** - [Descargar desde nodejs.org](https://nodejs.org)
- **Git** - [Descargar desde git-scm.com](https://git-scm.com)
- **Docker Desktop** (solo si vas a usar Jenkins) - [Descargar desde docker.com](https://www.docker.com/products/docker-desktop)

Verifica las versiones instaladas:
```bash
node -v
npm -v
git --version
```

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/floroldos/app-vestidos-grupo9.git
cd app-vestidos-grupo9
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Seguridad
SESSION_SECRET=tu_clave_secreta_super_segura

# Credenciales de Admin de ejemplo
ADMIN_USER=tu_usuario
ADMIN_PASS=tu_contraseña

# URL de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**IMPORTANTE**: Cambia `SESSION_SECRET` por una clave segura en producción.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## Tecnologías Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: SQLite (better-sqlite3) en memoria
- **Estilos**: Tailwind CSS
- **Testing**: Playwright
- **CI/CD**: Jenkins

## Persistencia de Datos - SQLite

### Configuración

El proyecto usa **SQLite en memoria** con la librería `better-sqlite3`:

- **Base de datos**: SQLite en memoria (`:memory:`)
- **No requiere instalación** de base de datos externa
- **Datos temporales**: Se pierden al reiniciar el servidor

### ¿Cómo funciona?

1. **Inicialización automática**: Al iniciar el servidor, se crea automáticamente:
   - Base de datos SQLite en memoria
   - Tablas `items` y `rentals`
   - Datos iniciales (8 vestidos y 3 reservas de ejemplo)

2. **Ubicación del código**:
   - **`lib/database.ts`**: Configuración de SQLite y funciones de BD
   - **`lib/RentalManagementSystem.ts`**: Lógica de negocio y datos iniciales

3. **Datos de ejemplo**:
   - **Items**: 8 vestidos predefinidos (4 originales + 4 duplicados)
   - **Reservas**: 3 reservas activas de ejemplo
   - Se cargan automáticamente al iniciar


### Cambiar a SQLite persistente (archivo)

Si necesitas que los datos persistan, modifica en `lib/database.ts`:

```typescript
// En memoria (actual)
globalThis.__db = new Database(':memory:');

// Persistente (cambiar a esto)
globalThis.__db = new Database('./data.db');
```

## Testing

### Ejecutar todos los tests de Playwright

```bash
# Todos los tests en todos los navegadores (chromium, firefox, webkit)
npx playwright test

# Todos los tests solo en Chromium (más rápido)
npx playwright test --project=chromium

# Ver el reporte de tests ejecutados
npx playwright show-report
```

### Ejecutar tests con opciones

```bash
# Con interfaz gráfica
npx playwright test --ui

# En modo debug (paso a paso)
npx playwright test --debug

# En modo headed (ver el navegador)
npx playwright test --headed

# Tests específicos por archivo
npx playwright test tests/specs/api/login.spec.ts

# Tests específicos por patrón
npx playwright test login
```

### Atajos con npm (alternativos)

```bash
npm run test:e2e           # Ejecuta todos los tests
npm run test:e2e:ui        # Con interfaz gráfica
npm run test:e2e:debug     # En modo debug
npm run test:e2e:report    # Ver reporte
```

## Jenkins con Docker

Para ejecutar el pipeline de CI/CD:

### 1. Asegúrate de tener Docker Desktop abierto y corriendo

### 2. Levantar Jenkins en Docker

```bash
docker run -d -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

### 3. Acceder a Jenkins

- Abre: **http://localhost:8080**
- Obtén la contraseña inicial:
  ```bash
  docker exec <container-id> cat /var/jenkins_home/secrets/initialAdminPassword
  ```

### 4. Configurar el pipeline

- Crea un nuevo pipeline
- Apunta al `Jenkinsfile` del repositorio
- Configura el webhook o polling de Git

El Jenkinsfile ejecutará automáticamente:
1. ✅ Build de la aplicación
2. ✅ Tests en Chromium
3. ✅ Validaciones de linting

## Scripts Disponibles

```bash
npm run dev        # Inicia servidor de desarrollo
npm run build      # Crea build de producción
npm start          # Ejecuta build de producción
npm run lint       # Ejecuta ESLint
npm run test:e2e   # Ejecuta tests de Playwright
```

## Acceso al Panel de Admin

Para acceder al panel administrativo:

1. Ve a: **http://localhost:3000/admin/login**
2. Usa las credenciales configuradas en `.env`:
   - Usuario: `admin`
   - Contraseña: `supersegura123`

## 📂 Estructura del Proyecto

```
app-vestidos-grupo9/
├── src/
│   ├── app/              # Páginas y rutas (Next.js App Router)
│   ├── components/       # Componentes reutilizables
│   └── middleware.ts     # Middleware de Next.js
├── lib/                  # Lógica de negocio y base de datos
├── tests/                # Tests E2E con Playwright
├── public/               # Archivos estáticos
├── Dockerfile            # Configuración de Docker
├── Jenkinsfile           # Pipeline de CI/CD
└── playwright.config.ts  # Configuración de Playwright
```

## Notas Importantes

- El puerto 3000 debe estar libre. Si está ocupado, cambia el puerto:
  ```bash
  # Windows PowerShell
  $env:PORT=3001; npm run dev
  
  # macOS/Linux
  PORT=3001 npm run dev
  ```

- Para producción, **siempre** cambia `SESSION_SECRET` en `.env`
- Docker Desktop debe estar corriendo para usar Jenkins
- Los tests requieren que el servidor esté corriendo en puerto 3000


