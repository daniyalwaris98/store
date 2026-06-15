import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-xl bg-background-muted">
        <FileQuestion className="h-12 w-12 text-muted" strokeWidth={1.5} />
      </div>

      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">
        404
      </h1>

      <p className="mb-2 text-lg font-medium text-foreground">
        Admin page not found
      </p>

      <p className="mb-8 max-w-md text-sm text-secondary">
        The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Button asChild>
        <Link href="/admin/dashboard">
          Back to dashboard
        </Link>
      </Button>
    </div>
  )
}
