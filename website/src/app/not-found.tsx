import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-background-muted">
        <FileQuestion className="h-12 w-12 text-muted" strokeWidth={1.5} />
      </div>

      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">
        404
      </h1>

      <p className="mb-2 text-lg font-medium text-foreground">
        Page not found
      </p>

      <p className="mb-8 max-w-md text-sm text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">
            Back to home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">
            Search products
          </Link>
        </Button>
      </div>
    </div>
  )
}
