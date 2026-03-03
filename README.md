# Gishoma Multi-School Management System

> **Enterprise-grade school management platform** for educational institutions across the region. Streamline administration, enhance learning outcomes, and empower stakeholders.

---

## Overview

Gishoma is a comprehensive, cloud-ready school management system built for the modern educational institution. Designed with scalability, security, and usability at its core, Gishoma simplifies day-to-day operations while providing powerful insights for institutional growth.

**Built for:**
- Multi-school networks and education enterprises
- Schools seeking digital transformation
- Institutions requiring robust data security and isolation
- Educational leaders wanting real-time operational visibility

---

## Key Features

### 🏢 Multi-Tenant Architecture
- **Complete data isolation** between schools – security and privacy built-in
- **One platform, unlimited schools** – scale from single institution to national networks
- **Centralized management** – super admin oversight with granular controls
- **School autonomy** – each institution manages its own users and settings

### 👥 Role-Based Access Control
Gishoma supports 6 distinct user roles with granular permissions:

| Role | Key Responsibilities |
|------|---------------------|
| **Super Admin** | Platform oversight, school management, system configuration |
| **School Admin** | School operations, staff management, institutional settings |
| **Bursar** | Financial management, fee collection, payment processing |
| **Dean of Courses** | Academic coordination, attendance, discipline oversight |
| **Teacher** | Grading, lesson planning, student assessment, homework |
| **Student** | Access course materials, submit assignments, view results |

### 📚 Core Academic Modules

#### Academics
- **Marks & Grading** – Flexible marking system with multiple assessment types
- **Courses & Enrollment** – Curriculum management and student course tracking
- **Exercises & Homework** – Assignment creation, submission, and feedback
- **Timetable** – Dynamic schedule generation and management
- **Attendance** – Automated tracking for teachers, students, and staff

#### Student Support
- **Discipline Management** – Incident tracking and intervention records
- **Student Profiles** – Comprehensive records including academic and behavioral data
- **Report Cards** – Automated performance reports with detailed analytics
- **Notes & Resources** – Course materials and supplementary learning content

#### Administrative
- **User Management** – Staff and student account lifecycle management
- **School Settings** – Customizable institution preferences and configurations
- **Activity Logging** – Complete audit trail for compliance and accountability
- **Notifications** – Real-time alerts and announcements system
- **Email Integration** – Automated communication with stakeholders

### 💡 Smart Features
- **Real-time Dashboard** – At-a-glance institutional metrics and alerts
- **Dark/Light Mode** – Accessibility-first UI with theme switching
- **PDF Reports** – Professional document generation for records and distribution
- **Real-time Chat** – Secure student-teacher communication channels
- **Mobile-Responsive Design** – Full functionality on tablets and smartphones

---

## Technology Stack

### Backend
- **Runtime:** Node.js with Express.js framework
- **Database:** MySQL 8.0 (with support for distributed deployments)
- **Authentication:** JWT-based with refresh token rotation
- **Real-time:** Socket.io for live communications
- **Security:** bcryptjs password hashing, SQL injection prevention, CSRF protection

### Frontend
- **Framework:** React 18 with React Router
- **State Management:** Redux Toolkit for predictable state handling
- **HTTP Client:** Axios with JWT interceptors
- **Build Tool:** Vite for fast development and optimized production builds
- **Styling:** CSS custom properties for consistent theming

### Infrastructure
- **Containerization:** Docker and Docker Compose
- **Database:** MySQL 8.0+
- **Deployment Ready:** Nginx reverse proxy configuration included

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Docker and Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gishoma

# Start database (Docker Compose)
docker-compose up -d

# Backend setup
cd backend
npm install
npm run db:init      # Initialize database schema
npm run db:seed      # Load sample data
npm start            # Start server on port 5000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev          # Start dev server on port 5173
```

### Demo Credentials
```
Email:    superadmin@gishoma.edu
Password: password123
```

---

## Architecture

### Modular Design
The system is organized into clear, maintainable modules:

```
Backend Structure:
├── controllers/      # Request handlers
├── services/         # Business logic layer
├── routes/           # API endpoint definitions
├── middleware/       # Authentication, validation, error handling
├── validators/       # Input validation rules
├── config/           # Database and environment configuration
└── sql/              # Database schema and migrations

