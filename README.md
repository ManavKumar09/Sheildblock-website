<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# ShieldBlock Project

## Project Overview

`ShieldBlock` is a two-part application composed of a React + Vite frontend and a FastAPI backend service. The frontend provides a modern dashboard and user interface, while the backend handles authentication, email verification, database storage, and API routes for the DNS security workflow.

- Frontend: `frontend/`
- Backend: `backend/CloudDNS/`

## Prerequisites

Before installing dependencies, first confirm your system has the required runtimes.

### Check installed tools

- Check Python:

  ```bash
  python --version
  ```

- Check Node.js:

  ```bash
  node --version
  ```

- Check npm:

  ```bash
  npm --version
  ```

If any of these commands fail, install the missing tool before proceeding.

### Install missing tools

- Install Python:

  1. Visit https://www.python.org/downloads/
  2. Download the latest Python 3 installer for Windows.
  3. Run the installer and enable "Add Python to PATH".
  4. Verify with:

     ```bash
     python --version
     ```

- Install Node.js and npm:

  1. Visit https://nodejs.org/
  2. Download the LTS version.
  3. Run the installer and accept the defaults.
  4. Verify with:

     ```bash
     node --version
     npm --version
     ```

- Install Git (optional):

  1. Visit https://git-scm.com/downloads
  2. Download and run the installer.
  3. Verify with:

     ```bash
     git --version
     ```

### Required tools

- Node.js installed (recommended v18 or later)
- npm installed
- Python installed (recommended 3.11 or newer)
- Git installed (optional, but useful for cloning and version control)

## Backend Dependency Installation

1. Open a terminal.
2. Navigate to the backend folder:

   ```bash
   cd backend/CloudDNS
   ```

3. Create a Python virtual environment:

   ```bash
   python -m venv venv
   ```

4. Activate the virtual environment:

   - Windows (Command Prompt):

     ```bash
     venv\Scripts\activate
     ```

   - PowerShell:

     ```powershell
     .\venv\Scripts\Activate.ps1
     ```

5. Upgrade pip and install backend dependencies:

   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

6. (Optional) Confirm the installation:

   ```bash
   pip list
   ```

## Frontend Dependency Installation

1. Open a terminal.
2. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

3. Install npm dependencies:

   ```bash
   npm install
   ```

4. (Optional) Confirm the installation by running the development server:

   ```bash
   npm run dev
   ```

## Running the Application

### Start the backend

From `backend/CloudDNS` with the virtual environment active:

```bash
uvicorn main:app --reload
```

### Start the frontend

From `frontend`:

```bash
npm run dev
```

## Notes

- The backend service is built with FastAPI and uses `uvicorn` for local development.
- The frontend is built with React, Vite, and a small set of dependencies such as `react-router-dom` and `recharts`.
- If you need to add environment configuration, place `.env` values in the backend folder and adjust `main.py` or `email_utils.py` as needed.
>>>>>>> 785ef3bd7a628e55569532b5be494abf5dc75fd9
