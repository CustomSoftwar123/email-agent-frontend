import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'ea-theme'
const ThemeContext = createContext({ theme: 'light', preference: 'system', setPreference: () => {} })

const systemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const resolve = (pref) => (pref === 'system' ? systemTheme() : pref)

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system')
  const [theme, setTheme] = useState(() => resolve(localStorage.getItem(STORAGE_KEY) || 'system'))

  useEffect(() => {
    const apply = () => {
      const next = resolve(preference)
      setTheme(next)
      document.documentElement.dataset.theme = next
    }
    apply()
    localStorage.setItem(STORAGE_KEY, preference)
    if (preference !== 'system') return
    // Only follow the OS while the user hasn't picked a side.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [preference])

  const toggle = useCallback(() => {
    setPreference(resolve(preference) === 'dark' ? 'light' : 'dark')
  }, [preference])

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
