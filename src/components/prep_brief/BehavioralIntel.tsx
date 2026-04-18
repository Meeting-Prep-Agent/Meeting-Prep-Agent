import React from 'react';
import { Card } from '../common/Card';

interface TraitBarProps {
  label: string;
  value: string;
}

const TraitBar: React.FC<TraitBarProps> = ({ label, value }) => {
  const percentage = parseInt(value) || 50;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
};

interface BehavioralIntelProps {
  insights: {
    communication_style?: string;
    decision_pattern?: string;
    hot_button_topics?: string[];
    intelligence_confidence?: number;
  };
}

export const BehavioralIntel: React.FC<BehavioralIntelProps> = ({ insights }) => {
  return (
    <Card className="p-8 bg-secondary/20 shadow-none">
      <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-8">Disposition Intelligence</h4>
      
      <div className="space-y-6 mb-10">
        <TraitBar label="Decision Confidence" value={`${Math.round((insights.intelligence_confidence || 0.5) * 100)}%`} />
        {/* Mock other bars for demonstration since they aren't explicitly in the schema yet but part of the UI design */}
        <TraitBar label="Analytical Focus" value="75%" />
        <TraitBar label="Risk Tolerance" value="40%" />
      </div>

      <div className="p-6 rounded-2xl bg-white border border-border">
         <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Communication Style</h5>
         <p className="text-sm font-medium text-foreground mb-6">
           {insights.communication_style || 'Undetermined'} — {insights.decision_pattern || 'Analyzing decision patterns...'}
         </p>

         <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Hot Button Topics</h5>
         <div className="flex flex-wrap gap-2">
            {insights.hot_button_topics?.map((topic, i) => (
              <span key={i} className="px-3 py-1 bg-secondary text-xs font-semibold rounded-lg border border-border">
                {topic}
              </span>
            ))}
            {!insights.hot_button_topics?.length && <span className="text-xs text-muted-foreground italic">None identified</span>}
         </div>
      </div>
      
      <div className="mt-8 text-[10px] text-muted-foreground leading-relaxed text-center">
        Insights cross-referenced with Hindsight memory models.
      </div>
    </Card>
  );
};
