'use client'
import { useSession } from "next-auth/react"
import Image from "next/image"
function DashboardContent() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back, {session?.user?.name}! 👋
            <Image
              src={session?.user?.image || "/default-avatar.png"}
              alt="User Avatar"
              width={50}
              height={50}
              className="inline-block ml-2 rounded-full"
            />
          </h1>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900">User Info</h2>
              <p className="text-blue-700">Email: {session?.user?.email}</p>
              <p className="text-blue-700">ID: {(session?.user as any)?.id}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Total Expenses</h3>
                <p className="text-2xl font-bold text-green-700">$0.00</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900">Pending Settlements</h3>
                <p className="text-2xl font-bold text-yellow-700">$0.00</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900">Groups</h3>
                <p className="text-2xl font-bold text-purple-700">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
      <DashboardContent />
  )
}