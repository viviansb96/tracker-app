import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Aceita o identificador tanto como 'uid' quanto 'userId'
    const idUsuario = body.uid || body.userId;
    const latitude = body.latitude;
    const longitude = body.longitude;

    if (!idUsuario || !latitude || !longitude) {
      return NextResponse.json(
        { error: `ID: ${idUsuario || 'vazio'}, Lat: ${latitude || 'vazia'}, Lon: ${longitude || 'vazia'}` }, 
        { status: 400 }
      );
    }

    // 1. Atualiza a localização e RETORNA o nome e o apelido do banco de dados
    const { rows } = await sql`
      UPDATE usuarios 
      SET latitude = ${latitude}, longitude = ${longitude}, ultima_atualizacao = NOW() 
      WHERE id = ${idUsuario}
      RETURNING nome, apelido
    `;

    // Se o ID não existir mais no banco, aborta
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Extrai o nome e o apelido retornados pelo banco
    const nomeUsuario = rows[0].nome;
    const apelidoUsuario = rows[0].apelido;

    // 2. Dispara o alerta para o Telegram com os novos dados
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (botToken && chatId) {
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      // Montando a mensagem bonita pro Telegram
      const mensagem = `🚨 *NOVA LOCALIZAÇÃO RECEBIDA* 🚨\n\n👤 *Identificador:* ${nomeUsuario}\n🏷️ *Nome:* ${apelidoUsuario || 'Não informado'}\n🆔 *ID:* \`${idUsuario}\`\n📍 *Maps:* [Abrir Localização](${mapsLink})`;

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