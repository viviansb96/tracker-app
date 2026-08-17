"use client";
import { useState, useEffect } from "react";

interface Usuario {
  id: string;
  nome: string;
  apelido: string | null;
  latitude: string | null;
  longitude: string | null;
  ultima_atualizacao: string | null;
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [loading, setLoading] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const carregarUsuarios = () => {
    setAtualizando(true);
    fetch(`/api/usuarios?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
          if (data.usuarios) setUsuarios(data.usuarios);
      })
      .catch(err => console.error("Erro ao buscar usuários", err))
      .finally(() => setAtualizando(false));
  };

  useEffect(() => {
    carregarUsuarios();
    const intervalo = setInterval(() => { carregarUsuarios(); }, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const cadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, apelido }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert("Erro no servidor: " + data.error);
      } else if (data.usuario) {
        setNome("");
        setApelido("");
        carregarUsuarios();
      }
    } catch (error) {
      alert("Erro ao conectar com a API.");
    }
    setLoading(false);
  };

  const excluirUsuario = async (id: string, identificador: string) => {
    if (!window.confirm(`Tem certeza que deseja apagar o rastreio de: ${identificador}?`)) return;

    try {
      const res = await fetch(`/api/usuarios?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        carregarUsuarios();
      } else {
        alert("Falha ao excluir.");
      }
    } catch (error) {
      alert("Erro ao excluir registro.");
    }
  };

  const copiarLink = (id: string) => {
    const link = `${window.location.origin}/?uid=${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copiado com sucesso!\nEnvie este link para o cliente/entregador abrir.");
  };

  const formatarData = (dataIso: string | null) => {
    if (!dataIso) return "--:--";
    const data = new Date(dataIso);
    return `${data.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })} • ${data.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-[#EBE5E5] flex justify-center items-start md:p-6 lg:p-10 font-sans">
      
      {/* Container Principal: Responsivo (expande até max-w-7xl no desktop) */}
      <div className="bg-white w-full max-w-7xl md:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-screen md:min-h-0 relative">
        
        {/* HEADER */}
        <div className="bg-[#930B0B] text-white pt-10 pb-8 px-6 md:px-12 relative rounded-b-[2rem] shadow-md z-10">
          <div className="flex justify-between items-center mb-4 max-w-5xl mx-auto">
            {/* Ícone Voltar/Menu (decorativo para manter o design) */}
            <button className="text-white hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            {/* Botão de Atualizar Responsivo */}
            <button onClick={carregarUsuarios} disabled={atualizando} className="text-white hover:text-gray-200 transition-colors flex items-center gap-2">
              <span className="hidden md:inline font-semibold text-sm">Atualizar</span>
              <svg className={`w-7 h-7 md:w-8 md:h-8 ${atualizando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
          
          <div className="text-center mt-2 max-w-xl mx-auto">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center border-2 border-white/50 mb-4 shadow-sm">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">Rastreamento</h1>
            <p className="text-[#FFC2C2] text-sm md:text-base mt-2 font-light">Monitoramento em tempo real de clientes e entregadores</p>
          </div>
        </div>

        {/* CORPO DA PÁGINA */}
        <div className="px-6 md:px-12 py-8 md:py-10 pb-24 max-w-7xl mx-auto">
          
          {/* FORMULÁRIO RESPONSIVO */}
          <form onSubmit={cadastrarUsuario} className="mb-10 bg-[#F4EBEB] p-5 md:p-8 rounded-3xl shadow-sm">
            {/* No celular: coluna (flex-col). No desktop: linha (md:flex-row) */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Identificador"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-white text-[#7A1515] placeholder-[#C2A3A3] text-center font-medium rounded-full px-6 py-4 w-full focus:outline-none shadow-sm md:text-lg transition-all border-2 border-transparent focus:border-[#C2A3A3]"
                required
              />
              <input
                type="text"
                placeholder="Nome (Opcional)"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                className="bg-white text-[#7A1515] placeholder-[#C2A3A3] text-center font-medium rounded-full px-6 py-4 w-full focus:outline-none shadow-sm md:text-lg transition-all border-2 border-transparent focus:border-[#C2A3A3]"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto md:min-w-[200px] bg-[#930B0B] text-white rounded-full py-4 px-8 font-bold text-lg shadow-lg shadow-red-900/30 transition-transform active:scale-95 disabled:opacity-70 whitespace-nowrap"
              >
                {loading ? "Criando..." : "Gerar Rastreio"}
              </button>
            </div>
          </form>

          {/* LISTA DE USUÁRIOS (GRID RESPONSIVO) */}
          {/* No celular: 1 coluna. No tablet: 2 colunas. No desktop grande: 3 colunas. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((user) => (
              <div key={user.id} className="bg-[#F4EBEB] rounded-[1.5rem] p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                
                {/* Cabeçalho do Cartão */}
                <div className="flex justify-between items-start border-b border-[#E0CACA] pb-4 mb-4">
                  <div className="overflow-hidden pr-2">
                    <h3 className="font-bold text-[#6B1111] text-lg truncate" title={user.nome}>{user.nome}</h3>
                    {user.apelido && <p className="text-sm font-semibold text-[#930B0B] truncate" title={user.apelido}>{user.apelido}</p>}
                    <p className="text-xs text-[#9E7A7A] mt-2 font-mono bg-white px-2 py-1 rounded-md inline-block shadow-sm">
                      ID (link): {user.id.split('-')[0]}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] uppercase font-bold text-[#9E7A7A] tracking-wider">Última Posição</p>
                    <p className="font-bold text-[#930B0B] text-sm mt-0.5 whitespace-nowrap">{formatarData(user.ultima_atualizacao)}</p>
                  </div>
                </div>

                {/* Botões do Cartão - Responsivos internamente (flex-wrap) */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
                  <div className="flex-1 min-w-[130px]">
                    {user.latitude && user.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#2D9596] text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-md transition-transform active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        Ver Mapa
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 w-full bg-white text-[#9E7A7A] px-4 py-2.5 rounded-full text-sm font-bold border border-[#E0CACA]">
                        Aguardando...
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => copiarLink(user.id)}
                    className="flex-1 min-w-[100px] flex justify-center bg-white text-[#6B1111] border-2 border-[#6B1111] px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-transform active:scale-95"
                  >
                    Copiar
                  </button>
                  
                  <button 
                    onClick={() => excluirUsuario(user.id, user.nome)}
                    className="w-10 h-10 flex items-center justify-center bg-[#930B0B] text-white rounded-full shadow-md transition-transform active:scale-95 flex-shrink-0"
                    title="Excluir Registro"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}

            {usuarios.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-transparent border-2 border-dashed border-[#C2A3A3] p-12 rounded-3xl text-center">
                <p className="text-[#9E7A7A] font-bold text-xl">Nenhum registro ativo</p>
                <p className="text-[#9E7A7A] mt-2">Preencha o formulário acima para gerar o primeiro link de rastreio.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}