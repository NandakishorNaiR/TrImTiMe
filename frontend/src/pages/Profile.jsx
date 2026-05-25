import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMyProfile, updateMyProfile } from '../api/auth.api';
import { Card, CardHeader, CardTitle, CardBody, CardFooter, Input, Button, Alert, Badge } from '../components/ui';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-spin">⏳</div>
          <p className="text-body text-neutral-600">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Alert variant="error" title="Error" message="Failed to load profile" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4 pb-12">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2 font-bold text-neutral-900">My Profile</h1>
          <p className="text-body-small text-neutral-600 mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card shadow="lg" className="space-y-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>

          <CardBody className="space-y-4">
            {isEditing ? (
              <>
                {/* Edit Mode */}
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  size="md"
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                  disabled
                  hint="Phone number cannot be changed"
                  size="md"
                />
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="space-y-1">
                  <p className="text-label font-semibold text-neutral-700">Full Name</p>
                  <p className="text-body text-neutral-900 font-medium">{profile.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-label font-semibold text-neutral-700">Phone Number</p>
                  <p className="text-body text-neutral-900 font-medium">{profile.phone}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-label font-semibold text-neutral-700">Account Type</p>
                  <Badge variant="primary">
                    {profile.role === 'CUSTOMER' ? '👤 Customer' : profile.role === 'BARBER' ? '💇 Barber' : '⚙️ Admin'}
                  </Badge>
                </div>

                {profile.genderPreference && (
                  <div className="space-y-1">
                    <p className="text-label font-semibold text-neutral-700">Preference</p>
                    <Badge variant="secondary">
                      {profile.genderPreference === 'MALE' ? '👨 Male Barber Shops' : profile.genderPreference === 'FEMALE' ? '👩 Female Salons' : '👥 All Salons'}
                    </Badge>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-label font-semibold text-neutral-700">Member Since</p>
                  <p className="text-body-small text-neutral-600">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </>
            )}
          </CardBody>

          <CardFooter>
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={isSaving}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Preferences Card */}
        <Card shadow="lg" className="space-y-4">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>

          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900">Email Notifications</p>
                <p className="text-body-small text-neutral-600">Get updates about bookings</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900">SMS Notifications</p>
                <p className="text-body-small text-neutral-600">Receive SMS reminders</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-neutral-900">Marketing Updates</p>
                <p className="text-body-small text-neutral-600">Learn about promotions</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded" />
            </div>
          </CardBody>
        </Card>

        {/* Logout Card */}
        <Card shadow="lg">
          <CardBody className="text-center space-y-4">
            <p className="text-body-small text-neutral-600">Want to switch accounts?</p>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
            >
              Sign Out
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
