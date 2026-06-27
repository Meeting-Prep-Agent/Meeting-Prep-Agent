# Meeting Prep Agent with Behavioral Intelligence

A sophisticated, production-ready AI assistant that transforms meeting preparation through persistent memory, behavioral analysis, and intelligent commitment tracking.

## 🚀 Key Features

- **Claude-Inspired UI**: A warm, minimalist, and professional workspace designed for deep focus.
- **Hindsight Memory**: Every meeting builds a persistent knowledge base that informs future interactions.
- **Behavioral Intelligence**: DISC profiling, decision pattern analysis, and strategic "hot-button" tracking.
- **Tactical Prep Briefs**: Automated synthesis of historical interactions into actionable strategy reports.
- **Commitment Tracking**: proactive monitoring of promises made by all parties.

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.11), SQLAlchemy, PostgreSQL + pgvector
- **Frontend**: React (TypeScript), Tailwind CSS, Framer Motion
- **Intelligence**: Groq (Llama 3.3 & Qwen), Hindsight SDK

## ⚙️ Quick Start



### 2. Run with Docker
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### 3. Initialize Database
```bash
docker-compose exec backend python backend/init_db.py
docker-compose exec backend python backend/seeds/seed_data.py
```

## 🏗️ Architecture

The system follows a modular service-oriented architecture:
- **`GroqService`**: Handles all LLM extraction and synthesis operations.
- **`HindsightService`**: Manages the episodic and semantic memory bridge.
- **`CommitmentExtractor`**: Parses and validates execution items.
- **`PrepBriefGenerator`**: Orchestrates the strategic synthesis flow.

## 📄 License
MIT
