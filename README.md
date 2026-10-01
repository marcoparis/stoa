# Stoà

Un sito di recensioni per libri di filosofia e psicologia: Marco Aurelio, Seneca e gli stoici, Platone ed Epicuro, Kant, Schopenhauer, Nietzsche, gli esistenzialisti e alcuni classici della psicologia come Frankl, Jung, Freud e Kahneman.

Chiunque può sfogliare il catalogo, filtrarlo per corrente e cercare per titolo o autore. Chi si registra può scrivere, modificare e cancellare le proprie recensioni.

- Sito: https://marcoparis.github.io/stoa/
- API: https://expressbookreviews-xlyg.onrender.com (documentazione interattiva su `/api-docs`)

L'API sta sul piano gratuito di Render, che dopo un po' di inattività si spegne: la prima richiesta può impiegare fino a un minuto, e nel frattempo il sito mostra un avviso.

## Com'è fatto

Sono due progetti separati che parlano in JSON:

- `frontend/`: app React pubblicata su GitHub Pages
- `backend/`: API REST in Node.js ed Express, pubblicata su Render

Al login l'API restituisce un JWT, che il sito salva e manda nell'header `Authorization` a ogni richiesta protetta. L'API accetta richieste dal browser solo dalle origini indicate in `CORS_ORIGINS`.

### Frontend

React 19 con React Router. Uso `HashRouter` perché GitHub Pages serve solo file statici e non saprebbe gestire un indirizzo come `/books/3`. Lo stato di login sta in un Context React, con un hook `useAuth`. Il token resta in `localStorage` finché non scade; quando scade l'utente viene disconnesso con un messaggio. Ricerca e filtro per corrente finiscono nell'URL, così un risultato si può condividere.

Le copertine sono ritratti degli autori in bianco e nero, colorati in base alla corrente, con titolo e autore sopra. Non uso le copertine vere perché sono protette dal copyright degli editori.

Build con Vite, test con Vitest e React Testing Library, lint con oxlint.

### Backend

Express 4. Le password sono salvate con bcrypt. Il JWT dura un'ora e viene accettato sia come header `Bearer` sia tramite cookie di sessione `httpOnly`. Ogni utente può modificare solo le proprie recensioni. Input e lunghezza dei testi vengono validati. Gli errori tornano sempre in JSON, con un gestore centrale e un 404 per gli indirizzi che non esistono.

La documentazione OpenAPI 3 è servita con Swagger UI su `/api-docs`, da cui si possono provare tutti gli endpoint. I test usano Jest e Supertest sull'app in memoria, senza aprire una porta: per questo `app.js` è separato da `index.js`.

| Metodo | Percorso | Login | Cosa fa |
| --- | --- | --- | --- |
| GET | `/` | | tutti i libri |
| GET | `/isbn/:isbn` | | un libro |
| GET | `/author/:author`, `/title/:title` | | ricerca, anche parziale e senza distinguere maiuscole |
| GET | `/review/:isbn` | | recensioni di un libro |
| POST | `/register` | | registrazione |
| POST | `/customer/login`, `/customer/logout` | | accesso e uscita |
| PUT | `/customer/auth/review/:isbn` | sì | scrive o modifica la propria recensione |
| DELETE | `/customer/auth/review/:isbn` | sì | cancella la propria recensione |

## Avvio in locale

Serve Node.js 22 o successivo. In due terminali:

```bash
cd backend
npm install
npm run dev          # http://localhost:5000, documentazione su /api-docs
```

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173, usa l'API locale
```

Test: `npm test` in ciascuna cartella. Per pubblicare il sito: `npm run deploy` in `frontend/`.

Senza `JWT_SECRET` e `SESSION_SECRET` nel `.env` (vedi `backend/.env.example`) l'API ne genera di casuali all'avvio, quindi i token valgono fino al riavvio. Su Render le crea il blueprint `render.yaml`.

## Limiti

Utenti e recensioni sono in memoria e si azzerano quando il server riparte. Il passo successivo sarebbe un database, ad esempio PostgreSQL, dietro le stesse route. Prima di un uso reale servirebbe anche un limite ai tentativi di login.

## Crediti delle immagini

I ritratti degli autori vengono da [Wikimedia Commons](https://commons.wikimedia.org), ritagliati e convertiti in bianco e nero:

| Autore | Immagine di | Licenza | Fonte |
| --- | --- | --- | --- |
| Marco Aurelio | Marie-Lan Nguyen | CC BY 2.5 | [link](https://commons.wikimedia.org/wiki/File:Marcus_Aurelius_Louvre_MR561_n02.jpg) |
| Seneca | Calidius | CC BY-SA 3.0 | [link](https://commons.wikimedia.org/wiki/File:Duble_herma_of_Socrates_and_Seneca_Antikensammlung_Berlin_07.jpg) |
| Epitteto | Theodoor Galle | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Epictetus_from_L._Annaei_Senecae_philosophi_Opera,_1605,_title_page_detail.png) |
| Platone | Marie-Lan Nguyen | CC BY 2.5 | [link](https://commons.wikimedia.org/wiki/File:Plato_Silanion_Musei_Capitolini_MC1377.jpg) |
| Epicuro | Marie-Lan Nguyen | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Epicurus_Massimo_Inv197306.jpg) |
| Immanuel Kant | Johann Gottlieb Becker | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Immanuel_Kant_-_Gemaelde_2.jpg) |
| Arthur Schopenhauer | Johann Schäfer | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Arthur_Schopenhauer_by_J_Schäfer,_1859b.jpg) |
| Friedrich Nietzsche | Friedrich Hermann Hartmann | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Nietzsche187a.jpg) |
| Søren Kierkegaard | Biblioteca Reale di Danimarca | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Søren_Kierkegaard_%281813-1855%29_-_%28cropped%29.jpg) |
| Albert Camus | United Press International | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Albert_Camus,_gagnant_de_prix_Nobel,_portrait_en_buste,_posé_au_bureau,_faisant_face_à_gauche,_cigarette_de_tabagisme.jpg) |
| Viktor E. Frankl | Prof. Dr. Franz Vesely | CC BY-SA 3.0 DE | [link](https://commons.wikimedia.org/wiki/File:Viktor_Frankl2.jpg) |
| Carl Gustav Jung | ETH-Bibliothek Zürich | Public Domain Mark | [link](https://commons.wikimedia.org/wiki/File:ETH-BIB-Jung,_Carl_Gustav_%281875-1961%29-Portrait-Portr_14163_%28cropped%29.tif) |
| Sigmund Freud | Max Halberstadt | Pubblico dominio | [link](https://commons.wikimedia.org/wiki/File:Sigmund_Freud,_by_Max_Halberstadt_%28cropped%29.jpg) |
| Daniel Kahneman | nrkbeta | CC BY-SA 2.0 | [link](https://commons.wikimedia.org/wiki/File:Daniel_Kahneman_%283283955327%29_%28cropped%29.jpg) |
| Erich Fromm | Müller-May | CC BY-SA 3.0 DE | [link](https://commons.wikimedia.org/wiki/File:Erich_Fromm_1974_%28cropped%292.jpg) |
