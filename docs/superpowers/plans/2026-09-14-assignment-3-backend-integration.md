# Assignment 3 Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Node.js/Express backend at `/server` that serves the portfolio's project data and stores contact-form submissions, then update the existing Assignment 2 React frontend (`assignment-2/`) to consume it via `fetch` in `useEffect`, without touching any of the frontend's already-working nav/routing/theme behaviour.

**Architecture:** A standalone Express app in `/server` (own `package.json`, CommonJS, `dotenv` + `cors`) exposes `GET /`, `GET/POST /api/projects*`, `GET/POST /api/contact`, a JSON 404 handler, and a JSON error-handling middleware. Project data lives in a server-side JS module; contact submissions persist to a JSON file on disk (no DB, per the assignment's constraints). The frontend gets a tiny `src/config.js` for the API base URL, and `Projects.jsx`, `ProjectDetail.jsx`, `ContactForm.jsx` are rewritten to fetch from that API with explicit loading/error state instead of reading local data.

**Tech Stack:** Express 4, `cors`, `dotenv`, Node's built-in `crypto.randomUUID()` and `fs` (no DB/ORM). Frontend: existing Vite + React 19 + react-router-dom 7, plain `fetch` (no axios, no React Query/SWR per constraints).

**Spec:** `Backend_Extension_Assignment3.pdf` (CS1303 Assignment 3), captured in full in memory at `assignment-3-backend-integration.md`. This plan implements tasks B1–B7 (backend) and F1–F4 (frontend).

## Global Constraints

- Backend lives in `/server` at the repository root (sibling to `assignment-1/`, `assignment-2/`), per "a `/server` folder inside the same repository as your Assignment 2 frontend."
- Server port comes from a `PORT` variable in `/server/.env` — never hardcoded.
- Server starts with one documented command from within `/server` (`npm start` or `npm run dev`).
- `GET /api/projects` objects must keep exactly the fields `ProjectCard`/`ProjectDetail` already use: `id, title, image, alt, duration, link, tech, description, details` — **no field is renamed or dropped**. (The spec's example list `id, title, description, techStack, image, link` is generic boilerplate; the assignment's own overriding rule — "retain the same fields your ProjectCard component already expects... no field renamed or dropped" — controls, so `tech` stays `tech`, not `techStack`, and `alt`/`duration`/`details` are kept too.)
- No ORM/DB mandatory; storage choice must be stated in the README. This plan: projects in a server-side JS array, contact submissions in a JSON file (`server/data/contacts.json`).
- `GET /api/contact` has no auth — README must clearly call this out as an open endpoint.
- Frontend must use plain `fetch`/`axios` only — no React Query/SWR.
- All prior Assignment 2 functionality (theme toggle, routing, 404 page, responsive layout) must keep working unmodified throughout.
- `.env` is never committed; `.env.example` lists every required variable with no secrets.
- App must run with two documented commands total: `npm run dev` in `assignment-2/`, and `npm run dev` (or `npm start`) in `server/`.
- Commit messages follow this repo's existing convention: `type(scope): short description`, lowercase, no trailing period, no AI attribution trailer.

---

## File Structure

```
server/                              (new — repo root, sibling to assignment-2/)
  package.json                       deps: express, cors, dotenv
  .env                                gitignored, real local values
  .env.example                        committed, documents PORT / CORS_ORIGIN / CONTACTS_FILE
  .gitignore                          node_modules, .env
  server.js                           entrypoint: loads dotenv, starts the app on PORT
  README.md                           quick-start pointer back to assignment-2/README.md
  src/
    app.js                            builds the Express app: middleware + routes + error handlers
    data/
      projects.js                     the 3 project objects, server-side source of truth
      contacts.json                   seeded `[]`, JSON-file "database" for B4/B5
    routes/
      projects.js                     GET /api/projects, GET /api/projects/:id
      contact.js                      POST /api/contact, GET /api/contact
    utils/
      validateContact.js              shared { name, email, message } validator
      contactsStore.js                read/write/append helpers for contacts.json
    middleware/
      errorHandler.js                 notFoundHandler + errorHandler (B6)

assignment-2/                        (existing frontend, modified)
  .env.example                        new — documents VITE_API_URL
  .gitignore                          modified — add .env
  public/
    projects/                         new — moved SVGs, served as static files
      project-jurisnet.svg
      project-fraud.svg
      project-sms.svg
  src/
    config.js                         new — API_BASE_URL constant
    data/projects.js                  deleted once nothing imports it (end of Task 6)
    assets/project-*.svg              deleted (moved to public/projects/, Task 5)
    pages/Projects.jsx                modified — fetch + loading/error state (F1, F2)
    pages/ProjectDetail.jsx           modified — fetch by id + not-found state (F3)
    components/ContactForm.jsx        modified — POST to backend + server-error display (F4)
  README.md                           modified — backend setup, endpoint docs, storage choice

docs/api-tests.md                    new — curl commands covering B1-B7 incl. failure cases
```

---

### Task 1: Express server scaffold, env config, CORS, and health check (B1, B7 setup)

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`
- Create: `server/.env`
- Create: `server/.gitignore`
- Create: `server/src/app.js`
- Create: `server/server.js`

**Interfaces:**
- Produces: `server/src/app.js` exports `createApp()` — a function returning a configured Express app instance (no routes yet beyond `GET /`). Later tasks `require('./app')` — actually `require('../app')` from routes is not needed; routes are mounted *inside* `app.js`, so later tasks edit `app.js` to `app.use('/api/projects', ...)` etc.
- Produces: env vars read at runtime — `PORT` (number, default 5000), `CORS_ORIGIN` (string, default `http://localhost:5173`).

- [ ] **Step 1: Create the server folder and initialize its package.json**

Run from the repo root (`E:\SEM 5\FS`):

```bash
mkdir -p server/src/data server/src/routes server/src/utils server/src/middleware
```

Create `server/package.json`:

```json
{
  "name": "portfolio-server",
  "version": "1.0.0",
  "private": true,
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd server && npm install
```

Expected: `node_modules/` created, no errors, `package-lock.json` written.

- [ ] **Step 3: Add server .gitignore, .env.example, and .env**

Create `server/.gitignore`:

```
node_modules
.env
```

Create `server/.env.example`:

```
# Port the Express server listens on
PORT=5000

# Origin allowed to make cross-origin requests (the Vite dev server)
CORS_ORIGIN=http://localhost:5173

# Path (relative to /server) where contact submissions are persisted
CONTACTS_FILE=data/contacts.json
```

Create `server/.env` with the same real values (this file is gitignored):

```
PORT=5000
CORS_ORIGIN=http://localhost:5173
CONTACTS_FILE=data/contacts.json
```

- [ ] **Step 4: Write the Express app factory**

Create `server/src/app.js`:

```js
const express = require('express');
const cors = require('cors');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
```

Create `server/src/middleware/errorHandler.js` (minimal version for now — Task 3 fills in the malformed-JSON case, but the file must exist for `app.js` to load):

```js
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { notFoundHandler, errorHandler };
```

- [ ] **Step 5: Write the entrypoint**

Create `server/server.js`:

```js
require('dotenv').config();
const createApp = require('./src/app');

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
```

- [ ] **Step 6: Run the server and verify the health check**

```bash
cd server && npm run dev
```

In a second terminal:

```bash
curl -i http://localhost:5000/
```

Expected: `HTTP/1.1 200 OK` with body `{"status":"ok"}`.

Also verify the 404 fallback already works:

```bash
curl -i http://localhost:5000/nope
```

Expected: `HTTP/1.1 404 Not Found` with a JSON body (not HTML) containing `"error"`.

Stop the server (Ctrl+C) once both checks pass.

- [ ] **Step 7: Commit**

```bash
cd "E:\SEM 5\FS"
git add server/package.json server/package-lock.json server/.gitignore server/.env.example server/src/app.js server/src/middleware/errorHandler.js server/server.js
git commit -m "feat(server): scaffold express app with health check and env config"
```

(`server/.env` is gitignored and intentionally not added.)

---

### Task 2: Project data and `GET /api/projects`, `GET /api/projects/:id` (B2, B3)

**Files:**
- Create: `server/src/data/projects.js`
- Create: `server/src/routes/projects.js`
- Modify: `server/src/app.js`

**Interfaces:**
- Consumes: none new.
- Produces: `server/src/data/projects.js` exports `{ projects }`, an array of objects shaped `{ id, title, image, alt, duration, link, tech, description, details }`. `server/src/routes/projects.js` exports an Express `Router` mounted at `/api/projects`, handling `GET /` and `GET /:id`. Later tasks (Task 5) rely on the response shape matching `ProjectCard`'s existing props exactly.

- [ ] **Step 1: Create the server-side project data**

Create `server/src/data/projects.js` (values copied verbatim from `assignment-2/src/data/projects.js`; `image` is now a public-path string instead of a bundler import — the actual SVG files move to `assignment-2/public/projects/` in Task 5, once the frontend starts reading this field):

```js
const projects = [
  {
    id: 'jurisnet',
    title: 'JurisNet - Citation-Faithful Hybrid RAG for Indian Civil Law',
    image: '/projects/project-jurisnet.svg',
    alt: 'Document linked to a network graph',
    duration: 'May 2026 - Jun 2026',
    link: 'https://github.com/AkshayyVishnu/JurisNet',
    tech: ['Python', 'Qdrant', 'Neo4j', 'SQLite FTS5', 'Voyage AI', 'Gemini', 'Groq'],
    description:
      'A four-source, intent-routed hybrid retriever for Indian civil law that answers with zero fabricated citations.',
    details: [
      'Engineered a 4-source, intent-routed hybrid retriever (dense, statute-label, BM25, citation graph) with query-adaptive weighted RRF. Ablation improved Recall@10 from 64% to 86%, Recall@20 from 67% to 96%, and MRR by 23% over dense-only RAG.',
      'Designed a legal-aware, 6-granularity chunking pipeline that preserves statutory provisions as atomic units and binding rules with their facts, retaining cross-document legal structure.',
      'Built an LLM-free set-membership citation verifier, guaranteeing 0 fabricated citations across a 50-question evaluation benchmark.',
    ],
  },
  {
    id: 'fraud-detection',
    title: 'Credit Card Fraud Detection',
    image: '/projects/project-fraud.svg',
    alt: 'Credit card',
    duration: 'Oct 2025 - Dec 2025',
    link: 'https://github.com/AkshayyVishnu/fraud-detection-microservice',
    tech: ['XGBoost', 'Optuna', 'Stratified K-Fold', 'PR-AUC'],
    description:
      'An end-to-end gradient boosting pipeline for a heavily imbalanced transaction dataset, tuned and calibrated.',
    details: [
      'Developed an end-to-end fraud detection pipeline on a highly imbalanced dataset using XGBoost, achieving 74.3% PR-AUC, outperforming a logistic regression baseline on both precision (80% to 85.3%) and recall (55% to 77.3%).',
      'Optimized hyperparameters with Optuna and GPU acceleration, reducing tuning time by 60% compared to grid search.',
      'Applied 5-fold Stratified K-Fold cross-validation (no shuffling) and isotonic calibration to improve probability estimates.',
    ],
  },
  {
    id: 'sms-fraud-detection',
    title: 'On-Device SMS Fraud & Phishing Detection',
    image: '/projects/project-sms.svg',
    alt: 'Phone showing a message behind a shield',
    duration: 'Ongoing',
    link: 'https://github.com/0xMukesh/artemis',
    tech: ['MobileBERT', 'CNN-BiLSTM', 'Bloom Filter', 'On-Device Inference'],
    description:
      'Fully offline, privacy-preserving SMS threat classification running on the handset itself.',
    details: [
      'Researched on-device machine learning for SMS fraud and phishing detection using fine-tuned MobileBERT and a compact CNN-BiLSTM, enabling fully offline, privacy-preserving inference.',
      'Developed a hybrid detection pipeline combining neural models with weighted rule-based heuristics and a Bloom filter domain blocklist to classify messages across multiple fraud categories.',
    ],
  },
];

module.exports = { projects };
```

- [ ] **Step 2: Write the projects router**

Create `server/src/routes/projects.js`:

```js
const express = require('express');
const { projects } = require('../data/projects');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json(projects);
});

router.get('/:id', (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.status(200).json(project);
});

module.exports = router;
```

- [ ] **Step 3: Mount the router in the app**

Edit `server/src/app.js` — add the import and mount it before the 404 handler:

```js
const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/projects', projectsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
```

- [ ] **Step 4: Run and verify with curl**

```bash
cd server && npm run dev
```

```bash
curl -i http://localhost:5000/api/projects
```

Expected: `200`, JSON array of 3 objects, each with `id, title, image, alt, duration, link, tech, description, details`.

```bash
curl -i http://localhost:5000/api/projects/jurisnet
```

Expected: `200`, the JurisNet object.

```bash
curl -i http://localhost:5000/api/projects/does-not-exist
```

Expected: `404`, body `{"error":"Project not found"}`.

Stop the server once all three pass.

- [ ] **Step 5: Commit**

```bash
cd "E:\SEM 5\FS"
git add server/src/data/projects.js server/src/routes/projects.js server/src/app.js
git commit -m "feat(server): add GET /api/projects and GET /api/projects/:id"
```

---

### Task 3: Centralized 404 and error handling (B6)

**Files:**
- Modify: `server/src/middleware/errorHandler.js`

**Interfaces:**
- Produces (unchanged signature from Task 1, behavior extended): `notFoundHandler(req, res)`, `errorHandler(err, req, res, next)`.

- [ ] **Step 1: Extend the error handler to cover malformed JSON bodies**

`express.json()` throws a `SyntaxError` (with `err.type === 'entity.parse.failed'`) when the request body isn't valid JSON. Without handling it, Express's default handler would return an HTML stack trace. Replace `server/src/middleware/errorHandler.js`:

```js
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }

  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  res.status(status).json({ error: 'Internal server error.' });
}

module.exports = { notFoundHandler, errorHandler };
```

- [ ] **Step 2: Run and verify with curl**

```bash
cd server && npm run dev
```

Undefined route:

```bash
curl -i http://localhost:5000/api/doesnotexist
```

Expected: `404`, JSON body with `"error"`.

Malformed request body (deliberately broken JSON):

```bash
curl -i -X POST http://localhost:5000/api/projects -H "Content-Type: application/json" -d "{not valid json"
```

Expected: since `POST /api/projects` isn't a defined route, `express.json()` still parses the body before routing, so this returns `400` with `{"error":"Malformed JSON in request body."}` — not a 500, not an HTML page.

Confirm the server is still alive after that:

```bash
curl -i http://localhost:5000/
```

Expected: `200`, `{"status":"ok"}` — proving the malformed request didn't crash the process.

Stop the server once all three pass.

- [ ] **Step 3: Commit**

```bash
cd "E:\SEM 5\FS"
git add server/src/middleware/errorHandler.js
git commit -m "feat(server): return JSON for 404s and malformed request bodies"
```

---

### Task 4: Contact endpoints — `POST /api/contact`, `GET /api/contact` (B4, B5)

**Files:**
- Create: `server/src/utils/validateContact.js`
- Create: `server/src/utils/contactsStore.js`
- Create: `server/data/contacts.json`
- Create: `server/src/routes/contact.js`
- Modify: `server/src/app.js`

**Interfaces:**
- Produces: `validateContact({ name, email, message })` → `errors` object, keyed by field name, only for invalid/missing fields (empty object = valid).
- Produces: `contactsStore.readContacts()` → array of stored submissions. `contactsStore.addContact({ name, email, message })` → the newly created submission `{ id, name, email, message, submittedAt }`, and persists it.
- Produces: `POST /api/contact` → `400 { errors }` on validation failure, `201 { message, submission }` on success. `GET /api/contact` → `200`, array of submissions.

- [ ] **Step 1: Write the validator**

Create `server/src/utils/validateContact.js`:

```js
function validateContact({ name, email, message }) {
  const errors = {};

  if (!name || !name.trim()) errors.name = 'Name is required.';
  if (!email || !email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!message || !message.trim()) errors.message = 'Message is required.';

  return errors;
}

module.exports = validateContact;
```

- [ ] **Step 2: Write the JSON-file storage helper**

Create `server/data/contacts.json`:

```json
[]
```

Create `server/src/utils/contactsStore.js`:

```js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SERVER_ROOT = path.join(__dirname, '..', '..');
const CONTACTS_FILE = path.resolve(SERVER_ROOT, process.env.CONTACTS_FILE || 'data/contacts.json');

function readContacts() {
  if (!fs.existsSync(CONTACTS_FILE)) return [];
  const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

function writeContacts(contacts) {
  fs.mkdirSync(path.dirname(CONTACTS_FILE), { recursive: true });
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
}

function addContact({ name, email, message }) {
  const contacts = readContacts();
  const submission = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    submittedAt: new Date().toISOString(),
  };
  contacts.push(submission);
  writeContacts(contacts);
  return submission;
}

module.exports = { readContacts, writeContacts, addContact, CONTACTS_FILE };
```

- [ ] **Step 3: Write the contact router**

Create `server/src/routes/contact.js`:

```js
const express = require('express');
const validateContact = require('../utils/validateContact');
const { readContacts, addContact } = require('../utils/contactsStore');

const router = express.Router();

router.post('/', (req, res) => {
  const { name = '', email = '', message = '' } = req.body || {};
  const errors = validateContact({ name, email, message });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const submission = addContact({ name, email, message });
  res.status(201).json({
    message: 'Thanks - your message has been recorded.',
    submission,
  });
});

router.get('/', (req, res) => {
  res.status(200).json(readContacts());
});

module.exports = router;
```

- [ ] **Step 4: Mount the router**

Edit `server/src/app.js`:

```js
const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');
const contactRouter = require('./routes/contact');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/projects', projectsRouter);
  app.use('/api/contact', contactRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
```

- [ ] **Step 5: Run and verify with curl**

```bash
cd server && npm run dev
```

Missing everything:

```bash
curl -i -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" -d "{}"
```

Expected: `400`, `{"errors":{"name":"Name is required.","email":"Email is required.","message":"Message is required."}}`.

Invalid email:

```bash
curl -i -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Akshay\",\"email\":\"not-an-email\",\"message\":\"hi\"}"
```

Expected: `400`, `{"errors":{"email":"Enter a valid email address."}}`.

Valid submission:

```bash
curl -i -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Akshay\",\"email\":\"akshayrkr22@gmail.com\",\"message\":\"Testing the contact endpoint.\"}"
```

Expected: `201`, body has `message` and `submission` (with a generated `id` and `submittedAt`).

Verify persistence:

```bash
curl -i http://localhost:5000/api/contact
```

Expected: `200`, array containing the submission just created. Also open `server/data/contacts.json` and confirm the same entry is written to disk.

Stop the server once all four pass.

- [ ] **Step 6: Commit**

```bash
cd "E:\SEM 5\FS"
git add server/src/utils/validateContact.js server/src/utils/contactsStore.js server/src/routes/contact.js server/src/app.js server/data/contacts.json
git commit -m "feat(server): add POST and GET /api/contact with validation and json-file storage"
```

---

### Task 5: Frontend config + Projects page fetch with loading/error state (F1, F2, B7 verification)

**Files:**
- Create: `assignment-2/src/config.js`
- Create: `assignment-2/.env.example`
- Modify: `assignment-2/.gitignore`
- Move: `assignment-2/src/assets/project-jurisnet.svg` → `assignment-2/public/projects/project-jurisnet.svg`
- Move: `assignment-2/src/assets/project-fraud.svg` → `assignment-2/public/projects/project-fraud.svg`
- Move: `assignment-2/src/assets/project-sms.svg` → `assignment-2/public/projects/project-sms.svg`
- Modify: `assignment-2/src/pages/Projects.jsx`

**Interfaces:**
- Consumes: `GET {API_BASE_URL}/api/projects` from Task 2 — response is a JSON array shaped exactly like `server/src/data/projects.js`'s entries.
- Produces: `assignment-2/src/config.js` exports `API_BASE_URL` (string) — every later frontend task (6, 7) imports this instead of hardcoding a URL.

- [ ] **Step 1: Move the project SVGs to `public/` so they're servable by plain URL**

```bash
cd "E:\SEM 5\FS\assignment-2"
mkdir -p public/projects
git mv src/assets/project-jurisnet.svg public/projects/project-jurisnet.svg
git mv src/assets/project-fraud.svg public/projects/project-fraud.svg
git mv src/assets/project-sms.svg public/projects/project-sms.svg
```

- [ ] **Step 2: Add the frontend API config**

Create `assignment-2/src/config.js`:

```js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Create `assignment-2/.env.example`:

```
# Base URL of the backend Express API (see /server)
VITE_API_URL=http://localhost:5000
```

Edit `assignment-2/.gitignore` — add a line (keep everything already there):

```
.env
```

- [ ] **Step 3: Rewrite the Projects page to fetch with loading/error state**

Replace `assignment-2/src/pages/Projects.jsx`:

```jsx
import { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { API_BASE_URL } from '../config';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load projects. Is the backend server running?');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section id="projects">
        <h1>Projects</h1>
        <p>Loading projects…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects">
        <h1>Projects</h1>
        <p className="error" role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section id="projects">
      <h1>Projects</h1>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
}

export default Projects;
```

- [ ] **Step 4: Run both servers and verify manually in the browser**

Terminal 1:

```bash
cd server && npm run dev
```

Terminal 2:

```bash
cd assignment-2 && npm run dev
```

Open the printed Vite URL (default `http://localhost:5173`) in a browser:
1. Navigate to `/projects`. Expected: all 3 project cards render, each with its icon image visible (proves the moved SVGs resolve from `public/projects/`).
2. Open the browser devtools console. Expected: no CORS error, no red console errors.
3. Stop the backend server (Ctrl+C in Terminal 1) and reload `/projects`. Expected: the page shows the error message text, not a blank page and not just a console error.
4. Restart the backend (`npm run dev` in `server/`) and reload `/projects` again, with no frontend code change. Expected: the cards render again normally.
5. Spot-check that unrelated Assignment 2 behavior still works: toggle the theme switch, navigate Home/About/Contact, hit an unknown URL for the 404 page.

- [ ] **Step 5: Commit**

```bash
cd "E:\SEM 5\FS"
git add assignment-2/public/projects assignment-2/src/config.js assignment-2/.env.example assignment-2/.gitignore assignment-2/src/pages/Projects.jsx
git commit -m "feat(a2): fetch projects from the backend with loading and error states"
```

---

### Task 6: Project detail page fetch by id (F3)

**Files:**
- Modify: `assignment-2/src/pages/ProjectDetail.jsx`
- Delete: `assignment-2/src/data/projects.js`

**Interfaces:**
- Consumes: `GET {API_BASE_URL}/api/projects/:id` from Task 2 — `200` with the project object, or `404` with `{ "error": "Project not found" }`.

- [ ] **Step 1: Rewrite the detail page to fetch by id**

Replace `assignment-2/src/pages/ProjectDetail.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TechStack from '../components/TechStack';
import { API_BASE_URL } from '../config';

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProject() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
          signal: controller.signal,
        });
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const data = await response.json();
        setProject(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load this project. Is the backend server running?');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProject();
    return () => controller.abort();
  }, [projectId]);

  if (loading) {
    return (
      <section id="project-detail">
        <p>Loading project…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="project-detail">
        <p className="error" role="alert">{error}</p>
      </section>
    );
  }

  if (notFound || !project) {
    return (
      <section id="project-detail">
        <h1>Project not found</h1>
        <p>No project matches "{projectId}".</p>
        <p><Link className="btn" to="/projects">Back to all projects</Link></p>
      </section>
    );
  }

  return (
    <section id="project-detail">
      <h1>{project.title}</h1>
      <img className="card-icon" src={project.image} width="64" height="64" alt={project.alt} />

      <TechStack items={project.tech} />
      <p><strong>Duration:</strong> {project.duration}</p>

      {project.details.map((point) => <p key={point}>{point}</p>)}

      <p className="card-links">
        <a href={project.link}>View on GitHub</a>
        <Link to="/projects">Back to all projects</Link>
      </p>
    </section>
  );
}

export default ProjectDetail;
```

- [ ] **Step 2: Delete the now-unused static data file**

Nothing imports `assignment-2/src/data/projects.js` any more (Task 5 removed the import in `Projects.jsx`, this step removes it from `ProjectDetail.jsx`) — delete it:

```bash
cd "E:\SEM 5\FS\assignment-2"
git rm src/data/projects.js
```

- [ ] **Step 3: Run both servers and verify manually in the browser**

```bash
cd server && npm run dev
```

```bash
cd assignment-2 && npm run dev
```

1. From `/projects`, click "Full page" on any card. Expected: the detail page renders with the same title/tech/duration/details/links as before.
2. Copy that detail URL (e.g. `http://localhost:5173/projects/jurisnet`), open it directly in a new tab (a true deep link, not client-side nav) and refresh. Expected: it loads correctly via the API, not a blank page.
3. Visit `http://localhost:5173/projects/does-not-exist`. Expected: the "Project not found" message renders, with a working "Back to all projects" link — no crash, no blank page.

- [ ] **Step 4: Commit**

```bash
cd "E:\SEM 5\FS"
git add assignment-2/src/pages/ProjectDetail.jsx assignment-2/src/data/projects.js
git commit -m "feat(a2): fetch a single project by id for the detail page"
```

---

### Task 7: Contact form submits to the backend (F4)

**Files:**
- Modify: `assignment-2/src/components/ContactForm.jsx`

**Interfaces:**
- Consumes: `POST {API_BASE_URL}/api/contact` from Task 4 — `201 { message, submission }` on success, `400 { errors: { field: message } }` on validation failure.

- [ ] **Step 1: Rewrite the form to submit to the backend**

Replace `assignment-2/src/components/ContactForm.jsx`:

```jsx
import { useState } from 'react';
import { API_BASE_URL } from '../config';

const EMPTY = { name: '', email: '', message: '' };

function validate({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!message.trim()) errors.message = 'Message is required.';
  return errors;
}

function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setSent(false);
    setServerErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setServerErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setServerErrors(data.errors || {});
        setSubmitError('Please fix the highlighted fields and try again.');
        return;
      }

      setForm(EMPTY);
      setSent(true);
    } catch (err) {
      setSubmitError('Could not reach the server. Is the backend running?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <p>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
        {serverErrors.name && <span className="error">{serverErrors.name}</span>}
      </p>

      <p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          aria-invalid={Boolean(form.email && errors.email)}
          aria-describedby={form.email && errors.email ? 'email-error' : undefined}
        />
        {form.email && errors.email && (
          <span className="error" id="email-error">{errors.email}</span>
        )}
        {serverErrors.email && <span className="error">{serverErrors.email}</span>}
      </p>

      <p>
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="4" value={form.message} onChange={handleChange} />
        {serverErrors.message && <span className="error">{serverErrors.message}</span>}
      </p>

      <p>
        <button type="submit" className="btn" disabled={!isValid || submitting}>
          {submitting ? 'Sending…' : 'Send'}
        </button>
        {!isValid && <span className="form-hint">Fill in every field to enable Send.</span>}
        {submitError && <span className="error" role="alert">{submitError}</span>}
        {sent && <span className="sent" role="status">Thanks — your message has been recorded.</span>}
      </p>
    </form>
  );
}

export default ContactForm;
```

- [ ] **Step 2: Verify the happy path in the browser**

```bash
cd server && npm run dev
```

```bash
cd assignment-2 && npm run dev
```

On `/contact`, fill in a valid name/email/message and click Send. Expected: the "Thanks — your message has been recorded." message appears and the fields clear. Confirm it landed server-side:

```bash
curl -s http://localhost:5000/api/contact
```

Expected: the new submission is in the array.

- [ ] **Step 3: Verify server-side rejection is surfaced (bypassing client validation)**

In the browser devtools, select the Send `<button>` element and remove its `disabled` attribute (or run in the console: `document.querySelector('.contact-form button[type="submit"]').disabled = false`), then submit the form with the email field left invalid (e.g. `bad-email`) or a field blank. Expected: the submit still goes through to the backend, the backend returns `400`, and the UI shows the server's error text (e.g. "Enter a valid email address.") — not a silent failure and not a false success message.

- [ ] **Step 4: Commit**

```bash
cd "E:\SEM 5\FS"
git add assignment-2/src/components/ContactForm.jsx
git commit -m "feat(a2): submit the contact form to the backend and surface server errors"
```

---

### Task 8: curl deliverable covering B1–B7 (with failure cases)

**Files:**
- Create: `docs/api-tests.md`

**Interfaces:** none — this is a documentation deliverable, consolidating the curl commands already verified in Tasks 1–4.

- [ ] **Step 1: Write the consolidated curl reference**

Create `docs/api-tests.md`:

```markdown
# API test commands (B1–B7)

Run `npm run dev` inside `/server` first (default `http://localhost:5000`). Each
block shows the command and the expected result. Windows users: run these from
Git Bash (the `curl` used throughout this repo's dev workflow).

## B1 — GET / (health check)

    curl -i http://localhost:5000/

Expected: `200`, `{"status":"ok"}`.

## B2 — GET /api/projects

    curl -i http://localhost:5000/api/projects

Expected: `200`, JSON array of 3 projects, each with
`id, title, image, alt, duration, link, tech, description, details`.

## B3 — GET /api/projects/:id

Success:

    curl -i http://localhost:5000/api/projects/jurisnet

Expected: `200`, the JurisNet project object.

Failure case (unknown id):

    curl -i http://localhost:5000/api/projects/does-not-exist

Expected: `404`, `{"error":"Project not found"}`.

## B4 — POST /api/contact

Failure case (missing everything):

    curl -i -X POST http://localhost:5000/api/contact \
      -H "Content-Type: application/json" \
      -d "{}"

Expected: `400`,
`{"errors":{"name":"Name is required.","email":"Email is required.","message":"Message is required."}}`.

Failure case (invalid email format):

    curl -i -X POST http://localhost:5000/api/contact \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"Akshay\",\"email\":\"not-an-email\",\"message\":\"hi\"}"

Expected: `400`, `{"errors":{"email":"Enter a valid email address."}}`.

Success case:

    curl -i -X POST http://localhost:5000/api/contact \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"Akshay\",\"email\":\"akshayrkr22@gmail.com\",\"message\":\"Hello from curl.\"}"

Expected: `201`, `{"message": "...", "submission": { "id": "...", "name": "Akshay", ... }}`.

## B5 — GET /api/contact

    curl -i http://localhost:5000/api/contact

Expected: `200`, JSON array including every submission created above (and any
sent from the live frontend form). **Note: this endpoint has no
authentication — anyone who can reach the API can list all submissions.**

## B6 — 404s and malformed-body errors are always JSON

Undefined route:

    curl -i http://localhost:5000/api/doesnotexist

Expected: `404`, JSON body with `"error"` (not an HTML page).

Malformed JSON body:

    curl -i -X POST http://localhost:5000/api/contact \
      -H "Content-Type: application/json" \
      -d "{not valid json"

Expected: `400`, `{"error":"Malformed JSON in request body."}`. Follow with
`curl -i http://localhost:5000/` to confirm the server is still running.

## B7 — CORS

Not curl-testable directly (curl ignores CORS). Verified in the browser: with
the Vite dev server running on `http://localhost:5173` and the backend on
`http://localhost:5000`, the Projects page and Contact form both succeed with
no CORS errors in the devtools console (see Task 5 and Task 7 of the
implementation plan).
```

- [ ] **Step 2: Run every command in the file against a live server and confirm each matches its "Expected" line**

```bash
cd server && npm run dev
```

Work through `docs/api-tests.md` top to bottom in a second terminal, comparing actual output to each "Expected" line. Fix the doc (not the server) if wording drifted from what Tasks 1–4 actually implemented.

- [ ] **Step 3: Commit**

```bash
cd "E:\SEM 5\FS"
git add docs/api-tests.md
git commit -m "docs(server): add curl reference covering B1-B7 including failure cases"
```

---

### Task 9: README updates (backend setup, endpoints, storage choice, open-endpoint note)

**Files:**
- Modify: `assignment-2/README.md`
- Create: `server/README.md`

**Interfaces:** none — documentation only.

- [ ] **Step 1: Add a backend section to the main README**

Edit `assignment-2/README.md` — append this section right before the final `## Folder structure` section (keep everything else in the file as-is):

```markdown
## Backend (Assignment 3)

The projects list and contact form are now served by a small Express API in
`/server` at the repository root (sibling to `assignment-1/` and
`assignment-2/`).

### Setup and run

```bash
cd server
npm install
cp .env.example .env   # then edit if you need different values
npm run dev             # or: npm start
```

The API listens on `http://localhost:5000` by default (`PORT` in `.env`).
With the frontend's own `npm run dev` running separately (`http://localhost:5173`
by default), the app needs **two terminals**: one in `/server`, one in
`assignment-2/`. Optionally copy `assignment-2/.env.example` to
`assignment-2/.env` to point the frontend at a different API URL via
`VITE_API_URL`.

### Storage choice

No database is used. Project data lives in a server-side JS array
(`server/src/data/projects.js`). Contact submissions persist to a JSON file
(`server/data/contacts.json`), read and rewritten on every submission.

### Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/` | Health check — `{ "status": "ok" }` | none |
| GET | `/api/projects` | List all projects | none |
| GET | `/api/projects/:id` | One project, or `404` if the id doesn't exist | none |
| POST | `/api/contact` | Submit `{ name, email, message }`; `400` with field errors if invalid, `201` with the stored submission if valid | none |
| GET | `/api/contact` | List all stored contact submissions | **none — open endpoint, no authentication. Anyone who can reach the API can read every submission.** |

Sample requests/responses and failure cases for every endpoint are in
[`docs/api-tests.md`](../docs/api-tests.md).
```

- [ ] **Step 2: Add a short pointer README inside /server**

Create `server/README.md`:

```markdown
# Portfolio API (Assignment 3 backend)

Express API for the portfolio site's project data and contact form.

```bash
npm install
cp .env.example .env
npm run dev   # or: npm start
```

Listens on `http://localhost:5000` by default. Full setup instructions,
endpoint list, storage choice, and curl examples are documented in the main
[`assignment-2/README.md`](../assignment-2/README.md#backend-assignment-3)
and [`docs/api-tests.md`](../docs/api-tests.md).
```

- [ ] **Step 3: Commit**

```bash
cd "E:\SEM 5\FS"
git add assignment-2/README.md server/README.md
git commit -m "docs(a2): document backend setup, endpoints, and storage choice"
```

---

### Task 10: Full regression pass and screen-recording checklist

This task has no code changes — it's the final manual verification that everything from Tasks 1–9 works together, plus the recording deliverable the assignment asks for. **The screen recording itself must be captured by you** (no tool can do this step); the checklist below is exactly what to click through while recording.

**Files:** none.

- [ ] **Step 1: Fresh-start regression check**

Stop any running servers. Start clean:

```bash
cd server && npm run dev
```

```bash
cd assignment-2 && npm run dev
```

Click through every page and confirm nothing from Assignment 2 broke:
- Theme toggle switches and persists across a reload.
- `/`, `/home`, `/about`, `/projects`, `/contact` all render.
- Responsive layout still collapses the nav at narrow widths.
- An unknown URL (e.g. `/nope`) shows the 404 page.
- `/projects` loads all 3 cards from the live API with working "View details" and "Full page" links.
- A project detail deep link (paste the URL, refresh) loads correctly; an invalid id shows "Project not found".
- The contact form submits successfully and resets.

- [ ] **Step 2: Record the 2–3 minute screen recording**

With both servers running, record (any screen recorder — Windows Game Bar `Win+G`, OBS, etc.) showing in order:
1. The Projects page loading data from the live backend (show the Network tab hitting `/api/projects`, or just the cards rendering).
2. A deep link to a project detail page (type/paste the URL directly, refresh the page, show it loads via the API).
3. The contact form being submitted successfully (show the success message).
4. Stop the backend server in the terminal, reload the Projects page, and show the frontend's error state.

Save the recording and note its filename/location for the assignment submission (not committed to the repo unless you choose to).

- [ ] **Step 3: Final commit if the regression pass turned up any fixes**

If Step 1 surfaced any issue, fix it in the relevant file from Tasks 1–7, re-verify, then:

```bash
cd "E:\SEM 5\FS"
git add -A
git commit -m "fix(a2): address regression found during final verification pass"
```

If nothing needed fixing, skip this step — there is nothing to commit.

---

## Spec Coverage Check

- B1 ✅ Task 1. B2 ✅ Task 2. B3 ✅ Task 2. B4 ✅ Task 4. B5 ✅ Task 4. B6 ✅ Task 3. B7 ✅ Task 1 (CORS/env) + verified in Task 5.
- F1 ✅ Task 5. F2 ✅ Task 5. F3 ✅ Task 6. F4 ✅ Task 7.
- Deliverables: updated repo (all tasks), README with setup/endpoints/`.env.example` (Task 9 + Task 1), curl commands covering B1–B7 with failure cases (Task 8), screen recording (Task 10).
- Constraints: `/server` at repo root (Task 1), plain `fetch` only (Tasks 5–7), no ORM/DB with storage choice documented (Tasks 4, 9), prior functionality unmodified (verified throughout + Task 10), two documented run commands (Task 9's README section).
