import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface P2HData {
    id: number;
    unitNumber: string;
    vehicleType: string;
    operatorName: string;
    shift: string;
    location: string;
    checklistData: string;
    notes: string;
    status: string;
    createdAt: string;
}

// Walk Around Check items (3 columns)
const WALK_AROUND_CHECK = [
    ['Level Oil Engine', 'Baut Roda', 'Chasis'],
    ['Level Oil Clutch', 'Kondisi Rim', 'Air Cleaner'],
    ['Level Coolant', 'Keausan Tyer', 'Kondisi Battery'],
    ['Level Oil Hydraulic PTO', 'Kondisi Spring', 'Brake Air Tank'],
    ['Oil Steering', 'Pin Spring', 'Emergency Stop'],
    ['Level Water Wipper', 'U Bolt Spring', 'Water Separator'],
    ['Kebocoran All Area', 'Kondisi All Lamp', 'Kondisi /Fungsi AC'],
    ['Wipper', 'Adjusment Aperator Seat', 'Service Brake & Exhaust Brake'],
    ['Kondisi Rubber Torqrod', 'Fungsi Safety Belt & Horn', 'Fungsi Radio Komunikasi']
];

// Attachment Check items (3 columns)
const ATTACHMENT_CHECK = [
    ['Strainer', 'Discharge Hose 2,5', 'Suction Key'],
    ['Spot Lamp', 'Discharge Hose 1,5', 'Fire Axe'],
    ['Suction Hose 6x4 Meter', 'Tail Light', 'Crowbar'],
    ['Spare Tyer', 'Fire Pump Darley', 'Hook'],
    ['Gun Nozzle 2,5', 'Water Cannon', 'Y Connection'],
    ['Gun Nozzle 1,5', 'Water Tank', 'Apar 9 Kg'],
    ['Manilla Rope', 'Fireman Suit', 'Foam Tube'],
    ['Wheel Stopper', 'Foam Tank', '']
];

async function loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
        img.src = url;
    });
}

