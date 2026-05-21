import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMyProfile, updateMyProfile } from '../api/auth.api';
import Button from '../components/Button';
import Input from '../components/Input';
import GlassCard from '../components/ui/GlassCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { validators } from '../utils/validation';

export default function Profile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
      });
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to load profile', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await updateMyProfile({
        name: formData.name.trim(),
        phone: formData.phone,
      });

      // Update localStorage
      const updatedUser = {
        ...user,
        name: response.user.name,
        phone: response.user.phone,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update profile state
      setProfile(response.user);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Failed to update profile';
      addToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      phone: profile.phone || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <SkeletonCard />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <GlassCard title="Profile" className="text-center py-8 sm:py-12">
          <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-4">Unable to load profile</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Profile</h1>
        <p className="text-xs sm:text-base text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <GlassCard>
        {/* Profile Avatar & Role */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/20">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-14 sm:w-16 h-14 sm:h-16 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold">
              {profile.name && profile.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{profile.name}</h2>
              <p className="text-xs sm:text-base text-gray-600 mt-0.5">
                {profile.role === 'ADMIN' && '👑 Administrator'}
                {profile.role === 'BARBER' && '✂️ Barber'}
                {profile.role === 'CUSTOMER' && '👤 Customer'}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              ✏️ Edit
            </Button>
          )}
        </div>

        {/* Profile Information */}
        {!isEditing ? (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-base sm:text-lg text-gray-900">{profile.name}</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <p className="text-base sm:text-lg text-gray-900">{profile.phone}</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                profile.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                profile.role === 'BARBER' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {profile.role}
              </div>
            </div>

            {profile.shop && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Associated Shop
                </label>
                <p className="text-base sm:text-lg text-gray-900">{profile.shop.name || 'Shop'}</p>
              </div>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-3 sm:space-y-5">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              error={errors.name}
              required
              disabled={isSaving}
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              error={errors.phone}
              required
              maxLength={10}
              disabled={isSaving}
            />

            <p className="text-xs sm:text-sm text-gray-500">
              ℹ️ Role cannot be changed. Contact support if needed.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/20">
            <Button
              variant="ghost"
              fullWidth
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving}
              icon="💾"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Additional Info Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Account Info */}
        <GlassCard title="Account Information" variant="subtle">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID</span>
              <span className="font-mono text-gray-900">{profile.id?.slice(-8) || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type</span>
              <span className="font-semibold text-gray-900">{profile.role}</span>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard title="Quick Actions" variant="subtle">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => navigate('/my-bookings')}
              className="justify-start"
            >
              📅 View My Bookings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => navigate('/notifications')}
              className="justify-start"
            >
              🔔 Notifications
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
