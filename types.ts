export type ScreenName = 'landing' | 'login' | 'home' | 'inspection' | 'chat' | 'history' | 'profile' | 'p2h-form' | 'qr-scan' | 'schedule' | 'notifications';

export interface Inspection {
  id: string;
  title: string;
  type: 'P2H' | 'Gear';
  location: string;
  date: string;
  status: 'READY' | 'NOT READY' | 'Draft' | 'Submitted' | 'Approved';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface NavItem {
  id: ScreenName;
  label: string;
  icon: any;
  badge?: string | boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface KPI {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}