import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './Layout';
import Home from './Pages/Home';
import GoodHabits from './Pages/GoodHabits';
import BadHabits from './Pages/BadHabits';
import Objectives from './Pages/Objectives';
import Skills from './Pages/Skills';
import Market from './Pages/market';
import CharacterSettings from './Pages/CharacterSettings';
import ActivityLog from './Pages/ActivityLog';
import Inventory from './Pages/Inventory';
import BossArena from './Pages/BossArena';
import Quests from './Pages/Quests';
import Dashboard from './Pages/Dashboard';
import Forge from './Pages/Forge';
import { themeService } from './services/themeService';
import { initializeDefaultData } from './components/storage/LocalStorage';

function App() {
  useEffect(() => {
    // Initialize default data on app load
    initializeDefaultData();
    themeService.applyToDOM();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/good-habits" element={<GoodHabits />} />
          <Route path="/bad-habits" element={<BadHabits />} />
          <Route path="/objectives" element={<Objectives />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/market" element={<Market />} />
          <Route path="/character-settings" element={<CharacterSettings />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/boss-arena" element={<BossArena />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/activity-log" element={<ActivityLog />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forge" element={<Forge />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#020617',
            border: '1px solid #1e293b',
            color: '#f1f5f9',
          },
        }}
      />
    </Router>
  );
}

export default App;
