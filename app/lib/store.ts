type Department = 'TRD' | 'S&T' | 'ENGG'; // add more if needed

type DepotStructure = {
  [section: string]: {
    [department in Department]: string[];
  };
};

export let MajorSection = {
  "MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
  "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
  "SA": ["JTJ-ED","ED-PTJ","ED-TP","KRR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"]
};
// export let MajorSection = {
//   "MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
//   "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
//   "SA":["JTJ-ED","ED-PTJ","ED-TPJ","KRR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"]
// }


// export let MajorSection = {
//   "MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
//   "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
//   "SA":["JTJ-ED","ED-PTJ","ED-TPJ","KRR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"]
// };


// export let blockSection = {
//   'TPJ-VM': [
//     "TPJ-GOC", "GOC-TPTN", "TPTN-SRGM", "SRGM-UKV", "UKV-BXS",
//     "BXS-VLDE", "VLDE-LLI", "LLI-KTTRIBS", "KTTRIBS-KTTR",
//     "KTTR-PMB", "PMB-KKPM", "KKPM-KLGM", "KLGM-SLT", "SLT-ALU",
//     "ALU-OTK", "OTK-VER", "VER-SNDI", "SNDI-MTUR", "MTUR-ICG",
//     "ICG-PNDM", "PNDM-TLNR", "TLNR-VRT", "VRT-VRI", "VRI-PVN",
//     "PVN-ULU", "ULU-PRKL", "PRKL-TVNL", "TVNL-KDMD", "KDMD-VM",
//     "TPJ-YD", "GOC-YD", "TPTN-YD", "VLDE-YD", "LLI-YD", "KTTR-YD",
//     "PMB-YD", "KKPM-YD", "KLGM-YD", "SLT-YD", "ALU-YD", "OTK-YD",
//     "SNDI-YD", "MTUR-YD", "ICG-YD", "PNDM-YD", "TLNR-YD", "VRI-YD",
//     "PVN-YD", "ULU-YD", "PRKL-YD", "TVNL-YD", "KDMD-YD", "VM-YD"
//   ],
//   'VM-MV': [
//     "VM-SXR", "SXR-TUY", "TUY-PRT", "PRT-MBU", "MBU-NPM", "NPM-VKP",
//     "VKP-TDPR", "TDPR-CUPJ", "CUPJ-CQS", "CQS-ALP", "ALP-PUC",
//     "PUC-PO", "PO-KII", "KII-CDM", "CDM-VMP", "VMP-CLN", "CLN-SY",
//     "SY-VDL", "VDL-ANP", "ANP-NID", "NID-MV",
//     "VM-YD", "SXR-YD", "TUY-YD", "PRT-YD", "MBU-YD", "NPM-YD",
//     "VKP-YD", "TDPR-YD", "CUPJ-YD", "CQS-YD", "ALP-YD", "PUC-YD",
//     "PO-YD", "KII-YD", "CDM-YD", "VMP-YD", "CLN-YD", "SY-YD",
//     "VDL-YD", "ANP-YD", "NID-YD", "MV-YD"
//   ],
//   'TPJ-MV': [
//     "TPJ-GOC", "GOC-MCJ", "MCJ-TRB", "TRB-TOM", "TOM-SGM", "SGM-AYN",
//     "AYN-BAL", "BAL-ALK", "ALK-TJ", "TJ-TT", "TT-PVL", "PVL-AZP",
//     "AZP-PDV", "PDV-PML", "PML-SPL", "SPL-SWI", "SWI-DSM", "DSM-KMU",
//     "KMU-TRM", "TRM-TDR", "TDR-ADT", "ADT-NPT", "NPT-KTM", "KTM-MV",
//     "TPJ-YD", "GOC-YD", "MCJ-YD", "TRB-YD", "TOM-YD", "SGM-YD",
//     "AYN-YD", "BAL-YD", "ALK-YD", "TJ-YD", "TT-YD", "PVL-YD",
//     "AZP-YD", "PDV-YD", "PML-YD", "SPL-YD", "SWI-YD", "DSM-YD",
//     "KMU-YD", "TRM-YD", "TDR-YD", "ADT-YD", "NPT-YD", "KTM-YD",
//     "MV-YD"
//   ],
//   'TJ-KIK': [
//     "TJ-KXO", "KXO-SMM", "SMM-AMT", "AMT-KYV", "KYV-NMJ",
//     "NMJ-KDE", "KDE-TMU", "TMU-KU", "KU-TVR", "TVR-AYM",
//     "AYM-KOQ", "KOQ-KVL", "KVL-SKK", "SKK-APE", "APE-NGT",
//     "NGT-VXM", "VXM-NCR", "NCR-TMPT", "TMPT-KIK",
//     "NMJ-YD", "KDE-YD", "KU-YD", "TVR-YD", "KVL-YD",
//     "NGT-YD", "NCR-YD", "TMPT-YD", "KIK-YD"
//   ],
//   'MV-TVR': [
//     "MV-PEM", "PEM-POM", "POM-NNM", "NNM-TVR",
//     "MV-YD", "PEM-YD", "POM-YD", "NNM-YD", "TVR-YD"
//   ],
//   'NMJ-MQ': [
//     "NMJ-MQ", "NMJ-YD", "MQ-YD"
//   ],
//   'VM-PDY': [
//     "VM-VRA", "VRA-CBU", "CBU-VI", "VI-PDY",
//     "CBU-YD", "VI-YD", "PDY-YD"
//   ],
//   'KPD-VM': [
//     "KPD-VT", "VT-VLR", "VLR-PNTR", "PNTR-KNB", "KNB-KMM", "KMM-OPM",
//     "OPM-SDPT", "SDPT-ARV", "ARV-MCL", "MCL-PRL", "PRL-AGM", "AGM-TJM",
//     "TJM-TNM", "TNM-TNI", "TNI-AND", "AND-ACN", "ACN-TRK", "TRK-AYD",
//     "AYD-MMP", "MMP-VKM", "VKM-VM",
//     "KPD-YD", "VT-YD", "VLR-YD", "PNTR-YD", "KNB-YD", "KMM-YD", "OPM-YD", "SDPT-YD",
//     "ARV-YD", "MCL-YD", "PRL-YD", "AGM-YD", "TJM-YD", "TNM-YD", "TNI-YD", "AND-YD",
//     "ACN-YD", "TRK-YD", "AYD-YD", "MMP-YD", "VKM-YD", "VM-YD"
//   ],
//   'CUPJ-VRI': [
//     "CUPJ-KJKPD", "KJKPD-VLU", "VLU-NVL", "NVL-UMG", "UMG-VRI",
//     "CUPJ-YD", "KJKPD-YD", "VLU-YD", "NVL-YD", "UMG-YD", "VRI-YD"
//   ],
//   'TPJ-TP': [
//     "TPJ-TPE", "TPE-TP",
//     "TPJ-YD", "TPE-YD", "TP-YD"
//   ],
//   'NGT-VLNK': [
//     "NGT-VLNK", "NGT-YD", "VLNK-YD"
//   ],
//   'TVR-KKDI': [
//     "TVR-MAX", "MAX-MARD", "MARD-TNK", "TNK-AMNR", "AMNR-ATB",
//     "ATB-MNLI", "MNLI-TTP", "TTP-TAM", "TAM-MTT", "MTT-AMM", "AMM-PKT",
//     "PKT-TCT", "TCT-PVI", "PVI-AYI", "AYI-ATQ", "ATQ-VMM",
//     "VMM-PYK", "PYK-KNPL", "KNPL-KKDI",
//     "MARD-YD", "TNK-YD", "AMNR-YD", "ATB-YD", "MNLI-YD", "TTP-YD", "TAM-YD",
//     "MTT-YD", "AMM-YD", "PKT-YD", "PVI-YD", "AYI-YD", "ATQ-YD", "PYK-YD", "KKDI-YD"
//   ],
//   'TTP-AGX': [
//     "TTP-KXY", "KXY-KVV", "KVV-NVK", "NVK-TOY", "TOY-VDY", "VDY-AGX",
//     "TTP-YD", "KXY-YD", "KVV-YD", "NVK-YD", "TOY-YD", "VDY-YD", "AGX-YD"
//   ]
// };



// export let blockSection = {
//   'TPJ-VM': [
//     "TPJ-GOC", "GOC-TPTN", "TPTN-SRGM", "SRGM-VLDE", "VLDE-LLI", "LLI-PMB", "PMB-KKPM", "KKPM-KLGM", "KLGM-SLT", "SLT-ALU",
//     "ALU-OTK", "OTK-SNDI", "SNDI-MTUR", "MTUR-ICG ",
//     "ICG-TLNR", "TLNR-VRI", "VRI-PVN",
//     "PVN-ULU", "ULU-PRKL", "PRKL-TVNL", "TVNL-KDMD", "KDMD-VM",

//     "TPJ-YD", "GOC-YD", "SRGM-YD", "VLDE-YD", "LLI-YD", "PMB-YD",
//     "KKPM-YD", "KLGM-YD", "SLT-YD", "ALU-YD", "OTK-YD", "SNDI-YD", "MTUR-YD",
//     "ICG-YD", "TLNR-YD", "VRI-YD", "PVN-YD", "ULU-YD", "PRKL-YD",
//     "TVNL-YD", "KDMD-YD", "VM-YD"
//   ],
//   'VM-MV': [
//     "VM-SXR", "SXR-TUY", "TUY-PRT", "PRT-MBU", "MBU-NPM", "NPM-TDPR", "TDPR-CUPJ", "CUPJ-ALP", "ALP-PUC",
//     "PUC-KII", "KII-CDM", "CDM-CLN", "CLN-SY",
//     "SY-VDL", "VDL-ANP", "ANP-MV", "VM-YD", "SXR-YD", "TUY-YD", "PRT-YD", "MBU-YD", "NPM-YD", "TDPR-YD",
//     "CUPJ-YD", "ALP-YD", "PUC-YD", "KII-YD", "CDM-YD", "CLN-YD", "SY-YD", "VDL-YD", "ANP-YD", "MV-YD"
//   ],
//   'TPJ-MV': [
//     "TPJ-GOC", "GOC-TRB", "TRB-SGM", "SGM-BAL", "BAL-ALK", "ALK-TJ", "TJ-TT", "TT-PDV", "PDV-SPL", "SPL-KMU",
//     "KMU-ADT", "ADT-KTM", "KTM-MV", "TPJ-YD", "GOC-YD", "TRB-YD", "SGM-YD", "BAL-YD",
//     "ALK-YD", "TJ-YD", "TT-YD", "PDV-YD", "SPL-YD",
//     "KMU-YD", "ADT-YD", "KTM-YD", "MV-YD"
//   ],
//   'TJ-KIK': [
//     "TJ-SMM", "SMM-NMJ",
//     "NMJ-KDE", "KDE-KU", "KU-TVR", "TVR-KVL", "KVL-NGT", "NGT-NCR", "NCR-KIK", "TJ-YD", "SMM-YD", "NMJ-YD", "KDE-YD", "KU-YD", "TVR-YD", "KVL-YD", "NGT-YD", "NCR-YD", "KIK-YD"
//   ],
//   'MV-TVR': [
//     "MV-PEM", "PEM-NNM", "NNM-TVR", "MV-YD", "PEM-YD", "NNM-YD", "TVR-YD"
//   ],
//   'NMJ- MQ': [
//     "NMJ-MQ", "NMJ-YD", "MQ-YD"
//   ],
//   'VM-PDY': [
//     "VM-CBU", "CBU-PDY", "CBU-YD", "PDY-YD"
//   ],
//   'KPD-VM': [
//     "KPD-VLR", "VLR-KNB", "KNB-ARV", "ARV-PRL", "PRL-AGM", "AGM-TJM",
//     "TJM-TNM", "TNM-TNI", "TNI-TRK", "TRK-MMP", "MMP-VKM", "VKM-VM", "KPD-YD", "VLR-YD", "KNB-YD", "KMM-YD", "ARV-YD", "PRL-YD", "AGM-YD", "TJM-YD", "TNM-YD", "TNI-YD", "TRK-YD", "MMP-YD", "VKM-YD", "VM-YD"
//   ],
//   'CUPJ-VRI': [
//     "CUP J-KJKPD", "KJKPD-VLU", "VLU-NVL", "NVL-UMG", "UMG-VRI", "CUP J-YD", "KJKPD-YD", "VLU-YD", "NVL-YD", "UMG-YD", "VRI-YD"
//   ],
//   'TPJ-TP': [
//     "TPJ-TP", "TPJ-YD", "TP-YD"
//   ],
//   'NGT-VLNK': [
//     "NGT-VLNK", "NGT-YD", "VLNK-YD"
//   ],
//   'TVR- KKDI': [
//     "TVR-TNK", "TNK-TTP", "TTP-AMM", "AMM-PKT", 
//     "PKT-PVI", "PVI-AYI", "AYI-ATQ", "ATQ-PYK", "PYK-KKDI", "TVR-YD", "TNK-YD", "TTP-YD", "TAM-YD",
//     "AMM-YD", "PKT-YD", "PVI-YD", "AYI-YD", "ATQ-YD", "PYK-YD", "KKDI-YD"
//   ],
//   'TTP-AGX': [
//     "TTP-AGX", "TTP-YD", "AGX-YD"
//   ]
// };

