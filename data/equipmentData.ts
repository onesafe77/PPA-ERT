// Master data for Emergency Equipment based on Excel data
// Categories: FIRST AID/MFR, HART, RAR, WATER RESCUE, JUNGLE RESCUE, CSSR, FIRE

export interface Equipment {
    id: string;
    name: string;
    tagNumber: string;
    quantity: number;
    brand: string;
    location: string;
    category: string;
}

export interface EquipmentCategory {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
    { id: 'FIRST AID/MFR', name: 'First Aid / MFR', description: 'Peralatan Pertolongan Pertama', color: '#ef4444', icon: 'Heart' },
    { id: 'HART', name: 'HART', description: 'Height Access & Rope Technique', color: '#f97316', icon: 'Mountain' },
    { id: 'RAR', name: 'RAR', description: 'Road Accident Rescue', color: '#8b5cf6', icon: 'Car' },
    { id: 'WATER RESCUE', name: 'Water Rescue', description: 'Penyelamatan Air', color: '#06b6d4', icon: 'Waves' },
    { id: 'JUNGLE RESCUE', name: 'Jungle Rescue', description: 'Penyelamatan Hutan', color: '#22c55e', icon: 'TreePine' },
    { id: 'CSSR', name: 'CSSR', description: 'Confined Space Search & Rescue', color: '#eab308', icon: 'HardHat' },
    { id: 'FIRE', name: 'Fire', description: 'Peralatan Pemadam', color: '#dc2626', icon: 'Flame' },
];

