import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IdCard, Bell, ChevronDown } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getNavLinkClass = (path: string) => {
    return isActive(path)
      ? "text-gov-blue font-medium border-b-2 border-gov-blue pb-4"
      : "text-gov-gray hover:text-gov-blue transition-colors pb-4";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gov-blue rounded-lg flex items-center justify-center">
                <IdCard className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ghana Registry</h1>
                <p className="text-sm text-gov-gray">Birth & Death Registration</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className={getNavLinkClass("/")}>Dashboard</span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gov-gray hover:text-gov-blue transition-colors pb-4 flex items-center space-x-1">
                  <span>Register</span>
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/register/birth">Birth Certificate</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register/death">Death Certificate</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/verify">
              <span className={getNavLinkClass("/verify")}>Verify</span>
            </Link>
            {(user?.role === 'admin' || user?.role === 'registrar') && (
              <Link href="/admin">
                <span className={getNavLinkClass("/admin")}>Admin</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2 text-gov-gray hover:text-gov-blue">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="text-sm text-gov-gray" size={16} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
