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
interface APARData {
    id: number;
    location: string;
    unitNumber: string;
    capacity: string;
    tagNumber: string;
    checklistData: string;
    condition: string;
    notes: string;
    pic: string;
    date?: string;
    createdAt: string;
}

const APAR_ITEMS_PDF = ['Handle', 'Lock Pin', 'Seal Segel', 'Tabung', 'Hose Nozzle', 'Braket'];

export async function generateAPARPDF(data: APARData): Promise<void> {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 10;

    let checklistParsed: Record<string, boolean> = {};
    try {
        checklistParsed = JSON.parse(data.checklistData || '{}');
    } catch (e) {
        checklistParsed = {};
    }

    const dateStr = data.date || data.createdAt;
    const inspectionDate = dateStr ? new Date(dateStr) : new Date();
    const monthNames = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
    const periodeInspeksi = `${monthNames[inspectionDate.getMonth()]} ${inspectionDate.getFullYear()}`;
    const tanggalInspeksi = inspectionDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // ============ HEADER ============
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CHECKLIST INSPEKSI', pageWidth / 2, 12, { align: 'center' });
    doc.setFontSize(12);
    doc.text('ALAT PEMADAM API RINGAN (APAR)', pageWidth / 2, 18, { align: 'center' });

    // ============ INFO SECTION ============
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Project / Site', margin, 28);
    doc.text(`: PPA / BIB`, margin + 28, 28);
    
    doc.text('Periode Inspeksi', margin, 34);
    doc.text(`: ${periodeInspeksi}`, margin + 28, 34);

    doc.setFont('helvetica', 'bold');
    doc.text(data.location || 'LOKASI', pageWidth - margin - 60, 28);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PPA-BIB-F-SHE-20A', pageWidth - margin, 34, { align: 'right' });

    // ============ TABLE ============
    const getCheckMark = (item: string) => {
        return checklistParsed[item] === true ? 'V' : '';
    };

    const kondisiAPAR = data.condition === 'LAYAK' ? 'L' : 'TL';

    const tableBody = [[
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
            2: { cellWidth: 18 },
            3: { cellWidth: 15 },
            4: { cellWidth: 14 },
            5: { cellWidth: 14 },
            6: { cellWidth: 14 },
            7: { cellWidth: 14 },
            8: { cellWidth: 14 },
            9: { cellWidth: 14 },
            10: { cellWidth: 22 },
            11: { cellWidth: 35, halign: 'left' },
            12: { cellWidth: 20 },
            13: { cellWidth: 25 }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto'
    });

    // ============ KETERANGAN ============
    let y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Keterangan', margin, y);
    
    doc.setFont('helvetica', 'normal');
    y += 5;
    doc.text('V', margin, y);
    doc.text(': Kondisi Layak', margin + 8, y);
    y += 4;
    doc.text('X', margin, y);
    doc.text(': Kondisi Tidak Layak', margin + 8, y);
    y += 4;
    doc.setFontSize(7);
    doc.text('Jika berat APAR kurang dari 10% dari berat APAR kondisi baru', margin + 8, y);

    // ============ SIGNATURE SECTION ============
    const sigY = y + 15;
    const leftSigX = margin + 60;
    const rightSigX = pageWidth - margin - 80;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Girimulya,        ${periodeInspeksi}`, rightSigX + 20, sigY - 5);

    doc.text('Diketahui Oleh,', leftSigX, sigY);
    doc.text('Di Periksa Oleh,', rightSigX + 40, sigY);

    doc.text('(………………............….….)', leftSigX - 10, sigY + 25);
    doc.text('(…………….........…………...)', rightSigX + 30, sigY + 25);

    // Save file
    const fileName = `CHECKLIST_INSPEKSI_APAR_${data.location?.replace(/\s/g, '_') || 'APAR'}_${periodeInspeksi.replace(/\s/g, '_')}.pdf`;
    doc.save(fileName);
}
