type Department = 'TRD' | 'S&T' | 'ENGG'; // add more if needed

type DepotStructure = {
  [section: string]: {
    [department in Department]: string[];
  };
};

// export let MajorSection = {
//  " MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
// "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
// "SA":["JTJ-ED","ED-PTJ","ED-TPJ","KKR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"]
// };

export let MajorSection = {
  "MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
  "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
  "SA": ["JTJ-ED","ED-PTJ","ED-TP","KRR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"],
  "MDU": ["TPJ-DG","DG-MDU","DG-PLNI-POY","MDU-VPT","VPT-MEJ","MEJ-TN","MEJ-TEN","MDU-MNM","TPJ-KKDI-MNM","MNM-RMM","MNM-VPT","VPT-SCT","TEN-SCT","SCT-PUU","PUU-QLN","TEN-TCN","MDU-BDNK"]
  //"MDU" :["TPJ-DG","DG-MDU","DG-PLNI-POY","MDU-VPT","VPT-MEJ","MEJ-TN","MEJ-TEN","MDU-MNM","TPJ-KKDI-MNM","MNM-RMM","MNM-VPT","VPT-SCT","TEN-SCT","SCT-PUU","PUU-QLN","TEN-TCN","MDU-BDNK"]
};

export let blockSection = {
  'TPJ-DG': [
    "TPG-PUG", "PUG-KLS", "KLS-MPA", "MPA-VPJ",
    "VPJ-KFC", "KFC-AYR", "AYR-VDM", "VDM-TMP", "TMP-DG",

    "PUG-YD", "KLS-YD", "MPA-YD", "VPJ-YD",
    "KFC-YD", "VDM-YD", "TMP-YD", "DG-YD"
  ],
'DG-MDU': [
    "DG-ABI", "ABI-KQN", "KQN-VDP", "VDP-SDN",
    "SDN-SER", "SER-KON", "KON-MDU",

    "ABI-YD", "KQN-YD", "VDP-YD", "SDN-YD",
    "SER-YD", "KON-YD", "MDU-YD"
  ],
  'DG-PLNI-POY': [
    "DG-API", "API-ODC", "ODC-CHPT", "CHPT-PLNI",
    "PLNI-PPTR", "PPTR-MVRD", "MVRD-UDT", "UDT-GMGM", "GMGM-POY",

    "API-YD", "ODC-YD", "CHPT-YD", "PLNI Jn-YD", "PPTR-YD",
    "MVRD-YD", "UDT-YD", "GMGM-YD", "POY-YD"
  ],
'MDU-VPT': [
    "MDU-TDN", "TDN-TMQ", "TMQ-KGD", "KGD-VPT",

    "MDU Jn-YD", "TDN-YD", "TMQ-YD", "KGD-YD", "VPT-YD"
  ],
  'VPT-MEJ': [
    "VPT-TY", "TY-SRT", "SRT-NLL", "NLL-CVP", "CVP-KDU", "KDU-MEJ",

    "VPT Jn-YD", "TY-YD", "SRT-YD", "NLL-YD", "CVP-YD", "KDU-YD", "MEJ-YD"
  ],
 'MEJ-TN': [
    "MEJ-TIP", "TIP-MVN", "MVN-TN", "TN-MVTS/MVNP", "TN-MVN/MVTS", "MVN-MMDR",

    "MEJ Jn-YD", "TIP-YD", "MVN Jn-YD", "TN-YD", "TNHP-YD", "MMDR-YD"
  ],
  'MEJ-TEN': [
    "MEJ-GDN", "GDN-TAY", "TAY-TEN",

    "GDN-YD", "TAY-YD", "TEN Jn-YD"
  ],
  'MDU-MNM': [
    "MDU-ILA", "ILA-TVN", "TVN-TPC", "TPC-MNM",

    "ILA-YD", "TVN-YD", "TPC-YD"
  ],
'TPJ-KKDI-MNM': [
    "TPJ-KRMG", "KRMG-KRUR", "KRUR-VEL", "VEL-PDKT", "PDKT-TYM",
    "TYM-CTND", "CTND-KKDI", "KKDI-KAL", "KAL-PNGI", "PNGI-SVGA",
    "SVGA-MEKM", "MEKM-MNM",

    "KRMG-YD", "KRUR-YD", "VEL-YD", "PDKT-YD", "TYM-YD",
    "CTND-YD", "KKDI Jn-YD", "KAL-YD", "PNGI-YD", "SVGA-YD",
    "MEKM-YD"
  ],
  'MNM-RMM': [
    "MNM-SUX", "SUX-PMK", "PMK-SQD", "SQD-RMD", "RMD-UCP",
    "UCP-MMM", "MMM-PBMB", "PBMB-RMM",

    "MNM Jn-YD", "SUX-YD", "PMK-YD", "SQD-YD", "RMD-YD",
    "UCP-YD", "MMM-YD", "PBMB-YD", "RMM-YD"
  ],
  'MNM-VPT': [
    "MNM-NKK", "NKK-TCH", "TCH-APK", "APK-VPT",

    "NKK-YD", "TCH-YD", "APK-YD"
  ],
'VPT-SCT': [
    "VPT-SVKS", "SVKS-SVPR", "SVPR-RJPM", "RJPM-SNKL",
    "SNKL-PBKS", "PBKS-KDNL", "KDNL-TSI", "TSI-SCT",

    "SVKS-YD", "SVPR-YD", "RJPM-YD", "SNKL-YD", "PBKS-YD",
    "KDNL-YD", "TSI Jn-YD", "SCT-YD"
  ],
  'TEN-SCT': [
    "TEN-SMD", "SMD-ASD", "ASD-KKY", "KKY-PCM", "PCM-TSI", "TSI-SCT",

    "SMD-YD", "ASD-YD", "KKY-YD", "PCM-YD"
  ],
  'SCT-PUU': [
    "SCT-BJM", "BJM-AYVN", "AYVN-TML", "TML-EDN", "EDN-PUU",

    "BJM-YD", "AYVN-YD", "TML-YD", "EDN-YD", "PUU-YD"
  ],
 'PUU-QLN': [
    "PUU-AVS", "AVS-KKZ", "KKZ-KUV", "KUV-KLQ", "KLQ-QLN",
    
    "AVS-YD", "KKZ-YD", "KUV-YD", "KLQ-YD", "QLN-YD"
  ],
  'TEN-TCN': [
    "TEN-SDNR", "SDNR-SVV", "SVV-NZT", "NZT-ANY", "ANY-TCN",
    
    "SDNR-YD", "SVV-YD", "NZT-YD", "ANY-YD", "TCN-YD"
  ],
  'MDU-BDNK': [
    "MDU-USLP", "USLP-ADPT", "ADPT-TE", "TE-BDNK",
    
    "USLP-YD", "ADPT-YD", "TE-YD", "BDNK-YD"
  ]
};



