import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Save, Sparkles, Loader, Plus, X, Globe, Github,
  Linkedin, Twitter, ChevronDown, ChevronRight, Eye, EyeOff,
  Download, Copy, GitBranch, ExternalLink, Check, KeyRound,
  Upload, Code2, Folder, RefreshCw
} from 'lucide-react'
import PortfolioPreview from '../components/portfolio-templates/PortfolioPreview'
import { generatePortfolioHTML } from '../utils/generatePortfolioHTML'

const THEMES = ['default', 'dark', 'minimal', 'colorful']

/** Extract a human-readable message from any Axios error */
const errMsg = (e) => {
  const d = e?.response?.data
  return (typeof d === 'string' ? d : d?.message || d?.error)
    || (e?.response?.status === 429 ? 'Rate limit hit — please wait and try again.' : null)
    || e?.message
    || 'Something went wrong'
}

const Section = ({ title, open, onToggle, children, badge }) => (
  <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
    <button
      type='button'
      onClick={onToggle}
      className='w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors'
    >
      <span className='font-semibold text-slate-800 text-sm flex items-center gap-2'>
        {title}
        {badge != null && badge > 0 && (
          <span className='bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-medium'>{badge}</span>
        )}
      </span>
      {open ? <ChevronDown size={16} className='text-slate-400' /> : <ChevronRight size={16} className='text-slate-400' />}
    </button>
    {open && <div className='px-5 pb-5 border-t border-slate-100'>{children}</div>}
  </div>
)

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white'
const labelCls = 'block text-xs font-medium text-slate-600 mb-1 mt-3'

/* ─────────────────────────────────────────────────────────────────────────── */

