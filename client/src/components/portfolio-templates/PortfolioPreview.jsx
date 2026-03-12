import React, { useEffect, useRef, useState } from 'react'
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react'
import { generatePortfolioHTML } from '../../utils/generatePortfolioHTML'

const VIEWPORT_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
}

const PortfolioPreview = ({ portfolio }) => {
  const iframeRef = useRef(null)
  const [viewport, setViewport] = useState('desktop')
  const [key, setKey] = useState(0)

  const html = generatePortfolioHTML(portfolio)

  // Live update without full remount (zero flicker)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(html)
      doc.close()
    }
  }, [html])

  return (
    <div className='flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm'>
      {/* Browser Chrome */}
      <div className='flex items-center justify-between px-3 py-2 bg-slate-200 border-b border-slate-300 shrink-0'>
        {/* Traffic lights */}
        <div className='flex items-center gap-1.5'>
          <span className='w-3 h-3 rounded-full bg-red-400'></span>
          <span className='w-3 h-3 rounded-full bg-yellow-400'></span>
          <span className='w-3 h-3 rounded-full bg-green-400'></span>
        </div>
        {/* URL bar */}
        <div className='flex-1 mx-3'>
          <div className='flex items-center gap-1.5 bg-white rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-300 max-w-xs mx-auto'>
            <svg width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'/></svg>
            <span className='truncate'>{portfolio?.name ? `${portfolio.name.toLowerCase().replace(/\s+/g, '-')}.dev` : 'preview'}</span>
          </div>
        </div>
        {/* Viewport toggles */}
        <div className='flex items-center gap-1'>
          {[
            { id: 'desktop', Icon: Monitor },
            { id: 'tablet',  Icon: Tablet },
            { id: 'mobile',  Icon: Smartphone },
          ].map(({ id, Icon }) => (
            <button
              key={id}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
              onClick={() => setViewport(id)}
              className={`p-1.5 rounded transition-colors ${viewport === id ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon size={14} />
            </button>
          ))}
          <button
            title='Reload preview'
            onClick={() => setKey(k => k + 1)}
            className='p-1.5 rounded text-slate-400 hover:text-slate-600 transition-colors ml-0.5'
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>
      {/* Viewport wrapper */}
      <div className='flex-1 overflow-auto bg-slate-300 flex justify-center'>
        <div
          style={{ width: VIEWPORT_WIDTHS[viewport], minWidth: 0, transition: 'width 0.25s ease' }}
          className='h-full bg-white shadow-xl'
        >
          <iframe
            key={key}
            ref={iframeRef}
            title='Portfolio Preview'
            className='w-full h-full border-none'
            sandbox='allow-scripts allow-same-origin allow-popups'
            srcDoc={html}
          />
        </div>
      </div>
    </div>
  )
}

export default PortfolioPreview