export let workType = {
  "S&T": [
    "Maintenance", "Directed Maintenance", "Special Works",  "Replacement/Renewals", "Others(Custom)",
  ],
  'ENGG': ['Machine', 'Non-Machine'],
  'TRD': ['Tw', 'Lt'],
};









export let Activity = {
   "Maintenance": [
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
    "TLBI-FM Inst",
    "UFSBI",
    "Fuse",
    "EKT",
  ],
  "Directed Maintenance": [
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
    "TLBI-FM Inst",
    "UFSBI",
    "Fuse",
    "EKT",
  ],
  "Special Works": [
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
    "TLBI-FM Inst",
    "UFSBI",
    "Fuse",
    "EKT",
  ],
  "Replacement/Renewals": [
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
    "TLBI-FM Inst",
    "UFSBI",
    "Fuse",
    "EKT",
  ],
  "Others(Custom)": [
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
    "TLBI-FM Inst",
    "UFSBI",
    "Fuse",
    "EKT",
  ],
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
  "PUG-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KLS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MPA-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "VPJ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KFC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "VDM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "TMP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "DG-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9"],
    "both direction not affected": []
  },  "ABI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KQN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "VDP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "SDN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "SER-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KON-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": [
      "Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9", "Rd 10", "Rd 11"
    ],
    "both direction not affected": []
  },
  "API-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "ODC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "CHPT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "PLNI Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "PPTR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MVRD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "UDT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "GMGM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MDU Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": [
      "Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9", "Rd 10"
    ],
    "both direction not affected": []
  },
  "TDN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "TMQ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "KGD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "VPT Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": [
      "Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"
    ],
    "both direction not affected": []
  },
  "TY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "SRT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "NLL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "CVP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KDU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MEJ Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "TIP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "MVN Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": [
      "Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8"
    ],
    "both direction not affected": []
  },
  "TN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "MMDR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "GDN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "TAY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "TEN Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": [
      "Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9"
    ],
    "both direction not affected": []
  },

 "ILA-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "TVN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "TPC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "KRMG-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "KRUR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "VEL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "PDKT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "TYM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "CTND-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KKDI Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": []
  },
  "KAL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "PNGI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "SVGA-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MEKM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MNM Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": []
  },
  "SUX-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "PMK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "SQD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "RMD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "UCP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "MMM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "PBMB-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "RMM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": [
      "Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9", "Rd 10"
    ],
    "both direction not affected": []
  },
  "NKK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "TCH-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "APK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
