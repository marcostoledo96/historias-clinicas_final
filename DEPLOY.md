# 🚀 Guía para subir a Vercel

## 📋 Cómo deployé mi sistema en Vercel

Esta es la guía que seguí para subir mi sistema de historias clínicas a Vercel y hacerlo accesible públicamente.

### 🏗️ Arquitectura que implementé

- **Frontend**: Archivos estáticos servidos desde `/frontend`
- **Backend**: API deployada como función serverless
- **Base de datos**: PostgreSQL en Supabase (ya configurada)
- **Dominio**: Se genera automáticamente como `mi-proyecto.vercel.app`

### 📋 Lo que necesitas antes de empezar

1. Cuenta en [Vercel](https://vercel.com)
2. Cuenta en GitHub (para conectar el repositorio)
3. Node.js 18+ instalado localmente

### 🔧 Pasos que seguí para el deploy

#### 1. Preparar el repositorio

```bash
# Me aseguré de estar en la carpeta del proyecto
cd c:\Users\Marcos\Desktop\Programacion\Github\Historias_clinicas

# Inicialicé git si no estaba inicializado
git init

# Agregué todos los archivos
git add .

# Hice commit
git commit -m "Preparar proyecto para deploy en Vercel"

# Agregué origin (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/tu-usuario/historias-clinicas.git

# Subí a GitHub
git push -u origin main
```

#### 2. Configuración en Vercel

1. Fui a [vercel.com](https://vercel.com) e inicié sesión
2. Hice clic en **"New Project"**
3. Conecté mi repositorio de GitHub
4. Seleccioné el repositorio `historias-clinicas`
5. Configuré estas opciones:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend`
   - **Install Command**: `npm install`

#### 3. Variables de Entorno que configuré

En el dashboard de Vercel, fui a **Settings > Environment Variables** y agregué:

```
PORT=3000
DATABASE_URL=postgresql://postgres.plampupjadhwwguquwwr:darasco887@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
SESSION_SECRET=historias_clinicas_secret_2024_muy_seguro_123
NODE_ENV=production
NO_SSL=false
PGSSLMODE=require
```

> ⚠️ **Nota importante**: Estas credenciales las incluí específicamente para que sea una demo funcional. En un proyecto real, nunca expondría credenciales de base de datos públicamente.

#### 4. Deploy final

1. Hice clic en **"Deploy"**
2. Esperé a que terminara el proceso (2-3 minutos)
3. Mi aplicación quedó disponible en `https://mi-proyecto.vercel.app`

### 🎯 Credenciales para la demo

Para que otros puedan probar la aplicación, incluí estas credenciales de ejemplo:

**Usuario de prueba:**
- Email: `demo@historias.com`
- Contraseña: `demo123`

**Usuario administrador:**
- Email: `admin@historias.com`  
- Contraseña: `admin123`

> 💡 **Tip**: Podés crear estos usuarios usando los scripts en `backend/scripts/`

### 🔧 Comandos útiles para crear usuarios

```bash
# Crear usuario administrador
npm run admin:create

# Crear usuario regular
npm run user:create
```

### 📁 Estructura de archivos importantes

```
├── vercel.json          # Configuración de Vercel
├── package.json         # Scripts de build
├── .env.vercel         # Variables de entorno de referencia
├── .gitignore          # Archivos excluidos
├── backend/
│   ├── server.js       # Servidor Express (actualizado para Vercel)
│   ├── package.json    # Dependencias del backend
│   └── ...
└── frontend/
    ├── index.html      # Punto de entrada
    └── ...
```

### 🚀 URLs importantes después del deploy

- **Aplicación**: `https://tu-proyecto.vercel.app`
- **API**: `https://tu-proyecto.vercel.app/api/*`
- **Dashboard Vercel**: `https://vercel.com/dashboard`

### 🐛 Solución de problemas

#### Error de CORS
Si tienes problemas de CORS, verifica que:
- Las variables de entorno estén configuradas
- El dominio de Vercel esté en la lista de orígenes permitidos

#### Error de Base de Datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que Supabase permita conexiones desde Vercel

#### Error de Sesiones
- Confirma que `SESSION_SECRET` esté configurado
- Verifica que las cookies estén habilitadas en el navegador

### 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en el dashboard de Vercel
2. Verifica las variables de entorno
3. Comprueba que la base de datos esté accesible

### 🎉 ¡Listo!

Tu sistema de historias clínicas ahora está disponible públicamente en Vercel. Puedes compartir la URL con empleadores, colegas o para incluir en tu portafolio.

**Características desplegadas:**
- ✅ Sistema completo de autenticación
- ✅ Gestión de pacientes
- ✅ Historial de consultas
- ✅ Sistema de turnos
- ✅ Panel de administración
- ✅ Responsive design
- ✅ Base de datos persistente