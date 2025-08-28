"use client"
import React from 'react'
import { useRevealed } from '@/hooks/useRevealed'
import CarePage from '@/components/Cars/CarePage/CarePage'
const Cars = () => {
  useRevealed()
  return (
    <>
    <div className='revealed'></div>
    <CarePage/>
    </>
   
  )
}

export default Cars