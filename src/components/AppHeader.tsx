import { Leaf, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const AppHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-6">
        <a href="/" className="flex items-center gap-2 text-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl">CropGuard</span>
        </a>
        <nav className="flex items-center gap-6">
          <a href="#scan" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Scan
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          {user ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
