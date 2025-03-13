import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Shield } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const adminRegisterSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, adminRegisterMutation } = useAuth();

  if (user) {
    setLocation(user.role === "admin" ? "/admin" : "/");
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const adminRegisterForm = useForm<AdminRegisterFormData>({
    resolver: zodResolver(adminRegisterSchema),
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Portal Access</CardTitle>
            </div>
            <CardDescription>
              Sign in or register as an administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="moderator" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="moderator">Moderator</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="admin-register">Register Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="moderator">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Login as Moderator
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="admin">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter admin username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter admin password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Login as Admin
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="admin-register">
                <Form {...adminRegisterForm}>
                  <form
                    onSubmit={adminRegisterForm.handleSubmit((data) =>
                      adminRegisterMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={adminRegisterForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose admin username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adminRegisterForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose strong password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adminRegisterForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={adminRegisterMutation.isPending}
                    >
                      {adminRegisterMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Register as Admin
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 bg-primary p-8 text-primary-foreground flex items-center justify-center">
        <div className="max-w-md space-y-6">
          <Badge variant="secondary">Authentication Portal</Badge>
          <h1 className="text-4xl font-bold">Welcome to the Portal</h1>
          <p className="text-lg opacity-90">
            Access your dashboard securely. Administrators can manage moderators, while moderators can view their virtual ID cards.
          </p>
        </div>
      </div>
    </div>
  );
}