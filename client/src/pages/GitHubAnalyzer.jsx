import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import {
  Github, ArrowLeft, Loader, Star, GitFork, Globe, Search,
  CheckCircle, Code2, User, Sparkles, ExternalLink
} from 'lucide-react'

const GitHubAnalyzer = () => {
  const navigate = useNavigate()
  const { token } = useSelector(state => state.auth)
  const headers = { Authorization: token }

  const [username, setUsername] = useState('')
  const [step, setStep] = useState('idle') // idle | analyzing | done | error
  const [progress, setProgress] = useState([])
  const [result, setResult] = useState(null)
  const [resetAt, setResetAt] = useState(null)

  const addProgress = (msg) => setProgress(p => [...p, msg])

  const analyze = async (e) => {
    e.preventDefault()
    const raw = username.trim()
    if (!raw) return

    // Strip full GitHub URLs to extract just the username
    const cleaned = raw
      .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
      .replace(/[/?#].*$/, '')
      .trim()

    if (!cleaned) return

    // Update the input to show the cleaned username
    setUsername(cleaned)

    setStep('analyzing')
    setProgress([])
    setResult(null)

    addProgress('Connecting to GitHub…')

    try {
      addProgress(`Fetching profile for @${cleaned}…`)
      // Small delay so progress messages are readable
      await new Promise(r => setTimeout(r, 400))
      addProgress('Fetching repositories…')
      await new Promise(r => setTimeout(r, 400))
      addProgress('Analyzing technologies and contributions…')
      await new Promise(r => setTimeout(r, 400))
      addProgress('Running AI enhancement (bio, headlines, project descriptions)…')

      const { data } = await api.post('/api/portfolios/from-github', { githubUsername: cleaned }, { headers })

      addProgress('Portfolio created successfully!')
      setResult(data.portfolio)
      setStep('done')
      toast.success('Portfolio created from GitHub!')
    } catch (err) {
      const status = err?.response?.status
      const rawData = err?.response?.data
      // Handle multiple body formats: { message: '...' }, plain string, or no body at all
      const serverMsg = typeof rawData === 'string'
        ? rawData
        : rawData?.message || rawData?.error
      const fallback = status === 429
        ? 'Rate limit hit — please wait and try again.'
        : status
          ? `Server error ${status} — please try again.`
          : err.message
      const msg = serverMsg || fallback
      // Parse reset/retry time forwarded from server
      const rawReset = rawData?.resetAt
      const retryAfterMs = rawData?.retryAfter  // milliseconds
      const isSecondary = rawData?.isSecondary
      setResetAt(
        retryAfterMs
          ? new Date(Date.now() + retryAfterMs)
          : rawReset ? new Date(rawReset) : null
      )
      setStep('error')
      toast.error(isSecondary ? 'Too many rapid requests — please wait a moment.' : msg)
      addProgress(`Error: ${msg}`)
    }
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3'>
        <button onClick={() => navigate('/app')} className='p-1.5 rounded-lg hover:bg-slate-100 transition-colors'>
          <ArrowLeft size={18} className='text-slate-600' />
        </button>
        <div className='flex items-center gap-2'>
          <Github size={20} className='text-slate-700' />
          <span className='font-semibold text-slate-800'>GitHub Portfolio Analyzer</span>
        </div>
      </div>

      <div className='max-w-2xl mx-auto px-4 py-12'>
        {step === 'idle' && (
          <div className='text-center'>
            <div className='w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-6 shadow-lg'>
              <Github size={36} className='text-white' />
            </div>
            <h1 className='text-3xl font-bold text-slate-800 mb-3'>GitHub to Portfolio</h1>
            <p className='text-slate-500 mb-8 max-w-md mx-auto leading-relaxed'>
              Enter a GitHub username and our AI will analyze their profile, repositories, and
              contributions to instantly generate a professional portfolio.
            </p>

            <form onSubmit={analyze} className='flex gap-3 max-w-md mx-auto'>
              <div className='relative flex-1'>
                <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder='Enter username or paste GitHub profile URL…'
                  className='w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 bg-white'
                />
              </div>
              <button
                type='submit'
                disabled={!username.trim()}
                className='px-6 py-3 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
              >
                Analyze
              </button>
            </form>

            {/* Feature highlights */}
            <div className='mt-12 grid grid-cols-3 gap-4'>
              {[
                { icon: Code2, label: 'Language Detection', desc: 'Identifies top languages from all repos' },
                { icon: Star, label: 'Project Ranking', desc: 'Highlights your best work by stars & impact' },
                { icon: Sparkles, label: 'AI Bio Generation', desc: 'Writes a compelling professional bio for you' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className='bg-white rounded-xl border border-slate-200 p-4 text-center'>
                  <Icon size={22} className='mx-auto mb-2 text-slate-600' />
                  <p className='text-xs font-semibold text-slate-700'>{label}</p>
                  <p className='text-xs text-slate-400 mt-1'>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className='bg-white rounded-2xl border border-slate-200 p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <Loader size={22} className='animate-spin text-slate-700' />
              <h2 className='font-semibold text-slate-800 text-lg'>Analyzing @{username}…</h2>
            </div>
            <p className='text-xs text-slate-400 mb-4'>This may take 20–30 seconds while AI processes the data.</p>
            <div className='space-y-2'>
              {progress.map((msg, i) => (
                <div key={i} className='flex items-center gap-2 text-sm text-slate-600'>
                  <CheckCircle size={14} className='text-emerald-500 shrink-0' />
                  {msg}
                </div>
              ))}
              {/* Animated current step indicator */}
              <div className='flex items-center gap-2 text-sm text-slate-400'>
                <Loader size={14} className='animate-spin shrink-0' />
                Processing…
              </div>
            </div>
          </div>
        )}

        {step === 'done' && result && (
          <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
            {/* Success banner */}
            <div className='bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white'>
              <div className='flex items-center gap-2 mb-1'>
                <CheckCircle size={20} />
                <span className='font-semibold'>Portfolio Created!</span>
              </div>
              <p className='text-sm text-emerald-100'>Your GitHub profile has been transformed into a portfolio.</p>
            </div>

            {/* Preview */}
            <div className='p-6'>
              <div className='flex items-start gap-4 mb-5'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0'>
                  <User size={22} className='text-white' />
                </div>
                <div>
                  <h3 className='font-bold text-slate-800 text-lg'>{result.name || username}</h3>
                  {result.headline && <p className='text-sm text-slate-500'>{result.headline}</p>}
                </div>
              </div>

              {result.bio && (
                <p className='text-sm text-slate-600 leading-relaxed mb-5 bg-slate-50 rounded-lg p-4 border border-slate-100'>
                  {result.bio}
                </p>
              )}

              <div className='grid grid-cols-2 gap-3 mb-5'>
                {result.skills?.length > 0 && (
                  <div className='bg-slate-50 rounded-lg p-3'>
                    <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>Top Skills</p>
                    <div className='flex flex-wrap gap-1'>
                      {result.skills.slice(0, 8).map(skill => (
                        <span key={skill} className='text-xs bg-white border border-slate-200 rounded-md px-2 py-0.5 text-slate-600'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.projects?.length > 0 && (
                  <div className='bg-slate-50 rounded-lg p-3'>
                    <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'>Projects ({result.projects.length})</p>
                    <div className='space-y-1'>
                      {result.projects.slice(0, 3).map(p => (
                        <div key={p.title} className='flex items-center gap-1.5'>
                          <Star size={11} className='text-amber-400 shrink-0' />
                          <span className='text-xs text-slate-600 truncate'>{p.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() => navigate(`/app/portfolio/builder/${result._id}`)}
                  className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-colors'
                >
                  Edit Portfolio
                </button>
                <button
                  onClick={() => { setStep('idle'); setUsername(''); setProgress([]) }}
                  className='px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors'
                >
                  Analyze Another
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'error' && (() => {
          const errorMsgs = progress.filter(m => m.startsWith('Error:'))
          const lastError = errorMsgs[errorMsgs.length - 1] || ''
          const isRateLimit = lastError.includes('429') || lastError.toLowerCase().includes('rate limit')
          const isSecondaryLimit = lastError.toLowerCase().includes('secondary') || lastError.toLowerCase().includes('rapid')
          const isNotFound = lastError.includes('not found') || lastError.includes('404')
          const resetTimeStr = resetAt
            ? resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null
          const resetMinsAway = resetAt
            ? Math.max(1, Math.ceil((resetAt - Date.now()) / 60000))
            : null
          return (
            <div className='bg-white rounded-2xl border border-red-200 p-8 text-center'>
              <div className='text-red-400 mb-3'>
                <Github size={40} className='mx-auto' />
              </div>
              <h3 className='font-semibold text-slate-800 mb-2'>Analysis Failed</h3>
              <div className='text-sm text-slate-500 mb-3 space-y-1'>
                {errorMsgs.map((m, i) => <p key={i}>{m.replace(/^Error:\s*/, '')}</p>)}
              </div>

              {isSecondaryLimit && (
                <div className='bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 mb-4 text-left'>
                  <p className='font-semibold mb-1'>⚡ Burst limit hit</p>
                  <p className='mb-1.5'>GitHub detected too many rapid requests at once. This is temporary — it resets automatically.</p>
                  {resetTimeStr
                    ? <p>Wait until <strong>{resetTimeStr}</strong> (~{resetMinsAway} min) then try again.</p>
                    : <p>Wait <strong>60 seconds</strong> and try again.</p>
                  }
                </div>
              )}

              {isRateLimit && !isSecondaryLimit && (
                <div className='bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 mb-4 text-left'>
                  <p className='font-semibold mb-1'>⏱ Hourly rate limit hit</p>
                  <p className='mb-1.5'>GitHub allows 60 unauthenticated API requests per hour. Each analysis uses ~7 requests.</p>
                  {resetTimeStr ? (
                    <p className='mb-1.5'>Resets at <strong>{resetTimeStr}</strong> (~{resetMinsAway} min{resetMinsAway !== 1 ? 's' : ''} away).</p>
                  ) : (
                    <p className='mb-1.5'>Wait a minute and try again.</p>
                  )}
                  <p>Or add <code className='bg-amber-100 px-0.5 rounded'>GITHUB_TOKEN</code> to server <code className='bg-amber-100 px-0.5 rounded'>.env</code> to raise the limit to 5 000/hr.</p>
                </div>
              )}
              {isNotFound && (
                <p className='text-xs text-slate-400 mb-4'>Make sure the username is correct and the profile is public.</p>
              )}
              {!isRateLimit && !isSecondaryLimit && !isNotFound && (
                <p className='text-xs text-slate-400 mb-4'>Make sure the username is correct and the profile is public.</p>
              )}
              <button
                onClick={() => { setStep('idle'); setProgress([]); setResetAt(null) }}
                className='px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-colors'
              >
                Try Again
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default GitHubAnalyzer
