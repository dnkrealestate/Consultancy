
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Lead from '@/models/Lead';
import RotationSetting from '@/models/RotationSetting';
import { getAuthUser } from '@/lib/auth';
import { ROLES, ASSIGNABLE_MODULE_KEYS } from '@/lib/permissions';

function sanitizeModules(modules) {
  if (!Array.isArray(modules)) return undefined;
  return modules.filter((m) => ASSIGNABLE_MODULE_KEYS.includes(m));
}

// PUT /api/users/:id  → update a user (admin only).
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (body.name !== undefined) user.name = body.name.trim();
    if (body.email !== undefined) {
      const email = body.email.toLowerCase().trim();
      const clash = await User.findOne({ email, _id: { $ne: id } });
      if (clash) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      user.email = email;
    }
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      user.role = body.role;
    }
    if (body.modules !== undefined) {
      const clean = sanitizeModules(body.modules) || [];
      user.modules = user.role === 'admin' ? [] : clean;
    }
    if (body.active !== undefined) {
      // Don't let an admin deactivate their own account.
      if (String(id) === String(me._id) && !body.active) {
        return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
      }
      user.active = !!body.active;
    }
    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10);
    }

    await user.save();

    const safe = user.toObject();
    delete safe.password;
    return NextResponse.json(safe);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/users/:id  → remove a user (admin only).
// Cleans up: unassigns their leads and drops them from the rotation pool.
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    if (String(id) === String(me._id)) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Release any leads this user currently owns.
    await Lead.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });

    // Remove from the rotation pool if present.
    await RotationSetting.updateOne({ key: 'global' }, { $pull: { agents: id } });

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
