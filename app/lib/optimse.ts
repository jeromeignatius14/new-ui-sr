import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

export interface ProcessedLineSection {
    road?: string;
    type?: string;
    block: string;
    stream?: string;
    lineName?: string;
    otherLines?: string;
    otherRoads?: string;
}

export interface OriginalRecord {
    id: string;
    date: string;
    selectedDepartment: string;
    selectedSection: string;
    stationID: string | null;
    missionBlock: string;
    workType: string;
    activity: string;
    freshCautionRequired: boolean;
    freshCautionSpeed: number | null;
    freshCautionLocationFrom?: string | null;
    freshCautionLocationTo?: string | null;
    adjacentLinesAffected: string;
    workLocationFrom: string;
    workLocationTo: string;
    demandTimeFrom: string;
    demandTimeTo: string;
    sigDisconnection: boolean;
    elementarySection: string;
    elementarySectionTo?: string | null;
    sigElementarySectionFrom?: string | null;
    sigElementarySectionTo?: string | null;
    repercussions: string;
    trdWorkLocation: string;
    requestremarks: string;
    createdAt: string;
    status: string;
    selectedDepo: string;
    sigResponse: string;
    ohDisconnection?: boolean | null;
    oheDisconnection?: boolean | null;
    oheResponse: string;
    corridorType: string;
    corridorTypeSelection?: string | null;
    sigActionsNeeded: boolean;
    trdActionsNeeded: boolean;
    ManagerResponse?: string | null;
    sigDisconnectionRequirements?: string | null;
    sntDisconnectionRequirements?: string | null;
    sntDisconnectionLine?: string | null;
    sntDisconnectionLineFrom?: string | null;
    sntDisconnectionLineTo?: string | null;
    trdDisconnectionRequirements?: string | null;
    powerBlockRequirements?: string | null;
    powerBlockRequired: boolean;
    sntDisconnectionRequired: boolean;
    processedLineSections?: ProcessedLineSection[];
    routeFrom?: string | null;
    routeTo?: string | null;
    DisconnAcceptance: string;
    userId: string;
    managerAcceptanceId: string;
    managerAcceptance: boolean;
    adminAcceptanceId?: string | null;
    adminAcceptance: boolean;
    user: Record<string, any>;
    // Extra fields for reconstructed output
    optimisedTimeFrom?: string;
    optimisedTimeTo?: string;
    duration?: number;
    push?: any;
    comments?: any[];
}

export interface FlatRecord {
    id: string;
    date: string;
    combinationId: string | null;
    selectedSection: string;
    demandTimeFrom: string;
    demandTimeTo: string;
    selectedDepartment: string;
    selectedLine: string | null;
    otherAffectedLine: string | null;
    missionBlock: string;
    selectedStream: string | null;
    selectedDepo: string;
    // Extra fields coming through flatten
    optimisedTimeFrom?: string;
    optimisedTimeTo?: string;
    duration?: number;
    push?: any;
    comments?: any[];
}


export function flattenRecords(records: OriginalRecord[]): FlatRecord[] {
    const result: FlatRecord[] = [];

    for (const record of records) {
        const sections = record.processedLineSections ?? [];
        const comboId = sections.length > 1 ? uuidv4() : null;

        // Convert date format
        const formattedDate = format(parseISO(record.date), 'yyyy-MM-dd');

        // Convert time formats
        const formattedTimeFrom = format(parseISO(record.demandTimeFrom), 'HH:mm');
        const formattedTimeTo = format(parseISO(record.demandTimeTo), 'HH:mm');

        if (sections.length > 0) {
            sections.forEach((sec) => {
                const hasLine = Boolean(sec.lineName && sec.lineName.trim());
                const otherAffected = hasLine
                    ? sec.otherLines ?? null
                    : sec.otherRoads ?? null;
                const selectedLine = hasLine
                    ? sec.lineName ?? null
                    : sec.road ?? null;

                result.push({
                    id: record.id,
                    date: formattedDate,
                    selectedDepo: record.selectedDepo,
                    combinationId: comboId,
                    selectedSection: record.selectedSection,
                    demandTimeFrom: formattedTimeFrom,
                    demandTimeTo: formattedTimeTo,
                    selectedDepartment: record.selectedDepartment,
                    selectedLine: selectedLine,
                    otherAffectedLine: otherAffected,
                    missionBlock: sec.block,
                    selectedStream: sec.stream || sec.type || null,
                });
            });
        } else {
            result.push({
                id: record.id,
                date: formattedDate,
                selectedDepo: record.selectedDepo,
                combinationId: null,
                selectedSection: record.selectedSection,
                demandTimeFrom: formattedTimeFrom,
                demandTimeTo: formattedTimeTo,
                selectedDepartment: record.selectedDepartment,
                selectedLine: null,
                otherAffectedLine: null,
                missionBlock: record.missionBlock,
                selectedStream: null,
            });
        }
    }

    return result;
}


