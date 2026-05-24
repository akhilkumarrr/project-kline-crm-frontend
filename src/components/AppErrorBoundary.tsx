import { Component, type ErrorInfo, type ReactNode } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App rendering failed', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-crash-shell">
          <section className="app-crash-card">
            <p className="eyebrow">Recovery mode</p>
            <h1>The CRM hit an unexpected screen error.</h1>
            <p>
              Your session is still stored locally. Reload the app to restore the workspace and
              continue from the last good state.
            </p>
            <button type="button" className="primary-button" onClick={this.handleReload}>
              Reload workspace
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
