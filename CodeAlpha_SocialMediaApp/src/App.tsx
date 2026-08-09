import React, { useState } from 'react';
import { SocialMediaProvider, useSocialMedia } from './data/store';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { Explore } from './components/Explore';
import { Messaging } from './components/Messaging';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { Auth } from './components/Auth';
import { IndiaNews } from './components/IndiaNews';

const AppContent: React.FC = () => {
  const { currentUser } = useSocialMedia();
  
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createPostOpen, setCreatePostOpen] = useState<boolean>(false);

  // If user is not authenticated, show the gateway
  if (!currentUser) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col font-sans">
      
      {/* GLOBAL HEADER HEADER */}
      <Navbar 
        onSearchChange={setSearchQuery} 
        searchQuery={searchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedProfileId={setSelectedProfileId}
      />

      {/* CORE WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        
        {/* SIDE NAVIGATION PANEL (Left column on desktop, Hidden on mobile with triggers) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setSelectedProfileId={setSelectedProfileId}
          openCreatePostModal={() => setCreatePostOpen(true)}
        />

        {/* ACTIVE WORKSPACE AREA (Middle / Right columns) */}
        <div className="flex-1 min-w-0" id="main_workspace_panel">
          {activeTab === 'news' && (
            <IndiaNews />
          )}

          {activeTab === 'feed' && (
            <Feed 
              searchQuery={searchQuery}
              setActiveTab={setActiveTab}
              setSelectedProfileId={setSelectedProfileId}
              createPostOpen={createPostOpen}
              setCreatePostOpen={setCreatePostOpen}
            />
          )}

          {activeTab === 'explore' && (
            <Explore 
              onSelectHashtag={(tag) => setSearchQuery(tag)}
              setActiveTab={setActiveTab}
              setSelectedProfileId={setSelectedProfileId}
            />
          )}

          {activeTab === 'messages' && (
            <Messaging />
          )}

          {activeTab === 'saved' && (
            <ProfileView 
              profileId={currentUser.id} 
              setActiveTab={setActiveTab} 
              setSelectedProfileId={setSelectedProfileId}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              profileId={selectedProfileId} 
              setActiveTab={setActiveTab} 
              setSelectedProfileId={setSelectedProfileId}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard />
          )}
        </div>

      </main>
    </div>
  );
};

export default function App() {
  return (
    <SocialMediaProvider>
      <AppContent />
    </SocialMediaProvider>
  );
}
