import React from 'react';
import { ShieldAlert, Clock, Phone, MessageCircle, LogOut, Lock } from 'lucide-react';

export function SubscriptionLockModal({ user, onLogout }) {
  if (!user) return null;

  const phoneFormatted = "+55 (62) 99404-9949";
  const whatsappNumber = "5562994049949";
  const storeNameEscaped = encodeURIComponent(user.storeName || 'Revenda');
  const userNameEscaped = encodeURIComponent(user.name || 'Lojista');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1!%20Meu%20per%C3%ADodo%20de%20teste%20de%202%20dias%20expirou%20no%20AUTOLIST%20-%20MAVC.%20Gostaria%20de%20renovar%20minha%20assinatura.%20(Loja:%20${storeNameEscaped}%20|%20Lojista:%20${userNameEscaped})`;

  const isSuspended = user.status === 'suspended';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fade-in overflow-hidden">
      
      {/* Luz Neon Orbe no Fundo (Estilo iOS Ambient Light) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none" />

      {/* Card Principal - iOS Translucid Glass Container com Rolagem */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-zinc-950/80 backdrop-blur-3xl p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(0,0,0,0.9)] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        
        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Badge Ícone iOS Glass com Neon Glow */}
          <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/90 border border-white/20 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            {isSuspended ? (
              <Lock className="h-10 w-10 text-rose-400 animate-pulse stroke-[2]" />
            ) : (
              <Clock className="h-10 w-10 text-emerald-400 stroke-[2]" />
            )}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none" />
          </div>

          {/* iOS Pill Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            {isSuspended ? 'Conta Suspensa' : 'Período de Teste Expirado (2 Dias)'}
          </div>

          {/* Título Principal Tipografia iOS */}
          <h2 className="text-2xl sm:text-3xl font-headline font-black tracking-tight text-white uppercase">
            {isSuspended ? 'Acesso Bloqueado' : 'Seu Teste de 2 Dias Expirou'}
          </h2>

          {/* Descrição Limpa Sem Cores Gritantes */}
          <p className="mt-3 text-sm text-zinc-300 font-normal leading-relaxed">
            {isSuspended ? (
              'Esta conta foi suspensa temporariamente pelo Gestor Master. Solicite a liberação com o suporte oficial.'
            ) : (
              <>
                O período de teste gratuito de <strong className="text-white font-semibold">2 dias</strong> da plataforma <strong className="text-emerald-400 font-semibold">AUTOLIST - MAVC</strong> finalizou. Renove sua assinatura para liberar o controle completo do seu estoque.
              </>
            )}
          </p>

          {/* Card de Dados do Lojista (iOS Glass Box) */}
          <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 text-left space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 font-medium block">Lojista:</span>
                <span className="font-semibold text-white truncate block mt-0.5">{user.name}</span>
              </div>
              <div>
                <span className="text-zinc-400 font-medium block">Loja / Revenda:</span>
                <span className="font-semibold text-emerald-400 truncate block mt-0.5">{user.storeName || 'Minha Revenda'}</span>
              </div>
            </div>
            
            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Status do Plano:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px] uppercase">
                {isSuspended ? 'Bloqueado' : 'Renovação Pendente'}
              </span>
            </div>
          </div>

          {/* Botão de Ação Primária - iOS Neon Emerald */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black uppercase text-xs tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all hover:shadow-[0_0_45px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5 fill-zinc-950 stroke-emerald-500" />
            <span>Renovar Assinatura no WhatsApp</span>
          </a>

          {/* Suporte Direto Bar */}
          <div className="mt-3.5 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 flex items-center justify-center gap-2 text-xs text-zinc-300">
            <Phone className="h-4 w-4 text-emerald-400" />
            <span>Suporte Direto:</span>
            <strong className="text-emerald-400 font-bold tracking-wide">{phoneFormatted}</strong>
          </div>

          {/* Botão Voltar ao Login */}
          <button
            onClick={onLogout}
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors py-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Voltar para a tela de login</span>
          </button>

        </div>
      </div>
    </div>
  );
}
