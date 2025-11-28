const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const axios = require('axios');

const app = express();

app.use(express.json());

// Attiva la sessione solo per /customer
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware di autenticazione basato su sessione
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session && req.session.user) {
        // Utente autenticato → continua
        next();
    } else {
        // Utente NON autenticato → blocca accesso
        return res.status(401).json({
            message: "Accesso negato: effettua il login."
        });
    }
});

const PORT = 5000;

// Rotte
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
