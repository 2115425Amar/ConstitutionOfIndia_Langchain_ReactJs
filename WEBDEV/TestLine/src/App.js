import { ChakraProvider, Container, VStack, Heading, Text, Box, extendTheme } from '@chakra-ui/react';
import Quiz from './components/Quiz';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'navy.900',
        color: 'white',
      },
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.2)' },
        '100%': { transform: 'scale(1)' }
      }
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box bg="teal.500" minH="100vh" py={10}>
        <Container maxW="container.md">
          <VStack spacing={8}>
            <Box textAlign="center">
              {/* <Heading mb={4} color="white">Quiz Game 🎮</Heading> */}
              <Text color="white">Test your knowledge and earn points!</Text>
            </Box>
            <Quiz />
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 