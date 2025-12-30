import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Droplets, Search, ClipboardList, LogOut, Building2, Menu, X, UserSearch, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useHospital } from "@/contexts/HospitalContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTip } from "@/components/InfoTip";
import { cn } from "@/lib/utils";
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();
  const { hospitals, selectedHospital, setSelectedHospital, loading: hospitalsLoading } = useHospital();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  
  const navItems = [
    {
      path: "/dashboard",
      label: "New Request",
      icon: Droplets,
      tooltip: "Create a new blood donation request",
    },
    {
      path: "/donors",
      label: "Search Donors",
      icon: Search,
      tooltip: "Search for available blood donors",
    },
    {
      path: "/donor-lookup",
      label: "Donor Lookup",
      icon: UserSearch,
      tooltip: "Find shortlisted donor by campaign ID",
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: BarChart3,
      tooltip: "View campaign metrics and call transactions",
    },
    {
      path: "/requests",
      label: "View Requests",
      icon: ClipboardList,
      tooltip: "View all blood requests",
    },
  ];
  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blood droplet backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="absolute -right-20 top-1/4 w-96 h-96 text-blood opacity-10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5 C50 5 15 45 15 65 C15 85 30 95 50 95 C70 95 85 85 85 65 C85 45 50 5 50 5 Z" />
        </svg>
        <svg
          className="absolute -left-10 bottom-1/4 w-64 h-64 text-blood opacity-20"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5 C50 5 15 45 15 65 C15 85 30 95 50 95 C70 95 85 85 85 65 C85 45 50 5 50 5 Z" />
        </svg>
      </div>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-blood shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - clickable to home */}
            <Link to="/">
              <Logo size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={cn("gap-2", isActive(item.path) && "medical-gradient")}
                  >
                    <item.icon size={16} className="text-blood" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Hospital Selector */}
              <div className="hidden sm:flex items-center gap-2">
                <Building2 size={16} className="text-blood" />
                <Select
                  value={selectedHospital?.id || ""}
                  onValueChange={(value) => {
                    const hospital = hospitals.find((h) => h.id === value);
                    setSelectedHospital(hospital || null);
                  }}
                >
                  <SelectTrigger className="w-[200px] h-9 text-sm">
                    <SelectValue placeholder={hospitalsLoading ? "Loading..." : "Select Hospital"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    {hospitalsLoading ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">Loading hospitals...</div>
                    ) : hospitals.length === 0 ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">No hospitals found</div>
                    ) : (
                      hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Sign out button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden md:flex gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut size={16} />
                Sign Out
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-fade-in">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Hospital Selector Mobile */}
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Building2 size={16} className="text-muted-foreground" />
                <Select
                  value={selectedHospital?.id || ""}
                  onValueChange={(value) => {
                    const hospital = hospitals.find((h) => h.id === value);
                    setSelectedHospital(hospital || null);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={hospitalsLoading ? "Loading..." : "Select Hospital"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    {hospitalsLoading ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">Loading hospitals...</div>
                    ) : hospitals.length === 0 ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">No hospitals found</div>
                    ) : (
                      hospitals.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={cn("w-full justify-start gap-3", isActive(item.path) && "medical-gradient")}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Button>
                </Link>
              ))}

              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              >
                <LogOut size={18} />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};
