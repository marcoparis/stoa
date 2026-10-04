const express = require('express');
const books = require("./booksdb.js");
const { isValid, isValidPassword, userExists, registerUser } = require("./auth_users.js");

const public_users = express.Router();

// Simulates asynchronous data access (e.g. a database) with async/await.
const getBooks = () => Promise.resolve(books);

const matches = (value, query) => value.toLowerCase().includes(query.trim().toLowerCase());

const findBooks = async (field, query) => {
    const booksData = await getBooks();
    return Object.entries(booksData)
        .filter(([, book]) => matches(book[field], query))
        .map(([isbn, book]) => ({ isbn, ...book }));
};

public_users.post("/register", async (req, res, next) => {
    try {
        const { username, password } = req.body ?? {};

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        if (!isValid(username)) {
            return res.status(400).json({ message: "Invalid username: 3-30 characters among letters, digits, '.', '_' and '-'" });
        }
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "The password must be between 6 and 72 characters" });
        }
        if (userExists(username)) {
            return res.status(409).json({ message: "Username already exists" });
        }

        await registerUser(username, password);
        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        return next(err);
    }
});

public_users.get('/', async (req, res, next) => {
    try {
        res.status(200).json(await getBooks());
    } catch (err) {
        next(err);
    }
});

public_users.get('/isbn/:isbn', async (req, res, next) => {
    try {
        const book = (await getBooks())[req.params.isbn];
        if (!book) return res.status(404).json({ message: "Book not found" });
        return res.status(200).json(book);
    } catch (err) {
        return next(err);
    }
});

public_users.get('/author/:author', async (req, res, next) => {
    try {
        const results = await findBooks('author', req.params.author);
        if (results.length === 0) return res.status(404).json({ message: "No books found for this author" });
        return res.status(200).json(results);
    } catch (err) {
        return next(err);
    }
});

public_users.get('/title/:title', async (req, res, next) => {
    try {
        const results = await findBooks('title', req.params.title);
        if (results.length === 0) return res.status(404).json({ message: "No books found with this title" });
        return res.status(200).json(results);
    } catch (err) {
        return next(err);
    }
});

public_users.get('/review/:isbn', async (req, res, next) => {
    try {
        const book = (await getBooks())[req.params.isbn];
        if (!book) return res.status(404).json({ message: "Book not found" });
        return res.status(200).json(book.reviews);
    } catch (err) {
        return next(err);
    }
});

module.exports.general = public_users;
