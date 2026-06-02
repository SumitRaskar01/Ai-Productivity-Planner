# Timezy — Codebase Reference

## What It Is

Timezy is an AI-powered daily productivity planner. The user describes their day in plain English ("wake up at 7, gym, study DBMS from 10 to 12, OS assignment due tomorrow…") and the app uses Google Gemini 2.5 Flash to parse that into a structured, time-blocked, priority-sorted schedule. Schedules can be saved, edited, refined by AI, exported to PDF, and reviewed in a calendar. The app also includes a Pomodoro focus timer, usage analytics, AI coaching insights, dark mode, and sound alerts.

Full-stack SPA: React frontend served by Vite, Node.js/Express REST API, MongoDB for persistence.

---

## Architecture

```
Ai Productivity Planner/
├── client/          React SPA (Vite + Tailwind CSS v4)
├── server/          Node.js REST API (Express 5 + MongoDB)
├── codebase.md      This file
└── design.md        Timezy design system spec
```

### Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 19, React Router v7, Tailwind v4  |
| Build tool  | Vite 8                                  |
| Backend     | Node.js, Express 5                      |
| Database    | MongoDB via Mongoose                    |
| AI model    | Google Gemini 2.5 Flash                 |
| Auth        | JWT (7-day expiry), bcryptjs            |
| HTTP client | Axios (JWT interceptor + 401 auto-logout)|
| PDF export  | pdfkit (server-side streaming)          |

---

## What Is Built

### Authentication (complete)

- **Register** — `POST /api/auth/register` — name, email, password (min 6 chars). Hashes with bcrypt, returns JWT.
- **Login** — `POST /api/auth/login` — validates credentials, returns JWT + user object.
- Token stored in `localStorage`. Axios interceptor attaches it to every request. Auto-logout on 401.
- `PrivateRoute` component redirects unauthenticated users to `/login`.
- UI: split-screen auth pages (green brand panel left, form right).

### Plan Generation (complete)

- User types a free-form description of their day.
- `POST /api/plan/generate` sends text to Gemini 2.5 Flash with a strict structured prompt.
- Gemini returns a JSON array of tasks: `{ task, start, end, priority }` in HH:MM 24h format.
- Response is stripped of markdown fencing, parsed, and validated server-side before sending to client.
- Result renders immediately in the Timeline component.

### Plan Storage & History (complete)

- `POST /api/plan/save` — saves `{ originalInput, generatedPlan[] }` to MongoDB, scoped to the user.
- `GET /api/plan/history` — returns all saved plans for the user, newest first.
- History shown in the right sidebar on Dashboard. Clicking any entry loads it into the Timeline and restores the `savedPlanId` for editing/exporting.

### Plan Editing — Inline + Drag & Drop (complete)

- `PATCH /api/plan/:id` — validates ownership (`findOne({ _id, userId })`), validates every task (HH:MM regex, priority enum), sets `lastEditedAt`.
- Frontend Timeline has an Edit mode toggle:
  - Inline inputs for task name, start time, end time, priority (select).
  - Drag-and-drop reorder using HTML5 Drag and Drop API (no external library).
  - "Save" calls the PATCH API if a `savedPlanId` exists; updates local state either way.
  - "Cancel" discards changes.
- `Plan.model` has a `lastEditedAt: Date` field.

### Plan Regeneration — AI Refinement (complete)

- `POST /api/plan/regenerate` — accepts `{ originalInput, currentPlan, modificationPrompt }`. Builds a prompt combining the original intent, current schedule summary, and the user's modification request. Calls Gemini, returns a new plan array (not auto-saved).
- Frontend: "Refine Plan" button opens a collapsible textarea. User describes what to change. On submit, the plan is replaced and save/export state resets.

### Export to PDF (complete)

- `GET /api/plan/export/:id` — streams a pdfkit-generated PDF directly to the response (`doc.pipe(res)`).
- PDF includes: Timezy brand header, plan date, original input as subtitle, task rows with colored priority indicators, footer.
- `Content-Disposition: attachment; filename=...` triggers browser download.
- Frontend: "Export PDF" button (visible only after plan is saved). Downloads blob via temporary anchor element.

### AI Coach Insights (complete)

- `POST /api/ai/coach` — accepts `generatedPlan[]`. Sends tasks to Gemini with a strict prompt: return ONLY a JSON array of strings, max 4 items, each under 15 words.
- Response is filtered (`typeof === 'string'`) and capped at 4 items.
- Frontend `AiCoach.jsx` component:
  - Auto-fetches insights whenever a new plan is set.
  - Shows skeleton loader while fetching.
  - Renders 2–4 bullet points with emoji icons.
  - Retry button on error, manual refresh button.

