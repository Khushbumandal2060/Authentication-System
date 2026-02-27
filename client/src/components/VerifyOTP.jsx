import React, { useState } from 'react';
import API from '../api/api';

const VerifyOTP = () => {
  const [form, setForm] = useState({ email: '', otp: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/verify-otp', form);
      setMessage(res.data.message + '. Token: ' + res.data.token);
    } catch (err) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow">
      <h2 className="text-2xl mb-4">Verify OTP</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full border p-2 rounded" required/>
        <input name="otp" placeholder="OTP" onChange={handleChange} className="w-full border p-2 rounded" required/>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Verify OTP</button>
      </form>
    </div>
  );
};

export default VerifyOTP;