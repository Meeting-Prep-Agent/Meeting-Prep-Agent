import api, { PREP_BRIEF_ENDPOINT } from './api';
import { PrepBrief } from '../types';

export const prepBriefService = {
  generate: async (contactId: string, context?: string): Promise<PrepBrief> => {
    const response = await api.post(`${PREP_BRIEF_ENDPOINT}/generate`, {
      contact_id: contactId,
      optional_context: context
    });
    return response.data;
  },
  
  getById: async (id: string): Promise<PrepBrief> => {
    const response = await api.get(`${PREP_BRIEF_ENDPOINT}/${id}`);
    return response.data;
  }
};
