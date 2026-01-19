import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
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
import { APARInspectionScreen } from './screens/APARInspectionScreen';
import { HydrantInspectionScreen } from './screens/HydrantInspectionScreen';
import { PicaFormScreen } from './screens/PicaFormScreen';
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

  // Helper to determine if we should show navigation
  const showNav = !['landing', 'login', 'p2h-form', 'qr-scan', 'apar-form', 'hydrant-form', 'pica-form'].includes(currentScreen);

  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('landing');
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
      case 'apar-form':
        return <APARInspectionScreen onNavigate={setCurrentScreen} user={user} />;
      case 'hydrant-form':
        return <HydrantInspectionScreen onNavigate={setCurrentScreen} user={user} />;
      case 'pica-form':
        return <PicaFormScreen onNavigate={setCurrentScreen} user={user} />;
      default:
        return <Landing onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <Layout>
      {/* Desktop Sidebar */}
      {showNav && (
        <DesktopSidebar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content with responsive padding */}
      <main className={`flex-1 relative min-h-screen ${showNav ? 'md:ml-64' : ''}`}>
        {renderScreen()}
      </main>

      {/* Mobile Bottom Navigation */}
      {showNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
        />
      )}
    </Layout>
  );
}

export default App;