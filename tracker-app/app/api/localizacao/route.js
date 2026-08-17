import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Aceita o identificador tanto como 'uid' quanto 'userId' para evitar conflitos
    const idUsuario = body.uid || body.userId;
    const latitude = body.latitude;
    const longitude = body.longitude;

    // Se faltar algo, a API devolve uma mensagem mostrando EXATAMENTE o que faltou
    if (!idUsuario || !latitude || !longitude) {
      return NextResponse.json(
        { error: `ID: ${idUsuario || 'vazio'}, Lat: ${latitude || 'vazia'}, Lon: ${longitude || 'vazia'}` }, 
        { status: 400 }
      );
    }

  // Atualiza a localização e carimba o horário no Banco de Dados
    await sql`
      UPDATE usuarios 
      SET latitude = ${latitude}, longitude = ${longitude}, ultima_atualizacao = NOW()
      WHERE id = ${idUsuario}
    `;

    // Dispara o alerta para o Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (botToken && chatId) {
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const mensagem = `🚨 *NOVA LOCALIZAÇÃO RECEBIDA* 🚨\n\n👤 *ID:* \`${idUsuario}\`\n📍 *Maps:* [Abrir Localização](${mapsLink})`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensagem,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.error("Erro no Telegram:", err));
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}