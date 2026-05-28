import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Under Maintenance – RBMS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 520px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }
    .logo-box {
      background: #fef9c3;
      border: 3px solid #1a1a1a;
      border-radius: 12px;
      padding: 16px 24px;
      display: inline-block;
      margin-bottom: 32px;
    }
    .logo-box h1 {
      color: #7c3aed;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.3;
    }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h2 {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 14px;
      border-radius: 999px;
      margin-bottom: 20px;
    }
    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 12px;
    }
    .highlight {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 20px 0;
      text-align: left;
      font-size: 14px;
      color: #166534;
    }
    .highlight ul { padding-left: 18px; margin-top: 6px; }
    .highlight ul li { margin-bottom: 4px; }
    .time {
      font-size: 15px;
      color: #6b7280;
      margin-top: 20px;
    }
    .footer {
      margin-top: 28px;
      font-size: 13px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-box">
      <h1>Rolling Block<br/>Management System<br/>(RBMS)</h1>
    </div>
    <div class="icon">🔧</div>
    <h2>Under Maintenance</h2>
    <div class="badge">Speed Optimisation &amp; Update in Progress</div>
    <p>
      We are currently resolving the <strong>500 and 401 errors</strong> many users 
      have been experiencing during request submission.
    </p>
    <div class="highlight">
      <strong>What is being fixed:</strong>
      <ul>
        <li>500 errors during block request submission</li>
        <li>401 errors during login and session handling</li>
        <li>Server speed and response time improvements</li>
      </ul>
    </div>
    <p>These errors will be fully resolved after this update.</p>
    <div class="time">⏱ Please reload the app in <strong>30 minutes</strong>.</div>
    <div class="footer">App designed &amp; developed by Southern Railway</div>
  </div>
</body>
</html>`;

export function middleware(request: NextRequest) {
  // Allow Next.js internals to pass through
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/manifest.json' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next();
  }

  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
