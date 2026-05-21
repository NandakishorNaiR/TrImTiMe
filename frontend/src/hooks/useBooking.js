import { useState } from 'react';
export default function useBooking() { const [booking, setBooking] = useState(null); return { booking, setBooking }; }