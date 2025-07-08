import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface BookingRequest {
  slot_id: number;
  status: 'booked' | 'occupied';
  start_time: string; // ISO 8601 format from client
  vehicle_id?: string;
}

export async function POST(request: Request) {
  try {
    const newBookings: BookingRequest[] = await request.json();

    if (!Array.isArray(newBookings) || newBookings.length === 0) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    // Process bookings to set the correct end_time
    const processedBookings = newBookings.map(booking => {
      const startTime = new Date(booking.start_time);
      let endTime: string | null = null;

      if (booking.status === 'booked') {
        // For 'booked' status, end_time is 15 minutes after start_time
        endTime = new Date(startTime.getTime() + 15 * 60 * 1000).toISOString();
      }
      // For 'occupied' status, end_time remains null

      return {
        slot_id: booking.slot_id,
        status: booking.status,
        start_time: booking.start_time,
        end_time: endTime,
        vehicle_id: booking.vehicle_id
      };
    });

    const { data, error } = await supabase
      .from('bookings')
      .insert(processedBookings)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 409 }); 
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
