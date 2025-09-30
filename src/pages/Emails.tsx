import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import fetchInstance from "@/utils/api";
import { Mail, Send, CheckCircle, XCircle } from "lucide-react";

interface EmailTemplate {
  name: string;
  path: string;
  description: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    name: "Activation",
    path: "templates/activation.html",
    description: "Account activation email",
  },
  {
    name: "Confirmation",
    path: "templates/confirmation.html",
    description: "Application confirmation email",
  },
  {
    name: "Hacker Package",
    path: "templates/hacker_package.html",
    description: "Hacker package information email",
  },
  {
    name: "Password Reset",
    path: "templates/password_reset.html",
    description: "Password reset email",
  },
  {
    name: "RSVP",
    path: "templates/rsvp.html",
    description: "Event RSVP email with QR code",
  },
];

const statusOptions = [
  { value: "ACCOUNT_INACTIVE", label: "Account Inactive" },
  { value: "NOT_APPLIED", label: "Not Applied" },
  { value: "APPLYING", label: "Applying" },
  { value: "APPLIED", label: "Applied" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ACCEPTED_INVITE", label: "Accepted Invite" },
  { value: "REJECTED_INVITE", label: "Rejected Invite" },
  { value: "SCANNED_IN", label: "Scanned In" },
  { value: "WALK_IN", label: "Walk In" },
  { value: "WALK_IN_SUBMITTED", label: "Walk In Submitted" },
];

function Emails() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [textBody, setTextBody] = useState<string>("");
  const [contextData, setContextData] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleSendBulkEmail = async () => {
    if (!selectedTemplate || !selectedStatus || !subject || !textBody) {
      toast.error("Please fill in all required fields");
      return;
    }

    let context = {};
    if (contextData.trim()) {
      try {
        context = JSON.parse(contextData);
      } catch (error) {
        toast.error("Invalid JSON in context field");
        return;
      }
    }

    setIsSending(true);

    try {
      const response = await fetchInstance("admin/account/send_bulk_email", {
        method: "POST",
        body: JSON.stringify({
          template_path: selectedTemplate,
          status: selectedStatus,
          subject: subject,
          text_body: textBody,
          context: context,
        }),
      });

      const successMessage = `${response.message}\nTotal: ${response.total_recipients} | Sent: ${response.emails_sent} | Failed: ${response.emails_failed}`;

      if (response.emails_failed > 0) {
        toast.warning(successMessage, {
          duration: 5000,
        });
        console.error("Failed emails:", response.failures);
      } else {
        toast.success(successMessage, {
          duration: 5000,
        });
      }

      // Reset form
      setSelectedTemplate("");
      setSelectedStatus("");
      setSubject("");
      setTextBody("");
      setContextData("");
    } catch (error) {
      toast.error(
        `Failed to send emails: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen gap-4">
      <NavMenu />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Bulk Email Sender
            </h1>
            <p className="text-muted-foreground mt-2">
              Send emails to all users with a specific application status
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Select a template, target status, and customize your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template">Email Template *</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select an email template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.path} value={template.path}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {template.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Target Status *</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select application status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textBody">Text Body *</Label>
                <Textarea
                  id="textBody"
                  placeholder="Enter plain text version of the email"
                  rows={4}
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">
                  Template Context (JSON, Optional)
                </Label>
                <Textarea
                  id="context"
                  placeholder='{"discord_link": "https://...", "devpost_link": "https://...", "hacker_package_link": "https://..."}'
                  rows={4}
                  value={contextData}
                  onChange={(e) => setContextData(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Variables available by default: first_name, last_name, email.
                  Add custom template variables here as JSON.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSendBulkEmail}
                  disabled={
                    isSending ||
                    !selectedTemplate ||
                    !selectedStatus ||
                    !subject ||
                    !textBody
                  }
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending..." : "Send Bulk Email"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p>
                  Emails are sent to all active users with the selected
                  application status
                </p>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p>
                  Template variables like first_name, last_name, and email are
                  automatically included
                </p>
              </div>
              <div className="flex gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p>
                  This action cannot be undone - double check your configuration
                  before sending
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Emails;
