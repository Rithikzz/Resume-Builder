/**
 * Generates a complete standalone HTML file for a portfolio.
 * Used for:
 *  - iframe srcDoc preview (real website feel)
 *  - GitHub Pages upload
 *  - ZIP download
 */

const esc = (str = '') => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const href = (url = '') => {
  if (!url) return '#'
  return url.startsWith('http') ? url : `https://${url}`
}

/** Returns a CSS colour palette based on chosen theme + accent */
const buildPalette = (theme, accent) => {
  if (theme === 'dark') {
    return {
      bg: '#0f172a',
      surface: '#1e293b',
      surfaceAlt: '#273549',
      border: '#334155',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      navBg: 'rgba(15,23,42,0.92)',
      heroBg: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
      skillBg: '#273549',
      skillText: accent,
      cardBg: '#1e293b',
      accent,
    }
  }
  if (theme === 'minimal') {
    return {
      bg: '#ffffff',
      surface: '#f9fafb',
      surfaceAlt: '#f3f4f6',
      border: '#e5e7eb',
      text: '#111827',
      textMuted: '#6b7280',
      navBg: 'rgba(255,255,255,0.95)',
      heroBg: '#ffffff',
      skillBg: '#f3f4f6',
      skillText: '#374151',
      cardBg: '#ffffff',
      accent,
    }
  }
  if (theme === 'colorful') {
    return {
      bg: '#fafafa',
      surface: '#fff',
      surfaceAlt: `${accent}08`,
      border: `${accent}30`,
      text: '#1a1a2e',
      textMuted: '#555577',
      navBg: `rgba(255,255,255,0.96)`,
      heroBg: `linear-gradient(135deg, ${accent}18 0%, ${accent}05 60%, #fafafa 100%)`,
      skillBg: `${accent}15`,
      skillText: accent,
      cardBg: '#fff',
      accent,
    }
  }
  // default
  return {
    bg: '#f8fafc',
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',
    border: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
    navBg: 'rgba(255,255,255,0.96)',
    heroBg: `linear-gradient(135deg, ${accent}12 0%, ${accent}04 60%, #f8fafc 100%)`,
    skillBg: `${accent}14`,
    skillText: accent,
    cardBg: '#ffffff',
    accent,
  }
}

