type Department = 'TRD' | 'S&T' | 'ENGG'; // add more if needed

type DepotStructure = {
  [section: string]: {
    [department in Department]: string[];
  };
};

export const BoardControllerDepotMap: { [key: string]: string[] } = {
  "A": ["MAS-GDR", "MAS-AJJ", "MSB-VM"],
  "B": ["TPJ-VM", "VM-MV", "TPJ-MV"],
  "C": ["JTJ-ED", "ED-PTJ", "ED-TPJ"],
  "D": ["KYJ-QLN", "QLN-TVC", "TVC-NCJ"]
};

export let MajorSection = {
  "MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
  "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
  "SA": ["JTJ-ED","ED-PTJ","ED-TPJ","KRR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"],
  "TVC": ["SRR-CHTS", "TCR-GUV", "ERS-KTYM-KYJ", "ERS-ALLP-KYJ", "KYJ-QLN", "QLN-TVC", "TVC-NCJ", "NCJ-TEN", "NCJ-CAPE"]
};
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
// }

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

// export let machine = [
//   "BCM",
//   "UNIMAT 4S",
//   "MFI",
//   "MPI",
//   "MDU",
//   "DUOMAT",
//   "CSM",
//   "DGS 353",
//   "SBCM",
//   "BRM R32",
//   "UTV",
//   "T 28",
//   "TRT",
//   "3X DTE",
// ];

// export let work = [
//   "RR / WW",
//   "WELDING",
//   "CMS XG RENEWAL",
//   "SEJ / RR",
//   "TRR / WW",
//   "MFBW",
//   "20R/P UNLOADING",
//   "JOINT INSPECTION",
//   "T/O",
//   "RR / WW",
//   "BRIDGE WORK",
//   "FOB",
//   "PF WORK",
// ];

// export let workData = {
//   ENGG: {
//     Machine_Blocks: [
//       "BCM ",
//       "DTE ",
//       "CSM ",
//       "DUOMAT",
//       "UNIMAT",
//       "MFI",
//       "MPT",
//       "MDU",
//       "BRM",
//       "FRM ",
//       "TRT ",
//       "UTV",
//       "DTS",
//       "T28",
//       "SQRS",
//       "RGM working",
//     ],
//     Non_Machine: [
//       "Rail renewal",
//       "Welding work",
//       "Destressing work",
//       "Switch renewal",
//       "CMS Crossing renewal",
//       "SEJ Renewal",
//       "Glued Joint renewal",
//       "Dummy Glued Joint removal",
//       "TRR P 60 Kg",
//       "TRR S 60 Kg",
//       "TRR S 60 kg",
//       "TRR S 52 kg",
//       "Interchanging",
//       "Trucking out/Shifting materials",
//       "TWR with MFBW",
//       "TBTR (Br sleeper renewal)",
//       "TSR P 60 Kg",
//       "TSR S 60 Kg",
//       "TSR S 52 Kg",
//       "TTSR work",
//       "Jt Insp Notes Attn",
//       "Stretcherbar renewal",
//       "TFR Work",
//       "Ballast Unloading",
//       "Rail unloading",
//       "Lifting and packing",
//       "Gauge tie plate renewal",
//       "Sleeper renewal",
//       "Fish Plates O&E",
//       "Preliminary/Post works",
//       "Trucking out materials",
//       "Cutting Widening work",
//       "JCB working",
//       "Earth work/Muck removal",
//       "Crane Moving/Working",
//       "Attention to Track",
//       "Attention to Fittings",
//       "Attention to Bridge",
//       "Attention to Guard rail",
//       "Attention to Points & Xing",
//       "Attention to LC",
//       "Attention to Curve check rail",
//       "Sheet Piling work",
//       "Platform work",
//       "Platform Shelter work",
//       "ABSS work",
//       "Erection of Platform shelter purlins work",
//       "Erection of FOB Girders",
//       "Other FOB works",
//       "Other Track works",
//       "Other Bridge work",
//     ],
//   },
//   SIG: {
//     Gear: [
//       "Point",
//       "EI",
//       "Signal",
//       "DC Track",
//       "AFTC",
//       "SSDAC",
//       "MSDAC",
//       "Panel",
//       "LC Gate Mechanical",
//       "LC Gate ELB",
//       "Emergency Sliding Boom",
//       "IPS",
//       "Conventional power supply equipment",
//       "System Integrity Test of each PI/EI/RRI stations",
//       "Cable Insulation testing (cable meggering) for one station.",
//       "DLBI- SGE",
//       "TLBI -FM Inst",
//       "UFSBI",
//       "Fuse",
//       "EKT",
//     ],
//   },
//   TRD: {
//     Tw_Working: [
//       "AOH",
//       "POH",
//       "IOH",
//       "RE POH",
//       "RD WORK",
//       "TURN OUT CHECKING",
//       "CROSS OVER CHECKING",
//       "CROSS TRACK FEEDERS CHECKING",
//       "GANTRY MAINTENANCE",
//       "CONTACT WIRE RENEWAL WORK",
//       "CATENARY WIRE RENEWAL WORK",
//       "CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)",
//       "MAST ERECTION(2x25KV WORK)",
//       "FEEDERS ERECTION(2x25KV WORK)",
//       "OHE PROFILING",
//       "OHE/CN WORK",
//       "OTHER SPECIAL WORKS",
//     ],
//     Lt_Working: [
//       "AOH",
//       "POH",
//       "IOH",
//       "RE POH",
//       "RD WORK",
//       "TURN OUT CHECKING",
//       "CROSS OVER CHECKING",
//       "CROSS TRACK FEEDERS CHECKING",
//       "GANTRY MAINTENANCE",
//       "CONTACT WIRE RENEWAL WORK",
//       "CATENARY WIRE RENEWAL WORK",
//       "CANTILEVER ERECTION/REPLACEMENT(2x25KV WORK)",
//       "MAST ERECTION(2x25KV WORK)",
//       "FEEDERS ERECTION(2x25KV WORK)",
//       "OHE PROFILING",
//       "OHE/CN WORK",
//       "OTHER SPECIAL WORKS",
//     ],
//   },
// };