/**
 * Reconstructs original records by grouping FlatRecord entries back into OriginalRecord shape.
 * - If a group has no combinationId: returns each record as-is (with its extras).
 * - If a group has a combinationId: merges sections, and pulls extra fields from the first flat entry,
 *   combining comments arrays.
 */
export function reconstructRecords(flatRecords: FlatRecord[]): OriginalRecord[] {
    type Group = Omit<OriginalRecord, 'processedLineSections'> & { processedLineSections: ProcessedLineSection[] };
    const groups: Record<string, Group> = {};

    flatRecords.forEach((flat) => {
        const key = flat.combinationId ?? flat.id;
        const isCombo = Boolean(flat.combinationId);

        if (!groups[key]) {
            // Convert date back to ISO format
            const isoDate = new Date(flat.date).toISOString();

            // Convert times back to ISO format
            const isoTimeFrom = new Date(`2000-01-01T${flat.demandTimeFrom}`).toISOString();
            const isoTimeTo = new Date(`2000-01-01T${flat.demandTimeTo}`).toISOString();

            const base: Group = {
                id: flat.id,
                date: isoDate,
                selectedDepartment: flat.selectedDepartment,
                selectedSection: flat.selectedSection,
                stationID: null,
                selectedDepo: flat.selectedDepo,
                missionBlock: flat.missionBlock,
                workType: '',
                activity: '',
                freshCautionRequired: false,
                freshCautionSpeed: null,
                freshCautionLocationFrom: null,
                freshCautionLocationTo: null,
                adjacentLinesAffected: '',
                workLocationFrom: '',
                workLocationTo: '',
                demandTimeFrom: isoTimeFrom,
                demandTimeTo: isoTimeTo,
                sigDisconnection: false,
                elementarySection: '',
                elementarySectionTo: null,
                sigElementarySectionFrom: null,
                sigElementarySectionTo: null,
                repercussions: '',
                trdWorkLocation: '',
                requestremarks: '',
                createdAt: '',
                status: '',
                sigResponse: '',
                ohDisconnection: null,
                oheDisconnection: null,
                oheResponse: '',
                corridorType: '',
                corridorTypeSelection: null,
                sigActionsNeeded: false,
                trdActionsNeeded: false,
                ManagerResponse: null,
                sigDisconnectionRequirements: null,
                sntDisconnectionRequirements: null,
                sntDisconnectionLine: null,
                sntDisconnectionLineFrom: null,
                sntDisconnectionLineTo: null,
                trdDisconnectionRequirements: null,
                powerBlockRequirements: null,
                DisconnAcceptance: '',
                powerBlockRequired: false,
                sntDisconnectionRequired: false,
                userId: '',
                managerAcceptanceId: '',
                managerAcceptance: false,
                adminAcceptanceId: null,
                adminAcceptance: false,
                user: {},
                processedLineSections: [],
            };

            // Attach extras if combo
            if (isCombo) {
                base.optimisedTimeFrom = flat.optimisedTimeFrom;
                base.optimisedTimeTo = flat.optimisedTimeTo;
                base.duration = flat.duration;
                base.push = flat.push;
                base.comments = flat.comments ? [...flat.comments] : [];
            }

            // If not combo, copy all extras individually per record rather than group
            if (!isCombo) {
                base.optimisedTimeFrom = flat.optimisedTimeFrom;
                base.optimisedTimeTo = flat.optimisedTimeTo;
                base.duration = flat.duration;
                base.push = flat.push;
                base.comments = flat.comments;
            }

            groups[key] = base;
        } else if (flat.comments && flat.combinationId) {
            // On subsequent combo entries, concatenate comments
            groups[key].comments = (groups[key].comments ?? []).concat(flat.comments);
        }

        // Append section
        const hasLine = Boolean(flat.selectedLine && flat.selectedLine.trim());
        groups[key].processedLineSections.push({
            lineName: flat.selectedLine ?? '',
            otherLines: hasLine ? flat.otherAffectedLine ?? '' : '',
            otherRoads: hasLine ? '' : flat.otherAffectedLine ?? '',
            block: flat.missionBlock,
            stream: flat.selectedStream ?? '',
        });
    });

    return Object.values(groups) as OriginalRecord[];
}