"SVKS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "SVPR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "RJPM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "SNKL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "PBKS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "KDNL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "TSI Jn-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "SCT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": []
  },
  "SMD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "ASD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "KKY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "PCM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "BJM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "AYVN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "TML-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "EDN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "PUU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "AVS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "KKZ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "KUV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "KLQ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "SDNR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "SVV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "NZT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "ANY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "TCN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "USLP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "ADPT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "TE-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "BDNK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
};


export let lineData = {
  // TPG-MDU Section
  "TPG-PUG": ["UP", "DN"],
  "PUG-KLS": ["UP", "DN"],
  "KLS-MPA": ["UP", "DN"],
  "MPA-VPJ": ["UP", "DN"],
  "VPJ-KFC": ["UP", "DN"],
  "KFC-AYR": ["UP", "DN"],
  "AYR-VDM": ["UP", "DN"],
  "VDM-TMP": ["UP", "DN"],
  "TMP-DG": ["UP", "DN"],
  "DG-ABI": ["UP", "DN"],
  "ABI-KQN": ["UP", "DN"],
  "KQN-VDP": ["UP", "DN"],
  "VDP-SDN": ["UP", "DN"],
  "SDN-SER": ["UP", "DN"],
  "SER-KON": ["UP", "DN"],
  "KON-MDU": ["UP", "DN"],

  // DG-POY Section (Single Line)
  "DG-API": ["Single"],
  "API-ODC": ["Single"],
  "ODC-CHPT": ["Single"],
  "CHPT-PLNI": ["Single"],
  "PLNI-PPTR": ["Single"],
  "PPTR-MVRD": ["Single"],
  "MVRD-UDT": ["Single"],
  "UDT-GMGM": ["Single"],
  "GMGM-POY": ["Single"],

  // MDU-VPT Section (Up and Down)
  "MDU-TDN": ["UP", "DN"],
  "TDN-TMQ": ["UP", "DN"],
  "TMQ-KGD": ["UP", "DN"],
  "KGD-VPT": ["UP", "DN"],

  // VPT-KDU Section (Up and Down)
  "VPT-TY": ["UP", "DN"],
  "TY-SRT": ["UP", "DN"],
  "SRT-NLL": ["UP", "DN"],
  "NLL-CVP": ["UP", "DN"],
  "CVP-KDU": ["UP", "DN"],
  "KDU-MEJ": ["UP", "DN"],

  // MEJ-TN Section (Up and Down + One Single Line)
  "MEJ-TIP": ["UP", "DN"],
  "TIP-MVN": ["UP", "DN"],
  "MVN-TN": ["UP", "DN"],
  "MVN-MVTS/MVNP": ["UP", "DN"],
  "TN-MVN/MVTS": ["UP", "DN"],
  "MVN-MMDR": ["Single"],

  // MEJ-TEN Section (Up and Down)
  "MEJ-GDN": ["UP", "DN"],
  "GDN-TAY": ["UP", "DN"],
  "TAY-TEN": ["UP", "DN"],
// MDU-MNM Section (Single Line)
  "MDU-ILA": ["Single"],
  "ILA-TVN": ["Single"],
  "TVN-TPC": ["Single"],
  "TPC-MNM": ["Single"],

  // TPJ-KKDI Section (Single Line)
  "TPJ-KRMG": ["Single"],
  "KRMG-KRUR": ["Single"],
  "KRUR-VEL": ["Single"],
  "VEL-PDKT": ["Single"],
  "PDKT-TYM": ["Single"],
  "TYM-CTND": ["Single"],
  "CTND-KKDI": ["Single"],
  "KKDI-KAL": ["Single"],
  "KAL-PNGI": ["Single"],
  "PNGI-SVGA": ["Single"],
  "SVGA-MEKM": ["Single"],
  "MEKM-MNM": ["Single"],

  // MNM-RMM Section (Single Line)
  "MNM-SUX": ["Single"],
  "SUX-PMK": ["Single"],
  "PMK-SQD": ["Single"],
  "SQD-RMD": ["Single"],
  "RMD-UCP": ["Single"],
  "UCP-MMM": ["Single"],
  "MMM-PBMB": ["Single"],
  "PBMB-RMM": ["Single"],

  // MNM-VPT Section (Single Line)
  "MNM-NKK": ["Single"],
  "NKK-TCH": ["Single"],
  "TCH-APK": ["Single"],
  "APK-VPT": ["Single"],

 // VPT-SCT Section (Single Line)
  "VPT-SVKS": ["Single"],
  "SVKS-SVPR": ["Single"],
  "SVPR-RJPM": ["Single"],
  "RJPM-SNKL": ["Single"],
  "SNKL-PBKS": ["Single"],
  "PBKS-KDNL": ["Single"],
  "KDNL-TSI": ["Single"],

  // TEN-SCT Section (Single Line)
  "TEN-SMD": ["Single"],
  "SMD-ASD": ["Single"],
  "ASD-KKY": ["Single"],
  "KKY-PCM": ["Single"],
  "PCM-TSI": ["Single"],
  "TSI-SCT": ["Single"],

  // SCT-PUU Section (Single Line)
  "SCT-BJM": ["Single"],
  "BJM-AYVN": ["Single"],
  "AYVN-TML": ["Single"],
  "TML-EDN": ["Single"],
  "EDN-PUU": ["Single"],

 // PUU-QLN Section
  "PUU-AVS": ["Single"],
  "AVS-KKZ": ["Single"],
  "KKZ-KUV": ["Single"],
  "KUV-KLQ": ["Single"],
  "KLQ-QLN": ["Single"],

  // TEN-TCN Section
  "TEN-SDNR": ["Single"],
  "SDNR-SVV": ["Single"],
  "SVV-NZT": ["Single"],
  "NZT-ANY": ["Single"],
  "ANY-TCN": ["Single"],

  // MDU-BDNK Section
  "MDU-USLP": ["Single"],
  "USLP-ADPT": ["Single"],
  "ADPT-TE": ["Single"],
  "TE-BDNK": ["Single"],

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


export const location = {
  "MAS": "MADRAS",
  "AJJ": "AINSDFD",
  "AJJN": "DFSDFAJJN",
  "AJP": "DSFSD",
}

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



export const depot: DepotStructure = {
    "TPJ-DG": {
      "TRD": ["MPA", "DG"],      // combined from Depot/TRD column (include only non-empty)
      "S&T": ["DG"],             // Depot/S&T column - DG only
      "ENGG": ["MPA"]            // Depot/Engg column - MPA only
    },
   "DG-MDU": {
      "TRD": ["DG", "MDU"],
      "S&T": ["North-MDU"],
      "ENGG": ["DG", "MG-MDU", "BG-MDU"]
    },
  
    "DG-PLNI-POY": {
      "TRD": ["PLNI", "UDT"],
      "S&T": ["PLNI"],
      "ENGG": ["DG", "PLNI"]
    },
  
    "MDU-VPT": {
      "TRD": ["VPT"],
      "S&T": ["South-MDU"],
      "ENGG": ["VPT", "BG-MDU"]
    },
  
    "VPT-MEJ": {
      "TRD": ["CVP"],
      "S&T": ["VPT"],
      "ENGG": ["TN", "VPT"]
    },
   "MEJ-TN": {
      "TRD": ["TN"],
      "S&T": ["TEN","TN"],
      "ENGG": ["TN", "TEN"]
    },
  
    "MEJ-TEN": {
      "TRD": ["TEN"],
      "S&T": ["TEN"],
      "ENGG": ["TEN"]
    },
  
    "MDU-MNM": {
      "TRD": ["MDU", "MNM"],
      "S&T": ["North-MDU"],
      "ENGG": ["MG-MDU", "MNM"]
    },
  
    "TPJ-KKDI-MNM": {
      "TRD": ["KKDI", "PDKT", "MNM"],
      "S&T": ["KKDI", "MNM"],
      "ENGG": ["PDKT", "SVGA"]
    },
   "MNM-RMM": {
      "TRD": ["MNM", "RMD"],
      "S&T": ["MNM", "RMD"],
      "ENGG": ["SVGA", "MMM", "MNM"]
    },
  
    "MNM-VPT": {
      "TRD": ["MNM", "VPT"],
      "S&T": ["MNM", "VPT"],
      "ENGG": ["MNM"]
    },
  
    "VPT-SCT": {
      "TRD": ["RJPM", "VPT", "TSI", "SCT"],
      "S&T": ["VPT", "TSI", "SCT"],
      "ENGG": ["SVKS", "SCT"]
    },
  
    "TEN-SCT": {
      "TRD": ["ASD", "TEN", "SCT"],
      "S&T": ["TEN", "SCT", "TSI"],
      "ENGG": ["TEN", "SCT"]
    },
  
    "SCT-PUU": {
      "TRD": ["SCT", "TSI", "PUU"],
      "S&T": ["TSI", "PUU", "SCT"],
      "ENGG": ["SCT", "PUU"]
    },
  "PUU-QLN": {
      "TRD": ["PUU", "TSI"],
      "S&T": ["TSI"],
      "ENGG": ["PUU"]
    },
  
    "TEN-TCN": {
      "TRD": ["TEN", "NZT"],
      "S&T": ["TEN"],
      "ENGG": ["SVV"]
    },
  
    "MDU-BDNK": {
      "TRD": ["MDU", "TE"],
      "S&T": ["South-MDU"],
      "ENGG": ["ADPT"]
    }
  };

export const depotOnLocation = {
  "MDU": [
    "DG",
    "North-MDU",
    "MDU",
    "MG-MDU",
    "BG-MDU",
    "PLNI",
    "UDT",
    "South-MDU",
    "VPT",
    "CVP",
    "TN",
    "TEN",
    "MNM",
    "PDKT",
    "SVGA",
    "SVKS",
    "SCT",
    "TSI",
    "ASD",
    "PUU",
    "RMD",
    "MMM",
    "RJPM",
    "SVV",
    "NZT",
    "ADPT",
    "KKDI",
    "MPA"
  ]
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
