import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import { loadChatHistory } from './utils/chatUtils';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const chatHistory = loadChatHistory();
    if (chatHistory.length > 0) {
      setShowWelcome(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
    
      <main>
        {showWelcome && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h2 className="text-xl font-semibold mb-4">Welcome to Travel Planning Assistant!</h2>
              <p className="mb-4">I'm here to help you plan your perfect trip. I'll ask you some questions about your preferences and create a personalized itinerary for you.</p>
              <p className="mb-4">You can tell me about:</p>
              <ul className="list-disc list-inside mb-4">
                <li>Your destination</li>
                <li>Travel dates</li>
                <li>Preferred activities</li>
                <li>Food preferences</li>
                <li>Budget considerations</li>
                <li>Any special requirements</li>
              </ul>
              <p>Feel free to start chatting with me about your travel plans!</p>
            </div>
          </div>
        )}
        <Chat />
      </main>
    </div>
  );
}

export default App;
