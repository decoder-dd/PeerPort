import { Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a12]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="gradient-text text-lg font-bold">PeerPort</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Decentralized peer-to-peer marketplace built on Stellar.
              Trade digital assets securely with on-chain escrow.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300">Resources</h4>
            <ul className="mt-2 space-y-1.5">
              <li>
                <a
                  href="https://developers.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-zinc-500 transition hover:text-white"
                >
                  Stellar Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.expert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-zinc-500 transition hover:text-white"
                >
                  Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Source */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300">Open Source</h4>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} PeerPort. Built on Stellar Network.
        </div>
      </div>
    </footer>
  );
}
