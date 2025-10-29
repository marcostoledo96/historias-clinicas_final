// Conexión a PostgreSQL
// Este módulo configura el Pool de conexiones usando .env o DATABASE_URL
const { Pool } = require('pg');
const dns = require('dns');
const path = require('path');
// Prefiero IPv4 primero para evitar problemas de ENOTFOUND/ETIMEDOUT
try { dns.setDefaultResultOrder && dns.setDefaultResultOrder('ipv4first'); } catch {}
// Cargo .env desde backend específicamente para evitar problemas de directorio
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Permito configurar la conexión usando DATABASE_URL o campos separados
const hasConnectionString = !!process.env.DATABASE_URL;

// Función para parsear DATABASE_URL y convertirla a objeto que entienda pg
function parseDatabaseUrl(dbUrl) {
  try {
    const u = new URL(dbUrl);
    return {
      host: u.hostname,
      port: Number(u.port || 5432),
      user: decodeURIComponent(u.username || 'postgres'),
      password: decodeURIComponent(u.password || ''),
      database: decodeURIComponent((u.pathname || '/postgres').slice(1)),
    };
  } catch (e) {
    console.warn('No se pudo parsear DATABASE_URL, usando connectionString directo. Motivo:', e.message);
    return { connectionString: dbUrl };
  }
}

// Configuración base dependiendo de si hay DATABASE_URL o no
const baseConfig = hasConnectionString
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'historias_clinicas',
      port: Number(process.env.DB_PORT || 5432),
    };

// Configuración SSL robusta por defecto (para servicios como Supabase/Heroku)
// Se puede desactivar con NO_SSL=true o PGSSLMODE=disable
const sslMode = String(process.env.PGSSLMODE || '').toLowerCase();
const noSSL = String(process.env.NO_SSL || '').toLowerCase() === 'true' || sslMode === 'disable';
const noVerify = sslMode === 'no-verify' || sslMode === 'prefer';

const sslConfig = noSSL
  ? false
  : { require: true, rejectUnauthorized: !noVerify && false };

// * Crear Pool de conexiones
const pool = new Pool({
  ...baseConfig,
  ssl: sslConfig,
});

// * Manejar errores del Pool en clientes inactivos (evita que el proceso se caiga)
//   Casos típicos: reinicio del servidor, pooler cerrando conexiones, timeouts, mantenimiento.
pool.on('error', (err) => {
  try {
    const msg = err && err.message ? err.message : String(err);
    const code = err && err.code ? ` (code: ${err.code})` : '';
    console.error(`⚠️  Error del Pool/cliente inactivo${code}:`, msg);
  } catch (_) {
    console.error('⚠️  Error del Pool/cliente inactivo');
  }
});

// ? Probar la conexión al iniciar (log no bloqueante)
pool
  .connect()
  .then((client) => {
    console.log('✅ Conectado a PostgreSQL exitosamente');
    client.release();
  })
  .catch((err) => {
    try {
      const safe = {
        host: baseConfig.host,
        port: baseConfig.port,
        database: baseConfig.database,
        user: baseConfig.user ? baseConfig.user.replace(/.*/,'***') : undefined, // no exponer
        ssl: sslConfig ? { require: sslConfig.require, rejectUnauthorized: sslConfig.rejectUnauthorized } : false,
      };
      console.error('❌ Error conectando a PostgreSQL:', err.message, '\nDetalles:', safe);
    } catch (_) {
      console.error('❌ Error conectando a PostgreSQL:', err.message);
    }
  });

module.exports = pool;