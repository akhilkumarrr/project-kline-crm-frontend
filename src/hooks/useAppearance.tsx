import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type ThemeId = 'sunset' | 'lagoon' | 'graphite' | 'citrus'
type TileSizeId = 'compact' | 'comfortable' | 'expanded'

type AppearanceContextValue = {
  setTheme: (theme: ThemeId) => void
  setTileSize: (tileSize: TileSizeId) => void
  theme: ThemeId
  themeOptions: Array<{ description: string; id: ThemeId; label: string }>
  tileSize: TileSizeId
  tileSizeOptions: Array<{ description: string; id: TileSizeId; label: string }>
}

const STORAGE_KEY = 'project-kline-crm-appearance'

const themeOptions: AppearanceContextValue['themeOptions'] = [
  {
    description: 'Warm amber and soft paper surfaces.',
    id: 'sunset',
    label: 'Sunset',
  },
  {
    description: 'Teal, sea-glass, and cleaner contrast.',
    id: 'lagoon',
    label: 'Lagoon',
  },
  {
    description: 'Neutral graphite with sharper contrast.',
    id: 'graphite',
    label: 'Graphite',
  },
  {
    description: 'Citrus gold and olive-tinted depth.',
    id: 'citrus',
    label: 'Citrus',
  },
]

const tileSizeOptions: AppearanceContextValue['tileSizeOptions'] = [
  {
    description: 'Tighter cards and denser information density.',
    id: 'compact',
    label: 'Compact',
  },
  {
    description: 'Balanced padding and the current working size.',
    id: 'comfortable',
    label: 'Comfortable',
  },
  {
    description: 'Larger cards and roomier visual spacing.',
    id: 'expanded',
    label: 'Expanded',
  },
]

