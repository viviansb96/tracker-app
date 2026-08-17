import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM usuarios ORDER BY id DESC`;
    return NextResponse.json({ usuarios: rows });
  } catch (error) {
    console.error('Erro no GET usuarios:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Agora recebe nome e apelido
    const { nome, apelido } = await request.json();
    
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO usuarios (nome, apelido) 
      VALUES (${nome}, ${apelido || null}) 
      RETURNING *
    `;
    
    return NextResponse.json({ usuario: rows[0] });
  } catch (error) {
    console.error('Erro no POST usuarios:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar' }, { status: 500 });
  }
}

// NOVA FUNÇÃO: Excluir usuário
export async function DELETE(request) {
  try {
    // Pega o ID que vem na URL (ex: /api/usuarios?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await sql`DELETE FROM usuarios WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no DELETE usuarios:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}