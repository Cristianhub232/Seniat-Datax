import { NextRequest, NextResponse } from 'next/server';
import { getMenusByRole } from '@/controllers/menuController';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const role = searchParams.get('role');
  const onlyDisabled = searchParams.get('onlyDisabled') === 'true';

  if (!role) {
    return NextResponse.json({ error: 'Parámetro "role" es requerido' }, { status: 400 });
  }

  try {
    const menus = await getMenusByRole(role, { onlyDisabled });
    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo menús', detail: `${error}` },
      { status: 500 }
    );
  }
}
