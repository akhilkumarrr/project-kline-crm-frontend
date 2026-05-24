import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

type ToastTone = 'success' | 'error' | 'info'

type ToastInput = {
  message: string
  title?: string
  tone?: ToastTone
}

type ToastRecord = ToastInput & {
  id: string
}

type ConfirmOptions = {
  confirmLabel?: string
  description: string
  tone?: 'default' | 'danger'
  title: string
}

type ConfirmState = ConfirmOptions & {
  open: boolean
}

type FeedbackContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  dismissToast: (id: string) => void
  notify: (toast: ToastInput) => void
  notifyError: (message: string, title?: string) => void
  notifyInfo: (message: string, title?: string) => void
  notifySuccess: (message: string, title?: string) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

const initialConfirmState: ConfirmState = {
  confirmLabel: 'Continue',
  description: '',
  open: false,
  title: '',
  tone: 'default',
}

const buildId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState>(initialConfirmState)
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null)

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    ({ message, title, tone = 'info' }: ToastInput) => {
      const id = buildId()
      setToasts((current) => [...current, { id, message, title, tone }])
      window.setTimeout(() => {
        dismissToast(id)
      }, 4200)
    },
    [dismissToast],
  )

  const settleConfirm = useCallback((value: boolean) => {
    confirmResolverRef.current?.(value)
    confirmResolverRef.current = null
    setConfirmState(initialConfirmState)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false)
    }

    setConfirmState({
      confirmLabel: options.confirmLabel || 'Continue',
      description: options.description,
      open: true,
      title: options.title,
      tone: options.tone || 'default',
    })

    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve
    })
  }, [])

  const value = useMemo<FeedbackContextValue>(
    () => ({
      confirm,
      dismissToast,
      notify,
      notifyError: (message, title = 'Something went wrong') => notify({ message, title, tone: 'error' }),
      notifyInfo: (message, title = 'Heads up') => notify({ message, title, tone: 'info' }),
      notifySuccess: (message, title = 'Done') => notify({ message, title, tone: 'success' }),
    }),
    [confirm, dismissToast, notify],
  )

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <article key={toast.id} className={`toast-card toast-${toast.tone}`}>
            <div>
              {toast.title ? <strong>{toast.title}</strong> : null}
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              className="ghost-button compact-button"
              onClick={() => dismissToast(toast.id)}
            >
              Dismiss
            </button>
          </article>
        ))}
      </div>

      {confirmState.open ? (
        <div className="confirm-backdrop" role="presentation">
          <div
            className={`confirm-panel${confirmState.tone === 'danger' ? ' danger' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <p className="eyebrow">Confirm action</p>
            <h3 id="confirm-dialog-title">{confirmState.title}</h3>
            <p>{confirmState.description}</p>
            <div className="confirm-actions">
              <button type="button" className="ghost-button" onClick={() => settleConfirm(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={confirmState.tone === 'danger' ? 'danger-button' : 'primary-button'}
                onClick={() => settleConfirm(true)}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)

  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider.')
  }

  return context
}
