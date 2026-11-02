from reviewer import review_code
from github_service import get_github_files, get_file_content
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CodeLens API")

# Allow our React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
     "http://localhost:5174",
     "https://code-lens-ai-code-reviewer-two.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define the data we expect from the frontend
class CodeRequest(BaseModel):
    code: str
    language: str
class GitHubRequest(BaseModel):
    repo_url: str

@app.get("/")
def home():
    return {"message": "Welcome to CodeLens API"}


@app.get("/health")
def health():
    return {"status": "Backend is running"}


from fastapi import HTTPException
import traceback

@app.post("/review")
def review_code_endpoint(request: CodeRequest):

    print("1. Review endpoint called")
    print("2. Language:", request.language)

    try:
        print("3. Sending code to Gemini...")

        result = review_code(
            request.code,
            request.language
        )

        print("4. Gemini response received!")

        return {
            "language": request.language,
            "review": result
        }

    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.post("/github/files")
def github_files_endpoint(request: GitHubRequest):
    try:
        files = get_github_files(request.repo_url)

        return {
            "files": files
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
@app.post("/github/content")
def github_content_endpoint(request: dict):
    try:
        file_url = request.get("file_url")

        if not file_url:
            raise HTTPException(
                status_code=400,
                detail="File URL is required."
            )

        content = get_file_content(file_url)

        return {
            "content": content
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )