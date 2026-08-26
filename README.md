# SmartDude — AI Companion for Smarter Work & Life
> A context-aware AI companion that helps users organize, schedule, execute, and automate their work.

## 🌐 Live Demo

🚀 **Try SmartDude:**  
https://ais-dev-mrqjpdewa7wcgkuq4vlb2l-708934551401.asia-southeast1.run.app

> **Development / Demo Deployment**

SmartDude is an AI-powered productivity workspace designed to adapt to the user's personal and workspace context. SmartDude is a context-aware AI companion and productivity workspace designed to help people organize tasks, projects, routines, notifications, and personal/work contexts in one place.
The application combines an adaptive task-management experience with AI-assisted routines and real-time cloud synchronization, with support for different personal profiles and workspace contexts.

## ✨ Key Features

- **AI-powered adaptive routines** — Generate context-aware routine tasks based on the user's selected profile.
- **Personal & workspace contexts** — Switch between personal profiles and workspace environments.
- **Task management** — Create, update, complete, prioritize, tag, and organize tasks.
- **Projects** — Create and manage projects associated with a workspace.
- **Real-time synchronization** — Tasks, projects, and notifications can synchronize through Firebase/Firestore.
- **Notifications** — Track unread notifications and mark individual or all notifications as read.
- **Analytics** — View productivity and workspace-related insights.
- **Calendar view** — Organize work around dates and scheduled tasks.
- **Command palette** — Quickly access actions with `Ctrl + K` / `⌘ + K`.
- **Keyboard shortcuts** — Use `Ctrl + N` / `⌘ + N` to create a new task.
- **Dark / light mode** — Switch between visual themes.
- **Responsive interface** — Desktop sidebar and mobile-friendly navigation.
- **Local fallback** — Core functionality can fall back to local application state when cloud persistence is unavailable.

## 🧠 Concept

SmartDude is designed around the idea that productivity software should adapt to the user's context instead of treating every user and every task identically.

The application separates two dimensions of context:

### Personal Context

Defines the user's current profile/persona and influences adaptive routines and task metadata.

### Workspace Context

Defines the environment in which work is being organized, such as a personal workspace or team-oriented environment.

Together, these contexts allow SmartDude to provide more relevant task organization and AI-assisted routines.

## 🏗️ Architecture

```text
SmartDude
│
├── React UI
│   ├── Sidebar
│   ├── Top Bar
│   ├── Bottom Navigation
│   ├── Command Palette
│   ├── Task & Project Modals
│   └── Application Views
│
├── Application Services
│   ├── Task Service
│   ├── Project Service
│   ├── Notification Service
│   └── Context Engine Service
│
├── Authentication
│   └── Auth Context
│
└── Firebase / Firestore
    ├── Tasks
    ├── Projects
    └── Notifications
