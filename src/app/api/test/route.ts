import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: 'API route is working!' });
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ message: 'POST request received!' });
}