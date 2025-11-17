import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname === '/expenses') return 1;
    if (location.pathname === '/tasks') return 2;
    if (location.pathname === '/shopping-list') return 3;
    return 0;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/expenses');
        break;
      case 2:
        navigate('/tasks');
        break;
      case 3:
        navigate('/shopping-list');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)',
      }}
      elevation={0}
    >
      <MuiBottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        sx={{
          backgroundColor: '#FFFFFF',
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            color: '#7A7A7A',
            minWidth: 0,
            padding: '6px 12px',
            '&.Mui-selected': {
              color: '#FFB86C',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<HomeIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '12px',
              fontWeight: 500,
              marginTop: '4px',
            },
          }}
        />
        <BottomNavigationAction
          label="Expenses"
          icon={<AttachMoneyIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '12px',
              fontWeight: 500,
              marginTop: '4px',
            },
          }}
        />
        <BottomNavigationAction
          label="Task"
          icon={<CheckCircleOutlineIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '12px',
              fontWeight: 500,
              marginTop: '4px',
            },
          }}
        />
        <BottomNavigationAction
          label="Pantry"
          icon={<ShoppingCartIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '12px',
              fontWeight: 500,
              marginTop: '4px',
            },
          }}
        />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;

