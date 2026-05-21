import GlassCard from './GlassCard';

const ShopClosedModal = ({ open = false, reason = '', onClose = () => {} }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="max-w-sm w-full p-4">
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg">Shop Closed</h2>
          <p className="text-sm text-gray-700 mt-2">{reason || 'This shop is closed for the selected date.'}</p>

          <button
            onClick={onClose}
            className="mt-4 w-full bg-black text-white py-2 rounded"
          >
            Okay
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default ShopClosedModal;
