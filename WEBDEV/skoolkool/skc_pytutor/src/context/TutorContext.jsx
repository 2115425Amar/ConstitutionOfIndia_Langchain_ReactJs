import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const TutorContext = createContext()

// Consider using environment variables for API endpoints
const API_URL = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';

export function TutorProvider({ children }) {
  const [apiKey, setApiKey] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState('friendly-python')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const characters = {
    'friendly-python': {
      name: 'Py the Python',
      avatar: '🐍',
      personality: 'friendly and encouraging',
      prompt: 'You are Py the Python, a friendly and encouraging tutor helping a child learn Python programming. Use simple language and lots of emoji.'
    },
    'robot-teacher': {
      name: 'Professor Bot',
      avatar: '🤖',
      personality: 'logical and precise',
      prompt: 'You are Professor Bot, a logical and precise tutor teaching Python programming. Break down concepts into clear steps.'
    },
    'wizard-coder': {
      name: 'Code Wizard',
      avatar: '🧙‍♂️',
      personality: 'magical and mysterious',
      prompt: 'You are the Code Wizard, teaching Python through magical metaphors and fun examples. Make learning feel like a magical adventure.'
    }
  }

  const sendMessage = async (message) => {
    if (!apiKey) {
      alert('Please set your API key in the settings first!')
      return
    }

    setIsLoading(true)
    const newMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, newMessage])

    try {
      const response = await axios.post(
        `${API_URL}/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `${characters[selectedCharacter].prompt}\n\nPrevious messages:\n${
                messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
              }\n\nUser: ${message}`
            }]
          }]
        }
      )

      if (response.data.candidates && response.data.candidates[0]) {
        const aiResponse = {
          role: 'assistant',
          content: response.data.candidates[0].content.parts[0].text
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending message. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    apiKey,
    setApiKey,
    selectedCharacter,
    setSelectedCharacter,
    characters,
    messages,
    setMessages,
    isLoading,
    sendMessage
  }

  return (
    <TutorContext.Provider value={value}>
      {children}
    </TutorContext.Provider>
  )
}

export function useTutor() {
  const context = useContext(TutorContext)
  if (!context) {
    throw new Error('useTutor must be used within a TutorProvider')
  }
  return context
} 