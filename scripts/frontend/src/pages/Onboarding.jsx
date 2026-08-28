import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/home') }, [navigate])
  return null
}
