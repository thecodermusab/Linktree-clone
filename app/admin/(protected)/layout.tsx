import { redirect } from 'next/navigation'
import { checkAdmin } from '@/lib/auth'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdmin()

  if (!isAdmin) {
    redirect('/admin/login')
  }

  return (
    <div className="flex w-full h-screen bg-[#f9f9f8] overflow-hidden text-gray-900">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  )
}
