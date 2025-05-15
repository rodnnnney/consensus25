import { LoginForm } from '@/components/login-form'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="mb-8 flex justify-center">
        <Image
          src="/gigglelogo.png"
          alt="Giggle Logo"
          width={240}
          height={96}
          priority
        />
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
