'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function ConnectionsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get userId from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(currentUser);
    setUserId(userData.userId);
  }, [router]);

  useEffect(() => {
    if (!userId) return;

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
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading connections...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
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

              const otherUserName = connection.requester_id === userId
                ? (connection.recipient_name || connection.recipient_id)
                : (connection.requester_name || connection.requester_id);

              return (
                <div
                  key={connection.id}
                  data-testid="connection-card"
                  className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{otherUserName}</h2>
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
                      onClick={() => router.push(`/chat/${connection.id}`)}
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
    </>
  );
}
