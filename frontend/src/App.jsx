
import { useState } from 'react'
import './App.css'

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('Python')
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [githubFiles, setGithubFiles] = useState([])
  const [githubLoading, setGithubLoading] = useState(false)
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('reviewHistory') || '[]')
  })
  const [error, setError] = useState('')
  async function handleGitHubLoad() {
    if (!repoUrl.trim()) {
      alert('Please enter a GitHub repository URL.')
      return
    }

    setGithubLoading(true)
    setGithubFiles([])

    try {
      const response = await fetch('https://codelens-ai-code-reviewer-6w6o.onrender.com/github/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repo_url: repoUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not load repository.')
      }

      setGithubFiles(data.files)
    } catch (error) {
      alert(error.message)
    } finally {
      setGithubLoading(false)
    }
  }
  async function handleFileSelect(file) {
    try {
      const response = await fetch('https://codelens-ai-code-reviewer-6w6o.onrender.com/github/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_url: file.url
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not load file.')
      }

      setCode(data.content)
      setReview(null)
      const extension = file.name.split('.').pop().toLowerCase()

      const languageMap = {
        py: 'python',
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        cpp: 'cpp',
        c: 'c',
        h: 'cpp',
        java: 'java'
      }

      setLanguage(languageMap[extension] || 'python')
    } catch (error) {
      alert(error.message)
    }
  }
  async function handleReview() {
    if (!code.trim()) {
      setError('Please paste your code first.')
      return
    }

    setLoading(true)
    setError('')
    setReview(null)

    try {
      const response = await fetch('https://codelens-ai-code-reviewer-6w6o.onrender.com/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Review failed.')
      }

      setReview(data.review)

      const newReview = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        code: code,
        language: language,
        review: data.review
      }

      const updatedHistory = [newReview, ...history]

      setHistory(updatedHistory)

      localStorage.setItem(
        'reviewHistory',
        JSON.stringify(updatedHistory)
      )
    } catch (err) {
      setError(err.message || 'Could not connect to backend.')
    } finally {
      setLoading(false)
    }
  }
  function deleteReview(id) {
    const updatedHistory = history.filter(
      (item) => item.id !== id
    )

    setHistory(updatedHistory)

    localStorage.setItem(
      'reviewHistory',
      JSON.stringify(updatedHistory)
    )
  }
  function clearCode() {
    setCode('')
    setReview(null)
    setError('')
  }

  async function copyReview() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(review, null, 2)
      )
    } catch {
      setError('Unable to copy review. Please copy it manually.')
    }
  }

  return (
    <div className="app">
      <div className="github-section">
        <h2>GitHub Repository Review</h2>

        <input
          type="text"
          placeholder="Enter GitHub repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <button
          onClick={handleGitHubLoad}
          disabled={githubLoading}
        >
          {githubLoading ? 'Loading...' : 'Load Repository'}
        </button>

        {githubFiles.length > 0 && (
          <div>
            <h3>Repository Files</h3>

            {githubFiles.map((file, index) => (
              <p
                key={index}
                onClick={() => handleFileSelect(file)}
                style={{ cursor: 'pointer' }}
              >
                📄 {file.name}
              </p>
            ))}
          </div>
        )}
      </div>
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">C</span>
          <span>CodeLens</span>
        </div>
        <span className="nav-label">AI CODE REVIEW</span>
      </nav>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">✦ AI POWERED DEVELOPER TOOL</span>
          <h1>
            Write better code.
            <br />
            <span>Build with confidence.</span>
          </h1>
          <p>
            Let AI analyze your code, detect bugs, and suggest
            improvements in seconds.
          </p>
        </section>

        <section className="editor-card">
          <div className="card-heading">
            <div>
              <h2>Code Analyzer</h2>
              <p>Paste your code below to get an AI review.</p>
            </div>
            <span className="status">
              <span className="status-dot"></span>
              AI READY
            </span>
          </div>

          <label htmlFor="language">Programming Language</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>Python</option>
            <option>JavaScript</option>
            <option>C++</option>
            <option>Java</option>
          </select>

          <div className="editor-label">
            <label htmlFor="code">Your Code</label>
            <span>{code.length} characters</span>
          </div>

          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste your code here..."
            rows="13"
            spellCheck="false"
          />

          <div className="actions">
            <button className="clear-btn" onClick={clearCode}>
              Clear
            </button>
            <button
              className="review-btn"
              onClick={handleReview}
              disabled={loading}
            >
              {loading ? 'Analyzing your code...' : '✦ Review My Code'}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </section>

        {review && (
          <section className="results-card">

            <div className="stats-grid">
              <div className="stat-card">
                <h3>{review.bugs?.length || 0}</h3>
                <p>Total Bugs</p>
              </div>

              <div className="stat-card high-stat">
                <h3>
                  {review.bugs?.filter(
                    bug => bug.severity?.toUpperCase() === 'HIGH'
                  ).length || 0}
                </h3>
                <p>High Severity</p>
              </div>

              <div className="stat-card medium-stat">
                <h3>
                  {review.bugs?.filter(
                    bug => bug.severity?.toUpperCase() === 'MEDIUM'
                  ).length || 0}
                </h3>
                <p>Medium Severity</p>
              </div>

              <div className="stat-card low-stat">
                <h3>
                  {review.bugs?.filter(
                    bug => bug.severity?.toUpperCase() === 'LOW'
                  ).length || 0}
                </h3>
                <p>Low Severity</p>
              </div>
            </div>

            <div className="results-heading">
              <div>
                <span className="eyebrow">✦ ANALYSIS COMPLETE</span>
                <h2>Code Review Results</h2>
              </div>
              <button className="copy-btn" onClick={copyReview}>
                Copy Review
              </button>
            </div>

            <div className="review-output">
              <h3>Summary</h3>
              <p>{review.summary || 'No summary provided.'}</p>

              <h3>Bugs Found ({review.bugs?.length || 0})</h3>
              {review.bugs?.length > 0 ? (
                review.bugs.map((bug, index) => (
                  <div className="review-item" key={index}>
                    <h4>{bug.title}</h4>
                    <span className={`severity-badge ${bug.severity?.toLowerCase()}`}>
                      {bug.severity}
                    </span>
                    <p>{bug.explanation}</p>
                    <p><strong>Suggestion:</strong> {bug.suggestion}</p>
                  </div>
                ))
              ) : (
                <p>No bugs reported.</p>
              )}

              <h3>Code Quality</h3>
              {review.code_quality?.length > 0 ? (
                review.code_quality.map((item, index) => (
                  <div className="review-item" key={index}>
                    <h4>{item.title}</h4>
                    <p>{item.explanation}</p>
                    <p><strong>Improvement:</strong> {item.suggestion}</p>
                  </div>
                ))
              ) : (
                <p>No code quality issues reported.</p>
              )}

              <h3>Suggested Fixes</h3>
              {review.suggested_fixes?.length > 0 ? (
                review.suggested_fixes.map((fix, index) => (
                  <div className="review-item" key={index}>
                    <h4>{fix.title}</h4>
                    <pre>{fix.code}</pre>

                    <button
                      className="review-btn"
                      onClick={() => {
                        setCode(fix.code)
                        setReview(null)
                      }}
                    >
                      Apply Fix
                    </button>
                  </div>
                ))
              ) : (
                <p>No fixes suggested.</p>
              )}

              <h3>Test Cases</h3>
              {review.test_cases?.length > 0 ? (
                review.test_cases.map((test, index) => (
                  <div className="review-item" key={index}>
                    <p><strong>Input:</strong> {test.input}</p>
                    <p><strong>Expected Output:</strong> {test.expected_output}</p>
                  </div>
                ))
              ) : (
                <p>No test cases provided.</p>
              )}
            </div>
          </section>
        )}

        <section className="results-card history-section">
          <div className="results-heading">
            <div>
              <span className="eyebrow">✦ YOUR PREVIOUS REVIEWS</span>
              <h2>Review History</h2>
              <button
                className="delete-btn"
                onClick={() => {
                  if (window.confirm('Delete all review history?')) {
                    setHistory([])
                    localStorage.removeItem('reviewHistory')
                  }
                }}
              >
                Clear All History
              </button>
            </div>
            <span>{history.length} Reviews</span>
          </div>

          {history.length === 0 ? (
            <p>No previous reviews yet.</p>
          ) : (
            history.map((item) => (
              <div className="review-item" key={item.id}>
                <h4>{item.language} Code Review</h4>
                <p>{item.date}</p>

                <div className="history-actions">
                  <button
                    className="review-btn"
                    onClick={() => {
                      setCode(item.code)
                      setLanguage(item.language)
                      setReview(item.review)
                    }}
                  >
                    View Review
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteReview(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>


        <footer>
          <p>CodeLens © 2026 · Built for developers, powered by AI.</p>
        </footer>
      </main>
    </div>
  )
}

export default App
