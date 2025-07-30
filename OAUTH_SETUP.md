# Google OAuth Setup for Sui zkLogin

This guide will help you set up Google OAuth for the Sui zkLogin authentication in your Personal Data Wallet.

## Prerequisites

- Google Cloud Platform account
- Your application running on `http://localhost:3000`

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Personal Data Wallet")
5. Click "Create"

### 2. Enable the Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (for testing)
3. Fill in the required fields:
   - App name: "Personal Data Wallet"
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Skip the "Scopes" step for now
6. Add test users (your email) in the "Test users" section
7. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Set the name: "Personal Data Wallet Web Client"
5. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
6. Click "Create"
7. Copy the Client ID from the popup

### 5. Update Your Application

1. Open `/app/hooks/use-sui-auth.ts`
2. Replace `'your-google-client-id'` with your actual Client ID:
   ```typescript
   const CLIENT_ID = 'your-actual-client-id-here.apps.googleusercontent.com'
   ```

### 6. Test the Setup

1. Start your backend: `npm run backend`
2. Start your frontend: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Click "Login with Google (zkLogin)"
5. Complete the OAuth flow

## Development Mode

For development and testing without OAuth setup, the app automatically runs in development mode with simulated authentication when the Client ID is not configured.

## Troubleshooting

### Common Issues

1. **"OAuth client was not found" error**:
   - Double-check your Client ID is correct
   - Ensure the redirect URI matches exactly: `http://localhost:3000/auth/callback`

2. **"redirect_uri_mismatch" error**:
   - Verify the redirect URI is added to your OAuth client configuration
   - Check for typos in the URL

3. **App not verified warning**:
   - This is normal for development. Click "Advanced" > "Go to Personal Data Wallet (unsafe)"
   - For production, you'll need to verify your app with Google

### Testing Without OAuth

The application includes a development mode that works without OAuth configuration. Just click "Continue (Dev Mode)" to test the application functionality.

## Production Deployment

For production deployment:

1. Update the redirect URI to your production domain
2. Complete the OAuth app verification process with Google
3. Update the `REDIRECT_URI` in your code to match your production URL
4. Set proper environment variables for production

## Security Notes

- Never commit your OAuth Client ID to version control if it's sensitive
- Consider using environment variables for configuration
- The current setup is for development/testing only
- For production, implement proper security measures and app verification

## Support

If you encounter issues:
1. Check the Google Cloud Console error logs
2. Verify all URLs match exactly
3. Ensure your Google Cloud project has the necessary APIs enabled
4. Try the development mode first to test other functionality