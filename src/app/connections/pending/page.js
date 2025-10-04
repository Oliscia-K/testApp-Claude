'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function PendingConnectionsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

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

    async function fetchPendingRequests() {
      try {
        const response = await fetch(`/api/connections?userId=${userId}&status=pending`);
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data.connections || []);
        } else {
          setError('Failed to load pending requests');
        }
      } catch (err) {
        setError('Error loading pending requests');
      } finally {
        setLoading(false);
      }
    }

    fetchPendingRequests();
  }, [userId]);

  const handleAccept = async (connectionId) => {
    setProcessingId(connectionId);
    try {
      const response = await fetch(`/api/connections/${connectionId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Remove from pending list
        setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      } else {
        alert('Failed to accept connection request');
      }
    } catch (err) {
      alert('Error accepting connection request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (connectionId) => {
    setProcessingId(connectionId);
    try {
      const response = await fetch(`/api/connections/${connectionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Remove from pending list
        setPendingRequests(pendingRequests.filter(req => req.id !== connectionId));
      } else {
        alert('Failed to reject connection request');
      }
    } catch (err) {
      alert('Error rejecting connection request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading pending requests...</p>
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
          <h1 className="text-3xl font-bold mb-8">Connection Requests</h1>

          {pendingRequests.length === 0 ? (
            <p className="text-gray-600">No pending connection requests.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                // Determine the requester (the other user)
                const requesterId = request.requester_id === userId
                  ? request.recipient_id
                  : request.requester_id;

                return (
                  <div
                    key={request.id}
                    data-testid="pending-request-card"
                    className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold">{requesterId}</h2>
                        <p className="text-sm text-gray-500">
                          Requested {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={processingId === request.id}
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === request.id ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {processingId === request.id ? 'Processing...' : 'Reject'}
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