export let blockSection = {
  'JTJ-ED': [
    "JTJ-TPT", "TPT-KEY", "KEY-SLY", "SLY-DST", 
    "DST-DPI", "DPI-MAP", "MAP-BDY", "BDY-BQI", 
    "BQI-LCR", "LCR-DSPT", "DSPT-TNT", "TNT-KPPR", 
    "KPPR-MGSJ", "MGSJ-SA","SA-VRPD", "VRPD-DC", "DC-MVPM", 
    "MVPM-SGE", "SGE-ANU", "ANU-CV", "CV-ED",
    "TPT-YD", "KEY-YD", "SLY-YD", "DST-YD", "DPI-YD",
    "MAP-YD", "BDY-YD", "BQI-YD", "LCR-YD", "DSPT-YD", "TNT-YD", 
    "KPPR-YD", "MGS-YD", "VRPD-YD", "DC-YD", "MVPM-YD", "SGE-YD",
    "ANU-YD", "CV-YD", "ED-YD"
  ],

'ED-PTJ': [
    "ED-TPM", "TPM-PY", "PY-IGR", "IGR-VZ", 
    "VZ-UKL", "UKL-TUP", "TUP-VNJ", "VNJ-SNO", 
    "SNO-SUU", "SUU-IGU", "IGU-PLMD","IGU-PTJ", "PLMD-CBF", 
    "CBF-CBE", "CBE-PTJ", "PTJ-MDKI",
    "JTJ-YD", "TPT-YD", "DST-YD", "DPI-YD", "TNT-YD", "MAP-YD",
    "BQI-YD", "DSPT-YD", "MGSJ-YD", "SGE-YD", "ANU-YD", "CV-YD",
    "ED-YD", "TPM-YD", "PY-YD", "IGR-YD", "VZ-YD", "VNJ-YD","SNO-YD",
    "SUU-YD", "IGU-YD", "PLMD-YD", "CBF-YD", "CBE-YD", "PTJ-YD",
  "ULK-YD", "TUP-YD"
  ],
'ED-TP': [
    "ED-CVD", "CVD-PAS", "PAS-URL", "URL-KMD", 
    "KMD-PGR", "PGR-MPLM", "MPLM-KRR", "KRR-VRQ", 
    "VRQ-MYU", "MYU-MMH", "MMH-LP", "LP-KLT", 
    "KLT-PLI", "PLI-PGN", "PGN-EL", "EL-MTNL", 
    "MTNL-TP",
    "ED-YD", "CVD-YD", "PAS-YD", "URL-YD", "KMD-YD", "PGR-YD",
    "MPLM-YD", "KRR-YD", "VRQ-YD","MMH-YD", "MYU-YD", "LP-YD", "KLT-YD",
    "PLI-YD", "PGN-YD", "EL-YD", "MTNL-YD", "TP-YD"
  ],
'KRR-DG': [
    "KRR-VEI", "VEI-PALM", "PALM-EDU","EDU-DG",
    "KRR-YD", "VEI-YD", "PALM-YD", "EDU-YD"
  ],
'SA-VRI': [
    "SA-SAMT", "SAMT-SXT", "SXT-MPLI", "MPLI-ETP", 
    "ETP-ATU", "ATU-CHSM", "CHSM-PRV", "PRV-MKSP", 
    "MKSP-VRI",
    "SA-YD", "SAMT-YD", "SXT-YD", "MPLI-YD", "ETP-YD", "ATU-YD",
    "CHSM-YD", "PRV-YD", "MKSP-YD", "VRI-YD"
  ],
'SA-MTDM': [
    "SA-MGSJ", "MGSJ-OML", "OML-MCRD", "MCRD-MTDM", 
    "MTDM-MTPP",
    "SA-YD", "MGSJ-YD", "OML-YD", "MCRD-YD", "MTDM-YD", "MTPP-YD"
  ],
'SA-KRR': [
    "SA-MALR", "MALR-RASP", "RASP-KLGN", "KLGN-NMKL", 
    "NMKL-MONR", "MONR-KRR",
    "SA-YD", "MALR-YD", "RASP-YD", "KLGN-YD", "NMKL-YD", "MONR-YD", "KRR-YD"
  ],
'MTP-UAM': [
    "MTP-QLR", "QLR-HLG", "HLG-ONR", "ONR-WEL", 
    "WEL-AVK", "AVK-KXT", "KXT-LOV", "LOV-UAM",
    "MTP-YD", "QLR-YD", "HLG-YD", "ONR-YD", "WEL-YD", "AVK-YD",
    "KXT-YD", "LOV-YD", "UAM-YD"
  ],
'PTJ-CNV': [
    "POY-CNV", "CNV-PTJ",
    "POY-YD", "CNV-YD", "PTJ-YD"
  ],
'CBE-MTP': [
    "CBE-CBF", "CBF-KAY",
    "KAY-MTP", "CBE-YD", "CBF-YD","KAY-YD","MTP-YD",
  ]
};
 


export let workType = {
  'S&T': ['Gear', 'Tw', 'Lt'],
  'ENGG': ['Machine', 'Non-Machine'],
  'TRD': ['Tw', 'Lt'],
};









export let Activity = {
  'Gear': ['Point', 'EI', 'Signal', 'DC Track', 'AFTC', 'SSDAC', 'MSDAC', 'Panel', 'LC Gate Mechanical', 'LC Gate ELB', 'Emergency Sliding Boom', 'IPS', 'Conventional power supply equipment', 'System Integrity Test of each PI/EI/RRI stations', 'Cable Insulation testing (cable meggering) for one station.', 'DLBI- SGE', 'TLBI-FM Inst', 'UFSBI', 'Fuse', 'EKT'],

  'Tw': ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'],

  'Lt': ['AOH', 'POH', 'IOH', 'RE POH', 'RD WORK', 'TURN OUT CHECKING', 'CROSS OVER CHECKING', 'CROSS TRACK FEEDERS CHECKING', 'GANTRY MAINTENANCE', 'CONTACT WIRE RENEWAL WORK', 'CATENARY WIRE RENEWAL WORK', 'CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)', 'MAST ERECTION(2x25KV WORK)', 'FEEDERS ERECTION(2x25KV WORK)', 'OHE PROFILING', 'OHE/CN WORK', 'OTHER SPECIAL WORKS'],

  'Machine': ['BCM ', 'DTE ', 'CSM ', 'DUOMAT', 'UNIMAT', 'MFI', 'MPT',
    'MDU', 'BRM',
    'FRM ', 'TRT ',
    'UTV', 'DTS',
    'T28', 'SQRS',
    'RGM working'],
  'Non-Machine': ['Rail renewal',
    'Welding work',
    'Destressing work',
    'Switch renewal',
    'CMS Crossing renewal',
    'SEJ Renewal',
    'Glued Joint renewal',
    'Dummy Glued Joint removal',
    'TRR P 60 Kg',
    'TRR S 60 Kg',
    'TRR S 60 kg',
    'TRR S 52 kg',
    'Interchanging',
    'Trucking out/Shifting materials',
    'TWR with MFBW',
    'TBTR (Br sleeper renewal)',
    'TSR P 60 Kg',
    'TSR S 60 Kg',
    'TSR S 52 Kg',
    'TTSR work',
    'Jt Insp Notes Attn',
    'Stretcherbar renewal',
    'TFR Work',
    'Ballast Unloading',
    'Rail unloading',
    'Lifting and packing',
    'Gauge tie plate renewal',
    'Sleeper renewal',
    'Fish Plates O&E',
    'Preliminary/Post works',
    'Trucking out materials',
    'Cutting Widening work',
    'JCB working',
    'Earth work/Muck removal',
    'Crane Moving/Working',
    'Attention to Track',
    'Attention to Fittings',
    'Attention to Bridge',
    'Attention to Guard rail',
    'Attention to Points & Xing',
    'Attention to LC',
    'Attention to Curve check rail',
    'Sheet Piling work',
    'Platform work',
    'Platform Shelter work',
    'ABSS work',
    'Erection of Platform shelter purlins work',
    'Erection of FOB Girders',
    'Other FOB works',
    'Other Track works',
    'Other Bridge work',
  ],
};







export const streamData = {
  "TPT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
  "KEY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "SLY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "DST-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "DPI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "TNT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "BDY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "LCR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "MAP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "KPPR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": [],
  },
  "BQI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "DSPT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "MGSJ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": [],
  },
  "SA-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "RD 1A", "Rd 9"],
    "both direction not affected": [],
  },
  "VRPD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "DC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "MVPM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "SGE-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "RD 1A"],
    "both direction not affected": [],
  },
  "ANU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
  "CV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
  "ED-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": [],
  },
 "TPM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "PY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
  "IGR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "ULK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
  "TUP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": [],
  },
  "VZ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "VNJ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "SUU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "SNO-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "IGU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": [],
  },
  "PLMD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": [],
  },
  "CBF-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
"CVD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "PAS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "URL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "KMD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "PGR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "MPLM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "VRQ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3","Rd 4","Rd 1A"],
    "both direction not affected": [],
  },
  "MYU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "MMH-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "LP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2","Rd 1A"],
    "both direction not affected": [],
  },
  "KLT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "PLI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2","Rd 3"],
    "both direction not affected": [],
  },
  "PGN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "EL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "MTNL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  }
