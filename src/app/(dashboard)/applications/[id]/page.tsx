import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, MapPin } from "lucide-react";

const statusColors: Record<string, string> = {
  Wishlist: "bg-slate-100 text-slate-700",
  Applied: "bg-blue-100 text-blue-700",
  OA: "bg-violet-100 text-violet-700",
  Interview: "bg-amber-100 text-amber-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id, userId: user.id },
  });

  if (!application) notFound();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/applications">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{application.company}</h1>
          <p className="text-muted-foreground text-sm">{application.role}</p>
        </div>
        <Badge className={statusColors[application.status] || ""} variant="secondary">
          {application.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {application.location}
              </div>
            )}
            {application.link && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a
                  href={application.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {application.link}
                </a>
              </div>
            )}
            {application.dateApplied && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Applied: {application.dateApplied.toLocaleDateString()}
              </div>
            )}
            {application.nextFollowUpDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Follow-up: {application.nextFollowUpDate.toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Resume:</span>{" "}
              {application.resumeVersion || "—"}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Cover Letter:</span>{" "}
              {application.coverLetterVersion || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {application.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
