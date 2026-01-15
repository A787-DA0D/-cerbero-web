import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

// Prova prima arb1, poi alchemy come fallback
const UPSTREAMS = [
  'https://arb1.arbitrum.io/rpc',
  'https://arbmainnet.g.alchemy.com/v2/aDC4vpwjv3dNkBToFUCjx',
];

async function curlPost(url: string, body: string): Promise<{ status: number; text: string }> {
  // -sS silent but show errors, -m timeout seconds
  const { stdout } = await execFileAsync('curl', [
    '-sS',
    '-m', '20',
    '-X', 'POST',
    url,
    '-H', 'content-type: application/json',
    '--data-binary', body,
  ]);
  // curl non ci dà status facilmente senza -w; assumiamo 200 se ritorna JSON
  return { status: 200, text: stdout };
}

export async function POST(req: Request) {
  const body = await req.text();

  let lastErr: any = null;

  for (const url of UPSTREAMS) {
    try {
      const r = await curlPost(url, body);
      return new NextResponse(r.text, {
        status: r.status,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      });
    } catch (e: any) {
      lastErr = e;
    }
  }

  return NextResponse.json(
    { error: 'RPC_PROXY_ERROR', message: lastErr?.message || String(lastErr) },
    { status: 502 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}
