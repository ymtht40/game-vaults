'use client';

// Variable Mapping: ep -> PLATFORM_NAV_ITEMS, eg -> SUPPORT_NAV_ITEMS, ex -> isNavItemActive, eb -> SidebarNav, e -> pathname, a -> profile, n -> isCollapsed, l -> isMobile, i -> isIconOnly, s -> discordUrl, (callbacks) a -> item, (isNavItemActive) e -> pathname, t -> item

import { usePathname } from 'next/navigation'; // NOTE: module id: 618566
import { 
 HandCoinsIcon, 
 WrenchIcon, 
 LightbulbIcon,
 BookOpenIcon, 
 SquaresFourIcon,
 BookmarkSimpleIcon, 
 PackageIcon, 
 PlugsConnectedIcon,
 GraduationCapIcon, 
 QuestionIcon, 
 GearSixIcon,
 DiscordLogoIcon 
} from '@phosphor-icons/react'; 
import { cn } from '@/libs/utils/className'; 
import { getDiscordInviteUrl } from '@/libs/config/discord'; // NOTE: module id: 768947

import SidebarGroup from '@/features/sidebar/SidebarGroup'; // NOTE: module id: 166509
import SidebarItem from '@/features/sidebar/SidebarItem'; // NOTE: module id: 812543
import { useUser } from '@/contexts/UserProvider'; // NOTE: module id: 201220
import { useSidebar } from '@/contexts/SidebarProvider'; // NOTE: module id: 855382
import NotificationsButton from '@/components/notifications/NotificationsButton';

const PLATFORM_NAV_ITEMS = [
  { title: 'Animations', url: '/animations', icon: SquaresFourIcon, exact: true },
  { title: 'Saved', url: '/animations/saved', icon: BookmarkSimpleIcon, exact: true },
  { title: 'Kits', url: '/account/kits', icon: PackageIcon },
  { title: 'Roadmap', url: '/roadmap', icon: LightbulbIcon },
];

const SUPPORT_NAV_ITEMS = [
  { title: 'Documentation', url: '/docs', icon: BookOpenIcon },
  { title: 'MCP server', url: '/docs/guides/mcp', icon: PlugsConnectedIcon, exact: true },
  { title: 'Learn', url: '/learn', icon: GraduationCapIcon },
  { title: 'Tools', url: '/tools', icon: WrenchIcon },
  { title: 'Help & Support', url: '/help', icon: QuestionIcon },
  { title: 'Settings', url: '/settings', icon: GearSixIcon },
];

function isNavItemActive(pathname, item) {
  return item.exact
    ? pathname === item.url
    : pathname === item.url || pathname.startsWith(`${item.url}/`);
}

// NOTE: module id: 583246
export default function SidebarNav() {
  const pathname = usePathname();
  const { profile } = useUser();
  const { isCollapsed, isMobile } = useSidebar();
  const isIconOnly = isCollapsed && !isMobile;
  const discordUrl = getDiscordInviteUrl(profile);

  return (
    <>
      <SidebarGroup label="Platform">
        {PLATFORM_NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.url}
            href={item.url}
            icon={item.icon}
            label={item.title}
            active={isNavItemActive(pathname, item)}
            badge={item.badge}
          />
        ))}
      </SidebarGroup>
      <SidebarGroup label="Support">
        {SUPPORT_NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.url}
            href={item.url}
            icon={item.icon}
            label={item.title}
            active={isNavItemActive(pathname, item)}
          />
        ))}
        <SidebarItem
          href={discordUrl}
          icon={DiscordLogoIcon}
          label="Discord"
          external
        />
      </SidebarGroup>
      <div
        className={cn('mt-auto flex flex-col pt-8', isIconOnly ? 'px-12' : 'px-8')}
      >
        <SidebarItem
          href="/affiliate"
          icon={HandCoinsIcon}
          label="Earn 25%"
          active={isNavItemActive(pathname, { url: '/affiliate' })}
        />
      </div>
      <div className={cn(isIconOnly ? 'px-0 py-8' : 'px-8 py-8')}>
        <NotificationsButton />
      </div>
    </>
  );
}
