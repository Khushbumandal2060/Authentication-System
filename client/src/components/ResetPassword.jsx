import React, { useState } from 'react';
import API from '../api/api';

const ResetPassword = () => {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/reset-password', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow">
      <h2 className="text-2xl mb-4">Reset Password</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" required/>
        <input name="otp" placeholder="OTP" value={form.otp} onChange={handleChange} className="w-full border p-2 rounded" required/>
        <input type="password" name="newPassword" placeholder="New Password" value={form.newPassword} onChange={handleChange} className="w-full border p-2 rounded" required/>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;