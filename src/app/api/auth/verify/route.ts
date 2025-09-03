import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwtUtils';
import { User, Role } from '@/models';
import { getMenusByRole } from "@/controllers/menuController"; // <-- controller para obtener los menús por rol

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  try {
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) return NextResponse.json({ valid: false }, { status: 200 });

    const userData = user.get({ plain: true });
    // Usar el nombre del rol del token en lugar del ID del rol
    const menus = await getMenusByRole(decoded.role);

    const responseUser = {
      ...userData,
      role: decoded.role, // Usar el rol del token que ya está decodificado
    };

    return NextResponse.json({ valid: true, user: responseUser, menus });
  } catch (err) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}
