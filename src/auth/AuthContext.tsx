import { createContext, useContext, useState, ReactNode } from 'react'

export interface MockUser {
  id: string
  name: string
  role: 'CEO' | 'ADMIN'
  email: string
}

interface AuthState {
  user: MockUser | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

// Mock credential — replace with real backend when ready
const MOCK_CREDENTIAL = { email: 'ceo@nexusgrowth.io', password: 'nexus2025' }
const MOCK_USER: MockUser = { id: 'u_ceo_01', name: 'Sophia', role: 'CEO', email: MOCK_CREDENTIAL.email }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('ng_session')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  async function signIn(email: string, password: string) {
    // MOCK only — not real authentication
    await new Promise(r => setTimeout(r, 600))
    if (email === MOCK_CREDENTIAL.email && password === MOCK_CREDENTIAL.password) {
      sessionStorage.setItem('ng_session', JSON.stringify(MOCK_USER))
      setUser(MOCK_USER)
      return { ok: true }
    }
    return { ok: false, error: 'Invalid credentials' }
  }

  function signOut() {
    sessionStorage.removeItem('ng_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
