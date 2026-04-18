# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meeting Prep Agent with Behavioral Intelligence** — A professional AI assistant that transforms meeting preparation by leveraging persistent memory (Hindsight), behavioral analysis, and intelligent commitment tracking.

**Core Innovation**: Every meeting builds a knowledge base that informs future interactions. The agent understands behavioral nuances, tracks promises, and generates tactical preparation briefs in <10 seconds.

**Target**: Hackathon MVP with full backend + responsive frontend.

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL + pgvector (for semantic search)
- **Vector Store**: Pinecone or Weaviate (Hindsight integration)
- **LLM Services**: Groq API (qwen for extraction, gpt-oss for synthesis)
- **Memory Layer**: Hindsight SDK
- **Async**: asyncio + httpx
- **Testing**: pytest + pytest-asyncio

### Frontend
- **Framework**: React 18 + TypeScript
- **UI**: shadcn/ui (minimalist)
- **State**: TanStack Query + Zustand
- **Styling**: Tailwind CSS
- **Deployment**: Docker + docker-compose (local dev)

---

## Project Structure

```
├── backend/
│   ├── main.py                    # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── api/
│   │   │   ├── meetings.py        # POST upload, GET details, list
│   │   │   ├── contacts.py        # CRUD operations + behavioral profile
│   │   │   ├── commitments.py     # Status updates, filtering
│   │   │   └── prep_brief.py      # Brief generation + download
│   │   ├── services/
│   │   │   ├── groq_service.py    # LLM extraction & synthesis
│   │   │   ├── hindsight_service.py # Memory retain/recall/reflect
│   │   │   ├── commitment_extractor.py # Parse & deduplicate
│   │   │   ├── behavioral_analyzer.py  # DISC + patterns
│   │   │   └── prep_brief_generator.py # Brief synthesis
│   │   ├── models/
│   │   │   ├── contact.py
│   │   │   ├── meeting.py
│   │   │   ├── commitment.py
│   │   │   └── prep_brief.py
│   │   └── database.py            # PostgreSQL + pgvector setup
│   └── tests/
│       ├── test_commitment_extractor.py
│       ├── test_behavioral_analyzer.py
│       └── test_prep_brief_generation.py
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MeetingUpload.tsx
│   │   │   ├── PrepBrief.tsx
│   │   │   └── ContactProfile.tsx
│   │   ├── components/
│   │   │   ├── MeetingUploadForm.tsx
│   │   │   ├── CommitmentCard.tsx
│   │   │   ├── BehavioralProfileCard.tsx
│   │   │   ├── TalkingPointsList.tsx
│   │   │   └── RiskIndicator.tsx
│   │   └── hooks/
│   │       ├── useMeetings.ts
│   │       └── usePrepBrief.ts
│   └── public/
│
└── docker-compose.yml
```

---

## Backend Development

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running Locally
```bash
# Create .env from .env.example
cp .env.example .env

# Set your API keys:
# GROQ_API_KEY=your_key
# HINDSIGHT_API_KEY=your_key
# DATABASE_URL=postgresql://user:pass@localhost/meeting_prep

# Start postgres (if using docker-compose)
docker-compose up -d postgres

# Run migrations (once DB models finalized)
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Running Tests
```bash
# All tests
pytest

# Specific test file
pytest tests/test_commitment_extractor.py

# With coverage
pytest --cov=app tests/

# Single test
pytest tests/test_commitment_extractor.py::test_extract_high_confidence -v
```

### Database
- **Database**: PostgreSQL with pgvector extension (for embeddings)
- **Migrations**: Alembic (track schema changes)
- **Models**: SQLAlchemy ORM in `app/models/`
- **Queries**: Async with asyncpg or SQLAlchemy async session

**Key Tables**:
- `contacts` — Professional profile + behavioral metadata
- `meetings` — Transcripts + summaries + embeddings
- `commitments` — Promises with status lifecycle
- `prep_briefs` — Generated strategic briefs

### API Documentation
- **Swagger UI**: `GET http://localhost:8000/docs`
- **ReDoc**: `GET http://localhost:8000/redoc`

