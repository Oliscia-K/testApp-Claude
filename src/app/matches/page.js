'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    async function fetchMatches() {
      try {
        const response = await fetch(`/api/matches?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data.matches || []);
        } else {
          setError('Failed to load matches');
        }
      } catch (err) {
        setError('Error loading matches');
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Matches</h1>

        {matches.length === 0 ? (
          <p className="text-gray-600">No matches found. Try updating your profile with more courses or interests!</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.user_id}
                data-testid="match-card"
                className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{match.user_id}</h2>
                    {match.email && (
                      <p className="text-sm text-gray-600">{match.email}</p>
                    )}
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                    Match Score: {match.match_score}
                  </span>
                </div>

                {match.courses && match.courses.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Courses:</h3>
                    <div className="flex flex-wrap gap-2">
                      {match.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {match.interests && match.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Interests:</h3>
                    <div className="flex flex-wrap gap-2">
                      {match.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
