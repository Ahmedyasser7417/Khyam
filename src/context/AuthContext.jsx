/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null)
    const [userName, setUserName] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        // getSession() loads initial session reliably
        async function initAuth() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!mounted) return
                if (session?.user) {
                    setUser(session.user)
                    await fetchUserRole(session.user.id)
                }
            } catch (err) {
                console.error('Auth init error:', err)
            } finally {
                if (mounted) setLoading(false) // ← always runs, site never gets stuck
            }
        }

        initAuth()

        // onAuthStateChange only for subsequent events (not initial load)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return
            if (event === 'SIGNED_IN') {
                setUser(session.user)
                fetchUserRole(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setRole(null)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const fetchUserRole = async (userId) => {
        try {
            const { data } = await supabase
                .from('users')
                .select('role, name')
                .eq('id', userId)
                .single()

            if (data) {
                setRole(data.role)
                setUserName(data.name)
            }
        } catch (error) {
            console.error('Error fetching user role:', error)
        }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    // Mock login for testing - sets fake user/role without Supabase
    const mockLogin = (mockRole) => {
        setUser({ id: 'mock-user', email: `${mockRole}@test.com` })
        setRole(mockRole)
    }

    const signOut = async () => {
        // Clear mock state too
        setUser(null)
        setRole(null)
        setUserName(null)
        try {
            await supabase.auth.signOut()
        } catch {
            // ignore errors from signing out when not authenticated
        }
    }

    return (
        <AuthContext.Provider value={{ user, role, userName, loading, signIn, signOut, mockLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
