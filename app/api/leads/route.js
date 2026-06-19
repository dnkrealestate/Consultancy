// app/api/leads/route.js  (GET + POST)
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import User from '@/models/User'; // ensure User model is registered for populate
import nodemailer from 'nodemailer';
import { getAuthUser } from '@/lib/auth';
import { canAccessModule, canSeeAllLeads } from '@/lib/permissions';
import { assignViaRotation } from '@/lib/rotation';
import { logHistory } from '@/lib/history';

// GET /api/leads
// Role-scoped: agents see only the leads assigned to them; admin and
// back-office (lead coordinators) see the whole pipeline.
export async function GET(req) {
  try {
    await connectDB();

    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canAccessModule(me, 'leads')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query = canSeeAllLeads(me) ? {} : { assignedTo: me._id };

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    return NextResponse.json(leads);
  } catch (error) {
    console.log('GET ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Normalize status: capitalise first letter, lowercase the rest
// e.g. 'new' → 'New', 'CONTACTED' → 'Contacted'
function normalizeStatus(raw) {
  const VALID = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];
  if (!raw) return 'New';
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return VALID.includes(capitalized) ? capitalized : 'New';
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("REQUEST BODY RECEIVED:", body);

    const {
      // Basic
      name,
      email,
      phone,
      whatsapp,

      // Service / source tracking
      service,
      freezone,
      offshoreJurisdiction,
      purpose,

      // Business info
      companyName,
      businessCategory,
      businessActivity,
      shareholders,
      officeSpace,
      expertCall,
      startLocation,
      nationality,
      timeline,

      // Backward compat
      businessType,
      investmentRange,

      // Multi-service
      services,

      // Misc
      callbackDate,
      status,
    } = body;

    // Migrate legacy string notes → array format
    let notes = [];
    if (Array.isArray(body.notes)) {
      notes = body.notes;
    } else if (typeof body.notes === 'string' && body.notes.trim()) {
      notes = [{ text: body.notes.trim(), createdAt: new Date() }];
    }

    // Resolve ownership: an explicit assignee (admin manual create) wins;
    // otherwise fall back to automatic lead-rotation when it is enabled.
    const actor = await getAuthUser(req);
    let assignedTo = body.assignedTo || null;
    let assignMethod = assignedTo ? 'manual' : null;
    if (!assignedTo) {
      const rotated = await assignViaRotation();
      if (rotated) {
        assignedTo = rotated;
        assignMethod = 'rotation';
      }
    }
    const assignmentHistory = assignedTo
      ? [{ agent: assignedTo, assignedBy: actor?._id || null, method: assignMethod, assignedAt: new Date() }]
      : [];

    const lead = await Lead.create({
      // Basic
      name:                 name?.trim(),
      email:                email?.trim().toLowerCase(),
      phone:                phone?.trim(),
      whatsapp:             whatsapp || '',

      // Service tracking
      service:              service || '',
      freezone:             freezone || '',
      offshoreJurisdiction: offshoreJurisdiction || '',
      purpose:              purpose || '',

      // Business info
      companyName:          companyName || '',
      businessCategory:     businessCategory || '',
      businessActivity:     businessActivity || '',
      shareholders:         shareholders || '',
      officeSpace:          officeSpace || '',
      expertCall:           expertCall || '',
      startLocation:        startLocation || '',
      nationality:          nationality || '',
      timeline:             timeline || '',

      // Backward compat
      businessType:         businessType || '',
      investmentRange:      investmentRange || '',

      // Multi-service
      services:             Array.isArray(services) ? services : [],

      // Misc
      notes,
      ...(callbackDate && { callbackDate: new Date(callbackDate) }),
      // ← FIX: normalize status before saving so 'new' → 'New' etc.
      status: normalizeStatus(status),

      // Ownership
      assignedTo,
      assignmentHistory,
    });

    // ── Pipeline history: record creation, then assignment if any ──
    await logHistory(lead._id, actor, 'created', {
      meta: { source: actor ? 'manual' : 'public_form', service: lead.service || '' },
    });
    if (assignedTo) {
      await logHistory(lead._id, actor, 'assigned', {
        to: String(assignedTo),
        meta: { method: assignMethod },
      });
    }

    console.log("LEAD SUCCESSFULLY STORED:", lead);

    // ── Email notifications ──
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        // ── Helper: render a table row, hiding it when value is empty
        const row = (label, value) =>
          value
            ? `<tr>
                <td style="padding:6px 0;font-weight:600;color:#475569;width:40%;vertical-align:top;">${label}</td>
                <td style="padding:6px 0;color:#1e293b;">${value}</td>
               </tr>`
            : '';

        // ── Helper: section header
        const section = (title) =>
          `<tr><td colspan="2" style="padding:18px 0 6px;">
             <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#0d9488;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">${title}</div>
           </td></tr>`;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'dnkrealestate2022@gmail.com',
          subject: `🔥 New Lead: ${name}${service ? ` — ${service}` : ''}`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;max-width:640px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

              <!-- Header -->
              <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:24px 28px;">
                <h2 style="color:white;margin:0;font-size:20px;font-weight:800;">🔥 New Business Setup Lead</h2>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">
                  Submitted ${new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>

              <!-- Body -->
              <div style="padding:24px 28px;">
                <table style="width:100%;border-collapse:collapse;">

                  ${section('Contact Details')}
                  ${row('Name',        name)}
                  ${row('Email',       email)}
                  ${row('Phone',       phone)}
                  ${row('WhatsApp',    whatsapp)}
                  ${row('Nationality', nationality)}

                  ${section('Service & Source')}
                  ${row('Service',              service)}
                  ${row('Free Zone',            freezone)}
                  ${row('Offshore Jurisdiction',offshoreJurisdiction)}
                  ${row('Purpose',              purpose)}

                  ${section('Business Details')}
                  ${row('Company Name',      companyName)}
                  ${row('Business Category', businessCategory)}
                  ${row('Business Activity', businessActivity)}
                  ${row('Business Type',     businessType)}
                  ${row('Shareholders',      shareholders)}
                  ${row('Office Space',      officeSpace)}
                  ${row('Preferred Location',startLocation)}
                  ${row('Investment Range',  investmentRange)}
                  ${row('Timeline',          timeline)}
                  ${row('Expert Call',       expertCall)}
                  ${Array.isArray(services) && services.length ? row('Other Services', services.join(', ')) : ''}
                  ${callbackDate ? row('Callback Date', new Date(callbackDate).toLocaleDateString('en-GB', { dateStyle: 'long' })) : ''}

                  ${section('CRM')}
                  ${row('Status', normalizeStatus(status))}

                </table>
              </div>

              <!-- Footer -->
              <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 28px;font-size:11px;color:#94a3b8;">
                DNK Consultancy · CRM System · This is an automated notification
              </div>
            </div>`,
        });

        // ── Confirmation email to the lead ──
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your DNK Consultancy Business Setup Enquiry",
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;max-width:580px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">

              <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:24px 28px;">
                <h2 style="color:white;margin:0;font-size:20px;font-weight:800;">Thank You, ${name}!</h2>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">We've received your business setup enquiry.</p>
              </div>

              <div style="padding:28px;">
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  Thank you for reaching out to <strong>DNK Consultancy</strong>.
                  ${service ? `We received your enquiry for <strong>${service}</strong>${businessActivity ? ` in the <strong>${businessActivity}</strong> sector` : ''}.` : ''}
                  ${startLocation ? `Your preferred location is <strong>${startLocation}</strong>.` : ''}
                </p>

                <div style="background:#f0fdf9;border:1px solid #99f6e4;border-radius:10px;padding:16px 20px;margin:20px 0;">
                  <p style="margin:0;font-size:14px;color:#0f766e;font-weight:600;">⏱ What happens next?</p>
                  <p style="margin:8px 0 0;font-size:14px;color:#0d9488;line-height:1.6;">
                    One of our dedicated setup specialists will review your profile and reach out within <strong>24 hours</strong>
                    ${phone ? ` at <strong>${phone}</strong>` : ''}.
                  </p>
                </div>

                <p style="margin:0;font-size:13px;color:#64748b;">
                  In the meantime, feel free to reply to this email or WhatsApp us if you have any immediate questions.
                </p>
              </div>

              <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;">
                <p style="margin:0;font-size:13px;color:#475569;font-weight:600;">Best Regards,</p>
                <p style="margin:4px 0 0;font-size:13px;color:#0d9488;font-weight:800;">DNK Consultancy Team</p>
              </div>
            </div>`,
        });

        console.log("EMAIL NOTIFICATIONS DISPATCHED SUCCESSFULLY");
      } else {
        console.log("EMAIL ENV VARIABLES MISSING - SKIPPED");
      }
    } catch (mailError) {
      console.log("EMAIL SYSTEM ERROR:", mailError);
    }

    return NextResponse.json(lead, { status: 201 });

  } catch (error) {
    console.log("CREATE LEAD CRITICAL ERROR:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}