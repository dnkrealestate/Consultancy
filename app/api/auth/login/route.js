import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';

export async function POST(req) {
  await dbConnect();
  
  try {
    const { email, password } = await req.json();
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    // Seed default admin if it doesn't exist and the email matches the default
    if (!user && email === 'dnkrealestate2022@gmail.com') {
      const hashedPassword = await bcrypt.hash('dnk123', 10);
      user = await User.create({
        name: 'Admin',
        email: 'dnkrealestate2022@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: user._id, role: user.role });

    const response = NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
