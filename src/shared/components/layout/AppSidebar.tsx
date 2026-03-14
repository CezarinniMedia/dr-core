import {
  LayoutDashboard,
  Package,
  Users,
  Search,
  Sparkles,
  FileText,
  BarChart3,
  Zap,
  Settings,
} from "lucide-react";
import { NavLink } from "@/shared/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/shared/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Ofertas", href: "/ofertas", icon: Package },
  { title: "Avatar & Research", href: "/avatar", icon: Users },
  { title: "Radar de Ofertas", href: "/spy", icon: Search },
  { title: "Criativos", href: "/criativos", icon: Sparkles },
  { title: "Páginas", href: "/paginas", icon: FileText },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Prompts & Agents", href: "/prompts", icon: Zap },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-accent-foreground tracking-tight">
          DR <span className="text-primary">Ops</span>
        </h1>
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs font-semibold uppercase tracking-wider mb-2">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.href}
                      end={item.href === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Configurações</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
