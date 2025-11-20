

import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex justify-center items-center min-h-screen bg-black'>
    <div className='w-full max-w-md'>
        <SignIn />
        </div>
    </div>
    )
}