import { useState } from 'react'
import { useTutor } from '../context/TutorContext'
import ReactMarkdown from 'react-markdown'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

function Tutor() {
  const { characters, selectedCharacter, messages, sendMessage, isLoading } = useTutor()
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <div className="text-4xl">{characters[selectedCharacter].avatar}</div>
        <h1 className="text-3xl font-comic text-primary-600">
          Chat with {characters[selectedCharacter].name}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-4 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              👋 Hi! I'm {characters[selectedCharacter].name}. Ask me anything about Python!
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-gray-800'
                      : 'bg-white border-2 border-primary-200'
                  }`}
                >
                  <ReactMarkdown 
                    className="prose max-w-none"
                    components={{
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1 rounded">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-primary-200 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about Python..."
            className="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg px-4 py-2 transition-colors duration-200"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      <div className="text-sm text-gray-500 text-center">
        Using Google's Gemini AI to provide helpful Python tutoring.
      </div>
    </div>
  )
}

export default Tutor 