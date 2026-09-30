const express = require('express');
const session = require('express-session');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { authenticated: customer_routes, authenticate } = require('./router/auth_users.js');
const { general: genl_routes } = require('./router/general.js');
const openapi = require('./docs/openapi.js');
const { sessionSecret, isProduction, corsOrigins } = require('./config.js');

const app = express();

app.set('json spaces', 2);
app.set('trust proxy', 1); // behind the hosting provider's HTTPS proxy
app.disable('x-powered-by');

// The web frontend is served from another origin and authenticates with a Bearer token, so no credentials are needed.
app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '10kb' }));

app.use("/customer", session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: 60 * 60 * 1000 },
}));

app.use("/customer/auth", authenticate);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: "Book Reviews API" }));
app.get("/openapi.json", (req, res) => res.json(openapi));

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.use((req, res) => {
    res.status(404).json({ message: `Endpoint non trovato: ${req.method} ${req.originalUrl}` });
});

// Express recognises error handlers by their 4-argument signature, so `next` must stay.
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: "JSON non valido nel body della richiesta" });
    }
    console.error(err);
    return res.status(500).json({ message: "Errore interno del server" });
});

module.exports = app;
