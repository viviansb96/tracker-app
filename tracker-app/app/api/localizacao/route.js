import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, latitude, longitude } = body;

    // 1. Validação de segurança básica
    if (!uid || !latitude || !longitude) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // 2. Atualiza a localização no Banco de Dados
    await sql`
      UPDATE usuarios 
      SET latitude = ${latitude}, longitude = ${longitude} 
      WHERE id = ${uid}
    `;

    // 3. Prepara e envia o alerta para o Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (botToken && chatId) {
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      const mensagem = `🚨 *NOVA LOCALIZAÇÃO RECEBIDA* 🚨\n\n👤 *ID do Cliente:* \`${uid}\`\n📍 *Localização:* [Abrir no Google Maps](${mapsLink})`;

      // Dispara a mensagem (se o Telegram falhar, não trava o app)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensagem,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.error("Erro ao notificar Telegram:", err));
    }

    // 4. Retorna sucesso para o navegador
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}