---

## Frontend Development

### Setup
```bash
cd frontend
npm install
```

### Running Locally
```bash
npm run dev
# Runs on http://localhost:5173 (Vite default)
```

### Building
```bash
npm run build
npm run preview   # Test production build locally
```

### Linting & Formatting
```bash
npm run lint
npm run type-check  # TypeScript compiler check
```

---

## Core Services Deep Dive

### 1. GroqService
**Responsibility**: Fast LLM inference for commitment extraction and synthesis

**Key Methods**:
- `extract_commitments(transcript: str) -> List[Commitment]`
  - Model: qwen (optimized for extraction)
  - Target: 90%+ precision
  - Returns: JSON array of promises with owner, due_date, priority
  
- `analyze_behavioral_signals(transcript: str, contact_history: List[Meeting]) -> dict`
  - Analyzes tone, communication style, decision patterns
  - Returns: communication_style (DISC), decision_blockers, hot_button_topics
  
- `generate_prep_brief(...) -> PrepBrief`
  - Model: gpt-oss (better for synthesis)
  - Returns: strategy, talking_points, red_flags

**Prompt Templates**: See SRD for detailed prompts (commitment extraction, behavioral analysis, brief generation)

### 2. HindsightService
**Responsibility**: Persistent, semantic memory for contacts

**Key Methods**:
- `retain(meeting: Meeting, contact_id: UUID) -> void`
  - Stores episodic memory after every meeting ingestion
  - Indexes by: contact_id, meeting_date, semantic embedding
  
- `recall(contact_id: UUID, query: str) -> List[MemoryItem]`
  - Retrieves relevant historical context for brief generation
  - Returns: ordered by relevance (last 5 meetings, open commitments, patterns)
  
- `reflect(contact_id: UUID) -> UpdatedBehavioralProfile`
  - Background process after new meeting
  - Detects behavior shifts, contradictions, pattern changes
  - Updates Contact.behavioral_profile incrementally

**Integration Points**: 
- Triggered after `POST /api/v1/meetings/upload`
- Used in `POST /api/v1/prep-brief/generate`
- Runs async background jobs via Celery (optional, for large histories)

### 3. CommitmentExtractor
**Responsibility**: Parse Groq output, validate, link to history

**Key Methods**:
- `parse_groq_commitments(groq_response: str) -> List[Commitment]`
  - Validates JSON schema
  - Assigns ownership (User vs. Contact)
  - Infers priority from urgency signals
  
- `detect_overdue(commitment: Commitment) -> boolean`
  - Returns: is_critical flag
  
- `link_to_historical_promises(commitment, contact_id) -> Optional[LinkedCommitment]`
  - Uses Hindsight to detect contradictions or superseding promises

### 4. BehavioralAnalyzer
**Responsibility**: Build evolving DISC + decision-pattern profiles

**Key Methods**:
- `extract_communication_style(transcript: str) -> CommunicationStyle`
  - Returns: primary + secondary DISC style + confidence score
  
- `identify_decision_patterns(contact_history: List[Meeting]) -> dict`
  - Example: "Requests data before committing", "Needs stakeholder consensus"
  - Updated incrementally after each meeting
  
- `track_hot_button_topics(contact_history: List[Meeting]) -> List[str]`
  - Topics that trigger emotional or resistance responses
  - Flagged in brief as "Approach Carefully"

### 5. PrepBriefGenerator
**Responsibility**: Orchestrate all services into tactical output

**Key Methods**:
- `generate_brief(contact_id: UUID, meeting_date: Date) -> PrepBrief`
  - Orchestrates: Hindsight.recall() → Groq.generate() → formatting
  - SLA: < 10 seconds
  
- `format_talking_points(strategy: str, behavioral_insights: dict) -> List[str]`
  - 5-7 tactical talking points tailored to contact
  - Includes: opening hooks, objection handlers, next-step framings
  