### Dark Mode (complete, persisted)

- `UserSettings` model: `{ userId (unique ref), darkMode (bool), soundEnabled (bool) }` with upsert.
- `GET /api/settings` — returns user settings or defaults (no DB write on read).
- `PATCH /api/settings` — `findOneAndUpdate` with `upsert: true`.
- Frontend `useSettings.js` hook:
  - Reads cached settings from `localStorage` on mount → applies theme immediately (no flash of unstyled content).
  - Fetches from API asynchronously, syncs localStorage.
  - `updateSetting(key, value)` is optimistic: updates state + localStorage + calls API. Rolls back on failure.
- Dark mode applied via `document.body.dataset.theme = 'dark'` and CSS `body[data-theme="dark"]` variable overrides.
- Settings page: Dark Mode toggle is live-wired — toggling it immediately changes the theme.

### Notification Sound (complete)

- `useSound.js` hook uses the Web Audio API (no audio files needed).
- Creates an `AudioContext`, oscillator, and gain node per-play call.
- Two sounds: `focus_end` (880Hz sine, 0.6s) on Pomodoro session complete, `task_start` (523Hz triangle, 0.3s) on break end.
- Respects `settings.soundEnabled` — silent if disabled.
- Focus page wires `useSound` and calls `play()` when the timer hits zero.

### Dashboard (complete)

Route: `/dashboard`

- Greeting (Good morning/afternoon/evening) + first name.
- 4 stat cards: Plans Today, Tasks Scheduled, Planning Streak, Plans Saved.
- AI insight banner.
- Plan input → generate → Timeline flow.
- Action buttons after generation: Save Plan, Refine Plan (collapsible), Export PDF (visible when saved).
- `AiCoach` component renders below Timeline.
- Right panel: Saved Plans history list.

### Focus Mode (complete)

Route: `/focus`

- Pomodoro timer: Focus (25m), Short Break (5m), Long Break (15m).
- SVG ring progress indicator.
- Play/Pause, Reset controls. Session counter.
- Sound plays on session/break completion via `useSound`.
- Rotating productivity tips (8s interval).
- Session summary: sessions done, total focus time, breaks taken.

### Analytics (complete)

Route: `/analytics` — `GET /api/analytics/summary`

- Backend aggregates: `totalPlans`, `totalTasks`, `avgTasksPerPlan`, `priorityBreakdown`, `dailyActivity` (last 7 days), `recentPlans`.
- Frontend: 4 stat blocks, bar chart (pure CSS), priority breakdown with animated progress bars, recent plans list.

### Calendar (complete)

Route: `/calendar`

- Monthly calendar grid generated in JS. Navigate months with prev/next.
- Days with saved plans show a green dot.
- Today highlighted. Click day → right panel shows plans for that date.
- Uses existing `GET /api/plan/history` (no new route).

### Settings (complete, API-connected)

Route: `/settings`

- Profile section: name + email from JWT (read-only).
- Preferences: Sound Alerts and Dark Mode toggles — both live-wired to `useSettings` hook → persist to backend.
- About: version, model, framework.
- Sign Out: clears localStorage, redirects to `/login`.

### Sidebar Navigation (complete)

- Persistent left sidebar (232px) on all protected pages.
- NavLink with active-state highlighting.
- Logo, nav sections (Main / Insights / Account), user avatar, logout icon.

### Design System (complete)

- CSS custom properties (`--primary`, `--white`, `--bg-main`, etc.) in `index.css`.
- `tz-` prefixed component classes.
- Dark mode override block under `body[data-theme="dark"]`.
- Keyframe animations: slide-up, fade-in, spin, pulse-glow.
- Custom CSS for: `.tz-edit-input`, `.tz-drag-handle`, `.tz-coach-card`, `.tz-refine-panel`.

---

## File Map

### Frontend (`client/src/`)

