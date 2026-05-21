import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import GlassCard from "../ui/GlassCard";
import Button from "../Button";

const GenderPreferenceModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleSelect = async (preference) => {
    try {
      setLoading(true);
      
      // Update user's gender preference
      await api.patch("/auth/update-preference", { genderPreference: preference });
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      user.genderPreference = preference;
      localStorage.setItem("user", JSON.stringify(user));
      
      setSelected(preference);
      
      // Close modal and refresh
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show filtered shops
      }, 500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update preference");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <GlassCard className="w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Preference</h2>
        <p className="text-gray-600 text-center mb-6">
          We'll show you relevant salons and barber shops
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleSelect("MALE")}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
              selected === "MALE"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-900 hover:bg-blue-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            👨 Male Barber Shops
          </button>

          <button
            onClick={() => handleSelect("FEMALE")}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
              selected === "FEMALE"
                ? "bg-pink-600 text-white"
                : "bg-pink-100 text-pink-900 hover:bg-pink-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            👩 Female Salons
          </button>

          <button
            onClick={() => handleSelect("UNISEX")}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
              selected === "UNISEX"
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-900 hover:bg-purple-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            👥 See All (Unisex)
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            Skip for Now
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Updating preference...
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default GenderPreferenceModal;
