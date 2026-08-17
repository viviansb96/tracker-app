import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Comando único para evitar cache
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // O asterisco (*) garante que ele traga a latitude e a longitude agora
    const { rows } = await sql`SELECT * FROM usuarios ORDER BY id DESC`;
    
    return NextResponse.json({ usuarios: rows });
  } catch (error) {
    console.error('Erro no GET usuarios:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nome } = await request.json();
    
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO usuarios (nome) 
      VALUES (${nome}) 
      RETURNING *
    `;
    
    return NextResponse.json({ usuario: rows[0] });
  } catch (error) {
    console.error('Erro no POST usuarios:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar' }, { status: 500 });
  }
}