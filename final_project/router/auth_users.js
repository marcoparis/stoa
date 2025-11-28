const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Controllo che username e password siano forniti
    if (!username || !password) {
        return res.status(400).json({ message: "Username e password sono obbligatori" });
    }

    // Controlla se l'utente esiste
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Username o password non corretti" });
    }

    // Se tutto ok → genera token JWT
    const token = jwt.sign(
        { username: username },
        "access",       // chiave segreta
        { expiresIn: 60 * 60 } // 1 ora
    );

    // Salva le credenziali nella sessione
    req.session.user = { username: username, token: token };

    return res.status(200).json({ message: "Login effettuato con successo", token: token });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;  // recensione passata come query
    const username = req.session.user?.username; // username salvato nella sessione, ? serve a non generare errori se l'oggetto è nullo o vuoto

    // Controlli
    if (!username) {
        return res.status(401).json({ message: "Devi essere loggato per scrivere una recensione" });
    }

    if (!review) {
        return res.status(400).json({ message: "Devi fornire una recensione tramite query" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Libro non trovato" });
    }

    // Se la proprietà reviews non esiste, la inizializzi
    if (!book.reviews) {
        book.reviews = {};
    }

    // Aggiunge o modifica la recensione dell'utente
    book.reviews[username] = review;

    return res.status(200).json({ message: "Recensione aggiunta/modificata con successo", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.user?.username; // username salvato nella sessione

    if (!username) {
        return res.status(401).json({ message: "Devi essere loggato per cancellare una recensione" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Libro non trovato" });
    }

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Non hai recensito questo libro" });
    }

    // Cancella la recensione dell'utente
    delete book.reviews[username];

    return res.status(200).json({ message: "Recensione cancellata con successo", reviews: book.reviews });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
