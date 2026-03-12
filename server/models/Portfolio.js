/**
 * Portfolio Model
 */
import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'My Portfolio' },
    public: { type: Boolean, default: false },
    sourceType: { type: String, enum: ['manual', 'github'], default: 'manual' },
    githubUsername: { type: String, default: '' },

    // Personal info
    name: { type: String, default: '' },
    headline: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '' },

    // Nested contact (matches frontend form)
    contact: {
        email: { type: String, default: '' },
        phone: { type: String, default: '' }
    },

    // Nested links (matches frontend form)
    links: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },

    // Content
    skills: [{ type: String }],
    projects: [{
        title: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
        githubUrl: { type: String },
        liveUrl: { type: String },
        image: { type: String },
        featured: { type: Boolean, default: false },
        stars: { type: Number, default: 0 }
    }],
    experience: [{
        company: { type: String },
        role: { type: String },       // frontend uses 'role'
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
        current: { type: Boolean, default: false }  // frontend uses 'current'
    }],
    education: [{
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        startYear: { type: String },  // frontend uses startYear/endYear
        endYear: { type: String },
        current: { type: Boolean, default: false }
    }],
    certifications: [{
        name: { type: String },
        issuer: { type: String },
        year: { type: String },       // frontend uses 'year'
        url: { type: String }
    }],

    // Styling
    theme: { type: String, enum: ['default', 'dark', 'minimal', 'colorful', 'creative'], default: 'default' },
    accentColor: { type: String, default: '#10b981' },
    fontFamily: { type: String, default: 'inter' }

}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);
export default Portfolio;
