import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import User from '@/models/User'; // ensure User model is registered for populate
import LeadHistory from '@/models/LeadHistory';
import { getAuthUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';
import { logHistory } from '@/lib/history';

// Scalar fields whose edits are worth recording in the pipeline history.
const TRACKED_FIELDS = [
  'name', 'email', 'phone', 'whatsapp', 'nationality',
  'service', 'freezone', 'offshoreJurisdiction', 'purpose',
  'companyName', 'businessCategory', 'businessActivity', 'businessType',
  'shareholders', 'officeSpace', 'startLocation', 'investmentRange',
  'timeline', 'expertCall',
];

export async function PUT(req, { params }) {
  await dbConnect();

  try {
    // ── AUTH + MODULE ACCESS ──
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canAccessModule(me, 'leads')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const lead = await Lead.findById(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // ── OWNERSHIP: agents may only touch their own leads ──
    if (me.role === 'agent' && String(lead.assignedTo) !== String(me._id)) {
      return NextResponse.json({ error: 'This lead is not assigned to you' }, { status: 403 });
    }

    // Assignment is managed only through /api/leads/:id/assign — never here.
    delete data.assignedTo;
    delete data.assignmentHistory;

    // ── NOTES NORMALIZATION (preserve legacy behaviour) ──
    if (data.notes !== undefined) {
      if (typeof data.notes === 'string') {
        data.notes = data.notes.trim()
          ? [{ text: data.notes.trim(), createdAt: new Date() }]
          : [];
      } else if (Array.isArray(data.notes)) {
        data.notes = data.notes
          .filter((n) => n && typeof n === 'object' && typeof n.text === 'string' && n.text.trim())
          .map((n) => ({
            text: n.text.trim(),
            createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
          }));
      } else {
        data.notes = [];
      }
    }

    // ── SNAPSHOT for diffing ──
    const prevStatus = lead.status;
    const prevNotesLen = Array.isArray(lead.notes) ? lead.notes.length : 0;
    const changedFields = [];
    for (const f of TRACKED_FIELDS) {
      if (data[f] !== undefined && String(data[f] ?? '') !== String(lead[f] ?? '')) {
        changedFields.push(f);
      }
    }

    // ── APPLY UPDATES ──
    Object.keys(data).forEach((key) => {
      lead[key] = data[key];
    });
    await lead.save();

    // ── PIPELINE HISTORY ──
    if (data.status !== undefined && data.status !== prevStatus) {
      await logHistory(lead._id, me, 'status_changed', {
        field: 'status', from: prevStatus, to: data.status,
      });
    }
    if (Array.isArray(data.notes) && data.notes.length > prevNotesLen) {
      // The UI prepends the newest note at index 0.
      const newest = data.notes[0]?.text || '';
      await logHistory(lead._id, me, 'note_added', { note: newest });
    }
    if (data.callbackDate !== undefined && data.callbackDate) {
      await logHistory(lead._id, me, 'follow_up', { to: data.callbackDate });
    }
    if (changedFields.length > 0) {
      await logHistory(lead._id, me, 'field_updated', { meta: { fields: changedFields } });
    }

    await lead.populate('assignedTo', 'name email role');
    return NextResponse.json(lead);
  } catch (error) {
    console.error('PUT ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to update lead', detail: error.message, name: error.name },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/:id  → admin only. Also removes the lead's history.
export async function DELETE(req, { params }) {
  await dbConnect();

  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') {
      return NextResponse.json({ error: 'Only an admin can delete leads' }, { status: 403 });
    }

    const { id } = await params;

    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    await LeadHistory.deleteMany({ lead: id });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error.message);
    return NextResponse.json({ error: 'Failed to delete lead', detail: error.message }, { status: 500 });
  }
}