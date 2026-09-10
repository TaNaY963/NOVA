# NOVA — Team Productivity Platform

> **Plan. Collaborate. Deliver.**

NOVA is a full-stack team productivity and project management platform designed to help teams organize projects, manage tasks, collaborate with members, and track progress from a single dashboard.

## 🚀 Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected API routes
- Password hashing with bcrypt
- Profile management
- Change password functionality
- Secure logout

### 📊 Dashboard
- Total projects overview
- Active projects count
- Total tasks
- Completed tasks
- Overall completion percentage
- Project-wise progress
- Recent activity

### 📁 Project Management
- Create projects
- Update project details
- Delete projects
- Project status tracking
- Start and due dates
- Project progress based on task completion

### ✅ Task Management
- Create and manage tasks
- Assign tasks to team members
- Task priorities:
  - Low
  - Medium
  - High
- Task statuses:
  - Todo
  - In Progress
  - Review
  - Completed
- Due dates
- Edit and delete tasks
- Automatic project progress calculation

### 👥 Team Collaboration
- Add team members using email
- Remove team members
- Project-based member access
- Team discussion through comments
- Comment deletion based on permissions

### 👤 Profile
- View account information
- Update name
- View email
- View account creation date
- Change password
- Logout

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- REST API
- JWT
- bcryptjs

### Database
- MongoDB
- Mongoose

### Development Tools
- Git
- GitHub
- VS Code
- Postman

---

## 📂 Project Structure

```text
NOVA/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── profile/
│   │   │   ├── projects/
│   │   │   └── tasks/
│   │   │
│   │   ├── components/
│   │   ├── context/
│   │   └── lib/
│   │       └── api.ts
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── commentController.js
│   │   │   └── dashboardController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   └── Comment.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   │
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md

## Getting Started
1. Clone the Repository
git clone https://github.com/TaNaY963/NOVA.git
cd NOVA
🔧 Backend Setup

Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Create a .env file inside the backend directory:

PORT=5002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Start the backend:

npm run dev

The backend will run on:

http://localhost:5002
💻 Frontend Setup

Open another terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Create a .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:5002/api

Start the frontend:

npm run dev

The application will be available at:

http://localhost:3000
🔑 Authentication Flow

NOVA uses JWT-based authentication.

User
  ↓
Register / Login
  ↓
Backend validates credentials
  ↓
JWT token generated
  ↓
Token stored on client
  ↓
Protected API request
  ↓
Authentication middleware
  ↓
Authorized request

Protected API requests use:

Authorization: Bearer <token>
🔗 API Overview
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login
GET	/api/auth/me	Get current user
PUT	/api/auth/profile	Update profile
PUT	/api/auth/password	Change password
Projects
Method	Endpoint	Description
POST	/api/projects	Create project
GET	/api/projects	Get user's projects
GET	/api/projects/:id	Get project details
PUT	/api/projects/:id	Update project
DELETE	/api/projects/:id	Delete project
Team Members
Method	Endpoint	Description
POST	/api/projects/:id/members	Add team member
DELETE	/api/projects/:id/members/:userId	Remove team member
Tasks
Method	Endpoint	Description
POST	/api/tasks	Create task
GET	/api/tasks/project/:projectId	Get project tasks
GET	/api/tasks/:id	Get task
PUT	/api/tasks/:id	Update task
DELETE	/api/tasks/:id	Delete task
Comments
Method	Endpoint	Description
POST	/api/comments/project/:projectId	Add comment
GET	/api/comments/project/:projectId	Get project comments
DELETE	/api/comments/:id	Delete comment
Dashboard
Method	Endpoint	Description
GET	/api/dashboard	Get dashboard statistics
📈 Project Progress

Project progress is calculated automatically based on completed tasks.

Progress = Completed Tasks / Total Tasks × 100

For example:

Total Tasks: 10
Completed Tasks: 6
Progress: 60%

Project progress automatically updates when tasks are created, updated, or deleted.

🔒 Security
Passwords are hashed using bcryptjs.
JWT is used for authentication.
Protected routes require a valid JWT.
Users can only access projects they own or are members of.
Project owners control team membership.
Passwords are never returned in API responses.
Password changes require the current password.
📱 Responsive Design

NOVA is designed to provide a responsive experience across:

Desktop
Tablet
Mobile

The UI uses responsive layouts and Tailwind CSS utilities.

🧪 Testing

API endpoints can be tested using Postman.

Recommended testing flow:

1. Register a user
2. Login
3. Get JWT token
4. Use Bearer authentication
5. Create a project
6. Add team members
7. Create tasks
8. Assign tasks
9. Update task status
10. Verify project progress
11. Add comments
12. Check dashboard statistics
13. Update profile
14. Test password change
15. Test logout
16. Test unauthorized requests
🔮 Future Improvements

Possible future enhancements include:

Real-time notifications
WebSocket-based collaboration
File attachments
Advanced analytics
Calendar integration
Email notifications
Role-based permissions
Advanced search and filtering
Dark mode
Detailed activity history
👨‍💻 Author

Tanay Pant

B.Tech — Computer Science Engineering

Interested in:

Full-Stack Development
Backend Development
Java / Spring Boot
Node.js
Data & Analytics
📄 License

This project was developed as a full-stack development internship/assignment project.


https://github.com/TaNaY963/NOVA.git