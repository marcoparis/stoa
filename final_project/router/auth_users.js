const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const books = require('./booksdb.js');
const { jwtSecret, jwtExpiresIn } = require('../config.js');

const regd_users = express.Router();

// In-memory user store: { username, passwordHash }
const users = [];

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores bytes beyond 72
const MAX_REVIEW_LENGTH = 1000;

const isValid = (username) => typeof username === 'string' && USERNAME_PATTERN.test(username);

const isValidPassword = (password) =>
    typeof password === 'string' &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH;

const userExists = (username) => users.some((u) => u.username === username);

const registerUser = async (username, password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ username, passwordHash });
};

const authenticatedUser = async (username, password) => {
    const user = users.find((u) => u.username === username);
    if (!user || typeof password !== 'string') return false;
    return bcrypt.compare(password, user.passwordHash);
};

// Accepts either "Authorization: Bearer <token>" or the token saved in the session at login.
const authenticate = (req, res, next) => {
    const header = req.get('Authorization');
    const token = header?.startsWith('Bearer ')
        ? header.slice('Bearer '.length)
        : req.session?.authorization?.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Accesso negato: effettua il login." });
    }

    try {
        const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        req.user = { username: payload.username };
        return next();
    } catch {
        return res.status(403).json({ message: "Token non valido o scaduto: effettua di nuovo il login." });
    }
};

regd_users.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({ message: "Username e password sono obbligatori" });
    }

    if (!(await authenticatedUser(username, password))) {
        return res.status(401).json({ message: "Username o password non corretti" });
    }

    const accessToken = jwt.sign({ username }, jwtSecret, { algorithm: 'HS256', expiresIn: jwtExpiresIn });
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Login effettuato con successo", token: accessToken });
});

regd_users.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ message: "Logout effettuato" });
    });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    const review = (req.body?.review ?? req.query.review)?.toString().trim();

    if (!book) {
        return res.status(404).json({ message: "Libro non trovato" });
    }
    if (!review) {
        return res.status(400).json({ message: "Devi fornire una recensione (query ?review= oppure body JSON { review })" });
    }
    if (review.length > MAX_REVIEW_LENGTH) {
        return res.status(400).json({ message: `La recensione non può superare ${MAX_REVIEW_LENGTH} caratteri` });
    }

    const isUpdate = Boolean(book.reviews[req.user.username]);
    book.reviews[req.user.username] = review;

    return res.status(isUpdate ? 200 : 201).json({
        message: isUpdate ? "Recensione modificata con successo" : "Recensione aggiunta con successo",
        reviews: book.reviews,
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({ message: "Libro non trovato" });
    }
    if (!book.reviews[req.user.username]) {
        return res.status(404).json({ message: "Non hai recensito questo libro" });
    }

    delete book.reviews[req.user.username];

    return res.status(200).json({ message: "Recensione cancellata con successo", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.authenticate = authenticate;
module.exports.isValid = isValid;
module.exports.isValidPassword = isValidPassword;
module.exports.userExists = userExists;
module.exports.registerUser = registerUser;
module.exports.users = users;
