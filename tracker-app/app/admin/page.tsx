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

  const excluirUsuario = async (id: string, nomeUsuario: string) => {
    // Pede confirmação antes de apagar
    if (!window.confirm(`Tem certeza que deseja apagar os dados de ${nomeUsuario}?`)) return;

    try {
      const res = await fetch(`/api/usuarios?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        carregarUsuarios(); // Recarrega a tabela após apagar
      } else {
        alert("Falha ao excluir.");
      }
    } catch (error) {
      alert("Erro ao excluir usuário.");
    }
  };

  const copiarLink = (id: string) => {
    const link = `${window.location.origin}/?uid=${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copiado com sucesso!\nEnvie para o usuário abrir: \n" + link);
  };

  // Função para formatar a data/hora para o padrão brasileiro
  const formatarData = (dataIso: string | null) => {
    if (!dataIso) return "Sem registro";
    return new Date(dataIso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Painel de Entregas</h1>
          <button 
            onClick={carregarUsuarios}
            disabled={atualizando}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded shadow-sm font-semibold transition border border-gray-200"
          >
            {atualizando ? "⏳ Atualizando..." : "🔄 Atualizar Dados"}
          </button>
        </div>
        
        {/* Formulário Atualizado */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Novo Cliente/Entregador</h2>
          <form onSubmit={cadastrarUsuario} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Nome Completo *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-gray-300 p-3 rounded flex-1 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Apelido (Opcional)"
              value={apelido}
              onChange={(e) => setApelido(e.target.value)}
              className="border border-gray-300 p-3 rounded flex-1 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold transition disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Cadastrar e Gerar Link"}
            </button>
          </form>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Rastreamentos Ativos</h2>
        
        <div className="overflow-x-auto shadow-sm rounded-lg bg-white border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 border-b">Identificação</th>
                <th className="p-4 border-b text-center">Última Posição</th>
                <th className="p-4 border-b text-center">Localização</th>
                <th className="p-4 border-b text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{user.nome}</p>
                    {user.apelido && <p className="text-sm text-blue-600 font-medium">@{user.apelido}</p>}
                    <p className="text-xs text-gray-400 mt-1">ID: {user.id.split('-')[0]}</p>
                  </td>
                  
                  <td className="p-4 text-center text-sm font-medium text-gray-600">
                    {formatarData(user.ultima_atualizacao)}
                  </td>

                  <td className="p-4 text-center">
                    {user.latitude && user.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-full text-sm font-bold transition"
                      >
                        📍 Ver no Mapa
                      </a>
                    ) : (
                      <span className="text-orange-500 text-sm font-medium animate-pulse">Aguardando GPS...</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button 
                        onClick={() => copiarLink(user.id)}
                        className="bg-gray-800 hover:bg-black text-white px-3 py-1.5 rounded text-sm transition font-bold"
                      >
                        Copiar Link
                      </button>
                      <button 
                        onClick={() => excluirUsuario(user.id, user.apelido || user.nome)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded text-sm transition font-bold"
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
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Nenhum cliente ou entregador ativo no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}