'use client';

import { Box, Button, Container, Text, VStack, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);

export default function Home() {
  return (
    <Box as="main" minH="100vh" display="flex" alignItems="center" position="relative" overflow="hidden">
      {/* Background gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at center, brand.900 0%, gray.900 100%)"
        opacity="0.8"
        zIndex={0}
      />

      {/* Content */}
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={8} textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <MotionImage
              src="/images/DegenQuest-logo.png"
              alt="DegenQuest Logo"
              maxW="600px"
              w="100%"
              mb={6}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              draggable={false}
            />
            
            <Text 
              fontSize="xl" 
              color="whiteAlpha.900" 
              maxW="2xl" 
              mx="auto"
              textShadow="0 2px 4px rgba(0,0,0,0.4)"
            >
              Brave the Abyss—Fortunes Minted by the Bold
            </Text>
          </MotionBox>

          <MotionButton
            size="lg"
            variant="solid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // TODO: Implement login flow
              console.log('Play clicked');
            }}
            px={8}
            py={6}
            fontSize="xl"
            fontWeight="bold"
            boxShadow="0 4px 12px rgba(0,0,0,0.3)"
          >
            Play Now
          </MotionButton>
        </VStack>
      </Container>

      {/* Decorative elements */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        height="200px"
        bgGradient="linear(to-t, brand.900, transparent)"
        opacity="0.4"
        zIndex={0}
        pointerEvents="none"
      />
    </Box>
  );
}
