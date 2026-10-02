const express = require('express');
const cors = require('cors');

const jugadorRoutes = require('./routes/jugadorRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const historialRoutes = require('./routes/historialRoutes');

const { autenticar } = require('./middlewares/auth');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// En una funcion serverless de Vercel no podemos confiar en NODE_ENV para
// decidir que origen permitir (no siempre llega seteado como 'production'
// en ese entorno). En cambio, armamos la lista de origenes permitidos a
// partir de las variables que SI estan definidas: si existe
// FRONTEND_URL_PROD la agregamos, y lo mismo con FRONTEND_URL_DEV. Asi
// funciona tanto en Vercel (solo con la de produccion) como en local
// (solo con la de desarrollo), sin depender de NODE_ENV.
const origenesPermitidos = [process.env.FRONTEND_URL_PROD, process.env.FRONTEND_URL_DEV]
    .filter(Boolean)
    .map((origen) => origen.replace(/\/$/, ''));

app.use(cors({
    origin(origen, callback) {
        // Sin header Origin (ej: Postman, curl) o origen en la lista: ok.
        if (!origen || origenesPermitidos.includes(origen.replace(/\/$/, ''))) {
            return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS: ' + origen));
    },
}));

app.use(express.json());

app.use('/jugadores', jugadorRoutes);
app.use('/empresas', empresaRoutes);
app.use('/actividades', actividadRoutes);
app.use('/historial', historialRoutes);
app.get('/', autenticar, (req, res) => {
    res.json({
        status: 'ok',
        mensaje: 'API Analista de Seguridad funcionando',
        jugadorId: req.usuario.id
    });
});

app.use(errorHandler);

module.exports = app;
