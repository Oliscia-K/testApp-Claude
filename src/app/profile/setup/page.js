'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetup() {
  const router = useRouter();
  const [courses, setCourses] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const coursesArray = courses.split(',').map(c => c.trim()).filter(Boolean);
      const interestsArray = interests.split(',').map(i => i.trim()).filter(Boolean);

      const userId = 'user-' + Date.now(); // Temporary until auth is implemented

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courses: coursesArray,
          interests: interestsArray,
        }),
      });

      if (response.ok) {
        setMessage('Profile saved successfully! Redirecting...');
        // Redirect to matches page after 1 second
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
