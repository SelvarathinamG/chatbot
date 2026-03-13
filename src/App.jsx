import { useMemo, useState } from 'react'
import { GoogleGenAI } from '@google/genai'
import './App.css'

const STARTER_PROMPTS = [
  'Summarize the latest trends in frontend performance optimization.',
  'Create a launch checklist for a new SaaS product.',
  'Explain vector databases with a real-world use case.',
  'Write a step-by-step plan to prepare for a software interview.',
]

function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const isConfigured = Boolean(apiKey)

  const aiClient = useMemo(() => {
    if (!isConfigured) {
      return null
    }

    return new GoogleGenAI({ apiKey })
  }, [apiKey, isConfigured])

  function extractText(response) {
    if (response?.text) {
      return response.text
    }

    const parts = response?.candidates?.[0]?.content?.parts
    if (!parts || !Array.isArray(parts)) {
      return ''
    }

    return parts.map((part) => part?.text ?? '').join('')
  }

  async function sendPrompt(rawPrompt) {
    if (!isConfigured) {
      setError('Please set VITE_GEMINI_API_KEY in your .env file.')
      return
    }

    const cleanPrompt = rawPrompt.trim()
    if (!cleanPrompt) {
      setError('Please enter a prompt first.')
      return
    }

    setIsLoading(true)
    setError('')
    setMessages((previous) => [...previous, { role: 'user', text: cleanPrompt }])

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: cleanPrompt,
      })

      const text = extractText(response)
      setMessages((previous) => [
        ...previous,
        { role: 'model', text: text || 'No text response returned by the model.' },
      ])
      setPrompt('')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unknown error'
      setError(`Gemini request failed: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await sendPrompt(prompt)
  }

  async function handlePromptKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await sendPrompt(prompt)
    }
  }

  return (
    <main className="app-shell">
      <div className="mesh mesh-a" aria-hidden="true"></div>
      <div className="mesh mesh-b" aria-hidden="true"></div>
      <div className="mesh mesh-c" aria-hidden="true"></div>

      <div className="app-grid container py-3 py-md-4">
        <header className="topbar">
          <div className="brand-pill">
            <span className="brand-dot" aria-hidden="true"></span>
            <span>Spark Ask</span>
          </div>
          <div className="model-pill">gemini-2.5-flash</div>
        </header>

        {!isConfigured && (
          <div className="alert alert-warning mb-3" role="alert">
            API key missing. Add <strong>VITE_GEMINI_API_KEY</strong> to <strong>.env</strong>, then restart <strong>npm run dev</strong>.
          </div>
        )}

        <section className="feed">
          {messages.length === 0 && (
            <div className="hero-state">
              <h1 className="hero-title">Ask anything. Explore deeply.</h1>
              <p className="hero-subtitle">Fast answers with a clean workspace and motion-rich experience.</p>
              <div className="chip-row">
                {STARTER_PROMPTS.map((starterPrompt) => (
                  <button
                    key={starterPrompt}
                    type="button"
                    className="chip-btn"
                    onClick={() => sendPrompt(starterPrompt)}
                    disabled={isLoading || !isConfigured}
                  >
                    {starterPrompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="message-stack">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`message-card ${message.role === 'user' ? 'message-user' : 'message-model'}`}
                style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
              >
                <p className="message-meta mb-2">{message.role === 'user' ? 'You asked' : 'Gemini answered'}</p>
                <pre className="response-text mb-0">{message.text}</pre>
              </article>
            ))}

            {isLoading && (
              <article className="message-card message-model loading-card">
                <p className="message-meta mb-2">Gemini is thinking</p>
                <div className="typing-dots" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </article>
            )}
          </div>
        </section>

        <footer className="composer-wrap">
          <form onSubmit={handleSubmit} className="composer">
            <textarea
              id="prompt"
              className="composer-input"
              rows="2"
              placeholder="Ask follow-up questions, request code, or explore ideas..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handlePromptKeyDown}
              disabled={isLoading}
            />

            <div className="composer-actions">
              <button type="submit" className="btn btn-send" disabled={isLoading}>
                {isLoading ? 'Thinking...' : 'Ask'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setPrompt('')
                  setMessages([])
                  setError('')
                }}
                disabled={isLoading}
              >
                Clear
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
        </footer>
      </div>
    </main>
  )
}

export default App
