import { useAuth } from "@/hooks/use-auth";
import { ModeratorIdCard } from "@/components/moderator-id-card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function ModeratorPage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;
  
  // Redirect admins to admin page
  if (user.role === "admin") {
    setLocation("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Moderator Portal</h1>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-bold text-center">Your Virtual ID Card</h2>
          <p className="text-muted-foreground text-center max-w-md">
            This is your official virtual moderator identification card. 
            Keep it secure and do not share it with others.
          </p>
          <ModeratorIdCard user={user} />
        </div>
      </main>
    </div>
  );
}
