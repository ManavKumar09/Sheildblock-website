# ShieldBlock System Architecture

## Purpose

This document provides a detailed architecture overview for ShieldBlock. It is designed to help developers understand the code structure, data flow, file responsibilities, and integration points. It also serves as a context document for future AI-assisted development.

## High-Level Architecture

ShieldBlock is a multi-tier application with three main layers:

1. Frontend: A React + Vite single-page application (SPA) that provides user registration, verification, onboarding, and dashboard pages.
2. Backend (API): A FastAPI service that handles user management, email verification, authentication, DNS profile generation, and persistence.
3. DNS Server: A separate Go-based DNS-over-TLS (DoT) resolver that receives encrypted DNS queries from users and returns filtered responses based on configured filtering lists.

Additional elements:

- Database: SQLite by default, configurable via `DATABASE_URL`.
- Email: SMTP-based verification mail via `fastapi-mail`, with a local mock print fallback.
- Security: Password hashing via `bcrypt`, JWT tokens via `python-jose`, and CORS configured for local frontend ports.
- DNS Filtering: The DNS server enforces filtering rules based on the user's selected filter categories (ads, malware, adult, tracking, phishing, social).

## Component Diagram

- Browser / React SPA
  - `frontend/src/main.jsx`
  - `frontend/src/App.jsx`
  - `frontend/src/pages/*`
  - `frontend/src/components/*`
- API / FastAPI backend
  - `backend/CloudDNS/main.py`
  - `backend/CloudDNS/db.py`
  - `backend/CloudDNS/models.py`
  - `backend/CloudDNS/schemas.py`
  - `backend/CloudDNS/users.py`
  - `backend/CloudDNS/email_utils.py`
- DNS Server / Go application
  - `dns-server/main.go`
  - `dns-server/main_test.go`
  - `dns-server/plan.md` — detailed dns-server roadmap and design decisions
  - Listens for DNS-over-TLS (DoT) on port 853 (configurable)
  - Identifies users via TLS SNI: `{config_hash}.dns.shieldblock.in`
  - Returns filtered responses (sinkhole or upstream) based on the user's `filters_bitmask`
- Persistence
  - `backend/CloudDNS/shieldblock.db`
- Config
  - `requirements.txt`
  - `frontend/package.json`
  - `backend/CloudDNS/.env` (not committed but loaded in runtime)
  - `dns-server/go.mod`

## Backend Architecture

### `backend/CloudDNS/main.py`

This file defines the FastAPI application and the primary HTTP routes.

Key responsibilities:

- Application initialization:
  - `app = FastAPI(title="ShieldBlock API")`
  - Creates database tables using `Base.metadata.create_all(bind=engine)`
  - Adds `CORSMiddleware` to allow requests from `http://localhost:5173` and `http://localhost:3000`
- Routes:
  - `POST /register`:
    - Accepts `schemas.UserCreate`
    - Verifies the email is not already registered
    - Persists a new `User` record
    - Creates and sends an email verification token
  - `GET /verify/{token}`:
    - Decodes and validates the verification token
    - Marks the corresponding user as verified
    - Returns a JWT access token for subsequent API usage
  - `POST /login`:
    - Accepts `schemas.UserLogin`
    - Verifies email/password
    - Confirms the user's `is_verified` status
    - Issues a JWT access token
  - `POST /api/cloud-config`:
    - Accepts `schemas.CloudConfigCreate`
    - Requires authentication via `get_current_user_id`
    - Converts the selected DNS filter options into a bitmask
    - Creates a new `CloudDNSConfig` record
    - Returns a `config_hash` of the form `{config_hash}.dns.shieldblock.in`

Authentication helpers:

- `oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")`
- `get_current_user_id(token: str = Depends(oauth2_scheme))`
  - Decodes JWT tokens using `SECRET_KEY` and `ALGORITHM`
  - Extracts the `sub` field as the authenticated user ID

Filter bitmask mapping:

- `FILTER_MAPPING` encodes filter categories into powers of two:
  - `ads` = 1
  - `malware` = 2
  - `adult` = 4
  - `tracking` = 8
  - `phishing` = 16
  - `social` = 32

This allows multiple selected filters to be stored compactly as an integer bitmask.

### `backend/CloudDNS/db.py`

Defines database connectivity and session management.

Key responsibilities:

- Loads environment variables using `load_dotenv()`.
- Reads `DATABASE_URL` from environment or defaults to `sqlite:///./shieldblock.db`.
- Creates a SQLAlchemy engine with SQLite thread support.
- Defines `SessionLocal` for database sessions.
- Exposes `Base = declarative_base()` for ORM models.
- Provides `get_db()` as a dependency generator to safely open and close DB sessions in request handlers.