const PortfolioGenerator = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector(state => state.auth)
  const headers = { Authorization: token }

  // ── Portfolio data ────────────────────────────────────────────────────────
  const [portfolio, setPortfolio] = useState({
    title: '',
    name: '',
    headline: '',
    bio: '',
    contact: { email: '', phone: '' },
    links: { github: '', linkedin: '', website: '', twitter: '' },
    skills: [],
    projects: [],
    experience: [],
    education: [],
    certifications: [],
    theme: 'default',
    accentColor: '#10b981',
    public: false,
  })

  const [openSections, setOpenSections] = useState({
    personal: true, links: false, skills: false, projects: false,
    experience: false, education: false, certifications: false, theme: false,
    ghImport: false,
  })

  const [saving, setSaving]     = useState(false)
  const [enhancing, setEnhancing] = useState(false)

  // ── GitHub import ─────────────────────────────────────────────────────────
  const [ghImportUser, setGhImportUser]   = useState('')
  const [ghImportRepos, setGhImportRepos] = useState([])
  const [ghImportLoading, setGhImportLoading] = useState(false)
  const [ghImportSelected, setGhImportSelected] = useState(new Set())

  // ── Publish panel ─────────────────────────────────────────────────────────
  const [showPublish, setShowPublish] = useState(false)
  const [ghToken, setGhToken]       = useState('')
  const [publishing, setPublishing] = useState(false)
  const [repoResult, setRepoResult] = useState(null) // { repoUrl, cloneUrl }
  const [copied, setCopied] = useState(false)

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }))
  const set = (key, val) => setPortfolio(p => ({ ...p, [key]: val }))
  const setNested = (parent, key, val) => setPortfolio(p => ({ ...p, [parent]: { ...p[parent], [key]: val } }))

  // ── Load existing portfolio ───────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const { data } = await api.get(`/api/portfolios/${id}`, { headers })
        setPortfolio(data.portfolio)
      } catch {
        toast.error('Failed to load portfolio')
        navigate('/app')
      }
    }
    load()
  }, [id])

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!id) return
    setSaving(true)
    try {
      await api.put(`/api/portfolios/update/${id}`, portfolio, { headers })
      toast.success('Saved!')
    } catch (e) {
      toast.error(errMsg(e))
    }
    setSaving(false)
  }, [id, portfolio])

  // ── AI Enhance ────────────────────────────────────────────────────────────
  const aiEnhance = async () => {
    if (!id) return
    setEnhancing(true)
    try {
      await save()
      const { data } = await api.post(`/api/portfolios/ai-enhance/${id}`, {}, { headers })
      setPortfolio(p => ({
        ...p,
        bio: data.bio || p.bio,
        headline: data.headline || p.headline,
      }))
      toast.success('AI enhanced bio and headline!')
    } catch (e) {
      toast.error(errMsg(e))
    }
    setEnhancing(false)
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const addSkill = (skill) => {
    if (!skill.trim() || portfolio.skills.includes(skill.trim())) return
    set('skills', [...portfolio.skills, skill.trim()])
  }
  const removeSkill = (s) => set('skills', portfolio.skills.filter(x => x !== s))

  // ── Projects ──────────────────────────────────────────────────────────────
  const addProject     = () => set('projects', [...portfolio.projects, { title: '', description: '', technologies: [], githubUrl: '', liveUrl: '', featured: false }])
  const updateProject  = (i, key, val) => set('projects', portfolio.projects.map((p, idx) => idx === i ? { ...p, [key]: val } : p))
  const removeProject  = (i) => set('projects', portfolio.projects.filter((_, idx) => idx !== i))

  // ── Experience ────────────────────────────────────────────────────────────
  const addExp    = () => set('experience', [...portfolio.experience, { company: '', role: '', startDate: '', endDate: '', current: false, description: '' }])
  const updateExp = (i, key, val) => set('experience', portfolio.experience.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
  const removeExp = (i) => set('experience', portfolio.experience.filter((_, idx) => idx !== i))

  // ── Education ─────────────────────────────────────────────────────────────
  const addEdu    = () => set('education', [...portfolio.education, { institution: '', degree: '', field: '', startYear: '', endYear: '', current: false }])
  const updateEdu = (i, key, val) => set('education', portfolio.education.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
  const removeEdu = (i) => set('education', portfolio.education.filter((_, idx) => idx !== i))

  // ── Certifications ────────────────────────────────────────────────────────
  const addCert    = () => set('certifications', [...portfolio.certifications, { name: '', issuer: '', year: '', url: '' }])
  const updateCert = (i, key, val) => set('certifications', portfolio.certifications.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  const removeCert = (i) => set('certifications', portfolio.certifications.filter((_, idx) => idx !== i))

  // ── GitHub repo import ────────────────────────────────────────────────────
  const fetchGhRepos = async () => {
    const raw = ghImportUser.trim()
    if (!raw) return
    const user = raw.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/[/?#].*$/, '').trim()
    setGhImportLoading(true)
    setGhImportRepos([])
    setGhImportSelected(new Set())
    try {
      const { data } = await api.get(`/api/portfolios/github-repos?username=${encodeURIComponent(user)}`, { headers })
      setGhImportRepos(data.repos || [])
      if (!data.repos?.length) toast('No public repos found for that username', { icon: '⚠️' })
    } catch (e) {
      const rawData = e?.response?.data
      const msg = (typeof rawData === 'string' ? rawData : rawData?.message)
        || (e?.response?.status === 429 ? 'Rate limit hit — wait 1 min and try again.' : null)
        || 'Failed to fetch repos'
      toast.error(msg)
    }
    setGhImportLoading(false)
  }

  const toggleRepoSelect = (name) => setGhImportSelected(prev => {
    const next = new Set(prev)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })

  const importSelectedRepos = () => {
    const toImport = ghImportRepos
      .filter(r => ghImportSelected.has(r.name))
      .map(r => ({
        title: r.name,
        description: r.description || '',
        technologies: [r.language, ...(r.topics || [])].filter(Boolean).slice(0, 6),
        githubUrl: r.url,
        liveUrl: r.homepage || '',
        featured: r.stars >= 2,
      }))
    // Merge — skip repos already in projects (by githubUrl)
    const existingUrls = new Set(portfolio.projects.map(p => p.githubUrl).filter(Boolean))
    const fresh = toImport.filter(p => !existingUrls.has(p.githubUrl))
    set('projects', [...portfolio.projects, ...fresh])
    toast.success(`Added ${fresh.length} project${fresh.length !== 1 ? 's' : ''}`)
    setGhImportSelected(new Set())
    setOpenSections(s => ({ ...s, projects: true, ghImport: false }))
  }

  // ── Download HTML ─────────────────────────────────────────────────────────
  const downloadHTML = () => {
    const html = generatePortfolioHTML(portfolio)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(portfolio.name || 'portfolio').toLowerCase().replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  // ── Create GitHub Repo ────────────────────────────────────────────────────
  const publishToGitHub = async () => {
    if (!ghToken.trim()) { toast.error('Paste your GitHub Personal Access Token first'); return }
    setPublishing(true)
    setRepoResult(null)
    try {
      await save()
      const html = generatePortfolioHTML(portfolio)
      const { data } = await api.post(
        `/api/portfolios/github-publish/${id}`,
        { githubToken: ghToken.trim(), html },
        { headers }
      )
      setRepoResult(data)
      toast.success('Repo created and portfolio pushed!')
    } catch (e) {
      toast.error(errMsg(e))
    }
    setPublishing(false)
  }

  const copyClone = () => {
    if (!repoResult?.cloneUrl) return
    navigator.clipboard.writeText(`git clone ${repoResult.cloneUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Public share link ─────────────────────────────────────────────────────
  const shareUrl = id ? `${window.location.origin}/portfolio/${id}` : null

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className='min-h-screen bg-slate-50 flex flex-col'>
      {/* ── Header ── */}
      <div className='sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 shrink-0'>
        <button onClick={() => navigate('/app')} className='p-1.5 rounded-lg hover:bg-slate-100 transition-colors'>
          <ArrowLeft size={18} className='text-slate-600' />
        </button>
        <input
          value={portfolio.title}
          onChange={e => set('title', e.target.value)}
          onBlur={save}
          placeholder='Portfolio Title'
          className='flex-1 text-base font-semibold bg-transparent focus:outline-none text-slate-800 placeholder-slate-300'
        />
        <button
          onClick={() => setShowPublish(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 border text-sm rounded-lg transition-colors ${showPublish ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Upload size={14} />
          Publish
        </button>
        <button
          onClick={aiEnhance}
          disabled={enhancing}
          className='flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm rounded-lg hover:shadow-md transition-all disabled:opacity-60'
        >
          {enhancing ? <Loader size={14} className='animate-spin' /> : <Sparkles size={14} />}
          {enhancing ? 'Enhancing…' : 'AI Enhance'}
        </button>
        <button
          onClick={save}
          disabled={saving}
          className='flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-60'
        >
          {saving ? <Loader size={14} className='animate-spin' /> : <Save size={14} />}
          Save
        </button>
      </div>

      {/* ── Publish panel (collapsible) ── */}
      {showPublish && (
        <div className='bg-white border-b border-slate-200 px-6 py-4'>
          <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4'>

            {/* Download HTML */}
            <button
              onClick={downloadHTML}
              className='flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group'
            >
              <div className='w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200'>
                <Download size={18} className='text-emerald-600' />
              </div>
              <div>
                <p className='font-semibold text-sm text-slate-800'>Download HTML</p>
                <p className='text-xs text-slate-500'>Get a standalone HTML file</p>
              </div>
            </button>

            {/* Copy Public Link */}
            {portfolio.public && shareUrl && (
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!') }}
                className='flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group'
              >
                <div className='w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200'>
                  <Globe size={18} className='text-blue-600' />
                </div>
                <div>
                  <p className='font-semibold text-sm text-slate-800'>Copy Share Link</p>
                  <p className='text-xs text-slate-500 truncate max-w-[180px]'>{shareUrl}</p>
                </div>
              </button>
            )}

            {/* Create GitHub Repo */}
            <div className='border border-slate-200 rounded-xl p-4 md:col-span-1 space-y-3'>
              <div className='flex items-center gap-2'>
                <div className='w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0'>
                  <Github size={18} className='text-slate-700' />
                </div>
                <div>
                  <p className='font-semibold text-sm text-slate-800'>Create GitHub Repo</p>
                  <p className='text-xs text-slate-500'>Push portfolio to GitHub</p>
                </div>
              </div>
              {!repoResult ? (
                <>
                  <div className='flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5'>
                    <KeyRound size={12} className='text-slate-400 shrink-0' />
                    <input
                      type='password'
                      value={ghToken}
                      onChange={e => setGhToken(e.target.value)}
                      placeholder='GitHub Personal Access Token'
                      className='flex-1 text-xs focus:outline-none bg-transparent'
                    />
                  </div>
                  <p className='text-xs text-slate-400'>Needs <code>repo</code> scope. Token is never stored.</p>
                  <button
                    onClick={publishToGitHub}
                    disabled={publishing || !ghToken.trim()}
                    className='w-full flex items-center justify-center gap-2 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50'
                  >
                    {publishing ? <Loader size={14} className='animate-spin' /> : <Upload size={14} />}
                    {publishing ? 'Creating…' : 'Create & Push'}
                  </button>
                </>
              ) : (
                <div className='space-y-2'>
                  <a
                    href={repoResult.repoUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-1.5 text-sm text-emerald-600 hover:underline font-medium'
                  >
                    <ExternalLink size={13} /> Open Repository
                  </a>
                  {repoResult.pagesUrl && (
                    <a
                      href={repoResult.pagesUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='flex items-center gap-1.5 text-sm text-indigo-600 hover:underline'
                    >
                      <Globe size={13} /> View Live Site (GitHub Pages)
                    </a>
                  )}
                  <div className='flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5'>
                    <Code2 size={12} className='text-slate-400 shrink-0' />
                    <code className='text-xs text-slate-600 flex-1 truncate'>git clone {repoResult.cloneUrl}</code>
                    <button onClick={copyClone} className='shrink-0 text-slate-400 hover:text-slate-700'>
                      {copied ? <Check size={13} className='text-emerald-500' /> : <Copy size={13} />}
                    </button>
                  </div>
                  <button
                    onClick={() => { setRepoResult(null); setGhToken('') }}
                    className='text-xs text-slate-400 hover:text-slate-600'
                  >
                    Create another repo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Two-panel body ── */}
      <div className='flex-1 flex overflow-hidden'>

        {/* ── LEFT — Form ── */}
        <div className='w-full lg:w-1/2 xl:w-2/5 overflow-y-auto px-4 py-5 space-y-4 shrink-0'>

          {/* GitHub Import */}
          <Section title='GitHub Import' open={openSections.ghImport} onToggle={() => toggleSection('ghImport')}>
            <p className='text-xs text-slate-500 mt-3 mb-3'>Enter a GitHub username to browse and import repositories as projects.</p>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Github size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  value={ghImportUser}
                  onChange={e => setGhImportUser(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchGhRepos()}
                  placeholder='github.com/username or just username'
                  className='w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400'
                />
              </div>
              <button
                onClick={fetchGhRepos}
                disabled={ghImportLoading || !ghImportUser.trim()}
                className='px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50'
              >
                {ghImportLoading ? <Loader size={14} className='animate-spin' /> : <RefreshCw size={14} />}
              </button>
            </div>

            {ghImportRepos.length > 0 && (
              <>
                <div className='mt-3 space-y-1.5 max-h-56 overflow-y-auto'>
                  {ghImportRepos.map(repo => (
                    <label key={repo.name} className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${ghImportSelected.has(repo.name) ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input
                        type='checkbox'
                        checked={ghImportSelected.has(repo.name)}
                        onChange={() => toggleRepoSelect(repo.name)}
                        className='mt-0.5 rounded'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium text-slate-800 truncate'>{repo.name}</span>
                          {repo.stars > 0 && <span className='text-xs text-amber-500'>★ {repo.stars}</span>}
                        </div>
                        {repo.description && <p className='text-xs text-slate-500 truncate'>{repo.description}</p>}
                        {repo.language && <span className='text-xs text-slate-400'>{repo.language}</span>}
                      </div>
                    </label>
                  ))}
                </div>
                {ghImportSelected.size > 0 && (
                  <button
                    onClick={importSelectedRepos}
                    className='mt-3 w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600'
                  >
                    <Folder size={14} />
                    Import {ghImportSelected.size} repo{ghImportSelected.size !== 1 ? 's' : ''} as projects
                  </button>
                )}
              </>
            )}
          </Section>

          {/* Personal Info */}
          <Section title='Personal Info' open={openSections.personal} onToggle={() => toggleSection('personal')}>
            <label className={labelCls}>Display Name</label>
            <input value={portfolio.name} onChange={e => set('name', e.target.value)} placeholder='John Doe' className={inputCls} />
            <label className={labelCls}>Headline / Role</label>
            <input value={portfolio.headline} onChange={e => set('headline', e.target.value)} placeholder='Full-Stack Developer & Open Source Enthusiast' className={inputCls} />
            <label className={labelCls}>Bio</label>
            <textarea value={portfolio.bio} onChange={e => set('bio', e.target.value)} placeholder='A short description about yourself…' rows={4} className={`${inputCls} resize-none`} />
            <label className={labelCls}>Email</label>
            <input value={portfolio.contact?.email || ''} onChange={e => setNested('contact', 'email', e.target.value)} placeholder='john@example.com' className={inputCls} type='email' />
            <label className={labelCls}>Phone</label>
            <input value={portfolio.contact?.phone || ''} onChange={e => setNested('contact', 'phone', e.target.value)} placeholder='+1 234 567 8900' className={inputCls} />
          </Section>

          {/* Social Links */}
          <Section title='Social Links' open={openSections.links} onToggle={() => toggleSection('links')}>
            {[
              { key: 'github',   icon: Github,   placeholder: 'github.com/username' },
              { key: 'linkedin', icon: Linkedin,  placeholder: 'linkedin.com/in/username' },
              { key: 'website',  icon: Globe,     placeholder: 'yoursite.com' },
              { key: 'twitter',  icon: Twitter,   placeholder: 'twitter.com/username' },
            ].map(({ key, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className={labelCls + ' flex items-center gap-1'}>
                  <Icon size={12} />{key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input value={portfolio.links?.[key] || ''} onChange={e => setNested('links', key, e.target.value)} placeholder={placeholder} className={inputCls} />
              </div>
            ))}
          </Section>

          {/* Skills */}
          <Section title='Skills' open={openSections.skills} onToggle={() => toggleSection('skills')} badge={portfolio.skills.length}>
            <div className='flex flex-wrap gap-2 mt-3 mb-3'>
              {portfolio.skills.map(s => (
                <span key={s} className='flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1 rounded-full'>
                  {s}
                  <button type='button' onClick={() => removeSkill(s)}><X size={11} /></button>
                </span>
              ))}
            </div>
            <div className='flex gap-2'>
              <input
                id='skill-input'
                placeholder='Add skill and press Enter…'
                className={inputCls}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(e.target.value); e.target.value = '' } }}
              />
              <button type='button'
                onClick={() => { const el = document.getElementById('skill-input'); addSkill(el.value); el.value = '' }}
                className='px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600'
              >
                <Plus size={15} />
              </button>
            </div>
          </Section>

          {/* Projects */}
          <Section title='Projects' open={openSections.projects} onToggle={() => toggleSection('projects')} badge={portfolio.projects.length}>
            {portfolio.projects.map((proj, i) => (
              <div key={i} className='border border-slate-200 rounded-lg p-4 mt-3 relative'>
                <button type='button' onClick={() => removeProject(i)} className='absolute top-3 right-3 text-slate-300 hover:text-red-400'>
                  <X size={14} />
                </button>
                <label className={labelCls}>Project Title</label>
                <input value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} placeholder='My Awesome Project' className={inputCls} />
                <label className={labelCls}>Description</label>
                <textarea value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} placeholder='What does this project do?' rows={2} className={`${inputCls} resize-none`} />
                <label className={labelCls}>Technologies (comma-separated)</label>
                <input value={(proj.technologies || []).join(', ')} onChange={e => updateProject(i, 'technologies', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} placeholder='React, Node.js, MongoDB' className={inputCls} />
                <div className='grid grid-cols-2 gap-3 mt-2'>
                  <div>
                    <label className={labelCls}>GitHub URL</label>
                    <input value={proj.githubUrl || ''} onChange={e => updateProject(i, 'githubUrl', e.target.value)} placeholder='https://github.com/…' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Live URL</label>
                    <input value={proj.liveUrl || ''} onChange={e => updateProject(i, 'liveUrl', e.target.value)} placeholder='https://…' className={inputCls} />
                  </div>
                </div>
                <label className='flex items-center gap-2 mt-3 cursor-pointer'>
                  <input type='checkbox' checked={proj.featured || false} onChange={e => updateProject(i, 'featured', e.target.checked)} className='rounded' />
                  <span className='text-xs text-slate-600'>Featured project</span>
                </label>
              </div>
            ))}
            <button type='button' onClick={addProject} className='mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700'>
              <Plus size={15} /> Add Project
            </button>
          </Section>

          {/* Experience */}
          <Section title='Experience' open={openSections.experience} onToggle={() => toggleSection('experience')} badge={portfolio.experience.length}>
            {portfolio.experience.map((exp, i) => (
              <div key={i} className='border border-slate-200 rounded-lg p-4 mt-3 relative'>
                <button type='button' onClick={() => removeExp(i)} className='absolute top-3 right-3 text-slate-300 hover:text-red-400'><X size={14} /></button>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder='Google' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <input value={exp.role} onChange={e => updateExp(i, 'role', e.target.value)} placeholder='Software Engineer' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input value={exp.startDate} onChange={e => updateExp(i, 'startDate', e.target.value)} placeholder='Jan 2020' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input value={exp.endDate} onChange={e => updateExp(i, 'endDate', e.target.value)} placeholder='Present' className={inputCls} disabled={exp.current} />
                  </div>
                </div>
                <label className='flex items-center gap-2 mt-2 cursor-pointer'>
                  <input type='checkbox' checked={exp.current || false} onChange={e => updateExp(i, 'current', e.target.checked)} className='rounded' />
                  <span className='text-xs text-slate-600'>Currently working here</span>
                </label>
                <label className={labelCls}>Description</label>
                <textarea value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
              </div>
            ))}
            <button type='button' onClick={addExp} className='mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700'>
              <Plus size={15} /> Add Experience
            </button>
          </Section>

          {/* Education */}
          <Section title='Education' open={openSections.education} onToggle={() => toggleSection('education')} badge={portfolio.education.length}>
            {portfolio.education.map((edu, i) => (
              <div key={i} className='border border-slate-200 rounded-lg p-4 mt-3 relative'>
                <button type='button' onClick={() => removeEdu(i)} className='absolute top-3 right-3 text-slate-300 hover:text-red-400'><X size={14} /></button>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='col-span-2'>
                    <label className={labelCls}>Institution</label>
                    <input value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder='MIT' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Degree</label>
                    <input value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="Bachelor's" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Field</label>
                    <input value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} placeholder='Computer Science' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Year</label>
                    <input value={edu.startYear} onChange={e => updateEdu(i, 'startYear', e.target.value)} placeholder='2016' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Year</label>
                    <input value={edu.endYear} onChange={e => updateEdu(i, 'endYear', e.target.value)} placeholder='2020' className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
            <button type='button' onClick={addEdu} className='mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700'>
              <Plus size={15} /> Add Education
            </button>
          </Section>

          {/* Certifications */}
          <Section title='Certifications' open={openSections.certifications} onToggle={() => toggleSection('certifications')} badge={portfolio.certifications.length}>
            {portfolio.certifications.map((cert, i) => (
              <div key={i} className='border border-slate-200 rounded-lg p-4 mt-3 relative'>
                <button type='button' onClick={() => removeCert(i)} className='absolute top-3 right-3 text-slate-300 hover:text-red-400'><X size={14} /></button>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='col-span-2'>
                    <label className={labelCls}>Certificate Name</label>
                    <input value={cert.name} onChange={e => updateCert(i, 'name', e.target.value)} placeholder='AWS Solutions Architect' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Issuer</label>
                    <input value={cert.issuer} onChange={e => updateCert(i, 'issuer', e.target.value)} placeholder='Amazon' className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Year</label>
                    <input value={cert.year} onChange={e => updateCert(i, 'year', e.target.value)} placeholder='2023' className={inputCls} />
                  </div>
                  <div className='col-span-2'>
                    <label className={labelCls}>URL (optional)</label>
                    <input value={cert.url} onChange={e => updateCert(i, 'url', e.target.value)} placeholder='https://…' className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
            <button type='button' onClick={addCert} className='mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700'>
              <Plus size={15} /> Add Certification
            </button>
          </Section>

          {/* Theme */}
          <Section title='Theme & Colors' open={openSections.theme} onToggle={() => toggleSection('theme')}>
            <div className='mt-3'>
              <label className={labelCls}>Theme</label>
              <div className='flex gap-2 flex-wrap'>
                {THEMES.map(t => (
                  <button key={t} type='button'
                    onClick={() => set('theme', t)}
                    className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all
                      ${portfolio.theme === t ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <label className={labelCls}>Accent Color</label>
              <div className='flex items-center gap-3'>
                <input type='color' value={portfolio.accentColor} onChange={e => set('accentColor', e.target.value)} className='h-9 w-16 rounded-lg border border-slate-200 cursor-pointer' />
                <input value={portfolio.accentColor} onChange={e => set('accentColor', e.target.value)} placeholder='#10b981' className={`${inputCls} flex-1`} />
              </div>
              <label className='flex items-center gap-2 mt-4 cursor-pointer'>
                <input type='checkbox' checked={portfolio.public || false} onChange={e => set('public', e.target.checked)} className='rounded' />
                <span className='text-xs text-slate-600'>Make portfolio public (shareable link)</span>
              </label>
            </div>
          </Section>

          <div className='h-8' /> {/* bottom padding */}
        </div>

        {/* ── RIGHT — Live Preview ── */}
        <div className='hidden lg:flex flex-1 flex-col p-4 overflow-hidden'>
          <PortfolioPreview portfolio={portfolio} />
        </div>
      </div>
    </div>
  )
}

export default PortfolioGenerator
