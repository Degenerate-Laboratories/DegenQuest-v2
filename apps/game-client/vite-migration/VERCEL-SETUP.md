# Vercel Deployment Setup Guide

This document outlines the steps to set up Vercel deployment with GitHub Actions for the game client.

## Vercel Setup

1. Create a Vercel account at https://vercel.com if you don't have one already.

2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Log in to Vercel from the CLI:
   ```bash
   vercel login
   ```

4. Link your project to Vercel:
   ```bash
   cd apps/game-client
   vercel link
   ```

5. Set up environment variables in Vercel:
   - Go to the Vercel project settings
   - Navigate to the "Environment Variables" section
   - Add any necessary environment variables used in the application

## GitHub Actions Setup

1. Add the following secrets to your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token (get it from Vercel account settings)
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

   You can get the Org ID and Project ID by running:
   ```bash
   vercel project ls
   ```

2. Make sure the GitHub Actions workflow files are placed in the `.github/workflows/` directory:
   - `vercel-deploy.yml` for production deployments
   - `vercel-preview.yml` for preview deployments

3. Push your code to trigger the workflows:
   - Pushing to `main` or `master` will trigger a production deployment
   - Creating a pull request will trigger a preview deployment

## Configuration Overview

The deployment process uses two main configuration files:

1. `vercel.json` - Contains Vercel-specific configuration:
   - Build command
   - Output directory
   - Framework identifier
   - URL rewrites for SPA routing
   - Custom headers

2. GitHub Actions Workflows:
   - Production deployment workflow runs on pushes to main/master
   - Preview deployment workflow runs on pull requests
   - Both workflows use the Vercel CLI to build and deploy the app

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for any errors
2. Verify that all required secrets are set correctly
3. Make sure the Vercel project is linked properly
4. Confirm that the build process works correctly locally

For local verification, run:
```bash
vercel build
``` 