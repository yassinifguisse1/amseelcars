"use client"
import React from 'react'
import { useRevealed } from '@/hooks/useRevealed'

const Cars = () => {
  useRevealed()
  return (
    <>
    <div className='revealed'></div>
    <div className="page-content">
      <h1>Cars <sup>03</sup></h1>
    </div>
    </>
   
  )
}

export default Cars