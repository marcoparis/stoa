# Stoà

A review site for philosophy and psychology books: Marcus Aurelius, Seneca and the Stoics, Plato and Epicurus, Kant, Schopenhauer, Nietzsche, the existentialists and some psychology classics such as Frankl, Jung, Freud and Kahneman.

Anyone can browse the catalog, filter it by school of thought and search by title or author. Registered users can write, edit and delete their own reviews.

- Site: https://marcoparis.github.io/stoa/
- API: https://expressbookreviews-xlyg.onrender.com (interactive documentation at `/api-docs`)

The API runs on Render's free plan, which shuts down after a period of inactivity: the first request can take up to a minute, and in the meantime the site shows a notice.

## How it is built

Two separate projects that talk in JSON:

- `frontend/`: React app published on GitHub Pages
- `backend/`: REST API in Node.js and Express, published on Render

On login the API returns a JWT, which the site stores and sends in the `Authorization` header with every protected request. The API only accepts browser requests from the origins listed in `CORS_ORIGINS`.

### Frontend

React 19 with React Router. I use `HashRouter` because GitHub Pages only serves static files and could not handle an address such as `/books/3`. Login state lives in a React Context, with a `useAuth` hook. The token stays in `localStorage` until it expires; when it expires the user is logged out with a message. Search and school-of-thought filter end up in the URL, so a result can be shared.

The covers are black-and-white author portraits, tinted by school of thought, with title and author on top. I do not use the real covers because they are protected by the publishers' copyright.

Build with Vite, tests with Vitest and React Testing Library, lint with oxlint.

### Backend

Express 4. Passwords are stored with bcrypt. The JWT lasts one hour and is accepted both as a `Bearer` header and through an `httpOnly` session cookie. Each user can only change their own reviews. Input and text length are validated. Errors always come back as JSON, with a central handler and a 404 for addresses that do not exist.

The OpenAPI 3 documentation is served with Swagger UI at `/api-docs`, where every endpoint can be tried out. The tests use Jest and Supertest on the in-memory app, without opening a port: this is why `app.js` is separate from `index.js`.

| Method | Path | Login | What it does |
| --- | --- | --- | --- |
| GET | `/` | | all books |
| GET | `/isbn/:isbn` | | one book |
| GET | `/author/:author`, `/title/:title` | | search, partial and case-insensitive |
| GET | `/review/:isbn` | | reviews of a book |
| POST | `/register` | | sign up |
| POST | `/customer/login`, `/customer/logout` | | log in and log out |
| PUT | `/customer/auth/review/:isbn` | yes | write or edit your own review |
| DELETE | `/customer/auth/review/:isbn` | yes | delete your own review |

## Run locally

You need Node.js 22 or later. In two terminals:

```bash
cd backend
npm install
npm run dev          # http://localhost:5000, documentation at /api-docs
```

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, uses the local API
```

Tests: `npm test` in each folder. To publish the site: `npm run deploy` in `frontend/`.

Without `JWT_SECRET` and `SESSION_SECRET` in `.env` (see `backend/.env.example`) the API generates random ones at startup, so tokens are valid until the restart. On Render they are created by the `render.yaml` blueprint.

## Limitations

Users and reviews are kept in memory and reset when the server restarts. The next step would be a database, such as PostgreSQL, behind the same routes. Before real use it would also need a limit on login attempts.

## Image credits

The author portraits come from [Wikimedia Commons](https://commons.wikimedia.org), cropped and converted to black and white:

| Author | Image by | License | Source |
| --- | --- | --- | --- |
| Marcus Aurelius | Marie-Lan Nguyen | CC BY 2.5 | [link](https://commons.wikimedia.org/wiki/File:Marcus_Aurelius_Louvre_MR561_n02.jpg) |
| Seneca | Calidius | CC BY-SA 3.0 | [link](https://commons.wikimedia.org/wiki/File:Duble_herma_of_Socrates_and_Seneca_Antikensammlung_Berlin_07.jpg) |
| Epictetus | Theodoor Galle | Public domain | [link](https://commons.wikimedia.org/wiki/File:Epictetus_from_L._Annaei_Senecae_philosophi_Opera,_1605,_title_page_detail.png) |
| Plato | Marie-Lan Nguyen | CC BY 2.5 | [link](https://commons.wikimedia.org/wiki/File:Plato_Silanion_Musei_Capitolini_MC1377.jpg) |
| Epicurus | Marie-Lan Nguyen | Public domain | [link](https://commons.wikimedia.org/wiki/File:Epicurus_Massimo_Inv197306.jpg) |
| Immanuel Kant | Johann Gottlieb Becker | Public domain | [link](https://commons.wikimedia.org/wiki/File:Immanuel_Kant_-_Gemaelde_2.jpg) |
| Arthur Schopenhauer | Johann Schäfer | Public domain | [link](https://commons.wikimedia.org/wiki/File:Arthur_Schopenhauer_by_J_Schäfer,_1859b.jpg) |
| Friedrich Nietzsche | Friedrich Hermann Hartmann | Public domain | [link](https://commons.wikimedia.org/wiki/File:Nietzsche187a.jpg) |
| Søren Kierkegaard | Royal Danish Library | Public domain | [link](https://commons.wikimedia.org/wiki/File:Søren_Kierkegaard_%281813-1855%29_-_%28cropped%29.jpg) |
| Albert Camus | United Press International | Public domain | [link](https://commons.wikimedia.org/wiki/File:Albert_Camus,_gagnant_de_prix_Nobel,_portrait_en_buste,_posé_au_bureau,_faisant_face_à_gauche,_cigarette_de_tabagisme.jpg) |
| Viktor E. Frankl | Prof. Dr. Franz Vesely | CC BY-SA 3.0 DE | [link](https://commons.wikimedia.org/wiki/File:Viktor_Frankl2.jpg) |
| Carl Gustav Jung | ETH-Bibliothek Zürich | Public Domain Mark | [link](https://commons.wikimedia.org/wiki/File:ETH-BIB-Jung,_Carl_Gustav_%281875-1961%29-Portrait-Portr_14163_%28cropped%29.tif) |
| Sigmund Freud | Max Halberstadt | Public domain | [link](https://commons.wikimedia.org/wiki/File:Sigmund_Freud,_by_Max_Halberstadt_%28cropped%29.jpg) |
| Daniel Kahneman | nrkbeta | CC BY-SA 2.0 | [link](https://commons.wikimedia.org/wiki/File:Daniel_Kahneman_%283283955327%29_%28cropped%29.jpg) |
| Erich Fromm | Müller-May | CC BY-SA 3.0 DE | [link](https://commons.wikimedia.org/wiki/File:Erich_Fromm_1974_%28cropped%292.jpg) |
