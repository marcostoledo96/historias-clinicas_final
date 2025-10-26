# 🏥 Sistema de Historias Clínicas

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Compatible-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

Sistema web completo que desarrollé para gestión de historias clínicas médicas. Backend en Node.js/Express con PostgreSQL y frontend en HTML/CSS/JavaScript vanilla.

## 🌐 Demo en Vivo

**[Ver Demo en Vercel →](https://tu-proyecto.vercel.app)**

**Credenciales para probar:**
- Usuario: `demo@historias.com` / `demo123`
- Admin: `admin@historias.com` / `admin123`

## ✨ Características que implementé

- 🔐 **Autenticación segura** con sesiones
- 👥 **Gestión completa de pacientes** 
- 📋 **Historial médico** detallado
- 📅 **Sistema de turnos**
- 🎨 **Interfaz responsive**
- 🗄️ **Base de datos PostgreSQL**
- ☁️ **Deploy en Vercel**
- 🎭 **Modo demo** sin afectar datos reales

## Requisitos técnicos

- Node.js 18+ (recomiendo la versión LTS)
- PostgreSQL (local o en la nube - yo uso Supabase)
- Windows PowerShell (las instrucciones están para este shell)

## Configuración

Necesitas crear un archivo `.env` dentro de `backend/` con estas variables:

```
# Conexión a PostgreSQL (puedes usar una de estas opciones)
DATABASE_URL=postgres://usuario:password@host:5432/basedatos
# O por separado:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=tu_password
# DB_NAME=historias_clinicas

# Para las sesiones
SESSION_SECRET=un_secreto_muy_seguro

# Opcionales
PORT=3000          # Si omites, usa 3000 por defecto. Si 3000 está ocupado, el servidor reintenta 3001..3005 automáticamente.
AUTO_OPEN=0        # 1 para abrir navegador al iniciar
# SSL: por defecto activo; desactivar sólo si tu proveedor lo exige
# NO_SSL=true      # Desactiva SSL (evítalo en producción)
# PGSSLMODE=no-verify | disable | prefer
```

Notas importantes:
- La conexión implementa SSL robusto por defecto; para proveedores con certificados no verificados, se usa `rejectUnauthorized=false` cuando corresponde.
- El servidor escucha `process.env.PORT || 3000` (recomendado: 3000 fijo para desarrollo local).

## Instalación

Desde PowerShell, en la raíz del proyecto:

```powershell
cd backend
npm install
```

## Inicializar base de datos

- Ejecutar esquema y semillas rápidas (toma `database/scripts.sql` + `database/seeds.sql`):

```powershell
# Desde backend/
node migrate.js
# o con npm
npm run db:migrate
```

- Ejecutar un SQL específico (por ejemplo, una migración puntual):

```powershell
# Desde backend/
node run_sql.js ..\database\migrations\20251019_turnos_paciente_opcional.sql
```

- Crear o promover un usuario admin:

```powershell
# Desde backend/
# Directo
node scripts\create_admin.js --email=admin@clinica.com --password=Secreta123 --nombre="Dra. Admin"
# o vía npm (nota: usar "--" para pasar argumentos)
npm run admin:create -- --email=admin@clinica.com --password=Secreta123 --nombre="Dra. Admin"
```

- Verificar/Ajustar usuario demo y su hash:

```powershell
# Desde backend/
node scripts\check_seed.js
# o con npm
npm run db:check-seed
```

## Ejecutar en desarrollo

Libera el puerto 3000 si está ocupado y luego inicia el servidor.

```powershell
# Ver procesos usando 3000
netstat -ano | findstr :3000
# Finaliza el PID (reemplaza 12345 por el PID encontrado)
Stop-Process -Id 12345 -Force

# Iniciar la API + frontend estático
cd backend
npm run dev
```

Abre http://localhost:3000 (si `AUTO_OPEN=1`, se abrirá solo).

### Aislamiento por usuario (multi-tenant)

- Todos los datos de pacientes, consultas y turnos se aíslan por cuenta (columna `id_usuario`).
- Los modelos y controladores aplican filtros por usuario en todas las operaciones.
- Restricciones de BD: `pacientes` tiene índice único compuesto `(id_usuario, dni)` (ignora `dni` nulo).
- Si migras una base existente, ejecuta la migración incremental:

```powershell
# Desde backend/
node run_sql.js ..\database\migrations\20251021_multi_tenant.sql
```

Esto agrega `id_usuario` a tablas existentes, hace backfill y crea índices/foráneas.

## Estructura del proyecto

```
backend/
  server.js                # Express + rutas + sesiones + estáticos
  db/connection.js         # Pool de PostgreSQL (SSL/IPV4 first)
  routes/                  # Rutas REST (auth, pacientes, consultas, turnos)
  controllers/             # Lógica de negocio
  models/                  # Acceso a datos (pg)
  middlewares/             # Autenticación, validaciones y logging
  scripts/                 # Utilidades: create_admin, check_seed
  migrate.js               # Ejecuta database/scripts.sql + seeds.sql
  run_sql.js               # Ejecuta un archivo SQL arbitrario

frontend/
  *.html                   # Vistas (login, pacientes, turnos, consultas, etc.)
  js/                      # Módulos JS por página + utils + selector pacientes
  css/styles.css           # Estilos, utilidades, tema oscuro, Material Symbols

database/
  scripts.sql              # Esquema base
  seeds.sql                # Datos de ejemplo
  migrations/              # Cambios incrementales

docs/                      # Diagramas PlantUML de flujos clave
```

## Convenciones y UX relevantes

- Better Comments en todo el código: `// *`, `// ?`, `// !`, `// TODO`.
- Iconos: Google Material Symbols (Outlined) vía import en `styles.css`.
- Turnos:
  - “Nuevo Turno” se abre en página separada; no crea paciente automáticamente.
  - Si no hay `id_paciente`, se usan `paciente_nombre_tmp` y `paciente_apellido_tmp`.
  - Navegación de fechas sin paginación, segura en zona horaria local.
- Action bars responsivas con utilidades flex/gap; compactas en móvil.

## API REST (principal)

Autenticación y perfil
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/verificar`
- POST `/api/auth/registro` (solo admin)
- GET `/api/auth/perfil` (sesión requerida)
- PUT `/api/auth/perfil` (sesión requerida)
- PUT `/api/auth/password` (sesión requerida)
- POST `/api/auth/recuperar` (flujo demo)
- POST `/api/auth/restablecer` (flujo demo)

Pacientes
- GET `/api/pacientes` (q=busqueda opcional)
- GET `/api/pacientes/:id`
- GET `/api/pacientes/buscar/:dni`
- POST `/api/pacientes`
- POST `/api/pacientes/minimo`
- PUT `/api/pacientes/:id`
- DELETE `/api/pacientes/:id` (soft delete)

Consultas
- GET `/api/consultas`
- GET `/api/consultas/:id`
- GET `/api/consultas/paciente/:id_paciente`
- GET `/api/consultas/fecha/:fecha`
- POST `/api/consultas`
- PUT `/api/consultas/:id`
- DELETE `/api/consultas/:id`

Turnos
- GET `/api/turnos`
- GET `/api/turnos/hoy`
- GET `/api/turnos/:id`
- GET `/api/turnos/dia/:dia`
- GET `/api/turnos/paciente/:id_paciente`
- POST `/api/turnos`
- PUT `/api/turnos/:id`
- PUT `/api/turnos/:id/situacion`
- DELETE `/api/turnos/:id`

## Solución de problemas

- Puerto 3000 ocupado: usa `netstat -ano | findstr :3000` y `Stop-Process -Id <PID> -Force` en PowerShell.
- SSL/Supabase: si tu proveedor obliga SSL sin CA, está soportado con `PGSSLMODE=no-verify` o `NO_SSL=true` (evitar en prod).
- Usuario demo: ejecuta `node scripts\check_seed.js` si no puedes entrar con el usuario de pruebas.

## Licencia

MIT (ajústala a tus necesidades si corresponde).