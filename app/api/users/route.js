import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { ROLES, ASSIGNABLE_MODULE_KEYS, DEFAULT_MODULES_BY_ROLE } from '@/lib/permissions';

// Keep only known, assignable module keys.
function sanitizeModules(modules) {
  if (!Array.isArray(modules)) return undefined;
  return modules.filter((m) => ASSIGNABLE_MODULE_KEYS.includes(m));
}

// GET /api/users  → list all users (admin only). Optional ?role= filter.
export async function GET(req) {
  try {
    await dbConnect();
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const role = req.nextUrl.searchParams.get('role');
    const query = role ? { role } : {};

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load users' },
      { status: 500 }
    );
  }
}

// POST /api/users  → create a user (admin only).
export async function POST(req) {
  try {
    await dbConnect();
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, email, password, role, modules, active } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (role && !ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const finalRole = role || 'agent';
    const cleanModules = sanitizeModules(modules);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: finalRole,
      modules:
        finalRole === 'admin'
          ? []
          : cleanModules && cleanModules.length
          ? cleanModules
          : DEFAULT_MODULES_BY_ROLE[finalRole] || [],
      active: active !== undefined ? !!active : true,
    });

    const safe = user.toObject();
    delete safe.password;
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    console.error('POST /api/users error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
