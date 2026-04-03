import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreateApplicationDialog } from "@/components/features/create-application-dialog";
import { ApplicationActions } from "./application-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, ExternalLink } from "lucide-react";

const statusColors: Record<string, string> = {
  Wishlist: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Applied: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  OA: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  Interview: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Offer: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default async function ApplicationsPage() {
  const user = await getUser();

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !["Rejected", "Offer"].includes(a.status)).length,
    interviews: applications.filter((a) => a.status === "Interview").length,
    offers: applications.filter((a) => a.status === "Offer").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage your job applications
          </p>
        </div>
        <CreateApplicationDialog />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Interviews", value: stats.interviews },
          { label: "Offers", value: stats.offers },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No applications yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Start tracking your first application
            </p>
            <CreateApplicationDialog />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Applied</TableHead>
                  <TableHead className="hidden lg:table-cell">Follow-up</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {app.company}
                        {app.link && (
                          <a href={app.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[app.status] || ""} variant="secondary">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {app.location || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {app.dateApplied?.toLocaleDateString() || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {app.nextFollowUpDate?.toLocaleDateString() || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <ApplicationActions id={app.id} currentStatus={app.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
