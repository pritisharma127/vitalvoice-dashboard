import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Droplets, Search, UserSearch, BarChart3, ClipboardList, ArrowRight, Phone, Users, Hospital, CheckCircle, PhoneCall, UserCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    donorsAccepted: 0,
    totalCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all call transactions
        const { data, error } = await supabase
          .from("call_transactions")
          .select("*");

        if (error) throw error;

        const transactions = data || [];
        
        // Total calls
        const totalCalls = transactions.length;
        
        // Donors accepted (same logic as Analytics)
        const donorsAccepted = transactions.filter(t => 
          t.donor_selected?.toLowerCase() === 'yes' || 
          t.availability?.toLowerCase() === 'yes'
        ).length;
        
        // Unique campaigns
        const totalCampaigns = new Set(transactions.map(t => t.campaign_id)).size;

        setStats({
          totalCalls,
          donorsAccepted,
          totalCampaigns,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: Droplets,
      title: "New Request",
      description: "Create blood donation requests quickly with patient details and urgency levels.",
      path: "/dashboard",
      color: "text-destructive",
    },
    {
      icon: Search,
      title: "Search Donors",
      description: "Find available blood donors by location, blood type, and proximity.",
      path: "/donors",
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      icon: UserSearch,
      title: "Donor Lookup",
      description: "Find shortlisted donors by campaign ID with full details and distance info.",
      path: "/donor-lookup",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View campaign metrics, call statistics, and donor response insights.",
      path: "/analytics",
      color: "text-purple-500 dark:text-purple-400",
    },
    {
      icon: ClipboardList,
      title: "View Requests",
      description: "Track all blood requests with status updates and history.",
      path: "/requests",
      color: "text-amber-500 dark:text-amber-400",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: Hospital,
      title: "Hospital Creates Request",
      description: "Hospitals submit urgent blood requirements with patient details",
    },
    {
      step: 2,
      icon: Users,
      title: "AI Calls Donors",
      description: "Our voice AI contacts matching donors based on blood type & proximity",
    },
    {
      step: 3,
      icon: Phone,
      title: "Donors Respond",
      description: "Donors confirm availability through automated voice conversations",
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Match & Connect",
      description: "Shortlisted donors are connected with hospitals for life-saving donations",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="absolute -right-20 top-1/4 w-96 h-96 text-destructive opacity-10 dark:opacity-5"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5 C50 5 15 45 15 65 C15 85 30 95 50 95 C70 95 85 85 85 65 C85 45 50 5 50 5 Z" />
        </svg>
        <svg
          className="absolute -left-10 bottom-1/4 w-64 h-64 text-destructive opacity-20 dark:opacity-10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 5 C50 5 15 45 15 65 C15 85 30 95 50 95 C70 95 85 85 85 65 C85 45 50 5 50 5 Z" />
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-destructive/5 to-transparent dark:from-destructive/10" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button className="medical-gradient text-primary-foreground gap-2">
                Get Started
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-red-400 text-sm font-medium mb-6 animate-fade-in">
            <Droplets size={16} />
            AI-Powered Blood Donor Matching
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The <span className="text-destructive dark:text-red-400">Call</span> for Life
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            VitalVoice uses AI-powered voice calls to connect hospitals with blood donors instantly. 
            Our automated system finds matching donors, contacts them, and coordinates life-saving donations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="medical-gradient text-primary-foreground gap-2 px-8">
                <Phone size={20} />
                Start Saving Lives
              </Button>
            </Link>
            <Link to="/api-docs">
              <Button size="lg" variant="outline" className="gap-2 border-border hover:bg-muted">
                API Documentation
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Counter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 text-primary mb-4">
              <PhoneCall size={28} />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                <AnimatedCounter end={stats.totalCalls} suffix={stats.totalCalls > 0 ? "+" : ""} duration={2500} />
              )}
            </div>
            <p className="text-muted-foreground font-medium">Total Calls</p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 mb-4">
              <UserCheck size={28} />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                <AnimatedCounter end={stats.donorsAccepted} suffix={stats.donorsAccepted > 0 ? "+" : ""} duration={2500} />
              )}
            </div>
            <p className="text-muted-foreground font-medium">Donors Accepted</p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 mb-4">
              <Activity size={28} />
            </div>
            <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {loading ? (
                <span className="animate-pulse">---</span>
              ) : (
                <AnimatedCounter end={stats.totalCampaigns} suffix={stats.totalCampaigns > 0 ? "+" : ""} duration={2500} />
              )}
            </div>
            <p className="text-muted-foreground font-medium">Total Campaigns</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">From urgent request to life-saving donation in minutes</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {howItWorks.map((item, index) => (
            <div key={item.step} className="relative">
              <Card className="h-full bg-card border-border hover:border-destructive/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-destructive/5">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-red-400 mb-4">
                    <item.icon size={28} />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-destructive text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
              {index < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-destructive/30" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-20 bg-muted/30 dark:bg-muted/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Portal Features</h2>
          <p className="text-muted-foreground text-lg">Everything you need to manage blood donation campaigns</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Link key={feature.path} to={feature.path}>
              <Card className="h-full bg-card border-border hover:border-destructive/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-destructive/5 group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-muted dark:bg-muted/50 ${feature.color}`}>
                      <feature.icon size={24} />
                    </div>
                    <CardTitle className="text-lg text-foreground group-hover:text-destructive dark:group-hover:text-red-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                  <div className="mt-4 flex items-center gap-2 text-destructive dark:text-red-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Go to {feature.title}
                    <ArrowRight size={14} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Quick Access</h2>
          <p className="text-muted-foreground">Jump directly to any section</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {features.map((feature) => (
            <Link key={feature.path} to={feature.path}>
              <Button variant="outline" className="gap-2 border-border hover:border-destructive hover:text-destructive dark:hover:text-red-400 dark:hover:border-red-400">
                <feature.icon size={18} className={feature.color} />
                {feature.title}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <Logo size="sm" className="justify-center mb-4" />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} VitalVoice. The Call for Life.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
