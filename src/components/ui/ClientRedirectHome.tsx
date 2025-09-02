'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useApp } from '@/context/AppContext';
import type { MenuNodeRoot, MenuNodeChild } from '@/types/user';

export default function ClientRedirectHome() {
    const { menus, user } = useUserProfile();
    const { isInitialized } = useApp();
    const router = useRouter();

    useEffect(() => {
        // Solo proceder si la aplicación ya está inicializada (splash screen completado)
        if (!isInitialized) {
            return;
        }

        // Si no hay usuario autenticado, redirigir al login
        if (!user) {
            router.replace('/login');
            return;
        }

        // Si no hay menús disponibles, redirigir al login
        if (!menus?.navMain?.length) {
            router.replace('/login');
            return;
        }

        const navMain: MenuNodeRoot[] = menus.navMain;

        const firstMainWithItems = navMain.find(menu => Array.isArray(menu.items) && menu.items.length > 0);

        const firstItem: MenuNodeChild | undefined = firstMainWithItems?.items?.[0];

        if (firstMainWithItems && firstItem && firstItem.metabaseID !== null) {
            const redirectPath = `${firstMainWithItems.url}/${firstItem.metabaseID}`;
            router.replace(redirectPath);
        } else if (navMain.length > 0) {
            // Si no hay dashboards con metabaseID, redirigir al primer menú disponible
            const firstMenu = navMain[0];
            router.replace(firstMenu.url);
        } else {
            // Si no hay menús, redirigir al login
            router.replace('/login');
        }
    }, [menus, user, router, isInitialized]);

    return null;
}
