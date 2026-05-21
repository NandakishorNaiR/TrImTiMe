import React, { useEffect, useState } from 'react';
import { getClosureImpact } from '../../api/barber.api';

export default function ClosureImpactPreview({ date }) {
    const [loading, setLoading] = useState(false);
    const [impact, setImpact] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!date) return;
        setLoading(true);
        setError(null);
        getClosureImpact(date)
            .then(data => setImpact(data))
            .catch(err => setError(err?.message || 'Failed'))
            .finally(() => setLoading(false));
    }, [date]);

    if (!date) return null;
    if (loading) return <div className="p-2">Loading impact preview...</div>;
    if (error) return <div className="p-2 text-red-500">{error}</div>;
    if (!impact) return null;

    return (
        <div className="p-3 bg-gray-50 border rounded mt-2">
            <div className="text-sm text-gray-700">Estimated impact for {date}:</div>
            <div className="mt-2 flex gap-4 text-sm">
                <div><strong>Total bookings:</strong> {impact.totalBookings}</div>
                <div><strong>Online collected:</strong> ₹{impact.onlineCollected || 0}</div>
                <div><strong>COD bookings:</strong> {impact.codBookings} ({impact.codValue || 0})</div>
            </div>
            <div className="mt-2 text-sm font-semibold">Estimated earnings lost: ₹{impact.earningsLost || 0}</div>
        </div>
    );
}
