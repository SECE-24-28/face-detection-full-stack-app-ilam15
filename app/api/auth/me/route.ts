import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized session' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Log out user by clearing cookie
export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.headers.append(
    'Set-Cookie',
    `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; ${
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    }`
  );
  
  return response;
}
