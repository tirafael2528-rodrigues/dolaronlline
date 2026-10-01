import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ExternalLink, GitBranch, Copy, Check, RefreshCw, Download, X, Terminal, CheckCircle2, Globe } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubModal({ isOpen, onClose }: GitHubModalProps) {
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_username') || 'tirafael2528';
    }
    return 'tirafael2528';
  });

  const [repoName, setRepoName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('github_repo') || 'dolaronlline';
    }
    return 'dolaronlline';
  });

  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('github_username', username);
      localStorage.setItem('github_repo', repoName);
    }
  }, [username, repoName]);

  const profileUrl = `https://github.com/${username}`;
  const repoUrl = `https://github.com/${username}/${repoName}`;

  const syncCommands = `git init
git add .
git commit -m "feat: atualizacao em tempo real dolar online"
git branch -M main
git remote add origin https://github.com/${username}/${repoName}.git
git push -u origin main`;

  const copyToClipboard = (text: string, type: 'url' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden text-text flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-text/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-text/10 border border-border flex items-center justify-center text-primary">
                <Github size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  Conta & Sincronização GitHub
                </h3>
                <p className="text-xs text-text-muted">
                  Acesse sua conta, repositório e ative o deploy contínuo em tempo real
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-text/5 hover:bg-text/10 border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs">
            {/* Conta e Repositório */}
            <div className="p-4 rounded-2xl bg-text/5 border border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  Configurar Usuário & Repositório
                </span>
                <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Salvo automaticamente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted">
                    Seu Usuário GitHub:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    placeholder="ex: tirafael2528"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted">
                    Nome do Repositório:
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value.trim())}
                    placeholder="ex: dolaronlline"
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Botões diretos para abrir perfil e repositório */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-xs"
                >
                  <Github size={14} />
                  <span>Abrir Meu Perfil</span>
                  <ExternalLink size={12} />
                </a>

                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-text/10 hover:bg-text/15 border border-border font-bold text-text transition-all"
                >
                  <GitBranch size={14} className="text-primary" />
                  <span>Abrir Repositório</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Como Ativar a Sincronização em Tempo Real */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold">
                <RefreshCw size={15} />
                <h4 className="text-sm">Como publicar alterações em tempo real</h4>
              </div>

              <div className="p-4 rounded-2xl bg-text/5 border border-border/70 space-y-3">
                <p className="text-text-muted leading-relaxed">
                  O projeto já inclui um fluxo de deploy automático via <strong>GitHub Actions</strong> no arquivo{' '}
                  <code className="bg-card px-1.5 py-0.5 rounded border border-border text-primary font-mono text-[11px]">
                    .github/workflows/deploy.yml
                  </code>
                  . Toda vez que um <strong>push</strong> é enviado para a branch <code className="text-text font-bold">main</code>, o GitHub compila e publica o site automaticamente no <strong>GitHub Pages</strong>.
                </p>

                {/* Opção 1: GitHub Desktop */}
                <div className="border-t border-border/50 pt-3">
                  <h5 className="font-bold text-text mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">1</span>
                    Opção 1: Pelo GitHub Desktop (Recomendado)
                  </h5>
                  <p className="text-text-muted text-[11px] leading-relaxed mb-2">
                    1. Baixe o ZIP dos arquivos atualizados pelo botão abaixo.<br />
                    2. Extraia na pasta local do repositório no seu computador.<br />
                    3. No <strong>GitHub Desktop</strong>, clique em <strong>Commit to main</strong> e em seguida <strong>Push origin</strong>.<br />
                    4. Pronto! O GitHub Actions publicará o site online em cerca de 1 a 2 minutos.
                  </p>

                  <a
                    href="/arquivos-modificados.zip"
                    download
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold hover:bg-primary/20 transition-all text-xs"
                  >
                    <Download size={13} />
                    <span>Baixar Arquivos Modificados (ZIP)</span>
                  </a>
                </div>

                {/* Opção 2: Linha de comando Git */}
                <div className="border-t border-border/50 pt-3">
                  <h5 className="font-bold text-text mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">2</span>
                    Opção 2: Linha de Comando (Git CLI)
                  </h5>
                  <div className="relative mt-2">
                    <pre className="p-3 rounded-xl bg-black/60 border border-border font-mono text-[10px] text-text-muted leading-relaxed overflow-x-auto">
                      {syncCommands}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(syncCommands, 'cmd')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-card border border-border text-text-muted hover:text-text transition-colors flex items-center gap-1 text-[10px] font-bold"
                      title="Copiar comandos"
                    >
                      {copiedCmd ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      <span>{copiedCmd ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Link do Site Publicado */}
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary shrink-0" />
                <div>
                  <span className="font-bold text-text block text-[11px]">
                    URL do Seu Site no GitHub Pages:
                  </span>
                  <a
                    href={`https://${username}.github.io/${repoName}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-primary text-[10px] hover:underline"
                  >
                    https://{username}.github.io/{repoName}/
                  </a>
                </div>
              </div>

              <a
                href={`https://${username}.github.io/${repoName}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl bg-primary text-black font-bold text-[11px] shrink-0 hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <span>Acessar</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-text/5 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-text/10 hover:bg-text/15 text-text font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
