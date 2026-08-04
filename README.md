# BugTracker Pro - Issue Tracking System

A fully functional Jira-like Bug/Issue Tracking System Built with Java springboot, React, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **User Authentication: Register**, login, and JWT-based session management
- **Role-Based Access Control**: Admin, Manager, and Developer roles with different permissions
- **Project Management**: Create, edit, delete projects and manage team members
- **Issue/Ticket Management**: Full CRUD operations with priority and status management
- **Kanban Board**: Drag-and-drop interface with three columns (To Do → In Progress → Done)

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Router** - Navigation
- **@dnd-kit** - Drag and drop functionality
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Java 17+** with **Spring Boot**
- **Spring Security** with JWT authentication
- **Hibernate/JPA** for ORM
- **PostgreSQL/MySQL** database
- **Swagger/OpenAPI** documentation

## Project Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   └── Sidebar.tsx      # Navigation sidebar
│   ├── ui/
│   │   ├── Badge.tsx        # Badge component
│   │   ├── Button.tsx       # Button component
│   │   ├── Card.tsx         # Card component
│   │   ├── Input.tsx        # Input component
│   │   ├── Modal.tsx        # Modal component
│   │   ├── Select.tsx       # Select component
│   │   └── TextArea.tsx     # TextArea component
│   └── ProtectedRoute.tsx   # Route protection
├── pages/
│   ├── Dashboard.tsx        # Dashboard page
│   ├── KanbanBoard.tsx      # Kanban board with drag-and-drop
│   ├── Login.tsx            # Login page
│   ├── Profile.tsx          # User profile page
│   ├── Projects.tsx         # Projects management
│   ├── Register.tsx         # Registration page
│   └── TicketDetails.tsx    # Ticket details page
├── store/
│   ├── authStore.ts         # Authentication state
│   ├── commentStore.ts      # Comments state
│   ├── projectStore.ts      # Projects state
│   └── ticketStore.ts       # Tickets state
├── types/
│   └── index.ts             # TypeScript types
├── utils/
│   └── cn.ts                # Class name utility
├── App.tsx                  # Main app component
├── index.css                # Global styles
└── main.tsx                 # Entry point
```


## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
bash
git clone 
cd bugtrackerpro


2. **Install dependencies**
bash
npm install

3. **Start development server**
bash
npm run dev


## Demo Credentials

Use these credentials to login:

 Email | Password |
 dev@bugtracker.com | dev123 |


Built with ❤️ using Java Spring Boot and React.
