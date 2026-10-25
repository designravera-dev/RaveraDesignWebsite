import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      console.log('[AuthContext] Initializing auth...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[AuthContext] Session result:', session ? 'Session found' : 'No session')
        setUser(session?.user ?? null)
      } catch (e) {
        console.error('[AuthContext] Error initializing auth:', e)
      } finally {
        console.log('[AuthContext] Auth initialization finished')
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error }
      setUser(data.user)
      return { error: null }
    } catch (e) {
      return { error: new Error('Authentication failed') }
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (e) {
      console.error('Error signing out:', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Em vez de dar throw, retornamos valores padrão para evitar que a app morra
    // caso alguém tente usar o hook fora do provider por erro de desenvolvimento.
    return {
      user: null,
      isLoading: false,
      signIn: async () => ({ error: new Error('AuthContext not found') }),
      signOut: async () => {},
    } as AuthContextType
  }
  return context
}
