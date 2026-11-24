# BhashaBuddy – VoiceBridge Jam

Bilingual (English / Telugu / Hindi / Tamil) technical-English learning app: Node.js + Express + SQLite backend, vanilla-JS frontend.

## Run
```
npm install
npm start        # http://localhost:3000   (Node 22.13+ required for built-in SQLite)
```
The frontend in `public/` also works on plain static hosting (GitHub Pages): without the server it falls back to localStorage, so it keeps working offline / on weak connections.

## Architecture
| Layer | Files | Role |
|---|---|---|
| Database | `server/db.js` | SQLite tables UserProfiles, VocabularyUnits, Vocabulary, ProgressLogs, PronunciationScores, Recordings (seeded from `public/data.js`) |
| API | `server/server.js` | REST: `/api/vocabulary`, `/api/users`, `/api/progress`, `/api/scores`, `/api/match` (transcript matching), `/api/recordings` (peer challenge). Input validation + rate limiting |
| Client services | `public/api.js`, `progress.js`, `speech.js`, `quiz.js`, `storage.js` | Sync with server, daily goal/streak, Web Speech TTS/STT, Levenshtein scoring, seeded daily quiz, weak-word revision |
| UI | `index.html`, `style.css`, `vocab.js`, `extras.js`, `app.js`, `i18n.js` | Flashcards, quiz, picture dictionary, chat, peer challenge, 4-language UI, CSP-safe event delegation |

## Security / robustness

CSP without inline scripts, HTML escaping, parameterised SQL, size/length limits, rate limiting, mic/permission/no-speech handling, safe JSON storage.
