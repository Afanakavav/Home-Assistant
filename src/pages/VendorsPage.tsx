import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Fab,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNotification } from '../contexts/NotificationContext';
import { logger } from '../utils/logger';
import {
  getVendors,
  getUpcomingMaintenance,
  deleteVendor,
} from '../services/vendorService';
import {
  requestNotificationPermission,
  startNotificationChecks,
} from '../services/notificationService';
import VendorAdd from '../components/VendorAdd';
import BottomNavigation from '../components/BottomNavigation';
import type { Vendor } from '../types';
import { format } from 'date-fns';

const typeLabels: Record<Vendor['type'], string> = {
  utility: 'Utility',
  maintenance: 'Maintenance',
  service: 'Service',
  other: 'Other',
};

const typeColors: Record<Vendor['type'], string> = {
  utility: '#6A994E',
  maintenance: '#FFB86C',
  service: '#85C88A',
  other: '#A3B18A',
};

const VendorsPage: React.FC = () => {
  const { currentHousehold } = useHousehold();
  const { showSuccess } = useNotification();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<{ vendor: Vendor; maintenance: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
    
    // Request notification permission and start checks
    if (currentHousehold) {
      requestNotificationPermission().then(() => {
        const cleanup = startNotificationChecks(currentHousehold.id, 60); // Check every hour
        return cleanup;
      });
    }
  }, [currentHousehold]);

  const loadVendors = async () => {
    if (!currentHousehold) return;

    try {
      setLoading(true);
      const [loadedVendors, upcoming] = await Promise.all([
        getVendors(currentHousehold.id),
        getUpcomingMaintenance(currentHousehold.id, 30),
      ]);
      setVendors(loadedVendors);
      setUpcomingMaintenance(upcoming);
    } catch (error) {
      logger.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorAdded = () => {
    loadVendors();
    showSuccess('Vendor added! 🏢', '🏢');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, vendor: Vendor) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendor(vendor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVendor(null);
  };

  const handleDelete = async () => {
    if (!selectedVendor) return;

    try {
      await deleteVendor(selectedVendor.id);
      showSuccess('Vendor deleted! 🗑️', '🗑️');
      handleMenuClose();
      await loadVendors();
    } catch (error) {
      logger.error('Error deleting vendor:', error);
    }
  };

  if (!currentHousehold) {
    return null;
  }

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
            Vendors 🏢
          </Typography>

          {/* Summary Card */}
          <Card sx={{ mb: 3 }} className="animate-slide-in-up">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                    Total vendors
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                    {vendors.length}
                  </Typography>
                </Box>
                {upcomingMaintenance.length > 0 && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#7A7A7A', mb: 0.5 }}>
                      Upcoming maintenance
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFB86C' }}>
                      {upcomingMaintenance.length} 🔧
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Upcoming Maintenance */}
          {upcomingMaintenance.length > 0 && (
            <Card sx={{ mb: 3 }} className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
                  Upcoming Maintenance 🔧
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {upcomingMaintenance.map((item, index) => (
                    <Box
                      key={`${item.vendor.id}-${item.maintenance.type}-${index}`}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#FFB86C15',
                        border: '1px solid #FFB86C40',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.vendor.name} - {item.maintenance.type}
                      </Typography>
                      {item.maintenance.nextService && (
                        <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                          📅 {format(item.maintenance.nextService, 'PPP')}
                        </Typography>
                      )}
                      {item.maintenance.notes && (
                        <Typography variant="caption" sx={{ color: '#7A7A7A', display: 'block', mt: 0.5 }}>
                          {item.maintenance.notes}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Vendors List */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : vendors.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {vendors.map((vendor, index) => (
                <Card
                  key={vendor.id}
                  className="animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <BusinessIcon sx={{ color: typeColors[vendor.type], fontSize: 24 }} />
                          <Typography variant="h3" sx={{ fontWeight: 600 }}>
                            {vendor.name}
                          </Typography>
                          <Chip
                            label={typeLabels[vendor.type]}
                            size="small"
                            sx={{
                              backgroundColor: `${typeColors[vendor.type]}20`,
                              color: typeColors[vendor.type],
                              fontWeight: 500,
                              height: 24,
                            }}
                          />
                        </Box>
                        
                        {vendor.contactInfo.phone && (
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <PhoneIcon sx={{ color: '#7A7A7A', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                              {vendor.contactInfo.phone}
                            </Typography>
                          </Box>
                        )}
                        
                        {vendor.contactInfo.email && (
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <EmailIcon sx={{ color: '#7A7A7A', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                              {vendor.contactInfo.email}
                            </Typography>
                          </Box>
                        )}
                        
                        {vendor.contactInfo.website && (
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <LanguageIcon sx={{ color: '#7A7A7A', fontSize: 16 }} />
                            <Typography 
                              variant="body2" 
                              component="a"
                              href={vendor.contactInfo.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: '#6A994E', textDecoration: 'none' }}
                            >
                              {vendor.contactInfo.website}
                            </Typography>
                          </Box>
                        )}
                        
                        {vendor.contactInfo.address && (
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <LocationOnIcon sx={{ color: '#7A7A7A', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                              {vendor.contactInfo.address}
                            </Typography>
                          </Box>
                        )}
                        
                        {vendor.notes && (
                          <Box mt={1}>
                            <Typography variant="body2" sx={{ color: '#2C2C2C' }}>
                              📝 {vendor.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, vendor)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Card className="animate-fade-in">
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BusinessIcon sx={{ fontSize: 64, color: '#7A7A7A', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ color: '#7A7A7A', mb: 1 }}>
                    No vendors registered.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                    Add your first vendor! 🏢
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add vendor"
          sx={{
            position: 'fixed',
            bottom: 88, // Above bottom navigation
            right: 16,
            zIndex: 999,
          }}
          onClick={() => setVendorDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Vendor Dialog */}
        <VendorAdd
          open={vendorDialogOpen}
          onClose={() => setVendorDialogOpen(false)}
          onSuccess={handleVendorAdded}
        />

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
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

export default VendorsPage;

