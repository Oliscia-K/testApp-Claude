'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProfileSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get user info from localStorage or URL params
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setEmail(userData.email || '');
      setName(userData.name || '');
    } else {
      const emailParam = searchParams.get('email');
      if (emailParam) {
        setEmail(emailParam);
        setName(emailParam.split('@')[0]);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const coursesArray = courses.split(',').map(c => c.trim()).filter(Boolean);
      const interestsArray = interests.split(',').map(i => i.trim()).filter(Boolean);

      // Get userId from localStorage or create new one
      let userId;
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        userId = JSON.parse(currentUser).userId;
      } else {
        userId = email.split('@')[0] + '-' + Date.now();
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name,
          email,
          password,
          courses: coursesArray,
          interests: interestsArray,
        }),
      });

      if (response.ok) {
        // Update localStorage with complete user info
        localStorage.setItem('currentUser', JSON.stringify({
          userId,
          name,
          email,
          hasProfile: true,
        }));

        setMessage('Profile saved successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/matches?userId=${userId}`);
        }, 1000);
      } else {
        setMessage('Failed to save profile');
        setLoading(false);
      }
    } catch (error) {
      setMessage('Error saving profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="courses" className="block text-sm font-medium mb-2">
              Courses (comma separated)
            </label>
            <input
              type="text"
              id="courses"
              name="courses"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
              placeholder="e.g. CS101, MATH201"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium mb-2">
              Academic Interests (comma separated)
            </label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Machine Learning, Web Development"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
