export default {
    id: 'portfolio',
    name: 'Portfolio Generator',
    description: 'AI-powered portfolio website generator from GitHub or manual input',
    icon: 'Globe',
    inputSchema: {
        required: ['name'],
        fields: [
            'name', 'bio', 'email', 'phone', 'location', 'githubUrl',
            'linkedinUrl', 'websiteUrl', 'skills', 'projects',
            'experience', 'education', 'certifications', 'theme', 'accentColor'
        ]
    },
    aiPrompts: {
        generateBio: "You are a professional copywriter. Write a compelling, concise professional bio (2-3 sentences) for a portfolio website. Return only the bio text.",
        generateProjectDesc: "You are a tech writer. Write a clear, impactful project description for a portfolio. Highlight the problem solved, technologies used, and impact. Return 2-3 sentences only.",
        generateSkillSummary: "You are a career advisor. Write a brief skills overview paragraph for a portfolio website highlighting the candidate's technical expertise. Return only the paragraph.",
        generateHeadline: "You are a personal branding expert. Create a compelling professional headline for this portfolio. Return only the headline text (max 10 words).",
        analyzeGithubRepo: "You are a senior software engineer analyzing GitHub repositories. Given repository data, generate a professional project description. Focus on the technical challenge, solution, and impact. Return JSON with: {title, description, technologies, impact, featured}."
    },
    outputFormat: 'json'
};
