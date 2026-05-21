import { useState } from 'react';
export default function usePayment() { const [status, setStatus] = useState(null); return { status, setStatus }; }