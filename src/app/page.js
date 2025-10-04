export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Find Your Study Partners
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with classmates, discover study groups, and collaborate on projects.
            Co-Lab makes academic collaboration simple and effective.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/profile/setup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </a>
            <a
              href="/matches?userId=demo"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Browse Matches
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Add your courses and academic interests to get personalized match suggestions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Matches</h3>
              <p className="text-gray-600">
                Our algorithm finds students with shared courses and interests for effective collaboration.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Collaborate</h3>
              <p className="text-gray-600">
                Send connection requests and start chatting with your study partners instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">For Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">Smart</div>
              <div className="text-gray-600">Matching Algorithm</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">Easy</div>
              <div className="text-gray-600">To Use</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>Co-Lab - Academic Collaboration Made Easy</p>
        </div>
      </footer>
    </div>
  );
}
