import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetTimeStr = searchParams.get('time');

  if (!targetTimeStr) {
    return NextResponse.json({ error: 'A target time is required.' }, { status: 400 });
  }

  const targetTime = new Date(targetTimeStr).toISOString();

  try {
    // Use a Supabase RPC (Remote Procedure Call) for complex logic.
    // This is more efficient than fetching all data and processing in JS.
    // We will create this function in the Supabase SQL editor next.
    const { data, error } = await supabase.rpc('get_slot_statuses_at_time', {
      target_time: targetTime
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
