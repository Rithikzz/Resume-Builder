/**
 * Portfolio Controller
 */
import Portfolio from '../models/Portfolio.js';
import { generateContent, generateJSON, handleAIError } from '../services/aiService.js';
import { analyzeProfile } from '../services/githubService.js';
import portfolioPlugin from '../plugins/portfolioPlugin.js';

// POST /api/portfolios/create
export const createPortfolio = async (req, res) => {
    try {
        const { title, name } = req.body;
        const portfolio = await Portfolio.create({ userId: req.userId, title, name });
        return res.status(201).json({ message: 'Portfolio created', portfolio });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET /api/portfolios/all
export const getUserPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.userId }).sort({ updatedAt: -1 });
        return res.status(200).json({ portfolios });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET /api/portfolios/get/:id
export const getPortfolioById = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.userId });
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
        return res.status(200).json({ portfolio });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET /api/portfolios/public/:id
export const getPublicPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, public: true });
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
        return res.status(200).json({ portfolio });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// PUT /api/portfolios/update/:id
export const updatePortfolio = async (req, res) => {
    try {
        const updateData = req.body;
        delete updateData._id;
        const portfolio = await Portfolio.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updateData,
            { new: true }
        );
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });
        return res.status(200).json({ message: 'Saved successfully', portfolio });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// DELETE /api/portfolios/delete/:id
export const deletePortfolio = async (req, res) => {
    try {
        await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        return res.status(200).json({ message: 'Portfolio deleted' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// POST /api/portfolios/ai-enhance/:id
// Uses AI to generate bio, headline, and project descriptions
export const aiEnhancePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.userId });
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        const context = `Name: ${portfolio.name}, Skills: ${portfolio.skills?.join(', ')}, Bio: ${portfolio.bio}`;

        const [headline, bio] = await Promise.all([
            generateContent(portfolioPlugin.aiPrompts.generateHeadline, context),
            portfolio.bio
                ? generateContent(portfolioPlugin.aiPrompts.generateBio, `Current bio: ${portfolio.bio}. Skills: ${portfolio.skills?.join(', ')}`)
                : generateContent(portfolioPlugin.aiPrompts.generateBio, context)
        ]);

        portfolio.headline = headline.trim();
        portfolio.bio = bio.trim();
        await portfolio.save();

        return res.status(200).json({
            message: 'Portfolio enhanced with AI',
            bio: portfolio.bio,
            headline: portfolio.headline,
            portfolio
        });
    } catch (error) {
        return handleAIError(error, res);
    }
};