// export let data = {
//   sections: [
//     {
//       name: "AJJ-RU",
//       section_blocks: [
//         { block: "AJJ-AJJN", lines: ["UP", "DN"] },
//         { block: "MLPM-AJJN", lines: ["UP", "DN"] },
//         { block: "AJJN-TRT", lines: ["UP", "DN"] },
//         { block: "TRT-POI", lines: ["UP", "DN"] },
//         { block: "POI-NG", lines: ["UP", "DN"] },
//         { block: "NG-VGA", lines: ["UP", "DN"] },
//         { block: "POI-VKZ", lines: ["UP", "DN"] },
//         { block: "VKZ-NG", lines: ["UP", "DN"] },
//         { block: "NG-EKM", lines: ["UP", "DN"] },
//         { block: "EKM-VGA", lines: ["UP", "DN"] },
//         { block: "VGA-PUT", lines: ["UP", "DN"] },
//         { block: "PUT-TDK", lines: ["UP", "DN"] },
//         { block: "TDK-PUDI", lines: ["UP", "DN"] },
//         { block: "PUDI-RU", lines: ["UP", "DN"] },
//       ],
//       station_blocks: [
//         { block: "AJJ-YD", lines: ["UP", "DN"] },
//         { block: "MLPM-YD", lines: ["UP", "DN"] },
//         { block: "AJJN-YD", lines: ["UP", "DN"] },
//         { block: "TRT-YD", lines: ["UP", "DN"] },
//         { block: "POI-YD", lines: ["UP", "DN"] },
//         { block: "NG-YD", lines: ["UP", "DN"] },
//         { block: "VGA-YD", lines: ["UP", "DN"] },
//         { block: "PUT-YD", lines: ["UP", "DN"] },
//         { block: "TDK-YD", lines: ["UP", "DN"] },
//         { block: "PUDI-YD", lines: ["UP", "DN"] },
//         { block: "RU-YD", lines: ["UP", "DN"] },
//       ],
//       lines: ["UP", "DN"],
//     },
//     {
//       name: "MAS-AJJ",
//       section_blocks: [
//         {
//           block: "MAS-BBQ",
//           lines: ["Up SW", "Down SW", "Up NE", "Down NE"],
//         },
//         {
//           block: "MASS-BBQ",
//           lines: ["Up SW Sub", "Down SW Sub"],
//         },
//         {
//           block: "MMCC-BBQ",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "BBQ-VPY",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "VPY-VLK",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "VLK-ABU",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "ABU-AVD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "AVD-PAB",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "PAB-PTMS",
//           lines: ["Up and Down Single"],
//         },
//         {
//           block: "PTMS-TI",
//           lines: ["Up and Down Single"],
//         },
//         {
//           block: "PAB-TI",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "TI-TRL",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "TRL-KBT",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "KBT-TO",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "TO-AJJ",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//       ],
//       station_blocks: [
//         {
//           block: "MAS-YD",
//           lines: ["Up SW", "Down SW", "Up NE", "Down NE"],
//         },
//         {
//           block: "BBQ-YD",
//           lines: ["Up SW", "Down SW", "Up SW Sub", "Down SW Sub"],
//         },
//         {
//           block: "MASS-YD",
//           lines: ["Up SW Sub", "Down SW Sub"],
//         },
//         {
//           block: "MMCC-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "VPY-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "VLK-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "ABU-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "AVD-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "PAB-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "PTMS-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "TI-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "TRL-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "KBT-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "TO-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//         {
//           block: "AJJ-YD",
//           lines: ["Up slow", "Down slow", "Up fast", "Down fast"],
//         },
//       ],
//       lines: [
//         "Up slow",
//         "Down slow",
//         "Up fast",
//         "Down fast",
//         "Up NE, Dowm NE, Up SW, Down SW",
//       ],
//     },
//     {
//       name: "MSB-VM",
//       section_blocks: [
//         {
//           block: "MSB-MS",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "MS-MKK",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "MKK-MBM",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "MBM-STM",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "STM-PV",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "PV-TBM",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         { block: "TBM-PRGL", lines: ["UP line", "Down line"] },
//         { block: "TBM-VDR", lines: ["UP line", "Down line", "3rd line"] },
//         { block: "PRGL-VDR", lines: ["UP line", "Down line"] },
//         { block: "VDR-UPM", lines: ["UP line", "Down line"] },
//         { block: "VDR-GI", lines: ["UP line", "Down line", "3rd line"] },
//         { block: "UPM-GI", lines: ["UP line", "Down line"] },
//         { block: "POTI-CTM", lines: ["UP line", "Down line"] },
//         { block: "CTM-MMNK", lines: ["UP line", "Down line"] },
//         { block: "MMNK-SKL", lines: ["UP line", "Down line"] },
//         { block: "SKL-PWU", lines: ["UP line", "Down line"] },
//         { block: "GI-CTM", lines: ["UP line", "Down line", "3rd line"] },
//         { block: "CTM-SKL", lines: ["UP line", "Down line", "3rd line"] },
//         { block: "SKL-CGL", lines: ["UP line", "Down line", "3rd line"] },
//         { block: "PWU-CGL", lines: ["UP line", "Down line"] },
//         { block: "CGL-OV", lines: ["UP line", "Down line"] },
//         { block: "OV-PTM", lines: ["UP line", "Down line"] },
//         { block: "PTM-KGZ", lines: ["UP line", "Down line"] },
//         { block: "OV-KGZ", lines: ["UP line", "Down line"] },
//         { block: "KGZ-MMK", lines: ["UP line", "Down line"] },
//         { block: "MMK-MLMR", lines: ["UP line", "Down line"] },
//         { block: "MLMR-ACK", lines: ["UP line", "Down line"] },
//         { block: "ACK-TZD", lines: ["UP line", "Down line"] },
//         { block: "MLMR-TZD", lines: ["UP line", "Down line"] },
//         { block: "TZD-OLA", lines: ["UP line", "Down line"] },
//         { block: "OLA-TMV", lines: ["UP line", "Down line"] },
//         { block: "TMV-MTL", lines: ["UP line", "Down line"] },
//         { block: "MTL-PEI", lines: ["UP line", "Down line"] },
//         { block: "PEI-VVN", lines: ["UP line", "Down line"] },
//         { block: "VVN-MYP", lines: ["UP line", "Down line"] },
//         { block: "MYP-VM", lines: ["UP line", "Down line"] },
//       ],
//       station_blocks: [
//         {
//           block: "MS-YD",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "MKK-YD",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "MBM-YD",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "STM-YD",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "PV-YD",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         {
//           block: "TBM-YD",
//           lines: ["A line", "B line", "Down Sub urban", "Up sub urban"],
//         },
//         { block: "VDR-YD", lines: ["UP line", "Down line"] },
//         { block: "PRGL-VDR", lines: ["UP line", "Down line"] },
//         { block: "GI-YD", lines: ["UP line", "Down line"] },
//         { block: "CTM-YD", lines: ["UP line", "Down line"] },
//         { block: "SKL-YD", lines: ["UP line", "Down line"] },
//         { block: "CGL-YD", lines: ["UP line", "Down line"] },
//         { block: "OV-YD", lines: ["UP line", "Down line"] },
//         { block: "KGZ-YD", lines: ["UP line", "Down line"] },
//         { block: "MMK-YD", lines: ["UP line", "Down line"] },
//         { block: "MLMR-YD", lines: ["UP line", "Down line"] },
//         { block: "TZD-YD", lines: ["UP line", "Down line"] },
//         { block: "OLA-YD", lines: ["UP line", "Down line"] },
//         { block: "TMV-YD", lines: ["UP line", "Down line"] },
//         { block: "MTL-YD", lines: ["UP line", "Down line"] },
//         { block: "PEI-YD", lines: ["UP line", "Down line"] },
//         { block: "VVN-YD", lines: ["UP line", "Down line"] },
//         { block: "MYP-YD", lines: ["UP line", "Down line"] },
//         { block: "VM-YD", lines: ["UP line", "Down line"] },
//       ],
//       lines: [
//         "UP line",
//         "Down line",
//         "A line",
//         "B line",
//         "Down Sub urban",
//         "Up sub urban",
//       ],
//     },
//     {
//       name: "AJJ-KPD",
//       section_blocks: [
//         { block: "AJJ-MLPM", lines: ["UP line", "Down line"] },
//         { block: "MLPM-CTRE", lines: ["UP line", "Down line"] },
//         { block: "CTRE-MDVE", lines: ["UP line", "Down line"] },
//         { block: "MDVE-SHU", lines: ["UP line", "Down line"] },
//         { block: "SHU-TUG", lines: ["UP line", "Down line"] },
//         { block: "TUG-WJR", lines: ["UP line", "Down line"] },
//         { block: "WJR-MCN", lines: ["UP line", "Down line"] },
//         { block: "MCN-THL", lines: ["UP line", "Down line"] },
//         { block: "THL-SVUR", lines: ["UP line", "Down line"] },
//         { block: "SVUR-KPD", lines: ["UP line", "Down line"] },
//         { block: "KPD-RAM", lines: ["UP line", "Down line"] },
//         { block: "KPD-VLR", lines: ["UP line", "Down line"] },
//       ],
//       station_blocks: [
//         { block: "AJJ-YD", lines: ["UP line", "Down line"] },
//         { block: "MLPM-YD", lines: ["UP line", "Down line"] },
//         { block: "CTRE-YD", lines: ["UP line", "Down line"] },
//         { block: "MDVE-YD", lines: ["UP line", "Down line"] },
//         { block: "SHU-YD", lines: ["UP line", "Down line"] },
//         { block: "TUG-YD", lines: ["UP line", "Down line"] },
//         { block: "WJR-YD", lines: ["UP line", "Down line"] },
//         { block: "MCN-YD", lines: ["UP line", "Down line"] },
//         { block: "THL-YD", lines: ["UP line", "Down line"] },
//         { block: "SVUR-YD", lines: ["UP line", "Down line"] },
//         { block: "KPD-YD", lines: ["UP line", "Down line"] },
//       ],
//       lines: ["UP line", "Down line"],
//     },
//     {
//       name: "KPD-JTJ",
//       section_blocks: [
//         { block: "KPD-LTI", lines: ["UP line", "Down line"] },
//         { block: "LTI-KVN", lines: ["UP line", "Down line"] },
//         { block: "KVN-GYM", lines: ["UP line", "Down line"] },
//         { block: "GYM-VLT", lines: ["UP line", "Down line"] },
//         { block: "VLT-MPI", lines: ["UP line", "Down line"] },
//         { block: "MPI-PCKM", lines: ["UP line", "Down line"] },
//         { block: "PCKM-AB", lines: ["UP line", "Down line"] },
//         { block: "AB-VGM", lines: ["UP line", "Down line"] },
//         { block: "VGM-VN", lines: ["UP line", "Down line"] },
//         { block: "VN-KDY", lines: ["UP line", "Down line"] },
//         { block: "KDY-JTJ", lines: ["UP line", "Down line"] },
//         { block: "JTJ-SKPT", lines: ["UP line", "Down line"] },
//         { block: "JTJ-TPT", lines: ["UP line", "Down line"] },
//         { block: "JTJ AUX-TPT", lines: ["UP line", "Down line"] },
//       ],
//       station_blocks: [
//         { block: "KPD-YD", lines: ["UP line", "Down line"] },
//         { block: "LTI-YD", lines: ["UP line", "Down line"] },
//         { block: "KVN-YD", lines: ["UP line", "Down line"] },
//         { block: "GYM-YD", lines: ["UP line", "Down line"] },
//         { block: "VLT-YD", lines: ["UP line", "Down line"] },
//         { block: "MPI-YD", lines: ["UP line", "Down line"] },
//         { block: "PCKM-YD", lines: ["UP line", "Down line"] },
//         { block: "AB-YD", lines: ["UP line", "Down line"] },
//         { block: "VGM-YD", lines: ["UP line", "Down line"] },
//         { block: "VN-YD", lines: ["UP line", "Down line"] },
//         { block: "KDY-YD", lines: ["UP line", "Down line"] },
//         { block: "JTJ-YD", lines: ["UP line", "Down line"] },
//       ],
//       lines: ["UP line", "Down line"],
//     },
//     {
//       name: "AJJ-CGL",
//       section_blocks: [
//         { block: "CGL-RDY", lines: ["SINGLE LINE"] },
//         { block: "CGL-PALR", lines: ["SINGLE LINE"] },
//         { block: "RDY-VB", lines: ["SINGLE LINE"] },
//         { block: "VB-PALR", lines: ["SINGLE LINE"] },
//         { block: "PALR-PYV", lines: ["SINGLE LINE"] },
//         { block: "PALR-WJ", lines: ["SINGLE LINE"] },
//         { block: "PYV-WJ", lines: ["SINGLE LINE"] },
//         { block: "WJ-NTT", lines: ["SINGLE LINE"] },
//         { block: "WJ-CJ", lines: ["SINGLE LINE"] },
//         { block: "NTT-CJ(O)", lines: ["SINGLE LINE"] },
//         { block: "CJ(O)-CJ(E)", lines: ["SINGLE LINE"] },
//         { block: "CJ(E)-TMLP", lines: ["SINGLE LINE"] },
//         { block: "TMLP-TKO", lines: ["SINGLE LINE"] },
//         { block: "TMLP-MLPM", lines: ["SINGLE LINE"] },
//         { block: "TKO-MLPM", lines: ["SINGLE LINE"] },
//         { block: "MLPM-AJJ", lines: ["SINGLE LINE"] },
//       ],
//       station_blocks: [
//         { block: "CGL-YD", lines: ["SINGLE LINE"] },
//         { block: "PALR-YD", lines: ["SINGLE LINE"] },
//         { block: "WJ-YD", lines: ["SINGLE LINE"] },
//         { block: "CJ(O)-YD", lines: ["SINGLE LINE"] },
//         { block: "CJ(E)-YD", lines: ["SINGLE LINE"] },
//         { block: "TMLP-YD", lines: ["SINGLE LINE"] },
//         { block: "MLPM-YD", lines: ["SINGLE LINE"] },
//         { block: "AJJ-YD", lines: ["SINGLE LINE"] },
//       ],
//       lines: ["UP line", "Down line"],
//     },
//     {
//       name: "MAS-GDR",
//       section_blocks: [
//         {
//           block: "MASS-BBQ",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "MAS-BBQ",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "MMC-BBQ",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "BBQ-KOK",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "VPY-KOK",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "WST-KOK",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "KOK-TNP",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "TNP-TVT",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "TVT-ENR",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "ENR-AIPP",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "AIPP-AIP",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         { block: "AIP-MJR", lines: ["UP line", "Down line"] },
//         { block: "MJR-PON", lines: ["UP line", "Down line"] },
//         { block: "PON-KVP", lines: ["UP line", "Down line"] },
//         { block: "KVP-GPD", lines: ["UP line", "Down line"] },
//         { block: "GPD-ELR", lines: ["UP line", "Down line"] },
//         { block: "ELR-AKM", lines: ["UP line", "Down line"] },
//         { block: "AKM-TAD", lines: ["UP line", "Down line"] },
//         { block: "TAD-SPE", lines: ["UP line", "Down line"] },
//         { block: "TAD-AKAT", lines: ["UP line", "Down line"] },
//         { block: "AKAT-SPE", lines: ["UP line", "Down line"] },
//         { block: "SPE-PEL", lines: ["UP line", "Down line"] },
//         { block: "PEL-DVR", lines: ["UP line", "Down line"] },
//         { block: "DVR-NYP", lines: ["UP line", "Down line"] },
//         { block: "NYP-PYA", lines: ["UP line", "Down line"] },
//         { block: "PYA-ODR", lines: ["UP line", "Down line"] },
//         { block: "ODR-GDR", lines: ["UP line", "Down line"] },
//       ],
//       station_blocks: [
//         {
//           block: "MMC-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "MAS-YD",
//           lines: ["UP NE", "Down NE"],
//         },
//         {
//           block: "BBQ-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "KOK-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "TNP-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "TVT-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "ENR-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "AIP-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         {
//           block: "AIPP-YD",
//           lines: ["UP slow", "Down Slow", "UP fast", "Down Fast"],
//         },
//         { block: "MJR-YD", lines: ["UP line", "Down line"] },
//         { block: "PON-YD", lines: ["UP line", "Down line"] },
//         { block: "KVP-YD", lines: ["UP line", "Down line"] },
//         { block: "GPD-YD", lines: ["UP line", "Down line"] },
//         { block: "ELR-YD", lines: ["UP line", "Down line"] },
//         { block: "AKM-YD", lines: ["UP line", "Down line"] },
//         { block: "TAD-YD", lines: ["UP line", "Down line"] },
//         { block: "SPE-YD", lines: ["UP line", "Down line"] },
//         { block: "PEL-YD", lines: ["UP line", "Down line"] },
//         { block: "DVR-YD", lines: ["UP line", "Down line"] },
//         { block: "NYP-YD", lines: ["UP line", "Down line"] },
//         { block: "PYA-YD", lines: ["UP line", "Down line"] },
//         { block: "ODR-YD", lines: ["UP line", "Down line"] },
//         { block: "GDR-YD", lines: ["UP line", "Down line"] },
//       ],
//       lines: [
//         "UP line",
//         "Down line",
//         "UP slow",
//         "Down Slow",
//         "UP fast",
//         "Down Fast",
//         "UP NE",
//         "Down NE",
//       ],
//     },
//     {
//       name: "MSB-VLCY",
//       section_blocks: [
//         {
//           block: "MSB-MCPK",
//           lines: ["UP line", "Down line"],
//         },
//         {
//           block: "MCPK-MTMY",
//           lines: ["UP line", "Down line"],
//         },
//         {
//           block: "MTMY-VLCY",
//           lines: ["UP line", "Down line"],
//         },
//       ],
//       station_blocks: [],
//       lines: ["UP line", "Down line"],
//     },
//   ],
// };

