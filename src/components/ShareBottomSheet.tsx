import { useState } from "react";
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateInstagramStory, downloadImage, type TreatImageData } from "@/lib/instagramStoryGenerator";
import { recordShare, type TreatResponse } from "@/lib/treatService";
import { Instagram, MessageCircle, Copy, Share } from "lucide-react";

interface ShareBottomSheetProps {
  treatData: TreatResponse | any;
  trigger?: React.ReactNode;
}

interface ShareOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => Promise<void>;
}

export const ShareBottomSheet = ({ treatData, trigger }: ShareBottomSheetProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `Someone sent me a clink! Check it out ✨`;

  // Record share analytics
  const trackShare = async (platform: string) => {
    if (treatData?.id) {
      try {
        await recordShare(treatData.id, platform);
      } catch (error) {
        console.error('Failed to record share:', error);
      }
    }
  };

  // Instagram Story sharing
  const shareToInstagramStory = async () => {
    try {
      setIsGenerating(true);
      
      // Prepare data for image generation
      const imageData: TreatImageData = {
        senderName: treatData.senderName || "Someone",
        headerText: treatData.headerText,
        headerFont: treatData.headerFont,
        coverArt: treatData.coverArt,
        coverArtType: treatData.coverArtType,
        treatType: treatData.treatType || "5",
        message: treatData.message,
        theme: treatData.theme || "primary"
      };

      // Generate the image
      const blob = await generateInstagramStory(imageData);
      
      // Check if Web Share API with files is supported
      const canShareFiles = navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'story.png')] });
      
      if (canShareFiles) {
        try {
          // Create a file from the blob
          const file = new File([blob], `${treatData.senderName}-clink-story.png`, {
            type: 'image/png',
          });

          // Use Web Share API to share the file
          await navigator.share({
            title: 'Check out this clink!',
            text: 'Someone sent me a clink! ✨',
            files: [file]
          });

          await trackShare('instagram_story_native');
          setIsOpen(false);
          
          toast({
            title: "Shared! 📱",
            description: "Image ready to share to Instagram Stories!",
          });
          return;
          
        } catch (shareError) {
          // If user cancels sharing, don't show error
          if (shareError instanceof Error && shareError.name === 'AbortError') {
            setIsOpen(false);
            return;
          }
          console.log('Native sharing failed, falling back to download:', shareError);
        }
      }
      
      // Fallback: Try Instagram deep link on mobile
      if (isMobile && navigator.userAgent.includes('Instagram')) {
        const instagramUrl = `instagram://story-camera`;
        window.location.href = instagramUrl;
        
        // Also download the image for manual upload
        downloadImage(blob, `${treatData.senderName}-clink-story.png`);
        toast({
          title: "Opening Instagram + Downloaded Image 📱",
          description: "Upload the downloaded image to your story",
        });
      } else if (isMobile) {
        // On mobile without Instagram app, download with instructions
        downloadImage(blob, `${treatData.senderName}-clink-story.png`);
        toast({
          title: "Image Downloaded! 📱",
          description: "Open Instagram Stories and upload the image from your gallery",
        });
      } else {
        // On desktop, download with instructions
        downloadImage(blob, `${treatData.senderName}-clink-story.png`);
        toast({
          title: "Image Downloaded! 💻",
          description: "Upload this image to your Instagram Story from your phone",
        });
      }

      await trackShare('instagram_story');
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error sharing to Instagram Story:', error);
      toast({
        title: "Oops! Something went wrong",
        description: "Couldn't create the Instagram Story image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Messages (SMS) sharing
  const shareToMessages = async () => {
    try {
      const smsBody = encodeURIComponent(`${shareText} ${shareUrl}`);
      const smsUrl = `sms:?body=${smsBody}`;
      window.location.href = smsUrl;
      
      await trackShare('sms');
      setIsOpen(false);
      
      toast({
        title: "Opening Messages... 💬",
        description: "Share your clink via text message!",
      });
    } catch (error) {
      console.error('Error opening Messages:', error);
      // Fallback to copy link
      await copyLink();
    }
  };

  // Copy link sharing
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      await trackShare('clipboard');
      setIsOpen(false);
      
      toast({
        title: "Link copied! 🔗",
        description: "Share this link with friends",
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Oops!",
        description: "Couldn't copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  // Native share (more options)
  const shareNatively = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'clink',
          text: shareText,
          url: shareUrl
        });
        
        await trackShare('native_share');
        setIsOpen(false);
        
        toast({
          title: "Shared! 📤",
          description: "Thanks for sharing the love!",
        });
      } else {
        // Fallback to copy link if native sharing not available
        await copyLink();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error with native sharing:', error);
        // Fallback to copy link
        await copyLink();
      }
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'instagram',
      icon: <Instagram className="w-6 h-6" />,
      label: 'Instagram Story',
      description: 'Create a beautiful story image',
      action: shareToInstagramStory
    },
    {
      id: 'messages',
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'Messages',
      description: 'Send via text message',
      action: shareToMessages
    },
    {
      id: 'copy',
      icon: <Copy className="w-6 h-6" />,
      label: 'Copy Link',
      description: 'Copy to clipboard',
      action: copyLink
    },
    {
      id: 'more',
      icon: <Share className="w-6 h-6" />,
      label: 'More Options',
      description: 'Other sharing apps',
      action: shareNatively
    }
  ];

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-button hover:shadow-glow transition-all duration-300">
            📤 Share This
          </Button>
        )}
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-xl font-bold">Share your clink</DrawerTitle>
          <DrawerDescription className="text-muted-foreground">
            Spread the love and share this sweet moment
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-8 space-y-3">
          {shareOptions.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full h-16 justify-start p-4 bg-white/80 hover:bg-white border-2 border-border/50 hover:border-border rounded-2xl transition-all duration-200"
              onClick={option.action}
              disabled={isGenerating && option.id === 'instagram'}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="flex-shrink-0 text-foreground">
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">
                    {option.id === 'instagram' && isGenerating ? 'Creating Story...' : option.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
                {option.id === 'instagram' && isGenerating && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-muted-foreground">
            ✨ Sharing spreads the joy of giving
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};