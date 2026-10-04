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

// Usernames of the sample reviews in booksdb.js cannot be registered, so nobody can take over those reviews.
const RESERVED_USERNAMES = new Set(Object.values(books).flatMap((b) => Object.keys(b.reviews)));

const userExists = (username) => RESERVED_USERNAMES.has(username) || users.some((u) => u.username === username);

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
        return res.status(401).json({ message: "Access denied: please log in." });
    }

    try {
        const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        req.user = { username: payload.username };
        return next();
    } catch {
        return res.status(403).json({ message: "Invalid or expired token: please log in again." });
    }
};

regd_users.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!(await authenticatedUser(username, password))) {
        return res.status(401).json({ message: "Incorrect username or password" });
    }

    const accessToken = jwt.sign({ username }, jwtSecret, { algorithm: 'HS256', expiresIn: jwtExpiresIn });
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Logged in successfully", token: accessToken });
});

regd_users.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.status(200).json({ message: "Logged out" });
    });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];
    const review = (req.body?.review ?? req.query.review)?.toString().trim();

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!review) {
        return res.status(400).json({ message: "You must provide a review (query ?review= or JSON body { review })" });
    }
    if (review.length > MAX_REVIEW_LENGTH) {
        return res.status(400).json({ message: `The review cannot exceed ${MAX_REVIEW_LENGTH} characters` });
    }

    const isUpdate = Boolean(book.reviews[req.user.username]);
    book.reviews[req.user.username] = review;

    return res.status(isUpdate ? 200 : 201).json({
        message: isUpdate ? "Review updated successfully" : "Review added successfully",
        reviews: book.reviews,
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!book.reviews[req.user.username]) {
        return res.status(404).json({ message: "You have not reviewed this book" });
    }

    delete book.reviews[req.user.username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.authenticate = authenticate;
module.exports.isValid = isValid;
module.exports.isValidPassword = isValidPassword;
module.exports.userExists = userExists;
module.exports.registerUser = registerUser;
module.exports.users = users;
