import { useState, type FormEvent } from 'react'

type LoginPageProps = {
  error: string | null
  isLoading: boolean
  onSubmit: (email: string, password: string) => Promise<void>
}

export function LoginPage({ error, isLoading, onSubmit }: LoginPageProps) {
  const [email, setEmail] = useState('admin@projectkline.com')
  const [password, setPassword] = useState('ChangeMe123!')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">Project Kline CRM</p>
        <h1>Run sales, onboarding, support, and cash flow from one operating screen.</h1>
        <p>
          This frontend is wired for your Nest backend, so once you sign in it
          can pull live contacts, leads, tasks, analytics, invoices, and more.
        </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Secure sign in</p>
          <h2>Welcome back</h2>
        </div>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="primary-button auth-button" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in to CRM'}
        </button>

        <p className="auth-note">
          API target: <code>{import.meta.env.VITE_API_BASE_URL || '/api/v1'}</code>
        </p>
      </form>
    </main>
  )
}