export async function generateP2HPDF(data: P2HData): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    // Parse checklist data
    let checklistParsed: any = {};
    try {
        checklistParsed = JSON.parse(data.checklistData || '{}');
    } catch (e) {
        checklistParsed = {};
    }

    const checks = checklistParsed.checks || {};
    const hm = checklistParsed.hm || '';
    const simper = checklistParsed.simper || '';
    const kerusakanLain = checklistParsed.kerusakanLain || data.notes || '';
    const signatureUser = checklistParsed.signatureUser || '';
    const signatureDriver = checklistParsed.signatureDriver || '';

    // ============ HEADER ============
    // Logos
    try {
        const ppaLogo = await loadImageAsBase64('/ppa-logo.png');
        if (ppaLogo) doc.addImage(ppaLogo, 'PNG', margin, 5, 15, 15);
    } catch (e) { }

    try {
        const ertLogo = await loadImageAsBase64('/ert-logo.png');
        if (ertLogo) doc.addImage(ertLogo, 'PNG', margin + 17, 5, 15, 15);
    } catch (e) { }

    // Title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text('PROGRAM PEMERIKSAAN HARIAN ( P2H )', 85, 9, { align: 'center' });
    doc.setFontSize(9);
    doc.text('UNIT FIRE TRUK', 85, 15, { align: 'center' });

    // Info fields (right side)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const col1 = 130, col2 = 145, col3 = 175, col4 = 190;
    doc.text('NAMA', col1, 7); doc.text(':', col2, 7); doc.text(data.operatorName || '', col2 + 2, 7);
    doc.text('TGL', col1, 11); doc.text(':', col2, 11); doc.text(new Date(data.createdAt).toLocaleDateString('id-ID'), col2 + 2, 11);
    doc.setFont('helvetica', 'bold'); doc.text('SHIFT', col3, 11); doc.text(':', col4, 11); doc.text(data.shift || '', col4 + 2, 11);
    doc.setFont('helvetica', 'normal');
    doc.text('HM', col1, 15); doc.text(':', col2, 15); doc.text(hm || '', col2 + 2, 15);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 0, 0); doc.text('SIMPER', col3, 15);
    doc.setTextColor(0, 0, 0); doc.text(':', col4, 15); doc.text(simper || '', col4 + 2, 15);
    doc.setFont('helvetica', 'normal');
    doc.text('Unit', col1, 19); doc.text(':', col2, 19); doc.text(data.unitNumber || '', col2 + 2, 19);

    // Red separator line
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, 22, pageWidth - margin, 22);

    // Instruction
    doc.setFontSize(7);
    doc.setTextColor(139, 0, 0);
    doc.text('Pastikan kotak kolom ditandai, contoh (X) kerusakan yang ditemukan, (V) untuk Layak', margin, 26);

    // ============ WALK AROUND CHECK ============
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('WALK ARROUND CHECK', margin, 30);

    const getCheckData = (item: string) => {
        const check = checks[item];
        if (!check) return { status: '', tindakan: '' };
        return {
            status: check.status === 'v' ? 'V' : check.status === 'x' ? 'X' : '',
            tindakan: check.tindakan || ''
        };
    };

    const walkTableData = WALK_AROUND_CHECK.map(row => {
        const d1 = getCheckData(row[0]);
        const d2 = getCheckData(row[1]);
        const d3 = getCheckData(row[2]);
        return [row[0], d1.status, d1.tindakan, row[1], d2.status, d2.tindakan, row[2], d3.status, d3.tindakan];
    });

    autoTable(doc, {
        startY: 32,
        head: [['ITEM CHECK', 'X / V', 'TINDAKAN', 'ITEM CHECK', 'X / V', 'TINDAKAN', 'ITEM CHECK', 'X / V', 'TINDAKAN']],
        body: walkTableData,
        theme: 'grid',
        styles: { fontSize: 5.5, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.15, valign: 'middle' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 5.5 },
        columnStyles: {
            0: { cellWidth: 28 }, 1: { cellWidth: 10, halign: 'center' }, 2: { cellWidth: 25 },
            3: { cellWidth: 28 }, 4: { cellWidth: 10, halign: 'center' }, 5: { cellWidth: 25 },
            6: { cellWidth: 28 }, 7: { cellWidth: 10, halign: 'center' }, 8: { cellWidth: 26 }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
    });

    // ============ ATTACHMENT CHECK ============
    let y = (doc as any).lastAutoTable.finalY + 3;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PENGECHECKAN ATT ACHEMENT', margin, y);

    const attachTableData = ATTACHMENT_CHECK.map(row => {
        const d1 = getCheckData(row[0]);
        const d2 = getCheckData(row[1]);
        const d3 = row[2] ? getCheckData(row[2]) : { status: '', tindakan: '' };
        return [row[0], d1.status, d1.tindakan, row[1], d2.status, d2.tindakan, row[2], d3.status, d3.tindakan];
    });

    autoTable(doc, {
        startY: y + 2,
        head: [['ITEM CHECK', 'X / V', 'TINDAKAN', 'ITEM CHECK', 'X / V', 'TINDAKAN', 'ITEM CHECK', 'X / V', 'TINDAKAN']],
        body: attachTableData,
        theme: 'grid',
        styles: { fontSize: 5.5, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.15, valign: 'middle' },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', fontSize: 5.5 },
        columnStyles: {
            0: { cellWidth: 28 }, 1: { cellWidth: 10, halign: 'center' }, 2: { cellWidth: 25 },
            3: { cellWidth: 28 }, 4: { cellWidth: 10, halign: 'center' }, 5: { cellWidth: 25 },
            6: { cellWidth: 28 }, 7: { cellWidth: 10, halign: 'center' }, 8: { cellWidth: 26 }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
    });

    // ============ KERUSAKAN LAIN ============
    y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Kerusakan Lain:', margin, y);

    // Lines for writing
    doc.setDrawColor(0);
    doc.setLineWidth(0.15);
    doc.line(margin, y + 5, pageWidth - margin, y + 5);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    // Write notes if any
    if (kerusakanLain) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.text(kerusakanLain, margin, y + 4);
    }

    // ============ PARAF USER & DRIVER ============
    y = y + 18;
    const leftCenter = margin + (contentWidth / 4);
    const rightCenter = margin + (contentWidth * 3 / 4);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Tanda Tangan User
    doc.text('Tanda Tangan User:', leftCenter, y, { align: 'center' });
    if (signatureUser) {
        try {
            doc.addImage(signatureUser, 'PNG', leftCenter - 20, y + 2, 40, 15);
        } catch (e) { }
    }
    doc.line(leftCenter - 25, y + 18, leftCenter + 25, y + 18);

    // Tanda Tangan Driver
    doc.text('Tanda Tangan Driver:', rightCenter, y, { align: 'center' });
    if (signatureDriver) {
        try {
            doc.addImage(signatureDriver, 'PNG', rightCenter - 20, y + 2, 40, 15);
        } catch (e) { }
    }
    doc.line(rightCenter - 25, y + 18, rightCenter + 25, y + 18);


    // ============ CATATAN ============
    y = y + 24;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 0, 0);
    doc.text('Catatan:', margin, y);
    // Underline
    doc.setDrawColor(139, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 0.5, margin + 12, y + 0.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Semua mobil kecil yang dioperasikan harus dilakukan pemeriksaan awal sebelum dioperasikan pada setiap shift. Setiap orang yang', margin, y + 4);
    doc.text('mengemudikan mobil kecil harus mengisi checklist ini.', margin, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text('apabila ada kerusakan ada lebih dari 24 jam, maka unit distanbykan sampai dilakukan perbaikan', margin, y + 10);

    // ============ FORM INFO TABLE ============
    autoTable(doc, {
        startY: y + 14,
        body: [
            ['No. Formulir / Form No.', 'PPA-F-SHE-24p'],
            ['No. SOP / SOP No.', 'BIH-HSE-SOP-36 -P2H-R00'],
            ['Pemilik / Owner', 'HSE /Operation Dept.'],
            ['Revisi Ke / Revition To', '2']
        ],
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.15 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 50 } },
        margin: { left: margin }
    });

    // Save
    doc.save(`P2H_${data.unitNumber}_${new Date(data.createdAt).toISOString().split('T')[0]}.pdf`);
}