// Master Equipment Data from Excel
export const MASTER_EQUIPMENT: Equipment[] = [
    // FIRST AID/MFR
    { id: 'AED01', name: 'AED (Automater Electric Defibrilator)', tagNumber: 'AED 01', quantity: 1, brand: 'ZOLL AED PLUS', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'RLSP05', name: 'REGULATOR LSP', tagNumber: 'RLSP 05', quantity: 1, brand: 'Life Support Product', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'TLSP02', name: 'TABUNG LSP', tagNumber: 'TLSP 02', quantity: 1, brand: 'Life Support Product', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'PO06', name: 'PULSE OXIMETER', tagNumber: 'PO 06', quantity: 1, brand: 'OXYMETER', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'ST09', name: 'STHETOSCOPE', tagNumber: 'ST 09', quantity: 1, brand: 'GENERAL CARE', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'TG02', name: 'THERMOGUN IR', tagNumber: 'TG.02', quantity: 1, brand: 'YUWELL', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'RBAG04', name: 'RESPONDER BAG', tagNumber: 'RBAG.04', quantity: 1, brand: 'FERNO', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'BVM01', name: 'BVM', tagNumber: 'BVM.01', quantity: 1, brand: 'MPM', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'SPALK04', name: 'SPALK', tagNumber: 'SPALK.04', quantity: 1, brand: 'PMI', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'NC08', name: 'NECK COLLAR', tagNumber: 'NC.08', quantity: 1, brand: 'GEA', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'HID04', name: 'HID (HEAD IMMOBILISASI DEVICE)', tagNumber: 'HID.04', quantity: 1, brand: 'FERNO', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'LSB02', name: 'LSB (LONG SPINAL BOARD)', tagNumber: 'LSB.02', quantity: 1, brand: 'FERNO', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'BS02', name: 'BASKET STREACHER', tagNumber: 'BS.02', quantity: 1, brand: 'FERNO', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'S11', name: 'SPHYGMOMANOMETER', tagNumber: 'S.11', quantity: 1, brand: 'ABN', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'HS05', name: 'HECTING SET', tagNumber: 'HS.05', quantity: 1, brand: 'MARWA', location: '7014', category: 'FIRST AID/MFR' },
    { id: 'RBAG10', name: 'RESPONDER BAG', tagNumber: 'RBAG.10', quantity: 1, brand: '4LIFE', location: '7014', category: 'FIRST AID/MFR' },

    // HART (Height Access & Rope Technique)
    { id: 'TS02', name: 'Tangga Sliding', tagNumber: 'TS.02', quantity: 1, brand: 'WERNER', location: '7014', category: 'HART' },
    { id: 'CB01', name: 'CARABINER', tagNumber: 'CB.01', quantity: 1, brand: 'WILIAM', location: '7014', category: 'HART' },
    { id: 'CB02', name: 'CARABINER', tagNumber: 'CB.02', quantity: 1, brand: 'WILIAM', location: '7014', category: 'HART' },
    { id: 'CB03', name: 'CARABINER', tagNumber: 'CB.03', quantity: 1, brand: 'WILIAM', location: '7014', category: 'HART' },
    { id: 'CB04', name: 'CARABINER', tagNumber: 'CB.04', quantity: 1, brand: 'WILIAM', location: '7014', category: 'HART' },
    { id: 'CB05', name: 'CARABINER', tagNumber: 'CB.05', quantity: 1, brand: 'WILIAM', location: '7014', category: 'HART' },
    { id: 'CB19', name: 'CARABINER', tagNumber: 'CB.19', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'CB27', name: 'CARABINER', tagNumber: 'CB.27', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'CB28', name: 'CARABINER', tagNumber: 'CB.28', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'FIG01', name: 'FIGURE 8', tagNumber: 'FIG.01', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'FIG02', name: 'FIGURE 8', tagNumber: 'FIG.02', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'ID06', name: 'ID DESCENDER', tagNumber: 'ID.06', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'ID02', name: 'ID DESCENDER', tagNumber: 'ID.02', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'PAW01', name: 'PAW', tagNumber: 'PAW.01', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'SP05', name: 'SINGLE PULLEY', tagNumber: 'SP.05', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'SP06', name: 'SINGLE PULLEY', tagNumber: 'SP.06', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'DP04', name: 'DOUBLE PULLEY', tagNumber: 'DP.04', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'AL04', name: 'ASAP LOCK', tagNumber: 'AL.04', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'SHUNT04', name: 'SHUNT', tagNumber: 'SHUNT.04', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'SHUNT05', name: 'SHUNT', tagNumber: 'SHUNT.05', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'J03', name: 'JUMAR', tagNumber: 'J.03', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'CEN02', name: 'RESCUE CENDER (JETRIK SET)', tagNumber: 'CEN.02', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'H02', name: 'HELMET RESCUE (KUNING)', tagNumber: 'H.02', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'H06', name: 'HELMET RESCUE (KUNING)', tagNumber: 'H.06', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'H08', name: 'HELMET RESCUE', tagNumber: 'H.08', quantity: 1, brand: 'DELTA PLUS', location: '7014', category: 'HART' },
    { id: 'WL03', name: 'WEBBING LOOP', tagNumber: 'WL.03', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'WL09', name: 'WEBBING LOOP', tagNumber: 'WL.09', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'FOO06', name: 'FOOTSTEP', tagNumber: 'FOO.06', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'BRD03', name: 'BRIDLE', tagNumber: 'BRD.03', quantity: 1, brand: '-', location: '7014', category: 'HART' },
    { id: 'DL12', name: 'DOUBLE LANYARD', tagNumber: 'DL.12', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'DL18', name: 'DOUBLE LANYARD', tagNumber: 'DL.18', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'DL19', name: 'DOUBLE LANYARD', tagNumber: 'DL.19', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'FBH18', name: 'FULL BODY HARNESS', tagNumber: 'FBH.18', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'FBH19', name: 'FULL BODY HARNESS', tagNumber: 'FBH.19', quantity: 1, brand: 'MSA', location: '7014', category: 'HART' },
    { id: 'FBH25', name: 'FULL BODY HARNESS', tagNumber: 'FBH.25', quantity: 1, brand: 'PETZL', location: '7014', category: 'HART' },
    { id: 'TK02', name: 'TALI KARMANTLE', tagNumber: 'TK.02', quantity: 1, brand: '-', location: '7014', category: 'HART' },
    { id: 'TK15', name: 'TALI KARMANTLE', tagNumber: 'TK.15', quantity: 1, brand: '-', location: '7014', category: 'HART' },
    { id: 'SS04', name: 'SPYDER STRAP', tagNumber: 'SS.04', quantity: 1, brand: 'FERNO', location: '7014', category: 'HART' },
    { id: 'BCE01', name: 'BAG CLIMBING EQUIPMENT', tagNumber: 'BCE.01', quantity: 1, brand: 'KONG', location: '7014', category: 'HART' },

    // RAR (Road Accident Rescue)
    { id: 'LHYD01', name: 'HYDRAULIC POWER UNIT (LUKAS)', tagNumber: 'LHYD.01', quantity: 1, brand: 'HONDA', location: '7014', category: 'RAR' },
    { id: 'RAM01', name: 'RAMS JACK (LUKAS)', tagNumber: 'RAM.01', quantity: 1, brand: 'LUKAS', location: '7014', category: 'RAR' },
    { id: 'SDR01', name: 'SPREADER (LUKAS)', tagNumber: 'SDR.01', quantity: 1, brand: 'LUKAS', location: '7014', category: 'RAR' },
    { id: 'CUT01', name: 'CUTTERS (LUKAS)', tagNumber: 'CUT.01', quantity: 1, brand: 'LUKAS', location: '7014', category: 'RAR' },
    { id: 'RAC01', name: 'RACHET TRACKBELT', tagNumber: 'RAC.01', quantity: 1, brand: 'SPANSET', location: '7014', category: 'RAR' },
    { id: 'RAC02', name: 'RACHET TRACKBELT', tagNumber: 'RAC.02', quantity: 1, brand: 'SPANSET', location: '7014', category: 'RAR' },
    { id: 'SLI02', name: 'WEBBING SLINGS', tagNumber: 'SLI.02', quantity: 1, brand: 'FASLIFT', location: '7014', category: 'RAR' },
    { id: 'KED02', name: 'KED', tagNumber: 'KED.02', quantity: 1, brand: 'KED', location: '7014', category: 'RAR' },
    { id: 'S01', name: 'SHACKLE', tagNumber: 'S.01', quantity: 1, brand: 'CROSBY', location: '7014', category: 'RAR' },
    { id: 'S02', name: 'SHACKLE', tagNumber: 'S.02', quantity: 1, brand: 'CROSBY', location: '7014', category: 'RAR' },

    // WATER RESCUE
    { id: 'LJ27', name: 'LIFE JACKET', tagNumber: 'LJ 27', quantity: 1, brand: 'BIAWAK', location: '7014', category: 'WATER RESCUE' },
    { id: 'LJ28', name: 'LIFE JACKET', tagNumber: 'LJ 28', quantity: 1, brand: 'BIAWAK', location: '7014', category: 'WATER RESCUE' },
    { id: 'LJ31', name: 'LIFE JACKET', tagNumber: 'LJ 31', quantity: 1, brand: 'BIAWAK', location: '7014', category: 'WATER RESCUE' },
    { id: 'RT02', name: 'RESCUE TUBE', tagNumber: 'RT.02', quantity: 1, brand: 'GUARD', location: '7014', category: 'WATER RESCUE' },
    { id: 'TAL01', name: 'TALI LEMPAR', tagNumber: 'TAL.01', quantity: 1, brand: 'NRS', location: '7014', category: 'WATER RESCUE' },
    { id: 'RING01', name: 'RING BUOY', tagNumber: 'RING.01', quantity: 1, brand: '-', location: '7014', category: 'WATER RESCUE' },

    // JUNGLE RESCUE
    { id: 'LED06', name: 'LIGHTING LED', tagNumber: 'LED 06', quantity: 1, brand: 'AMSCUD', location: '7014', category: 'JUNGLE RESCUE' },
    { id: 'ST02', name: 'SNAKE TONGS', tagNumber: 'ST.02', quantity: 1, brand: '-', location: '7014', category: 'JUNGLE RESCUE' },
    { id: 'JHS01', name: 'JAS HUJAN SAFETY', tagNumber: 'JHS.01', quantity: 1, brand: 'ACOLD', location: '7014', category: 'JUNGLE RESCUE' },
    { id: 'JHS02', name: 'JAS HUJAN SAFETY', tagNumber: 'JHS.02', quantity: 1, brand: 'ACOLD', location: '7014', category: 'JUNGLE RESCUE' },

    // CSSR (Confined Space Search & Rescue)
    { id: 'JACK01', name: 'LIFT JACK', tagNumber: 'JACK.01', quantity: 1, brand: 'HI LIFT', location: '7014', category: 'CSSR' },

    // FIRE
    { id: 'FB02', name: 'FIRE BLANKET', tagNumber: 'FB.02', quantity: 1, brand: 'AMC', location: '7014', category: 'FIRE' },
];

// Get unique equipment names for dropdown
export const getUniqueEquipmentNames = (): string[] => {
    const names = new Set(MASTER_EQUIPMENT.map(eq => eq.name));
    return Array.from(names).sort();
};

// Get equipment by category
export const getEquipmentByCategory = (category: string): Equipment[] => {
    return MASTER_EQUIPMENT.filter(eq => eq.category === category);
};

// Get all unique brands
export const getUniqueBrands = (): string[] => {
    const brands = new Set(MASTER_EQUIPMENT.map(eq => eq.brand).filter(b => b && b !== '-'));
    return Array.from(brands).sort();
};

// Get unique locations
export const getUniqueLocations = (): string[] => {
    const locations = new Set(MASTER_EQUIPMENT.map(eq => eq.location));
    return Array.from(locations).sort();
};