Frontend Structure:
├── pages/            # Full-page components
├── components/       # Reusable UI components
├── store/            # Redux state management
├── api/              # API client and interceptors
└── styles/           # Global and component-specific styling
```

### Security-First Approach
- **JWT Authentication** with expiry and refresh mechanisms
- **Multi-tenant Isolation** – automatic school_id filtering on all queries
- **Password Security** – bcryptjs hashing with configurable rounds
- **CORS Protection** – controlled cross-origin requests
- **Rate Limiting** – DDoS and brute-force attack mitigation
- **SQL Injection Prevention** – parameterized queries throughout
- **Activity Audit Trail** – complete logging of data modifications

---

## Core Capabilities

### For School Administrators
✓ Manage staff and student records  
✓ Configure institutional settings  
✓ Monitor operational metrics  
✓ Generate reports and analytics  
✓ Oversee financial and academic operations  

### For Teachers
✓ Record student grades and assessments  
✓ Create and assign homework and exercises  
✓ Track student attendance  
✓ Communicate with students and parents  
✓ Prepare and share lesson notes  
✓ Document disciplinary incidents  

### For Students
✓ View grades and performance  
✓ Access course materials  
✓ Submit assignments  
✓ Check timetable and announcements  
✓ Communicate with teachers  
✓ Download report cards  

### For Finance Teams
✓ Manage fee structures  
✓ Process payments and generate receipts  
✓ Track outstanding balances  
✓ Financial reporting and analysis  

---

## API Documentation

The system provides RESTful APIs for all major operations:

**Authentication:**
- `POST /api/auth/login` – User authentication
- `POST /api/auth/refresh` – Token refresh
- `POST /api/auth/logout` – User logout

**Academic:**
- `GET/POST /api/marks` – Grade management
- `GET/POST /api/courses` – Course operations
- `GET/POST /api/exercises` – Assignment creation
- `GET/POST /api/homework` – Homework management
- `GET/POST /api/attendance` – Attendance tracking

**Administration:**
- `GET/POST /api/students` – Student records
- `GET/POST /api/teachers` – Teacher management
- `GET/POST /api/schools` – Multi-school administration

**Communication:**
- `GET/POST /api/announcements` – System announcements
- `POST /api/email` – Email notifications

All endpoints require JWT authentication and enforce school-level data isolation.

---

## System Requirements

| Component | Requirement |
|-----------|-------------|
| **Node.js** | 16.0.0 or higher |
| **npm** | 8.0.0 or higher |
| **MySQL** | 8.0.0 or higher |
| **RAM** | Minimum 2GB (4GB recommended) |
| **Disk Space** | Minimum 5GB for application and data |
| **Browser** | Modern browser (Chrome, Firefox, Safari, Edge) |

---

## Deployment

Gishoma is designed for cloud deployment with included Docker configuration:

```bash
# Build Docker images
docker build -t gishoma-backend ./backend
docker build -t gishoma-frontend ./frontend

# Deploy using Docker Compose
docker-compose up -d
```

Suitable for deployment on:
- AWS (EC2, RDS, ECS)
- Google Cloud Platform (GCE, Cloud SQL)
- Azure (Virtual Machines, Database for MySQL)
- DigitalOcean App Platform
- On-premises infrastructure

---

## Support & Documentation

- **Installation Guide:** See `IMPLEMENTATION_SUMMARY.md`
- **Architecture Details:** See `BACKEND_HARDENING_GUIDE.md`
- **Features Overview:** See `FEATURES_COMPLETED.md`
- **Development Guide:** See `.github/copilot-instructions.md`

---

## License

Gishoma School Management System  
© 2026 - All Rights Reserved

---

## Contact & Support

For inquiries, support, or partnership opportunities:

📧 Email: support@gishoma.edu  
🌐 Website: www.gishoma.edu  
📞 Phone: Available on request

---

**Gishoma** – Transforming Education Through Technology
