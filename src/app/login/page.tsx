import config from '@/config/site'
import { Metadata } from 'next'
import Link from 'next/link'
import { UserAuthForm } from '../login/components/user-auth-form'

export const metadata: Metadata = {
   title: 'Login',
   description: 'Login to your account',
}

export default function AuthenticationPage() {
   return (
      <div className="relative min-h-screen flex items-center justify-center">

         {/* Background Image */}
         <div className="absolute inset-0">
            <img
               src="/images/diecast-bg.jpg"
               alt="Diecast Background"
               className="h-full w-full object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/70" />
         </div>


         {/* Brand Logo Top Left */}
         <Link
            href="/"
            className="absolute left-8 top-8 z-20 flex items-center text-white text-lg font-semibold"
         >
            <svg
               xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               className="mr-2 h-6 w-6"
            >
               <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>

            {config.name}
         </Link>


         {/* Login Card */}
         <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-10 text-white">

            <div className="space-y-2 text-center mb-6">
               <h1 className="text-3xl font-bold">
                  Welcome Back
               </h1>

               <p className="text-sm text-muted-foreground">
                  Login to continue exploring premium diecast collectibles.
               </p>
            </div>

            <UserAuthForm />

            <p className="mt-6 text-center text-sm text-muted-foreground">
               By continuing you agree to our{' '}
               <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
               >
                  Terms
               </Link>{' '}
               and{' '}
               <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
               >
                  Privacy Policy
               </Link>
               .
            </p>
         </div>

      </div>
   )
}