### `backend/CloudDNS/models.py`

Defines the ORM models for persistence.

Models:

- `User`
  - `id`: UUID string primary key
  - `name`: user name
  - `email`: unique email address
  - `hashed_password`: bcrypt hashed password
  - `is_verified`: boolean email verification status
  - `cloud_configs`: relationship to `CloudDNSConfig`
- `CloudDNSConfig`
  - `id`: UUID string primary key
  - `user_id`: foreign key to `users.id`
  - `profile_name`: friendly name for the DNS profile
  - `filters_bitmask`: integer storing selected filter categories
  - `config_hash`: secure unique hash used in the DoT endpoint hostname (`{config_hash}.dns.shieldblock.in`)
  - `owner`: relationship back to the `User`

### `backend/CloudDNS/schemas.py`

Defines Pydantic models used for request validation and response serialization.

Schematics:

- `UserCreate`
  - `name`, `email`, `password`
- `UserLogin`
  - `email`, `password`
- `Token`
  - `access_token`, `token_type`
- `UserResponse`
  - `id`, `name`, `email`, `is_verified`
- `CloudConfigCreate`
  - `profile_name`, `filters` as `Dict[str, bool]`
- `CloudConfigResponse`
  - `id`, `profile_name`, `filters_bitmask`, `config_hash`, `dns_url`

### `backend/CloudDNS/users.py`

Encapsulates user CRUD and password handling.

Functions:

- `verify_password(plain_password, hashed_password)`
  - Compares plain text password against bcrypt hash
- `get_password_hash(password)`
  - Hashes a password with bcrypt and returns a UTF-8 string
- `get_user_by_email(db, email)`
  - Retrieves the `User` object for a given email
- `create_user(db, user)`
  - Hashes the provided password
  - Creates and stores a new `User` record
  - Commits the transaction and refreshes the object
- `verify_user(db, email)`
  - Marks `is_verified` true and updates the database record

### `backend/CloudDNS/email_utils.py`

Manages JWT email tokens and email delivery.

Functions:

- `create_verification_token(email)`
  - Generates a JWT with `sub` set to the email
  - Expires in 24 hours
- `create_access_token(data)`
  - Generates a JWT token with the provided payload
  - Expires in 7 days
- `decode_verification_token(token)`
  - Decodes a verification JWT and returns the contained email
- `send_verification_email(email, token)`
  - Builds a verification link pointing to `http://localhost:5173/verify?token={token}`
  - Prints a mock email for local development
  - If SMTP credentials are configured, sends a real email using `FastMail`

Environment variables used:

- `SECRET_KEY`
- `ALGORITHM`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `MAIL_PORT`
- `MAIL_SERVER`
- `MAIL_FROM_NAME`
- `MAIL_STARTTLS`
- `MAIL_SSL_TLS`

### `backend/CloudDNS/requirements.txt`

Lists backend Python dependencies:

- `fastapi`
- `uvicorn`
- `sqlalchemy`
- `pydantic`
- `pydantic-settings`
- `email-validator`
- `bcrypt`
- `python-jose[cryptography]`
- `fastapi-mail`
- `python-dotenv`
- `slowapi`

## DNS Server Architecture

The DNS server is a separate Go-based service responsible for handling all DNS queries from users over DNS-over-TLS (DoT). It operates independently from the backend API and provides real-time DNS filtering enforcement. For phased implementation details and tradeoffs, see `dns-server/plan.md`.

### `dns-server/main.go`

The core DNS server application.

Key responsibilities:

- Listens for DNS-over-TLS (DoT) on port 853 (configurable)
- Identifies the user profile from the TLS **SNI** hostname: `{config_hash}.dns.shieldblock.in` (the config hash is not carried in the DNS query payload or as a query parameter)
- Looks up the corresponding `CloudDNSConfig` from the database using the config hash **on each query** (MVP); a planned improvement is **connection-scoped authentication** during the TLS handshake so policy is reused across queries on the same connection (see `dns-server/plan.md` Phase 5)
- Extracts the `filters_bitmask` from the user's configuration
- Compares the queried domain against filtering lists (ads, malware, adult, tracking, phishing, social)
- If the domain matches a category in the user's enabled filters, returns a sinkhole response: **A → `0.0.0.0`**, **AAAA → `::`**
- If the domain is not blocked, forwards the query to an upstream resolver and returns the response. **Currently:** Cloudflare only. **Planned:** multiple upstream providers with health tracking and failover (see `dns-server/plan.md` Phase 19)
- Operates independently and does not require the backend API to be running for DNS queries to be processed