,
 "KRR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": [],
  },
  "VEI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "PALM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "EDU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
 "SAMT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "SXT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "MPLI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3","RD-4"],
    "both direction not affected": [],
  },
  "ETP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "ATU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "CHSM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "PRV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "MKSP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "OML-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": [],
  },
  "MCRD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "MTDM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": [],
  },
  "MTPP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": [],
  },
"MALR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "RASP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "KLGN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "NMKL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": [],
  },
  "MONR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "CBE-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": [],
  },
  "KAY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "MTP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1A", "Rd 2"],
    "both direction not affected": [],
  },
  "QLR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "HLG-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "ONR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "WEL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "AVK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "KXT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "LOV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "UAM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": [],
  },
  "CNV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": [],
  },
  "PTJ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": [],
  }
};


// export let lineData = {

//   // example
//   "NPM-VKP": ['UP', 'DN'],
//   // TPJ-VM Section- All are UP and DN lines
//   'TPJ-GOC': ['UP', 'DN'],
//   'GOC-TPTN': ['UP', 'DN'],
//   'TPTN-SRGM': ['UP', 'DN'],
//   'SRGM-UKV': ['UP', 'DN'],
//   'UKV-BXS': ['UP', 'DN'],
//   'BXS-VLDE': ['UP', 'DN'],
//   'VLDE-LLI': ['UP', 'DN'],
//   'LLI-KTTR IBS': ['UP', 'DN'],
//   'KTTR IBS-KTTR': ['UP', 'DN'],
//   'KTTR-PMB': ['UP', 'DN'],
//   'PMB-KKPM': ['UP', 'DN'],
//   'KKPM-KLGM': ['UP', 'DN'],
//   'KLGM-SLT': ['UP', 'DN'],
//   'SLT-ALU': ['UP', 'DN'],
//   'ALU-OTK': ['UP', 'DN'],
//   'OTK-VER': ['UP', 'DN'],
//   'VER-SNDI': ['UP', 'DN'],
//   'SNDI-MTUR': ['UP', 'DN'],
//   'MTUR-ICG': ['UP', 'DN'],
//   'ICG-PNDM': ['UP', 'DN'],
//   'PNDM-TLNR': ['UP', 'DN'],
//   'TLNR-VRT': ['UP', 'DN'],
//   'VRT-VRI': ['UP', 'DN'],
//   'VRI-PVN': ['UP', 'DN'],
//   'PVN-ULU': ['UP', 'DN'],
//   'ULU-PRKL': ['UP', 'DN'],
//   'PRKL-TVNL': ['UP', 'DN'],
//   'TVNL-KDMD': ['UP', 'DN'],
//   'KDMD-VM': ['UP', 'DN'],

//   // Yard connections for TPJ-VM
//   'TPJ-YD': ['UP', 'DN'],
//   'GOC-YD': ['UP', 'DN'],
//   'TPTN-YD': ['UP', 'DN'],
//   'VLDE-YD': ['UP', 'DN'],
//   'LLI-YD': ['UP', 'DN'],
//   'KTTR-YD': ['UP', 'DN'],
//   'PMB-YD': ['UP', 'DN'],
//   'KKPM-YD': ['UP', 'DN'],
//   'KLGM-YD': ['UP', 'DN'],
//   'SLT-YD': ['UP', 'DN'],
//   'ALU-YD': ['UP', 'DN'],
//   'OTK-YD': ['UP', 'DN'],
//   'SNDI-YD': ['UP', 'DN'],
//   'MTUR-YD': ['UP', 'DN'],
//   'ICG-YD': ['UP', 'DN'],
//   'PNDM-YD': ['UP', 'DN'],
//   'TLNR-YD': ['UP', 'DN'],
//   'VRI-YD': ['UP', 'DN'],
//   'PVN-YD': ['UP', 'DN'],
//   'ULU-YD': ['UP', 'DN'],
//   'PRKL-YD': ['UP', 'DN'],
//   'TVNL-YD': ['UP', 'DN'],
//   'KDMD-YD': ['UP', 'DN'],
//   'VM-YD': ['UP', 'DN'],

//   // TPJ-MV Section- Single line (represented as same string in array)
//   // Already defined above, this is a junction
//   'GOC-MCJ': ['SINGLE'],
//   'MCJ-TRB': ['SINGLE'],
//   'TRB-TOM': ['SINGLE'],
//   'TOM-SGM': ['SINGLE'],
//   'SGM-AYN': ['SINGLE'],
//   'AYN-BAL': ['SINGLE'],
//   'BAL-ALK': ['SINGLE'],
//   'ALK-TJ': ['SINGLE'],
//   'TJ-TT': ['SINGLE'],
//   'TT-PVL': ['SINGLE'],
//   'PVL-AZP': ['SINGLE'],
//   'AZP-PDV': ['SINGLE'],
//   'PDV-PML': ['SINGLE'],
//   'PML-SPL': ['SINGLE'],
//   'SPL-SWI': ['SINGLE'],
//   'SWI-DSM': ['SINGLE'],
//   'DSM-KMU': ['SINGLE'],
//   'KMU-TRM': ['SINGLE'],
//   'TRM-TDR': ['SINGLE'],
//   'TDR-ADT': ['SINGLE'],
//   'ADT-NPT': ['SINGLE'],
//   'NPT-KTM': ['SINGLE'],
//   'KTM-MV': ['SINGLE'],

//   // Yard connections for TPJ-MV (Single line)
//   'MCJ-YD': ['SINGLE'],
//   'TRB-YD': ['SINGLE'],
//   'TOM-YD': ['SINGLE'],
//   'SGM-YD': ['SINGLE'],
//   'AYN-YD': ['SINGLE'],
//   'BAL-YD': ['SINGLE'],
//   'ALK-YD': ['SINGLE'],
//   'TJ-YD': ['SINGLE'],
//   'TT-YD': ['SINGLE'],
//   'PVL-YD': ['SINGLE'],
//   'AZP-YD': ['SINGLE'],
//   'PDV-YD': ['SINGLE'],
//   'PML-YD': ['SINGLE'],
//   'SPL-YD': ['SINGLE'],
//   'SWI-YD': ['SINGLE'],
//   'DSM-YD': ['SINGLE'],
//   'KMU-YD': ['SINGLE'],
//   'TRM-YD': ['SINGLE'],
//   'TDR-YD': ['SINGLE'],
//   'ADT-YD': ['SINGLE'],
//   'NPT-YD': ['SINGLE'],
//   'KTM-YD': ['SINGLE'],
//   'MV-YD': ['SINGLE'],

//   // TPJ-TP Section (Single line)
//   'TPJ-TPE': ['SINGLE'],
//   'TPE-TP': ['SINGLE'],
//   'TPE-YD': ['SINGLE'],
//   'TP-YD': ['SINGLE']
// };



// export let lineData = {
//   // TPJ-VM Section - All are UP and DN lines (Double line section)
//   'TPJ-GOC': ['UP', 'DN'],  // Junction point with TPJ-MV and TPJ-TP
//   'GOC-TPTN': ['UP', 'DN'],
//   'TPTN-SRGM': ['UP', 'DN'],
//   'SRGM-VLDE': ['UP', 'DN'],
//   'VLDE-LLI': ['UP', 'DN'],
//   'LLI-PMB': ['UP', 'DN'],
//   'PMB-KKPM': ['UP', 'DN'],
//   'KKPM-KLGM': ['UP', 'DN'],
//   'KLGM-SLT': ['UP', 'DN'],
//   'SLT-ALU': ['UP', 'DN'],
//   'ALU-OTK': ['UP', 'DN'],
//   'OTK-SNDI': ['UP', 'DN'],
//   'SNDI-MTUR': ['UP', 'DN'],
//   'MTUR-ICG': ['UP', 'DN'],
//   'ICG-TLNR': ['UP', 'DN'],
//   'TLNR-VRI': ['UP', 'DN'],  // Junction with CUPJ-VRI line
//   'VRI-PVN': ['UP', 'DN'],
//   'PVN-ULU': ['UP', 'DN'],
//   'ULU-PRKL': ['UP', 'DN'],
//   'PRKL-TVNL': ['UP', 'DN'],
//   'TVNL-KDMD': ['UP', 'DN'],
//   'KDMD-VM': ['UP', 'DN'],  // Junction with VM-MV, VM-PDY, and KPD-VM lines

//   // Yard connections for TPJ-VM
//   'TPJ-YD': ['UP', 'DN'],
//   'GOC-YD': ['UP', 'DN'],
//   'SRGM-YD': ['UP', 'DN'],
//   'VLDE-YD': ['UP', 'DN'],
//   'LLI-YD': ['UP', 'DN'],
//   'PMB-YD': ['UP', 'DN'],
//   'KKPM-YD': ['UP', 'DN'],
//   'KLGM-YD': ['UP', 'DN'],
//   'SLT-YD': ['UP', 'DN'],
//   'ALU-YD': ['UP', 'DN'],
//   'OTK-YD': ['UP', 'DN'],
//   'SNDI-YD': ['UP', 'DN'],
//   'MTUR-YD': ['UP', 'DN'],
//   'ICG-YD': ['UP', 'DN'],
//   'TLNR-YD': ['UP', 'DN'],
//   'VRI-YD': ['UP', 'DN'],  // Appears in both TPJ-VM and CUPJ-VRI sections
//   'PVN-YD': ['UP', 'DN'],
//   'ULU-YD': ['UP', 'DN'],
//   'PRKL-YD': ['UP', 'DN'],
//   'TVNL-YD': ['UP', 'DN'],
//   'KDMD-YD': ['UP', 'DN'],
//   'VM-YD': ['UP', 'DN'],  // Appears in multiple sections as VM is a major junction

//   // VM-MV Section - Double line section
//   'VM-SXR': ['UP', 'DN'],  // VM is junction with TPJ-VM, VM-PDY, and KPD-VM lines
//   'SXR-TUY': ['UP', 'DN'],
//   'TUY-PRT': ['UP', 'DN'],
//   'PRT-MBU': ['UP', 'DN'],
//   'MBU-NPM': ['UP', 'DN'],
//   'NPM-TDPR': ['UP', 'DN'],
//   'TDPR-CUPJ': ['UP', 'DN'],  // Junction with CUPJ-VRI line
//   'CUPJ-ALP': ['UP', 'DN'],
//   'ALP-PUC': ['UP', 'DN'],
//   'PUC-KII': ['UP', 'DN'],
//   'KII-CDM': ['UP', 'DN'],
//   'CDM-CLN': ['UP', 'DN'],
//   'CLN-SY': ['UP', 'DN'],
//   'SY-VDL': ['UP', 'DN'],
//   'VDL-ANP': ['UP', 'DN'],
//   'ANP-MV': ['UP', 'DN'],  // MV is junction with TPJ-MV and MV-TVR lines
//   'SXR-YD': ['UP', 'DN'],
//   'TUY-YD': ['UP', 'DN'],
//   'PRT-YD': ['UP', 'DN'],
//   'MBU-YD': ['UP', 'DN'],
//   'NPM-YD': ['UP', 'DN'],
//   'TDPR-YD': ['UP', 'DN'],
//   'CUPJ-YD': ['UP', 'DN'],  // Appears in both VM-MV and CUPJ-VRI sections
//   'ALP-YD': ['UP', 'DN'],
//   'PUC-YD': ['UP', 'DN'],
//   'KII-YD': ['UP', 'DN'],
//   'CDM-YD': ['UP', 'DN'],
//   'CLN-YD': ['UP', 'DN'],
//   'SY-YD': ['UP', 'DN'],
//   'VDL-YD': ['UP', 'DN'],
//   'ANP-YD': ['UP', 'DN'],
//   'MV-YD': ['UP', 'DN'],  // Appears in multiple sections as MV is a junction

