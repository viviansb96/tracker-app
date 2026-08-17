"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [status, setStatus] = useState("Aguardando permissão...");
  // CORREÇÃO: Avisamos ao TypeScript que o erro pode ser um texto (string) ou nulo (null)
  const [erro, setErro] = useState<string | null>(null); 

  useEffect(() => {
    // Lê a URL atual e tenta encontrar o parâmetro "uid"
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get("uid");

    if (!uid) {
      setStatus("Acesso inválido.");
      setErro("Nenhum identificador encontrado no link.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setStatus("Erro");
      setErro("Seu navegador não suporta geolocalização.");
      return;
    }

    // Solicita o GPS com alta precisão
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("Registrando localização, por favor aguarde...");
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch("/api/localizacao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: uid, latitude, longitude }),
          });

          if (res.ok) {
            setStatus("Localização registrada com sucesso!");
          } else {
            const data = await res.json();
            setStatus("Falha ao registrar.");
            setErro(data.error || "Erro no servidor.");
          }
        } catch (error) {
          setStatus("Erro de conexão.");
          setErro("Falha ao conectar com o servidor.");
        }
      },
      (error) => {
        // Trata os possíveis erros do usuário negar o GPS
        setStatus("Permissão negada ou falha.");
        if (error.code === 1) {
          setErro("Você precisa permitir o acesso à localização para continuar.");
        } else {
          setErro(error.message);
        }
      },
      { enableHighAccuracy: true } // Força o GPS real do celular
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Compartilhamento de Localização</h1>
        
        <div className="mb-4">
          {status === "Localização registrada com sucesso!" ? (
             <p className="text-2xl">✅</p>
          ) : status === "Registrando localização, por favor aguarde..." ? (
             <p className="text-2xl animate-spin">⏳</p>
          ) : (
             <p className="text-2xl">📍</p>
          )}
        </div>

        <p className={`text-lg font-semibold ${
          status === "Localização registrada com sucesso!" ? "text-green-600" : "text-blue-600"
        }`}>
          {status}
        </p>

        {erro && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded mt-4 border border-red-200">
            {erro}
          </p>
        )}

        {status === "Localização registrada com sucesso!" && (
          <p className="text-gray-500 text-sm mt-6">
            Pode fechar esta página.
          </p>
        )}
      </div>
    </div>
  );
}