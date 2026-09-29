const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Simula un recupero asincrono dei dati (es. da un DB) restando fedele
// alla struttura async/Promise richiesta dagli esercizi 10-13.
const getBooks = () => Promise.resolve(books);

// 1️⃣ Registrazione di un nuovo utente
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username e password sono obbligatori" });
    }

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username già esistente" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "Utente registrato con successo" });
});

// 2️⃣ Get all books (Task 10)
public_users.get('/', async (req, res) => {
    try {
        const booksData = await getBooks();
        res.status(200).send(JSON.stringify(booksData, null, 4));
    } catch (err) {
        res.status(500).json({ message: "Errore durante il recupero dei libri", error: err.message });
    }
});

// 3️⃣ Get book by ISBN (Task 11)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const booksData = await getBooks();
        const book = booksData[isbn];
        if (book) res.status(200).send(JSON.stringify(book, null, 4));
        else res.status(404).json({ message: "Libro non trovato" });
    } catch (err) {
        res.status(500).json({ message: "Errore durante il recupero del libro", error: err.message });
    }
});

// 4️⃣ Get book by author (Task 12)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const booksData = await getBooks();
        const filteredBooks = Object.values(booksData).filter(book => book.author === author);

        if (filteredBooks.length > 0) res.status(200).send(JSON.stringify(filteredBooks, null, 4));
        else res.status(404).json({ message: "Nessun libro trovato per questo autore" });
    } catch (err) {
        res.status(500).json({ message: "Errore durante il recupero dei libri", error: err.message });
    }
});

// 5️⃣ Get book by title (Task 13)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const booksData = await getBooks();
        const filteredBooks = Object.values(booksData).filter(book => book.title === title);

        if (filteredBooks.length > 0) res.status(200).send(JSON.stringify(filteredBooks, null, 4));
        else res.status(404).json({ message: "Nessun libro trovato con questo titolo" });
    } catch (err) {
        res.status(500).json({ message: "Errore durante il recupero dei libri", error: err.message });
    }
});

// 6️⃣ Get book reviews
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    try {
        const booksData = await getBooks();
        const book = booksData[isbn];
        if (!book) return res.status(404).json({ message: "Libro non trovato" });
        if (book.reviews && Object.keys(book.reviews).length > 0) res.status(200).send(JSON.stringify(book.reviews, null, 4));
        else res.status(200).json({ message: "Nessuna recensione per questo libro" });
    } catch (err) {
        res.status(500).json({ message: "Errore durante il recupero del libro", error: err.message });
    }
});

module.exports.general = public_users;
