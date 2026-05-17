import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-white"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">
              Web3 Wallet
            </span>
            <span className="text-sm text-gray-600">·</span>
            <span className="text-sm text-gray-500">
              Multi-Chain DEX Analytics
            </span>
          </div>
          <nav className="flex items-center gap-6">
            {[
              { href: "/", label: "Dashboard" },
              { href: "/tokens", label: "Tokens" },
              { href: "/pools", label: "Pools" },
              { href: "/portfolio", label: "Portfolio" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-600">
            Data: CoinGecko · DexScreener · Alchemy
          </p>
        </div>
      </div>
    </footer>
  );
}