const themeVars: Record<ThemeId, Record<string, string>> = {
  citrus: {
    '--accent': '#e7b545',
    '--accent-shadow': '0 1rem 2rem rgba(148, 112, 26, 0.24)',
    '--accent-strong': '#9f7a1d',
    '--app-shell-glow':
      'radial-gradient(circle at top left, rgba(234, 191, 83, 0.22), transparent 34%), radial-gradient(circle at top right, rgba(92, 127, 81, 0.16), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 40%)',
    '--auth-hero-bg':
      'radial-gradient(circle at top left, rgba(229, 182, 74, 0.35), transparent 34%), linear-gradient(160deg, rgba(28, 36, 24, 0.96), rgba(58, 70, 48, 0.9))',
    '--border-strong': 'rgba(52, 57, 38, 0.12)',
    '--chart-panel-bg':
      'linear-gradient(180deg, rgba(31, 40, 27, 0.96), rgba(55, 66, 46, 0.92))',
    '--contrast-card-bg': 'rgba(31, 40, 27, 0.88)',
    '--cool-bg': 'rgba(96, 143, 132, 0.16)',
    '--cool-fg': '#355f58',
    '--danger-bg': 'rgba(188, 96, 82, 0.16)',
    '--danger-fg': '#8e4035',
    '--eyebrow-color': '#8f7b49',
    '--field-bg': 'rgba(255, 255, 255, 0.8)',
    '--ghost-bg': 'rgba(255, 250, 242, 0.78)',
    '--hero-surface-bg':
      'linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(246, 232, 190, 0.82)), #fcf5de',
    '--ink': '#253026',
    '--ink-soft': '#6e7360',
    '--ink-strong': '#fff9eb',
    '--muted-surface': 'rgba(251, 244, 221, 0.9)',
    '--nav-active-bg':
      'linear-gradient(135deg, rgba(231, 181, 69, 0.22), rgba(255, 255, 255, 0.06))',
    '--nav-count-bg': 'rgba(255, 255, 255, 0.1)',
    '--nav-glyph-bg': 'rgba(255, 255, 255, 0.08)',
    '--nav-title-color': 'rgba(250, 245, 226, 0.56)',
    '--neutral-bg': 'rgba(37, 48, 38, 0.08)',
    '--neutral-fg': '#697061',
    '--page-background':
      'linear-gradient(180deg, #faf4e7 0%, #efe6ca 46%, #e3ddd0 100%)',
    '--risk-bg': 'rgba(188, 96, 82, 0.16)',
    '--risk-fg': '#8e4035',
    '--selection-border': 'rgba(167, 128, 34, 0.42)',
    '--selection-ring': 'rgba(231, 181, 69, 0.3)',
    '--shadow-soft':
      '0 18px 38px rgba(90, 81, 39, 0.1), 0 2px 8px rgba(90, 81, 39, 0.06)',
    '--sidebar-bg': 'rgba(25, 32, 22, 0.88)',
    '--sidebar-card-bg': 'rgba(255, 255, 255, 0.05)',
    '--sidebar-card-border': 'rgba(255, 255, 255, 0.08)',
    '--success-bg': 'rgba(109, 157, 90, 0.16)',
    '--success-fg': '#40603a',
    '--surface': '#fdf8ec',
    '--surface-card-bg': 'rgba(255, 251, 243, 0.82)',
    '--surface-card-border': 'rgba(52, 57, 38, 0.1)',
    '--surface-elevated-bg': 'rgba(255, 247, 231, 0.9)',
    '--surface-strong': '#f6ebcf',
    '--tile-bg': 'rgba(255, 255, 255, 0.78)',
    '--tile-border': 'rgba(52, 57, 38, 0.08)',
    '--warning-bg': 'rgba(231, 181, 69, 0.18)',
    '--warning-fg': '#89651e',
  },
  graphite: {
    '--accent': '#9cc3ff',
    '--accent-shadow': '0 1rem 2rem rgba(86, 120, 190, 0.24)',
    '--accent-strong': '#5077c4',
    '--app-shell-glow':
      'radial-gradient(circle at top left, rgba(156, 195, 255, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(220, 116, 94, 0.12), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%)',
    '--auth-hero-bg':
      'radial-gradient(circle at top left, rgba(153, 194, 255, 0.28), transparent 34%), linear-gradient(160deg, rgba(18, 24, 33, 0.96), rgba(41, 49, 61, 0.9))',
    '--border-strong': 'rgba(34, 43, 54, 0.12)',
    '--chart-panel-bg':
      'linear-gradient(180deg, rgba(19, 25, 33, 0.96), rgba(38, 48, 61, 0.92))',
    '--contrast-card-bg': 'rgba(22, 28, 38, 0.9)',
    '--cool-bg': 'rgba(101, 167, 214, 0.16)',
    '--cool-fg': '#2e6b8b',
    '--danger-bg': 'rgba(211, 111, 97, 0.15)',
    '--danger-fg': '#963f37',
    '--eyebrow-color': '#657b98',
    '--field-bg': 'rgba(255, 255, 255, 0.84)',
    '--ghost-bg': 'rgba(246, 248, 253, 0.78)',
    '--hero-surface-bg':
      'linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(226, 234, 247, 0.82)), #f4f6fb',
    '--ink': '#202831',
    '--ink-soft': '#6d7481',
    '--ink-strong': '#f4f7fb',
    '--muted-surface': 'rgba(241, 244, 250, 0.92)',
    '--nav-active-bg':
      'linear-gradient(135deg, rgba(156, 195, 255, 0.18), rgba(255, 255, 255, 0.06))',
    '--nav-count-bg': 'rgba(255, 255, 255, 0.1)',
    '--nav-glyph-bg': 'rgba(255, 255, 255, 0.08)',
    '--nav-title-color': 'rgba(233, 240, 248, 0.56)',
    '--neutral-bg': 'rgba(32, 40, 49, 0.08)',
    '--neutral-fg': '#66707d',
    '--page-background':
      'linear-gradient(180deg, #f5f7fa 0%, #edf1f5 46%, #e7ebf0 100%)',
    '--risk-bg': 'rgba(211, 111, 97, 0.16)',
    '--risk-fg': '#963f37',
    '--selection-border': 'rgba(80, 119, 196, 0.42)',
    '--selection-ring': 'rgba(156, 195, 255, 0.28)',
    '--shadow-soft':
      '0 18px 38px rgba(44, 55, 70, 0.08), 0 2px 8px rgba(44, 55, 70, 0.06)',
    '--sidebar-bg': 'rgba(18, 23, 31, 0.9)',
    '--sidebar-card-bg': 'rgba(255, 255, 255, 0.05)',
    '--sidebar-card-border': 'rgba(255, 255, 255, 0.08)',
    '--success-bg': 'rgba(92, 161, 123, 0.16)',
    '--success-fg': '#2f6a4f',
    '--surface': '#f5f7fa',
    '--surface-card-bg': 'rgba(253, 253, 255, 0.84)',
    '--surface-card-border': 'rgba(34, 43, 54, 0.1)',
    '--surface-elevated-bg': 'rgba(247, 249, 252, 0.92)',
    '--surface-strong': '#e9edf4',
    '--tile-bg': 'rgba(255, 255, 255, 0.8)',
    '--tile-border': 'rgba(34, 43, 54, 0.08)',
    '--warning-bg': 'rgba(228, 174, 78, 0.18)',
    '--warning-fg': '#8b651d',
  },
  lagoon: {
    '--accent': '#6fd4c0',
    '--accent-shadow': '0 1rem 2rem rgba(55, 135, 124, 0.24)',
    '--accent-strong': '#2e8d7f',
    '--app-shell-glow':
      'radial-gradient(circle at top left, rgba(111, 212, 192, 0.22), transparent 34%), radial-gradient(circle at top right, rgba(88, 144, 206, 0.14), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 40%)',
    '--auth-hero-bg':
      'radial-gradient(circle at top left, rgba(111, 212, 192, 0.32), transparent 34%), linear-gradient(160deg, rgba(12, 34, 36, 0.96), rgba(24, 63, 62, 0.9))',
    '--border-strong': 'rgba(27, 58, 61, 0.12)',
    '--chart-panel-bg':
      'linear-gradient(180deg, rgba(11, 35, 39, 0.96), rgba(22, 56, 59, 0.92))',
    '--contrast-card-bg': 'rgba(12, 37, 38, 0.9)',
    '--cool-bg': 'rgba(86, 153, 214, 0.15)',
    '--cool-fg': '#275f89',
    '--danger-bg': 'rgba(210, 114, 97, 0.15)',
    '--danger-fg': '#96453c',
    '--eyebrow-color': '#4e8b83',
    '--field-bg': 'rgba(255, 255, 255, 0.82)',
    '--ghost-bg': 'rgba(242, 250, 248, 0.8)',
    '--hero-surface-bg':
      'linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(205, 244, 236, 0.8)), #ecfbf8',
    '--ink': '#173338',
    '--ink-soft': '#688084',
    '--ink-strong': '#edf8f6',
    '--muted-surface': 'rgba(236, 251, 248, 0.92)',
    '--nav-active-bg':
      'linear-gradient(135deg, rgba(111, 212, 192, 0.2), rgba(255, 255, 255, 0.06))',
    '--nav-count-bg': 'rgba(255, 255, 255, 0.1)',
    '--nav-glyph-bg': 'rgba(255, 255, 255, 0.08)',
    '--nav-title-color': 'rgba(229, 247, 243, 0.56)',
    '--neutral-bg': 'rgba(23, 51, 56, 0.08)',
    '--neutral-fg': '#647c80',
    '--page-background':
      'linear-gradient(180deg, #f1fbfa 0%, #e4f4ef 46%, #dde9e9 100%)',
    '--risk-bg': 'rgba(210, 114, 97, 0.15)',
    '--risk-fg': '#96453c',
    '--selection-border': 'rgba(46, 141, 127, 0.42)',
    '--selection-ring': 'rgba(111, 212, 192, 0.3)',
    '--shadow-soft':
      '0 18px 38px rgba(33, 75, 78, 0.08), 0 2px 8px rgba(33, 75, 78, 0.06)',
    '--sidebar-bg': 'rgba(10, 28, 30, 0.9)',
    '--sidebar-card-bg': 'rgba(255, 255, 255, 0.05)',
    '--sidebar-card-border': 'rgba(255, 255, 255, 0.08)',
    '--success-bg': 'rgba(84, 171, 129, 0.16)',
    '--success-fg': '#2d6a52',
    '--surface': '#effaf7',
    '--surface-card-bg': 'rgba(248, 255, 253, 0.84)',
    '--surface-card-border': 'rgba(27, 58, 61, 0.1)',
    '--surface-elevated-bg': 'rgba(243, 255, 252, 0.92)',
    '--surface-strong': '#def2ed',
    '--tile-bg': 'rgba(255, 255, 255, 0.8)',
    '--tile-border': 'rgba(27, 58, 61, 0.08)',
    '--warning-bg': 'rgba(242, 179, 94, 0.18)',
    '--warning-fg': '#8f641b',
  },
  sunset: {
    '--accent': '#ffaf70',
    '--accent-shadow': '0 1rem 2rem rgba(180, 91, 35, 0.24)',
    '--accent-strong': '#d97332',
    '--app-shell-glow':
      'radial-gradient(circle at top left, rgba(255, 175, 122, 0.22), transparent 34%), radial-gradient(circle at top right, rgba(29, 120, 116, 0.16), transparent 28%), linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 40%)',
    '--auth-hero-bg':
      'radial-gradient(circle at top left, rgba(255, 175, 112, 0.35), transparent 34%), linear-gradient(160deg, rgba(13, 32, 36, 0.95), rgba(32, 53, 57, 0.88))',
    '--border-strong': 'rgba(24, 38, 45, 0.1)',
    '--chart-panel-bg':
      'linear-gradient(180deg, rgba(13, 32, 36, 0.96), rgba(34, 56, 61, 0.92))',
    '--contrast-card-bg': 'rgba(13, 32, 36, 0.82)',
    '--cool-bg': 'rgba(48, 148, 140, 0.14)',
    '--cool-fg': '#1e6f6f',
    '--danger-bg': 'rgba(214, 93, 87, 0.15)',
    '--danger-fg': '#9a3e39',
    '--eyebrow-color': '#92755c',
    '--field-bg': 'rgba(255, 255, 255, 0.75)',
    '--ghost-bg': 'rgba(255, 248, 238, 0.72)',
    '--hero-surface-bg':
      'linear-gradient(135deg, rgba(255, 255, 255, 0.66), rgba(255, 228, 199, 0.78)), #fff8ef',
    '--ink': '#18262d',
    '--ink-soft': '#6d7375',
    '--ink-strong': '#fff8ef',
    '--muted-surface': 'rgba(255, 244, 232, 0.9)',
    '--nav-active-bg':
      'linear-gradient(135deg, rgba(255, 159, 107, 0.18), rgba(255, 255, 255, 0.05))',
    '--nav-count-bg': 'rgba(255, 255, 255, 0.08)',
    '--nav-glyph-bg': 'rgba(255, 255, 255, 0.07)',
    '--nav-title-color': 'rgba(240, 231, 219, 0.52)',
    '--neutral-bg': 'rgba(12, 26, 31, 0.08)',
    '--neutral-fg': '#6d7375',
    '--page-background':
      'linear-gradient(180deg, #f7f1e8 0%, #f1e5d6 46%, #ebe4dc 100%)',
    '--risk-bg': 'rgba(214, 93, 87, 0.15)',
    '--risk-fg': '#9a3e39',
    '--selection-border': 'rgba(217, 115, 50, 0.32)',
    '--selection-ring': 'rgba(255, 175, 112, 0.34)',
    '--shadow-soft':
      '0 18px 38px rgba(76, 54, 39, 0.09), 0 2px 8px rgba(76, 54, 39, 0.06)',
    '--sidebar-bg': 'rgba(10, 17, 21, 0.85)',
    '--sidebar-card-bg': 'rgba(255, 255, 255, 0.04)',
    '--sidebar-card-border': 'rgba(255, 255, 255, 0.08)',
    '--success-bg': 'rgba(92, 168, 106, 0.15)',
    '--success-fg': '#32673c',
    '--surface': '#fff8ef',
    '--surface-card-bg': 'rgba(255, 251, 246, 0.78)',
    '--surface-card-border': 'rgba(24, 38, 45, 0.1)',
    '--surface-elevated-bg': 'rgba(255, 246, 236, 0.82)',
    '--surface-strong': '#fff2dd',
    '--tile-bg': 'rgba(255, 255, 255, 0.72)',
    '--tile-border': 'rgba(12, 26, 31, 0.08)',
    '--warning-bg': 'rgba(255, 179, 77, 0.18)',
    '--warning-fg': '#9d651c',
  },
}