//   // TPJ-MV Section - Single line
//   // 'TPJ-GOC': ['UP', 'DN'],  // Already listed in TPJ-VM, repeated here as it's a junction
//   'GOC-TRB': ['SINGLE'],
//   'TRB-SGM': ['SINGLE'],
//   'SGM-BAL': ['SINGLE'],
//   'BAL-ALK': ['SINGLE'],
//   'ALK-TJ': ['SINGLE'],  // Junction with TJ-KIK line
//   'TJ-TT': ['SINGLE'],
//   'TT-PDV': ['SINGLE'],
//   'PDV-SPL': ['SINGLE'],
//   'SPL-KMU': ['SINGLE'],
//   'KMU-ADT': ['SINGLE'],
//   'ADT-KTM': ['SINGLE'],
//   'KTM-MV': ['SINGLE'],  // MV is junction with VM-MV and MV-TVR lines
//   'TRB-YD': ['SINGLE'],
//   'SGM-YD': ['SINGLE'],
//   'BAL-YD': ['SINGLE'],
//   'ALK-YD': ['SINGLE'],
//   'TJ-YD': ['SINGLE'],  // Appears in both TPJ-MV and TJ-KIK sections
//   'TT-YD': ['SINGLE'],
//   'PDV-YD': ['SINGLE'],
//   'SPL-YD': ['SINGLE'],
//   'KMU-YD': ['SINGLE'],
//   'ADT-YD': ['SINGLE'],
//   'KTM-YD': ['SINGLE'],
//   // 'MV-YD': ['UP', 'DN'],  // Already listed in VM-MV, MV is a major junction

//   // TJ-KIK Section - Single line
//   'TJ-SMM': ['SINGLE'],  // TJ is junction with TPJ-MV line
//   'SMM-NMJ': ['SINGLE'],  // NMJ is junction with NMJ-MQ line
//   'NMJ-KDE': ['SINGLE'],
//   'KDE-KU': ['SINGLE'],
//   'KU-TVR': ['SINGLE'],  // TVR is junction with MV-TVR and TVR-KKDI lines
//   'TVR-KVL': ['SINGLE'],
//   'KVL-NGT': ['SINGLE'],  // NGT is junction with NGT-VLNK line
//   'NGT-NCR': ['SINGLE'],
//   'NCR-KIK': ['SINGLE'],
//   // 'TJ-YD': ['SINGLE'],  // Already listed in TPJ-MV
//   'SMM-YD': ['SINGLE'],
//   'NMJ-YD': ['SINGLE'],  // Appears in both TJ-KIK and NMJ-MQ sections
//   'KDE-YD': ['SINGLE'],
//   'KU-YD': ['SINGLE'],
//   'TVR-YD': ['SINGLE'],  // Appears in multiple sections as TVR is a junction
//   'KVL-YD': ['SINGLE'],
//   'NGT-YD': ['SINGLE'],  // Appears in both TJ-KIK and NGT-VLNK sections
//   'NCR-YD': ['SINGLE'],
//   'KIK-YD': ['SINGLE'],

//   // MV-TVR Section - Single line
//   'MV-PEM': ['SINGLE'],  // MV is junction with TPJ-MV and VM-MV lines
//   'PEM-NNM': ['SINGLE'],
//   'NNM-TVR': ['SINGLE'],  // TVR is junction with TJ-KIK and TVR-KKDI lines
//   // 'MV-YD': ['UP', 'DN'],  // Already listed in VM-MV and TPJ-MV
//   'PEM-YD': ['SINGLE'],
//   'NNM-YD': ['SINGLE'],
//   // 'TVR-YD': ['SINGLE'],  // Already listed in TJ-KIK, TVR is a junction

//   // NMJ-MQ Section - Single line
//   'NMJ-MQ': ['SINGLE'],  // NMJ is junction with TJ-KIK line
//   // 'NMJ-YD': ['SINGLE'],  // Already listed in TJ-KIK
//   'MQ-YD': ['SINGLE'],

//   // VM-PDY Section - Single line
//   'VM-CBU': ['SINGLE'],  // VM is junction with TPJ-VM, VM-MV, and KPD-VM lines
//   'CBU-PDY': ['SINGLE'],
//   // 'VM-YD': ['UP', 'DN'],  // Already listed in TPJ-VM and VM-MV
//   'CBU-YD': ['SINGLE'],
//   'PDY-YD': ['SINGLE'],

//   // KPD-VM Section - Single line
//   'KPD-VLR': ['SINGLE'],
//   'VLR-KNB': ['SINGLE'],
//   'KNB-ARV': ['SINGLE'],
//   'ARV-PRL': ['SINGLE'],
//   'PRL-AGM': ['SINGLE'],
//   'AGM-TJM': ['SINGLE'],
//   'TJM-TNM': ['SINGLE'],
//   'TNM-TNI': ['SINGLE'],
//   'TNI-TRK': ['SINGLE'],
//   'TRK-MMP': ['SINGLE'],
//   'MMP-VKM': ['SINGLE'],
//   'VKM-VM': ['SINGLE'],  // VM is junction with TPJ-VM, VM-MV, and VM-PDY lines
//   'KPD-YD': ['SINGLE'],
//   'VLR-YD': ['SINGLE'],
//   'KNB-YD': ['SINGLE'],
//   'KMM-YD': ['SINGLE'],
//   'ARV-YD': ['SINGLE'],
//   'PRL-YD': ['SINGLE'],
//   'AGM-YD': ['SINGLE'],
//   'TJM-YD': ['SINGLE'],
//   'TNM-YD': ['SINGLE'],
//   'TNI-YD': ['SINGLE'],
//   'TRK-YD': ['SINGLE'],
//   'MMP-YD': ['SINGLE'],
//   'VKM-YD': ['SINGLE'],
//   // 'VM-YD': ['UP', 'DN'],  // Already listed in multiple sections

//   // CUPJ-VRI Section - Single line
//   'CUPJ-KJKPD': ['SINGLE'],  // CUPJ is junction with VM-MV line
//   'KJKPD-VLU': ['SINGLE'],
//   'VLU-NVL': ['SINGLE'],
//   'NVL-UMG': ['SINGLE'],
//   'UMG-VRI': ['SINGLE'],  // VRI is junction with TPJ-VM line
//   // 'CUPJ-YD': ['UP', 'DN'],  // Already listed in VM-MV
//   'KJKPD-YD': ['SINGLE'],
//   'VLU-YD': ['SINGLE'],
//   'NVL-YD': ['SINGLE'],
//   'UMG-YD': ['SINGLE'],
//   // 'VRI-YD': ['UP', 'DN'],  // Already listed in TPJ-VM

//   // TPJ-TP Section - Single line
//   'TPJ-TP': ['SINGLE'],  // TPJ is junction with TPJ-VM and TPJ-MV lines
//   // 'TPJ-YD': ['UP', 'DN'],  // Already listed in TPJ-VM
//   'TP-YD': ['SINGLE'],

//   // NGT-VLNK Section - Single line
//   'NGT-VLNK': ['SINGLE'],  // NGT is junction with TJ-KIK line
//   // 'NGT-YD': ['SINGLE'],  // Already listed in TJ-KIK
//   'VLNK-YD': ['SINGLE'],

//   // TVR-KKDI Section - Single line
//   'TVR-TNK': ['SINGLE'],  // TVR is junction with TJ-KIK and MV-TVR lines
//   'TNK-TTP': ['SINGLE'],  // TTP is junction with TTP-AGX line
//   'TTP-AMM': ['SINGLE'],
//   'AMM-PKT': ['SINGLE'],
//   'PKT-PVI': ['SINGLE'],
//   'PVI-AYI': ['SINGLE'],
//   'AYI-ATQ': ['SINGLE'],
//   'ATQ-PYK': ['SINGLE'],
//   'PYK-KKDI': ['SINGLE'],
//   // 'TVR-YD': ['SINGLE'],  // Already listed in TJ-KIK and MV-TVR
//   'TNK-YD': ['SINGLE'],
//   'TTP-YD': ['SINGLE'],  // Appears in both TVR-KKDI and TTP-AGX sections
//   'TAM-YD': ['SINGLE'],
//   'AMM-YD': ['SINGLE'],
//   'PKT-YD': ['SINGLE'],
//   'PVI-YD': ['SINGLE'],
//   'AYI-YD': ['SINGLE'],
//   'ATQ-YD': ['SINGLE'],
//   'PYK-YD': ['SINGLE'],
//   'KKDI-YD': ['SINGLE'],

//   // TTP-AGX Section - Single line
//   'TTP-AGX': ['SINGLE'],  // TTP is junction with TVR-KKDI line
//   // 'TTP-YD': ['SINGLE'],  // Already listed in TVR-KKDI
//   'AGX-YD': ['SINGLE']
// };