// ============ APAR PDF Generator ============
interface APARUnit {
    no: number;
    unitNumber: string;
    capacity: string;
    tagNumber: string;
    checks: Record<string, boolean>;
    condition: string;
    notes: string;
}

interface APARData {
    id: number;
    location: string;
    unitNumber?: string;
    capacity?: string;
    tagNumber?: string;
    checklistData?: string;
    condition?: string;
    notes?: string;
    pic: string;
    diketahuiOleh?: string;
    diPeriksaOleh?: string;
    signatureDiketahui?: string;
    signatureDiPeriksa?: string;
    periodeInspeksi?: string;
    date?: string;
    createdAt: string;
    units?: APARUnit[];
}

const APAR_ITEMS_PDF = ['Handle', 'Lock Pin', 'Seal Segel', 'Tabung', 'Hose Nozzle', 'Braket'];

export async function generateAPARPDF(data: APARData): Promise<void> {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 10;

    const dateStr = data.date || data.createdAt;
    const inspectionDate = dateStr ? new Date(dateStr) : new Date();
    const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
    const periodeInspeksi = data.periodeInspeksi || `${monthNames[inspectionDate.getMonth()]} ${inspectionDate.getFullYear()}`;
    const tanggalInspeksi = inspectionDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // ============ LOGO PT. PPA ============
    try {
        const ptPpaLogo = await loadImageAsBase64('/pt-ppa-logo.png');
        if (ptPpaLogo) doc.addImage(ptPpaLogo, 'PNG', margin, 5, 18, 18);
    } catch (e) { }

    // ============ HEADER ============
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CHECKLIST INSPEKSI', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(11);
    doc.text('ALAT PEMADAM API RINGAN (APAR)', pageWidth / 2, 16, { align: 'center' });

    // ============ INFO SECTION ============
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Project / Site', margin, 28);
    doc.text(': PPA / BIB', margin + 28, 28);
    
    doc.text('Periode Inspeksi', margin, 34);
    doc.text(`: ${periodeInspeksi}`, margin + 28, 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(data.location || 'LOKASI', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PPA-BIB-F-SHE-20A', pageWidth - margin, 34, { align: 'right' });

    // ============ BUILD TABLE DATA ============
    let tableBody: string[][] = [];

    if (data.units && data.units.length > 0) {
        tableBody = data.units.map((unit, idx) => {
            const getCheck = (item: string) => unit.checks[item] === true ? 'V' : 'X';
            const kondisi = unit.condition === 'LAYAK' ? 'L' : 'TL';
            return [
                String(idx + 1),
                unit.unitNumber || '-',
                unit.capacity || '6 Kg',
                unit.tagNumber || String(idx + 1),
                getCheck('Handle'),
                getCheck('Lock Pin'),
                getCheck('Seal Segel'),
                getCheck('Tabung'),
                getCheck('Hose Nozzle'),
                getCheck('Braket'),
                kondisi,
                unit.notes || '',
                tanggalInspeksi,
                data.pic || '-'
            ];
        });
    } else {
        let checklistParsed: Record<string, boolean> = {};
        try {
            checklistParsed = JSON.parse(data.checklistData || '{}');
        } catch (e) {
            checklistParsed = {};
        }
        const getCheckMark = (item: string) => checklistParsed[item] === true ? 'V' : 'X';
        const kondisiAPAR = data.condition === 'LAYAK' ? 'L' : 'TL';
        tableBody = [[
            '1',
            data.unitNumber || '-',
            data.capacity || '6 Kg',
            data.tagNumber || '-',
            getCheckMark('Handle'),
            getCheckMark('Lock Pin'),
            getCheckMark('Seal Segel'),
            getCheckMark('Tabung'),
            getCheckMark('Hose Nozzle'),
            getCheckMark('Braket'),
            kondisiAPAR,
            data.notes || '',
            tanggalInspeksi,
            data.pic || '-'
        ]];
    }

    // ============ TABLE ============
    autoTable(doc, {
        startY: 40,
        head: [[
            { content: 'NO', rowSpan: 2 },
            { content: 'No Unit/ Lokasi', rowSpan: 2 },
            { content: 'Kapasitas', rowSpan: 2 },
            { content: 'No. Tag', rowSpan: 2 },
            { content: 'ITEM PEMERIKSAAN', colSpan: 6 },
            { content: 'Kondisi\nAPAR(LAYAK/\nTIDAK LAYAK)', rowSpan: 2 },
            { content: 'Keterangan', rowSpan: 2 },
            { content: 'Tanggal\nInspeksi', rowSpan: 2 },
            { content: 'PIC', rowSpan: 2 }
        ], [
            'Handle', 'Lock Pin', 'Seal\nSegel', 'Tabung', 'Hose\nNozzle', 'Braket'
        ]],
        body: tableBody,
        theme: 'grid',
        styles: { 
            fontSize: 7, 
            cellPadding: 2, 
            lineColor: [0, 0, 0], 
            lineWidth: 0.2, 
            valign: 'middle',
            halign: 'center',
            textColor: [0, 0, 0]
        },
        headStyles: { 
            fillColor: [255, 255, 255], 
            textColor: [0, 0, 0], 
            fontStyle: 'bold', 
            halign: 'center',
            valign: 'middle',
            fontSize: 7
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 40, halign: 'left' },
            2: { cellWidth: 15 },
            3: { cellWidth: 12 },
            4: { cellWidth: 12 },
            5: { cellWidth: 12 },
            6: { cellWidth: 12 },
            7: { cellWidth: 12 },
            8: { cellWidth: 12 },
            9: { cellWidth: 12 },
            10: { cellWidth: 20 },
            11: { cellWidth: 62, halign: 'left', overflow: 'linebreak' },
            12: { cellWidth: 18 },
            13: { cellWidth: 18 }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
    });

    // ============ KETERANGAN ============
    let y = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Keterangan', margin, y);
    
    doc.setFont('helvetica', 'normal');
    y += 4;
    doc.text('V', margin, y);
    doc.text(': Kondisi Layak', margin + 6, y);
    y += 4;
    doc.text('X', margin, y);
    doc.text(': Kondisi Tidak Layak', margin + 6, y);
    y += 4;
    doc.setFontSize(7);
    doc.text('Jika berat APAR kurang dari 10% dari berat APAR kondisi baru', margin + 6, y);

    // ============ SIGNATURE SECTION ============
    const sigY = Math.max(y + 15, 150);
    const leftSigX = 80;
    const rightSigX = pageWidth - 80;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Girimulya,        ${periodeInspeksi}`, rightSigX - 10, sigY - 10, { align: 'center' });

    doc.text('Diketahui Oleh,', leftSigX, sigY, { align: 'center' });
    doc.text('Di Periksa Oleh,', rightSigX, sigY, { align: 'center' });

    const diketahuiName = data.diketahuiOleh || '';
    const diPeriksaName = data.diPeriksaOleh || data.pic || '';

    if (data.signatureDiketahui) {
        try {
            doc.addImage(data.signatureDiketahui, 'PNG', leftSigX - 20, sigY + 3, 40, 15);
        } catch (e) { }
    }

    if (data.signatureDiPeriksa) {
        try {
            doc.addImage(data.signatureDiPeriksa, 'PNG', rightSigX - 20, sigY + 3, 40, 15);
        } catch (e) { }
    }

    if (diketahuiName) {
        doc.setFont('helvetica', 'bold');
        doc.text(diketahuiName, leftSigX, sigY + 22, { align: 'center' });
        doc.setFont('helvetica', 'normal');
    }
    doc.text('(………………….….)', leftSigX, sigY + 28, { align: 'center' });

    if (diPeriksaName) {
        doc.setFont('helvetica', 'bold');
        doc.text(diPeriksaName, rightSigX, sigY + 22, { align: 'center' });
        doc.setFont('helvetica', 'normal');
    }
    doc.text('(……………………...)', rightSigX, sigY + 28, { align: 'center' });

    // Save file
    const fileName = `CHECKLIST_INSPEKSI_APAR_${data.location?.replace(/\s/g, '_') || 'APAR'}_${periodeInspeksi.replace(/\s/g, '_')}.pdf`;
    doc.save(fileName);
}

// ============ HYDRANT PDF Generator ============
interface HydrantItem {
    no: number;
    lineNumber: string;
    komponenUnit: string;
    subKomponen: string;
    checks: Record<string, boolean>;
    condition: 'L' | 'TL';
    notes: string;
}

interface HydrantData {
    id: number;
    location: string;
    pic: string;
    diketahuiOleh?: string;
    diPeriksaOleh?: string;
    signatureDiketahui?: string;
    signatureDiPeriksa?: string;
    periodeInspeksi?: string;
    createdAt: string;
    items: HydrantItem[];
}

const HYDRANT_DESKRIPSI: Record<string, string[]> = {
    'BOX HYDRANT': ['Kondisi Box Bersih', 'Tidak ada barang lain Selain Perlengkapan Hydrant'],
    'JET NOOZLE': ['Tidak Terdapat retakan Atau Bocor', 'Kaitan Sambungan Kopling Tidak Aus'],
    'HOSE HYDRANT': ['Tidak dalam Keadaan Bocor', 'Tersusun Rapi di Hose Rack'],
    'HOSE RACK': ['Rack Tidak Ada Yang Patah', 'Mudah di urai Jika digunakan'],
    'KUNCI HYDRANT PILLAR': ['Tersedia Kunci Hydrant', 'Kunci Hydrant Valve Berfungsi Dengan Baik'],
    'WATER CANNON': ['Tidak Ada Keretakan, Kebocoran & Berkarat', 'Mekanisme katup Bisa dibuka, ditutup & diputar dengan lancar', 'Mekanisme Drainase Tidak Ada Sumbatan'],
    'HYDRANT PILLAR': ['Tidak ada Retakan, Korosi atau keausan', 'Tidak dalam Keadaan Bocor', 'Mudah Digunakan dan Tidak Berkarat', 'Valve pillar Hydran di buka & di tutup dengan mudah', 'Tidak ada sumbatan'],
    'PIPA HYDRANT': ['Pipa Hydrant Tidak ada kebocoran, retakan & korosif']
};

export async function generateHydrantPDF(data: HydrantData): Promise<void> {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 8;

    const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
    const inspectionDate = new Date(data.createdAt);
    const periodeInspeksi = data.periodeInspeksi || `${monthNames[inspectionDate.getMonth()]} ${inspectionDate.getFullYear()}`;

    // ============ LOGO PT. PPA ============
    try {
        const ptPpaLogo = await loadImageAsBase64('/pt-ppa-logo.png');
        if (ptPpaLogo) doc.addImage(ptPpaLogo, 'PNG', margin, 5, 16, 16);
    } catch (e) { }

    // ============ HEADER ============
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CHECKLIST INSPEKSI', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(10);
    doc.text('ALAT PROTEKSI KEBAKARAN ( HYDRANT )', pageWidth / 2, 16, { align: 'center' });

    // ============ INFO SECTION ============
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Project / Site', margin, 26);
    doc.text(': PPA / BIB', margin + 24, 26);
    
    doc.text('Periode Inspeksi', margin, 32);
    doc.text(`: ${periodeInspeksi}`, margin + 24, 32);
    
    doc.text('Area Inspeksi', margin, 38);
    doc.text(`: ${data.location || '-'}`, margin + 24, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PPA-BIB-F-SHE-20B', pageWidth - margin, 38, { align: 'right' });

    // ============ GROUP ITEMS BY LINE ============
    const itemsByLine: Record<string, HydrantItem[]> = {};
    data.items.forEach(item => {
        if (!itemsByLine[item.lineNumber]) {
            itemsByLine[item.lineNumber] = [];
        }
        itemsByLine[item.lineNumber].push(item);
    });

    // ============ BUILD TABLE DATA ============
    let tableBody: any[][] = [];
    let noCounter = 1;

    Object.keys(itemsByLine).sort().forEach((line) => {
        tableBody.push([
            { content: line, colSpan: 8, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', halign: 'center' } }
        ]);

        const lineItems = itemsByLine[line];
        
        const itemsByKomponen: Record<string, HydrantItem[]> = {};
        lineItems.forEach(item => {
            const baseSubKomponen = item.subKomponen.replace(/\s+\d+$/, '');
            if (!itemsByKomponen[item.komponenUnit]) {
                itemsByKomponen[item.komponenUnit] = [];
            }
            itemsByKomponen[item.komponenUnit].push(item);
        });

        Object.entries(itemsByKomponen).forEach(([komponen, items]) => {
            items.forEach((item, idx) => {
                const baseSubKomponen = item.subKomponen.replace(/\s+\d+$/, '').trim();
                const deskripsiList = HYDRANT_DESKRIPSI[baseSubKomponen] || [];
                const deskripsiText = deskripsiList.map((d, i) => {
                    const letter = String.fromCharCode(97 + i);
                    return `${letter}. ${d}`;
                }).join('\n');

                const acceptedYes = Object.values(item.checks).filter(v => v === true).length;
                const acceptedNo = Object.values(item.checks).filter(v => v === false).length || (deskripsiList.length - acceptedYes);

                tableBody.push([
                    { content: String(noCounter), styles: { halign: 'center' } },
                    { content: idx === 0 ? komponen : '', styles: { fontStyle: 'bold' } },
                    item.subKomponen,
                    { content: deskripsiText, styles: { halign: 'left', fontSize: 6 } },
                    { content: acceptedYes > 0 ? 'V' : '', styles: { halign: 'center' } },
                    { content: acceptedNo > 0 && acceptedYes === 0 ? 'X' : '', styles: { halign: 'center' } },
                    { content: item.condition, styles: { halign: 'center', fontStyle: 'bold', textColor: item.condition === 'L' ? [0, 128, 0] : [255, 0, 0] } },
                    { content: item.notes || '', styles: { halign: 'left' } }
                ]);
                noCounter++;
            });
        });
    });

    // ============ TABLE ============
    autoTable(doc, {
        startY: 44,
        head: [[
            { content: 'NO', styles: { halign: 'center' } },
            { content: 'KOMPONEN\nUNIT', styles: { halign: 'center' } },
            { content: 'SUB-\nKOMPONEN', styles: { halign: 'center' } },
            { content: 'DESKRIPSI', styles: { halign: 'center' } },
            { content: 'YES', styles: { halign: 'center' } },
            { content: 'NO', styles: { halign: 'center' } },
            { content: 'LAYAK/\nTIDAK\nLAYAK', styles: { halign: 'center' } },
            { content: 'KETERANGAN', styles: { halign: 'center' } }
        ]],
        body: tableBody,
        theme: 'grid',
        styles: { 
            fontSize: 7, 
            cellPadding: 1.5, 
            lineColor: [0, 0, 0], 
            lineWidth: 0.15, 
            valign: 'middle',
            textColor: [0, 0, 0]
        },
        headStyles: { 
            fillColor: [255, 255, 255], 
            textColor: [0, 0, 0], 
            fontStyle: 'bold', 
            halign: 'center',
            valign: 'middle',
            fontSize: 7
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 85 },
            4: { cellWidth: 12 },
            5: { cellWidth: 12 },
            6: { cellWidth: 18 },
            7: { cellWidth: 60, overflow: 'linebreak' }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
    });

    // ============ KETERANGAN ============
    let y = (doc as any).lastAutoTable.finalY + 5;
    
    if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Ket.', margin, y);
    
    doc.setFont('helvetica', 'normal');
    y += 4;
    doc.text('V', margin, y);
    doc.text(': Kondisi Layak', margin + 6, y);
    y += 3;
    doc.text('X', margin, y);
    doc.text(': Kondisi Tidak Layak', margin + 6, y);

    // ============ SIGNATURE SECTION ============
    const sigY = Math.max(y + 12, (doc as any).lastAutoTable.finalY + 20);
    const leftSigX = 100;
    const rightSigX = pageWidth - 70;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Girimulya,        ${periodeInspeksi}`, rightSigX, sigY - 8, { align: 'center' });

    doc.text('Diketahui Oleh,', leftSigX, sigY, { align: 'center' });
    doc.text('Di Periksa Oleh,', rightSigX, sigY, { align: 'center' });

    const diketahuiName = data.diketahuiOleh || '';
    const diPeriksaName = data.diPeriksaOleh || data.pic || '';

    if (data.signatureDiketahui) {
        try {
            doc.addImage(data.signatureDiketahui, 'PNG', leftSigX - 18, sigY + 2, 36, 14);
        } catch (e) { }
    }

    if (data.signatureDiPeriksa) {
        try {
            doc.addImage(data.signatureDiPeriksa, 'PNG', rightSigX - 18, sigY + 2, 36, 14);
        } catch (e) { }
    }

    if (diketahuiName) {
        doc.setFont('helvetica', 'bold');
        doc.text(diketahuiName, leftSigX, sigY + 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
    }
    doc.text('(………………….….)', leftSigX, sigY + 25, { align: 'center' });

    if (diPeriksaName) {
        doc.setFont('helvetica', 'bold');
        doc.text(diPeriksaName, rightSigX, sigY + 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
    }
    doc.text('(……………………...)', rightSigX, sigY + 25, { align: 'center' });

    // Save file
    const fileName = `CHECKLIST_INSPEKSI_HYDRANT_${data.location?.replace(/[^a-zA-Z0-9]/g, '_') || 'HYDRANT'}_${periodeInspeksi.replace(/\s/g, '_')}.pdf`;
    doc.save(fileName);
}
