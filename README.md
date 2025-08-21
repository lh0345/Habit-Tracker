# Habit Tracker AI

**A smart, modular, client-side habit tracker built with React, TypeScript, and Next.js, featuring AI-powered habit predictions and analytics.**

---

## 🚀 Features

### Habit Management

* Add, edit, and delete habits with categories (Health, Productivity, Personal, etc.)
* Schedule habits with preferred times (Morning, Afternoon, Evening)
* Toggle active/inactive status
* Quick one-click daily logging with optional mood tracking (1-5 scale)

### AI/ML Prediction System

* Hybrid Logistic Regression + Decision Tree model for predicting habit completion
* Top 3 habit recommendations with confidence scores
* Adaptive learning: models retrain automatically with new logs
* Fallback heuristic system for new users (<10 logs)

### Performance Analytics

* Visual dashboards: weekly/monthly performance, streak calendars
* Success rates, current and longest streaks
* Color-coded progress and performance charts

### Data Management

* Local storage persistence with optional encryption
* Import/export JSON backup system
* Data validation with Zod schemas
* Automatic recovery from corrupted data

### User Experience

* Fully responsive design: mobile, tablet, desktop
* Light/Dark theme support
* Guided onboarding for first-time users
* Graceful error handling and loading states

---

## 🧠 Technical Implementation

### Architecture & Stack

* Next.js 15 (App Router)
* React 18 + TypeScript
* Tailwind CSS 4
* shadcn/ui + Radix UI components
* Lucide React icons
* Modular component design with custom hooks
* Memoization (`React.memo`, `useMemo`, `useCallback`) for performance

### ML/AI Logic

* Feature engineering: day-of-week, time-of-day, mood, streaks, success rate
* Hybrid prediction: Logistic Regression (70%) + Decision Tree (30%)
* Confidence levels: High / Medium / Low
* Continuous retraining as users log habits

### State Management

* `useHabitData` hook: CRUD operations, data persistence
* `usePredictions` hook: ML model training & predictions
* Validation & error handling centralized

---

## 📦 Installation

```bash
git clone https://github.com/<your-username>/habit-tracker-ai.git
cd habit-tracker-ai
npm install
npm run dev
```

> Runs the app locally on [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Usage

1. Add up to 3 core habits (keep it simple for MVP)
2. Log habits daily with optional mood
3. View predictions and performance dashboard
4. Export/import your data as JSON for backup

---

## 📝 Testing

* Unit tests for ML models and data persistence
* Integration tests for core hooks
* Error handling & recovery tests
* Run tests:

```bash
npm run test
```

---

## ⚠️ Limitations

* Single-user, local browser storage only
* No push notifications (yet)
* No social features or community interactions
* Minimal offline support

---

## 📈 Future Improvements

* Smart notifications & habit suggestions
* Gamification: achievements, streak rewards, micro-celebrations
* Cloud sync for multi-device support
* Customizable habit templates
* Advanced analytics and insights

---

## 📄 License

MIT License – feel free to fork, modify, and experiment.

---

## 💡 Notes

This project is **both a portfolio showcase and a fully functional MVP**. The AI prediction system is primarily educational but functional for small-scale personal use. Optimized for modern browsers, privacy-first with local data storage, and fully modular for easy expansion.
