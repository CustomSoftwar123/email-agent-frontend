import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AUTH_EXPIRED, api, tokenStore } from '../api/client.js'

const AuthContext = createContext(null)

/** The role gate the UI reads. The API enforces the same rule server-side. */
export const isSuperAdmin = (user) => user?.role === 'superadmin'

/** True while an account still has to pick a plan. Admins are never gated. */
export const needsPlan = (user) =>
  !!user && !isSuperAdmin(user) && user.plan_status === 'none'

/**
 * Holds the signed-in account. The token itself lives in localStorage (see
 * client.js) — this only tracks who it belongs to, so a reload restores the
 * session by asking the backend rather than trusting anything cached.
 *
 * `ready` is false until that first check settles, which stops the route guard
 * from bouncing a signed-in user to /login on every refresh.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true)
      return
    }
    api
      .me()
      .then(setUser)
      .catch(() => tokenStore.set(''))
      .finally(() => setReady(true))
  }, [])

  // A token that expires mid-session drops the user here, wherever they are.
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED, onExpired)
  }, [])

  const enter = useCallback((res, remember) => {
    tokenStore.set(res.token, remember)
    setUser(res.user)
    return res.user
  }, [])

  const login = useCallback(
    (email, password, remember = true) =>
      api.login({ email, password }).then((res) => enter(res, remember)),
    [enter],
  )

  /**
   * Creates the account but deliberately does not sign in. The token the API
   * hands back is dropped, so the new user goes to the login page and enters
   * the password they just chose — which confirms they typed what they meant.
   */
  const signup = useCallback(
    (name, email, password) => api.signup({ name, email, password }).then((res) => res.user),
    [],
  )

  /** Re-read the account from the server — after picking a plan, say. */
  const refresh = useCallback(() => api.me().then((u) => {
    setUser(u)
    return u
  }), [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      /* the token is being dropped either way */
    }
    tokenStore.set('')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
