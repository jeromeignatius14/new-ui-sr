/**
 * Site Location Input Validation Feature
 * Pattern: xxx/yyy where xxx is numeric (max 3) and yyy is alphanumeric (max 4)
 */

import { siteLocationRanges, siteLocationDepotMapping, type SiteLocationRanges } from '../../../../lib/store';

export interface SiteLocationValidation {
  isValid: boolean;
  formattedValue: string;
  error?: string;
}

export interface SiteLocationRangeInfo {
  min: number;
  max: number;
  displayText: string;
}

/**
 * Gets the site location range for given major section, block sections, and department
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @param department - The user's department
 * @returns SiteLocationRangeInfo object with min, max, and display text
 */
export const getSiteLocationRange = (
  majorSection: string,
  blockSections: string[],
  department: string
): SiteLocationRangeInfo => {
  if (!majorSection || !blockSections.length || !department) {
    return {
      min: 0,
      max: 999,
      displayText: "Select section and department to see range"
    };
  }

  const majorSectionData = siteLocationRanges[majorSection];
  if (!majorSectionData) {
    return {
      min: 0,
      max: 999,
      displayText: "No range data available for this section"
    };
  }

  let overallMin = Infinity;
  let overallMax = -Infinity;
  let validRangesFound = false;

  // Check each selected block section
  for (const blockSection of blockSections) {
    const blockData = majorSectionData[blockSection];
    if (blockData && blockData[department as keyof typeof blockData]) {
      const range = blockData[department as keyof typeof blockData];
      if (range.min !== 0 || range.max !== 0) { // Skip 0,0 ranges (no data)
        overallMin = Math.min(overallMin, range.min);
        overallMax = Math.max(overallMax, range.max);
        validRangesFound = true;
      }
    }
  }

  if (!validRangesFound) {
    return {
      min: 0,
      max: 999,
      displayText: `No range data available for ${department} in selected sections`
    };
  }

  return {
    min: overallMin,
    max: overallMax,
    displayText: `Valid range: ${overallMin} - ${overallMax}`
  };
};

/**
 * Validates site location range against department and section constraints
 * @param value - The site location value (xxx/yyy format)
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @param department - The user's department
 * @returns Validation result
 */
export const validateSiteLocationRange = (
  value: string,
  majorSection: string,
  blockSections: string[],
  department: string
): { isValid: boolean; error?: string } => {
  if (!value || !value.includes("/")) {
    return { isValid: true }; // Let basic validation handle incomplete values
  }

  const parts = value.split("/");
  const numericPart = parseInt(parts[0], 10);

  if (isNaN(numericPart)) {
    return { isValid: true }; // Let basic validation handle invalid format
  }

  const range = getSiteLocationRange(majorSection, blockSections, department);
  
  // Skip validation if no valid range data
  if (range.min === 0 && range.max === 999) {
    return { isValid: true };
  }

  if (numericPart < range.min || numericPart > range.max) {
    return {
      isValid: false,
      error: `Not in range`
    };
  }

  return { isValid: true };
};

/**
 * Validates that "From" value is less than "To" value
 * @param fromValue - The "from" site location value
 * @param toValue - The "to" site location value
 * @returns Validation result
 */
export const validateSiteLocationFromTo = (
  fromValue: string,
  toValue: string
): { isValid: boolean; error?: string } => {
  if (!fromValue || !toValue || !fromValue.includes("/") || !toValue.includes("/")) {
    return { isValid: true }; // Skip validation if incomplete
  }

  const fromParts = fromValue.split("/");
  const toParts = toValue.split("/");
  const fromNumeric = parseInt(fromParts[0], 10);
  const toNumeric = parseInt(toParts[0], 10);

  if (isNaN(fromNumeric) || isNaN(toNumeric)) {
    return { isValid: true }; // Let basic validation handle invalid format
  }

  if (fromNumeric >= toNumeric) {
    return {
      isValid: false,
      error: "Invalid value"
    };
  }

  return { isValid: true };
};

/**
 * Validates and formats site location input according to xxx/yyy pattern
 * @param value - The input value to validate and format
 * @param prevValue - The previous value to determine if we should auto-add slash
 * @param majorSection - The selected major section (optional for range validation)
 * @param blockSections - Array of selected block sections (optional for range validation)
 * @param department - The user's department (optional for range validation)
 * @returns SiteLocationValidation object with validation result and formatted value
 */
