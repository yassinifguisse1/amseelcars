"use client";

import React from 'react'
import Hero from '../Hero/Hero'
import ShowCars from '../ShowCars/ShowCars'
import Footer from '@/components/Footer/Footer'
import { AboutCredentials } from '@/components/about/AboutCredentials'

const CarePage = () => {
  return (
    <>
      <Hero/>
      <AboutCredentials />
      <ShowCars/>
      <Footer/>
    </>
  )
}

export default CarePage