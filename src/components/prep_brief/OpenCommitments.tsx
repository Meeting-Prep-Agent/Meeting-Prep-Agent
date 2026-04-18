import React from 'react';
import { ListChecks, Clock, User } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface Commitment {
  desc: string;
  id?: string;
  due_date?: string;
  owner?: string;
  status?: string;
}

interface OpenCommitmentsProps {
  commitments: Commitment[];
}

export const OpenCommitments: React.FC<OpenCommitmentsProps> = ({ commitments }) => {
  if (!commitments.length) return null;

  return (
    <Card className="p-8">
      <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-6 flex items-center">
        <ListChecks size={16} className="mr-3 text-primary" />
        Pending Execution Items
      </h4>
      <div className="space-y-4">
        {commitments.map((c, i) => {
          const isOverdue = c.due_date && new Date(c.due_date) < new Date();
          
          return (
            <div key={c.id || i} className="p-5 rounded-2xl bg-secondary/30 border border-border group hover:bg-secondary/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                 <p className="text-sm font-medium text-foreground leading-relaxed flex-1 mr-4">
                   {c.desc}
                 </p>
                 {isOverdue && <Badge variant="error" className="flex-shrink-0">Overdue</Badge>}
              </div>
              <div className="flex items-center space-x-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.05em]">
                <div className="flex items-center">
                  <User size={12} className="mr-2 opacity-50" />
                  {c.owner || 'External'}
                </div>
                <div className="flex items-center">
                  <Clock size={12} className="mr-2 opacity-50" />
                  {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'No Deadline'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
