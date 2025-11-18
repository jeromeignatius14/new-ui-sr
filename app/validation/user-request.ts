import { z } from "zod";

export const userRequestSchema = z.object({
    id: z.string().optional(),
    adminAcceptance: z.boolean().optional().default(false),
    date: z.string(),  // present in both
    selectedDepartment: z.string(),  // present in both
    selectedSection: z.string(),  // present in both
    missionBlock: z.string(),  // present in both
    workType: z.string(),  // present in both
    activity: z.string(),  // present in both
    corridorTypeSelection: z.enum(["Corridor", "Outside Corridor", "Urgent Block"]).nullable(),
    corridorType: z.enum(["Corridor", "Outside Corridor", "Urgent Block"]).nullable(),  // present in both
    cautionRequired: z.boolean(),  // present in both
    cautionSpeed: z.number().optional(),  // present in both
    workLocationFrom: z.string(),  // present in both
    workLocationTo: z.string(),  // present in both
    demandTimeFrom: z.string(),  // present in both
    demandTimeTo: z.string(),  // present in both
    sigDisconnection: z.boolean(),  // present in both
    elementarySection: z.string().optional(),  // present in both
    cautionLocationFrom: z.string().optional(),
    cautionLocationTo: z.string().optional(),
    freshCautionRequired: z.boolean().nullable(),
    freshCautionSpeed: z.number().optional(),
    freshCautionLocationFrom: z.string().optional(),
    adjacentLinesAffected: z.string().optional(),
    sigElementarySectionFrom: z.string().optional(),
    sigElementarySectionTo: z.string().optional(),
    sntDisconnectionLineFrom: z.string().optional(),
    sntDisconnectionLineTo: z.string().optional(),
    repercussions: z.string().optional(),
    assetName: z.string().optional(),
    assetNumber: z.string().optional(),
    sntDisconnectionLine: z.string().optional(),
    elementarySectionTo: z.string().optional(),
    freshCautionLocationTo: z.string().optional(),
    requestremarks: z.string().optional(),  // present in both
    selectedDepo: z.string(),  // present in both
    selectedStream: z.string(),  // present in both
    routeFrom: z.string(),  // present in both
    routeTo: z.string(),  // present in both
    powerBlockRequired: z.boolean().nullable().optional(),
    enggDisconnectionsRequired: z.boolean().nullable().optional(),
    engDisconnectionRemarks: z.string().optional(),
    engDisconnectionAssignTo: z.string().optional(),
    sntDisconnectionRequired: z.boolean().nullable().optional(),
    sntDisconnectionRequirements: z.array(z.string().optional()).optional(),  // present in both
    powerBlockRequirements: z.array(z.string().optional()).optional(),  // present in both
    powerBlockDisconnectionAssignTo: z.string().optional(),
    sntDisconnectionAssignTo: z.string().optional(),
    sigResponse: z.string().optional(),
    ohDisconnection: z.string().optional(),
    oheDisconnection: z.string().optional(),
    oheResponse: z.string().optional(),
    sigActionsNeeded: z.boolean().optional(),
    trdActionsNeeded: z.boolean().optional(),
    trdWorkLocation: z.string().optional(),
    processedLineSections: z.array(z.object({  // present in both
        block: z.string(),
        type: z.string(),
        lineName: z.string(),
        otherLines: z.string(),
        stream: z.string().optional(),
        road: z.string().optional(),
        otherRoads: z.string().optional(),
    })),
    sanctionStatus: z.enum(['YES', 'NO']).optional(),
    road: z.string().optional(),
    lineType: z.enum(['UP', 'DN', 'SL']).optional(),
    cautionDays: z.number().optional(),
    sntApprovals: z.array(z.object({
        depot: z.string(),
        status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
        approvedAt: z.string().nullable().optional(),
        remarks: z.string().optional(),
    })).optional(),
    trdApprovals: z.array(z.object({
        depot: z.string(),
        status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
        approvedAt: z.string().nullable().optional(),
        remarks: z.string().optional(),
    })).optional(),

      freshCautionFromDate: z.string().optional().nullable(),
  freshCautionToDate: z.string().optional().nullable(),
  freshCautionFromTime: z.string().optional().nullable(),
  freshCautionToTime: z.string().optional().nullable(),
});

export type UserRequestInput = z.infer<typeof userRequestSchema>;
