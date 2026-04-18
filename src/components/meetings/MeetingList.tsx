import React from 'react';
import { Calendar, MessageSquare, Quote } from 'lucide-react';
import { Card } from '../common/Card';
import { Meeting } from '../../types';
import { Badge } from '../common/Badge';

interface MeetingListProps {
  meetings: Meeting[];
  onSelect: (meeting: Meeting) => void;
  selectedId?: string;
}

export const MeetingList: React.FC<MeetingListProps> = ({ meetings, onSelect, selectedId }) => {
  if (!meetings.length) {
    return (
      <Card className="p-20 text-center flex flex-col items-center justify-center space-y-4 border-dashed bg-secondary/10">
        <div className="p-4 bg-white rounded-full border border-border">
          <MessageSquare className="text-muted-foreground opacity-20" size={32} />
        </div>
        <div>
          <h4 className="font-bold text-foreground">No Interactions Recorded</h4>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Once you ingest transcripts, the historical memory bank will populate here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6 px-2">
        <Calendar size={14} className="text-primary" />
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chronological Memory Bank</h4>
      </div>
      
      {meetings.map((m) => (
        <Card 
          key={m.id}
          onClick={() => onSelect(m)}
          className={`p-6 cursor-pointer transition-all hover:border-primary/30 group ${
            selectedId === m.id ? 'border-primary ring-4 ring-primary/5' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                 {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
               <Badge variant={m.sentiment_score > 0 ? 'success' : m.sentiment_score < 0 ? 'error' : 'secondary'}>
                 {m.tone_analysis || 'Neutral'}
               </Badge>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="mt-1 opacity-20">
              <Quote size={16} />
            </div>
            <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed italic">
              {m.summary}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {m.key_topics?.slice(0, 3).map((topic, i) => (
              <span key={i} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-sm">
                #{topic}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
