import React, { useState } from 'react';
import { Upload, FileText, Send, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface MeetingUploadFormProps {
  onUpload: (transcript: string) => Promise<void>;
  isUploading: boolean;
}

export const MeetingUploadForm: React.FC<MeetingUploadFormProps> = ({ onUpload, isUploading }) => {
  const [transcript, setTranscript] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    await onUpload(transcript);
    setTranscript('');
  };

  return (
    <Card className="p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Upload size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">Ingest Meeting Intelligence</h3>
          <p className="text-xs text-muted-foreground">Upload raw transcript for Hindsight digestion</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste meeting transcript here..."
            className="w-full min-h-[300px] p-6 rounded-2xl bg-secondary/20 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm leading-relaxed font-serif resize-none"
            disabled={isUploading}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <Sparkles size={12} className="text-primary" />
            <span>AI extraction active</span>
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            loading={isUploading}
            disabled={!transcript.trim()}
          >
            <Send size={16} />
            <span>Analyze Interaction</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};
