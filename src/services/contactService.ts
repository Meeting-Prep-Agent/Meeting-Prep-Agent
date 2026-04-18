import api, { CONTACTS_ENDPOINT } from './api';
import { Contact } from '../types';

export const contactService = {
  getAll: async (): Promise<Contact[]> => {
    const response = await api.get(CONTACTS_ENDPOINT);
    return response.data;
  },
  
  getById: async (id: string): Promise<Contact> => {
    const response = await api.get(`${CONTACTS_ENDPOINT}/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<Contact>): Promise<Contact> => {
    const response = await api.post(CONTACTS_ENDPOINT, data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.patch(`${CONTACTS_ENDPOINT}/${id}`, data);
    return response.data;
  }
};
