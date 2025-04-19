import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const saveChatHistory = (messages) => {
  const chatHistory = JSON.stringify(messages);
  localStorage.setItem('travelChatHistory', chatHistory);
};

export const loadChatHistory = () => {
  const chatHistory = localStorage.getItem('travelChatHistory');
  return chatHistory ? JSON.parse(chatHistory) : [];
};

// Helper function to remove emojis and special characters
const sanitizeText = (text) => {
  return text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')  // Remove emojis
            .replace(/[\u{2700}-\u{27BF}]/gu, '')     // Remove dingbats
            .replace(/[^\x00-\x7F]/g, '');            // Remove non-ASCII characters
};

const extractItinerary = (messages) => {
  // Find the last AI message that contains the itinerary
  const itineraryMessage = [...messages].reverse().find(msg => 
    msg.sender === 'ai' && (
      msg.text.toLowerCase().includes('itinerary') ||
      msg.text.toLowerCase().includes('schedule') ||
      msg.text.toLowerCase().includes("here's what i've put together") ||
      msg.text.toLowerCase().includes("here's your plan")
    )
  );

  return itineraryMessage ? itineraryMessage.text : null;
};

export const generatePDF = async (messages) => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  let page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  const margin = 50;
  const fontSize = 12;
  const titleSize = 24;
  const subtitleSize = 16;
  const lineHeight = fontSize * 1.5;
  
  let y = height - margin;
  
  // Add title
  page.drawText('Travel Itinerary', {
    x: margin,
    y,
    size: titleSize,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  y -= titleSize * 1.5;

  // Add date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  page.drawText(`Generated on ${currentDate}`, {
    x: margin,
    y,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  y -= lineHeight * 2;

  // Extract travel preferences from conversation
  const preferences = {
    destination: '',
    dates: '',
    travelers: '',
    budget: '',
    activities: ''
  };

  messages.forEach(msg => {
    const text = sanitizeText(msg.text.toLowerCase());
    if (msg.sender === 'user') {
      if (text.includes('travel') || text.includes('going')) preferences.destination = msg.text;
      if (text.includes('date') || text.includes('when')) preferences.dates = msg.text;
      if (text.includes('with') || text.includes('solo') || text.includes('family')) preferences.travelers = msg.text;
      if (text.includes('budget') || text.includes('luxury') || text.includes('cost')) preferences.budget = msg.text;
      if (text.includes('activities') || text.includes('interested')) preferences.activities = msg.text;
    }
  });

  // Add travel details section
  page.drawText('Travel Details', {
    x: margin,
    y,
    size: subtitleSize,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  y -= lineHeight * 1.5;

  Object.entries(preferences).forEach(([key, value]) => {
    if (value) {
      if (y < margin + lineHeight) {
        page = pdfDoc.addPage([595, 842]);
        y = height - margin;
      }
      page.drawText(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${sanitizeText(value)}`, {
        x: margin,
        y,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
  });

  y -= lineHeight;

  // Add itinerary section
  const itinerary = extractItinerary(messages);
  if (itinerary) {
    if (y < margin + lineHeight * 2) {
      page = pdfDoc.addPage([595, 842]);
      y = height - margin;
    }

    page.drawText('Detailed Itinerary', {
      x: margin,
      y,
      size: subtitleSize,
      font: timesRomanBoldFont,
      color: rgb(0, 0, 0),
    });
    
    y -= lineHeight * 1.5;

    const lines = sanitizeText(itinerary).split('\n');
    for (const line of lines) {
      if (line.trim()) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([595, 842]);
          y = height - margin;
        }
        page.drawText(line.trim(), {
          x: margin,
          y,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      }
    }
  }

  return await pdfDoc.save();
};

export const downloadPDF = async (messages) => {
  try {
    const pdfBytes = await generatePDF(messages);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'travel-itinerary.pdf';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}; 