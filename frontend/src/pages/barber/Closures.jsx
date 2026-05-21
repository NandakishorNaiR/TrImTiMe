import { useEffect, useState } from "react";
import { getClosures, addClosure } from "../../api/barber.api";

const Closures = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getClosures();
        setList(res || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const add = async () => {
    if (!date) return alert('Select a date');
    try {
      const res = await addClosure({ date, reason });
      alert(`${res.affected || 0} bookings refunded`);
      setList((l) => [...l, { date, reason }]);
      setDate(''); setReason('');
    } catch (e) {
      console.error(e);
      alert('Failed to add closure');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Shop Closures</h1>

      <input
        type="date"
        className="input"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <input
        className="input mt-2"
        placeholder="Reason (optional)"
        value={reason}
        onChange={e => setReason(e.target.value)}
      />

      <button
        onClick={add}
        className="mt-3 w-full bg-black text-white py-2 rounded"
      >
        Mark Closed
      </button>

      <div className="mt-6">
        {list.map((c, i) => (
          <div key={i} className="border p-2 rounded mb-2">
            <p className="font-medium">{new Date(c.date).toDateString()}</p>
            <p className="text-sm text-gray-500">{c.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Closures;
