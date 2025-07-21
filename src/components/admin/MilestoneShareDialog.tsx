
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Calendar } from "lucide-react";
import { supabase } from "@/lib/db-client";

interface MilestoneShareDialogProps {
  milestoneId: string;
  milestoneName: string;
  children: React.ReactNode;
}

const MilestoneShareDialog = ({ milestoneId, milestoneName, children }: MilestoneShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const [shareToken, setShareToken] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Insert the share token using a direct insert
      const { error } = await (supabase as any)
        .from('milestone_share_tokens')
        .insert({
          milestone_id: milestoneId,
          token,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (error) throw error;

      const shareUrl = `${window.location.origin}/milestone/${token}`;
      setShareToken(shareUrl);

      toast({
        title: "Share Link Generated",
        description: "The milestone share link has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareToken);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard.",
    });
  };

  const sendWhatsApp = () => {
    const message = `Check out the milestone progress for "${milestoneName}": ${shareToken}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Milestone
          </DialogTitle>
          <DialogDescription>
            Generate a shareable link for "{milestoneName}" that others can use to view progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="expiry">Link expires after (days)</Label>
            <Input
              id="expiry"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
              min="1"
              max="365"
            />
          </div>

          {!shareToken ? (
            <Button onClick={generateShareLink} disabled={loading} className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareToken} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={sendWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                  Send via WhatsApp
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneShareDialog;