export const validateSiteLocation = (
  value: string,
  prevValue: string = "",
  majorSection?: string,
  blockSections?: string[],
  department?: string
): SiteLocationValidation => {
  // Remove any characters that aren't alphanumeric or slash
  let cleanValue = value.replace(/[^0-9a-zA-Z/]/g, "");
  
  // Count slashes to ensure only one is allowed
  const slashCount = (cleanValue.match(/\//g) || []).length;
  if (slashCount > 1) {
    // Remove extra slashes, keep only the first one
    const firstSlashIndex = cleanValue.indexOf("/");
    cleanValue = cleanValue.substring(0, firstSlashIndex + 1) + 
                 cleanValue.substring(firstSlashIndex + 1).replace(/\//g, "");
  }
  
  const parts = cleanValue.split("/");
  let beforeSlash = parts[0] || "";
  let afterSlash = parts[1] || "";
  
  // Validate and format the part before slash (numeric only, max 3)
  beforeSlash = beforeSlash.replace(/[^0-9]/g, ""); // Only numeric
  if (beforeSlash.length > 3) {
    beforeSlash = beforeSlash.substring(0, 3);
  }
  
  // Auto-add slash when beforeSlash reaches 3 characters and we're typing forward
  const shouldAutoAddSlash = beforeSlash.length === 3 && 
                            cleanValue.length > prevValue.length && 
                            !cleanValue.includes("/");
  
  // Validate and format the part after slash (alphanumeric, max 4)
  if (afterSlash) {
    afterSlash = afterSlash.replace(/[^0-9a-zA-Z]/g, ""); // Only alphanumeric
    if (afterSlash.length > 4) {
      afterSlash = afterSlash.substring(0, 4);
    }
  }
  
  // Construct the formatted value
  let formattedValue = beforeSlash;
  if (shouldAutoAddSlash || cleanValue.includes("/") || afterSlash) {
    formattedValue += "/" + afterSlash;
  }
  
  // Validation rules
  const basicValidation = validatePattern(formattedValue);
  let isValid = basicValidation;
  let error: string | undefined;

  if (!basicValidation) {
    error = getValidationError(formattedValue);
  } else if (majorSection && blockSections && department) {
    // Additional range validation if context is provided
    const rangeValidation = validateSiteLocationRange(
      formattedValue,
      majorSection,
      blockSections,
      department
    );
    if (!rangeValidation.isValid) {
      isValid = false;
      error = rangeValidation.error;
    }
  }

  return {
    isValid,
    formattedValue,
    error
  };
};

/**
 * Validates if the site location follows the correct pattern
 * @param value - The value to validate
 * @returns boolean indicating if the pattern is valid
 */
const validatePattern = (value: string): boolean => {
  if (!value) return false;
  
  // If no slash, check if it's a valid numeric prefix (1-3 digits)
  if (!value.includes("/")) {
    return /^[0-9]{1,3}$/.test(value);
  }
  
  // If slash exists, validate full pattern
  const parts = value.split("/");
  if (parts.length !== 2) return false;
  
  const beforeSlash = parts[0];
  const afterSlash = parts[1];
  
  // Before slash: numeric, 1-3 characters
  const beforeSlashValid = /^[0-9]{1,3}$/.test(beforeSlash);
  
  // After slash: alphanumeric, 1-4 characters (empty is allowed for incomplete input)
  const afterSlashValid = afterSlash === "" || /^[0-9a-zA-Z]{1,4}$/.test(afterSlash);
  
  return beforeSlashValid && afterSlashValid;
};

/**
 * Gets appropriate error message for invalid input
 * @param value - The invalid value
 * @returns Error message string
 */
const getValidationError = (value: string): string => {
  if (!value) {
    return "Site location is required";
  }
  
  if (!value.includes("/")) {
    if (!/^[0-9]+$/.test(value)) {
      return "First part must be numeric only";
    }
    if (value.length > 3) {
      return "First part must be maximum 3 digits";
    }
    return "Invalid format. Use pattern: xxx/yyy";
  }
  
  const parts = value.split("/");
  if (parts.length > 2) {
    return "Only one slash (/) is allowed";
  }
  
  const beforeSlash = parts[0];
  const afterSlash = parts[1];
  
  if (!/^[0-9]{1,3}$/.test(beforeSlash)) {
    return "Before slash must be numeric";
  }
  
  if (afterSlash && !/^[0-9a-zA-Z]{1,4}$/.test(afterSlash)) {
    return "After slash must be alphanumeric";
  }
  
  return "Valid pattern: xxx/yyy";
};

/**
 * Creates an onChange handler for site location inputs
 * @param fieldName - The name of the form field
 * @param formData - Current form data
 * @param handleInputChange - The form's input change handler
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @param department - The user's department
 * @returns onChange event handler function
 */
export const createSiteLocationChangeHandler = (
  fieldName: string,
  formData: any,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  majorSection?: string,
  blockSections?: string[],
  department?: string
) => {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prevValue = formData[fieldName] || "";
    
    const validation = validateSiteLocation(
      value, 
      prevValue, 
      majorSection, 
      blockSections, 
      department
    );
    
    // Call the original handler with the formatted value
    handleInputChange({
      target: {
        name: fieldName,
        value: validation.formattedValue,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };
};

/**
 * Validates if a complete site location is properly formatted
 * @param value - The complete site location value
 * @returns boolean indicating if it's complete and valid
 */
export const isCompleteSiteLocation = (value: string): boolean => {
  if (!value || !value.includes("/")) return false;
  
  const parts = value.split("/");
  if (parts.length !== 2) return false;
  
  const beforeSlash = parts[0];
  const afterSlash = parts[1];
  
  return /^[0-9]{1,3}$/.test(beforeSlash) && /^[0-9a-zA-Z]{1,4}$/.test(afterSlash);
};

/**
 * Gets auto-assigned depot string for a specific department
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @param department - The department ("S&T" or "TRD")
 * @returns Comma-separated string of depot codes or empty string if none available
 */
export const getAutoAssignedDepots = (
  majorSection: string,
  blockSections: string[],
  department: "S&T" | "TRD"
): string => {
  const depots = getAvailableDepots(majorSection, blockSections, department);
  return depots.join(", ");
};

/**
 * Gets available depot options for a specific department based on selected block sections
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @param department - The department ("S&T" or "TRD")
 * @returns Array of unique depot codes
 */
export const getAvailableDepots = (
  majorSection: string,
  blockSections: string[],
  department: "S&T" | "TRD"
): string[] => {
  if (!majorSection || !blockSections.length || !department) {
    return [];
  }

  const majorSectionMapping = siteLocationDepotMapping[majorSection];
  if (!majorSectionMapping) {
    return [];
  }

  const availableDepots = new Set<string>();

  // Check each selected block section for depot assignments
  for (const blockSection of blockSections) {
    const blockMapping = majorSectionMapping[blockSection];
    if (blockMapping && blockMapping[department]) {
      availableDepots.add(blockMapping[department]!);
    }
  }

  return Array.from(availableDepots).sort();
};

/**
 * Gets all available depots for both S&T and TRD based on selected block sections
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @returns Object with S&T and TRD depot arrays
 */
export const getAllAvailableDepots = (
  majorSection: string,
  blockSections: string[]
): {
  "S&T": string[];
  "TRD": string[];
} => {
  return {
    "S&T": getAvailableDepots(majorSection, blockSections, "S&T"),
    "TRD": getAvailableDepots(majorSection, blockSections, "TRD")
  };
};

/**
 * Validates both from and to site location values with range and order validation
 * @param fromValue - The "from" site location value
 * @param toValue - The "to" site location value
 * @param majorSection - The selected major section
 * @param blockSections - Array of selected block sections
 * @param department - The user's department
 * @returns Combined validation result for both fields
 */
export const validateSiteLocationPair = (
  fromValue: string,
  toValue: string,
  majorSection: string,
  blockSections: string[],
  department: string
): {
  fromValid: boolean;
  toValid: boolean;
  fromError?: string;
  toError?: string;
  pairError?: string;
} => {
  // Validate individual values
  const fromValidation = validateSiteLocation(fromValue, "", majorSection, blockSections, department);
  const toValidation = validateSiteLocation(toValue, "", majorSection, blockSections, department);
  
  // Validate from < to relationship
  const fromToValidation = validateSiteLocationFromTo(fromValue, toValue);
  
  return {
    fromValid: fromValidation.isValid && fromToValidation.isValid,
    toValid: toValidation.isValid && fromToValidation.isValid,
    fromError: fromValidation.error,
    toError: toValidation.error,
    pairError: fromToValidation.error
  };
};
