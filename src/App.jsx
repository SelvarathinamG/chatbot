import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

const STARTER_PROMPTS = [
  'Summarize the latest trends in frontend performance optimization.',
  'Create a launch checklist for a new SaaS product.',
  'Explain vector databases with a real-world use case.',
  'Write a step-by-step plan to prepare for a software interview.',
]

const KNOWLEDGE_SNIPPETS = {
  frontend: `## Frontend Performance Trends (2026)

- Prioritize **Core Web Vitals** as product KPIs.
- Use **route-level code splitting** and defer non-critical JavaScript.
- Adopt **image pipelines** (AVIF/WebP, responsive sizes, lazy loading).
- Move expensive UI logic to **server-side rendering** or edge rendering where possible.

### Practical Weekly Plan

1. Measure with Lighthouse and Web Vitals in production.
2. Fix largest render blockers first.
3. Reduce hydration and bundle size.
4. Re-measure and compare before/after metrics.
`,
  launch: `## SaaS Launch Checklist

### Product

- Validate one clear value proposition.
- Ensure onboarding reaches first value in under 3 minutes.
- Add analytics events for activation and retention.

### Operations

- Configure error tracking and uptime monitoring.
- Prepare support macros and FAQ docs.
- Create rollback and incident response playbook.

### Go-To-Market

- Publish one focused landing page.
- Prepare launch posts and a short demo video.
- Track CAC, conversion rate, and trial-to-paid.
`,
  interview: `## Software Interview Preparation Plan

### Week 1: Fundamentals

- Arrays, strings, hash maps, complexity analysis.
- Solve 2 easy + 1 medium problem daily.

### Week 2: Data Structures

- Trees, graphs, stacks, queues, heaps.
- Practice patterns: DFS/BFS, sliding window, two pointers.

### Week 3: System Design + Behavioral

- Review caching, load balancing, database tradeoffs.
- Write STAR stories for leadership and collaboration.

### Week 4: Mock Interviews

- Run timed mocks with feedback loops.
- Maintain an error log and review weak areas.
`,
  vector: `## Vector Databases in Real Products

Vector databases store embeddings and enable **semantic search**.

### Typical Architecture

1. Convert documents to embeddings.
2. Store embeddings in a vector index.
3. At query time, embed the question.
4. Retrieve nearest matches and build a grounded response.

### Real-World Use Cases

- Internal knowledge assistants.
- Similarity search for products or media.
- Personalized recommendations.
`,
}

function buildStructuredReply(prompt) {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('frontend') || lowerPrompt.includes('performance')) {
    return KNOWLEDGE_SNIPPETS.frontend
  }

  if (lowerPrompt.includes('launch') || lowerPrompt.includes('saas')) {
    return KNOWLEDGE_SNIPPETS.launch
  }

  if (lowerPrompt.includes('interview')) {
    return KNOWLEDGE_SNIPPETS.interview
  }

  if (lowerPrompt.includes('vector') || lowerPrompt.includes('embedding')) {
    return KNOWLEDGE_SNIPPETS.vector
  }

  return `## Professional Response

I understood your request:

> ${prompt}

### Recommended Structure

1. **Goal:** Define the exact outcome in one sentence.
2. **Constraints:** Time, budget, tools, and quality bar.
3. **Execution Plan:** Break work into phases and owners.
4. **Validation:** Define success metrics and review checkpoints.

### Next Actions

- Start with a small pilot.
- Document assumptions and decisions.
- Review results and iterate quickly.
`
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendPrompt(rawPrompt) {
    const cleanPrompt = rawPrompt.trim()
    if (!cleanPrompt) {
      setError('Please enter a prompt first.')
      return
    }

    setIsLoading(true)
    setError('')
    setMessages((previous) => [...previous, { role: 'user', text: cleanPrompt }])

    try {
      await delay(900)
      const text = buildStructuredReply(cleanPrompt)
      setMessages((previous) => [
        ...previous,
        { role: 'model', text },
      ])
      setPrompt('')
    } catch {
      setError('Unable to generate a response right now. Please try again.')
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
          <div className="model-pill">offline professional assistant</div>
        </header>

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
                    disabled={isLoading}
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
                {message.role === 'model' ? (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                  </div>
                ) : (
                  <pre className="response-text mb-0">{message.text}</pre>
                )}
              </article>
            ))}

            {isLoading && (
              <article className="message-card message-model loading-card">
                <p className="message-meta mb-2">Assistant is preparing a professional response</p>
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
              placeholder="Ask for a proposal, checklist, summary, plan, or strategy..."
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
