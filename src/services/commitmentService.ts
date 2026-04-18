import api, { COMMITMENTS_ENDPOINT } from './api';
import { Commitment } from '../types';

export const commitmentService = {
  getAll: async (status?: string, contactId?: string): Promise<Commitment[]> => {
    const response = await api.get(COMMITMENTS_ENDPOINT, {
      params: { status, contact_id: contactId }
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<Commitment>): Promise<Commitment> => {
    const response = await api.patch(`${COMMITMENTS_ENDPOINT}/${id}`, data);
    return response.data;
  }
};
