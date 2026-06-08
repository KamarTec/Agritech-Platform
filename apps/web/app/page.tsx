export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            FarmLink
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Connect farmers, retailers, and investors on one platform
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/register"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Get Started
            </a>
            <a
              href="/marketplace"
              className="px-8 py-3 border border-gray-300 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Browse Platform
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
