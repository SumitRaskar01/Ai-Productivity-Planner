# Timezy — How to Present This Project to Your Professor

This document gives you the talking points, structure, and language to explain Timezy clearly and professionally — whether in a viva, demo, or written report.

---

## 1. The One-Sentence Summary (Lead with this)

> "Timezy is a full-stack AI productivity planner where users describe their day in plain English and the system uses Google Gemini to generate a structured, time-blocked, priority-sorted schedule — which can then be edited, refined by AI, exported as a PDF, and analyzed over time."

Memorize this. It answers "what is this?" in under 20 seconds.

---

## 2. The Problem You Are Solving

Most people struggle with time management not because they lack discipline, but because planning is cognitively expensive — deciding what to do first, how long things take, and what to skip when time runs short.

Existing tools (Google Calendar, Notion, Todoist) require the user to already know how to structure their day. Timezy removes that friction: the user dumps a raw, unstructured description of their tasks, and the AI does the scheduling work.

**Tell the professor:** "The core insight is that natural language is easier to produce than a structured calendar. We let the AI handle the conversion."

---

## 3. The System Architecture (Explain this clearly)

Timezy has three layers:

```
Browser (React SPA)
        ↕  HTTP / JSON
Express REST API (Node.js)
        ↕  Mongoose
MongoDB Atlas (cloud database)
        ↕  Gemini API (Google)
```

- The **frontend** (React + Vite) is a single-page application — no full-page reloads. All navigation happens client-side via React Router.
- The **backend** (Express 5) is a stateless REST API. Every endpoint that touches user data is protected by JWT middleware.
- The **database** (MongoDB) stores users, plans, and settings. Schemas are defined with Mongoose.
- The **AI** (Gemini 2.5 Flash) is invoked server-side — the API key never touches the browser. Gemini is called for three features: plan generation, plan regeneration, and coaching insights.

**Why this architecture?** The professor may ask. Say: "Separating the API from the frontend makes it easy to swap the AI model or add a mobile client later without changing the UI. Keeping AI calls server-side protects the API key and lets us validate/sanitize Gemini's output before sending it to the user."

---

## 4. Core Features — What to Demonstrate

Walk through these in this order during a demo:

### Step 1 — Register / Login
- Show the split-screen auth page.
- Register a new account. Point out the JWT is stored in localStorage.
- Say: "Authentication uses bcrypt for password hashing and JSON Web Tokens for session management. The token is attached to every subsequent request via an Axios request interceptor."

### Step 2 — Generate a Plan
- Type something realistic: *"I need to finish my OS assignment by 3pm, have a 2-hour lecture at 10, gym at 6, cook dinner at 7. Also need to review notes for tomorrow's quiz."*
- Hit Generate. Point to the loading skeleton.
- When the plan appears: "Gemini parsed free-form text into a JSON array of tasks with start time, end time, and priority. The server validates every field before returning it — regex for HH:MM time format, enum check for priority."

### Step 3 — Save and Edit
- Click Save Plan. Explain it's stored in MongoDB under the user's ID.
- Click Edit on the Timeline. Drag a task to reorder it. Change a task name inline.
- Say: "Edit mode uses the HTML5 Drag and Drop API — no external library. The PATCH endpoint validates ownership before accepting changes — a user cannot edit another user's plan."

### Step 4 — Refine with AI
- Click "Refine Plan" and type: *"Move gym to morning, add a lunch break."*
- Show the regenerated plan.
- Say: "The regeneration prompt includes the original user intent, a summary of the current plan, and the modification request. This gives Gemini context so the new plan is coherent, not random."

### Step 5 — Export PDF
- Click Export PDF. Show the downloaded file.
- Say: "The PDF is streamed from the server using pdfkit — `doc.pipe(res)` — so it doesn't buffer the entire file in memory. The frontend downloads it as a Blob."

### Step 6 — AI Coach
- Scroll down to the AI Coach card below the timeline.
- Say: "This sends the task list to Gemini and asks for 2–4 short insights about the plan — things like overloading mornings or not scheduling breaks. The prompt is strict: return only a JSON array, max 15 words per insight."

### Step 7 — Dark Mode
- Go to Settings. Toggle Dark Mode.
- Say: "The preference is persisted to the database via a UserSettings document (upserted, not created on read to avoid empty documents). On the frontend, the setting is cached in localStorage so the theme applies instantly on next load — no flash of the wrong theme."

### Step 8 — Analytics / Calendar
- Show the Analytics page — bar chart, priority breakdown.
- Show Calendar — green dots on days with plans, click to see details.
- Say: "These features use the same plan history endpoint. The analytics aggregation happens server-side to avoid sending all plan data to the client."

---

## 5. Technical Decisions to Justify

Professors often ask "why did you choose X?" Have answers ready.

