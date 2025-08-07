/**
 * Instagram Story Image Generator
 * Creates 1080x1920 images for Instagram Stories based on treat data
 */

export interface TreatImageData {
  senderName: string;
  headerText?: string;
  headerFont?: string;
  coverArt?: string;
  coverArtType?: string;
  treatType: string;
  message?: string;
  theme?: string;
}

// Instagram Story dimensions
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

// Load custom fonts
const loadFonts = async () => {
  const fonts = [
    { family: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
    { family: 'Dancing Script', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap' }
  ];

  try {
    await Promise.all(fonts.map(font => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.url;
      document.head.appendChild(link);
      return new Promise(resolve => {
        link.onload = resolve;
        link.onerror = resolve; // Continue even if font fails
      });
    }));
    
    // Wait for fonts to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.warn('Failed to load custom fonts:', error);
  }
};

// Get font family based on headerFont
const getFontFamily = (headerFont?: string): string => {
  switch (headerFont) {
    case 'playfair': return 'Playfair Display, serif';
    case 'dancing': return 'Dancing Script, cursive';
    case 'arial': return 'Arial, sans-serif';
    default: return 'system-ui, -apple-system, sans-serif';
  }
};

// Get treat emoji
const getTreatEmoji = (type: string): string => {
  switch (type) {
    case "5": return "☕️";
    case "10": return "🥗";
    default: return "💝";
  }
};

// Get treat description
const getTreatDescription = (type: string): string => {
  switch (type) {
    case "5": return "coffee";
    case "10": return "lunch";
    default: return "clink";
  }
};

// Get theme gradient colors
const getThemeColors = (theme?: string): { start: string; end: string } => {
  switch (theme) {
    case "secondary": 
      return { start: '#A855F7', end: '#C084FC' }; // purple-500 to purple-400
    case "card": 
      return { start: '#FFFFFF', end: '#F3F4F6' }; // white to gray-100
    default: 
      return { start: '#7C3AED', end: '#A855F7' }; // violet-600 to purple-500
  }
};

// Draw rounded rectangle
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// Create gradient background
const createGradientBackground = (
  ctx: CanvasRenderingContext2D, 
  colors: { start: string; end: string }
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, STORY_HEIGHT);
  gradient.addColorStop(0, colors.start);
  gradient.addColorStop(1, colors.end);
  return gradient;
};

// Extract first frame from GIF (simplified - just returns the URL for now)
const extractGifFrame = async (gifUrl: string): Promise<string> => {
  // For now, just return the GIF URL - browsers can handle this
  return gifUrl;
};

// Load image with error handling
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Wrap text to fit within specified width
const wrapText = (
  ctx: CanvasRenderingContext2D, 
  text: string, 
  maxWidth: number, 
  lineHeight: number
): { lines: string[]; totalHeight: number } => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return {
    lines,
    totalHeight: lines.length * lineHeight
  };
};

