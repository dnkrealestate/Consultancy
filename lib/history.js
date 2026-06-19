import LeadHistory from '../models/LeadHistory';

// Record a single pipeline activity for a lead. Best-effort: history
// logging must never break the primary action, so failures are swallowed.
export async function logHistory(leadId, actor, action, extra = {}) {
  try {
    await LeadHistory.create({
      lead: leadId,
      actor: actor?._id || null,
      actorName: actor?.name || 'System',
      action,
      field: extra.field || '',
      from: extra.from ?? null,
      to: extra.to ?? null,
      note: extra.note || '',
      meta: extra.meta ?? null,
    });
  } catch (err) {
    console.error('logHistory failed:', err.message);
  }
}
