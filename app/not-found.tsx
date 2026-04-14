import Link from "next/link"
import { ChefHat, Home, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">QueueOpt</span>
        </Link>

        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-muted-foreground text-balance text-sm sm:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-xl">
            <Link href="/">
              <Home className="size-4" />
              Back to home
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
