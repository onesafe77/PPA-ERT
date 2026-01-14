import { Inspection, KPI } from './types';

export const MOCK_KPI: KPI[] = [
  { label: 'P2H Hari Ini', value: '8/10', trend: 'up' },
  { label: 'Unit Not Ready', value: '1', trend: 'down' },
  { label: 'Gear Expired', value: '2', trend: 'neutral' },
];

export const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'P2H-089',
    title: 'P2H Unit Fire Truck 01',
    type: 'P2H',
    location: 'Station 1',
    date: 'Hari ini, 07:00',
    status: 'NOT READY',
    severity: 'Critical',
  },
  {
    id: 'GEAR-112',
    title: 'Inspeksi SCBA Set A',
    type: 'Gear',
    location: 'Warehouse B',
    date: 'Kemarin',
    status: 'READY',
    severity: 'Low',
  },
  {
    id: 'P2H-088',
    title: 'P2H Ambulance 02',
    type: 'P2H',
    location: 'Station Main',
    date: '24 Okt',
    status: 'Approved',
    severity: 'Low',
  },
  {
    id: 'GEAR-105',
    title: 'Cek APAR Area Produksi',
    type: 'Gear',
    location: 'Zone C',
    date: '23 Okt',
    status: 'Draft',
    severity: 'Medium',
  },
];

export const QUICK_PROMPTS = [
  "Ringkas inspeksi",
  "Analisa temuan",
  "Buat tindakan korektif",
  "Klasifikasi severity"
];