- `highlight_red_flags(contact_profile, open_commitments, recency) -> List[str]`
  - Surfaces: overdue commitments, contradicted promises, missed patterns
  - Visual indicators: ⚠️, 🚨, ❌

---

## Data Model Reference

### Contact
```python
id: UUID
name: str
title: str  # e.g., "Senior Director, Product"
company: str
email: str (optional)
phone: str (optional)
behavioral_profile: JSON
  - communication_style: Enum["Analytical", "Assertive", "Amiable", "Expressive"]
  - confidence_score: float (0-1)
  - decision_pattern: str
  - hot_button_topics: List[str]
  - preferred_communication: Enum["Email", "Call", "In-person"]
created_at: Timestamp
updated_at: Timestamp
interaction_count: int
```

### Meeting
```python
id: UUID
contact_id: UUID
date: Timestamp
transcript_raw: Text
summary: Text (AI-generated)
sentiment_score: float (-1.0 to 1.0)
key_topics: List[str]
tone_analysis: str
created_at: Timestamp
embedding: Vector (pgvector)
```

### Commitment
```python
id: UUID
meeting_id: UUID
owner: Enum["User", "Contact"]
owner_name: str
description: Text
status: Enum["Pending", "Completed", "Overdue", "Cancelled"]
due_date: Date (optional)
priority: Enum["High", "Medium", "Low"]
is_critical: bool
created_at: Timestamp
completed_at: Timestamp (nullable)
```

### PrepBrief
```python
id: UUID
contact_id: UUID
meeting_date: Date
last_meeting_summary: Text
open_commitments: List[Commitment]
behavioral_insights: JSON
  - communication_style: str
  - decision_blockers: List[str]
  - recent_objections: List[str]
  - success_factors: List[str]
recommended_strategy: Text
talking_points: List[str]
red_flags: List[str]
generated_at: Timestamp
```

---

## API Endpoints Overview

### Meetings
- `POST /api/v1/meetings/upload` — Upload transcript, auto-extract commitments
- `GET /api/v1/meetings/{meeting_id}` — Full meeting record
- `GET /api/v1/meetings?contact_id={id}&limit=10` — List meetings for contact

### Contacts
- `POST /api/v1/contacts` — Create contact
- `GET /api/v1/contacts/{contact_id}` — Retrieve with behavioral profile
- `GET /api/v1/contacts?search=john&company=acme` — Search/filter

### Prep Brief
- `POST /api/v1/prep-brief/generate` — Generate brief for upcoming meeting (SLA: <10s)
- `GET /api/v1/prep-brief/{brief_id}` — Retrieve brief
- `GET /api/v1/prep-brief/{brief_id}/pdf` — Download as PDF

### Commitments
- `GET /api/v1/commitments?status=overdue&contact_id={id}` — Filter
- `PATCH /api/v1/commitments/{commitment_id}` — Update status

---

## Testing Strategy

### Unit Tests
- **CommitmentExtractor**: Accuracy on sample transcripts (target: 90%+)
- **BehavioralAnalyzer**: DISC classification consistency
- **GroqService**: Mock responses, JSON parsing

### Integration Tests
- End-to-end: Upload → Extract → Store → Recall → Brief
- Hindsight: `retain()` & `recall()` correctness
- API contracts: Schema validation

### Performance Tests
- Prep brief: <10s P95 (Target: <5s P50)
- Hindsight recall: <2s for 100+ meetings
- Groq latency: <5s per call (with caching)

**Run All Tests**:
```bash
pytest --cov=app tests/ -v
```

---

## Performance & SLA Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Meeting upload & extraction | <5s | Fast path: extract → store |
| Hindsight recall (100+ meetings) | <2s | Cached embeddings |
| Prep brief generation | <10s | Groq call is longest pole |
| Groq extraction | <5s | qwen model |
| Groq synthesis | <5s | gpt-oss model |
| PDF generation | <2s | Async, post-response |

