import api, { MEETINGS_ENDPOINT } from './api';
import { Meeting } from '../types';

export const meetingService = {
  upload: async (contactId: string, transcript: string): Promise<Meeting> => {
    const response = await api.post(`${MEETINGS_ENDPOINT}/upload`, {
      contact_id: contactId,
      transcript_raw: transcript
    });
    return response.data;
  },
  
  getHistory: async (contactId: string): Promise<Meeting[]> => {
    const response = await api.get(`${MEETINGS_ENDPOINT}/history/${contactId}`);
    return response.data;
  },
  
  getById: async (id: string): Promise<Meeting> => {
    const response = await api.get(`${MEETINGS_ENDPOINT}/${id}`);
    return response.data;
  }
};
