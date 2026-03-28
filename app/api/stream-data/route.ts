import { NextResponse } from 'next/server';

interface StreamEvent {
  type: 'connected' | 'stats' | 'heartbeat' | 'error' | 'complete';
  data?: Record<string, unknown>;
  timestamp: number;
}

interface Client {
  id: string;
  controller: ReadableStreamDefaultController;
}

const CLIENTS = new Map<string, ReadableStreamDefaultController>();
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

function createHeartbeat() {
  if (heartbeatInterval) return;

  heartbeatInterval = setInterval(() => {
    const event: StreamEvent = {
      type: 'heartbeat',
      timestamp: Date.now()
    };
    broadcast(JSON.stringify(event));
  }, 15000);
}

function broadcast(data: string) {
  CLIENTS.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
    } catch {
      console.error('[StreamData] Failed to send to client');
    }
  });
}

function getMockStats() {
  const productiveTime = Math.floor(Math.random() * 300) + 60;
  const unproductiveTime = Math.floor(Math.random() * 120) + 20;
  const neutralTime = Math.floor(Math.random() * 60) + 10;
  const tabSwitches = Math.floor(Math.random() * 50) + 5;

  return {
    productiveTime,
    unproductiveTime,
    neutralTime,
    tabSwitches,
    lastUpdate: Date.now(),
    source: 'live-stream'
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') || `client-${Date.now()}`;

  console.log(`[StreamData] Client connected: ${clientId}`);

  const stream = new ReadableStream({
    start(controller) {
      CLIENTS.set(clientId, controller);

      const initEvent: StreamEvent = {
        type: 'connected',
        data: { clientId, message: 'Connected to live stream' },
        timestamp: Date.now()
      };
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initEvent)}\n\n`));

      const statsEvent: StreamEvent = {
        type: 'stats',
        data: getMockStats(),
        timestamp: Date.now()
      };
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(statsEvent)}\n\n`));

      createHeartbeat();

      console.log(`[StreamData] Total clients: ${CLIENTS.size}`);
    },
    cancel() {
      CLIENTS.delete(clientId);
      console.log(`[StreamData] Client disconnected: ${clientId}`);
      if (CLIENTS.size === 0 && heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'broadcast') {
      const event: StreamEvent = {
        type: body.type || 'stats',
        data: body.data,
        timestamp: Date.now()
      };
      broadcast(JSON.stringify(event));
      return NextResponse.json({ success: true, clients: CLIENTS.size });
    }

    if (body.action === 'stats') {
      const event: StreamEvent = {
        type: 'stats',
        data: body.data || getMockStats(),
        timestamp: Date.now()
      };
      broadcast(JSON.stringify(event));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