---

## Environment & Deployment

### Local Development (docker-compose)
```bash
docker-compose up -d
# Spins: postgres + pgvector, api, frontend

# Logs
docker-compose logs -f api
docker-compose logs -f frontend
```

### Environment Variables (.env)
```
GROQ_API_KEY=sk-...
HINDSIGHT_API_KEY=...
DATABASE_URL=postgresql://user:pass@localhost/meeting_prep
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

### Build & Test Before Merge
```bash
# Backend
cd backend && pytest && uvicorn app.main:app --host 0.0.0.0

# Frontend
cd frontend && npm run build
```

---

## Known Constraints & Fallbacks

1. **Transcript Quality**: Requires high-quality transcripts (Zoom/Teams). Garbled audio degrades accuracy.
2. **Hindsight Cold Start**: First 2-3 meetings won't have rich behavioral profile.
3. **Manual Ingestion**: This MVP requires manual upload; auto-calendar sync is future work.
4. **Groq Fallback**: If Groq API down, serve cached briefs; surface warning to user.
5. **Privacy**: Encrypt transcripts at rest; implement 90-day retention policy for raw transcript cleanup.

---

## Development Workflow

### Before Starting
1. Read the SRD (requirements document) in project root
2. Check CLAUDE.md (this file) for architecture overview
3. Set up `.env` with API keys

### Adding a Feature
1. Decide: Backend (service method) vs. Frontend (component) vs. Both
2. Write tests first (pytest for backend, Jest for frontend)
3. Implement feature
4. Test locally: `pytest` or `npm run dev`
5. Verify API contract + database state
6. Update CLAUDE.md if architecture changes

### Common Commands

**Backend Development**:
```bash
cd backend
source venv/bin/activate
pytest                                    # Run all tests
pytest tests/test_file.py::test_name -v  # Run specific test
uvicorn app.main:app --reload             # Dev server
alembic revision --autogenerate -m "msg"  # Create migration
```

**Frontend Development**:
```bash
cd frontend
npm run dev                  # Dev server (hot reload)
npm run build              # Production build
npm run lint               # ESLint check
npm run type-check         # TypeScript validation
```

**Full Stack**:
```bash
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Docker (optional)
docker-compose up postgres
```

---

## Success Criteria (Hackathon MVP)

✅ **Must-Have**
- Upload transcript → Extract commitments (90%+ precision)
- Contact behavioral profile (DISC + patterns)
- Generate prep brief <10 seconds
- Hindsight retain/recall integration
- Flag overdue commitments
- Mobile-responsive UI

✅ **Should-Have**
- Behavioral profiling intelligence
- Auto-generated talking points
- PDF download
- Risk indicator visuals

⏰ **Nice-to-Have** (Post-Hackathon)
- Real-time voice transcription
- Calendar integration
- Team collaboration
- Advanced analytics

---

## Debugging Tips

**Groq extraction failing?**
- Check prompt formatting in `GroqService.extract_commitments()`
- Verify transcript quality (no OCR errors)
- Log Groq response: `logger.info(f"Groq response: {response}")`

**Hindsight recall returning irrelevant results?**
- Check embedding quality: Are vectors being computed correctly?
- Verify semantic search query is clear
- Test with smaller contact history first

**Prep brief <10s SLA miss?**
- Profile with: `python -m cProfile -s cumtime app/main.py`
- Check if Groq or Hindsight is blocking (add timeouts)
- Cache brief generation for same contact if meeting_date unchanged

**Database migrations failing?**
- Verify PostgreSQL + pgvector is running
- Check `alembic` version matches requirements.txt
- Run: `alembic current` to see current schema version

---

## Resources

- **SRD**: Project requirements (root directory)
- **Groq Docs**: https://console.groq.com/docs
- **Hindsight**: Persistent memory SDK (configuration in services/)
- **FastAPI**: https://fastapi.tiangolo.com
- **React + TypeScript**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
