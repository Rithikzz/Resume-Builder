# 🚀 Interactive Resume Builder

A fully-featured, modern resume builder built with React, Redux, and Tailwind CSS. Create professional resumes with an intuitive drag-and-drop interface, multiple templates, AI suggestions, and real-time preview.

## ✨ Features

### 🎯 Core Features
- **Multi-Tab Editor**: Organized sections for Personal Info, Summary, Experience, Education, Skills, Projects, and Theme
- **Real-time Preview**: Instant preview of your resume as you edit
- **Multiple Templates**: Choose from 4 professional resume templates
  - Minimal Image
  - Minimal
  - Modern
  - Classic
- **Color Customization**: 7 accent colors to personalize your resume
- **AI Suggestions**: Get AI-powered suggestions for professional summaries and skills
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 💼 Interactive Sections
1. **Personal Information**: Full name, email, phone, location, profession, LinkedIn, website
2. **Professional Summary**: AI-assisted summary with character count
3. **Work Experience**: Add multiple positions with date ranges and "Currently Working" option
4. **Education**: Track your academic achievements
5. **Skills**: Tag-based skill management with AI suggestions
6. **Projects**: Showcase your best work
7. **Theme Customization**: Change templates and accent colors

### 🎨 Design Features
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Hover effects and interactive elements
- Icon-based navigation
- Empty state placeholders
- Toast notifications for user feedback

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**

## 🚀 Getting Started

### Installation

1. **Navigate to the client directory**
   ```bash
   cd client
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - The app will run on `http://localhost:5173` (or the port shown in terminal)

## 🎮 How to Use

### Creating a Resume

1. **Dashboard**: From the dashboard, click "Create Resume" or "Upload Existing"
2. **Personal Info Tab**: Fill in your basic information
3. **Summary Tab**: Write or use AI suggestions for your professional summary
4. **Experience Tab**: Add your work experiences
   - Click "Add Experience" to create new entries
   - Use the "Currently working here" checkbox for current positions
5. **Education Tab**: Add your educational background
6. **Skills Tab**: Add skills individually or use AI suggestions
7. **Projects Tab**: Showcase your projects
8. **Theme Tab**: Choose your template and accent color

### Preview & Export

- Click **Preview** button to see your resume in full A4 format
- Click **Share** to copy a shareable link
- Click **Download PDF** to export your resume (coming soon)

## 🏗️ Project Structure

```
client/
├── src/
│   ├── assets/          # Images and templates
│   │   └── templates/   # Resume templates
│   ├── components/      # Reusable components
│   │   ├── AISuggestions.jsx
│   │   ├── ResumeCard.jsx
│   │   └── Navbar.jsx
│   ├── configs/         # API configurations
│   ├── pages/          # Main pages
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ResumeBuilder.jsx  # Main editor
│   │   ├── Preview.jsx         # Preview page
│   │   ├── Login.jsx
│   │   └── Layout.jsx
│   ├── store/          # Redux store
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   └── resumeSlice.js     # Resume state management
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🔧 Technologies Used

### Frontend
- **React 19.2.0** - UI framework
- **Redux Toolkit** - State management
- **React Router 7.11.0** - Routing
- **Tailwind CSS 4.1.18** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Development
- **Vite 7.2.4** - Build tool
- **ESLint** - Linting

## 🎨 Available Templates

1. **Minimal Image** - Clean design with profile picture
2. **Minimal** - Simple, text-focused layout
3. **Modern** - Contemporary design with bold elements
4. **Classic** - Traditional professional format

## 🎯 Key Components

### ResumeBuilder (`ResumeBuilder.jsx`)
The main editor component with:
- Tab-based navigation
- Form inputs for all resume sections
- Real-time Redux state updates
- AI suggestion integration

### Preview (`Preview.jsx`)
Full-page resume preview with:
- A4 paper simulation
- Template rendering
- Export options
- Resume metadata display

### AISuggestions (`AISuggestions.jsx`)
AI-powered suggestions for:
- Professional summaries
- Work experience descriptions
- Skill recommendations

## 🔄 State Management

The app uses Redux Toolkit for state management with two main slices:

1. **authSlice**: User authentication state
2. **resumeSlice**: Resume data and editor state
   - Personal information
   - Professional summary
   - Experience, education, skills, projects
   - Template and theme settings

## 🌟 Features in Detail

### Interactive Editing
- ✅ Add/remove sections dynamically
- ✅ Real-time character count
- ✅ Date pickers for experience and education
- ✅ Tag-based skill management
- ✅ Empty state placeholders

### Visual Feedback
- ✅ Toast notifications for actions
- ✅ Hover effects on interactive elements
- ✅ Smooth animations on tab changes
- ✅ Scale effects on buttons
- ✅ Loading states

### User Experience
- ✅ Keyboard shortcuts (Enter to add skills)
- ✅ Confirmation dialogs for deletions
- ✅ Auto-save capability
- ✅ Responsive layout
- ✅ Intuitive navigation

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎭 Customization

### Adding New Templates
1. Create a new template component in `src/assets/templates/`
2. Import it in `Preview.jsx`
3. Add it to the templates object

### Adding New Colors
Edit the color array in the Theme tab section of `ResumeBuilder.jsx`

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use:
```bash
npm run dev -- --port 3000
```

### Dependencies Issues
Clear node modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## 🚧 Upcoming Features

- [ ] PDF export functionality
- [ ] Cloud save/sync
- [ ] More templates
- [ ] Drag-and-drop reordering
- [ ] Cover letter generator
- [ ] Resume analytics
- [ ] Multi-language support

## 📄 License

This project is part of a portfolio demonstration.

## 👨‍💻 Development

Built with ❤️ using modern web technologies

---

**Happy Resume Building! 🎉**