### `dns-server/go.mod`

Defines Go module dependencies for the DNS server.

The DNS server typically uses Go packages like:

- `miekg/dns` — DNS protocol parsing and generation
- `database/sql` — database access for retrieving user configurations
- Other standard Go libraries for networking and concurrency

### `dns-server/main_test.go`

Contains unit and integration tests for the DNS server.

Tests likely cover:

- Filtering logic for different filter categories
- Proper forwarding of non-blocked queries
- Configuration hash lookup
- Edge cases and error handling

## Frontend Architecture

### `frontend/src/main.jsx`

Application entry point for the React SPA.

Responsibilities:

- Imports `React` and `ReactDOM`
- Imports the root `App` component
- Mounts the React app into the DOM element with ID `root`
- Wraps the app in `React.StrictMode`

### `frontend/src/App.jsx`

Defines the SPA routing and page composition.

Key responsibilities:

- Uses `react-router-dom` for route management
- Defines a `HomePage` wrapper for the marketing/home page structure
- Registers application routes:
  - `/` → `HomePage`
  - `/signup` → `Signup`
  - `/dashboard` → `UserDashboard`
  - `/dashboard/queries` → `QueryLog`
  - `/dashboard/blocklists` → `Blocklists`
  - `/dashboard/allowlist` → `Allowlist`
  - `/dashboard/domains` → `Domains`
  - `/dashboard/settings` → `Settings`
  - `/onboarding` → `Onboarding`
  - `/verify` → `Verify`

### `frontend/package.json`

Defines the frontend project metadata and dependencies.

Important entries:

- Dependencies:
  - `react`, `react-dom`
  - `react-router-dom`
  - `recharts`
  - `protobufjs`
- DevDependencies:
  - `vite`
  - `eslint`
  - `@vitejs/plugin-react`
  - TypeScript type packages for React
- Scripts:
  - `dev` → starts Vite development server
  - `build` → builds the production bundle
  - `lint` → runs ESLint
  - `preview` → previews the production build locally

### Frontend component structure

- `frontend/src/components/`
  - Presentational pieces used on the homepage and dashboard
  - Examples: `Navbar`, `Hero`, `Features`, `Architecture`, `Dashboard`, `CTA`, `Footer`
- `frontend/src/pages/`
  - Routed views for the application workflow
  - Example pages:
    - `signup/signup.jsx`:
      - Handles registration, sign-in, and deployment selection
      - Calls backend endpoints `/register` and `/login`
      - Uses `localStorage` for session state and deployment mode
    - `Verify/Verify.jsx`:
      - Reads `token` query parameter
      - Calls backend `/verify/{token}` to confirm user email
      - Stores `access_token` and login state in `localStorage`
      - Updates `verified_ping` so the original signup tab can detect completion
    - `UserDashboard/UserDashboard.jsx`:
      - Dashboard landing page after login
      - Likely reads `localStorage` for auth state and user details
    - `QueryLog/QueryLog.jsx`, `Blocklists/Blocklists.jsx`, `Allowlist/Allowlist.jsx`, `Domains/Domains.jsx`, `Settings/Settings.jsx`:
      - Dashboard sub-pages for user-specific DNS and filtering management
    - `OnBoarding/OnBoarding.jsx`:
      - Deployment onboarding page that reads selected deployment mode from `localStorage`

## Data Flow and Usage

### Registration and verification flow

1. User submits the signup form from `frontend/src/pages/signup/signup.jsx`.
2. Frontend sends `POST http://localhost:8000/register` with `name`, `email`, and `password`.
3. Backend `main.py` verifies uniqueness, hashes the password, stores the user, and sends a verification token email.
4. User clicks the email link, opening the React `/verify` route.
5. `Verify.jsx` calls `GET http://localhost:8000/verify/{token}`.
6. Backend validates the token, marks the user verified, and returns an access token.
7. The frontend stores the access token in `localStorage` and resumes the onboarding flow.

### Login flow

1. User submits the login form on `/signup` when using sign-in mode.
2. Frontend sends `POST http://localhost:8000/login` with email and password.
3. Backend verifies credentials and verification status.
4. On success, backend returns JWT token which frontend stores in `localStorage`.

### Cloud DNS config flow

1. The authenticated frontend submits cloud DNS configuration data to `POST /api/cloud-config`.
2. Backend authenticates via JWT token.
3. Selected filter booleans are converted to a compact `filters_bitmask` integer.
4. Backend generates a secure `config_hash` and persists the configuration.
5. Frontend receives `dns_url` and other metadata.

