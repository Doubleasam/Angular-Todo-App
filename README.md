# Minimalist System Todo

A production-grade, high-utility Todo application built with **Angular 21** and **Tailwind CSS v4**. Designed around a high-contrast black-and-white system aesthetic with full CRUD, filtering, drag-and-drop reordering, a mock REST API, Docker support, and Vercel/Netlify deployment.

🔗 **Live Demo:** [https://angular-todo-app-bice.vercel.app/](https://angular-todo-app-bice.vercel.app/)
📦 **Repository:** [https://github.com/Doubleasam/Angular-Todo-App](https://github.com/Doubleasam/Angular-Todo-App)

---

## Features

| Feature | Status |
|---|---|
| Add new todos | ✅ |
| Mark todos as complete | ✅ |
| Delete todos | ✅ |
| Filter by All / Active / Completed | ✅ |
| Clear all completed todos | ✅ |
| Drag & drop reordering | ✅ |
| Mock REST API (json-server) | ✅ |
| Optimistic UI updates | ✅ |
| Zoneless change detection | ✅ |
| Docker (multi-stage build) | ✅ |
| Vercel / Netlify deployment | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone Components) |
| Styling | Tailwind CSS v4 (PostCSS-first) |
| State Management | Angular Signals (Local Signal Store) |
| Icons | Lucide Angular |
| Drag & Drop | Angular CDK |
| Mock API | json-server |
| Server-Side Rendering | Angular SSR (`@angular/ssr`) |
| Web Server (Docker) | Nginx (Alpine) |
| Package Manager | npm |

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── todo.model.ts        # Todo interface, TodoFilter type, TodoState
│   │   ├── repositories/
│   │   │   └── todo.repository.ts   # HTTP layer — all API calls live here
│   │   └── state/
│   │       └── todo.store.ts        # Signal-based store — single source of truth
│   ├── features/
│   │   └── todo/
│   │       ├── components/
│   │       │   ├── todo-input.component.ts   # New task input field
│   │       │   ├── todo-item.component.ts    # Individual todo row with drag handle
│   │       │   └── todo-filter.component.ts  # All / Active / Done filter tabs
│   │       └── todo.container.ts             # Smart container, wires store to UI
│   ├── app.component.ts
│   ├── app.config.ts                # Root providers (zoneless, HTTP, animations)
│   ├── app.config.server.ts         # SSR-specific providers
│   └── app.routes.server.ts         # Server-side route config
├── main.ts                          # Browser bootstrap
├── main.server.ts                   # SSR bootstrap
├── server.ts                        # Express SSR server
└── styles.css                       # Tailwind v4 theme tokens
db.json                              # json-server mock database
Dockerfile                           # Multi-stage production build
nginx.conf                           # Nginx SPA routing config
vercel.json                          # Vercel SPA routing config
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Mock API

The app reads and writes todos from a local `json-server` instance. Run this in a **separate terminal**:

```bash
npm run mock
```

The API will be available at `http://localhost:3000/todos`.

### 3. Start the Dev Server

```bash
npm start
```

Open `http://localhost:4200` in your browser.

---

## API Integration

The mock backend is powered by [json-server](https://github.com/typicode/json-server) using `db.json` as the data source.

### Base URL

```
http://localhost:3000
```

### Endpoints Used

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/todos?_sort=order` | Fetch all todos sorted by order |
| `POST` | `/todos` | Create a new todo |
| `PATCH` | `/todos/:id` | Update a todo (toggle complete, reorder) |
| `DELETE` | `/todos/:id` | Delete a todo |

### Data Shape

```json
{
  "id": "uuid-string",
  "title": "Task title",
  "completed": false,
  "order": 0
}
```

### Architecture

API concerns are fully isolated in `TodoRepository` (`src/app/core/repositories/todo.repository.ts`). The `TodoStore` consumes the repository and manages all state via Angular Signals. Components are purely presentational — they emit events and read computed signals, never touching HTTP directly.

To swap the backend, only `TodoRepository` needs to change.

---

## Docker

### Build the Image

```bash
docker build -t angular-todo .
```

### Run the Container

```bash
docker run -p 8080:80 angular-todo
```

Open `http://localhost:8080`.

### How It Works

The Dockerfile uses a **two-stage build**:

1. **Stage 1 — Build:** Uses `node:20-alpine` to install dependencies and run `ng build --configuration production`. The compiled static assets are output to `dist/angular-todo/browser/`.
2. **Stage 2 — Serve:** Copies only the compiled assets into an `nginx:alpine` image. Nginx serves the SPA and handles client-side routing via `try_files $uri $uri/ /index.html`.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist/angular-todo/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects the Angular build. No extra configuration needed.
4. The included `vercel.json` ensures all routes fall back to `index.html` for SPA routing.

```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| Dev server | `npm start` | Starts Angular dev server on port 4200 |
| Mock API | `npm run mock` | Starts json-server on port 3000 |
| Production build | `npm run build` | Builds the app for production |
| Watch build | `npm run watch` | Incremental dev build |
| SSR server | `npm run serve:ssr:angular-todo` | Runs the SSR Express server |

---

## Design System

The UI uses a strict black-and-white system palette defined as Tailwind v4 CSS theme tokens in `styles.css`:

| Token | Value | Usage |
|---|---|---|
| `system-black` | `#000000` | Borders, text, active states |
| `system-white` | `#ffffff` | Backgrounds |
| `system-grey-100` | `#f4f4f5` | Hover backgrounds |
| `system-grey-200` | `#e4e4e7` | Subtle dividers |
| `system-grey-400` | `#a1a1aa` | Placeholder, inactive icons |
| `system-grey-500` | `#71717a` | Secondary text |
| `system-grey-900` | `#18181b` | Near-black accents |
