import React from 'react';
import { ShieldAlert, Clock, Phone, MessageCircle, LogOut, Lock, Store, User, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export function SubscriptionLockModal({ user, onLogout }) {
  if (!user) return null;

  const phoneFormatted = "+55 (62) 99404-9949";
  const whatsappNumber = "5562994049949";
  const storeNameEscaped = encodeURIComponent(user.storeName || 'Revenda');
  const userNameEscaped = encodeURIComponent(user.name || 'Lojista');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1!%20Meu%20per%C3%ADodo%20de%20teste%20de%202%20dias%20expirou%20no%20AUTOLIST%20-%20MAVC.%20Gostaria%20de%20renovar%20minha%20assinatura.%20(Loja:%20${storeNameEscaped}%20|%20Lojista:%20${userNameEscaped})`;

  const isSuspended = user.status === 'suspended';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 shadow-2xl shadow-rose-950/40">
        
        {/* Glow de Fundo Ambient */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Badge Ícone de Bloqueio */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-xl shadow-rose-500/10">
            {isSuspended ? (
              <Lock className="h-10 w-10 animate-pulse text-rose-400" />
            ) : (
              <Clock className="h-10 w-10 animate-bounce text-amber-400" />
            )}
          </div>

          {/* Título */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-rose-400 border border-rose-500/20 mb-3">
            {isSuspended ? 'Conta Suspensa' : 'Período de Teste Expirado (2 Dias)'}
          </span>

          <h2 className="text-2xl font-headline font-black text-white tracking-tight uppercase">
            {isSuspended ? 'Acesso Bloqueado pelo Gestor' : 'Seu Teste de 2 Dias Expirou'}
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">
            {isSuspended ? (
              'Esta conta de lojista foi suspensa temporariamente pelo Gestor Master. Para reativar o acesso ao sistema, entre em contato com o suporte oficial.'
            ) : (
              <>
                Seu período de teste de <strong className="text-amber-400 font-bold">2 dias grátis</strong> da plataforma <strong className="text-sky-400 font-bold">AUTOLIST - MAVC</strong> chegou ao fim. Para continuar gerenciando seus veículos, relatórios e vistorias, solicite a renovação da sua assinatura.
              </>
            )}
          </p>

          {/* Card de Identificação da Conta */}
          <div className="mt-6 w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Lojista:</span>
                <span className="font-bold text-slate-200 truncate block">{user.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Loja / Revenda:</span>
                <span className="font-bold text-sky-400 truncate block">{user.storeName || 'Minha Revenda'}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status da Conta:</span>
                <span className="font-black text-rose-400 uppercase text-[10px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {isSuspended ? 'Bloqueado' : 'Renovação Necessária'}
                </span>
              </div>
            </div>
          </div>

          {/* Botão Principal WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-4 text-base font-headline font-black uppercase text-slate-950 shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle className="h-6 w-6 fill-slate-950 stroke-emerald-500" />
            <span>Renovar Assinatura no WhatsApp</span>
          </a>

          {/* Número do Suporte Exibido */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <span>Suporte Direto: <strong className="text-white">{phoneFormatted}</strong></span>
          </div>

          {/* Botão Sair / Trocar de Conta */}
          <button
            onClick={onLogout}
            className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Voltar à tela de login</span>
          </button>

        </div>
      </div>
    </div>
  );
}
