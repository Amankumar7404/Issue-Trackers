# Issue Tracker

A full-stack Issue Tracker application built with **React, Django REST Framework, and PostgreSQL**. It helps users manage projects, create and track tasks, and collaborate through comments.

## Features

- User authentication using JWT access and refresh tokens
- Project creation, listing, updating, and deletion
- Task creation and management
- Task status and priority tracking
- Task search, filtering, and sorting
- Comments on tasks
- User-specific project and task access
- Permission checks to prevent unauthorized operations
- Responsive user interface
- PostgreSQL database with Docker Compose support

## Tech Stack

**Frontend**

- React
- Vite
- React Router
- Axios
- ESLint

**Backend**

- Python
- Django
- Django REST Framework
- JWT authentication

**Database and Tools**

- PostgreSQL
- Docker Compose
- Git and GitHub

## Project Structure

```text
Issue-Tracker/
├── comments/
├── projects/
├── tasks/
├── users/
├── config/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── index.html
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Prerequisites

Install the following tools before running the project:

- Git
- Docker Desktop with Docker Compose
- Node.js and npm

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Issue-Tracker
```

Replace the repository URL with your actual GitHub repository URL. If your repository has a different name, use that directory name.

### 2. Configure environment variables

Create a `.env` file in the project root:

```dotenv
DB_NAME=issue_tracker_db
DB_USER=postgres
DB_PASSWORD=replace_with_a_strong_password
DB_PORT=5432
```

Use your own strong database password. Never commit `.env` files or real credentials to GitHub.

### 3. Start the backend and database

From the project root, run:

```bash
docker compose up --build -d
```

Apply database migrations:

```bash
docker compose exec web python manage.py migrate
```

Check the container status:

```bash
docker compose ps
```

The backend is configured to run on:

`http://localhost:8000`

### 4. Configure the frontend

Open a second terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

## API Overview

| Method | Endpoint                   | Purpose                  |
| ------ | -------------------------- | ------------------------ |
| POST   | `/api/login/`              | User login               |
| POST   | `/api/signup/`             | User registration        |
| GET    | `/api/profile/`            | Retrieve user profile    |
| GET    | `/api/projects/`           | List accessible projects |
| POST   | `/api/projects/`           | Create a project         |
| GET    | `/api/tasks/?project=<id>` | List tasks for a project |
| POST   | `/api/comments/`           | Create a comment         |

Project, task, and comment detail endpoints support the operations permitted by the application's authentication and authorization rules.

## Testing

### Backend tests

Run Django checks:

```bash
docker compose exec web python manage.py check
```

Run the backend test suite:

```bash
docker compose exec web python manage.py test
```

### Frontend checks

From the `frontend` directory:

```bash
npm run lint
npm run build
npm audit
```

## Security

- Keep environment files and credentials out of version control.
- Use authentication and permission checks for protected operations.
- Keep dependencies updated and review security audit results.
- Configure production secrets and deployment settings separately before deploying publicly.

## Future Improvements

- Add automated deployment
- Add more advanced task collaboration features
- Improve test coverage and user experience
- Deploy the application to a production environment

## Author

Developed as a full-stack project to practise frontend development, REST API design, authentication, database integration, and application security.
