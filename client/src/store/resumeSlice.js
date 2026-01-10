import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentResume: null,
  personal_info: {
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    profession: '',
    image: null
  },
  professional_summary: '',
  skills: [],
  experience: [],
  education: [],
  project: [],
  template: 'minimal-image',
  accent_color: '#14B8A6'
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    loadResume: (state, action) => {
      return { ...state, ...action.payload };
    },
    updatePersonalInfo: (state, action) => {
      state.personal_info = { ...state.personal_info, ...action.payload };
    },
    updateProfessionalSummary: (state, action) => {
      state.professional_summary = action.payload;
    },
    updateSkills: (state, action) => {
      state.skills = action.payload;
    },
    addSkill: (state, action) => {
      state.skills.push(action.payload);
    },
    removeSkill: (state, action) => {
      state.skills = state.skills.filter((_, index) => index !== action.payload);
    },
    addExperience: (state) => {
      state.experience.push({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: '',
        is_current: false,
        _id: Date.now().toString()
      });
    },
    updateExperience: (state, action) => {
      const { index, data } = action.payload;
      state.experience[index] = { ...state.experience[index], ...data };
    },
    removeExperience: (state, action) => {
      state.experience = state.experience.filter((_, index) => index !== action.payload);
    },
    addEducation: (state) => {
      state.education.push({
        institution: '',
        degree: '',
        field: '',
        graduation_date: '',
        gpa: '',
        _id: Date.now().toString()
      });
    },
    updateEducation: (state, action) => {
      const { index, data } = action.payload;
      state.education[index] = { ...state.education[index], ...data };
    },
    removeEducation: (state, action) => {
      state.education = state.education.filter((_, index) => index !== action.payload);
    },
    addProject: (state) => {
      state.project.push({
        name: '',
        type: '',
        description: '',
        _id: Date.now().toString()
      });
    },
    updateProject: (state, action) => {
      const { index, data } = action.payload;
      state.project[index] = { ...state.project[index], ...data };
    },
    removeProject: (state, action) => {
      state.project = state.project.filter((_, index) => index !== action.payload);
    },
    updateTemplate: (state, action) => {
      state.template = action.payload;
    },
    updateAccentColor: (state, action) => {
      state.accent_color = action.payload;
    },
    resetResume: () => initialState
  }
});

export const {
  loadResume,
  updatePersonalInfo,
  updateProfessionalSummary,
  updateSkills,
  addSkill,
  removeSkill,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addProject,
  updateProject,
  removeProject,
  updateTemplate,
  updateAccentColor,
  resetResume
} = resumeSlice.actions;

export default resumeSlice.reducer;
