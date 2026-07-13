import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-white text-black border-t border-gray-200 flex items-center justify-center px-4 h-16'>
        <p className='text-center text-[#767676] text-sm'>Copyright &copy; {currentYear} Axiora — All rights reserved.</p>
    </footer>
  )
}

export default Footer