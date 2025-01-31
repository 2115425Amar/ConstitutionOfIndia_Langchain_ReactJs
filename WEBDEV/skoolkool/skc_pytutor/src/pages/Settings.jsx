import { useState } from 'react'
import { useTutor } from '../context/TutorContext'

function Settings() {
  const { apiKey, setApiKey, characters, selectedCharacter, setSelectedCharacter } = useTutor()
  const [tempApiKey, setTempApiKey] = useState(apiKey)

  const handleSubmit = (e) => {
    e.preventDefault()
    setApiKey(tempApiKey)
    alert('API Key saved successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-comic text-primary-600 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-comic text-gray-800 mb-4">API Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              Google Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter your Gemini API key..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Get your API key from the{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded"
          >
            Save API Key
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-comic text-gray-800 mb-4">Choose Your Tutor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(characters).map(([id, character]) => (
            <button
              key={id}
              onClick={() => setSelectedCharacter(id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedCharacter === id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-4xl mb-2">{character.avatar}</div>
              <h3 className="font-comic text-lg mb-1">{character.name}</h3>
              <p className="text-sm text-gray-600">{character.personality}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Settings 