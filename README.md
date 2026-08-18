# Gupta Library Management System

**Location**: Sasamusa, Gopalganj, Bihar - 841505  
**Email**: guptalibraryy@gmail.com  
**Helpline**: +91 94312 88990  

---

## 🚀 How to Deploy on Vercel

### Method 1: Deploy using Vercel CLI (Quickest)
1. Open PowerShell or Command Prompt.
2. Navigate to this folder:
   ```bash
   cd C:\Users\DELL\.gemini\antigravity\scratch\gupta-library
   ```
3. Run Vercel deploy:
   ```bash
   npx vercel
   ```
4. Follow the on-screen prompts (log in with your Vercel account, accept default options).
5. For production deployment, run:
   ```bash
   npx vercel --prod
   ```

### Method 2: Deploy via GitHub + Vercel Web Dashboard (Recommended)
1. Push this folder to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Gupta Library"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** &rarr; **"Project"**.
4. Select your `gupta-library` repository and click **"Deploy"**.
5. Your library web app will be live with a free `.vercel.app` URL and SSL certificate!
