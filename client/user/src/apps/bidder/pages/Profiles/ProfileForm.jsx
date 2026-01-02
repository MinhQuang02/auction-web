import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const ProfileForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const token = localStorage.getItem('token');

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch profile');

                const data = await res.json();

                // Split full_name into first and last name
                const names = (data.full_name || '').split(' ');
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';

                setFormData(prev => ({
                    ...prev,
                    firstName,
                    lastName,
                    email: data.email || '',
                    address: data.address || ''
                }));
            } catch (err) {
                console.error(err);
                setError('Could not load profile data');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const body = {
                full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                address: formData.address,
                email: formData.email
            };

            if (formData.newPassword) {
                body.currentPassword = formData.currentPassword;
                body.newPassword = formData.newPassword;
            }

            const res = await fetch(`${API_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccessMessage('Profile updated successfully!');
            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex-grow w-full">

            {/* Header Welcome Message */}
            <div className="flex justify-end mb-4">
                <div className="text-sm">
                    <span className="text-gray-500">Welcome! </span>
                    <span className="text-primary font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
            </div>

            {/* Form Container */}
            <div className="bg-[#F5F5F5] rounded shadow-lg p-8 md:p-12 lg:px-16 lg:py-12">

                <h2 className="text-xl font-medium text-primary mb-8">Edit Your Profile</h2>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>}
                {successMessage && <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-normal">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none text-gray-600 placeholder-gray-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-normal">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none text-gray-600 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-normal">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none text-gray-600 placeholder-gray-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-normal">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Address"
                                className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none text-gray-600 placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="flex flex-col gap-4 mt-2">
                        <label className="text-sm font-normal">Password Changes</label>

                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Current Password"
                            className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none mb-1 placeholder-gray-400"
                        />

                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="New Password"
                            className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none mb-1 placeholder-gray-400"
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm New Password"
                            className="w-full bg-white border-none rounded h-[50px] px-4 text-sm focus:ring-1 focus:ring-primary outline-none placeholder-gray-400"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end items-center gap-6 mt-6">
                        <button type="button" className="text-sm font-normal hover:text-primary transition" onClick={() => window.location.reload()}>Cancel</button>
                        <button type="submit" className="bg-primary text-white px-8 py-3 rounded shadow-md hover:bg-[#968571] transition text-sm font-medium">Save Changes</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProfileForm;