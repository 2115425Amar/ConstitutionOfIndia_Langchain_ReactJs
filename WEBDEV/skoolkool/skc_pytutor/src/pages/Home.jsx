import { Link } from 'react-router-dom'
import { useTutor } from '../context/TutorContext'

function Home() {
  const { characters, selectedCharacter } = useTutor()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">
          {characters[selectedCharacter].avatar}
        </div>
        <h1 className="text-4xl font-bold text-blue-600 mb-6">
          Welcome to PyKids Tutor!
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="prose max-w-none">
          <p className="text-lg mb-4">
            PyKids Tutor is an innovative AI-powered learning platform that makes Python programming fun and 
            accessible for children. Using advanced AI technology from Google's Gemini, we provide personalized, 
            interactive coding lessons that adapt to each child's learning style and pace. Our platform features 
            friendly AI tutors who guide students through Python concepts using simple explanations, engaging 
            examples, and immediate feedback.
          </p>
          
          <p className="text-lg mb-6">
            What makes PyKids Tutor special is our character-based learning approach. Children can choose from 
            different tutor personalities - from the friendly and encouraging Py the Python 🐍, to the logical 
            Professor Bot 🤖, or the magical Code Wizard 🧙‍♂️. Each tutor brings their unique teaching style, 
            making the learning experience both educational and entertaining. With features like real-time code 
            explanations, interactive examples, and a child-friendly interface, we're making programming 
            education more engaging than ever.
          </p>
        </div>

        <div className="flex justify-center">
          <Link 
            to="/tutor" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Learning! 🚀
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon="🎮"
          title="Interactive Learning"
          description="Learn Python through fun conversations and real-time feedback"
        />
        <FeatureCard 
          icon="🎨"
          title="Choose Your Tutor"
          description="Pick a tutor character that matches your learning style"
        />
        <FeatureCard 
          icon="🏆"
          title="Track Progress"
          description="Practice with interactive examples and build your skills"
        />
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default Home 