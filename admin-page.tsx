import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, insertModeratorSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, Plus, Calendar, Building2, Phone, Upload, Pencil, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModeratorIdCard } from "@/components/moderator-id-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [editingModerator, setEditingModerator] = useState<User | null>(null);
  const [deletingModerator, setDeletingModerator] = useState<User | null>(null);

  const form = useForm({
    resolver: zodResolver(insertModeratorSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      badgeNumber: "",
      profileImage: "",
      designation: "",
      department: "",
      joinDate: new Date().toISOString().split('T')[0],
      contactInfo: "",
    },
  });

  const { data: moderators } = useQuery<User[]>({
    queryKey: ["/api/admin/moderators"],
  });

  const createModeratorMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/moderators", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderators"] });
      form.reset();
      toast({
        title: "Success",
        description: "Moderator created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateModeratorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/moderators/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderators"] });
      setEditingModerator(null);
      form.reset();
      toast({
        title: "Success",
        description: "Moderator updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteModeratorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/moderators/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderators"] });
      setDeletingModerator(null);
      toast({
        title: "Success",
        description: "Moderator deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      form.setValue('profileImage', data.url);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleEdit = (moderator: User) => {
    setEditingModerator(moderator);
    form.reset({
      username: moderator.username,
      password: "", // Don't populate password for security
      fullName: moderator.fullName,
      badgeNumber: moderator.badgeNumber,
      profileImage: moderator.profileImage || "",
      designation: moderator.designation || "",
      department: moderator.department || "",
      joinDate: moderator.joinDate || new Date().toISOString().split('T')[0],
      contactInfo: moderator.contactInfo || "",
    });
  };

  const handleSubmit = (data: any) => {
    if (editingModerator) {
      // If editing, only send fields that have changed
      const updatedFields = Object.keys(data).reduce((acc: any, key) => {
        if (data[key] !== "" && (!editingModerator[key as keyof User] || data[key] !== editingModerator[key as keyof User])) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      updateModeratorMutation.mutate({ 
        id: editingModerator.id, 
        data: updatedFields 
      });
    } else {
      createModeratorMutation.mutate(data);
    }
  };

  if (!user) return null;

  if (user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Portal</h1>
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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">
              {editingModerator ? 'Edit Moderator' : 'Create New Moderator'}
            </h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder={editingModerator ? "Leave blank to keep current password" : "Enter password"}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="badgeNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter badge number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Image URL"
                              {...field}
                              readOnly
                            />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        {field.value && (
                          <div className="mt-2">
                            <img
                              src={field.value}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter designation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Building2 className="w-4 h-4 inline mr-1" />
                          Department
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="joinDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Join Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Phone className="w-4 h-4 inline mr-1" />
                          Contact Info
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createModeratorMutation.isPending || updateModeratorMutation.isPending}
                  >
                    {editingModerator ? (
                      <>
                        <Pencil className="h-4 w-4 mr-2" />
                        Update Moderator
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Moderator
                      </>
                    )}
                  </Button>
                  {editingModerator && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingModerator(null);
                        form.reset({
                          username: "",
                          password: "",
                          fullName: "",
                          badgeNumber: "",
                          profileImage: "",
                          designation: "",
                          department: "",
                          joinDate: new Date().toISOString().split('T')[0],
                          contactInfo: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Existing Moderators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moderators?.map((moderator) => (
              <div key={moderator.id} className="relative">
                <ModeratorIdCard user={moderator} />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(moderator)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="bg-red-100 hover:bg-red-200"
                    onClick={() => setDeletingModerator(moderator)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AlertDialog open={!!deletingModerator} onOpenChange={() => setDeletingModerator(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Moderator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingModerator?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deletingModerator && deleteModeratorMutation.mutate(deletingModerator.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}