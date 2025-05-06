# ResumeAI Optimizer

An AI-powered resume optimization platform that analyzes your resume against job descriptions and provides personalized recommendations with copyable text suggestions.

## Features

- **Resume Analysis**: Upload your resume and paste a job description to get AI-powered analysis
- **Skills Gap Analysis**: Identifies missing skills and keywords critical for the job
- **Experience Reframing**: Suggestions on how to better present your existing experience
- **Copyable Text Suggestions**: Ready-to-use text snippets you can directly add to your resume
- **Complete Resume Sections**: Pre-formatted sections like Skills, Summary, etc. that can be copied in one click
- **Mobile-Responsive Design**: Works seamlessly on all devices with a clean, intuitive interface
- **PDF Report Generation**: Download a comprehensive analysis report

## Technologies Used

- React.js with TypeScript for the frontend
- Express.js for the backend API
- Tailwind CSS with Shadcn UI components for styling
- OpenAI API for resume analysis
- PostgreSQL for data storage
- PDF parsing and generation libraries

## Detailed Setup Guide

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- PostgreSQL database (local or hosted)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Git

### Local Development Setup


1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```
   # Database configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/resumeai
   
   # OpenAI API key
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional: Port configuration (default: 5000)
   PORT=5000
   ```

3. **Set up PostgreSQL database**
   
   Option 1: Local PostgreSQL installation
   ```bash
   # Create a new database
   createdb resumeai
   
   # Push the schema to the database
   npm run db:push
   ```

4. **Run the application in development mode**
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers. The application will be available at http://localhost:5000.

### Troubleshooting Local Setup

- **Database Connection Issues**:
  - Verify your PostgreSQL service is running
  - Check that the DATABASE_URL is correctly formatted
  - Ensure the database exists and the user has proper permissions

- **OpenAI API Issues**:
  - Verify your API key is correct
  - Check if you have sufficient credits on your OpenAI account
  - Ensure your OpenAI account has access to the GPT-4 model

## Deployment Guide

### Option 1: Deploy on Render

[Render](https://render.com) provides a simple way to deploy full-stack applications.

1. **Create a Render account and sign in**

2. **Set up a new Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure your web service:
     - Name: `resumeai-optimizer`
     - Runtime: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

3. **Set environment variables**
   - Go to "Environment" tab and add:
     - `DATABASE_URL` (Use a production PostgreSQL database URL)
     - `OPENAI_API_KEY`
     - `NODE_ENV=production`

4. **Create a PostgreSQL database**
   - In Render dashboard, create a new PostgreSQL database
   - Copy the provided connection string
   - Update the `DATABASE_URL` environment variable in your web service

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete

### Option 2: Deploy on Vercel

1. **Push your repository to GitHub**

2. **Create a Vercel account and sign in**
   - Go to [Vercel](https://vercel.com) and sign up/sign in

3. **Import your GitHub repository**
   - Click "New Project"
   - Select your repository
   - Configure your project settings

4. **Set up environment variables**
   - Add the following environment variables:
     - `DATABASE_URL`
     - `OPENAI_API_KEY`
     - `NODE_ENV=production`

5. **Configure the build settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete

### Option 3: Deploy on Railway

[Railway](https://railway.app) provides an all-in-one platform with built-in PostgreSQL.

1. **Create a Railway account and sign in**

2. **Create a new project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub repository

3. **Add PostgreSQL database**
   - Click "New" and select "Database" -> "PostgreSQL"
   - This will create a new PostgreSQL instance

4. **Set environment variables**
   - Go to your web service
   - Click on "Variables" tab
   - Add `OPENAI_API_KEY`
   - Railway will automatically set up `DATABASE_URL` for you

5. **Configure service settings**
   - Root directory: `/`
   - Start Command: `npm start`

6. **Deploy and generate a domain**
   - Go to "Settings" and generate a domain

## Maintenance and Updates

### Updating Dependencies

Regularly update dependencies to maintain security and performance:

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# For major version updates
npx npm-check-updates -u
npm install
```

### Database Migrations

When you update the database schema:

```bash
# Push changes to the database
npm run db:push

# For production environments, consider using a migration
npm run db:generate
npm run db:migrate
```

## Usage

1. Upload your resume (PDF, DOC, or DOCX format)
2. Paste the job description you're targeting
3. Click "Analyze Resume" to get AI-powered recommendations
4. Copy the suggested text snippets directly into your resume
5. Download a PDF report for reference

## License

[MIT License](LICENSE)