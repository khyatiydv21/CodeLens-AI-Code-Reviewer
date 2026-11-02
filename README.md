# CodeLens – AI-Powered Code Review Agent

CodeLens is an AI-powered code review platform that helps developers analyze source code, identify potential bugs, improve code quality, and generate test cases.

## Features
- AI-powered code review using Google Gemini
- Bug detection and severity classification
- Code quality and improvement suggestions
- Suggested code fixes
- Automatic test case generation
- GitHub repository integration
- Source file selection and review
- Review history and dashboard

## Tech Stack

**Frontend:** React, JavaScript, Vite

**Backend:** Python, FastAPI

**AI Integration:** Google Gemini API

**Version Control:** Git and GitHub

## Project Structure
- `frontend/` – React frontend
- `backend/` – FastAPI backend and AI review services

## Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside the `backend/` directory and add:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your actual API key to GitHub.

## Project Status
Developed as a portfolio project to explore AI-powered code analysis and automated code review.