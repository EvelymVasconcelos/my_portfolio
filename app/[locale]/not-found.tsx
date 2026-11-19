import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="type-eyebrow text-accent-text">404</p>
      <h1 className="type-title text-text">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-base text-text-2">
        A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/pt"
        className="rounded-md bg-accent px-6 py-2.5 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
