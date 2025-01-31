import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  Text, 
  Radio, 
  RadioGroup, 
  Icon, 
  HStack,
  Spinner,
  Center,
  Heading
} from '@chakra-ui/react';
import { FaTrophy, FaShareAlt, FaRegDotCircle, FaHeart } from 'react-icons/fa';
import { fetchQuizData } from '../services/api';

const Quiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startCountdown, setStartCountdown] = useState(3);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const data = await fetchQuizData();
        console.log('Fetched quiz data:', data);
        setQuizData(data);
        if (data && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          if (data.duration) {
            setTimeLeft(data.duration * 60);
          }
        } else {
          throw new Error('No questions found in the quiz data');
        }
      } catch (error) {
        console.error('Failed to load quiz:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  useEffect(() => {
    if (startCountdown > 0 && !quizStarted) {
      const timer = setInterval(() => {
        setStartCountdown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (startCountdown === 0 && !quizStarted) {
      setQuizStarted(true);
    }
  }, [startCountdown, quizStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSubmit = () => {
    const currentQuestionData = questions[currentQuestion];
    const selectedOption = currentQuestionData.options.find(
      opt => opt.description === selectedAnswer
    );
    
    if (selectedOption) {
      // Add correct marks if answer is correct, subtract negative marks if wrong
      const scoreChange = selectedOption.isCorrect ? 
        quizData.correct_marks : 
        -quizData.negative_marks;
      
      setTotalScore(prev => prev + scoreChange);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <Box 
        w="700px"
        mx="auto" 
        bg="#1a1a1a" 
        color="white" 
        borderRadius="2xl" 
        overflow="hidden"
        h="600px"
      >
        <Center h="full" w="full" flexDirection="column" gap={4}>
          <Spinner 
            size="xl" 
            color="teal.400" 
            thickness="4px"
          />
          <Text color="gray.400">Loading quiz...</Text>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        w="700px"
        mx="auto" 
        bg="#1a1a1a" 
        color="white" 
        borderRadius="2xl" 
        overflow="hidden"
        h="600px"
      >
        <Center h="full">
          <Text color="red.400" fontSize="lg" textAlign="center">
            Error loading quiz: {error}
          </Text>
        </Center>
      </Box>
    );
  }

  if (!quizStarted) {
    return (
      <Box 
        w="700px"
        mx="auto" 
        bg="#1a1a1a" 
        color="white" 
        borderRadius="2xl" 
        overflow="hidden"
        h="600px"
        display="flex"
        flexDirection="column"
      >
        <HStack justify="space-between" bg="#0d9488" p={4}>
          <Text>Get Ready!</Text>
          <HStack>
            <Icon as={FaHeart} color="red.400" />
            <Text>∞</Text>
          </HStack>
        </HStack>

        <Center flex="1" flexDirection="column" gap={6}>
          <VStack spacing={4}>
            <Text fontSize="xl" color="gray.400">Quiz starting in</Text>
            <Heading 
              fontSize="8xl" 
              color="teal.400"
              animation="pulse 1s infinite"
            >
              {startCountdown}
            </Heading>
          </VStack>
        </Center>

        <style jsx global>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}</style>
      </Box>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <Text>No questions available.</Text>
      </Box>
    );
  }

  if (showResults) {
    return (
      <Box 
        w="700px"
        mx="auto" 
        bg="#1a1a1a" 
        color="white" 
        borderRadius="2xl" 
        overflow="hidden"
        h="600px"
      >
        <Text fontSize="2xl" p={4} bg="#000">Quiz Result</Text>
        
        <Box p={8}>
          <VStack spacing={6} align="center">
            <Icon as={FaTrophy} w={20} h={20} color="yellow.400" />
            <VStack spacing={1}>
              <Text fontSize="3xl" fontWeight="bold">Congratulations!</Text>
              <Text color="gray.400" fontSize="md" fontStyle="italic">
                You are doing better than 0% students
              </Text>
            </VStack>
            
            <Text>Topic Rank - #3147</Text>

            <HStack spacing={8} w="100%" justify="center" py={4}>
              <VStack 
                bg="#2d2d2d"
                p={4}
                borderRadius="xl"
                minW="100px"
                spacing={1}
              >
                <Text fontSize="2xl" color="purple.400">0%</Text>
                <Text fontSize="sm" color="gray.400">Accuracy</Text>
              </VStack>
              
              <VStack 
                bg="#2d2d2d"
                p={4}
                borderRadius="xl"
                minW="100px"
                spacing={1}
              >
                <Text fontSize="2xl" color="teal.400">100</Text>
                <Text fontSize="sm" color="gray.400">Speed</Text>
              </VStack>
              
              <VStack 
                bg="#2d2d2d"
                p={4}
                borderRadius="xl"
                minW="100px"
                spacing={1}
              >
                <Text fontSize="2xl" color="red.400">0.0</Text>
                <Text fontSize="sm" color="gray.400">Total Score</Text>
              </VStack>
            </HStack>

            <HStack w="100%" justify="space-between" color="gray.400">
              <Text>Questions: {questions.length}</Text>
              <Text>Correct: 0</Text>
              <Text>Incorrect: 0</Text>
            </HStack>

            <Button
              w="100%"
              bg="#2d2d2d"
              color="teal.400"
              _hover={{ bg: '#3d3d3d' }}
              size="lg"
            >
              Detailed Solution
            </Button>

            <Button
              w="100%"
              colorScheme="teal"
              size="lg"
              onClick={() => {
                setCurrentQuestion(0);
                setTotalScore(0);
                setShowResults(false);
                setSelectedAnswer('');
              }}
            >
              Continue
            </Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <Box 
      w="700px"
      mx="auto" 
      bg="#1a1a1a" 
      color="white" 
      borderRadius="2xl" 
      overflow="hidden"
      h="600px"
      display="flex"
      flexDirection="column"
    >
      <HStack justify="space-between" bg="#0d9488" p={4}>
        <Text>14:59</Text>
        <HStack>
          <Icon as={FaHeart} color="red.400" />
          <Text>∞</Text>
        </HStack>
      </HStack>

      <Box 
        flex="1" 
        overflow="hidden" 
        display="flex" 
        flexDirection="column"
      >
        <Box p={6} overflow="auto">
          <Text fontSize="lg" fontWeight="medium" mb={6}>
            {currentQuestionData.description}
          </Text>
          
          <RadioGroup onChange={setSelectedAnswer} value={selectedAnswer}>
            <VStack align="stretch" spacing={4}>
              {currentQuestionData.options.map((option, index) => (
                <Box
                  key={option.id}
                  p={4}
                  bg="#2d2d2d"
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: '#3d3d3d' }}
                  onClick={() => setSelectedAnswer(option.description)}
                >
                  <Radio value={option.description} w="100%">
                    <HStack>
                      <Text>{String.fromCharCode(65 + index)}.</Text>
                      <Text>{option.description}</Text>
                    </HStack>
                  </Radio>
                </Box>
              ))}
            </VStack>
          </RadioGroup>
        </Box>

        <Box 
          p={4} 
          borderTop="1px solid" 
          borderColor="gray.800"
          mt="auto"
        >
          <HStack justify="space-between">
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap={2}
              bg="transparent"
              border="1px solid"
              borderColor="gray.600"
              color="gray.400"
              px={4}
              py={2}
              borderRadius="full"
              fontSize="sm"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              <Icon as={FaRegDotCircle} />
              Report
            </Box>
            <Text color="gray.400">{currentQuestion + 1}/10</Text>
          </HStack>
        </Box>

        <Box 
          p={4} 
          borderTop="1px solid" 
          borderColor="gray.800"
          bg="#1a1a1a"
        >
          <HStack spacing={4}>
            <Button
              flex={1}
              variant="outline"
              borderColor="teal.500"
              color="teal.400"
              _hover={{ bg: 'whiteAlpha.100' }}
              isDisabled={currentQuestion === 0}
              onClick={() => {
                setCurrentQuestion(prev => prev - 1);
                setSelectedAnswer('');
              }}
            >
              Previous
            </Button>
            <Button
              flex={1}
              colorScheme="teal"
              onClick={handleAnswerSubmit}
              isDisabled={!selectedAnswer}
            >
              {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Quiz; 