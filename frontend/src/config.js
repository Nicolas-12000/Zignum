// Application configuration

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  awsRegion: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  cognito: {
    doctorsPoolId: import.meta.env.VITE_COGNITO_DOCTORS_POOL_ID || '',
    doctorsClientId: import.meta.env.VITE_COGNITO_DOCTORS_CLIENT_ID || '',
    patientsPoolId: import.meta.env.VITE_COGNITO_PATIENTS_POOL_ID || '',
    patientsClientId: import.meta.env.VITE_COGNITO_PATIENTS_CLIENT_ID || '',
  }
};
