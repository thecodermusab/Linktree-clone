import LinksManager from '@/components/admin/links/LinksManager'

export default function LinksAdminPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Links</h1>
        <p className="mt-2 text-sm text-gray-500">
          Make changes to your links here. They will update on your public page instantly.
        </p>
      </div>

      <LinksManager />
    </div>
  )
}
