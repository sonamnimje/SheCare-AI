# SheCare AI - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Motivation](#project-motivation)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Features Implemented](#features-implemented)
6. [Development Process](#development-process)
7. [Challenges Faced](#challenges-faced)
8. [Solutions Implemented](#solutions-implemented)
9. [Project Structure](#project-structure)
10. [Installation & Setup](#installation--setup)
11. [Future Enhancements](#future-enhancements)
12. [Conclusion](#conclusion)

---

## Project Overview

**SheCare AI** is a comprehensive women's health management platform designed to empower users with intelligent tools for tracking menstrual cycles, assessing PCOS risk, maintaining health journals, and receiving AI-powered health guidance. This full-stack web application combines modern frontend technologies with robust backend services to deliver a seamless user experience.

### Live Demo
- **Live Application**: https://she-care-ai-7rwe.vercel.app/
- **Demo Video**: [YouTube](https://youtu.be/gU0lN3_8I-I)

---

## Project Motivation

### Why I Chose This Project

1. **Addressing a Real-World Problem**
   - Women's health tracking is often overlooked in digital health solutions
   - Limited accessible tools for PCOS awareness and early detection
   - Need for personalized health recommendations based on individual patterns

2. **Personal Impact**
   - Opportunity to create a meaningful impact on women's health and wellness
   - Bridge the gap between technology and healthcare accessibility
   - Promote health awareness through data-driven insights

3. **Technical Learning Goals**
   - Implement a full-stack application using modern technologies
   - Integrate AI/ML capabilities for health recommendations
   - Build secure authentication and data management systems
   - Deploy scalable cloud-based solutions

4. **Market Relevance**
   - Growing demand for digital health solutions
   - Increasing awareness about women's health issues
   - Rising adoption of AI in healthcare applications

---

## Technology Stack

### Frontend
- **React.js 19.1.0** - Component-based UI framework
- **React Router Dom 7.6.2** - Client-side routing
- **Axios 1.10.0** - HTTP client for API communication
- **Framer Motion 12.19.1** - Animation library
- **React Icons 5.5.0** - Icon components

### Backend
- **FastAPI 0.104.1** - Modern Python web framework
- **SQLAlchemy 1.4.49** - Database ORM
- **Pydantic 2.0.0+** - Data validation
- **Uvicorn 0.24.0** - ASGI server
- **Python-Jose 3.3.0** - JWT token handling
- **Passlib[bcrypt] 1.7.4** - Password hashing

### Database
- **SQLite** - Lightweight database for development
- Support for **PostgreSQL** and **MySQL** in production

### Authentication & Security
- **JWT (JSON Web Tokens)** - Secure user authentication
- **BCrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

---

## System Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   React.js      │ ←─────────────→  │   FastAPI       │
│   Frontend      │                  │   Backend       │
│                 │                  │                 │
│ • Dashboard     │                  │ • Authentication│
│ • Cycle Tracker │                  │ • API Endpoints │
│ • Journal       │                  │ • Data Validation│
│ • PCOS Checker  │                  │ • Business Logic│
│ • AI Chatbot    │                  │                 │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │   SQLite/       │
                                     │   PostgreSQL    │
                                     │   Database      │
                                     └─────────────────┘
```

---

## Features Implemented

### 1. User Authentication System
- **Secure Registration/Login** with JWT tokens
- **Password Encryption** using BCrypt
- **Session Management** with token expiration
- **Protected Routes** for authenticated users

### 2. Menstrual Cycle Tracker
- **Cycle Logging** with start and end dates
- **Pattern Analysis** for regularity tracking
- **Visual Calendar** representation
- **Cycle Predictions** based on historical data

### 3. Health Journal
- **Daily Mood Tracking** with emoji-based interface
- **Symptom Logging** with predefined categories
- **Personal Notes** for detailed entries
- **Historical View** of journal entries

### 4. PCOS Risk Assessment
- **Symptom-Based Questionnaire** with weighted scoring
- **Risk Level Calculation** (Low, Moderate, High)
- **Personalized Recommendations** based on assessment
- **Educational Content** about PCOS

### 5. AI-Powered Chatbot
- **Voice-Enabled Interface** using OmniDimension Voice Agent
- **Health Query Processing** with contextual responses
- **Real-time Assistance** for health-related questions
- **Integration** with user's health data

### 6. Personalized Recommendations
- **Smart Algorithm** analyzing user patterns
- **Cycle-Based Suggestions** for optimal health
- **Lifestyle Recommendations** for wellness
- **Nutritional Guidance** based on cycle phase

### 7. User Profile Management
- **Personal Information** management
- **Health Metrics** tracking (height, weight, age)
- **Preference Settings** for notifications
- **Data Export** capabilities

---

## Development Process

### Phase 1: Planning & Design (Week 1)
- **Requirement Analysis** - Identified core features
- **UI/UX Design** - Created wireframes and mockups
- **Database Design** - Planned entity relationships
- **Technology Selection** - Chose React + FastAPI stack

### Phase 2: Backend Development (Weeks 2-3)
- **Database Models** creation with SQLAlchemy
- **Authentication System** implementation
- **API Endpoints** development
- **Data Validation** with Pydantic
- **Testing** with FastAPI's built-in test client

### Phase 3: Frontend Development (Weeks 4-5)
- **Component Architecture** setup
- **Routing Configuration** with React Router
- **State Management** with React hooks
- **API Integration** with Axios
- **Responsive Design** implementation

### Phase 4: Integration & Testing (Week 6)
- **Frontend-Backend Integration**
- **Cross-browser Testing**
- **Mobile Responsiveness** verification
- **Security Testing** for authentication
- **Performance Optimization**

### Phase 5: Deployment & Documentation (Week 7)
- **Cloud Deployment** on Render
- **Environment Configuration**
- **Documentation** creation
- **Demo Video** production

---

## Challenges Faced

### 1. Authentication & Security
**Challenge**: Implementing secure JWT-based authentication
- Complex token management between frontend and backend
- Handling token expiration and refresh logic
- Securing sensitive endpoints

**Solution**: 
- Implemented middleware for automatic token validation
- Created protected route components in React
- Added token refresh mechanism for seamless user experience

### 2. Database Design Complexity
**Challenge**: Designing normalized database schema
- Complex relationships between users, cycles, journal entries
- Ensuring data integrity and consistency
- Managing soft deletes for data preservation

**Solution**:
- Used SQLAlchemy ORM for robust relationship management
- Implemented cascade operations for data consistency
- Added deleted flags instead of hard deletes

### 3. State Management
**Challenge**: Managing complex application state
- Synchronizing user data across components
- Handling asynchronous API calls
- Maintaining UI consistency during data updates

**Solution**:
- Implemented custom hooks for state management
- Used React Context for global state
- Added loading states and error handling

### 4. PCOS Risk Assessment Algorithm
**Challenge**: Creating medically accurate risk assessment
- Researching medical literature for accurate scoring
- Balancing simplicity with medical accuracy
- Providing meaningful recommendations

**Solution**:
- Consulted medical resources and research papers
- Implemented weighted scoring system
- Added disclaimers and professional consultation recommendations

### 5. Cross-Origin Resource Sharing (CORS)
**Challenge**: API communication between different ports
- Development environment using different ports (3000, 8000)
- Browser security restrictions
- Production deployment considerations

**Solution**:
- Configured CORS middleware in FastAPI
- Set appropriate allowed origins for different environments
- Implemented environment-specific configurations

### 6. Responsive Design
**Challenge**: Ensuring consistent UI across devices
- Complex layouts for different screen sizes
- Mobile-first design implementation
- Touch-friendly interface design

**Solution**:
- Used CSS Grid and Flexbox for responsive layouts
- Implemented progressive enhancement approach
- Tested on multiple devices and screen sizes

### 7. Deployment & Environment Management
**Challenge**: Managing environment variables and deployment
- Different configurations for development and production
- Database migrations in production
- Environment variable security

**Solution**:
- Used python-dotenv for environment management
- Implemented automatic database initialization
- Secured sensitive configurations in production

---

## Solutions Implemented

### 1. Modular Architecture
- **Component-Based Frontend** for reusability
- **Service Layer Pattern** in backend
- **Separation of Concerns** across the application

### 2. Error Handling
- **Global Error Boundaries** in React
- **Comprehensive Exception Handling** in FastAPI
- **User-Friendly Error Messages**

### 3. Performance Optimization
- **Lazy Loading** for components
- **Database Query Optimization**
- **Caching Strategies** for frequently accessed data

### 4. Security Best Practices
- **Input Validation** on both frontend and backend
- **SQL Injection Prevention** through ORM
- **XSS Protection** with proper data sanitization

### 5. User Experience Enhancements
- **Loading Indicators** for asynchronous operations
- **Form Validation** with real-time feedback
- **Intuitive Navigation** with breadcrumbs

---

## Project Structure

```
SheCare-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Database models
│   │   ├── database.py          # Database configuration
│   │   ├── config.py            # Application settings
│   │   └── routes/
│   │       └── voice_agent.py   # Voice agent routes
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.js               # Main application component
│   │   ├── api.js               # API service layer
│   │   └── pages/               # Page components
│   │       ├── Dashboard.js
│   │       ├── CycleTracker.js
│   │       ├── Journal.js
│   │       ├── PCOSChecker.js
│   │       └── ...
│   └── package.json             # Node.js dependencies
├── .vscode/
│   └── tasks.json               # VS Code tasks
├── README.md                    # Project overview
└── PROJECT_DOCUMENTATION.md    # This documentation
```

---

## Installation & Setup

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ installed
- Git installed

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cd app
python init_db.py
python -m uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Future Enhancements

### Short-term Goals
1. **Push Notifications** for cycle reminders
2. **Data Export** functionality (PDF reports)
3. **Multi-language Support** for broader accessibility
4. **Dark/Light Theme** toggle

### Medium-term Goals
1. **Mobile Application** (React Native)
2. **Advanced Analytics** with charts and graphs
3. **Integration** with wearable devices
4. **Telemedicine Features** for doctor consultations

### Long-term Vision
1. **Machine Learning** for predictive health insights
2. **Community Features** for peer support
3. **Integration** with electronic health records
4. **AI-powered** personalized health coaching

---

## Conclusion

The **SheCare AI** project successfully demonstrates the implementation of a comprehensive women's health platform using modern web technologies. Through this project, I have:

### Technical Achievements
- Built a full-stack web application from scratch
- Implemented secure authentication and authorization
- Integrated AI capabilities for health recommendations
- Deployed a production-ready application on cloud platforms

### Learning Outcomes
- **Full-Stack Development** skills with React and FastAPI
- **Database Design** and ORM implementation
- **API Development** and RESTful service architecture
- **Cloud Deployment** and DevOps practices
- **UI/UX Design** principles and responsive development

### Impact & Value
- Created a meaningful solution addressing real health needs
- Demonstrated ability to handle complex healthcare data securely
- Showcased integration of AI technologies in practical applications
- Built a scalable foundation for future health-tech innovations

### Professional Growth
This project has significantly enhanced my capabilities as a full-stack developer and prepared me for roles in healthcare technology, demonstrating proficiency in:
- Modern web development frameworks
- Healthcare application security requirements
- User-centered design principles
- Agile development methodologies

The **SheCare AI** platform stands as a testament to the power of technology in improving healthcare accessibility and empowering individuals to take control of their health journey.

---
**Developer Team Name**: Sonam Nimje, Shreya Saraf, Sameeksha Vishwakarma, Riya Saraf

**Developer Team**: The Avalanche

**Project Duration**: 7 weeks  

**Technologies**: React.js, FastAPI, SQLite, JWT  

**Deployment**: Vercel Cloud Platform  

**Repository**: [GitHub - SheCare-AI](https://github.com/sonamnimje/SheCare-AI)
