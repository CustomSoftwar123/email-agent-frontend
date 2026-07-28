import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const THEME_KEY = 'ea-theme'
// Bumped so a preset saved by an earlier build doesn't pin people to an old
// palette — everyone lands on the current default until they choose again.
const PRESET_KEY = 'ea-preset-v2'

/** Palette presets. `vivid` is the default and needs no CSS block. */
export const PRESETS = [
  { id: 'vivid', label: 'Vivid', hint: 'Gradient shell, filled colour cards', swatch: ['#4f46e5', '#8b5cf6', '#f4f5fb'] },
  { id: 'slate', label: 'Slate', hint: 'Near-black shell, restrained', swatch: ['#0f1419', '#3b5bdb', '#f7f8fa'] },
  { id: 'porcelain', label: 'Porcelain', hint: 'Light shell, monochrome ink', swatch: ['#fafafa', '#111111', '#ffffff'] },
  { id: 'teal', label: 'Teal', hint: 'Cool surfaces, deep teal accent', swatch: ['#0c2b28', '#0d9488', '#f2f8f7'] },
]

const ThemeContext = createContext({
  theme: 'light',
  preference: 'system',
  preset: 'slate',
  setPreference: () => {},
  setPreset: () => {},
  toggle: () => {},
})

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
const resolve = (pref) => (pref === 'system' ? systemTheme() : pref)

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(THEME_KEY) || 'system')
  const [theme, setTheme] = useState(() => resolve(localStorage.getItem(THEME_KEY) || 'system'))
  const [preset, setPreset] = useState(() => localStorage.getItem(PRESET_KEY) || 'vivid')

  useEffect(() => {
    const apply = () => {
      const next = resolve(preference)
      setTheme(next)
      document.documentElement.dataset.theme = next
    }
    apply()
    localStorage.setItem(THEME_KEY, preference)
    if (preference !== 'system') return
    // Only follow the OS while the user hasn't picked a side.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [preference])

  useEffect(() => {
    document.documentElement.dataset.preset = preset
    localStorage.setItem(PRESET_KEY, preset)
  }, [preset])

  const toggle = useCallback(() => {
    setPreference(resolve(preference) === 'dark' ? 'light' : 'dark')
  }, [preference])

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, preset, setPreset, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
