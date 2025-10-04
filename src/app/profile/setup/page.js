'use client';

import { useState } from 'react';

export default function ProfileSetup() {
  const [courses, setCourses] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Will be implemented in next task
    console.log({ courses, interests });
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
