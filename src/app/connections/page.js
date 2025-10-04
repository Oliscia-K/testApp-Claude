'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    async function fetchConnections() {
      try {
        const response = await fetch(`/api/connections?userId=${userId}&status=accepted`);
        if (response.ok) {
          const data = await response.json();
          setConnections(data.connections || []);
        } else {
          setError('Failed to load connections');
        }
      } catch (err) {
        setError('Error loading connections');
      } finally {
        setLoading(false);
      }
    }

    fetchConnections();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading connections...</p>
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
        <h1 className="text-3xl font-bold mb-8">Connections</h1>

        {connections.length === 0 ? (
          <p className="text-gray-600">No active connections yet. Start by browsing matches!</p>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => {
              // Determine the other user in the connection
              const otherUserId = connection.requester_id === userId
                ? connection.recipient_id
                : connection.requester_id;

              return (
                <div
                  key={connection.id}
                  data-testid="connection-card"
                  className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{otherUserId}</h2>
                      <p className="text-sm text-gray-500">
                        Connected {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.href = `/chat/${connection.id}?userId=${userId}`}
                      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
