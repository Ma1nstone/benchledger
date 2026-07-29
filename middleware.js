import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// Replace this with your actual public IP address
const ALLOWED_IP = '104.28.161.159'; 

export function middleware(request: NextRequest) {
  // Extract the client's IP from Vercel's forwarding header
  const clientIp = request.headers.get('x-forwarded-for') || request.ip;

  // If the IP doesn't match, block the request
  if (clientIp !== ALLOWED_IP) {
    return new NextResponse('Access Denied: Unauthorized IP Address.', { status: 403 });
  }

  return NextResponse.next();
}

// Apply this protection to every page on your site
export const config = {
  matcher: '/:path*',
};
