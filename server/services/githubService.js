/**
 * GitHub Service -- fetches and analyzes GitHub profiles and repositories.
 *
 * Strategy: Use GitHub GraphQL API (single request) when GITHUB_TOKEN is set,
 * because it fetches profile + repos + languages + README all at once,
 * eliminating the burst of REST calls that triggers the secondary rate limit.
 * Falls back to REST API (sequential with delays) when no token is available.
 *
 * CRITICAL: All process.env reads happen inside functions, NOT at module init.
 * ES module imports are hoisted before dotenv.config() runs in server.js.
 */
import axios from 'axios';

const GITHUB_API   = 'https://api.github.com';
const GITHUB_GQL   = 'https://api.github.com/graphql';

// In-memory cache (30-min TTL)
const _cache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

const cacheGet = (key) => {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) { _cache.delete(key); return null; }
    return entry.data;
};
const cacheSet = (key, data) => _cache.set(key, { data, ts: Date.now() });

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// REST client (token injected at request time via interceptor)
const githubClient = axios.create({
    baseURL: GITHUB_API,
    headers: { Accept: 'application/vnd.github.v3+json' },
    timeout: 12000
});

githubClient.interceptors.request.use((config) => {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        config.headers.Authorization = `token ${token}`;
    } else if (!githubClient._warnedNoToken) {
        console.warn('[githubService] No GITHUB_TOKEN -- unauthenticated limit (60 req/hr) applies.');
        githubClient._warnedNoToken = true;
    }
    return config;
});

// ────────────────────────────────────────────────────────────────────────────
// GraphQL fetcher (PRIMARY path -- 1 request for everything)
// Requires GITHUB_TOKEN. Returns the full normalized github data.
// ────────────────────────────────────────────────────────────────────────────

const GQL_QUERY = `
query FetchUserPortfolio($login: String!) {
  user(login: $login) {
    name
    login
    bio
    avatarUrl
    location
    email
    websiteUrl
    company
    twitterUsername
    createdAt
    followers { totalCount }
    following { totalCount }
    repositories(
      first: 30
      orderBy: { field: STARGAZERS, direction: DESC }
      isFork: false
      privacy: PUBLIC
    ) {
      nodes {
        name
        description
        url
        homepageUrl
        pushedAt
        createdAt
        stargazerCount
        forkCount
        primaryLanguage { name }
        licenseInfo { spdxId }
        topics: repositoryTopics(first: 8) {
          nodes { topic { name } }
        }
        languages(first: 6, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name } }
          totalSize
        }
        readme: object(expression: "HEAD:README.md") {
          ... on Blob { text }
        }
        readmeLower: object(expression: "HEAD:readme.md") {
          ... on Blob { text }
        }
      }
    }
  }
}
`;

/**
 * Fetch everything via GraphQL in ONE request.
 * Returns { profile, repos, languages } in the same shape as analyzeProfile().
 */
