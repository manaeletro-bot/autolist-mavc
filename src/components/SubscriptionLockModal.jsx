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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-rose-500/80 bg-slate-900 p-8 shadow-2xl shadow-rose-950/80">
        
        {/* Glow de Fundo Ambient */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Badge Ícone de Bloqueio em Amarelo Ouro */}
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-xl shadow-amber-400/30">
            {isSuspended ? (
              <Lock className="h-10 w-10 text-slate-950 stroke-[2.5]" />
            ) : (
              <Clock className="h-10 w-10 text-slate-950 stroke-[2.5]" />
            )}
          </div>

          {/* Badge Superior com Texto Branco Super Visível */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 text-white px-4 py-1.5 text-xs font-headline font-black uppercase tracking-wider border-2 border-rose-400 shadow-lg mb-3">
            {isSuspended ? '🔒 CONTA SUSPENSA' : '⏱️ PERÍODO DE TESTE EXPIRADO (2 DIAS)'}
          </span>

          {/* Título Principal em Branco Puro */}
          <h2 className="text-2xl md:text-3xl font-headline font-black text-white tracking-tight uppercase drop-shadow-md">
            {isSuspended ? 'ACESSO BLOQUEADO PELO GESTOR' : 'SEU TESTE DE 2 DIAS EXPIROU'}
          </h2>

          {/* Texto Explicativo com Alto Contraste */}
          <p className="mt-4 text-sm text-slate-100 leading-relaxed font-semibold">
            {isSuspended ? (
              'Esta conta de lojista foi suspensa temporariamente pelo Gestor Master. Para reativar seu acesso, entre em contato com nosso suporte.'
            ) : (
              <>
                Seu período de teste de <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black mx-1">2 dias grátis</span> da plataforma <span className="bg-sky-500 text-white px-2 py-0.5 rounded-md font-black mx-1">AUTOLIST - MAVC</span> chegou ao fim. Solicite a renovação para liberar seu estoque.
              </>
            )}
          </p>

          {/* Card de Identificação da Conta com Legibilidade Máxima */}
          <div className="mt-6 w-full rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 text-left shadow-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Lojista:</span>
                <span className="font-black text-white text-sm truncate block mt-0.5">{user.name}</span>
              </div>
              <div>
                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Loja / Revenda:</span>
                <span className="font-black text-sky-300 text-sm truncate block mt-0.5">{user.storeName || 'Minha Revenda'}</span>
              </div>
              <div className="col-span-2 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-200 text-xs font-bold uppercase tracking-wider">Status da Conta:</span>
                <span className="font-headline font-black text-white text-xs bg-rose-600 px-3 py-1 rounded-lg border-2 border-rose-400 shadow-md uppercase tracking-wider">
                  {isSuspended ? 'BLOQUEADO' : 'RENOVAÇÃO NECESSÁRIA'}
                </span>
              </div>
            </div>
          </div>

          {/* Botão Principal WhatsApp com Alto Impacto Visual */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 px-6 py-4 text-base font-headline font-black uppercase text-slate-950 shadow-xl shadow-emerald-400/40 transition-all transform hover:scale-[1.02] active:scale-100"
          >
            <MessageCircle className="h-6 w-6 text-slate-950 fill-slate-950 stroke-emerald-400" />
            <span>Renovar Assinatura no WhatsApp</span>
          </a>

          {/* Número do Suporte em Caixa Destacada com Texto Claro */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-white bg-slate-800/90 px-4 py-3 rounded-xl border-2 border-slate-700 shadow-md w-full">
            <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Suporte Direto: <strong className="text-emerald-400 font-black text-base ml-1">{phoneFormatted}</strong></span>
          </div>

          {/* Botão Sair / Trocar de Conta com Texto Branco Totalmente Visível */}
          <button
            onClick={onLogout}
            className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl border-2 border-slate-600 shadow-lg transition-all hover:scale-[1.02]"
          >
            <LogOut className="h-4 w-4 text-white" />
            <span>Voltar à tela de login</span>
          </button>

        </div>
      </div>
    </div>
  );
}
