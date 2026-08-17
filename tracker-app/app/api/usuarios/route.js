export const dynamic = 'force-dynamic';
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Força a API a sempre buscar dados novos no banco, sem usar cache
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Busca os usuários e traz a última latitude/longitude registrada para cada um
    const { rows } = await sql`
      SELECT 
        u.id, 
        u.nome,
        (SELECT latitude FROM localizacoes WHERE usuario_id = u.id ORDER BY registrado_em DESC LIMIT 1) as latitude,
        (SELECT longitude FROM localizacoes WHERE usuario_id = u.id ORDER BY registrado_em DESC LIMIT 1) as longitude
      FROM usuarios u 
      ORDER BY u.criado_em DESC
    `;
    return NextResponse.json({ usuarios: rows });
  } catch (error) {
    console.error("Erro no GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nome } = await request.json();
    const { rows } = await sql`INSERT INTO usuarios (nome) VALUES (${nome}) RETURNING id, nome`;
    return NextResponse.json({ usuario: rows[0] });
  } catch (error) {
    console.error("Erro no POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}