export const fetchViaGraphQL = async (username) => {
    const cacheKey = `gql:${username}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN required for GraphQL');

    const { data: { data, errors } } = await axios.post(
        GITHUB_GQL,
        { query: GQL_QUERY, variables: { login: username } },
        {
            headers: {
                Authorization: `bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 15000,
        }
    );

    if (errors) {
        const msg = errors[0]?.message || 'GraphQL error';
        if (msg.includes('Could not resolve to a User')) {
            const e = new Error(`GitHub user "${username}" not found.`);
            e.response = { status: 404 };
            throw e;
        }
        throw new Error(`GitHub GraphQL error: ${msg}`);
    }

    if (!data?.user) {
        const e = new Error(`GitHub user "${username}" not found.`);
        e.response = { status: 404 };
        throw e;
    }

    const u = data.user;

    // Normalize profile
    const profile = {
        name: u.name || u.login,
        username: u.login,
        bio: u.bio || '',
        avatar: u.avatarUrl || '',
        location: u.location || '',
        email: u.email || '',
        blog: u.websiteUrl || '',
        company: u.company || '',
        twitterUsername: u.twitterUsername || '',
        followers: u.followers?.totalCount ?? 0,
        following: u.following?.totalCount ?? 0,
        publicRepos: u.repositories?.nodes?.length ?? 0,
        profileUrl: `https://github.com/${u.login}`,
        hireable: false,
        createdAt: u.createdAt,
    };

    // Normalize repos
    const repos = (u.repositories?.nodes || []).map(r => {
        const langEdges = r.languages?.edges || [];
        const totalSize = r.languages?.totalSize || 1;
        const languageBreakdown = langEdges.map(e => ({
            lang: e.node.name,
            pct: Math.round((e.size / totalSize) * 100),
        }));

        const topics = (r.topics?.nodes || []).map(n => n.topic.name);

        // Prefer README.md, fall back to readme.md
        const readmeText = r.readme?.text || r.readmeLower?.text || '';
        const readme = readmeText.slice(0, 2500);

        return {
            name: r.name,
            fullName: `${u.login}/${r.name}`,
            description: r.description || '',
            url: r.url,
            homepage: r.homepageUrl || '',
            language: r.primaryLanguage?.name || '',
            topics,
            stars: r.stargazerCount,
            forks: r.forkCount,
            watchers: r.stargazerCount, // GraphQL doesn't have watchers separately
            openIssues: 0,
            size: 0,
            createdAt: r.createdAt,
            updatedAt: r.pushedAt,
            pushedAt: r.pushedAt,
            defaultBranch: 'main',
            license: r.licenseInfo?.spdxId || '',
            languageBreakdown,
            readme,
        };
    });

    const languages = extractLanguages(repos);
    const rankedRepos = rankRepositories(repos);

    const result = { profile, repos: rankedRepos, languages };
    cacheSet(cacheKey, result);
    return result;
};

// ────────────────────────────────────────────────────────────────────────────
// REST API fallback (when no GITHUB_TOKEN is configured)
// Fetches sequentially with delays to avoid burst detection
// ────────────────────────────────────────────────────────────────────────────

export const fetchProfile = async (username) => {
    const key = `profile:${username}`;
    const cached = cacheGet(key);
    if (cached) return cached;
    const { data } = await githubClient.get(`/users/${username}`);
    const result = {
        name: data.name || data.login,
        username: data.login,
        bio: data.bio || '',
        avatar: data.avatar_url,
        location: data.location || '',
        email: data.email || '',
        blog: data.blog || '',
        company: data.company || '',
        twitterUsername: data.twitter_username || '',
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
        profileUrl: data.html_url,
        hireable: data.hireable || false,
        createdAt: data.created_at,
    };
    cacheSet(key, result);
    return result;
};

export const fetchRepositories = async (username, maxRepos = 30) => {
    const key = `repos:${username}:${maxRepos}`;
    const cached = cacheGet(key);
    if (cached) return cached;
    const { data } = await githubClient.get(`/users/${username}/repos`, {
        params: { sort: 'pushed', per_page: 50, type: 'owner' }
    });
    const result = data
        .filter(repo => !repo.fork && !repo.archived)
        .sort((a, b) => (b.stargazers_count + b.forks_count * 2) - (a.stargazers_count + a.forks_count * 2))
        .slice(0, maxRepos)
        .map(repo => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || '',
            url: repo.html_url,
            homepage: repo.homepage || '',
            language: repo.language || '',
            topics: repo.topics || [],
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            openIssues: repo.open_issues_count || 0,
            size: repo.size,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            defaultBranch: repo.default_branch || 'main',
            license: repo.license?.spdx_id || '',
            languageBreakdown: repo.language ? [{ lang: repo.language, pct: 100 }] : [],
            readme: '',
        }));
    cacheSet(key, result);
    return result;
};

