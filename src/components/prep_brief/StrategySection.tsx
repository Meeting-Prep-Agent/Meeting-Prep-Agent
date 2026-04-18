import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';

interface StrategySectionProps {
  narrative: string;
  recommendation: string;
}

export const StrategySection: React.FC<StrategySectionProps> = ({ narrative, recommendation }) => {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Primary Narrative */}
      <Card className="col-span-12 lg:col-span-8 p-10 relative group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
          <Sparkles size={120} />
        </div>
        <div className="relative">
          <div className="flex items-center space-x-3 mb-8">
             <div className="p-2 bg-primary/10 rounded-lg">
               <TrendingUp size={16} className="text-primary" />
             </div>
             <h3 className="font-bold text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Intelligence Synthesis</h3>
          </div>
          <p className="text-3xl font-serif leading-[1.4] text-foreground">
            {narrative}
          </p>
        </div>
      </Card>

      {/* Core Strategy Highlight */}
      <Card className="col-span-12 lg:col-span-4 p-10 bg-secondary flex flex-col justify-center">
        <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-4">Tactical Approach</h4>
        <p className="text-2xl font-serif text-foreground leading-tight">
          {recommendation}
        </p>
      </Card>
    </div>
  );
};
