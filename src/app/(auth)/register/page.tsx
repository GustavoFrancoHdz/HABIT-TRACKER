import Link from 'next/link'
import { register } from '@/features/auth/actions'
import AuthForm from '@/features/auth/AuthForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-gray-500">¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
          </p>
        </div>
        <AuthForm action={register} submitLabel="Registrarse" />
      </div>
    </main>
  )
}