export const fetchReadme = async (username, repoName) => {
    const key = `readme:${username}:${repoName}`;
    const cached = cacheGet(key);
    if (cached !== null) return cached;
    try {
        const { data } = await githubClient.get(`/repos/${username}/${repoName}/readme`);
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        const result = content.slice(0, 2500);
        cacheSet(key, result);
        return result;
    } catch {
        cacheSet(key, '');
        return '';
    }
};

/** Sequential README fetching with delay (REST fallback path) */
export const fetchReadmesSequential = async (username, repos, delayMs = 1200) => {
    const results = [];
    for (const repo of repos) {
        const key = `readme:${username}:${repo.name}`;
        const isCacheHit = cacheGet(key) !== null;
        const readme = await fetchReadme(username, repo.name);
        results.push(readme);
        if (!isCacheHit) await sleep(delayMs);
    }
    return results;
};

/** Sequential language breakdown fetching with delay (REST fallback path) */
export const fetchLanguagesSequential = async (username, repos, delayMs = 1100) => {
    const results = [];
    for (const repo of repos) {
        const key = `langs:${username}:${repo.name}`;
        const isCacheHit = cacheGet(key) !== null;
        const langs = await fetchRepoLanguages(username, repo.name);
        results.push(langs);
        if (!isCacheHit) await sleep(delayMs);
    }
    return results;
};

export const fetchRepoLanguages = async (username, repoName) => {
    const key = `langs:${username}:${repoName}`;
    const cached = cacheGet(key);
    if (cached) return cached;
    try {
        const { data } = await githubClient.get(`/repos/${username}/${repoName}/languages`);
        const total = Object.values(data).reduce((s, n) => s + n, 0);
        if (total === 0) { cacheSet(key, []); return []; }
        const result = Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang, bytes]) => ({ lang, pct: Math.round((bytes / total) * 100) }));
        cacheSet(key, result);
        return result;
    } catch {
        cacheSet(key, []);
        return [];
    }
};

// Analytics helpers

export const extractLanguages = (repos) => {
    const langScore = {};
    repos.forEach(repo => {
        if (repo.language) {
            langScore[repo.language] = (langScore[repo.language] || 0) + 1 + (repo.stars * 0.1);
        }
        repo.topics.forEach(topic => {
            langScore[topic] = (langScore[topic] || 0) + 0.5;
        });
    });
    return Object.entries(langScore)
        .sort((a, b) => b[1] - a[1])
        .map(([lang]) => lang);
};

export const rankRepositories = (repos) => {
    return repos
        .map(repo => ({
            ...repo,
            score: (
                repo.stars * 3 +
                repo.forks * 2 +
                (repo.description ? 5 : 0) +
                (repo.homepage ? 4 : 0) +
                (repo.topics.length * 1.5) +
                (repo.language ? 2 : 0) +
                (repo.openIssues > 0 ? 1 : 0)
            )
        }))
        .sort((a, b) => b.score - a.score);
};

/**
 * Full profile analysis -- uses GraphQL (1 request) when token is available,
 * falls back to sequential REST calls otherwise.
 */
export const analyzeProfile = async (username) => {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        // GraphQL path: 1 request gets everything
        return fetchViaGraphQL(username);
    }
    // REST fallback: sequential with delays
    const profile = await fetchProfile(username);
    await sleep(800);
    const repos = await fetchRepositories(username, 20);
    const languages = extractLanguages(repos);
    const rankedRepos = rankRepositories(repos);
    return { profile, repos: rankedRepos, languages };
};

/**
 * Validate the configured GitHub token by hitting /rate_limit.
 */
export const validateToken = async () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return { valid: false, reason: 'No GITHUB_TOKEN in environment' };
    try {
        const { data } = await githubClient.get('/rate_limit');
        const core = data.resources.core;
        return {
            valid: true,
            limit: core.limit,
            remaining: core.remaining,
            resetAt: new Date(core.reset * 1000).toISOString()
        };
    } catch (err) {
        return { valid: false, reason: err.message };
    }
};
