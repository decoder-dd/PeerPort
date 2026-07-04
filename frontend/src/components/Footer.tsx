import { Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030303]/90 backdrop-blur-md mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="gradient-text-accent text-lg font-bold">PeerPort</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Decentralized peer-to-peer marketplace built on Stellar.
              Trade digital assets securely with on-chain escrow locks and portable reputation systems.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://developers.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 transition hover:text-white"
                >
                  Stellar Docs <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.expert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 transition hover:text-white"
                >
                  Stellar.Expert Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Open Source</h4>
            <a
              href="https://github.com/decoder-dd/PeerPort"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
            >
              <Github className="h-4 w-4" />
              View Repository on GitHub
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] font-semibold text-zinc-600 tracking-wide uppercase">
          © {new Date().getFullYear()} PeerPort. Powered by Stellar Soroban.
        </div>
      </div>
    </footer>
  );
}
