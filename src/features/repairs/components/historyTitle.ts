// Its own module, so the client FocusAfterDelete can use it without pulling
// in RepairHistory, which reads the database.

/**
 * The "Ιστορικό επισκευών" heading's id, focusable from script. Includes the
 * car's id, because Next can keep another car's page in the document, hidden.
 */
export function historyTitleId(vehicleId: string): string {
  return `history-title-${vehicleId}`;
}