// POST /api/portfolios/from-github
// Builds a complete portfolio from a GitHub username.
// Uses GraphQL (1 request) when GITHUB_TOKEN is set -- avoids secondary rate limit entirely.
export const createFromGithub = async (req, res) => {
    try {
        const { title } = req.body;
        // Strip full GitHub URLs defensively (e.g. https://github.com/user -> user)
        const githubUsername = (req.body.githubUsername || '')
            .replace(/^(https?:\/\/)?(?:www\.)?github\.com\//i, '')
            .replace(/[/?#].*$/, '')
            .trim();
        if (!githubUsername) return res.status(400).json({ message: 'GitHub username is required' });

        // Step 1: Fetch everything from GitHub
        // With GITHUB_TOKEN: single GraphQL request (profile + repos + languages + README).
        // Without token:     sequential REST calls with delays (slow, rate-limit-prone).
        const { profile, repos, languages } = await analyzeProfile(githubUsername);

        // Step 2: Pick top repos for AI analysis (data already included from GraphQL)
        const topRepos = repos.slice(0, 3);

        // Step 3: AI-generate project cards SEQUENTIALLY.
        // aiService handles Gemini → Groq fallback automatically on 429.
        // 7s between calls keeps us within Gemini's free-tier RPM limit.
        const AI_DELAY_MS = 7000;
        const aiProjects = [];
        for (const repo of topRepos) {
            try {
                const langDetail = repo.languageBreakdown?.length
                    ? repo.languageBreakdown.map(l => `${l.lang} ${l.pct}%`).join(', ')
                    : repo.language || 'unknown';

                const repoContext = [
                    `Repository: ${repo.name}`,
                    `Description: ${repo.description || 'No description'}`,
                    `Primary Language: ${repo.language || 'N/A'}`,
                    `Language Breakdown: ${langDetail}`,
                    `Topics/Tags: ${(repo.topics || []).join(', ') || 'none'}`,
                    `Stars: ${repo.stars} | Forks: ${repo.forks}`,
                    `Live URL: ${repo.homepage || 'none'}`,
                    `License: ${repo.license || 'none'}`,
                    `Last pushed: ${repo.pushedAt?.slice(0, 10) || 'unknown'}`,
                    `README excerpt:\n${repo.readme?.slice(0, 1200) || 'No README available'}`,
                ].join('\n');

                const result = await generateJSON(
                    portfolioPlugin.aiPrompts.analyzeGithubRepo,
                    repoContext
                );
                aiProjects.push({
                    title: result.title || repo.name,
                    description: result.description || repo.description || '',
                    technologies: result.technologies?.length
                        ? result.technologies
                        : [repo.language, ...(repo.topics || []).slice(0, 4)].filter(Boolean),
                    githubUrl: repo.url,
                    liveUrl: repo.homepage || '',
                    featured: typeof result.featured === 'boolean' ? result.featured : (repo.stars >= 2 || repo.forks >= 1),
                    stars: repo.stars,
                });
            } catch {
                // Fallback if AI fails for one repo
                const techs = repo.languageBreakdown?.length
                    ? repo.languageBreakdown.map(l => l.lang)
                    : [repo.language, ...(repo.topics || []).slice(0, 3)].filter(Boolean);
                aiProjects.push({
                    title: repo.name,
                    description: repo.description || '',
                    technologies: techs,
                    githubUrl: repo.url,
                    liveUrl: repo.homepage || '',
                    featured: repo.stars >= 2 || repo.forks >= 1,
                    stars: repo.stars,
                });
            }
            // Delay between AI calls to stay within Gemini's 10 RPM quota
            if (topRepos.indexOf(repo) < topRepos.length - 1) {
                await new Promise(r => setTimeout(r, AI_DELAY_MS));
            }
        }

        // Step 4: AI-generate bio and headline sequentially
        const topLangs = languages.slice(0, 12).join(', ');
        const notableProjects = aiProjects.slice(0, 4).map(p => p.title).join(', ');
        const yrsOnGitHub = profile.createdAt
            ? new Date().getFullYear() - new Date(profile.createdAt).getFullYear()
            : null;

        const bioContext = [
            `Name: ${profile.name}`,
            profile.bio                  ? `GitHub bio: ${profile.bio}` : '',
            profile.company              ? `Company/Organization: ${profile.company}` : '',
            profile.location             ? `Location: ${profile.location}` : '',
            `Top languages/technologies: ${topLangs}`,
            `Public repositories: ${profile.publicRepos}`,
            yrsOnGitHub !== null         ? `Years on GitHub: ${yrsOnGitHub}` : '',
            `Followers: ${profile.followers}`,
            `Notable projects: ${notableProjects}`,
            profile.twitterUsername      ? `Twitter: @${profile.twitterUsername}` : '',
        ].filter(Boolean).join('\n');

        const headline = await generateContent(portfolioPlugin.aiPrompts.generateHeadline, bioContext);
        await new Promise(r => setTimeout(r, AI_DELAY_MS));
        const bio = await generateContent(portfolioPlugin.aiPrompts.generateBio, bioContext);

        // Step 5: Build skills list from languages + topics
        const allTopics = new Set();
        topRepos.forEach(r => r.topics.forEach(t => allTopics.add(t)));
        const skills = [
            ...languages.slice(0, 10),
            ...[...allTopics].filter(t => !languages.includes(t)).slice(0, 8),
        ].slice(0, 18);

        // Step 6: Persist portfolio
        const portfolio = await Portfolio.create({
            userId: req.userId,
            title: title || `${profile.name}'s Portfolio`,
            sourceType: 'github',
            githubUsername: profile.username,
            name: profile.name,
            headline: headline.trim(),
            bio: bio.trim(),
            location: profile.location || '',
            avatar: profile.avatar || '',
            contact: {
                email: profile.email || '',
                phone: '',
            },
            links: {
                github: profile.profileUrl || '',
                website: profile.blog || '',
                linkedin: '',
                twitter: profile.twitterUsername
                    ? `https://twitter.com/${profile.twitterUsername}` : '',
            },
            skills,
            projects: aiProjects,
        });

        return res.status(201).json({
            message: 'Portfolio generated from GitHub!',
            portfolio,
        });
    } catch (error) {
        const status = error.response?.status;
        const headers = error.response?.headers || {};

        if (status === 404) {
            return res.status(404).json({ message: `GitHub user "${ (req.body.githubUsername || '').replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '').replace(/[/?#].*$/, '').trim() }" not found.` });
        }

        // Check if this is an AI (Gemini) rate limit error — these come from openai SDK, not GitHub
        const isAI429 = error.message?.includes('429 status code') || error.constructor?.name === 'RateLimitError';
        if (isAI429) {
            return res.status(429).json({
                message: 'AI service is busy. Please wait a moment and try again.',
                resetAt: null,
                retryAfter: 30000,
                isSecondary: false,
            });
        }

        // GitHub rate limit errors (from axios responses — actual HTTP 429 from api.github.com)
        if (status === 429) {
            const remaining = headers['x-ratelimit-remaining'];
            const resetUnix  = headers['x-ratelimit-reset'];
            const retryAfter = headers['retry-after'];
            const resetAt    = resetUnix ? new Date(Number(resetUnix) * 1000).toISOString() : null;
            const retryMs    = retryAfter ? Number(retryAfter) * 1000 : null;
            const isSecondary = remaining === undefined;
            let message;
            if (isSecondary) {
                const waitSec = retryAfter || 60;
                message = `GitHub rate limit: too many rapid requests. Please wait ${waitSec}s and try again.`;
            } else if (process.env.GITHUB_TOKEN) {
                message = `GitHub API rate limit reached (${remaining || 0} remaining). Resets at ${resetAt ? new Date(resetAt).toLocaleTimeString() : 'soon'}.`;
            } else {
                message = 'GitHub API rate limit exceeded (60 req/hr). Add GITHUB_TOKEN to server .env for 5000 req/hr.';
            }
            return res.status(429).json({ message, resetAt, retryAfter: retryMs, isSecondary });
        }
        if (error.message?.includes('AI')) return handleAIError(error, res);
        return res.status(400).json({ message: error.message || 'Failed to generate portfolio from GitHub' });
    }
};
// GET /api/portfolios/github-repos?username=<user>
// Fetches public repos for GitHub import (no auth token required for public repos)
export const getGithubRepos = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ message: 'username query param required' });

        const { fetchRepositories } = await import('../services/githubService.js');
        const repos = await fetchRepositories(username, 50);
        return res.status(200).json({ repos });
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ message: `GitHub user "${req.query.username}" not found.` });
        }
        return res.status(400).json({ message: error.message });
    }
};

