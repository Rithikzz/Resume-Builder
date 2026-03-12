import React, { useEffect, lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import CoverLetterBuilder from './pages/CoverLetterBuilder'
import PortfolioGenerator from './pages/PortfolioGenerator'
import GitHubAnalyzer from './pages/GitHubAnalyzer'
import { useDispatch } from 'react-redux'
import api from './configs/api'
import { login, setLoading } from './app/features/authSlice'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const dispatch = useDispatch()

  const getUserData = async () => {
    const token = localStorage.getItem('token')
    try {
      if(token){
        const { data } = await api.get('/api/users/data', {headers: {Authorization: token}})
        if(data.user){
          dispatch(login({token, user: data.user}))
        }
        dispatch(setLoading(false))
      }else{
        dispatch(setLoading(false))
      }
    } catch (error) {
      dispatch(setLoading(false))
      console.log(error.message)
    }
  }

  useEffect(()=>{
    getUserData()
  },[])

  return (
    <>
    <Toaster />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/login' element={<Login />}/>

        <Route path='app' element={<Layout />}>
          <Route index element={<Dashboard />}/>
          <Route path='builder/:resumeId' element={<ResumeBuilder />}/>
          <Route path='cover-letter/builder/:id' element={<CoverLetterBuilder />}/>
          <Route path='cover-letter/builder' element={<CoverLetterBuilder />}/>
          <Route path='portfolio/builder/:id' element={<PortfolioGenerator />}/>
          <Route path='portfolio/builder' element={<PortfolioGenerator />}/>
          <Route path='portfolio/github' element={<GitHubAnalyzer />}/>
        </Route>

        <Route path='view/:resumeId' element={<Preview />}/>

      </Routes>
    </>
  )
}

export default App
