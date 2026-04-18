'use client';

import React, { useState, useEffect } from 'react';
import { ContactList } from '../components/contacts/ContactList';
import { MeetingUploadForm } from '../components/meetings/MeetingUploadForm';
import { MeetingList } from '../components/meetings/MeetingList';
import { StrategySection } from '../components/prep_brief/StrategySection';
import { TalkingPointsList } from '../components/prep_brief/TalkingPointsList';
import { BehavioralIntel } from '../components/prep_brief/BehavioralIntel';
import { RedFlags } from '../components/prep_brief/RedFlags';
import { OpenCommitments } from '../components/prep_brief/OpenCommitments';
import { IntelligenceAgent } from '../components/agent/IntelligenceAgent';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { useContacts } from '../hooks/useContacts';
import { useMeetings } from '../hooks/useMeetings';
import { prepBriefService } from '../services/prepBriefService';
import { Contact, PrepBrief } from '../types';
import { Sparkles, History, FileText, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { contacts, loading: loadingContacts } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'strategy' | 'history' | 'ingest'>('strategy');
  const [brief, setBrief] = useState<PrepBrief | null>(null);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "I'm connected to your Hindsight memory bank. Select a contact to begin strategic synthesis." }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize selected contact
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  const { meetings, loading: loadingHistory, uploadMeeting, fetchHistory } = useMeetings(selectedContact?.id);

  useEffect(() => {
    if (selectedContact && activeTab === 'history') {
      fetchHistory();
    }
  }, [selectedContact, activeTab, fetchHistory]);

  const handleGenerateBrief = async () => {
    if (!selectedContact) return;
    setIsGenerating(true);
    try {
      const data = await prepBriefService.generate(selectedContact.id);
      setBrief(data);
      setActiveTab('strategy');
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've synthesized the tactical brief for ${selectedContact.name}. I've identified ${data.red_flags.length} critical warning signals based on historical patterns.` 
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = (msg: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Analyzing memory for: "${msg}". One moment...` 
      }]);
    }, 1000);
  };

  if (loadingContacts) return <div className="h-screen flex items-center justify-center bg-background"><Spinner size="lg" /></div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* 1. Left Sidebar: Contacts */}
      <div className="w-80 shrink-0">
        <ContactList 
          contacts={contacts} 
          onSelect={setSelectedContact} 
          selectedId={selectedContact?.id} 
        />
      </div>

      {/* 2. Center: Strategic Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FCFCFA]">
        <header className="h-20 border-b border-border flex items-center justify-between px-10 shrink-0 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center border border-border">
              <LayoutDashboard size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">{selectedContact?.name || 'Select Contact'}</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{selectedContact?.title || 'Profile'}</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 bg-secondary/50 p-1 rounded-xl border border-border">
            <TabButton active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} icon={<Sparkles size={14}/>}>Brief</TabButton>
            <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={14}/>}>Memory</TabButton>
            <TabButton active={activeTab === 'ingest'} onClick={() => setActiveTab('ingest')} icon={<FileText size={14}/>}>Ingest</TabButton>
          </nav>

          <Button variant="primary" onClick={handleGenerateBrief} loading={isGenerating}>
            <Sparkles size={14} />
            <span>Generate Brief</span>
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-10 pb-32">
          {activeTab === 'strategy' && (
            <>
              {brief ? (
                <>
                  <StrategySection 
                    narrative={brief.last_meeting_summary} 
                    recommendation={brief.recommended_strategy} 
                  />
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                      <TalkingPointsList points={brief.talking_points} />
                      <OpenCommitments commitments={brief.open_commitments} />
                    </div>
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                      <BehavioralIntel insights={brief.behavioral_insights} />
                      <RedFlags flags={brief.red_flags} />
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState 
                  title="Strategy Synthesis Required" 
                  description="No tactical brief has been generated for this contact yet."
                  action={<Button onClick={handleGenerateBrief} loading={isGenerating}>Generate Brief</Button>}
                />
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              {loadingHistory ? <Spinner /> : <MeetingList meetings={meetings} onSelect={(m) => console.log(m)} selectedId={''} />}
            </div>
          )}

          {activeTab === 'ingest' && (
            <div className="max-w-4xl mx-auto">
              <MeetingUploadForm 
                onUpload={async (t) => {
                  await uploadMeeting(t);
                  setActiveTab('history');
                }} 
                isUploading={loadingHistory} 
              />
            </div>
          )}
        </main>
      </div>

      <IntelligenceAgent 
        messages={chatMessages} 
        onSendMessage={handleSendMessage} 
        isLoading={false} 
      />
    </div>
  );
}

const TabButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode}> = ({ active, onClick, children, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
      active ? 'bg-white text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const EmptyState: React.FC<{title: string, description: string, action?: React.ReactNode}> = ({ title, description, action }) => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border border-border">
      <Sparkles size={32} className="text-muted-foreground opacity-20" />
    </div>
    <div className="max-w-md space-y-2">
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    {action}
  </div>
);
