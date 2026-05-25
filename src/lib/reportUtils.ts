/**
 * lib/reportUtils.ts — Display Utility Functions
 *
 * Pure logic functions for converting raw DB values into human-readable
 * UI output. No database calls.
 *
 * Safe to use in both server and client components.
 * Single source of truth for status colours, labels, and masking logic.
 *
 * Functions:
 * - getStatusDisplay(...)         Returns colour, label and text colour based on resident
 *                                 and responder status. Responder status overrides resident.
 *                                 Deceased is masked as "Help is on the way" for family.
 * - getResourceLabel(value)       Maps DB resource request values to human-readable labels
 * - getResponderStatusDisplay(...) Returns responder status label, masking deceased for family
 */

// Centralized display logic for status colours
// Used in dashboard, confirmation page and unit
// detail view for all roles
export function getStatusDisplay(
  residentStatus: string | null,
  resourceRequests: string[],
  responderStatus?: string | null,
  isResponder?: boolean
): { colour: string; label: string; textColour: string } {

  // No report yet
  if (!residentStatus) {
    return { colour: "#CBD5E1", label: "No report yet", textColour: "#1E293B" }
  }

  // Responder overrides
  if (responderStatus) {
    if (responderStatus === "evacuated") {
      return { colour: "#16A34A", label: "Confirmed evacuated", textColour: "#ffffff" }
    }
    if (responderStatus === "in_progress" && isResponder) {
      const label = residentStatus === "emergency" ? "Critical — In progress" : "In progress"
      return { colour: "#EA580C", label, textColour: "#ffffff" }
    }
    if (responderStatus === "in_progress" && !isResponder) {
      const label = residentStatus === "emergency" ? "Critical — Help is on the way" : "Help is on the way"
      return { colour: "#EA580C", label, textColour: "#ffffff" }
    }
    if (responderStatus === "deceased" && isResponder) {
      return { colour: "#374151", label: "Deceased", textColour: "#ffffff" }
    }
    // Deceased masked as "Help is on the way" for family
    if (responderStatus === "deceased" && !isResponder) {
      const label = residentStatus === "emergency" ? "Critical — Help is on the way" : "Help is on the way"
      return { colour: "#EA580C", label, textColour: "#ffffff" }
    }
  }

  // Resident status
  // Blue when evacuated but pet still inside
  if (residentStatus === "evacuated" && resourceRequests.includes("pet")) {
    return { colour: "#2563EB", label: "Evacuated — Pet rescue required", textColour: "#ffffff" }
  }
  if (residentStatus === "evacuated") return { colour: "#16A34A", label: "Evacuated", textColour: "#ffffff" }
  if (residentStatus === "assistance") return { colour: "#F59E0B", label: "Needs assistance", textColour: "#1C1917" }
  return { colour: "#DC2626", label: "Critical", textColour: "#ffffff" }
}

const resourceLabels: Record<string, string> = {
  mobility: "Mobility assistance",
  pet: "Pet evacuation",
  medical: "Medical assistance",
};

export function getResourceLabel(value: string): string {
  return resourceLabels[value] ?? value;
}

export function getResponderStatusDisplay(
  status: string | null,
  isResponder: boolean
): string {
  if (!status) return "Not yet attended";
  if (status === "deceased" && !isResponder) return "In progress";
  if (status === "in_progress") return "In progress";
  if (status === "evacuated") return "Evacuated";
  if (status === "deceased") return "Deceased";
  return status;
}
