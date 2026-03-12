import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { FileText, Mail, Globe, Github } from 'lucide-react'

const Navbar = () => {

   const {user} = useSelector(state => state.auth)
   const dispatch = useDispatch()

    const navigate = useNavigate()

    const logoutUser = ()=>{
        navigate('/')
        dispatch(logout())
    }

  return (
    <div className='shadow bg-white'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all'>
        <div className='flex items-center gap-6'>
          <Link to='/app' className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            DocBuilder AI
          </Link>
          <div className='hidden md:flex items-center gap-1 text-xs text-slate-500'>
            <Link to='/app' className='flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors'><FileText size={13}/>Resumes</Link>
            <Link to='/app' className='flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors' onClick={()=>setTimeout(()=>document.querySelector('[data-tab="cover-letters"]')?.click(),100)}><Mail size={13}/>Cover Letters</Link>
            <Link to='/app/portfolio/github' className='flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors'><Github size={13}/>GitHub Analyzer</Link>
          </div>
        </div>
        <div className='flex items-center gap-4 text-sm'>
            <p className='max-sm:hidden text-slate-500'>Hi, <span className='font-medium text-slate-700'>{user?.name}</span></p>
            <button onClick={logoutUser} className='bg-white hover:bg-slate-50 border border-gray-300 px-5 py-1.5 rounded-full active:scale-95 transition-all text-sm'>Logout</button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
