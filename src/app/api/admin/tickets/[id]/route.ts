import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET ticket' });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ message: 'PUT ticket' });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'DELETE ticket' });
}
