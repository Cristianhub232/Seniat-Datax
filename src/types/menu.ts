export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface MenuConfig {
  navMain: MenuItem[];
  documents: MenuItem[];
  navSecondary: MenuItem[];
  user?: MenuItem[];
}

export interface NavUserProps {
  user: {
    avatar?: string;
    username?: string;
    email?: string;
  };
}

export type MenuNodeChild = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  metabaseID: number | null;
};

export type MenuNodeRoot = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  items: MenuNodeChild[];
};