```
App.jsx                         Router — 7 routes
index.css                       Design system + dark mode overrides
main.jsx                        React entry point

pages/
  Login.jsx                     Auth — login form
  Register.jsx                  Auth — register form
  Dashboard.jsx                 Main planner (generate, edit, refine, export, AI coach)
  Focus.jsx                     Pomodoro timer with sound
  Analytics.jsx                 Usage stats
  Calendar.jsx                  Monthly calendar with plan markers
  Settings.jsx                  Preferences (API-connected)

components/
  Navbar.jsx                    Left sidebar with NavLink
  PageLayout.jsx                Shared layout wrapper
  PlanInput.jsx                 Textarea + generate button
  Timeline.jsx                  Schedule renderer with edit + drag & drop
  HistoryPanel.jsx              Saved plans list (passes planId on select)
  AiCoach.jsx                   AI coaching insights panel
  Toast.jsx                     Success/error/info notifications
  PrivateRoute.jsx              Auth guard

hooks/
  useSettings.js                Fetches/persists settings, applies dark mode
  useSound.js                   Web Audio API oscillator tones

services/
  api.js                        Axios instance + all API call functions
```

### Backend (`server/`)

```
index.js                        Express app, CORS, route mounting

routes/
  authRoutes.js                 POST /register, POST /login
  planRoutes.js                 generate, save, history, update, delete, regenerate, export
  analyticsRoutes.js            GET /summary
  settingsRoutes.js             GET /, PATCH /
  aiRoutes.js                   POST /coach

controllers/
  authController.js             register(), login()
  planController.js             generatePlan, savePlan, getPlanHistory,
                                updatePlan, deletePlan, regeneratePlan, exportPlan
  analyticsController.js        getAnalyticsSummary()
  settingsController.js         getSettings(), updateSettings()
  aiController.js               getCoachInsights()

models/
  User.js                       { name, email, password, timestamps }
  Plan.js                       { userId, originalInput, generatedPlan[], lastEditedAt, timestamps }
  UserSettings.js               { userId (unique), darkMode, soundEnabled, timestamps }

middleware/
  authMiddleware.js             protect() — JWT verification

config/
  db.js                         Mongoose connection
```

### Full API Surface

| Method | Endpoint                  | Auth | Description                                    |
|--------|---------------------------|------|------------------------------------------------|
| POST   | /api/auth/register        | No   | Create account, return JWT                     |
| POST   | /api/auth/login           | No   | Verify credentials, return JWT                 |
| POST   | /api/plan/generate        | Yes  | Send text to Gemini, return task array         |
| POST   | /api/plan/save            | Yes  | Save plan to MongoDB                           |
| GET    | /api/plan/history         | Yes  | Fetch all user's saved plans                   |
| PATCH  | /api/plan/:id             | Yes  | Update tasks in a saved plan                   |
| DELETE | /api/plan/:id             | Yes  | Delete a saved plan                            |
| POST   | /api/plan/regenerate      | Yes  | AI re-optimize plan with modification prompt   |
| GET    | /api/plan/export/:id      | Yes  | Stream PDF of a saved plan                     |
| GET    | /api/analytics/summary    | Yes  | Aggregate stats from user's Plan documents     |
| GET    | /api/settings             | Yes  | Fetch user settings (or defaults)              |
| PATCH  | /api/settings             | Yes  | Update darkMode / soundEnabled                 |
| POST   | /api/ai/coach             | Yes  | Get 2–4 AI coaching insights for a plan        |

---

## What Is Not Built / Remaining

| Feature | Detail |
|---------|--------|
| **Focus session persistence** | Pomodoro counter resets on page refresh. Needs localStorage or a FocusSession model. |
| **Real streak calculation** | Currently `Math.min(history.length, 14)` — not actual consecutive days. Needs date-based logic. |
| **Auto-save toggle** | Preference UI removed; could re-add as a setting that calls savePlan automatically after generation. |
| **Plan deletion from UI** | Backend `DELETE /api/plan/:id` exists but no delete button in HistoryPanel yet. |
| **Search / filter in history** | No search in HistoryPanel. Grows unwieldy with many plans. |
| **User profile editing** | Name/email are read-only. No `PATCH /api/auth/profile` endpoint. |
| **Email verification** | Users can register with any email. No verification step. |
| **Password reset** | No forgot-password flow. |
| **Rate limiting** | No rate limiting on Gemini endpoints. Could exhaust API quota. |
| **Mobile layout** | Sidebar hidden on mobile but no bottom-nav replacement. No drawer for history on small screens. |
| **Timezone handling** | Task times are raw HH:MM strings with no timezone — incorrect for multi-timezone users. |
| **Error boundaries** | No React error boundary — a component crash takes down the whole app. |
| **Page titles** | All routes share the same `<title>`. Each page should set its own `document.title`. |

---

## Environment Variables

### Server (`server/.env`)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
PORT=5000
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Running Locally

```bash
# Terminal 1 — backend
cd server && npm install && node index.js

# Terminal 2 — frontend
cd client && npm install && npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
