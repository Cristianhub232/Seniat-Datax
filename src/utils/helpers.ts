import * as TablerIcons from "@tabler/icons-react";

function getIconComponent(iconName: string) {
  if (!iconName) return null;
  return TablerIcons[iconName as keyof typeof TablerIcons] || null;
}

export { getIconComponent };
