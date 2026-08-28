import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyNotice() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/home') }, [navigate])
  return null
}
