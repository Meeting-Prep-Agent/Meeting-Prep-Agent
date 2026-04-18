import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// API Endpoints
export const CONTACTS_ENDPOINT = '/contacts';
export const MEETINGS_ENDPOINT = '/meetings';
export const COMMITMENTS_ENDPOINT = '/commitments';
export const PREP_BRIEF_ENDPOINT = '/prep-brief';