// export let sectionData = {
//   "AJJ-RU": {
//     section: [
//       "AJJ-AJJN",
//       "MLPM-AJJN",
//       "AJJN-TRT",
//       "TRT-POI",
//       "POI-VKZ",
//       "POI-NG",
//       "VKZ-NG",
//       "NG-EKM",
//       "NG-VGA",
//       "EKM-VGA",
//       "VGA-PUT",
//       "PUT-TDK",
//       "TDK-PUDI",
//       "PUDI-RU",
//     ],
//     station: [
//       "AJJ-YD",
//       "MLPM-YD",
//       "AJJN-YD",
//       "TRT-YD",
//       "POI-YD",
//       "NG-YD",
//       "VAG-YD",
//       "PUT-YD",
//       "TDK-YD",
//       "PUDI-YD",
//       "RU-YD",
//     ],
//   },
//   "MAS-AJJ": {
//     station: [
//       "MAS-BBQ",
//       "MASS-BBQ",
//       "MMCC-BBQ",
//       "BBQ-VPY",
//       "VPY-VLK",
//       "VLK-ABU",
//       "ABU-AVD",
//       "AVD-PAB",
//       "PAB-PTMS",
//       "PTMS-TI",
//       "PAB-TI",
//       "TI-TRL",
//       "TRL-KBT",
//       "KBT-TO",
//       "TO-AJJ",
//     ],
//     section: [
//       "MAS-YD",
//       "BBQ-YD",
//       "MMCC-YD",
//       "MASS-YD",
//       "VPY-YD",
//       "VLK-YD",
//       "ABU-YD",
//       "AVD-YD",
//       "PAB-YD",
//       "PTMS-YD",
//       "TI-YD",
//       "TRL-YD",
//       "KBT-YD",
//       "TO-YD",
//       "AJJ-YD",
//     ],
//   },
//   "MSB-VM": {
//     section: [
//       "MSB-MS",
//       "MS-MKK",
//       "MKK-MBM",
//       "MBM-STM",
//       "STM-PV",
//       "PV-TBM",
//       "TBM-PRGL",
//       "TBM-VDR",
//       "PRGL-VDR",
//       "VDR-UPM",
//       "VDR-GI",
//       "UPM-GI",
//       "POTI-CTM",
//       "GI-CTM",
//       "CTM-MMNK",
//       "CTM-SKL",
//       "MMNK-SKL",
//       "SKL-PWU",
//       "SKL-CGL",
//       "PWU-CGL",
//       "CGL-OV",
//       "OV-PTM",
//       "OV-KGZ",
//       "PTM-KGZ",
//       "KGZ-MMK",
//       "MMK-MLMR",
//       "MLMR-ACK",
//       "MLMR-TZD",
//       "ACK-TZD",
//       "TZD-OLA",
//       "OLA-TMV",
//       "TMV-MTL",
//       "MTL-PEI",
//       "PEI-VVN",
//       "VVN-MYP",
//       "MYP-VM",
//     ],
//     station: [
//       "MS-YD",
//       "MKK-YD",
//       "MBM-YD",
//       "STM-YD",
//       "PV-YD",
//       "TBM-YD",
//       "VDR-YD",
//       "GI-YD",
//       "CTM-YD",
//       "SKL-YD",
//       "CGL-YD",
//       "OV-YD",
//       "KGZ-YD",
//       "MMK-YD",
//       "MLMR-YD",
//       "TZD-YD",
//       "OLA-YD",
//       "TMV-YD",
//       "MTL-YD",
//       "PEI-YD",
//       "VVN-YD",
//       "MYP-YD",
//       "VM-YD",
//     ],
//   },
//   "AJJ-KPD": {
//     section: [
//       "AJJ-MLPM",
//       "MLPM-CTRE",
//       "CTRE-MDVE",
//       "MDVE-SHU",
//       "SHU-TUG",
//       "TUG-WJR",
//       "WJR-MCN",
//       "MCN-THL",
//       "THL-SVUR",
//       "SVUR-KPD",
//       "KPD-RAM",
//       "KPD-VLR",
//     ],
//     station: [
//       "AJJ-YD",
//       "MLPM-YD",
//       "CTRE-YD",
//       "MDVE-YD",
//       "SHU-YD",
//       "TUG-YD",
//       "WJR-YD",
//       "MCN-YD",
//       "THL-YD",
//       "SVUR-YD",
//       "KPD-YD",
//     ],
//   },
//   "KPD-JTJ": {
//     section: [
//       "KPD-LTI",
//       "LTI-KVN",
//       "KVN-GYM",
//       "GYM-VLT",
//       "VLT-MPI",
//       "MPI-PCKM",
//       "PCKM-AB",
//       "AB-VGM",
//       "VGM-VN",
//       "VN-KDY",
//       "KDY-JTJ",
//       "JTJ-SKPT",
//       "JTJ-TPT",
//       "JTJ AUX-TPT",
//     ],
//     station: [
//       "AJJ-YD",
//       "MLPM-YD",
//       "CTRE-YD",
//       "MDVE-YD",
//       "SHU-YD",
//       "TUG-YD",
//       "WJR-YD",
//       "MCN-YD",
//       "THL-YD",
//       "SVUR-YD",
//       "KPD-YD",
//       "LTI-YD",
//       "KVN-YD",
//       "GYM-YD",
//       "VLT-YD",
//       "MPI-YD",
//       "PCKM-YD",
//       "AB-YD",
//       "VGM-YD",
//       "VN-YD",
//       "KDY-YD",
//       "JTJ-YD",
//     ],
//   },
//   "AJJ-CGL": {
//     section: [
//       "CGL-RDY",
//       "RDY-VB",
//       "CGL-PALR",
//       "VB-PALR",
//       "PALR-PYV",
//       "PALR-WJ",
//       "PYV-WJ",
//       "WJ-NTT",
//       "WJ-CJ",
//       "NTT-CJ(O)",
//       "CJ(O)-CJ(E)",
//       "CJ(E)-TMLP",
//       "TMLP-TKO",
//       "TMLP-MLPM",
//       "TKO-MLPM",
//       "MLPM-AJJ",
//     ],
//     station: [
//       "CGL-YD",
//       "PALR-YD",
//       "WJ-YD",
//       "CJ(O)-YD",
//       "CJ(E)-YD",
//       "TMLP-YD",
//       "MLPM-YD",
//       "AJJ-YD",
//     ],
//   },
//   "MAS-GDR": {
//     section: [
//       "MASS-BBQ",
//       "MAS-BBQ",
//       "MMC-BBQ",
//       "VPY-KOK",
//       "BBQ-KOK",
//       "VPY-KOK",
//       "WST-KOK",
//       "KOK-TNP",
//       "TNP-TVT",
//       "TVT-ENR",
//       "ENR-AIPP",
//       "AIPP-AIP",
//       "AIP-MJR",
//       "MJR-PON",
//       "PON-KVP",
//       "KVP-GPD",
//       "GPD-ELR",
//       "ELR-AKM",
//       "AKM-TAD",
//       "TAD-AKAT",
//       "TAD-SPE",
//       "AKAT-SPE",
//       "SPE-PEL",
//       "PEL-DVR",
//       "DVR-NYP",
//       "NYP-PYA",
//       "PYA-ODR",
//       "ODR-GDR",
//     ],
//     station: [
//       "MMC-YD",
//       "MAS-YD",
//       "BBQ-YD",
//       "KOK-YD",
//       "TNP-YD",
//       "TVT-YD",
//       "ENR-YD",
//       "AIP-YD",
//       "AIPP-YD",
//       "MJR-YD",
//       "PON-YD",
//       "KVP-YD",
//       "GPD-YD",
//       "ELR-YD",
//       "AKM-YD",
//       "TAD-YD",
//       "SPE-YD",
//       "PEL-YD",
//       "DVR-YD",
//       "NYP-YD",
//       "PYA-YD",
//       "ODR-YD",
//       "GDR-YD",
//     ],
//   },
//   "MSB-VLCY": {
//     section: ["MSB-MCPK", "MCPK-MTMY", "MTMY-VLCY"],
//     station: [],
//   },
// };





