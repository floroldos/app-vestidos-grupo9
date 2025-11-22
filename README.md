# GlamRent - Dress Rental Platform

A Next.js application for renting designer dresses with real-time availability, image galleries, and an admin panel for managing reservations.

## Prerequisites

- Node.js 18.17 or higher
- npm 9 or higher
- Git

Verify your installation:
```bash
node -v
npm -v
```

## Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/floroldos/app-vestidos-grupo9.git
cd app-vestidos-grupo9
```

2. Install dependencies:
```bash
npm install
```

3. **Configure environment variables:**

Create a `.env` file in the root directory with the following variables:

```env
ADMIN_USER="your_admin_username"
ADMIN_PASSWORD="your_admin_password"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

You can modify these values if needed. The `.env` file is excluded from version control via `.gitignore` for security reasons.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server with hot reload (port 3000)
- `npm run build` - Create production build
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint code quality checks
- `npm run test:e2e` - Run Playwright end-to-end tests

## Environment Variables Explained

### ADMIN_USER
The username for the admin panel login.

### ADMIN_PASSWORD
The password for the admin panel. Should be changed for production deployments.

### NEXT_PUBLIC_BASE_URL
The base URL of the application. Used for API calls and redirects. Set to `http://localhost:3000` for local development. Update this when deploying to production.

## Running with Jenkins

This project includes a `Jenkinsfile` for CI/CD automation.

### Prerequisites
- **Docker Desktop** installed and running
- Jenkins container running on `localhost:8080`

### Starting Jenkins with Docker

1. Make sure Docker Desktop is running on your machine

2. Pull and run Jenkins container:
```bash
docker run -d -p 8080:8080 -p 50000:50000 --name jenkins jenkins/jenkins:lts
```

3. Access Jenkins at `http://localhost:8080`

4. Get the initial admin password:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

5. Complete the Jenkins setup wizard and install suggested plugins

### Setting up the Pipeline

1. Create a new Pipeline job in Jenkins
2. Point it to your repository
3. Ensure the Jenkinsfile is in the root directory
4. Configure environment variables in Jenkins credentials or environment settings
5. Run the pipeline

### Pipeline Stages

The Jenkinsfile includes the following stages:
1. **Checkout** - Clones the repository
2. **Install** - Runs `npm install`
3. **Lint** - Executes ESLint checks
4. **Build** - Creates production build
5. **Test** - Runs Playwright E2E tests
6. **Deploy** - (Optional) Deploy to target environment

**Note:** Make sure Docker Desktop is running before attempting to access Jenkins at `http://localhost:8080`.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Testing:** Playwright (E2E)
- **Date Management:** react-datepicker, date-fns
- **Authentication:** JWT (jsonwebtoken)

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Home page
│   │   ├── search/         # Catalog/search page
│   │   ├── items/[id]/     # Item detail page
│   │   ├── admin/          # Admin panel
│   │   └── api/            # API routes
│   ├── components/         # Reusable React components
│   └── middleware.ts       # Next.js middleware
├── lib/                    # Business logic
├── tests/                  # Playwright E2E tests
├── public/                 # Static assets
└── .env.local             # Environment variables (not in git)
```

## Data Persistence

This application runs in demo mode with in-memory data storage:
- All data is stored in memory during runtime
- Data resets when the server restarts
- No external database required for local development
- Suitable for development and demonstration purposes

## Admin Panel Access

1. Navigate to `/admin/login`
2. Enter the credentials configured in your `.env` file
3. Access the dashboard to manage rental requests

## Troubleshooting

### Port Already in Use
If port 3000 is occupied, specify a different port:

**macOS/Linux:**
```bash
PORT=3001 npm run dev
```

**Windows CMD:**
```cmd
set PORT=3001 && npm run dev
```

**Windows PowerShell:**
```powershell
$env:PORT=3001; npm run dev
```

### Missing Environment Variables
If you see errors about missing environment variables:
1. Ensure `.env` exists in the root directory
2. Verify all required variables are set (ADMIN_USER, ADMIN_PASSWORD, NEXT_PUBLIC_BASE_URL)
3. Restart the development server after creating/modifying `.env`

### Test Failures
If E2E tests fail:
1. Ensure the development server is not running (tests start their own server)
2. Check that all dependencies are installed: `npm install`
3. Run tests with UI to debug: `npm run test:e2e:ui`
