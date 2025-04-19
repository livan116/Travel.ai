import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { format } from 'date-fns';
import { FiSend, FiTrash2, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { saveChatHistory, loadChatHistory, downloadPDF } from '../utils/chatUtils';

const INITIAL_MESSAGE = {
    text: "Hi! I'm your travel planning assistant. Let's start planning your perfect trip. Where would you like to go?",
    sender: 'ai',
    timestamp: new Date(),
};

const QUESTIONS = [
    "Where would you like to travel? (Please specify a country, city, or region)",
    "Great choice! When are you planning to travel?",
    "Perfect! Who will be traveling with you? (Solo, couple, family, friends?)",
    "What's your budget range for this trip? (Luxury, mid-range, budget-friendly)",
    "What kind of activities interest you the most? (e.g., beaches, hiking, culture, food)",
];

const ITINERARY_PROMPT = `Create a detailed travel itinerary following this exact format:

# [Destination]: [Type of Trip] - [Duration] Itinerary

## Morning ([Time Range])
• Activity: [Detailed description of morning activity]
• What to Expect: [Practical information and tips]
• Tips: [Important advice for this activity]
• Breakfast: [Meal recommendations]

## Afternoon ([Time Range])
• Lunch ([Time]): [Restaurant recommendation with location]
• Activity ([Time Range]): [Detailed description of afternoon activities]

## Evening ([Time Range])
• Dinner ([Time]): [Restaurant/area recommendation with details]
• Relax: [Evening relaxation suggestions]

## Important Notes
• Transportation: [Transport options and tips]
• Weather: [Weather considerations if applicable]
• Costs: [Budget information]

Make the itinerary specific to the user's preferences and include local recommendations. Use bullet points (•) instead of asterisks.`;

const Chat = () => {
    const [messages, setMessages] = useState(() => {
        const savedMessages = loadChatHistory();
        return savedMessages.length > 0 ? savedMessages : [INITIAL_MESSAGE];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showItinerary, setShowItinerary] = useState(false);
    const messagesEndRef = useRef(null);

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_AI_API_KEY);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        saveChatHistory(messages);
    }, [messages]);

    const clearChat = () => {
        setMessages([INITIAL_MESSAGE]);
        setCurrentQuestionIndex(0);
        setShowItinerary(false);
        localStorage.removeItem('travelChatHistory');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const conversationHistory = messages.map(msg =>
                `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
            ).join('\n');

            let nextPrompt = '';
            if (currentQuestionIndex < QUESTIONS.length - 1) {
                nextPrompt = QUESTIONS[currentQuestionIndex + 1];
                setCurrentQuestionIndex(prev => prev + 1);
            } else if (currentQuestionIndex === QUESTIONS.length - 1) {
                nextPrompt = "Perfect! I'll create a detailed itinerary based on your preferences. Would you like to see it now?";
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setShowItinerary(true);
            }

            const prompt = {
                contents: [{
                    parts: [{
                        text: `You are a friendly and professional travel planning assistant.

Previous conversation:
${conversationHistory}

User's latest message: ${input}

${showItinerary ? ITINERARY_PROMPT : `Respond naturally to the user's message and then ask this specific next question: "${nextPrompt}"`}

Keep your response concise and friendly. If creating an itinerary, follow the exact format provided.`
                    }]
                }]
            };

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const aiMessage = {
                text,
                sender: 'ai',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error:', error);
            setError('Sorry, I encountered an error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            await downloadPDF(messages);
        } catch (error) {
            setError('Failed to generate PDF. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="max-w-4xl w-full mx-auto p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-primary">Travel Planning Assistant</h1>
                    <div className="flex gap-2">
                        {showItinerary && (
                            <button
                                onClick={handleDownloadPDF}
                                className="download-button flex items-center gap-2 text-sm"
                                disabled={isLoading}
                            >
                                <FiDownload className="text-lg" />
                                <span className="hidden sm:inline">Download Itinerary</span>
                            </button>
                        )}
                        {messages.length > 1 && (
                            <button
                                onClick={clearChat}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                            >
                                <FiTrash2 className="text-lg" />
                                <span className="hidden sm:inline">Clear Chat</span>
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-xl shadow-sm p-4">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`chat-bubble max-w-[85%] ${message.sender === 'user'
                                        ? 'bg-primary text-white rounded-t-2xl rounded-bl-2xl'
                                        : 'bg-gray-100 text-gray-800 rounded-t-2xl rounded-br-2xl'
                                        }`}
                                >
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    <span className={`text-xs ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'} mt-2 block`}>
                                        {format(message.timestamp, 'HH:mm')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="chat-bubble bg-gray-100 text-gray-800 rounded-t-2xl rounded-br-2xl">
                                    <div className="flex items-center gap-2">
                                        <FiRefreshCw className="animate-spin text-primary" />
                                        <p className="text-sm">Creating your perfect itinerary...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <form onSubmit={handleSend} className="flex gap-2 bg-white p-4 rounded-xl shadow-sm">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-800"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="send-button flex items-center gap-2 px-6"
                        disabled={isLoading || !input.trim()}
                    >
                        <FiSend className="text-lg" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat; 