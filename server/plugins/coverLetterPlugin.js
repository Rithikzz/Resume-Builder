export default {
    id: 'cover-letter',
    name: 'Cover Letter Generator',
    description: 'Tailored AI-generated cover letters for any job application',
    icon: 'Mail',
    inputSchema: {
        required: ['applicantName', 'jobTitle', 'companyName'],
        fields: [
            'applicantName', 'applicantEmail', 'applicantPhone',
            'jobTitle', 'companyName', 'jobDescription',
            'keySkills', 'experience', 'tone', 'customInstructions'
        ]
    },
    aiPrompts: {
        generate: `You are an expert professional cover letter writer. Write a compelling, personalized cover letter.
Rules:
- Professional and tailored to the specific job/company
- 3-4 paragraphs: hook, value proposition, evidence, call-to-action
- Match the tone specified (professional/enthusiastic/formal)
- Do NOT use generic phrases like "I am writing to apply"
- Return only the cover letter text, no headers or metadata`,
        improve: "You are an expert cover letter writer. Improve this cover letter to be more impactful and personalized. Return only the improved text."
    },
    outputFormat: 'text'
};
