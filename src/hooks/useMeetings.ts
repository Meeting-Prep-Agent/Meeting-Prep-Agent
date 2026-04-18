import { useState, useCallback } from 'react';
import { Meeting } from '../types';
import { meetingService } from '../services/meetingService';

export const useMeetings = (contactId?: string) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const data = await meetingService.getHistory(contactId);
      setMeetings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch meeting history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  const uploadMeeting = async (transcript: string) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const newMeeting = await meetingService.upload(contactId, transcript);
      setMeetings(prev => [newMeeting, ...prev]);
      return newMeeting;
    } catch (err) {
      setError('Failed to upload meeting');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { meetings, loading, error, fetchHistory, uploadMeeting };
};
