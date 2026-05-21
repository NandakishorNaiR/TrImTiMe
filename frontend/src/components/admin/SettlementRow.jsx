import React from "react";

const SettlementRow = ({ settlement, onPaid }) => {
  const {
    _id,
    shop,
    date,
    onlineCollected,
    codAdjusted,
    netPayout,
    status,
  } = settlement;

  return (
    <div className="border rounded-xl p-4 mb-3 flex justify-between items-center">
      <div>
        <p className="font-semibold">{shop?.name || "—"}</p>
        <p className="text-xs text-gray-500">{date}</p>

        <p className="text-xs mt-1">
          Online ₹{onlineCollected} − COD ₹{codAdjusted}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-lg">₹{netPayout}</p>

        {status === "PENDING" ? (
          <button
            onClick={() => onPaid(_id)}
            className="mt-1 text-xs bg-black text-white px-3 py-1 rounded"
          >
            Mark Paid
          </button>
        ) : (
          <span className="text-xs text-green-600">PAID</span>
        )}
      </div>
    </div>
  );
};

export default SettlementRow;
