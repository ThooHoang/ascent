import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch exception:', err)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      return { data, error }
    }

    // Create profile
    if (data.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: data.user.id,
            name: name || email.split('@')[0],
            email: email,
          }
        ])

      if (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }

    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.user?.id) {
      await fetchProfile(data.user.id)
    }

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setProfile(null)
    }
    return { error }
  }

  const updateProfile = async (updates) => {
    if (!user?.id) return { error: 'No user' }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Supabase update error:', error)
        return { data: null, error }
      }

      if (data && data.length > 0) {
        const updatedProfile = data[0]
        setProfile(updatedProfile)
        // Force a re-render by triggering storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: `profile-${user.id}`,
          newValue: JSON.stringify(updatedProfile),
          url: window.location.href,
        }))
        return { data: updatedProfile, error: null }
      }

      // If no error but also no data, fetch the profile again
      const { data: freshData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!fetchError && freshData) {
        setProfile(freshData)
        return { data: freshData, error: null }
      }

      return { data: null, error: fetchError || new Error('No data returned') }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { data: null, error: err }
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}