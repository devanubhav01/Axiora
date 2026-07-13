"use client"
import React, { useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'

const Navbar = () => {
  const { data: session } = useSession()
  const [showdropdown, setShowdropdown] = useState(false)


  return (
    <nav className='bg-white border-b border-gray-200 text-black flex justify-between items-center px-4 md:h-16'>

      <Link className="logo flex justify-center items-center gap-2" href={"/"}>
        <img src="/Axioralogo.jpeg" width={32} height={32} alt="Axiora Logo" className="rounded-sm object-contain" style={{background:'#000', padding:'2px'}} />
        <span className='text-xl md:text-lg my-3 md:my-0 text-black font-bold tracking-tight' style={{fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '-0.02em'}}>Axiora</span>
      </Link>

      <div className='relative flex justify-center items-center md:flex gap-4 items-center'>
        <Link href="/create-resume" className="text-white bg-black hover:bg-neutral-800 font-semibold rounded-lg text-sm px-4 py-2 text-center transition-all mr-2">
          Create Resume
        </Link>
        {session && <>
          <Link href={`/${session.user.name}`} className="hidden md:block">
            <button type="button" className="text-black bg-white border border-black hover:bg-black hover:text-white font-semibold rounded-lg text-sm px-4 py-2 transition-all mr-1">
              View Portfolio
            </button>
          </Link>
          <button onClick={() => setShowdropdown(!showdropdown)} onBlur={() => {
            setTimeout(() => {
              setShowdropdown(false)
            }, 300);
          }} id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className="text-black mx-2 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center" type="button">Account<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
            </svg>
          </button>

          <div id="dropdown" className={`z-10 ${showdropdown ? "" : "hidden"} absolute left-[15px] top-12 bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow w-44`}>
            <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
              <li>
                <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-black">Dashboard</Link>
              </li>
              <li>
                <Link href={`/${session.user.name}`} className="block px-4 py-2 hover:bg-gray-100 text-black">Your Page</Link>
              </li>
              <li>
                <Link onClick={() => signOut()} href="#" className="block px-4 py-2 hover:bg-gray-100 text-black">Sign out</Link>
              </li>
            </ul>
          </div></>
        }

        {session && <button className='text-white w-fit bg-black hover:bg-neutral-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2' onClick={() => { signOut() }}>Logout</button>}
        {!session && <Link href={"/login"}>
          <button className='text-white bg-black hover:bg-neutral-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2'>Login</button></Link>}
      </div>
    </nav>
  )
}

export default Navbar