export const generateInstagramStory = async (treatData: TreatImageData): Promise<Blob> => {
  try {
    // Load fonts first
    await loadFonts();

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = STORY_WIDTH;
    canvas.height = STORY_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Enable text anti-aliasing
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Background gradient
    const themeColors = getThemeColors(treatData.theme);
    const backgroundGradient = createGradientBackground(ctx, themeColors);
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

    // 2. Top section - Sender name with decorative elements
    const topY = 160;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${treatData.senderName} sent you something 💌`, STORY_WIDTH / 2, topY);

    // 3. Header text with custom font
    const headerY = 280;
    const headerText = treatData.headerText || 
      `$${treatData.treatType === "custom" ? "25" : treatData.treatType} ${getTreatDescription(treatData.treatType)} clink`;
    
    ctx.fillStyle = 'white';
    ctx.font = `bold 48px ${getFontFamily(treatData.headerFont)}`;
    
    // Wrap header text if too long
    const headerWrapped = wrapText(ctx, headerText, STORY_WIDTH - 100, 60);
    headerWrapped.lines.forEach((line, index) => {
      ctx.fillText(line, STORY_WIDTH / 2, headerY + (index * 60));
    });

    // 4. Cover art section (square in center)
    const coverArtSize = 600;
    const coverArtX = (STORY_WIDTH - coverArtSize) / 2;
    const coverArtY = 450;

    // Draw cover art background with rounded corners
    ctx.save();
    drawRoundedRect(ctx, coverArtX, coverArtY, coverArtSize, coverArtSize, 40);
    ctx.clip();

    if (treatData.coverArt) {
      try {
        let imageUrl = treatData.coverArt;
        
        // Handle GIF extraction if needed
        if (treatData.coverArtType === 'gif') {
          imageUrl = await extractGifFrame(treatData.coverArt);
        }
        
        const coverImage = await loadImage(imageUrl);
        
        // Draw image to fill the square with proper aspect ratio
        const aspectRatio = coverImage.width / coverImage.height;
        let drawWidth = coverArtSize;
        let drawHeight = coverArtSize;
        let drawX = coverArtX;
        let drawY = coverArtY;
        
        if (aspectRatio > 1) {
          // Image is wider - fit height and crop width
          drawWidth = coverArtSize * aspectRatio;
          drawX = coverArtX - (drawWidth - coverArtSize) / 2;
        } else {
          // Image is taller - fit width and crop height
          drawHeight = coverArtSize / aspectRatio;
          drawY = coverArtY - (drawHeight - coverArtSize) / 2;
        }
        
        ctx.drawImage(coverImage, drawX, drawY, drawWidth, drawHeight);
      } catch (error) {
        console.warn('Failed to load cover art:', error);
        // Fallback to emoji
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(coverArtX, coverArtY, coverArtSize, coverArtSize);
        ctx.fillStyle = 'white';
        ctx.font = '180px system-ui';
        ctx.fillText(getTreatEmoji(treatData.treatType), STORY_WIDTH / 2, coverArtY + coverArtSize / 2);
      }
    } else {
      // No cover art - show emoji on gradient background
      const emojiGradient = ctx.createLinearGradient(coverArtX, coverArtY, coverArtX + coverArtSize, coverArtY + coverArtSize);
      emojiGradient.addColorStop(0, themeColors.start);
      emojiGradient.addColorStop(1, themeColors.end);
      ctx.fillStyle = emojiGradient;
      ctx.fillRect(coverArtX, coverArtY, coverArtSize, coverArtSize);
      
      ctx.fillStyle = 'white';
      ctx.font = '180px system-ui';
      ctx.fillText(getTreatEmoji(treatData.treatType), STORY_WIDTH / 2, coverArtY + coverArtSize / 2);
    }

    ctx.restore();

    // 5. Message section (if exists)
    if (treatData.message) {
      const messageY = 1200;
      const messageMaxWidth = STORY_WIDTH - 120;
      
      // Message background
      const messageBgY = messageY - 60;
      const messageBgHeight = 140;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      drawRoundedRect(ctx, 60, messageBgY, STORY_WIDTH - 120, messageBgHeight, 30);
      ctx.fill();
      
      // Message text
      ctx.fillStyle = '#1F2937';
      ctx.font = '32px system-ui, -apple-system, sans-serif';
      
      const messageWrapped = wrapText(ctx, `"${treatData.message}"`, messageMaxWidth - 40, 40);
      messageWrapped.lines.forEach((line, index) => {
        ctx.fillText(line, STORY_WIDTH / 2, messageY + (index * 40) - 20);
      });
    }

    // 6. Bottom branding
    const brandingY = STORY_HEIGHT - 200;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '28px system-ui, -apple-system, sans-serif';
    ctx.fillText('💖 Sent with love via clink', STORY_WIDTH / 2, brandingY);

    // 7. Call to action
    const ctaY = STORY_HEIGHT - 120;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillText('Tap to view your clink!', STORY_WIDTH / 2, ctaY);

    // Add some sparkle decorations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '40px system-ui';
    
    // Top sparkles
    ctx.fillText('✨', 150, 100);
    ctx.fillText('✨', STORY_WIDTH - 150, 100);
    ctx.fillText('💫', STORY_WIDTH / 2, 80);
    
    // Side sparkles
    ctx.fillText('✨', 80, 800);
    ctx.fillText('💫', STORY_WIDTH - 80, 800);
    ctx.fillText('✨', 120, 1400);
    ctx.fillText('💫', STORY_WIDTH - 120, 1400);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png', 1.0);
    });

  } catch (error) {
    console.error('Error generating Instagram story:', error);
    throw error;
  }
};

// Helper to download the generated image
export const downloadImage = (blob: Blob, filename: string = 'clink-story.png') => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};