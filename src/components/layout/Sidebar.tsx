import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BarChart2,
  Folders,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  Brain,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Shield,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

const SIDEBAR_STATE_KEY = 'sidebar_collapsed';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  {
    icon: BarChart2,
    label: 'Metrics',
    href: '/metrics',
    subItems: [
      { icon: Clock, label: 'Time Cards', href: '/metrics/time-cards' },
      { icon: Archive, label: 'Archived', href: '/metrics/archived' },
      { icon: Brain, label: 'AI Assistant', href: '/metrics/ai-assistant' },
    ],
  },
  { icon: Folders, label: 'Projects', href: '/projects' },
  { icon: FileText, label: 'Referrals', href: '/referrals' },
  { icon: Users, label: 'Partners', href: '/partners' },
  { icon: BookOpen, label: 'Wiki', href: '/wiki' },
  { icon: Shield, label: 'ClaimReady+', href: '/claim-ready' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();

  const handleToggle = useCallback(() => {
    setCollapsed((prev: any) => {
      const newState = !prev;
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(newState));
      window.dispatchEvent(new CustomEvent('sidebarStateChange', {
        detail: { collapsed: newState }
      }));
      return newState;
    });
  }, []);

  const handleItemClick = (label: string) => {
    if (expandedItem === label) {
      setExpandedItem(null);
    } else {
      setExpandedItem(label);
    }
  };

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Sync sidebar state with localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <div
      className={cn(
        'sticky top-0 flex h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <span className="text-xl font-bold text-white">Heartland</span>}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'text-white hover:bg-white/10',
            collapsed && 'w-full'
          )}
          onClick={handleToggle}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <nav className="flex-1 space-y-2 p-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.subItems ? (
              collapsed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'group flex w-full items-center justify-center rounded-lg py-2 text-sm text-white transition-all hover:bg-white/10',
                        'px-1',
                        isItemActive(item.href) && 'bg-white/10'
                      )}
                      title={item.label}
                    >
                      <item.icon 
                        size={24} 
                        className="transition-transform group-hover:scale-105"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="ml-1 bg-gray-800">
                    {item.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.href} asChild>
                        <Link
                          to={subItem.href}
                          className={cn(
                            'flex items-center gap-2 text-sm text-white hover:bg-white/10',
                            isItemActive(subItem.href) && 'bg-white/5'
                          )}
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => handleItemClick(item.label)}
                    className={cn(
                      'group flex w-full items-center rounded-lg py-2 text-sm text-white transition-all hover:bg-white/10',
                      'px-3',
                      isItemActive(item.href) && 'bg-white/10'
                    )}
                  >
                    <item.icon 
                      size={24} 
                      className={cn(
                        'transition-transform group-hover:scale-105',
                        'mr-2'
                      )} 
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {expandedItem === item.label ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </button>
                  {expandedItem === item.label && (
                    <div className="ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          className={cn(
                            'flex items-center rounded-lg py-2 pl-4 pr-3 text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white',
                            isItemActive(subItem.href) && 'bg-white/10 text-white'
                          )}
                        >
                          <subItem.icon className="mr-2 h-4 w-4" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <Link
                to={item.href}
                className={cn(
                  'group flex items-center rounded-lg py-2 text-sm text-white transition-all hover:bg-white/10',
                  collapsed ? 'justify-center px-1' : 'px-3',
                  isItemActive(item.href) && 'bg-white/10'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon 
                  size={24} 
                  className={cn(
                    'transition-transform group-hover:scale-105',
                    !collapsed && 'mr-2'
                  )} 
                />
                {!collapsed && <span className="text-left">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'mb-2 w-full justify-start text-white hover:bg-white/10',
                collapsed ? 'justify-center px-1 py-2' : 'px-3'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {!collapsed && <span className="ml-2">John Doe</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full text-white hover:bg-white/10',
                collapsed ? 'justify-center px-1 py-2' : 'justify-start px-3'
              )}
            >
              <Settings className="h-6 w-6" />
              {!collapsed && <span className="ml-2">Settings</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>General</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuItem>Appearance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}