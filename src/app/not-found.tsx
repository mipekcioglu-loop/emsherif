import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-10 text-4xl">Page not found</h1>
      <Link href="/" className="mt-6 text-sm underline underline-offset-4">
        Back to the menu
      </Link>
    </main>
  );
}