export let lineData = {
  // JTJ-ED Section
  "JTJ-TPT": ["UP", "DN"],
  "TPT-KEY": ["UP", "DN"],
  "KEY-SLY": ["UP", "DN"],
  "SLY-DST": ["UP", "DN"],
  "DST-DPI": ["UP", "DN"],
  "DPI-MAP": ["UP", "DN"],
  "MAP-BDY": ["UP", "DN"],
  "BDY-BQI": ["UP", "DN"],
  "BQI-LCR": ["UP", "DN"],
  "LCR-DSPT": ["UP", "DN"],
  "DSPT-TNT": ["UP", "DN"],
  "TNT-KPPR": ["UP", "DN"],
  "KPPR-MGSJ": ["UP", "DN"],
  "MGSJ-SA": ["UP", "DN"],
  "SA-VRPD": ["UP", "DN"],
  "VRPD-DC": ["UP", "DN"],
  "DC-MVPM": ["UP", "DN"],
  "MVPM-SGE": ["UP", "DN"],
  "SGE-ANU": ["UP", "DN"],
  "ANU-CV": ["UP", "DN"],
  "CV-ED": ["UP", "DN"],
  "TPT-YD": ["UP", "DN"],
  "KEY-YD": ["UP", "DN"],
  "SLY-YD": ["UP", "DN"],
  "DST-YD": ["UP", "DN"],
  "DPI-YD": ["UP", "DN"],
  "MAP-YD": ["UP", "DN"],
  "BDY-YD": ["UP", "DN"],
  "BQI-YD": ["UP", "DN"],
  "LCR-YD": ["UP", "DN"],
  "DSPT-YD": ["UP", "DN"],
  "TNT-YD": ["UP", "DN"],
  "KPPR-YD": ["UP", "DN"],
  "MGS-YD": ["UP", "DN"],
  "VRPD-YD": ["UP", "DN"],
  "DC-YD": ["UP", "DN"],
  "MVPM-YD": ["UP", "DN"],
  "SGE-YD": ["UP", "DN"],
  "ANU-YD": ["UP", "DN"],
  "CV-YD": ["UP", "DN"],
  "ED-YD": ["UP", "DN"],

  // ED-PTJ Section
  "ED-TPM": ["UP", "DN"],
  "TPM-PY": ["UP", "DN"],
  "PY-IGR": ["UP", "DN"],
  "IGR-VZ": ["UP", "DN"],
  "VZ-UKL": ["UP", "DN"],
  "UKL-TUP": ["UP", "DN"],
  "TUP-VNJ": ["UP", "DN"],
  "VNJ-SNO": ["UP", "DN"],
  "SNO-SUU": ["UP", "DN"],
  "SUU-IGU": ["UP", "DN"],
  "IGU-PLMD": ["UP", "DN"],
  "IGU-PTJ": ["Single"],
  "PLMD-CBF": ["UP", "DN"],
  "CBF-CBE": ["UP", "DN"],
  "CBE-PTJ": ["UP", "DN"],
  "PTJ-MDKI":["UP", "DN"],
  "JTJ-YD": ["UP", "DN"],
  "MGSJ-YD": ["UP", "DN"],
  "ULK-YD": ["UP", "DN"],
  "TUP-YD": ["UP", "DN"],
  "TPM-YD": ["UP", "DN"],
  "PY-YD": ["UP", "DN"],
  "IGR-YD": ["UP", "DN"],
  "UKL-YD": ["UP", "DN"],
  "VZ-YD": ["UP", "DN"],
  "VNJ-YD": ["UP", "DN"],
  "SUU-YD": ["UP", "DN"],
  "SNO-YD": ["UP", "DN"],
  "IGU-YD": ["UP", "DN"],
  "PLMD-YD": ["UP", "DN"],
  "CBF-YD": ["UP", "DN"],
  "CBE-YD": ["UP", "DN"],
  "PTJ-YD": ["UP", "DN"],
//ED - TP
 "ED-CVD": ["Single"],
  "CVD-PAS": ["Single"],
  "PAS-URL": ["Single"],
  "URL-KMD": ["Single"],
  "KMD-PGR": ["Single"],
  "PGR-MPLM": ["Single"],
  "MPLM-KRR": ["Single"],
  "KRR-VRQ": ["Single"],
  "VRQ-MYU": ["Single"],
  "MYU-MMH": ["Single"],
  "MMH-LP": ["Single"],
  "LP-KLT": ["Single"],
  "KLT-PLI": ["Single"],
  "PLI-PGN": ["Single"],
  "PGN-EL": ["Single"],
  "EL-MTNL": ["Single"],
  "MTNL-TP": ["Single"],
  "CVD-YD": ["Single"],
  "PAS-YD": ["Single"],
  "URL-YD": ["Single"],
  "KMD-YD": ["Single"],
  "PGR-YD": ["Single"],
  "MPLM-YD": ["Single"],
  "KRR-YD": ["Single"],
  "VRQ-YD": ["Single"],
  "MYU-YD": ["Single"],
  "MMH-YD": ["Single"],
  "LP-YD": ["Single"],
  "KLT-YD": ["Single"],
  "PLI-YD": ["Single"],
  "PGN-YD": ["Single"],
  "EL-YD": ["Single"],
  "MTNL-YD": ["Single"],
  "TP-YD": ["Single"],

  // KRR-DG Section
  "KRR-VEI": ["Single"],
  "VEI-PALM": ["Single"],
  "PALM-EDU": ["Single"],
  "EDU-DG": ["Single"],
  "VEI-YD": ["Single"],
  "PALM-YD": ["Single"],
  "EDU-YD": ["Single"],

  // SA-VRI Section
  "SA-SAMT": ["Single"],
  "SAMT-SXT": ["Single"],
  "SXT-MPLI": ["Single"],
  "MPLI-ETP": ["Single"],
  "ETP-ATU": ["Single"],
  "ATU-CHSM": ["Single"],
  "CHSM-PRV": ["Single"],
  "PRV-MKSP": ["Single"],
  "MKSP-VRI": ["Single"],
  "SA-YD": ["Single"],
  "SAMT-YD": ["Single"],
  "SXT-YD": ["Single"],
  "MPLI-YD": ["Single"],
  "ETP-YD": ["Single"],
  "ATU-YD": ["Single"],
  "CHSM-YD": ["Single"],
  "PRV-YD": ["Single"],
  "MKSP-YD": ["Single"],

  // SA-MTDM Section
  "SA-MGSJ": ["UP", "DN"],
  "SA-MGSJ NEW": ["UP", "DN"],
  "MGSJ-OML": ["UP", "DN"],
  "OML-MCRD": ["UP", "DN"],
  "MCRD-MTDM": ["UP", "DN"],
  "MTDM-MTPP": ["UP", "DN"],
  "OML-YD": ["UP", "DN"],
  "MCRD-YD": ["UP", "DN"],
  "MTDM-YD": ["UP", "DN"],
  "MTPP-YD": ["UP", "DN"],


  // SA-KRR Section (Single Line)
  "SA-MALR": ["Single"],
  "MALR-RASP": ["Single"],
  "RASP-KLGN": ["Single"],
  "KLGN-NMKL": ["Single"],
  "NMKL-MONR": ["Single"],
  "MONR-KRR": ["Single"],
  "MALR-YD": ["Single"],
  "RASP-YD": ["Single"],
  "KLGN-YD": ["Single"],
  "NMKL-YD": ["Single"],
  "MONR-YD": ["Single"],

  // MTP-UAM Section (Single Line)
  "MTP-QLR": ["Single"],
  "QLR-HLG": ["Single"],
  "HLG-ONR": ["Single"],
  "ONR-WEL": ["Single"],
  "WEL-AVK": ["Single"],
  "AVK-KXT": ["Single"],
  "KXT-LOV": ["Single"],
  "LOV-UAM": ["Single"],
  "QLR-YD": ["Single"],
  "HLG-YD": ["Single"],
  "ONR-YD": ["Single"],
  "WEL-YD": ["Single"],
  "AVK-YD": ["Single"],
  "KXT-YD": ["Single"],
  "LOV-YD": ["Single"],
  "UAM-YD": ["Single"],

  // PTJ-CNV Section (Single Line)
  "CNV-PTJ": ["Single"],
  "CNV-YD": ["Single"],

  // CBE-MTP Section (Single Line)
  "CBE-CBF": ["Single"],
  "CBF-KAY": ["Single"],
  "KAY-MTP": ["Single"],
  "KAY-YD": ["Single"],
  "MTP-YD": ["Single"]
};


// export const depot: DepotStructure = {
//   "TPJ-VM": {
//     'TRD': ["TPJ", "VM"],
//     'S&T': ["TPJ", "VM"],
//     'ENGG': ["TPJ", "VM"]
//   },

//   "VM-MV": {
//     'TRD': ["VM", "MV"],
//     'S&T': ["VM", "MV"],
//     'ENGG': ["VM", "MV"]
//   },

//   "TPJ-MV": {
//     'TRD': ["TPJ", "MV"],
//     'S&T': ["TPJ", "MV"],
//     'ENGG': ["TPJ", "KTM", "MV"]
//   },

//   "TJ-KIK": {
//     'TRD': ["TJ", "KIK"],
//     'S&T': ["TJ", "KIK"],
//     'ENGG': ["TJ", "KIK"]
//   },

//   "MV-TVR": {
//     'TRD': ["MV", "PEM", "POM", "NNM", "TVR"],
//     'S&T': ["MV", "PEM", "POM", "NNM", "TVR"],
//     'ENGG': ["MV", "PEM", "POM", "NNM", "TVR"]
//   },

//   "NMJ-MQ": {
//     'TRD': ["NMJ", "MQ"],
//     'S&T': ["NMJ", "MQ"],
//     'ENGG': ["NMJ", "MQ"]
//   },

//   "VM-PDY": {
//     'TRD': ["VM", "VRA", "CBU", "VI", "PDY"],
//     'S&T': ["VM", "VRA", "CBU", "VI", "PDY"],
//     'ENGG': ["VM", "VRA", "CBU", "VI", "PDY"]
//   },

//   "KPD-VM": {
//     'TRD': ["KPD"],
//     'S&T': ["KPD", "VT"],
//     'ENGG': ["KPD", "VT"]
//   },

//   "CUPJ-VRI": {
//     'TRD': ["CUP J", "KJKPD"],
//     'S&T': ["CUP J", "KJKPD"],
//     'ENGG': ["CUP J", "KJKPD"]
//   },

//   "TPJ-TP": {
//     'TRD': ["TPJ"],
//     'S&T': ["TPJ"],
//     'ENGG': ["TPJ"]
//   },

//   "NGT-VLNK": {
//     'TRD': ["NGT"],
//     'S&T': ["NGT"],
//     'ENGG': ["NGT"]
//   },

//   "TVR-KKDI": {
//     'TRD': ["TVR", "KKDI"],
//     'S&T': ["TVR", "KKDI"],
//     'ENGG': ["TVR", "KKDI"]
//   },

//   "TTP-AGX": {
//     'TRD': ["TTP", "AGX"],
//     'S&T': ["TTP", "AGX"],
//     'ENGG': ["TTP", "AGX"]
//   }
// };

// export const depot: DepotStructure = {
//   "TPJ-VM": {
//     'ENGG': ["TPJ","LLI","ALU","A/VRI"],
//     'S&T': ["TPJ", "ALU","VRI","VM"],
//     'TRD': ["RRI","Lines","VRI/A","VRI/B","VM"]
//   },

//   "VM-MV": {
//     'TRD': ["CUP J", "MV", "VM"],
//     'S&T': ["CUP J", "MV", "VM"],
//     'ENGG': ["CUP J", "MV"]
//   },

//   "TPJ-MV": {
//     'TRD': ["TJ", "MV", "RRI"],
//     'S&T': ["TPJ", "TJ", "MV"],
//     'ENGG': ["TPJ", "TJ", "KMU", "MV"]
//   },

//   "TJ-KIK": {
//     'TRD': ["TJ", "TVR"],
//     'S&T': ["TJ", "KIK", "TVR"],
//     'ENGG': ["TJ", "A/TVR"]
//   },

//   "MV-TVR": {
//     'TRD': ["MV", "TVR"],
//     'S&T': ["MV", "TVR"],
//     'ENGG': ["MV", "TVR"]
//   },

//   "NMJ- MQ": {
//     'TRD': ["TJ", "TVR"],
//     'S&T': ["TJ", "TVR"],
//     'ENGG': ["TJ", "TVR"]
//   },

//   "VM-PDY": {
//     'TRD': ["VM"],
//     'S&T': ["VM"],
//     'ENGG': ["VM"]
//   },

//   "KPD-VM": {
//     'TRD': ["VLR", "TNM"],
//     'S&T': ["TNM", "VM", "ARV"],
//     'ENGG': ["TNM", "VLR",]
//   },

//   "CUPJ-VRI": {
//     'TRD': ["CUP J", "VRI"],
//     'S&T': ["CUP J", "VRI"],
//     'ENGG': ["BVR"]
//   },

//   "TPJ-TP": {
//     'TRD': ["RRI", "Lines"],
//     'S&T': ["TPJ",],
//     'ENGG': ["TPJ",]
//   },

//   "NGT-VLNK": {
//     'TRD': ["TVR"],
//     'S&T': ["KIK"],
//     'ENGG': ["A/TVR"]
//   },

//   "TVR- KKDI": {
//     'TRD': ["TVR","PKT"],
//     'S&T': ["TVR"],
//     'ENGG': ["PKT", "TTP", "B/TVR"]
//   },

//   "TTP-AGX": {
//     'TRD': ["PKT"],
//     'S&T': ["TVR"],
//     'ENGG': ["TTP"]
//   }
// };


