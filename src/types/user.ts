export interface UserData {
  id: string;
  username: string;
  email: string;
  role_id: string;
  avatar?: string;
}

export type MenuNodeChild = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  metabaseID: number | null;
};

export interface MenuNodeRoot extends MenuNodeChild {
  items: MenuNodeChild[];
}

export interface SecondaryItem {
  title: string;
  url: string;
  icon: string;
}

export interface DocumentItem {
  name: string;
  url: string;
  icon: string;
}

export interface MenuStructure {
  navMain: MenuNodeRoot[];
  navSecondary: SecondaryItem[];
  upcoming: SecondaryItem[];
  documents: DocumentItem[];
}

export interface UseUserProfileResult {
  user: UserData | null;
  menus: MenuStructure | null;
  loading: boolean;
}


