import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Activity, Briefcase, LayoutDashboard, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/server"
import { signOut } from "@/app/login/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-zinc-950 text-zinc-50 w-full">
        <Sidebar className="border-r border-zinc-800 bg-zinc-900">
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-500" />
              Quant-Track
            </h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400 font-medium py-6 px-4" render={<a href="/dashboard" />}>
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400 font-medium py-6 px-4" render={<a href="/dashboard/backtest" />}>
                      <Activity className="h-5 w-5" />
                      <span>Backtest Engine</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-zinc-400 hover:bg-zinc-800 hover:text-emerald-400 font-medium py-6 px-4" render={<a href="/dashboard/portfolio" />}>
                      <Briefcase className="h-5 w-5" />
                      <span>Paper Trading</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Navbar */}
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950 px-4 md:px-8">
            <div className="flex items-center gap-2 text-white">
              <SidebarTrigger className="hover:bg-zinc-800" />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer outline-none shadow-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-500">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-zinc-200">{user?.user_metadata?.display_name || user?.email || "Profile"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white mt-2 shadow-2xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-zinc-400 text-xs uppercase tracking-wider">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer p-0">
                    <a href="/dashboard/settings" className="w-full px-3 py-2 block">
                      Settings
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-red-400 cursor-pointer p-0">
                    <form action={signOut} className="w-full">
                      <button type="submit" className="w-full text-left px-3 py-2">
                        Log out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
