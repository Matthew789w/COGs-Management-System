import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from '../lib/api'
import { useAuth } from './AuthContext'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [avatars, setAvatars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/profile')
      setProfile(response.data.data?.profile || authUser || null)
      setAvatars(response.data.data?.avatars || [])
      setError('')
    } catch {
      setProfile(authUser || null)
      setError(authUser ? '' : 'Unable to load profile.')
    } finally {
      setLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    setLoading(true)
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(async (payload) => {
    const response = await axios.put('/api/user/profile', payload)
    setProfile(response.data.data || null)
    return response.data
  }, [])

  const updatePassword = useCallback(async (payload) => {
    const response = await axios.put('/api/user/password', payload)
    return response.data
  }, [])

  const uploadProfilePhoto = useCallback(async (file) => {
    const formData = new FormData()
    formData.append('photo', file)

    const response = await axios.post('/api/user/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    setProfile(response.data.data || null)
    return response.data
  }, [])

  const removeProfilePhoto = useCallback(async () => {
    const response = await axios.delete('/api/user/profile/photo')
    setProfile(response.data.data || null)
    return response.data
  }, [])

  const value = useMemo(
    () => ({
      profile,
      avatars,
      loading,
      error,
      refreshProfile: fetchProfile,
      updateProfile,
      updatePassword,
      uploadProfilePhoto,
      removeProfilePhoto,
    }),
    [
      profile,
      avatars,
      loading,
      error,
      fetchProfile,
      updateProfile,
      updatePassword,
      uploadProfilePhoto,
      removeProfilePhoto,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }

  return context
}
