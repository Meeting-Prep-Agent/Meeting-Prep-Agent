import React from 'react';
import { Target, Copy, Check } from 'lucide-react';
import { Card } from '../common/Card';
import { useState } from 'react';

interface TalkingPointsListProps {
  points: string[];
}

export const TalkingPointsList: React.FC<TalkingPointsListProps> = ({ points }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="p-10">
      <h4 className="font-bold text-muted-foreground text-[10px] tracking-widest uppercase mb-8 flex items-center">
        <Target size={16} className="mr-3 text-primary" />
        Critical Talking Points
      </h4>
      <div className="space-y-6">
        {points.map((pt, i) => (
          <div key={i} className="flex items-start space-x-5 group relative">
            <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-secondary border border-border flex items-center justify-center font-bold text-primary text-[10px] mt-1">
              {i + 1}
            </div>
            <p className="text-foreground/90 leading-relaxed text-lg flex-1">
              {pt}
            </p>
            <button 
              onClick={() => handleCopy(pt, i)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              title="Copy to clipboard"
            >
              {copiedIndex === i ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
