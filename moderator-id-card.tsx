import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Building2, Calendar, Phone } from "lucide-react";

interface ModeratorIdCardProps {
  user: User;
}

export function ModeratorIdCard({ user }: ModeratorIdCardProps) {
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="w-96 bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {user.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.fullName} />
            ) : (
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.fullName}</h2>
            <Badge className="mt-1">
              <Shield className="w-3 h-3 mr-1" />
              {user.designation || "Moderator"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Badge Number</span>
            <span className="font-mono font-bold">{user.badgeNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username</span>
            <span>{user.username}</span>
          </div>
          {user.department && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Department
              </span>
              <span>{user.department}</span>
            </div>
          )}
          {user.joinDate && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Join Date
              </span>
              <span>{user.joinDate}</span>
            </div>
          )}
          {user.contactInfo && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Contact
              </span>
              <span>{user.contactInfo}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            This virtual ID card is property of the Moderator Portal. 
            If found, please return to the administration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}