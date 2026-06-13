'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function register(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.code === 'email_already_registered' || error.code === 'user_already_exists') {
      return { error: 'Este email ya está registrado' }
    }
    return { error: 'Error al registrarse. Intenta de nuevo.' }
  }

  redirect('/dashboard')
}

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.code === 'invalid_credentials') {
      return { error: 'Email o contraseña incorrectos' }
    }
    return { error: 'Error al iniciar sesión. Intenta de nuevo.' }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