// export let MajorSection = {
//  " MAS": ["MAS-GDR","MAS-AJJ","AJJ-KPD", "KPD-JTJ", "AJJ-RU","AJJ-CGL","MSB-VM","MSB-VLCY"],
// "TPJ": ["TPJ-VM", "VM-MV", "TPJ-MV","TJ-KIK","MV-TVR","NMJ- MQ","VM-PDY","KPD-VM","CUPJ-VRI","TPJ-TP","NGT-VLNK","TVR- KKDI","TTP-AGX"],
// "SA":["JTJ-ED","ED-PTJ","ED-TPJ","KRR-DG","SA-VRI","SA-MTDM","SA-KRR","CBE-MTP","MTP-UAM","PTJ-CNV"]
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



export let blockSection = {
  "SRR-CHTS": [
    "SRRB-VTK", "VTK-WKI", "WKI-MGK", "MGK-PNQ", "PNQ-TCR",
    "TCR-OLR", "OLR-PUK", "PUK-IJK", "IJK-CKI", "CKI-KUC",
    "KUC-AFK", "AFK-AWY", "AWY-KLMR", "KLMR-IPL", "IPL-VPDM",
    "IPL-ERN", "ERN-ERS", "ERS-CHTS","ERN-ERSC","ERS-ERSC","ERSC-ERSD","ERSD-IPN",
    "ERSC-ERM","ERM-ERSD", "VTK-YD", "WKI-YD", "MGK-YD", "PNQ-YD", "TCR-YD", "OLR-YD", "PUK-YD", "IJK-YD",
    "CKI-YD", "KUC-YD", "AFK-YD", "AWY-YD", "KLMR-YD", "IPL-YD", "VPDM-YD", "ERN-YD",
    "ERS-YD", "CHTS-YD"
  ],
  "TCR-GUV": [
    "TCR-PNQ", "PNQ-GUV",
    "TCR-YD", "PNQ-YD", "GUV-YD"
  ],
  "ERS-KTYM-KYJ": [
    "ERS-ERSC","ERSC-TRTD","ERSD-TRTR", "TRTR-MNTT", "TRTR-IPN", "MNTT-PVRD", "PVRD-VARD",
    "VARD-KRPP", "KRPP-ETM", "ETM-KTYM", "KTYM-CGV", "CGV-CGY",
    "CGY-TRVL", "TRVL-CNGR", "CNGR-MVLK", "MVLK-KYJ",
    "ERS-YD","ERSC-YD","ERSD-YD", "TRTR-YD", "MNTT-YD", "PVRD-YD", "VARD-YD", "KRPP-YD", "ETM-YD",
    "KTYM-YD", "CGV-YD", "CGY-YD", "TVRL-YD", "CNGR-YD", "MVLK-YD", "KYJ-YD"
  ],
  "ERS-ALLP-KYJ": [
    "ERS-KUMM", "KUMM-TUVR", "TUVR-SRTL", "SRTL-MAKM", "MAKM-ALLP",
    "ALLP-AMPA", "AMPA-HAD", "HAD-CHPD", "CHPD-KYJ",
    "ERS-YD", "KUMM-YD", "TUVR-YD", "SRTL-YD", "MAKM-YD", "ALLP-YD", "AMPA-YD",
    "HAD-YD", "CHPD-YD", "KYJ-YD"
  ],
  "KYJ-QLN": [
    "KYJ-OCR", "OCR-KPY", "KPY-STKT", "STKT-PRND", "PRND-QLN",
    "KYJ-YD", "OCR-YD", "KPY-YD", "STKT-YD", "PRND-YD", "OLN-YD"
  ],
  "QLN-TVC": [
    "QLN-PVU", "PVU-VAK", "VAK-KVU", "KVU-MQU", "MQU-KZK",
    "KZK-TVCN", "TVCN-TVC",
    "QLN-YD", "PVU-YD", "VAK-YD", "KVU-YD", "MQU-YD", "KZK-YD", "KCVL-YD", "TVC-YD"
  ],
  "TVC-NCJ": [
    "TVC-TVCS", "TVCS-NYY", "NYY-PASA", "PASA-KZT", "KZT-ERL",
    "ERL-NJT", "NJT-NCJ",
    "TVC-YD", "NEM-YD", "NYY-YD", "PASA-YD", "KZT-YD", "ERL-YD", "NJT-YD", "NCJ-YD"
  ],
  "NCJ-TEN": [
    "NCJ-AAY", "AAY-NPK", "NPK-VLY", "VLY-NNN", "NNN-MP", "MP-TEN",
    "NCJ-YD", "AAY-YD", "NPK-YD", "VLY-YD", "NNN-YD", "MP-YD", "TEN-YD"
  ],
  "NCJ-CAPE": [
    "NCJ-CAPE",
    "NCJ-YD", "CAPE-YD"
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
  Maintenance: [
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
  "VTK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "WKI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "MGK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "PNQ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "TCR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "OLR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "PUK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "IJK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "CKI-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KUC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "AFK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "AWY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KLMR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "IPL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": []
  },
  "VPDM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "ERN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "ERS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9", "Rd 10"],
    "both direction not affected": []
  },
  "ERSC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9", "Rd 10"],
    "both direction not affected": []
  },
  "ERSD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8", "Rd 9", "Rd 10"],
    "both direction not affected": []
  },
  "CHTS-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "GUV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "TRTR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "MNTT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "PVRD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "VARD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KRPP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "ETM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KTYM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": []
  },
  "CGV-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "CGY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "TVRL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "CNGR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "MVLK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KYJ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6"],
    "both direction not affected": []
  },
  "KUMM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "TUVR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "SRTL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MAKM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "ALLP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "AMPA-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "HAD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "CHPD-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "OCR-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KPY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "STKT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "PRND-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "QLN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8","Rd 9","Rd 10","Rd 11","Rd 12","Rd 13","Rd 14","Rd 15","BA 1","BA 2"],
    "both direction not affected": []
  },
  "PVU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "VAK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KVU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MQU-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "KZK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "KCVL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7"],
    "both direction not affected": []
  },
  "TVC-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "NEM-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "NYY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "PASA-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "KZT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "ERL-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2"],
    "both direction not affected": []
  },
  "NJT-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "NCJ-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5"],
    "both direction not affected": []
  },
  "AAY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "NPK-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "VLY-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "NNN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3"],
    "both direction not affected": []
  },
  "MP-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "TEN-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4"],
    "both direction not affected": []
  },
  "CAPE-YD": {
    "up direction affected": [],
    "down direction affected": [],
    "both direction affected": ["Rd 1", "Rd 2", "Rd 3", "Rd 4", "Rd 5", "Rd 6", "Rd 7", "Rd 8"],
    "both direction not affected": []
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



export let lineData = {
  "SRRB-VTK": ["UP", "DN"],
  "VTK-WKI": ["UP", "DN"],
  "WKI-MGK": ["UP", "DN"],
  "MGK-PNQ": ["UP", "DN"],
  "PNQ-TCR": ["UP", "DN"],
  "TCR-OLR": ["UP", "DN"],
  "OLR-PUK": ["UP", "DN"],
  "PUK-IJK": ["UP", "DN"],
  "IJK-CKI": ["UP", "DN"],
  "CKI-KUC": ["UP", "DN"],
  "KUC-AFK": ["UP", "DN"],
  "AFK-AWY": ["UP", "DN"],
  "AWY-KLMR": ["UP", "DN"],
  "KLMR-IPL": ["UP", "DN"],
  "IPL-VPDM": ["SINGLE"],
  "IPL-ERN": ["UP", "DN"],
  "ERN-ERS": ["UP", "DN"],
  "ERS-CHTS": ["SINGLE"],
  "ERN-ERSC": ["UP", "DN"],
  "ERS-ERSC": ["SINGLE"],
  "ERSC-ERSD": ["UP", "DN"],
  "ERSD-IPN": ["SINGLE"],
  "ERSC-ERM": ["SINGLE"],
  "ERM-ERSD": ["SINGLE"],
  
  "TCR-PNQ": ["UP", "DN"],
  "PNQ-GUV": ["SINGLE"],

  //"ERS-ERSC": ["UP", "DN"],  
  //"ERSC-ERSD": ["UP", "DN"],
  "ERSD-TRTR": ["UP", "DN"],
  "TRTR-MNTT": ["UP", "DN"],
  "TRTR-IPN": ["SINGLE"],
  "MNTT-PVRD": ["UP", "DN"],
  "PVRD-VARD": ["UP", "DN"],
  "VARD-KRPP": ["UP", "DN"],
  "KRPP-ETM": ["UP", "DN"],
  "ETM-KTYM": ["UP", "DN"],
  "KTYM-CGV": ["UP", "DN"],
  "CGV-CGY": ["UP", "DN"],
  "CGY-TRVL": ["UP", "DN"],
  "TRVL-CNGR": ["UP", "DN"],
  "CNGR-MVLK": ["UP", "DN"],
  "MVLK-KYJ": ["UP", "DN"],

  "ERS-KUMM": ["SINGLE"],
  "KUMM-TUVR": ["SINGLE"],
  "TUVR-SRTL": ["SINGLE"],
  "SRTL-MAKM": ["SINGLE"],
  "MAKM-ALLP": ["SINGLE"],
  "ALLP-AMPA": ["SINGLE"],
  "AMPA-HAD": ["UP", "DN"],
  "HAD-CHPD": ["UP", "DN"],
  "CHPD-KYJ": ["UP", "DN"],

  "KYJ-OCR": ["UP", "DN"],
  "OCR-KPY": ["UP", "DN"],
  "KPY-STKT": ["UP", "DN"],
  "STKT-PRND": ["UP", "DN"],
  "PRND-QLN": ["UP", "DN"],

  "QLN-PVU": ["UP", "DN"],
  "PVU-VAK": ["UP", "DN"],
  "VAK-KVU": ["UP", "DN"],
  "KVU-MQU": ["UP", "DN"],
  "MQU-KZK": ["UP", "DN"],
  "KZK-TVCN": ["UP", "DN"],
  "TVCN-TVC": ["UP", "DN"],

  "TVC-TVCS": ["SINGLE"],
  "TVCS-NYY": ["SINGLE"],
  "NYY-PASA": ["SINGLE"],
  "PASA-KZT": ["SINGLE"],
  "KZT-ERL": ["SINGLE"],
  "ERL-NJT": ["SINGLE"],
  "NJT-NCJ": ["UP", "DN"],

  "NCJ-AAY": ["UP", "DN"],
  "AAY-NPK": ["UP", "DN"],
  "NPK-VLY": ["UP", "DN"],
  "VLY-NNN": ["UP", "DN"],
  "NNN-MP": ["UP", "DN"],
  "MP-TEN": ["UP", "DN"],

  "NCJ-CAPE": ["UP", "DN"]
};



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
  "SRR-CHTS": {
    "S&T": ["TCR", "AWY", "ERS","WKI"],
    "ENGG": ["TCR", "CKI", "AWY", "ERS","CN"],
    "TRD": ["TCR", "CKI", "ERS","CN"]
  },
  "TCR-GUV": {
    "S&T": ["TCR"],
    "ENGG": ["TCR","CN","BRI/QLN"],
    "TRD": ["TCR","CN"]
  },
 "ERS-KTYM-KYJ": {
    "S&T": ["ERS", "KTYM", "KYJ","PVRD","CNGR"],
    "ENGG": ["ERS", "PVRD", "KTYM", "MVLK","BRI/QLN","CN"],
    "TRD": ["ERS", "KTYM", "KYJ","CN"]
  },
  "ERS-ALLP-KYJ": {
    "S&T": ["ERS", "KYJ", "ALLP"],
    "ENGG": ["ERS", "ALLP", "MVLK","BRI/QLN","CN"],
    "TRD": ["ERS", "ALLP", "KYJ","CN"]
  },
 "KYJ-QLN": {
    "S&T": ["KYJ", "QLN","KPY"],
    "ENGG": ["MVLK", "QLN","BRI/QLN","CN"],
    "TRD": ["KYJ", "QLN","CN"]
  },
  "QLN-TVC": {
    "S&T": ["QLN", "TVC"],
    "ENGG": ["QLN", "VAK", "TVC","BRI/QLN","CN"],
    "TRD": ["QLN", "KZK","CN"]
  },
  "TVC-NCJ": {
    "S&T": ["TVC", "NCJ"],
    "ENGG": ["TVC", "NCJ","BRI/QLN","CN"],
    "TRD": ["KZK", "NCJ","CN"]
  },
 "NCJ-TEN": {
    "S&T": ["NCJ"],
    "ENGG": ["NCJ","BRI/QLN","CN"],
    "TRD": ["NCJ", "NNN","CN"]
  },
  "NCJ-CAPE": {
    "S&T": ["NCJ"],
    "ENGG": ["NCJ","BRI/QLN","CN"],
    "TRD": ["NCJ","CN"]
  }
};