// POST /api/portfolios/github-publish/:id
// Creates a new GitHub repo named portfolio-<username> and pushes the HTML file
export const publishToGithub = async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.userId });
        if (!portfolio) return res.status(404).json({ message: 'Portfolio not found' });

        const { githubToken, html } = req.body;
        if (!githubToken) return res.status(400).json({ message: 'githubToken is required' });
        if (!html) return res.status(400).json({ message: 'html is required' });

        const axios = (await import('axios')).default;

        // 1. Get authenticated user info
        const { data: ghUser } = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' }
        });

        const repoName = `portfolio-${ghUser.login}`;

        // 2. Create repo (ignore 422 = already exists)
        let repoData;
        try {
            const { data } = await axios.post(
                'https://api.github.com/user/repos',
                {
                    name: repoName,
                    description: `${portfolio.name || ghUser.login}'s developer portfolio — generated by DocBuilder AI`,
                    homepage: `https://${ghUser.login}.github.io/${repoName}`,
                    auto_init: false,
                    visibility: 'public'
                },
                { headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' } }
            );
            repoData = data;
        } catch (createErr) {
            if (createErr.response?.status === 422) {
                // Repo already exists — fetch it
                const { data } = await axios.get(`https://api.github.com/repos/${ghUser.login}/${repoName}`, {
                    headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' }
                });
                repoData = data;
            } else {
                throw createErr;
            }
        }

        // 3. Get current sha of index.html if it exists (needed for update)
        let fileSha = undefined;
        try {
            const { data: existing } = await axios.get(
                `https://api.github.com/repos/${ghUser.login}/${repoName}/contents/index.html`,
                { headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' } }
            );
            fileSha = existing.sha;
        } catch { /* file doesn't exist yet */ }

        // 4. Push index.html
        const content = Buffer.from(html).toString('base64');
        await axios.put(
            `https://api.github.com/repos/${ghUser.login}/${repoName}/contents/index.html`,
            {
                message: 'Update portfolio via DocBuilder AI',
                content,
                ...(fileSha ? { sha: fileSha } : {})
            },
            { headers: { Authorization: `token ${githubToken}`, Accept: 'application/vnd.github.v3+json' } }
        );

        // 5. Optionally enable GitHub Pages
        try {
            await axios.post(
                `https://api.github.com/repos/${ghUser.login}/${repoName}/pages`,
                { source: { branch: 'main', path: '/' } },
                {
                    headers: {
                        Authorization: `token ${githubToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                }
            );
        } catch { /* Pages may already be enabled */ }

        return res.status(200).json({
            message: 'Portfolio published to GitHub!',
            repoUrl: repoData.html_url,
            cloneUrl: repoData.clone_url,
            pagesUrl: `https://${ghUser.login}.github.io/${repoName}`,
            repoName
        });
    } catch (error) {
        const ghMsg = error.response?.data?.message;
        return res.status(error.response?.status || 400).json({ message: ghMsg || error.message });
    }
};
