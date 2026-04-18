import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';

interface RedFlagsProps {
  flags: string[];
}

export const RedFlags: React.FC<RedFlagsProps> = ({ flags }) => {
  if (!flags.length) return null;

  return (
    <Card className="p-8 border-red-100 bg-red-50/30">
      <h4 className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-6 flex items-center">
        <AlertTriangle size={16} className="mr-3" />
        Strategic Warning Signals
      </h4>
      <div className="space-y-4">
        {flags.map((flag, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-red-50 shadow-sm">
            <AlertCircle size={16} className="text-red-500 mt-1 flex-shrink-0" />
            <p className="text-sm font-medium text-red-900 leading-relaxed italic">
              "{flag}"
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
