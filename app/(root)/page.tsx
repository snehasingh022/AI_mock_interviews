import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { dummyInterviews } from '@/constants'
import InterviewCard from '@/components/InterviewCard'

const page = () => {
  return (
    <>
    <section className='card-cta'>
     <div className='flex flex-col gap-6 max-w-lg'>
      <h2>Get interview-Ready with AI-powered Practice & Feedback</h2>
      <p className='text-lg'>Practice on real interview Questions & get instant feedback</p>
      <Button asChild className='btn-primary max-sm:w-full'>
        <Link href="/interview">Start an Interview</Link>
      </Button>
     </div>
     <Image src="/robot.png" alt="robo-dude" width={400} height={400} className='max-sm:hidden'/>
    </section>
  
    
    </>
  )
}

export default page