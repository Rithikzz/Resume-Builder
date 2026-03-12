export default {
    id: 'resume',
    name: 'Resume Builder',
    description: 'Professional ATS-optimized resumes with AI enhancement',
    icon: 'FileText',
    inputSchema: {
        required: ['title'],
        fields: ['title', 'personal_info', 'professional_summary', 'experience', 'education', 'skills', 'project']
    },
    aiPrompts: {
        enhanceSummary: "You are an expert resume writer. Enhance this professional summary to be compelling and ATS-friendly. Return only the improved text, 1-2 sentences.",
        enhanceJobDesc: "You are an expert resume writer. Enhance this job description with strong action verbs and measurable achievements. Return only the improved text, 1-2 sentences.",
        extractFromPDF: "You are an expert AI agent to extract data from resumes. Extract all fields and return valid JSON only."
    },
    outputFormat: 'json'
};
