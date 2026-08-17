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
        // A variável 'nome' envia o "Identificador" e 'apelido' envia o "Nome"
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
    
    // Adiciona o 'Z' para forçar o JavaScript a entender que a hora do banco é UTC
    const dataUTC = dataIso.endsWith('Z') ? dataIso : `${dataIso}Z`;
    const data = new Date(dataUTC);
    
    return `${data.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' })} às ${data.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Rastreamento
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie e monitore localizações em tempo real.</p>
          </div>
          
          <button 
            onClick={carregarUsuarios}
            disabled={atualizando}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 font-semibold transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {atualizando ? "⏳ Atualizando..." : "🔄 Atualizar Dados"}
          </button>
        </div>
        
        {/* Formulário de Cadastro */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h2 className="text-lg font-bold mb-5 text-slate-800">Gerar Novo Link de Rastreio</h2>
          <form onSubmit={cadastrarUsuario} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Identificador *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full p-3.5 transition-all outline-none"
              required
            />
            <input
              type="text"
              placeholder="Nome (Opcional)"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full p-3.5 transition-all outline-none"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? "Criando..." : "Criar Registro"}
            </button>
          </form>
        </div>

        {/* Tabela de Dados */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-5 font-semibold border-b border-slate-100">Registro</th>
                  <th className="p-5 font-semibold border-b border-slate-100 text-center">Última Posição</th>
                  <th className="p-5 font-semibold border-b border-slate-100 text-center">Localização</th>
                  <th className="p-5 font-semibold border-b border-slate-100 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <p className="font-bold text-slate-900 text-base">{user.nome}</p>
                      {user.apelido && <p className="text-sm text-indigo-600 font-semibold mt-0.5">{user.apelido}</p>}
                      <p className="text-xs text-slate-400 mt-1.5 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                        ID (link): {user.id.split('-')[0]}
                      </p>
                    </td>
                    
                    <td className="p-5 text-center text-sm font-medium text-slate-600 whitespace-nowrap">
                      {formatarData(user.ultima_atualizacao)}
                    </td>

                    <td className="p-5 text-center">
                      {user.latitude && user.longitude ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                          <span className="text-lg leading-none">📍</span> Abrir Mapa
                        </a>
                      ) : (
                        <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">
                          Aguardando GPS
                        </span>
                      )}
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button 
                          onClick={() => copiarLink(user.id)}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
                        >
                          Copiar Link
                        </button>
                        <button 
                          onClick={() => excluirUsuario(user.id, user.nome)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.98]"
                          title="Excluir Registro"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <p className="text-slate-400 text-lg">Nenhum rastreamento ativo no momento.</p>
                      <p className="text-slate-400 text-sm mt-1">Gere um novo link acima para começar.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}