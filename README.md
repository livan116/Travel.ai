# Travel.ai - AI-Powered Travel Planning Assistant

A modern travel planning application that uses AI to create personalized travel itineraries. Built with React, Tailwind CSS, and Google's Gemini AI API.

## Features

- Interactive chat interface for travel planning
- AI-powered personalized itinerary generation
- Sequential questioning for better travel recommendations
- PDF export functionality for itineraries
- Modern UI with responsive design
- Chat history persistence
- Real-time conversation

## Tech Stack

- React + Vite
- Tailwind CSS
- Google Gemini AI API
- PDF-lib for PDF generation
- React Icons
- date-fns for date formatting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/livan116/Travel.ai.git
```

2. Navigate to the client directory:
```bash
cd client
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the client directory and add your Gemini AI API key:
```env
VITE_AI_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Dependencies

Make sure these are installed:
```bash
npm install @google/generative-ai @tailwindcss/typography date-fns pdf-lib react-icons
```

## Usage

1. Start a conversation by entering your travel destination
2. Answer the AI's questions about your travel preferences
3. Receive a personalized travel itinerary
4. Download your itinerary as a PDF
5. Clear the chat to start planning a new trip



## Live Demo

Visit [travel-ai-pi.vercel.app](https://travel-ai-pi.vercel.app) to try the application.

---

Made with ❤️ by [Livan Kumar](https://github.com/livan116) 