export const location = {
  "MAS": "MADRAS",
  "AJJ": "AINSDFD",
  "AJJN": "DFSDFAJJN",
  "AJP": "DSFSD",
};

// export const depotOnLocation = {
//   "TPJ": [
//     "TPJ", "VM", "MV", "KTM", "TJ", "KIK", "PEM", "POM", "NNM", "TVR",
//     "NMJ", "MQ", "VRA", "CBU", "VI", "PDY", "KPD", "VT", "CUP J", "KJKPD",
//     "NGT", "KKDI", "TTP", "AGX", "TVT", "PON", "SPE", "GDR", "WSTA",
//     "WSTB", "AVD", "TRLA", "TRLB", "AJJ", "WJR", "AB", "JTJ", "TRT",
//     "PUT", "CJ", "MS", "TBM", "CGL", "ACK", "TMV", "MSB", "BBQ", "GPD",
//     "NYP", "TRL", "AJJE", "KPDW"
//   ]
// };
// export const depotOnLocation = {
//   "TPJ": [
//     "TPJ",     // Tiruchchirappalli Junction
//     "LLI",
//     "ALU",     // Alur
//     "A/VRI",
//     "VRI",     // Virarakhavam
//     "VM",      // Villupuram Junction
//     "RRI",
//     "Lines",
//     "VRI/A",
//     "VRI/B",
//     "CUP J",   // Cuddalore Port Junction
//     "MV",      // Mayiladuthurai Junction
//   ]
// }

export const depotOnLocation = {
  "SA": [
  "SA", "ED", "GS","BR-ED", "BQI", "SLY", "MAP", "TPT", "N-SA", "S-SA","TUP","CBE", "E-PTJ", "KMD", "PLI", "TP", "W-KRR","KRR", "KRR-E", "CHSM", "VRI", "S-SA", "ATU","MTDM", "N-SA","NMKL", "KRR","PTJ", "CBF",  "ONR", "E-PTJ"
  ]
};


export const depot: DepotStructure = {
  "JTJ-ED": {
    'TRD': ["SA","ED","BQI","SLY"],
    'S&T': ["MAP", "BQI","ED","SA","TPT"],
    'ENGG': ["TPT","BQI","N-SA","S-SA","ED","GS","BR-ED"]
  },

  "ED-PTJ": {
    'TRD': ["ED", "TUP", "PTJ"],
    'S&T': ["TUP", "PTJ", "CBE", "ED"],
    'ENGG': ["ED","TUP","E-PTJ","CBE","GS","BR-ED","CBF"]
  },

  "ED-TP": {
    'TRD': ["KMD", "PLI"],
    'S&T': ["KRR-W", "KRR-E","ED"],
    'ENGG': ["TP","W-KRR","GS","BR-ED"]
  },

  "KRR-DG": {
    'TRD': ["KRR"],
    'S&T': ["KRR-E"],
    'ENGG': ["E-KRR","GS","BR-ED"]
  },

  "SA-VRI": {
    'TRD': ["SA", "CHSM"],
    'S&T': ["SA","VRI","SXT"],
    'ENGG': ["S-SA", "ATU", "CHSM","GS","BR-ED"]
  },

  "SA-MTDM": {
    'TRD': ["SA", "MTDM"],
    'S&T': ["SA"],
    'ENGG': ["N-SA","GS","BR-ED"]
  },
  
  "SA-KRR": {
    'TRD': ["SA", "NMKL", "KRR"],
    'S&T': ["SA","KRR-W","SXT"],
    'ENGG': ["NMKL","GS","BR-ED"]
  },

  "CBE-MTP": {
    'TRD': ["PTJ"],
    'S&T': ["CBE"],
    'ENGG': ["CBF","GS","BR-ED"]
  },

  "MTP-UAM": {
    'TRD': [],
    'S&T': ["CBE"],
    'ENGG': ["ONR","GS","BR-ED"]
  },
  "PTJ-CNV": {
    'TRD': ["PTJ"],
    'S&T': ["PTJ"],
    'ENGG': ["E-PTJ","GS","BR-ED"]
  }
};



export let machine = [
  "BCM",
  "UNIMAT 4S",
  "MFI",
  "MPI",
  "MDU",
  "DUOMAT",
  "CSM",
  "DGS 353",
  "SBCM",
  "BRM R32",
  "UTV",
  "T 28",
  "TRT",
  "3X DTE",
];

export let work = [
  "RR / WW",
  "WELDING",
  "CMS XG RENEWAL",
  "SEJ / RR",
  "TRR / WW",
  "MFBW",
  "20R/P UNLOADING",
  "JOINT INSPECTION",
  "T/O",
  "RR / WW",
  "BRIDGE WORK",
  "FOB",
  "PF WORK",
];

export let workData = {
  ENGG: {
    Machine_Blocks: [
      "BCM ",
      "DTE ",
      "CSM ",
      "DUOMAT",
      "UNIMAT",
      "MFI",
      "MPT",
      "MDU",
      "BRM",
      "FRM ",
      "TRT ",
      "UTV",
      "DTS",
      "T28",
      "SQRS",
      "RGM working",
    ],
    Non_Machine: [
      "Rail renewal",
      "Welding work",
      "Destressing work",
      "Switch renewal",
      "CMS Crossing renewal",
      "SEJ Renewal",
      "Glued Joint renewal",
      "Dummy Glued Joint removal",
      "TRR P 60 Kg",
      "TRR S 60 Kg",
      "TRR S 60 kg",
      "TRR S 52 kg",
      "Interchanging",
      "Trucking out/Shifting materials",
      "TWR with MFBW",
      "TBTR (Br sleeper renewal)",
      "TSR P 60 Kg",
      "TSR S 60 Kg",
      "TSR S 52 Kg",
      "TTSR work",
      "Jt Insp Notes Attn",
      "Stretcherbar renewal",
      "TFR Work",
      "Ballast Unloading",
      "Rail unloading",
      "Lifting and packing",
      "Gauge tie plate renewal",
      "Sleeper renewal",
      "Fish Plates O&E",
      "Preliminary/Post works",
      "Trucking out materials",
      "Cutting Widening work",
      "JCB working",
      "Earth work/Muck removal",
      "Crane Moving/Working",
      "Attention to Track",
      "Attention to Fittings",
      "Attention to Bridge",
      "Attention to Guard rail",
      "Attention to Points & Xing",
      "Attention to LC",
      "Attention to Curve check rail",
      "Sheet Piling work",
      "Platform work",
      "Platform Shelter work",
      "ABSS work",
      "Erection of Platform shelter purlins work",
      "Erection of FOB Girders",
      "Other FOB works",
      "Other Track works",
      "Other Bridge work",
    ],
  },
  SIG: {
    Gear: [
      "Point",
      "EI",
      "Signal",
      "DC Track",
      "AFTC",
      "SSDAC",
      "MSDAC",
      "Panel",
      "LC Gate Mechanical",
      "LC Gate ELB",
      "Emergency Sliding Boom",
      "IPS",
      "Conventional power supply equipment",
      "System Integrity Test of each PI/EI/RRI stations",
      "Cable Insulation testing (cable meggering) for one station.",
      "DLBI- SGE",
      "TLBI -FM Inst",
      "UFSBI",
      "Fuse",
      "EKT",
    ],
  },
  TRD: {
    Tw_Working: [
      "AOH",
      "POH",
      "IOH",
      "RE POH",
      "RD WORK",
      "TURN OUT CHECKING",
      "CROSS OVER CHECKING",
      "CROSS TRACK FEEDERS CHECKING",
      "GANTRY MAINTENANCE",
      "CONTACT WIRE RENEWAL WORK",
      "CATENARY WIRE RENEWAL WORK",
      "CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)",
      "MAST ERECTION(2x25KV WORK)",
      "FEEDERS ERECTION(2x25KV WORK)",
      "OHE PROFILING",
      "OHE/CN WORK",
      "OTHER SPECIAL WORKS",
    ],
    Lt_Working: [
      "AOH",
      "POH",
      "IOH",
      "RE POH",
      "RD WORK",
      "TURN OUT CHECKING",
      "CROSS OVER CHECKING",
      "CROSS TRACK FEEDERS CHECKING",
      "GANTRY MAINTENANCE",
      "CONTACT WIRE RENEWAL WORK",
      "CATENARY WIRE RENEWAL WORK",
      "CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)",
      "MAST ERECTION(2x25KV WORK)",
      "FEEDERS ERECTION(2x25KV WORK)",
      "OHE PROFILING",
      "OHE/CN WORK",
      "OTHER SPECIAL WORKS",
    ],
  },
};

