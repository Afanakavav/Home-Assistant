import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Fab,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  LocalFlorist as LocalFloristIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { logger } from '../utils/logger';
import {
  getPlants,
  waterPlant,
  deletePlant,
} from '../services/plantService';
import {
  requestNotificationPermission,
  startNotificationChecks,
} from '../services/notificationService';
import PlantAdd from '../components/PlantAdd';
import BottomNavigation from '../components/BottomNavigation';
import type { Plant } from '../types';
import { format, isBefore } from 'date-fns';

const PlantsPage: React.FC = () => {
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [plantDialogOpen, setPlantDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    loadPlants();
    
    // Request notification permission and start checks
    if (currentHousehold) {
      requestNotificationPermission().then(() => {
        const cleanup = startNotificationChecks(currentHousehold.id, 60); // Check every hour
        return cleanup;
      });
    }
  }, [currentHousehold]);

  const loadPlants = async () => {
    if (!currentHousehold) return;

    try {
      setLoading(true);
      const loadedPlants = await getPlants(currentHousehold.id);
      setPlants(loadedPlants);
    } catch (error) {
      logger.error('Error loading plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlantAdded = () => {
    loadPlants();
    showSuccess('Plant added! 🌱', '🌱');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plant: Plant) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlant(plant);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlant(null);
  };

  const handleWater = async () => {
    if (!selectedPlant) return;

    try {
      await waterPlant(selectedPlant.id);
      showSuccess(`${selectedPlant.name} watered! 💧`, '💧');
      handleMenuClose();
      await loadPlants();
    } catch (error) {
      logger.error('Error watering plant:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlant) return;

    try {
      await deletePlant(selectedPlant.id);
      showSuccess('Plant deleted! 🗑️', '🗑️');
      handleMenuClose();
      await loadPlants();
    } catch (error) {
      logger.error('Error deleting plant:', error);
    }
  };

  if (!currentHousehold) {
    return null;
  }

  const plantsNeedingWater = plants.filter((plant) => {
    if (!plant.nextWatering) return false;
    return isBefore(new Date(plant.nextWatering), new Date()) || 
           new Date(plant.nextWatering).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000; // Within 24 hours
  });

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
            Plants 🌱
          </Typography>

          {/* Summary Card */}
          <Card sx={{ mb: 3 }} className="animate-slide-in-up">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                    Total plants
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {plants.length}
                  </Typography>
                </Box>
                {plantsNeedingWater.length > 0 && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                      Da annaffiare
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#6A994E' }}>
                      {plantsNeedingWater.length} 💧
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Plants List */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : plants.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {plants.map((plant, index) => {
                const needsWater = plant.nextWatering && 
                  (isBefore(new Date(plant.nextWatering), new Date()) || 
                   new Date(plant.nextWatering).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000);
                
                return (
                  <Card
                    key={plant.id}
                    className="animate-slide-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    sx={{
                      border: needsWater ? '2px solid #6A994E40' : '1px solid rgba(0, 0, 0, 0.05)',
                      backgroundColor: needsWater ? '#6A994E10' : 'transparent',
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <LocalFloristIcon sx={{ color: '#6A994E', fontSize: 24 }} />
                            <Typography variant="h3" sx={{ fontWeight: 600 }}>
                              {plant.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 1 }}>
                            📍 {plant.location}
                          </Typography>
                          {plant.nextWatering && (
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <WaterDropIcon 
                                sx={{ 
                                  color: needsWater ? '#6A994E' : '#7A7A7A', 
                                  fontSize: 18 
                                }} 
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: needsWater ? '#6A994E' : '#7A7A7A',
                                  fontWeight: needsWater ? 600 : 400,
                                }}
                              >
                                {needsWater ? 'Needs watering' : 'Next watering'}: {format(plant.nextWatering, 'PPP')}
                              </Typography>
                            </Box>
                          )}
                          {plant.lastWatered && (
                            <Typography variant="caption" sx={{ color: '#7A7A7A' }}>
                              Last watered: {format(plant.lastWatered, 'PPP')}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleMenuOpen(e, plant)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      {plant.lightNotes && (
                        <Box mb={1}>
                          <Typography variant="caption" sx={{ color: '#7A7A7A', fontWeight: 500 }}>
                            ☀️ Light:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C2C2C', ml: 1 }}>
                            {plant.lightNotes}
                          </Typography>
                        </Box>
                      )}
                      
                      {plant.fertilizerNotes && (
                        <Box mb={1}>
                          <Typography variant="caption" sx={{ color: '#7A7A7A', fontWeight: 500 }}>
                            🌿 Fertilizer:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C2C2C', ml: 1 }}>
                            {plant.fertilizerNotes}
                          </Typography>
                        </Box>
                      )}
                      
                      {plant.notes && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#7A7A7A', fontWeight: 500 }}>
                            📝 Notes:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C2C2C', ml: 1 }}>
                            {plant.notes}
                          </Typography>
                        </Box>
                      )}

                      {needsWater && (
                        <Box mt={2}>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<WaterDropIcon />}
                            onClick={() => {
                              setSelectedPlant(plant);
                              handleWater();
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            Water Now
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Card className="animate-fade-in">
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocalFloristIcon sx={{ fontSize: 64, color: '#7A7A7A', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ color: '#7A7A7A', mb: 1 }}>
                    No plants registered.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                    Add your first plant! 🌱
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add plant"
          sx={{
            position: 'fixed',
            bottom: 88, // Above bottom navigation
            right: 16,
            zIndex: 999,
          }}
          onClick={() => setPlantDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Plant Dialog */}
        <PlantAdd
          open={plantDialogOpen}
          onClose={() => setPlantDialogOpen(false)}
          onSuccess={handlePlantAdded}
        />

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleWater}>
            <WaterDropIcon sx={{ mr: 1, fontSize: 18 }} />
            Water
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: '#E76F51' }}>
            Delete
          </MenuItem>
        </Menu>
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
};

export default PlantsPage;