| Decision | Justification |
|----------|---------------|
| **React + Vite** | Vite's dev server has near-instant HMR. React's component model made it easy to separate concerns (Timeline, HistoryPanel, AiCoach are independent). |
| **Express 5 + MongoDB** | Express 5 is the current stable release with native async/await support. MongoDB's document model fits the plan schema well — `generatedPlan` is a nested array with no fixed length. |
| **JWT over sessions** | Stateless — the server doesn't need to store session state. Scales horizontally without a shared session store. |
| **Gemini 2.5 Flash** | Fast and cost-efficient for structured output tasks. We use strict prompting (return ONLY valid JSON) and server-side validation to handle the cases where it doesn't comply. |
| **pdfkit over a library** | pdfkit gives direct control over layout and supports streaming. No third-party SaaS dependency. |
| **Web Audio API for sound** | No audio files to serve or load. The oscillator tones are generated programmatically in the browser. Completely offline-capable. |
| **Tailwind CSS v4 + custom tz- classes** | Utility classes for rapid layout, custom classes for reusable components (cards, buttons, badges) to keep JSX clean. |
| **HTML5 Drag & Drop for reorder** | No dependency needed. Sufficient for a vertical list reorder. |
| **upsert for UserSettings** | Avoids a separate "create if not exists" step. `findOneAndUpdate` with `{ upsert: true }` is atomic and idempotent. |

---

## 6. Data Models — Explain These Clearly

### User
```
name      String  (required)
email     String  (required, unique)
password  String  (bcrypt hash, never returned to client)
```

### Plan
```
userId         ObjectId  (ref: User — enforces data isolation)
originalInput  String    (the raw text the user typed)
generatedPlan  Array of:
  task         String
  start        String  (HH:MM, 24h)
  end          String  (HH:MM, 24h)
  priority     String  (enum: high | medium | low)
lastEditedAt   Date    (set on PATCH, null otherwise)
```

### UserSettings
```
userId       ObjectId  (ref: User, unique — one settings doc per user)
darkMode     Boolean   (default: false)
soundEnabled Boolean   (default: true)
```

**Key point to mention:** "Every plan query includes `userId` in the filter — `findOne({ _id, userId: req.user._id })`. This means users can only read and modify their own data. Even if someone guesses a plan's MongoDB ObjectId, they cannot access it without a matching JWT."

---

## 7. Security Points

- Passwords are hashed with bcrypt (salt rounds = 10) before storage. Plain passwords are never stored.
- JWTs are signed with a secret key. The server verifies the signature on every protected request.
- Gemini API key lives only on the server. It is never sent to the browser.
- All AI response parsing happens on the server — the client receives clean, validated data.
- Plan ownership is verified on every mutation (update, delete, export).
- CORS is configured to accept requests from the frontend origin only in production.

---

## 8. What You Would Add Next (Shows foresight)

Say something like: "Given more time, I would prioritize:"

1. **Rate limiting on the AI endpoints** — one Gemini call per second per user to prevent API quota exhaustion.
2. **Real streak calculation** — compute consecutive days with at least one saved plan, not just a count proxy.
3. **Focus session persistence** — save Pomodoro session counts to MongoDB so the streak carries across page reloads.
4. **Mobile-responsive layout** — a bottom navigation bar to replace the sidebar on small screens.
5. **Plan deletion from the UI** — the backend DELETE endpoint exists; the HistoryPanel just needs a delete button.

This shows the professor you understand the gap between an MVP and a production system.

---

## 9. What Makes This Different from a Typical CRUD App

A plain CRUD app stores and retrieves data. Timezy does three things beyond that:

1. **AI integration as a core feature** — the primary interaction is not filling a form but describing intent in natural language. The AI interprets that intent into structured data.
2. **Multi-step AI pipeline** — generate → edit → refine → coach is a feedback loop. The AI's output becomes the input for the next AI call (refinement and coaching both receive the current plan).
3. **Server-side AI output validation** — Gemini does not always return valid JSON. The backend has a `parseGeminiJSON()` helper that strips markdown fencing and validates the parsed structure before returning it to the client. This is real-world AI integration, not just an API call.

---

## 10. One-Paragraph Summary for a Report Introduction

> Timezy is a web-based AI productivity planner built with React, Node.js, Express, and MongoDB. It uses Google Gemini 2.5 Flash to convert free-form natural language descriptions of a user's day into structured, time-blocked, priority-sorted schedules. Beyond generation, the system supports plan editing with inline inputs and drag-and-drop reordering, AI-driven plan refinement based on user modification requests, PDF export via server-side streaming, AI coaching insights, a Pomodoro focus timer with sound alerts, usage analytics, a calendar view of plan history, and persisted user preferences including dark mode. The backend exposes a 13-endpoint REST API protected by JWT authentication, and all AI calls are handled server-side to protect credentials and validate model output before it reaches the client.
