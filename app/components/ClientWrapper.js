"use client";
import React from 'react'
import Header from './header/Header';

export default function ClientWrapper({ children }) {
  return (
      <>
          <Header />
          {children}
      </>
  )
}