export const depotOnLocation = {
  MDU: [
    "KLQ", "KUV", "KKZ", "AVS", "PUU", "EDN", "TML", "AYVN", "BJM", "MNM", "TNHP", "PDKT",
    "MEKM", "KKDI", "MDU", "MVN", "KON", "SER", "SDN", "VDP", "MEJ", "KQN", "ABI", "TPC",
    "SVPR", "PMK", "RMM", "TDN", "TMQ", "PCM", "KGD", "USLP", "ADPT", "TE", "BDNK", "MMM",
    "PBMB", "ILA", "UCP", "KKY", "PBKS", "NLL", "SNKL", "SRT", "TY", "TYM", "KDU", "RMD",
    "TSI", "TEN", "TIP", "KDNL", "RJPM", "TVN", "NZT", "ASD", "GDN", "CTND", "SVV", "SUX",
    "TCN", "SQD", "KAL", "SMD", "TAY", "ANY", "SDNR", "KRUR", "PNGI", "SCT", "SVGA", "VEL",
    "SVKS", "KRMG", "API", "DG", "ODC", "CHPT", "PLNI", "PPTR", "MVRD", "UDT", "GMGM", "TN",
    "VPT", "NKK", "TCH"
  ],
  MAS: [
    "MS", "MPK", "MSB", "VLCY", "WST", "RPM", "TNPM", "MTMY", "MCPK", "MLMR", "TZD", "OLA",
    "TMV", "MTL", "PEI", "VVN", "MYP", "CGL", "CJ", "KGZ", "MMK", "OV", "PALR", "TMLP", "WJ",
    "JTJ", "KDY", "VN", "VGM", "AB", "PCKM", "MPI", "VLT", "GYM", "TBM", "SKL", "CTM", "VDR",
    "GI", "PV", "STM", "MKK", "CTRE", "MDVE", "SHU", "TUG", "WJR", "MCN", "THL", "SVUR", "KPD",
    "LTI", "KVN", "KOK", "KVP", "PON", "TADA", "TVT", "ENR", "MJR", "AIP", "GPD", "ELR", "AKM",
    "SPE", "PEL", "DVR", "NYP", "PYA", "ODUR", "AJJ", "BBQ", "KBT", "NG", "POI", "PUDI", "PUT",
    "SVF", "TDK", "TO", "TRT", "VGA", "ABU", "AVD", "MAS", "PER", "PTMS", "TI", "TRL", "VLK"
  ],
  SA: [
    "ANU", "ATU", "AVK", "BDY", "BQI", "CBE", "CBF", "CHSM", "CV", "CVD", "DC", "DPI", "DSPT",
    "DST", "ED", "EDU", "EL", "ETP", "IGR", "IGU", "KAY", "KEY", "KLGN", "KLT", "KMD", "KPPR",
    "KRR", "KXT", "LCR", "LOV", "LP", "MALR", "MAP", "MCRD", "MGSJ", "MKSP", "MMH", "MONR",
    "MPLI", "MPLM", "MTDM", "MTNL", "MTP", "MVPM", "MYU", "NMKL", "OML", "ONR", "PALM", "PAS",
    "PGN", "PGR", "PLI", "PLMD", "PRV", "PTJ", "PY", "RASP", "SA", "SAMT", "SGE", "SLY", "SNO",
    "SUU", "SXT", "TNT", "TPM", "TPT", "TUP", "UKL", "URL", "VEI", "VNJ", "VRPD", "VRQ", "VZ",
    "WEL"
  ],
  PGT: [
    "AAM", "SRR", "VNB", "OTP", "MAJN", "LDY", "MNUR", "FK", "KRKD", "MAQ", "KUL", "NIL",
    "NTVT", "PLL", "MJS", "NLE", "WH", "CLT", "ULL", "QLD", "ETR", "PGT", "ETMD", "KJKD",
    "CLMD", "MDKI", "MMDA", "CNV", "KLGD", "PDGM", "MXM", "KTKU", "PNMB", "PGTN", "POY",
    "padil", "WRA"
  ],
  TVC: [
    "AAY", "NCJ", "AFK", "ALLP", "AMPA", "AWY", "CAPE", "CGV", "CHPD", "CKI", "CNGR", "ERL",
    "ERSC", "ERM", "GUV", "ERN", "HAD", "IJK", "KLMR", "KPY", "KRPP", "KTYM", "KUC", "IPN",
    "KUMM", "KYJ", "KZK", "KZT", "MAKM", "MGK", "MP", "MQU", "MVLK", "NNN", "NYY", "OCR",
    "OLR", "PASA", "PNQ", "PRND", "QLN", "PUK", "PVRD", "PVU", "SRTL", "STKT", "TCR", "TRTR",
    "TUVR", "TVCS", "VARD", "VLY", "VTK", "WKI", "IPL", "CGY", "KVU", "ERS/D", "MNTT", "ERS",
    "TVC", "NPK", "ETM", "TVCN", "VAK", "QIN", "NJT", "TRVL"
  ],
  TPJ: [
    "AGM", "AGX", "ALU", "ALK", "AMM", "ANP", "ARV", "ATQ", "AYI", "BAL", "CDM", "CLN", "GOC",
    "ICG", "KDM", "KDMD", "KII", "KKPM", "KLGM", "KMM", "KNB", "MV", "NCR", "NMJ", "NVL",
    "OTK", "PDY", "PKT", "PMB", "PRKL", "PRL", "PUC", "PVN", "PVI", "PYK", "SGM", "SLTH", "SMM",
    "SNDI", "SRGM", "SY", "TAM", "TJM", "TLI", "TLNR", "TNI", "TNM", "TPGY", "TPJ", "TRK",
    "TUY", "TVNL", "ULU", "UMG", "VDL", "VLDE", "VKM", "VM", "VLR", "VRI", "vri", "kii", "pvn", "Sy"
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

export const departmentDepot = {
    "TRD": [
    "TCR", "CKI", "ERS", "CN", "KTYM", "KYJ", "ALLP",
    "QLN", "KZK", "NCJ", "NNN"
  ],

  "S&T": [
    "TCR", "AWY", "ERS", "WKI", "KTYM", "KYJ", "PVRD",
    "CNGR", "ALLP", "QLN", "KPY", "TVC", "NCJ"
  ],

  "ENGG": [
    "TCR", "CKI", "AWY", "ERS", "CN", "BRI/QLN", "PVRD",
    "KTYM", "MVLK", "ALLP", "QLN", "VAK", "TVC", "NCJ"
  ]

}