import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

interface UseReAuthReturn {
  requireReAuth: () => Promise<boolean>
  isReAuthModalOpen: boolean
  closeReAuthModal: () => void
  handleReAuth: (email: string, password: string) => Promise<boolean>
}

export function useReAuth(): UseReAuthReturn {
  const [isReAuthModalOpen, setIsReAuthModalOpen] = useState(false)
  const [resolve, setResolve] = useState<(value: boolean) => void>(() => () => {})

  const requireReAuth = useCallback((): Promise<boolean> => {
    return new Promise((res) => {
      setResolve(() => res)
      setIsReAuthModalOpen(true)
    })
  }, [])

  const handleReAuth = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      const ok = !error
      if (ok) {
        setIsReAuthModalOpen(false)
      }
      resolve(ok)
      return ok
    },
    [resolve],
  )

  const closeReAuthModal = useCallback(() => {
    setIsReAuthModalOpen(false)
    resolve(false)
  }, [resolve])

  return { requireReAuth, isReAuthModalOpen, closeReAuthModal, handleReAuth }
}
