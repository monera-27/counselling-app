'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase-Client'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = async (e: any) => {
    e.preventDefault()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email to confirm your account.')
      router.push('/login')
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Create Account</button>
      </form>
      <p>{message}</p>
    </main>
  )
}