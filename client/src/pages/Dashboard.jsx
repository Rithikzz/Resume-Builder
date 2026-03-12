import {
  FileText, Mail, Globe, Plus, UploadCloud, LoaderCircle, X, Github, Trash2, Edit2
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import ResumeCard from '../components/ResumeCard'

const TABS = [
  { id: 'resumes',       label: 'Resumes',      icon: FileText, color: 'indigo' },
  { id: 'cover-letters', label: 'Cover Letters', icon: Mail,     color: 'rose'   },
  { id: 'portfolios',    label: 'Portfolios',    icon: Globe,    color: 'emerald'},
]

const ACCENT_COLORS = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']

const Modal = ({ title, onClose, children }) => (
  <div onClick={onClose} className='fixed inset-0 bg-black/70 backdrop-blur z-20 flex items-center justify-center'>
    <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
      <h2 className='text-xl font-bold mb-4'>{title}</h2>
      {children}
      <X className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer' onClick={onClose} />
    </div>
  </div>
)

const DocCard = ({ doc, accentColor, onDelete, viewPath }) => {
  const navigate = useNavigate()
  return (
    <div
      className='relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group'
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className='p-4' onClick={() => navigate(viewPath)}>
        <p className='font-semibold text-slate-800 truncate'>{doc.title}</p>
        <p className='text-xs text-slate-500 mt-1'>{new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</p>
        {doc.companyName && <p className='text-xs text-slate-400 mt-0.5'>{doc.companyName}</p>}
        {doc.headline && <p className='text-xs text-slate-400 mt-0.5 truncate'>{doc.headline}</p>}
      </div>
      <div className='flex gap-3 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity'>
        <button onClick={e => { e.stopPropagation(); navigate(viewPath) }}
          className='flex items-center gap-1 text-xs text-indigo-600 hover:underline'>
          <Edit2 size={12} /> Edit
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(doc._id) }}
          className='flex items-center gap-1 text-xs text-red-500 hover:underline'>
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('resumes')

  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [editResumeId, setEditResumeId] = useState('')

  const [coverLetters, setCoverLetters] = useState([])
  const [showCreateCL, setShowCreateCL] = useState(false)

  const [portfolios, setPortfolios] = useState([])
  const [showCreatePortfolio, setShowCreatePortfolio] = useState(false)

  const [title, setTitle] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const headers = { Authorization: token }

  const loadResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', { headers })
      setAllResumes(data.resumes)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const loadCoverLetters = async () => {
    try {
      const { data } = await api.get('/api/cover-letters/all', { headers })
      setCoverLetters(data.coverLetters || [])
    } catch (e) { /* silent - endpoint may not exist yet */ }
  }

  const loadPortfolios = async () => {
    try {
      const { data } = await api.get('/api/portfolios/all', { headers })
      setPortfolios(data.portfolios || [])
    } catch (e) { /* silent */ }
  }

  useEffect(() => {
    loadResumes()
    loadCoverLetters()
    loadPortfolios()
  }, [])

  const createResume = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/resumes/create', { title }, { headers })
      setAllResumes([...allResumes, data.resume])
      setTitle(''); setShowCreateResume(false)
      navigate(`/app/builder/${data.resume._id}`)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const uploadResume = async (e) => {
    e.preventDefault(); setIsLoading(true)
    try {
      const resumeText = await pdfToText(resumeFile)
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers })
      setTitle(''); setResumeFile(null); setShowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
    setIsLoading(false)
  }

  const editResumeTitle = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/api/resumes/update', { resumeId: editResumeId, resumeData: { title } }, { headers })
      setAllResumes(allResumes.map(r => r._id === editResumeId ? { ...r, title } : r))
      setTitle(''); setEditResumeId('')
      toast.success(data.message)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const deleteResume = async (resumeId) => {
    if (!window.confirm('Delete this resume?')) return
    try {
      const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers })
      setAllResumes(allResumes.filter(r => r._id !== resumeId))
      toast.success(data.message)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const createCoverLetter = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/cover-letters/create', { title }, { headers })
      setCoverLetters([...coverLetters, data.coverLetter])
      setTitle(''); setShowCreateCL(false)
      navigate(`/app/cover-letter/builder/${data.coverLetter._id}`)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const deleteCoverLetter = async (id) => {
    if (!window.confirm('Delete this cover letter?')) return
    try {
      await api.delete(`/api/cover-letters/delete/${id}`, { headers })
      setCoverLetters(coverLetters.filter(c => c._id !== id))
      toast.success('Cover letter deleted')
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const createPortfolio = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/api/portfolios/create', { title }, { headers })
      setPortfolios([...portfolios, data.portfolio])
      setTitle(''); setShowCreatePortfolio(false)
      navigate(`/app/portfolio/builder/${data.portfolio._id}`)
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const deletePortfolio = async (id) => {
    if (!window.confirm('Delete this portfolio?')) return
    try {
      await api.delete(`/api/portfolios/delete/${id}`, { headers })
      setPortfolios(portfolios.filter(p => p._id !== id))
      toast.success('Portfolio deleted')
    } catch (e) { toast.error(e?.response?.data?.message || e.message) }
  }

  const reset = () => { setTitle(''); setResumeFile(null) }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
        Welcome, {user?.name || 'User'}
      </p>

      {/* Tabs */}
      <div className='flex gap-1 bg-slate-100 rounded-xl p-1 mb-8 w-fit'>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          const count = tab.id === 'resumes' ? allResumes.length : tab.id === 'cover-letters' ? coverLetters.length : portfolios.length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${active ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={15} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Resumes */}
      {activeTab === 'resumes' && (
        <>
          <div className='flex gap-4 mb-6'>
            <button onClick={() => setShowCreateResume(true)} className='bg-white sm:max-w-36 w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <Plus className='size-11 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
              <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Resume</p>
            </button>
            <button onClick={() => setShowUploadResume(true)} className='bg-white sm:max-w-36 w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <UploadCloud className='size-11 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
              <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload Existing</p>
            </button>
          </div>
          <hr className='border-slate-300 mb-6' />
          <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>
            {allResumes.map((resume, i) => (
              <ResumeCard key={resume._id} resume={resume} index={i} colors={ACCENT_COLORS}
                onEdit={(id, t) => { setEditResumeId(id); setTitle(t) }} onDelete={deleteResume} />
            ))}
          </div>
        </>
      )}

      {/* Cover Letters */}
      {activeTab === 'cover-letters' && (
        <>
          <div className='flex gap-4 mb-6'>
            <button onClick={() => setShowCreateCL(true)} className='bg-white sm:max-w-36 w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-rose-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <Plus className='size-11 p-2.5 bg-gradient-to-br from-rose-300 to-rose-500 text-white rounded-full' />
              <p className='text-sm group-hover:text-rose-600 transition-all duration-300 text-center px-1'>New Cover Letter</p>
            </button>
          </div>
          {coverLetters.length === 0
            ? <p className='text-slate-400 text-sm'>No cover letters yet. Create one above!</p>
            : (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                {coverLetters.map((cl, i) => (
                  <DocCard key={cl._id} doc={cl} accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                    onDelete={deleteCoverLetter} viewPath={`/app/cover-letter/builder/${cl._id}`} />
                ))}
              </div>
            )}
        </>
      )}

      {/* Portfolios */}
      {activeTab === 'portfolios' && (
        <>
          <div className='flex gap-4 mb-6'>
            <button onClick={() => setShowCreatePortfolio(true)} className='bg-white sm:max-w-36 w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <Plus className='size-11 p-2.5 bg-gradient-to-br from-emerald-300 to-emerald-500 text-white rounded-full' />
              <p className='text-sm group-hover:text-emerald-600 transition-all duration-300'>New Portfolio</p>
            </button>
            <button onClick={() => navigate('/app/portfolio/github')} className='bg-white sm:max-w-36 w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-slate-700 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <Github className='size-11 p-2.5 bg-gradient-to-br from-slate-500 to-slate-800 text-white rounded-full' />
              <p className='text-sm group-hover:text-slate-800 transition-all duration-300 text-center px-1'>Import from GitHub</p>
            </button>
          </div>
          {portfolios.length === 0
            ? <p className='text-slate-400 text-sm'>No portfolios yet. Create one or import from GitHub!</p>
            : (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                {portfolios.map((p, i) => (
                  <DocCard key={p._id} doc={p} accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                    onDelete={deletePortfolio} viewPath={`/app/portfolio/builder/${p._id}`} />
                ))}
              </div>
            )}
        </>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {showCreateResume && (
        <Modal title='Create a Resume' onClose={() => { setShowCreateResume(false); reset() }}>
          <form onSubmit={createResume}>
            <input onChange={e => setTitle(e.target.value)} value={title} type='text' placeholder='Enter resume title'
              className='w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 ring-blue-600' required />
            <button className='w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>Create Resume</button>
          </form>
        </Modal>
      )}

      {showUploadResume && (
        <Modal title='Upload Resume (PDF)' onClose={() => { setShowUploadResume(false); reset() }}>
          <form onSubmit={uploadResume}>
            <input onChange={e => setTitle(e.target.value)} value={title} type='text' placeholder='Enter resume title'
              className='w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 ring-blue-600' required />
            <label htmlFor='resume-input' className='block text-sm text-slate-700'>
              <div className='flex flex-col items-center justify-center gap-2 border border-dashed border-slate-400 rounded-md p-8 my-3 hover:border-blue-500 hover:text-blue-700 cursor-pointer transition-colors text-slate-400'>
                {resumeFile ? <p className='text-blue-700'>{resumeFile.name}</p> : <><UploadCloud className='size-12 stroke-1' /><p>Click to upload PDF</p></>}
              </div>
            </label>
            <input type='file' id='resume-input' accept='.pdf' hidden onChange={e => setResumeFile(e.target.files[0])} />
            <button disabled={isLoading} className='w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2'>
              {isLoading && <LoaderCircle className='animate-spin size-4' />}
              {isLoading ? 'Uploading…' : 'Upload Resume'}
            </button>
          </form>
        </Modal>
      )}

      {!!editResumeId && (
        <Modal title='Edit Resume Title' onClose={() => { setEditResumeId(''); reset() }}>
          <form onSubmit={editResumeTitle}>
            <input onChange={e => setTitle(e.target.value)} value={title} type='text' placeholder='Enter resume title'
              className='w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 ring-blue-600' required />
            <button className='w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>Update</button>
          </form>
        </Modal>
      )}

      {showCreateCL && (
        <Modal title='New Cover Letter' onClose={() => { setShowCreateCL(false); reset() }}>
          <form onSubmit={createCoverLetter}>
            <input onChange={e => setTitle(e.target.value)} value={title} type='text' placeholder='e.g. "Software Engineer at Google"'
              className='w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 ring-rose-500' required />
            <button className='w-full py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors'>Create</button>
          </form>
        </Modal>
      )}

      {showCreatePortfolio && (
        <Modal title='New Portfolio' onClose={() => { setShowCreatePortfolio(false); reset() }}>
          <form onSubmit={createPortfolio}>
            <input onChange={e => setTitle(e.target.value)} value={title} type='text' placeholder='e.g. "My Developer Portfolio"'
              className='w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 ring-emerald-600' required />
            <button className='w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors'>Create</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Dashboard