export let data = {
  sections: [
    {
      name: "AJJ-RU",
      section_blocks: [
        { block: "AJJ-AJJN", lines: ["UP", "DN"] },
        { block: "MLPM-AJJN", lines: ["UP", "DN"] },
        { block: "AJJN-TRT", lines: ["UP", "DN"] },
        { block: "TRT-POI", lines: ["UP", "DN"] },
        { block: "POI-NG", lines: ["UP", "DN"] },
        { block: "NG-VGA", lines: ["UP", "DN"] },
        { block: "POI-VKZ", lines: ["UP", "DN"] },
        { block: "VKZ-NG", lines: ["UP", "DN"] },
        { block: "NG-EKM", lines: ["UP", "DN"] },
        { block: "EKM-VGA", lines: ["UP", "DN"] },
        { block: "VGA-PUT", lines: ["UP", "DN"] },
        { block: "PUT-TDK", lines: ["UP", "DN"] },
        { block: "TDK-PUDI", lines: ["UP", "DN"] },
        { block: "PUDI-RU", lines: ["UP", "DN"] },
      ],
      station_blocks: [
        { block: "AJJ-YD", lines: ["UP", "DN"] },
        { block: "MLPM-YD", lines: ["UP", "DN"] },
        { block: "AJJN-YD", lines: ["UP", "DN"] },
        { block: "TRT-YD", lines: ["UP", "DN"] },
        { block: "POI-YD", lines: ["UP", "DN"] },
        { block: "NG-YD", lines: ["UP", "DN"] },
        { block: "VGA-YD", lines: ["UP", "DN"] },
        { block: "PUT-YD", lines: ["UP", "DN"] },
        { block: "TDK-YD", lines: ["UP", "DN"] },
        { block: "PUDI-YD", lines: ["UP", "DN"] },
        { block: "RU-YD", lines: ["UP", "DN"] },
      ],
      lines: ["UP", "DN"],
    },
    {
      name: "MAS-AJJ",
      section_blocks: [
        {
          block: "MAS-BBQ",
          lines: ["Up SW", "Down SW", "Up NE", "Down NE"],
        },
        {
          block: "MASS-BBQ",
          lines: ["Up SW Sub", "Down SW Sub"],
        },
        {
          block: "MMCC-BBQ",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "BBQ-VPY",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "VPY-VLK",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "VLK-ABU",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "ABU-AVD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "AVD-PAB",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "PAB-PTMS",
          lines: ["Up and Down Single"],
        },
        {
          block: "PTMS-TI",
          lines: ["Up and Down Single"],
        },
        {
          block: "PAB-TI",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "TI-TRL",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "TRL-KBT",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "KBT-TO",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "TO-AJJ",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
      ],
      station_blocks: [
        {
          block: "MAS-YD",
          lines: ["Up SW", "Down SW", "Up NE", "Down NE"],
        },
        {
          block: "BBQ-YD",
          lines: ["Up SW", "Down SW", "Up SW Sub", "Down SW Sub"],
        },
        {
          block: "MASS-YD",
          lines: ["Up SW Sub", "Down SW Sub"],
        },
        {
          block: "MMCC-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "VPY-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "VLK-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "ABU-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "AVD-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "PAB-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "PTMS-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "TI-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "TRL-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "KBT-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "TO-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
        {
          block: "AJJ-YD",
          lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
        },
      ],
      lines: [
        "Up slow",
        "Down slow",
        "Up fast",
        "Down fast",
        "Up NE, Dowm NE, Up SW, Down SW",
      ],
    },
    {
      name: "MSB-VM",
      section_blocks: [
        {
          block: "MSB-MS",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "MS-MKK",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "MKK-MBM",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "MBM-STM",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "STM-PV",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "PV-TBM",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        { block: "TBM-PRGL", lines: ["UP line", "Down line"] },
        { block: "TBM-VDR", lines: ["UP line", "Down line", "3rd line"] },
        { block: "PRGL-VDR", lines: ["UP line", "Down line"] },
        { block: "VDR-UPM", lines: ["UP line", "Down line"] },
        { block: "VDR-GI", lines: ["UP line", "Down line", "3rd line"] },
        { block: "UPM-GI", lines: ["UP line", "Down line"] },
        { block: "POTI-CTM", lines: ["UP line", "Down line"] },
        { block: "CTM-MMNK", lines: ["UP line", "Down line"] },
        { block: "MMNK-SKL", lines: ["UP line", "Down line"] },
        { block: "SKL-PWU", lines: ["UP line", "Down line"] },
        { block: "GI-CTM", lines: ["UP line", "Down line", "3rd line"] },
        { block: "CTM-SKL", lines: ["UP line", "Down line", "3rd line"] },
        { block: "SKL-CGL", lines: ["UP line", "Down line", "3rd line"] },
        { block: "PWU-CGL", lines: ["UP line", "Down line"] },
        { block: "CGL-OV", lines: ["UP line", "Down line"] },
        { block: "OV-PTM", lines: ["UP line", "Down line"] },
        { block: "PTM-KGZ", lines: ["UP line", "Down line"] },
        { block: "OV-KGZ", lines: ["UP line", "Down line"] },
        { block: "KGZ-MMK", lines: ["UP line", "Down line"] },
        { block: "MMK-MLMR", lines: ["UP line", "Down line"] },
        { block: "MLMR-ACK", lines: ["UP line", "Down line"] },
        { block: "ACK-TZD", lines: ["UP line", "Down line"] },
        { block: "MLMR-TZD", lines: ["UP line", "Down line"] },
        { block: "TZD-OLA", lines: ["UP line", "Down line"] },
        { block: "OLA-TMV", lines: ["UP line", "Down line"] },
        { block: "TMV-MTL", lines: ["UP line", "Down line"] },
        { block: "MTL-PEI", lines: ["UP line", "Down line"] },
        { block: "PEI-VVN", lines: ["UP line", "Down line"] },
        { block: "VVN-MYP", lines: ["UP line", "Down line"] },
        { block: "MYP-VM", lines: ["UP line", "Down line"] },
      ],
      station_blocks: [
        {
          block: "MS-YD",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "MKK-YD",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "MBM-YD",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "STM-YD",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "PV-YD",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        {
          block: "TBM-YD",
          lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
        },
        { block: "VDR-YD", lines: ["UP line", "Down line"] },
        { block: "PRGL-VDR", lines: ["UP line", "Down line"] },
        { block: "GI-YD", lines: ["UP line", "Down line"] },
        { block: "CTM-YD", lines: ["UP line", "Down line"] },
        { block: "SKL-YD", lines: ["UP line", "Down line"] },
        { block: "CGL-YD", lines: ["UP line", "Down line"] },
        { block: "OV-YD", lines: ["UP line", "Down line"] },
        { block: "KGZ-YD", lines: ["UP line", "Down line"] },
        { block: "MMK-YD", lines: ["UP line", "Down line"] },
        { block: "MLMR-YD", lines: ["UP line", "Down line"] },
        { block: "TZD-YD", lines: ["UP line", "Down line"] },
        { block: "OLA-YD", lines: ["UP line", "Down line"] },
        { block: "TMV-YD", lines: ["UP line", "Down line"] },
        { block: "MTL-YD", lines: ["UP line", "Down line"] },
        { block: "PEI-YD", lines: ["UP line", "Down line"] },
        { block: "VVN-YD", lines: ["UP line", "Down line"] },
        { block: "MYP-YD", lines: ["UP line", "Down line"] },
        { block: "VM-YD", lines: ["UP line", "Down line"] },
      ],
      lines: [
        "UP line",
        "Down line",
        "A line",
        "B line",
        "Down Sub urban",
        "Up sub urban",
      ],
    },
    {
      name: "AJJ-KPD",
      section_blocks: [
        { block: "AJJ-MLPM", lines: ["UP line", "Down line"] },
        { block: "MLPM-CTRE", lines: ["UP line", "Down line"] },
        { block: "CTRE-MDVE", lines: ["UP line", "Down line"] },
        { block: "MDVE-SHU", lines: ["UP line", "Down line"] },
        { block: "SHU-TUG", lines: ["UP line", "Down line"] },
        { block: "TUG-WJR", lines: ["UP line", "Down line"] },
        { block: "WJR-MCN", lines: ["UP line", "Down line"] },
        { block: "MCN-THL", lines: ["UP line", "Down line"] },
        { block: "THL-SVUR", lines: ["UP line", "Down line"] },
        { block: "SVUR-KPD", lines: ["UP line", "Down line"] },
        { block: "KPD-RAM", lines: ["UP line", "Down line"] },
        { block: "KPD-VLR", lines: ["UP line", "Down line"] },
      ],
      station_blocks: [
        { block: "AJJ-YD", lines: ["UP line", "Down line"] },
        { block: "MLPM-YD", lines: ["UP line", "Down line"] },
        { block: "CTRE-YD", lines: ["UP line", "Down line"] },
        { block: "MDVE-YD", lines: ["UP line", "Down line"] },
        { block: "SHU-YD", lines: ["UP line", "Down line"] },
        { block: "TUG-YD", lines: ["UP line", "Down line"] },
        { block: "WJR-YD", lines: ["UP line", "Down line"] },
        { block: "MCN-YD", lines: ["UP line", "Down line"] },
        { block: "THL-YD", lines: ["UP line", "Down line"] },
        { block: "SVUR-YD", lines: ["UP line", "Down line"] },
        { block: "KPD-YD", lines: ["UP line", "Down line"] },
      ],
      lines: ["UP line", "Down line"],
    },
    {
      name: "KPD-JTJ",
      section_blocks: [
        { block: "KPD-LTI", lines: ["UP line", "Down line"] },
        { block: "LTI-KVN", lines: ["UP line", "Down line"] },
        { block: "KVN-GYM", lines: ["UP line", "Down line"] },
        { block: "GYM-VLT", lines: ["UP line", "Down line"] },
        { block: "VLT-MPI", lines: ["UP line", "Down line"] },
        { block: "MPI-PCKM", lines: ["UP line", "Down line"] },
        { block: "PCKM-AB", lines: ["UP line", "Down line"] },
        { block: "AB-VGM", lines: ["UP line", "Down line"] },
        { block: "VGM-VN", lines: ["UP line", "Down line"] },
        { block: "VN-KDY", lines: ["UP line", "Down line"] },
        { block: "KDY-JTJ", lines: ["UP line", "Down line"] },
        { block: "JTJ-SKPT", lines: ["UP line", "Down line"] },
        { block: "JTJ-TPT", lines: ["UP line", "Down line"] },
        { block: "JTJ AUX-TPT", lines: ["UP line", "Down line"] },
      ],
      station_blocks: [
        { block: "KPD-YD", lines: ["UP line", "Down line"] },
        { block: "LTI-YD", lines: ["UP line", "Down line"] },
        { block: "KVN-YD", lines: ["UP line", "Down line"] },
        { block: "GYM-YD", lines: ["UP line", "Down line"] },
        { block: "VLT-YD", lines: ["UP line", "Down line"] },
        { block: "MPI-YD", lines: ["UP line", "Down line"] },
        { block: "PCKM-YD", lines: ["UP line", "Down line"] },
        { block: "AB-YD", lines: ["UP line", "Down line"] },
        { block: "VGM-YD", lines: ["UP line", "Down line"] },
        { block: "VN-YD", lines: ["UP line", "Down line"] },
        { block: "KDY-YD", lines: ["UP line", "Down line"] },
        { block: "JTJ-YD", lines: ["UP line", "Down line"] },
      ],
      lines: ["UP line", "Down line"],
    },
    {
      name: "AJJ-CGL",
      section_blocks: [
        { block: "CGL-RDY", lines: ["SINGLE LINE"] },
        { block: "CGL-PALR", lines: ["SINGLE LINE"] },
        { block: "RDY-VB", lines: ["SINGLE LINE"] },
        { block: "VB-PALR", lines: ["SINGLE LINE"] },
        { block: "PALR-PYV", lines: ["SINGLE LINE"] },
        { block: "PALR-WJ", lines: ["SINGLE LINE"] },
        { block: "PYV-WJ", lines: ["SINGLE LINE"] },
        { block: "WJ-NTT", lines: ["SINGLE LINE"] },
        { block: "WJ-CJ", lines: ["SINGLE LINE"] },
        { block: "NTT-CJ(O)", lines: ["SINGLE LINE"] },
        { block: "CJ(O)-CJ(E)", lines: ["SINGLE LINE"] },
        { block: "CJ(E)-TMLP", lines: ["SINGLE LINE"] },
        { block: "TMLP-TKO", lines: ["SINGLE LINE"] },
        { block: "TMLP-MLPM", lines: ["SINGLE LINE"] },
        { block: "TKO-MLPM", lines: ["SINGLE LINE"] },
        { block: "MLPM-AJJ", lines: ["SINGLE LINE"] },
      ],
      station_blocks: [
        { block: "CGL-YD", lines: ["SINGLE LINE"] },
        { block: "PALR-YD", lines: ["SINGLE LINE"] },
        { block: "WJ-YD", lines: ["SINGLE LINE"] },
        { block: "CJ(O)-YD", lines: ["SINGLE LINE"] },
        { block: "CJ(E)-YD", lines: ["SINGLE LINE"] },
        { block: "TMLP-YD", lines: ["SINGLE LINE"] },
        { block: "MLPM-YD", lines: ["SINGLE LINE"] },
        { block: "AJJ-YD", lines: ["SINGLE LINE"] },
      ],
      lines: ["UP line", "Down line"],
    },
    {
      name: "MAS-GDR",
      section_blocks: [
        {
          block: "MASS-BBQ",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "MAS-BBQ",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "MMC-BBQ",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "BBQ-KOK",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "VPY-KOK",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "WST-KOK",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "KOK-TNP",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "TNP-TVT",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "TVT-ENR",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "ENR-AIPP",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "AIPP-AIP",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        { block: "AIP-MJR", lines: ["UP line", "Down line"] },
        { block: "MJR-PON", lines: ["UP line", "Down line"] },
        { block: "PON-KVP", lines: ["UP line", "Down line"] },
        { block: "KVP-GPD", lines: ["UP line", "Down line"] },
        { block: "GPD-ELR", lines: ["UP line", "Down line"] },
        { block: "ELR-AKM", lines: ["UP line", "Down line"] },
        { block: "AKM-TAD", lines: ["UP line", "Down line"] },
        { block: "TAD-SPE", lines: ["UP line", "Down line"] },
        { block: "TAD-AKAT", lines: ["UP line", "Down line"] },
        { block: "AKAT-SPE", lines: ["UP line", "Down line"] },
        { block: "SPE-PEL", lines: ["UP line", "Down line"] },
        { block: "PEL-DVR", lines: ["UP line", "Down line"] },
        { block: "DVR-NYP", lines: ["UP line", "Down line"] },
        { block: "NYP-PYA", lines: ["UP line", "Down line"] },
        { block: "PYA-ODR", lines: ["UP line", "Down line"] },
        { block: "ODR-GDR", lines: ["UP line", "Down line"] },
      ],
      station_blocks: [
        {
          block: "MMC-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "MAS-YD",
          lines: ["UP NE", "Down NE"],
        },
        {
          block: "BBQ-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "KOK-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "TNP-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "TVT-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "ENR-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "AIP-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        {
          block: "AIPP-YD",
          lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
        },
        { block: "MJR-YD", lines: ["UP line", "Down line"] },
        { block: "PON-YD", lines: ["UP line", "Down line"] },
        { block: "KVP-YD", lines: ["UP line", "Down line"] },
        { block: "GPD-YD", lines: ["UP line", "Down line"] },
        { block: "ELR-YD", lines: ["UP line", "Down line"] },
        { block: "AKM-YD", lines: ["UP line", "Down line"] },
        { block: "TAD-YD", lines: ["UP line", "Down line"] },
        { block: "SPE-YD", lines: ["UP line", "Down line"] },
        { block: "PEL-YD", lines: ["UP line", "Down line"] },
        { block: "DVR-YD", lines: ["UP line", "Down line"] },
        { block: "NYP-YD", lines: ["UP line", "Down line"] },
        { block: "PYA-YD", lines: ["UP line", "Down line"] },
        { block: "ODR-YD", lines: ["UP line", "Down line"] },
        { block: "GDR-YD", lines: ["UP line", "Down line"] },
      ],
      lines: [
        "UP line",
        "Down line",
        "UP slow",
        "Down Slow",
        "UP fast",
        "Down Fast",
        "UP NE",
        "Down NE",
      ],
    },
    {
      name: "MSB-VLCY",
      section_blocks: [
        {
          block: "MSB-MCPK",
          lines: ["UP line", "Down line"],
        },
        {
          block: "MCPK-MTMY",
          lines: ["UP line", "Down line"],
        },
        {
          block: "MTMY-VLCY",
          lines: ["UP line", "Down line"],
        },
      ],
      station_blocks: [],
      lines: ["UP line", "Down line"],
    },
  ],
};

export let sectionData = {
  "AJJ-RU": {
    section: [
      "AJJ-AJJN",
      "MLPM-AJJN",
      "AJJN-TRT",
      "TRT-POI",
      "POI-VKZ",
      "POI-NG",
      "VKZ-NG",
      "NG-EKM",
      "NG-VGA",
      "EKM-VGA",
      "VGA-PUT",
      "PUT-TDK",
      "TDK-PUDI",
      "PUDI-RU",
    ],
    station: [
      "AJJ-YD",
      "MLPM-YD",
      "AJJN-YD",
      "TRT-YD",
      "POI-YD",
      "NG-YD",
      "VAG-YD",
      "PUT-YD",
      "TDK-YD",
      "PUDI-YD",
      "RU-YD",
    ],
  },
  "MAS-AJJ": {
    station: [
      "MAS-BBQ",
      "MASS-BBQ",
      "MMCC-BBQ",
      "BBQ-VPY",
      "VPY-VLK",
      "VLK-ABU",
      "ABU-AVD",
      "AVD-PAB",
      "PAB-PTMS",
      "PTMS-TI",
      "PAB-TI",
      "TI-TRL",
      "TRL-KBT",
      "KBT-TO",
      "TO-AJJ",
    ],
    section: [
      "MAS-YD",
      "BBQ-YD",
      "MMCC-YD",
      "MASS-YD",
      "VPY-YD",
      "VLK-YD",
      "ABU-YD",
      "AVD-YD",
      "PAB-YD",
      "PTMS-YD",
      "TI-YD",
      "TRL-YD",
      "KBT-YD",
      "TO-YD",
      "AJJ-YD",
    ],
  },
  "MSB-VM": {
    section: [
      "MSB-MS",
      "MS-MKK",
      "MKK-MBM",
      "MBM-STM",
      "STM-PV",
      "PV-TBM",
      "TBM-PRGL",
      "TBM-VDR",
      "PRGL-VDR",
      "VDR-UPM",
      "VDR-GI",
      "UPM-GI",
      "POTI-CTM",
      "GI-CTM",
      "CTM-MMNK",
      "CTM-SKL",
      "MMNK-SKL",
      "SKL-PWU",
      "SKL-CGL",
      "PWU-CGL",
      "CGL-OV",
      "OV-PTM",
      "OV-KGZ",
      "PTM-KGZ",
      "KGZ-MMK",
      "MMK-MLMR",
      "MLMR-ACK",
      "MLMR-TZD",
      "ACK-TZD",
      "TZD-OLA",
      "OLA-TMV",
      "TMV-MTL",
      "MTL-PEI",
      "PEI-VVN",
      "VVN-MYP",
      "MYP-VM",
    ],
    station: [
      "MS-YD",
      "MKK-YD",
      "MBM-YD",
      "STM-YD",
      "PV-YD",
      "TBM-YD",
      "VDR-YD",
      "GI-YD",
      "CTM-YD",
      "SKL-YD",
      "CGL-YD",
      "OV-YD",
      "KGZ-YD",
      "MMK-YD",
      "MLMR-YD",
      "TZD-YD",
      "OLA-YD",
      "TMV-YD",
      "MTL-YD",
      "PEI-YD",
      "VVN-YD",
      "MYP-YD",
      "VM-YD",
    ],
  },
  "AJJ-KPD": {
    section: [
      "AJJ-MLPM",
      "MLPM-CTRE",
      "CTRE-MDVE",
      "MDVE-SHU",
      "SHU-TUG",
      "TUG-WJR",
      "WJR-MCN",
      "MCN-THL",
      "THL-SVUR",
      "SVUR-KPD",
      "KPD-RAM",
      "KPD-VLR",
    ],
    station: [
      "AJJ-YD",
      "MLPM-YD",
      "CTRE-YD",
      "MDVE-YD",
      "SHU-YD",
      "TUG-YD",
      "WJR-YD",
      "MCN-YD",
      "THL-YD",
      "SVUR-YD",
      "KPD-YD",
    ],
  },
  "KPD-JTJ": {
    section: [
      "KPD-LTI",
      "LTI-KVN",
      "KVN-GYM",
      "GYM-VLT",
      "VLT-MPI",
      "MPI-PCKM",
      "PCKM-AB",
      "AB-VGM",
      "VGM-VN",
      "VN-KDY",
      "KDY-JTJ",
      "JTJ-SKPT",
      "JTJ-TPT",
      "JTJ AUX-TPT",
    ],
    station: [
      "AJJ-YD",
      "MLPM-YD",
      "CTRE-YD",
      "MDVE-YD",
      "SHU-YD",
      "TUG-YD",
      "WJR-YD",
      "MCN-YD",
      "THL-YD",
      "SVUR-YD",
      "KPD-YD",
      "LTI-YD",
      "KVN-YD",
      "GYM-YD",
      "VLT-YD",
      "MPI-YD",
      "PCKM-YD",
      "AB-YD",
      "VGM-YD",
      "VN-YD",
      "KDY-YD",
      "JTJ-YD",
    ],
  },
  "AJJ-CGL": {
    section: [
      "CGL-RDY",
      "RDY-VB",
      "CGL-PALR",
      "VB-PALR",
      "PALR-PYV",
      "PALR-WJ",
      "PYV-WJ",
      "WJ-NTT",
      "WJ-CJ",
      "NTT-CJ(O)",
      "CJ(O)-CJ(E)",
      "CJ(E)-TMLP",
      "TMLP-TKO",
      "TMLP-MLPM",
      "TKO-MLPM",
      "MLPM-AJJ",
    ],
    station: [
      "CGL-YD",
      "PALR-YD",
      "WJ-YD",
      "CJ(O)-YD",
      "CJ(E)-YD",
      "TMLP-YD",
      "MLPM-YD",
      "AJJ-YD",
    ],
  },
  "MAS-GDR": {
    section: [
      "MASS-BBQ",
      "MAS-BBQ",
      "MMC-BBQ",
      "VPY-KOK",
      "BBQ-KOK",
      "VPY-KOK",
      "WST-KOK",
      "KOK-TNP",
      "TNP-TVT",
      "TVT-ENR",
      "ENR-AIPP",
      "AIPP-AIP",
      "AIP-MJR",
      "MJR-PON",
      "PON-KVP",
      "KVP-GPD",
      "GPD-ELR",
      "ELR-AKM",
      "AKM-TAD",
      "TAD-AKAT",
      "TAD-SPE",
      "AKAT-SPE",
      "SPE-PEL",
      "PEL-DVR",
      "DVR-NYP",
      "NYP-PYA",
      "PYA-ODR",
      "ODR-GDR",
    ],
    station: [
      "MMC-YD",
      "MAS-YD",
      "BBQ-YD",
      "KOK-YD",
      "TNP-YD",
      "TVT-YD",
      "ENR-YD",
      "AIP-YD",
      "AIPP-YD",
      "MJR-YD",
      "PON-YD",
      "KVP-YD",
      "GPD-YD",
      "ELR-YD",
      "AKM-YD",
      "TAD-YD",
      "SPE-YD",
      "PEL-YD",
      "DVR-YD",
      "NYP-YD",
      "PYA-YD",
      "ODR-YD",
      "GDR-YD",
    ],
  },
  "MSB-VLCY": {
    section: ["MSB-MCPK", "MCPK-MTMY", "MTMY-VLCY"],
    station: [],
  },
};

export const departmentDepot = {
    "TRD": [
        "BBQ",
        "TVT",
        "PON",
        "SPE",
        "GDR",
        "AVD",
        "TRL",
        "AJJ",
        "WJR",
        "KPD",
        "AB",
        "JTJ",
        "PUT",
        "CGL",
        "MS",
        "TBM",
        "ACK",
        "VM",
        "MSB"
    ],
    "S&T": [
        "MAS",
        "BBQ",
        "TVT",
        "GPD",
        "SPE",
        "NYP",
        "TRL",
        "AJJE",
        "MSB",
        "AJJW",
        "KPDE",
        "KPDW",
        "AB",
        "JTJ",
        "TRT",
        "PUT",
        "CGL",
        "MS",
        "TBM",
        "TMV"
    ],
    "ENGG": [
        "TVT",
        "PON",
        "SPE",
        "GDR",
        "BRIDGE",
        "WSTA",
        "WSTB",
        "AVD",
        "TRLA",
        "TRLB",
        "AJJ",
        "WJR",
        "KPD",
        "AB",
        "JTJ",
        "TRT",
        "PUT",
        "CJ",
        "MS",
        "TBM",
        "CGL",
        "ACK",
        "TMV",
        "MSB"
    ]
}