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

      if (error) {
        console.error('fetchProfile error:', error)
      } else if (data && data.length > 0) {
        setProfile(data[0])
      }
    } catch (err) {
      console.error('fetchProfile exception:', err)
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
        console.error('Profile creation error:', profileError)
        return { data: null, error: profileError }
      }
    }

    return { data, error: null }
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
      // First, check if profile exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)

      if (!existing || existing.length === 0) {
        // Profile doesn't exist, create it with updates and user email
        const { error: insertError, data: insertData } = await supabase
          .from('profiles')
          .insert([{ 
            user_id: user.id, 
            email: user.email,
            ...updates 
          }])
          .select()

        if (insertError) {
          console.error('Profile insert error:', insertError)
          return { data: null, error: insertError }
        }

        if (insertData && insertData.length > 0) {
          setProfile(insertData[0])
          return { data: insertData[0], error: null }
        }
      }

      // Profile exists, update it
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('updateProfile error:', updateError)
        return { data: null, error: updateError }
      }

      // Fetch the updated profile
      const { data: freshData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)

      if (!fetchError && freshData && freshData.length > 0) {
        setProfile(freshData[0])
        window.dispatchEvent(new StorageEvent('storage', {
          key: `profile-${user.id}`,
          newValue: JSON.stringify(freshData[0]),
          url: window.location.href,
        }))
        return { data: freshData[0], error: null }
      }

      return { data: null, error: fetchError || new Error('No data returned') }
    } catch (err) {
      console.error('updateProfile exception:', err)
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