export const generatePortfolioHTML = (portfolio) => {
  const p = portfolio || {}
  const accent = p.accentColor || '#10b981'
  const theme = p.theme || 'default'
  const c = buildPalette(theme, accent)

  const name = esc(p.name || 'Developer Portfolio')
  const headline = esc(p.headline || '')
  const bio = esc(p.bio || '')
  const email = esc(p.contact?.email || '')
  const phone = esc(p.contact?.phone || '')
  const ghLink = href(p.links?.github)
  const liLink = href(p.links?.linkedin)
  const webLink = href(p.links?.website)
  const twLink = href(p.links?.twitter)
  const hasContact = email || phone || p.links?.github || p.links?.linkedin || p.links?.website

  // Nav sections
  const navItems = []
  if (bio) navItems.push('about')
  if (p.skills?.length) navItems.push('skills')
  if (p.experience?.length) navItems.push('experience')
  if (p.projects?.length) navItems.push('projects')
  if (hasContact) navItems.push('contact')

  // ── Skills section ──────────────────────────────────────────────────────
  const skillsHTML = p.skills?.length ? `
  <section id="skills" class="section">
    <div class="container">
      <h2 class="section-title"><span class="accent-bar"></span>Skills</h2>
      <div class="skills-grid">
        ${p.skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('')}
      </div>
    </div>
  </section>` : ''

  // ── Projects section ─────────────────────────────────────────────────────
  const projectsHTML = p.projects?.length ? `
  <section id="projects" class="section section-alt">
    <div class="container">
      <h2 class="section-title"><span class="accent-bar"></span>Projects</h2>
      <div class="projects-grid">
        ${p.projects.map(proj => `
          <div class="project-card${proj.featured ? ' featured' : ''}">
            ${proj.featured ? `<div class="featured-badge">★ Featured</div>` : ''}
            <div class="project-header">
              <h3 class="project-title">${esc(proj.title || 'Untitled Project')}</h3>
              <div class="project-links">
                ${proj.githubUrl ? `<a href="${href(proj.githubUrl)}" target="_blank" rel="noreferrer" title="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>` : ''}
                ${proj.liveUrl ? `<a href="${href(proj.liveUrl)}" target="_blank" rel="noreferrer" title="Live Demo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>` : ''}
              </div>
            </div>
            ${proj.description ? `<p class="project-desc">${esc(proj.description)}</p>` : ''}
            ${proj.technologies?.length ? `
            <div class="tech-tags">
              ${proj.technologies.map(t => `<span class="tech-tag">${esc(t)}</span>`).join('')}
            </div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''

  // ── Experience section ───────────────────────────────────────────────────
  const expHTML = p.experience?.length ? `
  <section id="experience" class="section">
    <div class="container">
      <h2 class="section-title"><span class="accent-bar"></span>Experience</h2>
      <div class="timeline">
        ${p.experience.map(exp => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <div>
                  <h3 class="role">${esc(exp.role || '')}</h3>
                  <p class="company">${esc(exp.company || '')}</p>
                </div>
                <span class="date">${esc(exp.startDate || '')} – ${exp.current ? 'Present' : esc(exp.endDate || '')}</span>
              </div>
              ${exp.description ? `<p class="exp-desc">${esc(exp.description)}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''

  // ── Education section ────────────────────────────────────────────────────
  const eduHTML = p.education?.length ? `
  <section class="section section-alt">
    <div class="container">
      <h2 class="section-title"><span class="accent-bar"></span>Education</h2>
      <div class="edu-grid">
        ${p.education.map(edu => `
          <div class="edu-card">
            <h3 class="edu-inst">${esc(edu.institution || '')}</h3>
            <p class="edu-degree">${esc(edu.degree || '')}${edu.field ? ` · ${esc(edu.field)}` : ''}</p>
            ${(edu.startYear || edu.endYear) ? `<p class="edu-year">${esc(edu.startYear || '')} – ${esc(edu.endYear || 'Present')}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''

  // ── Contact section ──────────────────────────────────────────────────────
  const contactHTML = hasContact ? `
  <section id="contact" class="section">
    <div class="container contact-container">
      <h2 class="section-title"><span class="accent-bar"></span>Contact</h2>
      <p class="contact-intro">Let's build something together.</p>
      <div class="contact-links">
        ${email ? `<a href="mailto:${esc(email)}" class="contact-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          ${esc(email)}
        </a>` : ''}
        ${phone ? `<a href="tel:${esc(phone)}" class="contact-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.7A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          ${esc(phone)}
        </a>` : ''}
        ${p.links?.github ? `<a href="${ghLink}" target="_blank" rel="noreferrer" class="contact-link social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
          GitHub
        </a>` : ''}
        ${p.links?.linkedin ? `<a href="${liLink}" target="_blank" rel="noreferrer" class="contact-link social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-3a2 2 0 100-4 2 2 0 000 4z"/></svg>
          LinkedIn
        </a>` : ''}
        ${p.links?.website ? `<a href="${webLink}" target="_blank" rel="noreferrer" class="contact-link social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          Website
        </a>` : ''}
        ${p.links?.twitter ? `<a href="${href(p.links.twitter)}" target="_blank" rel="noreferrer" class="contact-link social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Twitter / X
        </a>` : ''}
      </div>
    </div>
  </section>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} · Portfolio</title>
  <meta name="description" content="${headline || bio.slice(0, 160)}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --accent: ${c.accent};
      --bg: ${c.bg};
      --surface: ${c.surface};
      --surface-alt: ${c.surfaceAlt};
      --border: ${c.border};
      --text: ${c.text};
      --text-muted: ${c.textMuted};
      --nav-bg: ${c.navBg};
      --skill-bg: ${c.skillBg};
      --skill-text: ${c.skillText};
      --card-bg: ${c.cardBg};
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }

    /* ── NAV ─────────────────────────────────────────────── */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: var(--nav-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem; height: 60px;
    }
    .nav-brand {
      font-weight: 700; font-size: 1.1rem;
      color: var(--text); text-decoration: none;
    }
    .nav-brand span { color: var(--accent); }
    .nav-links { display: flex; gap: 1.5rem; list-style: none; }
    .nav-links a {
      color: var(--text-muted); text-decoration: none;
      font-size: 0.875rem; font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--accent); }

    /* ── HERO ────────────────────────────────────────────── */
    #hero {
      background: ${c.heroBg};
      padding: 7rem 2rem 5rem;
      border-bottom: 1px solid var(--border);
    }
    .hero-inner { max-width: 800px; margin: 0 auto; }
    .hero-greeting {
      font-size: 0.875rem; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--accent); margin-bottom: 1rem;
    }
    .hero-name {
      font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 800; line-height: 1.1;
      color: var(--text); margin-bottom: 0.75rem;
    }
    .hero-headline {
      font-size: clamp(1rem, 2.5vw, 1.4rem);
      color: var(--accent); font-weight: 500; margin-bottom: 1.5rem;
    }
    .hero-bio {
      font-size: 1.05rem; color: var(--text-muted);
      max-width: 580px; line-height: 1.8; margin-bottom: 2.5rem;
    }
    .hero-cta { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.7rem 1.5rem; border-radius: 8px;
      background: var(--accent); color: #fff;
      font-size: 0.9rem; font-weight: 600; text-decoration: none;
      transition: opacity 0.2s, transform 0.15s;
    }
    .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.7rem 1.5rem; border-radius: 8px;
      background: transparent; color: var(--text);
      border: 1.5px solid var(--border);
      font-size: 0.9rem; font-weight: 600; text-decoration: none;
      transition: border-color 0.2s, color 0.2s;
    }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
    .hero-social { margin-top: 2rem; display: flex; gap: 1rem; }
    .hero-social a {
      color: var(--text-muted); transition: color 0.2s;
      display: flex; align-items: center;
    }
    .hero-social a:hover { color: var(--accent); }

    /* ── SECTIONS ────────────────────────────────────────── */
    .section { padding: 5rem 2rem; }
    .section-alt { background: var(--surface-alt); }
    .container { max-width: 1100px; margin: 0 auto; }
    .section-title {
      font-size: 1.75rem; font-weight: 700;
      color: var(--text); margin-bottom: 2.5rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .accent-bar {
      display: inline-block; width: 4px; height: 1.75rem;
      background: var(--accent); border-radius: 2px; flex-shrink: 0;
    }

    /* ── ABOUT ───────────────────────────────────────────── */
    .about-text {
      font-size: 1.05rem; line-height: 1.85;
      color: var(--text-muted); max-width: 700px;
    }

    /* ── SKILLS ──────────────────────────────────────────── */
    .skills-grid { display: flex; flex-wrap: wrap; gap: 0.625rem; }
    .skill-tag {
      padding: 0.4rem 1rem; border-radius: 9999px;
      background: var(--skill-bg); color: var(--skill-text);
      font-size: 0.85rem; font-weight: 500;
      border: 1px solid var(--border);
      transition: transform 0.15s;
    }
    .skill-tag:hover { transform: translateY(-2px); }

    /* ── PROJECTS ────────────────────────────────────────── */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px; padding: 1.5rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      transition: box-shadow 0.2s, transform 0.15s;
      position: relative; overflow: hidden;
    }
    .project-card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.09);
      transform: translateY(-3px);
    }
    .project-card.featured {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px ${c.accent}40;
    }
    .featured-badge {
      position: absolute; top: 0.75rem; right: 0.75rem;
      font-size: 0.7rem; font-weight: 600;
      color: #d97706; background: #fef3c7;
      padding: 0.2rem 0.55rem; border-radius: 4px;
    }
    .project-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
    .project-title { font-size: 1rem; font-weight: 700; color: var(--text); }
    .project-links { display: flex; gap: 0.5rem; flex-shrink: 0; }
    .project-links a { color: var(--text-muted); transition: color 0.2s; display: flex; align-items: center; }
    .project-links a:hover { color: var(--accent); }
    .project-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; flex: 1; }
    .tech-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: auto; }
    .tech-tag {
      font-size: 0.75rem; padding: 0.2rem 0.55rem;
      background: var(--surface-alt); color: var(--text-muted);
      border: 1px solid var(--border); border-radius: 4px;
    }

    /* ── EXPERIENCE ─────────────────────────────────────── */
    .timeline { position: relative; padding-left: 1.75rem; }
    .timeline::before {
      content: ''; position: absolute; left: 7px; top: 0; bottom: 0;
      width: 2px; background: var(--border);
    }
    .timeline-item { position: relative; margin-bottom: 2.25rem; }
    .timeline-dot {
      position: absolute; left: -1.75rem; top: 0.25rem;
      width: 14px; height: 14px; border-radius: 50%;
      background: var(--accent); border: 2px solid var(--bg);
      box-shadow: 0 0 0 2px var(--accent);
    }
    .timeline-content { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; }
    .timeline-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem; }
    .role { font-size: 1rem; font-weight: 700; color: var(--text); }
    .company { font-size: 0.875rem; color: var(--accent); margin-top: 0.125rem; }
    .date { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
    .exp-desc { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; margin-top: 0.5rem; }

    /* ── EDUCATION ──────────────────────────────────────── */
    .edu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .edu-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; }
    .edu-inst { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
    .edu-degree { font-size: 0.875rem; color: var(--text-muted); }
    .edu-year { font-size: 0.8rem; color: var(--accent); margin-top: 0.25rem; }

    /* ── CONTACT ────────────────────────────────────────── */
    .contact-container { text-align: center; max-width: 600px; margin: 0 auto; }
    .contact-intro { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2rem; }
    .contact-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
    .contact-link {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.25rem; border-radius: 8px;
      background: var(--surface); border: 1.5px solid var(--border);
      color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 500;
      transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;
    }
    .contact-link:hover {
      border-color: var(--accent); color: var(--accent);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    /* ── FOOTER ─────────────────────────────────────────── */
    footer {
      border-top: 1px solid var(--border);
      padding: 1.5rem 2rem; text-align: center;
      font-size: 0.8rem; color: var(--text-muted);
    }

    /* ── RESPONSIVE ─────────────────────────────────────── */
    @media (max-width: 640px) {
      .nav-links { display: none; }
      .timeline-header { flex-direction: column; gap: 0.25rem; }
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav>
    <div class="nav-inner">
      <a class="nav-brand" href="#hero"><span>${name.split(' ')[0]}</span>${name.split(' ').slice(1).map(w => ' ' + esc(w)).join('')}</a>
      <ul class="nav-links">
        ${navItems.map(id => `<li><a href="#${id}">${id.charAt(0).toUpperCase() + id.slice(1)}</a></li>`).join('')}
      </ul>
    </div>
  </nav>

  <!-- HERO -->
  <section id="hero">
    <div class="hero-inner">
      <p class="hero-greeting">Hello, I'm</p>
      <h1 class="hero-name">${name}</h1>
      ${headline ? `<p class="hero-headline">${headline}</p>` : ''}
      ${bio ? `<p class="hero-bio">${bio}</p>` : ''}
      <div class="hero-cta">
        ${p.projects?.length ? `<a href="#projects" class="btn-primary">View My Work</a>` : ''}
        ${hasContact ? `<a href="#contact" class="btn-secondary">Get In Touch</a>` : ''}
      </div>
      <div class="hero-social">
        ${p.links?.github ? `<a href="${ghLink}" target="_blank" rel="noreferrer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
        </a>` : ''}
        ${p.links?.linkedin ? `<a href="${liLink}" target="_blank" rel="noreferrer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-3a2 2 0 100-4 2 2 0 000 4z"/></svg>
        </a>` : ''}
        ${p.links?.twitter ? `<a href="${href(p.links.twitter)}" target="_blank" rel="noreferrer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>` : ''}
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  ${bio ? `
  <section id="about" class="section">
    <div class="container">
      <h2 class="section-title"><span class="accent-bar"></span>About</h2>
      <p class="about-text">${bio}</p>
    </div>
  </section>` : ''}

  <!-- SKILLS -->
  ${skillsHTML}

  <!-- EXPERIENCE -->
  ${expHTML}

  <!-- PROJECTS -->
  ${projectsHTML}

  <!-- EDUCATION -->
  ${eduHTML}

  <!-- CONTACT -->
  ${contactHTML}

  <!-- FOOTER -->
  <footer>
    <p>Built with DocBuilder AI · ${new Date().getFullYear()}</p>
  </footer>

</body>
</html>`
}
