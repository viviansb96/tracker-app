import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId, latitude, longitude } = await request.json();

    // Verifica se os dados chegaram certinho
    if (!userId || !latitude || !longitude) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Insere a localização atrelada ao ID da pessoa
    await sql`
      INSERT INTO localizacoes (usuario_id, latitude, longitude)
      VALUES (${userId}, ${latitude}, ${longitude})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar localização:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}