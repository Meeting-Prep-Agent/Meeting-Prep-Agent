import React from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Contact } from '../../types';
import { cn } from '../../utils/cn';

interface ContactListProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  selectedId?: string;
}

export const ContactList: React.FC<ContactListProps> = ({ contacts, onSelect, selectedId }) => {
  return (
    <div className="flex flex-col h-full bg-secondary/10 border-r border-border">
      {/* Search & Actions */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Directory</h3>
           <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-primary">
             <UserPlus size={16} />
           </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="w-full bg-white border border-border rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-1">
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={cn(
              "w-full text-left p-4 rounded-2xl transition-all group",
              selectedId === c.id 
                ? "bg-white border border-border shadow-sm" 
                : "hover:bg-secondary/50 border border-transparent"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-serif text-lg",
                selectedId === c.id ? "bg-primary text-white" : "bg-white border border-border text-foreground"
              )}>
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold truncate transition-colors",
                  selectedId === c.id ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                )}>
                  {c.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">
                  {c.title} @ {c.company}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