### DNS query and filtering flow

1. User configures their device for DNS-over-TLS (DoT) to ShieldBlock on port 853, with the resolver hostname `<config_hash>.dns.shieldblock.in` (issued as `dns_url` from the backend).
2. The device opens a TLS connection to the ShieldBlock DNS server; the **config hash is sent only via TLS SNI** in that hostname.
3. For each DNS query on the connection (MVP), the server looks up the user's `CloudDNSConfig` in the database by config hash and reads `filters_bitmask`. (Planned: authenticate once per TLS connection and reuse policy — see `dns-server/plan.md` Phase 5.)
4. The server resolves the queried domain against filtering lists for the enabled categories.
5. If the domain is blocked, the server returns a sinkhole answer: **A → `0.0.0.0`**, **AAAA → `::`**.
6. If the domain is allowed, the server forwards to upstream DNS (currently Cloudflare; multiple upstreams planned per `dns-server/plan.md` Phase 19) and returns the response.
7. The device receives the filtered DNS response over the same DoT connection.

Filtering decisions are made in real time and independently of backend API availability (the resolver reads the shared database directly).

## Environment and Runtime

### Backend environment variables

The backend uses `python-dotenv` to load values from `.env`.

Typical variables:

- `DATABASE_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `MAIL_PORT`
- `MAIL_SERVER`
- `MAIL_FROM_NAME`

### Local development commands

Backend:

```bash
cd backend/CloudDNS
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

DNS Server:

```bash
cd dns-server
go run main.go
```

## Recommended extension points

This section helps future developers or AI agents decide where to extend the project.

- Add dedicated API routes for saved DNS profiles, query history, and settings.
- Add middleware for authenticated user context, not just `get_current_user_id`.
- Introduce a proper session or refresh token workflow.
- Replace localStorage usage with a centralized auth context.
- Expand `frontend/src/components/` for reusable form and layout primitives.
- Add tests for backend route behavior and frontend interaction flows.

## File Reference Summary

- `README.md` — project overview and installation instructions.
- `ARCHITECTURE.md` — this architecture and file explanation document.
- `docker-compose.yml` — repository-level orchestration (if applicable).
- `frontend/package.json` — frontend dependencies and scripts.
- `frontend/src/main.jsx` — React application bootstrap.
- `frontend/src/App.jsx` — client routing and page composition.
- `frontend/src/components/*` — reusable UI sections.
- `frontend/src/pages/*` — route-driven views and workflow pages.
- `backend/CloudDNS/main.py` — FastAPI app and route handlers.
- `backend/CloudDNS/db.py` — database engine and session management.
- `backend/CloudDNS/models.py` — SQLAlchemy ORM definitions.
- `backend/CloudDNS/schemas.py` — Pydantic validation models.
- `backend/CloudDNS/users.py` — user account and password helpers.
- `backend/CloudDNS/email_utils.py` — verification token and email utilities.
- `backend/CloudDNS/requirements.txt` — Python dependencies.
- `dns-server/main.go` — DNS server application, query handling, and filtering logic.
- `dns-server/main_test.go` — DNS server tests.
- `dns-server/go.mod` — Go module and dependencies.
- `dns-server/plan.md` — dns-server engineering roadmap (source of truth for resolver design).

## Notes for AI-assisted development

When providing project context to an AI assistant, include these items:

- The project comprises three independent services: React SPA frontend, FastAPI backend, and Go DNS server.
- The DNS server is a critical component that handles real-time user DNS queries over **DoT on port 853**, with identity from **TLS SNI** (`{config_hash}.dns.shieldblock.in`).
- DNS filter selection is encoded as a bitmask in the backend; the resolver loads policy via **per-query database lookup** (MVP), with **connection-scoped auth** planned (`dns-server/plan.md` Phase 5).
- Blocked domains return sinkhole records (**A → `0.0.0.0`**, **AAAA → `::`**)
- Upstream resolution is **Cloudflare-only** today; **multiple upstreams** are planned (`dns-server/plan.md` Phase 19).
- For dns-server design and evolution, **`dns-server/plan.md` is the source of truth**; this document summarizes the dns-server architecture.
- Authentication flow relies on JWT and email verification in the backend.
- User signup uses a 2-step email confirmation + deployment onboarding flow.
- `localStorage` stores login state, token, and deployment preferences in the frontend.
- Backend uses SQLite by default but is configured to support other DBs through `DATABASE_URL`.
- The DNS server accesses the same database to look up user configurations using the config hash from SNI.

This file should give a developer or AI chatbot a comprehensive understanding of the project layout, important files, and major functional flows.