const tileSizeVars: Record<TileSizeId, Record<string, string>> = {
  compact: {
    '--control-pad-x': '0.85rem',
    '--control-pad-y': '0.78rem',
    '--control-radius': '0.85rem',
    '--page-padding': '1.1rem',
    '--sidebar-padding': '1.15rem',
    '--sidebar-width': '274px',
    '--surface-padding': '1rem',
    '--surface-radius': '1rem',
    '--surface-radius-lg': '1.35rem',
    '--tile-gap': '0.75rem',
    '--tile-min-height': '6.75rem',
    '--tile-padding': '0.8rem',
    '--tile-radius': '0.88rem',
    '--tile-radius-lg': '1.05rem',
  },
  comfortable: {
    '--control-pad-x': '1rem',
    '--control-pad-y': '0.95rem',
    '--control-radius': '1rem',
    '--page-padding': '1.5rem',
    '--sidebar-padding': '1.5rem',
    '--sidebar-width': '294px',
    '--surface-padding': '1.3rem',
    '--surface-radius': '1.2rem',
    '--surface-radius-lg': '1.6rem',
    '--tile-gap': '0.9rem',
    '--tile-min-height': '8rem',
    '--tile-padding': '0.95rem',
    '--tile-radius': '1rem',
    '--tile-radius-lg': '1.2rem',
  },
  expanded: {
    '--control-pad-x': '1.15rem',
    '--control-pad-y': '1.05rem',
    '--control-radius': '1.1rem',
    '--page-padding': '1.8rem',
    '--sidebar-padding': '1.8rem',
    '--sidebar-width': '320px',
    '--surface-padding': '1.55rem',
    '--surface-radius': '1.3rem',
    '--surface-radius-lg': '1.8rem',
    '--tile-gap': '1rem',
    '--tile-min-height': '9.5rem',
    '--tile-padding': '1.1rem',
    '--tile-radius': '1.1rem',
    '--tile-radius-lg': '1.3rem',
  },
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

function readStoredAppearance() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as { theme?: ThemeId; tileSize?: TileSizeId }
  } catch {
    return null
  }
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const stored = typeof window !== 'undefined' ? readStoredAppearance() : null
  const [theme, setTheme] = useState<ThemeId>(stored?.theme || 'sunset')
  const [tileSize, setTileSize] = useState<TileSizeId>(stored?.tileSize || 'comfortable')

  useEffect(() => {
    const root = document.documentElement
    const vars = {
      ...themeVars[theme],
      ...tileSizeVars[tileSize],
    }

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme,
        tileSize,
      }),
    )
  }, [theme, tileSize])

  const value = useMemo(
    () => ({
      setTheme,
      setTileSize,
      theme,
      themeOptions,
      tileSize,
      tileSizeOptions,
    }),
    [theme, tileSize],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance() {
  const context = useContext(AppearanceContext)

  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider')
  }

  return context
}
