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
