import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Building2,
  Tractor,
  Briefcase,
  Clock,
  Factory,
  Sprout
} from 'lucide-react';

export type DestinoAcesso = 
  | 'ADMIN' 
  | 'AGRICULTOR' 
  | 'RCA' 
  | 'PROVISORIO' 
  | 'PRODUCAO' 
  | 'SITIO';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (destino?: DestinoAcesso) => void;
};

/**
 * Perfis de usuário com redirecionamento automático:
 * - adm / admin -> Painel Geral Administrativo
 * - agricultor -> Portal dos Agricultores (Fornecedores de Mandioca)
 * - rca -> Portal do RCA (Representante Comercial)
 * - provisorio -> Portal do Cadastro Provisório (Portfólio / VIP)
 * - producao -> Cadastro Produção (Chão de Fábrica)
 * - sitio -> Cadastro Controle do Sítio (Talhões & Plantio)
 */
const USUARIOS_DEMO = [
  { 
    usuario: 'adm', 
    senha: 'adm', 
    destino: 'ADMIN' as DestinoAcesso, 
    rotulo: 'Painel Geral', 
    icon: ShieldCheck, 
    cargo: 'Administrador Geral' 
  },
  { 
    usuario: 'agricultor', 
    senha: '123', 
    destino: 'AGRICULTOR' as DestinoAcesso, 
    rotulo: 'Agricultores', 
    icon: Tractor, 
    cargo: 'Fornecedor de Mandioca' 
  },
  { 
    usuario: 'rca', 
    senha: '123', 
    destino: 'RCA' as DestinoAcesso, 
    rotulo: 'Portal RCA', 
    icon: Briefcase, 
    cargo: 'Representante Comercial' 
  },
  { 
    usuario: 'provisorio', 
    senha: '123', 
    destino: 'PROVISORIO' as DestinoAcesso, 
    rotulo: 'Provisório VIP', 
    icon: Clock, 
    cargo: 'Acesso Temporário / Portfólio' 
  },
  { 
    usuario: 'producao', 
    senha: '123', 
    destino: 'PRODUCAO' as DestinoAcesso, 
    rotulo: 'Produção', 
    icon: Factory, 
    cargo: 'Operação de Fábrica' 
  },
  { 
    usuario: 'sitio', 
    senha: '123', 
    destino: 'SITIO' as DestinoAcesso, 
    rotulo: 'Controle Sítio', 
    icon: Sprout, 
    cargo: 'Manejo Agrícola & Talhões' 
  },
];

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('adm');
  const [password, setPassword] = useState('adm');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      setError('');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Lógica inteligente que identifica o painel pelo usuário informado
  const identificarDestinoPorUsuario = (userStr: string): DestinoAcesso => {
    const u = userStr.trim().toLowerCase();

    if (u === 'agricultor' || u === 'produtor' || u.includes('agri') || u.includes('sebastiao') || u.includes('mandioca') || u.includes('fornecedor')) {
      return 'AGRICULTOR';
    }
    if (u === 'rca' || u === 'representante' || u.includes('rca') || u.includes('vendedor') || u.includes('comercial')) {
      return 'RCA';
    }
    if (u === 'provisorio' || u === 'convidado' || u === 'vip' || u.includes('provis') || u.includes('portfol')) {
      return 'PROVISORIO';
    }
    if (u === 'producao' || u === 'fabrica' || u.includes('prod') || u.includes('operador') || u.includes('moagem')) {
      return 'PRODUCAO';
    }
    if (u === 'sitio' || u === 'sítio' || u === 'fazenda' || u.includes('siti') || u.includes('talhao') || u.includes('campo') || u.includes('agronomo')) {
      return 'SITIO';
    }
    // Padrão: Painel Geral Administrativo
    return 'ADMIN';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, informe seu usuário de acesso.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, digite a sua senha.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const destino = identificarDestinoPorUsuario(username);
      setIsLoading(false);
      onLoginSuccess(destino);
      onClose();
    }, 200);
  };

  const handlePreencherUsuario = (userDemo: typeof USUARIOS_DEMO[0]) => {
    setUsername(userDemo.usuario);
    setPassword(userDemo.senha);
    setError('');
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        overflow-y-auto
        flex justify-center items-center
        bg-slate-950/70
        p-4 sm:p-6
        backdrop-blur-[10px]
        animate-[modalBackdropIn_180ms_ease-out]
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalCardIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        className="
          relative w-full max-w-[440px]
          overflow-hidden
          rounded-[24px]
          border border-emerald-900/15
          bg-white
          shadow-[0_25px_80px_rgba(4,120,87,0.22)]
          animate-[modalCardIn_200ms_ease-out]
          flex flex-col
        "
      >
        {/* Topo com Identificação */}
        <div className="relative px-6 pt-6 sm:px-7 sm:pt-7 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 shrink-0">
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="
              absolute right-5 top-5
              flex h-8 w-8 items-center justify-center
              rounded-xl
              border border-slate-200/80
              bg-white
              text-slate-400
              shadow-2xs
              transition-all duration-150
              hover:bg-slate-100 hover:text-slate-700
              cursor-pointer
            "
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                bg-gradient-to-br from-emerald-600 to-emerald-800
                text-white
                shadow-md shadow-emerald-700/20
              "
            >
              <Building2 className="w-5 h-5" />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Grupo ENO
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                Acessar o Sistema
              </h2>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Digite suas credenciais. O sistema identificará seu usuário e o direcionará automaticamente ao seu painel.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Usuário */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Usuário ou Identificação
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: adm, agricultor, rca, producao..."
                autoFocus
                className="
                  w-full h-11 pl-10 pr-3.5
                  rounded-xl
                  border border-slate-200
                  bg-slate-50/70
                  text-sm font-semibold text-slate-800
                  outline-none
                  transition-all
                  focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10
                "
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Senha
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="
                  w-full h-11 pl-10 pr-3.5
                  rounded-xl
                  border border-slate-200
                  bg-slate-50/70
                  text-sm font-semibold text-slate-800
                  outline-none
                  transition-all
                  focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10
                "
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full h-11 sm:h-12
              mt-2
              flex items-center justify-center gap-2
              rounded-xl
              bg-emerald-600 hover:bg-emerald-700
              text-sm font-bold text-white
              shadow-md shadow-emerald-700/25
              transition-all duration-150
              hover:-translate-y-0.5
              active:translate-y-0
              disabled:opacity-60 disabled:cursor-not-allowed
              cursor-pointer
            "
          >
            <span>{isLoading ? 'Entrando...' : 'Entrar no Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Atalhos rápidos de teste para demonstrar os redirecionamentos */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Logins de Demonstração:
              </span>
              <span className="text-[10px] text-slate-400">
                Clique para preencher
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {USUARIOS_DEMO.map((item) => {
                const IconComponent = item.icon;
                const isCurrent = username.toLowerCase() === item.usuario;
                return (
                  <button
                    key={item.usuario}
                    type="button"
                    onClick={() => handlePreencherUsuario(item)}
                    className={`
                      flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer border
                      ${isCurrent
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                        : 'bg-slate-50/90 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }
                    `}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <span className="font-bold">{item.usuario}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({item.rotulo})</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
