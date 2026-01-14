import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { Landing } from './screens/Landing';
import { Login } from './screens/Login';
import { Home } from './screens/Home';
import { InspectionScreen } from './screens/Inspection';
import { ChatScreen } from './screens/ChatAI';
import { HistoryScreen } from './screens/History';
import { ProfileScreen } from './screens/Profile';
import { P2HFormScreen } from './screens/P2HFormScreen';
import { QRScannerScreen } from './screens/QRScannerScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { NotificationScreen } from './screens/NotificationScreen';
import { ScreenName } from './types';

interface UserData {
  id: number;
  name: string;
  role: string;
  employeeId: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('landing');
  const [user, setUser] = useState<UserData | null>(null);

  // Helper to determine if we should show bottom nav
  const showBottomNav = !['landing', 'login', 'p2h-form', 'qr-scan'].includes(currentScreen);

  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing onNavigate={setCurrentScreen} />;
      case 'login':
        return <Login onNavigate={setCurrentScreen} onLoginSuccess={handleLoginSuccess} />;
      case 'home':
        return <Home onNavigate={setCurrentScreen} user={user} />;
      case 'inspection':
        return <InspectionScreen onNavigate={setCurrentScreen} />;
      case 'chat':
        return <ChatScreen user={user} />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileScreen onNavigate={setCurrentScreen} user={user} />;
      case 'p2h-form':
        return <P2HFormScreen onNavigate={setCurrentScreen} user={user} />;
      case 'qr-scan':
        return <QRScannerScreen onNavigate={setCurrentScreen} />;
      case 'schedule':
        return <ScheduleScreen onNavigate={setCurrentScreen} user={user} />;
      case 'notifications':
        return <NotificationScreen onNavigate={setCurrentScreen} />;
      default:
        return <Landing onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <Layout>
      <main className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </main>

      {showBottomNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
      )}
    </Layout>
  );
}

export default App;