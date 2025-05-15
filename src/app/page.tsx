import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="mb-8 flex justify-center">
        <img
          src="/gigglelogo.png"
          alt="Giggle Logo"
          width={240}
          height={96}
          style={{
            maxWidth: '240px',
            height: 'auto'
          }}
        />
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
