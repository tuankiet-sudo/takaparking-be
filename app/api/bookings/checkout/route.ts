import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface CheckoutRequest {
  vehicle_id: string;
}

export async function PATCH(request: Request) {
  try {
    const { vehicle_id }: CheckoutRequest = await request.json();

    if (!vehicle_id) {
      return NextResponse.json({ error: 'Vehicle ID is required.' }, { status: 400 });
    }

    // Find the active booking for the given vehicle ID.
    // An active booking is one that is 'occupied' and has no end_time.
    const { data: activeBooking, error: findError } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', vehicle_id)
      .eq('status', 'occupied')
      .is('end_time', null)
      .single(); // Use .single() to expect only one record or none

    if (findError || !activeBooking) {
      console.error('Find active booking error:', findError);
      return NextResponse.json({ error: 'No active parking session found for this vehicle.' }, { status: 404 });
    }

    // If an active booking is found, update its end_time to now.
    const { data, error: updateError } = await supabase
      .from('bookings')
      .update({ end_time: new Date().toISOString() })
      .eq('id', activeBooking.id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw updateError;
    }

    return NextResponse.json({ message: 'Check-out successful.', data });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
