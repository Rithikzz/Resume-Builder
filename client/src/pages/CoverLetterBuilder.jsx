import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import { Sparkles, Save, ArrowLeft, RefreshCw, Loader, Share2, Copy } from 'lucide-react'

const TONES = ['professional', 'enthusiastic', 'formal', 'friendly']

const CoverLetterBuilder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector(state => state.auth)
  const headers = { Authorization: token }

  const [form, setForm] = useState({
    title: '',
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    keySkills: '',
    experience: '',
    tone: 'professional',
    customInstructions: '',
    content: '',
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [improving, setImproving] = useState(false)

  // Load existing cover letter
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const { data } = await api.get(`/api/cover-letters/${id}`, { headers })
        const cl = data.coverLetter
        setForm({
          title: cl.title || '',
          applicantName: cl.applicantName || '',
          applicantEmail: cl.applicantEmail || '',
          applicantPhone: cl.applicantPhone || '',
          jobTitle: cl.jobTitle || '',
          companyName: cl.companyName || '',
          jobDescription: cl.jobDescription || '',
          keySkills: (cl.keySkills || []).join(', '),
          experience: cl.experience || '',
          tone: cl.tone || 'professional',
          customInstructions: cl.customInstructions || '',
          content: cl.content || '',
        })
      } catch (e) {
        toast.error('Failed to load cover letter')
        navigate('/app')
      }
    }
    load()
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const save = async (e) => {
    if (e) e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        keySkills: form.keySkills.split(',').map(s => s.trim()).filter(Boolean),
      }
      await api.put(`/api/cover-letters/update/${id}`, payload, { headers })
      toast.success('Saved!')
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message)
    }
    setSaving(false)
  }

  const generate = async () => {
    if (!id) { toast.error('Save first'); return }
    setGenerating(true)
    try {
      await save()
      const { data } = await api.post(`/api/cover-letters/generate/${id}`, {}, { headers })
      set('content', data.content)
      toast.success('Cover letter generated!')
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message)
    }
    setGenerating(false)
  }

  const improve = async () => {
    if (!id || !form.content) { toast.error('Generate a cover letter first'); return }
    setImproving(true)
    try {
      await save()
      const { data } = await api.post(`/api/cover-letters/improve/${id}`, {}, { headers })
      set('content', data.content)
      toast.success('Cover letter improved!')
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message)
    }
    setImproving(false)
  }

  const copyToClipboard = () => {
    if (!form.content) return
    navigator.clipboard.writeText(form.content)
    toast.success('Copied to clipboard!')
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white'
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1'

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3'>
        <button onClick={() => navigate('/app')} className='p-1.5 rounded-lg hover:bg-slate-100 transition-colors'>
          <ArrowLeft size={18} className='text-slate-600' />
        </button>
        <input
          value={form.title}
          onChange={e => set('title', e.target.value)}
          onBlur={save}
          placeholder='Cover Letter Title'
          className='flex-1 text-lg font-semibold bg-transparent focus:outline-none text-slate-800 placeholder-slate-300'
        />
        <button
          onClick={generate}
          disabled={generating}
          className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm rounded-lg hover:shadow-md transition-all disabled:opacity-60'
        >
          {generating ? <Loader size={15} className='animate-spin' /> : <Sparkles size={15} />}
          {generating ? 'Generating…' : 'Generate with AI'}
        </button>
        <button
          onClick={save}
          disabled={saving}
          className='flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60'
        >
          {saving ? <Loader size={15} className='animate-spin' /> : <Save size={15} />}
          Save
        </button>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left: Form */}
        <div className='space-y-5'>
          {/* Applicant Info */}
          <div className='bg-white rounded-xl border border-slate-200 p-5'>
            <h3 className='font-semibold text-slate-800 mb-4 flex items-center gap-2'>
              <span className='w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold'>1</span>
              Your Information
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              <div className='col-span-2'>
                <label className={labelCls}>Full Name</label>
                <input value={form.applicantName} onChange={e => set('applicantName', e.target.value)} placeholder='John Doe' className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input value={form.applicantEmail} onChange={e => set('applicantEmail', e.target.value)} placeholder='john@example.com' className={inputCls} type='email' />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={form.applicantPhone} onChange={e => set('applicantPhone', e.target.value)} placeholder='+1 234 567 8900' className={inputCls} />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className='bg-white rounded-xl border border-slate-200 p-5'>
            <h3 className='font-semibold text-slate-800 mb-4 flex items-center gap-2'>
              <span className='w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold'>2</span>
              Job Details
            </h3>
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className={labelCls}>Job Title</label>
                  <input value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder='Software Engineer' className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Company Name</label>
                  <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder='Google Inc.' className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Job Description</label>
                <textarea
                  value={form.jobDescription}
                  onChange={e => set('jobDescription', e.target.value)}
                  placeholder='Paste the job description here… (the more detail, the better the cover letter)'
                  rows={5}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* AI Options */}
          <div className='bg-white rounded-xl border border-slate-200 p-5'>
            <h3 className='font-semibold text-slate-800 mb-4 flex items-center gap-2'>
              <span className='w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold'>3</span>
              AI Options
            </h3>
            <div className='space-y-3'>
              <div>
                <label className={labelCls}>Your Key Skills (comma-separated)</label>
                <input value={form.keySkills} onChange={e => set('keySkills', e.target.value)} placeholder='React, Node.js, Python, AWS…' className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Years of Experience / Background</label>
                <input value={form.experience} onChange={e => set('experience', e.target.value)} placeholder='e.g. 3 years as a full-stack developer at a startup' className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tone</label>
                <div className='flex gap-2 flex-wrap'>
                  {TONES.map(t => (
                    <button
                      key={t}
                      type='button'
                      onClick={() => set('tone', t)}
                      className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all
                        ${form.tone === t ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-rose-50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Custom Instructions (optional)</label>
                <textarea
                  value={form.customInstructions}
                  onChange={e => set('customInstructions', e.target.value)}
                  placeholder='e.g. "Mention my open-source contributions, keep it under 300 words"'
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className='sticky top-20 self-start'>
          <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
            <div className='flex items-center justify-between px-5 py-3 border-b border-slate-100'>
              <span className='text-sm font-semibold text-slate-700'>Preview</span>
              <div className='flex gap-2'>
                {form.content && (
                  <>
                    <button onClick={copyToClipboard} className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-500' title='Copy'>
                      <Copy size={15} />
                    </button>
                    <button onClick={improve} disabled={improving} className='flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-60 transition-colors'>
                      {improving ? <Loader size={13} className='animate-spin' /> : <RefreshCw size={13} />}
                      Improve
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className='p-6 min-h-[500px]'>
              {form.content ? (
                <div className='text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-serif'>
                  {form.content}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-80 gap-4 text-slate-300'>
                  <Sparkles size={48} strokeWidth={1} />
                  <div className='text-center'>
                    <p className='font-medium text-slate-400'>Your cover letter will appear here</p>
                    <p className='text-xs mt-1'>Fill in the fields and click "Generate with AI"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoverLetterBuilder
