/**
 * CoverLetter Model
 */
import mongoose from 'mongoose';

const CoverLetterSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Cover Letter' },
    public: { type: Boolean, default: false },

    // Applicant details
    applicantName: { type: String, default: '' },
    applicantEmail: { type: String, default: '' },
    applicantPhone: { type: String, default: '' },

    // Target job
    jobTitle: { type: String, default: '' },
    companyName: { type: String, default: '' },
    jobDescription: { type: String, default: '' },

    // User's background
    keySkills: [{ type: String }],
    experience: { type: String, default: '' },
    tone: { type: String, enum: ['professional', 'enthusiastic', 'formal', 'friendly'], default: 'professional' },
    customInstructions: { type: String, default: '' },

    // Generated content
    content: { type: String, default: '' },

    // Styling
    template: { type: String, default: 'classic' },
    accentColor: { type: String, default: '#3B82F6' }

}, { timestamps: true });

const CoverLetter = mongoose.model('CoverLetter', CoverLetterSchema);
export default CoverLetter;
