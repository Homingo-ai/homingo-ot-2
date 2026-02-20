import { ComplianceRule } from '@/types/compliance';
import { complianceEngine } from './ComplianceRuleEngine';

// --- SECTION A: ACCESS ---

export const Rule_EntranceLevel: ComplianceRule = {
    id: 'AHR_A_EntranceLevel',
    section: 'A',
    description: "Dwelling must be on Ground Floor or accessible by Lift or Ramp.",
    riskLevel: 'CRITICAL',
    trigger: 'STOP_ASSESSMENT',
    overrideAllowed: false,
    condition: (data: any) => {
        const level = data.external_access?.entrance_level; // or data.entranceLevel
        const lift = data.external_access?.lift_present; // or check aiReport
        const ramp = data.external_access?.ramp_present; 

        // If data structure is flat from wizard formData:
        const entranceLevel = data.entranceLevel || level;
        
        if (entranceLevel === 'Ground Floor' || entranceLevel === 'GROUND') return true;
        
        // Check for Lift or Ramp if not Ground
        // We might need to check multiple sources (formData, aiReport)
        const hasLift = lift === true || data.liftAvailable === 'Yes' || data.communalLift === 'Yes';
        const hasRamp = ramp === true || data.rampAvailable === 'Yes';

        if ((entranceLevel === 'Upper Floor' || entranceLevel === 'UPPER') && (hasLift || hasRamp)) return true;
        if ((entranceLevel === 'Basement' || entranceLevel === 'BASEMENT') && (hasLift || hasRamp)) return true;

        return false; // Fail: Upper/Basement without Lift/Ramp
    }
};

export const Rule_CommunalSteps: ComplianceRule = {
    id: 'AHR_A_CommunalSteps',
    section: 'D',
    description: "STOP if >4 steps at Communal or Property entrance.",
    riskLevel: 'CRITICAL',
    trigger: 'STOP_ASSESSMENT',
    overrideAllowed: true,
    condition: (data: any) => {
        // Check inferred/AI step counts
        // Assuming data structure allows checking both
        const steps = data.external_access?.steps?.count || data.stepCount || 0;
        return steps <= 4;
    }
};

// --- SECTION C: VERTICAL CIRCULATION ---

export const Rule_StairWidth_Straight: ComplianceRule = {
    id: 'AHR_C_StairWidth_Straight',
    section: 'C',
    description: "Straight internal stairs must be > 69.9cm wide.",
    riskLevel: 'CRITICAL',
    trigger: 'STOP_ASSESSMENT',
    overrideAllowed: true,
    condition: (data: any) => {
        const stairs = data.vertical_circulation?.internal_stairs;
        // If not straight stairs, skip this rule
        if (stairs?.geometry !== 'STRAIGHT' && data.stairType !== 'Straight') return true;

        const width = stairs?.width_cm?.[0] || data.stairWidth || 999;
        return width > 69.9;
    }
};

export const Rule_StairWidth_Curved: ComplianceRule = {
    id: 'AHR_C_StairWidth_Curved',
    section: 'C',
    description: "Curved internal stairs must be > 74.9cm wide.",
    riskLevel: 'CRITICAL',
    trigger: 'STOP_ASSESSMENT',
    overrideAllowed: true,
    condition: (data: any) => {
        const stairs = data.vertical_circulation?.internal_stairs;
        const type = stairs?.geometry || data.stairType;
        
        // If not curved, skip
        if (type === 'STRAIGHT' || type === 'Straight' || !type) return true;

        const width = stairs?.width_cm?.[0] || data.stairWidth || 999;
        return width > 74.9;
    }
};

export const Rule_InternalSteps: ComplianceRule = {
    id: 'AHR_C_InternalSplitLevel',
    section: 'E',
    description: "STOP if any internal steps (excluding main stairs).",
    riskLevel: 'CRITICAL',
    trigger: 'STOP_ASSESSMENT',
    overrideAllowed: true,
    condition: (data: any) => {
        // Check for split level or internal steps flag
        return data.vertical_circulation?.internal_levels?.has_split_level !== true && data.hasInternalSteps !== true;
    }
};

export const Rule_StairDoorClearance: ComplianceRule = {
    id: 'AHR_C_StairDoorClearance',
    section: 'C',
    description: "STOP if <70cm between stair bottom and door AND no 2nd exit.",
    riskLevel: 'CRITICAL',
    trigger: 'STOP_ASSESSMENT',
    overrideAllowed: true,
    condition: (data: any) => {
        const clearance = data.stairDoorClearance || 999;
        const hasSecondExit = data.hasSecondExit === true || data.secondExit === 'Yes';
        
        if (clearance < 70 && !hasSecondExit) return false;
        return true;
    }
};

// --- SECTION E: FACILITIES ---

export const Rule_ToiletLateralSpace: ComplianceRule = {
    id: 'AHR_E_ToiletSpace',
    section: 'E',
    description: "Toilet must have >45cm clear lateral transfer space.",
    riskLevel: 'HIGH',
    trigger: 'FLAG_RISK',
    overrideAllowed: true,
    condition: (data: any) => {
        const width = data.facilities?.toilet?.lateral_space_cm?.[0] || 999;
        return width >= 45;
    }
};

export const Rule_KitchenTurning: ComplianceRule = {
    id: 'AHR_E_KitchenTurning',
    section: 'E',
    description: "Kitchen must support 150cm turning circle.",
    riskLevel: 'MEDIUM',
    trigger: 'FLAG_RISK',
    overrideAllowed: true,
    condition: (data: any) => {
        return data.facilities?.kitchen?.turning_circle_fits === true;
    }
};

// --- REGISTRATION ---

export const registerAllRules = () => {
    complianceEngine.registerRule(Rule_EntranceLevel);
    complianceEngine.registerRule(Rule_CommunalSteps);
    complianceEngine.registerRule(Rule_StairWidth_Straight);
    complianceEngine.registerRule(Rule_StairWidth_Curved);
    complianceEngine.registerRule(Rule_InternalSteps);
    complianceEngine.registerRule(Rule_StairDoorClearance);
    complianceEngine.registerRule(Rule_ToiletLateralSpace);
    complianceEngine.registerRule(Rule_KitchenTurning);
    console.log("Enterprise Compliance Rules Registered");
};
