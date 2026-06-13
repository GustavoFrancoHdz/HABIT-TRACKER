import Link from 'next/link'
import { login } from '@/features/auth/actions'
import AuthForm from '@/features/auth/AuthForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-gray-500">¿No tienes cuenta?{' '}
            <Link href="/register" className="text-indigo-600 hover:underline">Regístrate</Link>
          </p>
        </div>
        <AuthForm action={login} submitLabel="Iniciar sesión" />
      </div>
    </main>
  )
}
