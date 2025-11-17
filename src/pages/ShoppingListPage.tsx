import React from 'react';
import { Container, Box, Typography, Card, CardContent } from '@mui/material';
import ShoppingList from '../components/ShoppingList';
import BottomNavigation from '../components/BottomNavigation';

const ShoppingListPage: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#FFF9F3',
          pb: '80px', // Space for bottom navigation
        }}
      >
        <Container maxWidth="md" sx={{ py: 3 }}>
          <Typography variant="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Pantry 🧂
          </Typography>
          <Card>
            <CardContent>
              <ShoppingList showSuggestions={true} />
            </CardContent>
          </Card>
        </Container>
      </Box>
      <BottomNavigation />
    </>
  );
};

export default ShoppingListPage;

