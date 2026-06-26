# Aarambh - School Management System

Aarambh is a comprehensive, multi-role School Management System designed to streamline administrative tasks, enhance teacher-student communication, and provide a unified platform for managing school operations.

## 🚀 Features

- **Multi-Role Dashboards**: Dedicated interfaces for Admins, Teachers, and Students.
- **Attendance Management**: Track and monitor student attendance.
- **Fee Management**: Manage and track fee payments and dues.
- **Assignments**: Teachers can upload assignments; students can view and submit them.
- **Library System**: Manage school library resources.
- **Calendar & Events**: School-wide calendar for events and holidays.
- **Real-time Notifications**: Integrated with WhatsApp Web JS for automated WhatsApp notifications.
- **Email Integration**: Ethereal email configured for zero-config testing.
- **File Uploads**: Secure file uploads using Multer.
- **Authentication & Security**: JWT-based authentication and Bcrypt password hashing.

## 🛠️ Technology Stack

**Frontend:**
- **React.js** (v19)
- **Vite** (Build Tool)
- **React Router DOM** (Routing)
- **Recharts** (Data Visualization)
- **jsPDF & jsPDF-AutoTable** (PDF Report Generation)
- **Lucide React** (Icons)

**Backend:**
- **Node.js & Express.js**
- **SQLite3** (Database)
- **jsonwebtoken (JWT)** (Authentication)
- **bcrypt** (Password Hashing)
- **whatsapp-web.js** (WhatsApp Bot Integration)
- **multer** (File Uploads)
- **nodemailer** (Email Services)

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** (v16 or higher)
- **npm** (Node Package Manager)
- Google Chrome (Required for WhatsApp Bot Puppeteer)

## 💻 Installation & Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/Jaspreet-93/Aarambh-.git
   cd Aarambh-
   ```

2. **Install Frontend Dependencies:**
   In the root directory, run:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   Navigate to the `server` directory and install packages:
   ```bash
   cd server
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory based on the provided setup. Example:
   ```env
   SECRET_KEY=your_secret_jwt_key
   ```

## ▶️ Execution Flow

### Starting the Backend Server
The backend server handles API requests, database interactions, and the WhatsApp robot.
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Start the server:
   ```bash
   node server.js
   ```
   *Note: On first run, it will initialize the SQLite database and generate a QR code in the console. Scan this QR code with your WhatsApp app (Linked Devices) to activate the WhatsApp robot.*

### Starting the Frontend Client
1. Open a new terminal and navigate to the project root directory.
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## 📊 Working & Execution Flowchart

```mermaid
graph TD
    A[User accesses Frontend via Browser] -->|Login| B(React App - Vite Dev Server)
    B -->|API Request / Auth| C{Express Backend Server}
    C -->|Validate Credentials| D[(SQLite Database)]
    D -->|Return Data| C
    C -->|Generate JWT Token| B
    B -->|Role-Based Routing| E[Admin Dashboard]
    B -->|Role-Based Routing| F[Teacher Dashboard]
    B -->|Role-Based Routing| G[Student Dashboard]
    
    C -->|Triggers| H[WhatsApp Bot]
    C -->|Triggers| I[Nodemailer Email]
    
    H -->|Send Notification| J[WhatsApp User]
    I -->|Send Email| K[Ethereal / User Email]
    
    E -->|Manage| L[Fees, Attendance, Students, Classes]
    F -->|Manage| M[Assignments, Attendance]
    G -->|View| N[Assignments, Fees, Calendar]
```

## 📝 Available Commands

### Frontend (Root Directory)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Runs Oxlint to catch code quality issues.
- `npm run preview`: Locally preview the production build.

### Backend (`server` Directory)
- `node server.js`: Starts the Express server and initializes the WhatsApp client.
- `node migrate.js` / `node migrate-assignments.js`: Run database migration scripts (if needed).

## 🤝 Contributing
Contributions are welcome! Feel free to open a pull request or an issue if you have suggestions.
