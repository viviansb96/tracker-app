"use client";
import { useState, useEffect } from "react";

interface Usuario {
  id: string;
  nome: string;
  latitude: string | null; // Alterado para string pois no banco criamos como VARCHAR
  longitude: string | null;
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const carregarUsuarios = () => {
    setAtualizando(true);
    // Adicionamos um timestamp na URL e o cache: 'no-store' para forçar o Next a ignorar o cache e trazer dados novos
    fetch(`/api/usuarios?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
          if (data.usuarios) setUsuarios(data.usuarios);
      })
      .catch(err => console.error("Erro ao buscar usuários", err))
      .finally(() => setAtualizando(false));
  };

  useEffect(() => {
    // Carrega na primeira vez que abre a página
    carregarUsuarios();

    // Cria um "relógio" que atualiza a tabela a cada 10 segundos automaticamente
    const intervalo = setInterval(() => {
      carregarUsuarios();
    }, 10000);

    // Limpa o relógio se o usuário sair da página
    return () => clearInterval(intervalo);
  }, []);

  const cadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert("Erro no servidor: " + data.error);
      } else if (data.usuario) {
        setNome("");
        carregarUsuarios(); // Atualiza a lista na mesma hora após cadastrar
      }
    } catch (error) {
      alert("Erro ao conectar com a API.");
    }
    setLoading(false);
  };

  const copiarLink = (id: string) => {
    const link = `${window.location.origin}/?uid=${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copiado com sucesso!\nEnvie para o usuário abrir: \n" + link);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Painel do Administrador</h1>
          
          {/* Botão de atualização manual */}
          <button 
            onClick={carregarUsuarios}
            disabled={atualizando}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded font-semibold transition disabled:opacity-50 border border-gray-300"
          >
            {atualizando ? "⏳ Atualizando..." : "🔄 Atualizar Agora"}
          </button>
        </div>
        
        <form onSubmit={cadastrarUsuario} className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Digite o nome da pessoa..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="border border-gray-300 p-3 rounded flex-1 text-black bg-white"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-bold transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Cadastrar e Gerar Link"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Usuários e Localizações</h2>
        
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full text-left border-collapse bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b border-gray-200">Nome</th>
                <th className="p-3 border-b border-gray-200">ID</th>
                <th className="p-3 border-b border-gray-200 text-center">Localização</th>
                <th className="p-3 border-b border-gray-200 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200 font-medium">{user.nome}</td>
                  <td className="p-3 border-b border-gray-200 text-sm text-gray-500 max-w-[80px] truncate">
                    {user.id}
                  </td>
                  <td className="p-3 border-b border-gray-200 text-center">
                    {user.latitude && user.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-full text-sm font-bold transition"
                      >
                        📍 Abrir Mapa
                      </a>
                    ) : (
                      <span className="text-orange-500 text-sm font-medium animate-pulse">Aguardando...</span>
                    )}
                  </td>
                  <td className="p-3 border-b border-gray-200 text-center">
                    <button 
                      onClick={() => copiarLink(user.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition font-bold shadow-sm"
                    >
                      Copiar Link
                    </button>
                  </td>
                </tr>
              ))}
              
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500 italic">
                    Nenhum usuário cadastrado ainda.
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