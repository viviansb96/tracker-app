"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  // Criamos uma função separada para poder recarregar a tabela facilmente
  const carregarUsuarios = () => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
          if (data.usuarios) setUsuarios(data.usuarios);
      })
      .catch(err => console.error("Erro ao buscar usuários", err));
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const cadastrarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true); // Evita cliques duplos
    
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert("Erro no servidor: " + data.error); // Agora você saberá se falhou
      } else if (data.usuario) {
        setNome("");
        carregarUsuarios(); // Recarrega a tabela para mostrar o novo cadastro
      }
    } catch (error) {
      alert("Erro ao conectar com a API. Verifique o terminal.");
    }
    setLoading(false);
  };

  const copiarLink = (id) => {
    const link = `${window.location.origin}/?uid=${id}`;
    navigator.clipboard.writeText(link);
    alert("Link copiado com sucesso!\nEnvie para o usuário abrir: \n" + link);
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Painel do Administrador</h1>
        
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
        
        {/* Tabela com rolagem horizontal no celular (overflow-x-auto) */}
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full text-left border-collapse bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b border-gray-200">Nome</th>
                <th className="p-3 border-b border-gray-200">ID</th>
                <th className="p-3 border-b border-gray-200">Localização</th>
                <th className="p-3 border-b border-gray-200">Ação</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b border-gray-200 font-medium">{user.nome}</td>
                  
                  {/* ID truncado para não quebrar o layout no celular */}
                  <td className="p-3 border-b border-gray-200 text-sm text-gray-500 max-w-[80px] truncate">
                    {user.id}
                  </td>
                  
                  <td className="p-3 border-b border-gray-200">
                    {user.latitude && user.longitude ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 underline text-sm font-semibold hover:text-blue-800"
                      >
                        📍 Ver no Google Maps
                      </a>
                    ) : (
                      <span className="text-orange-500 text-sm font-medium">Aguardando...</span>
                    )}
                  </td>
                  
                  <td className="p-3 border-b border-gray-200">
                    <button 
                      onClick={() => copiarLink(user.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition w-full sm:w-auto font-bold shadow-sm"
                    >
                      Copiar Link
                    </button>
                  </td>
                </tr>
              ))}
              
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500 italic">
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