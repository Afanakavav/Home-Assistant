import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Expense, ExpenseCategory } from '../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ExpenseChartProps {
  expenses: Expense[];
  householdMembers: string[];
  currentUserId: string;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  groceries: 'Groceries',
  bills: 'Bills',
  transport: 'Transport',
  home: 'Home',
  extra: 'Extra',
};

const categoryColors: Record<ExpenseCategory, string> = {
  groceries: '#6A994E',
  bills: '#E76F51',
  transport: '#FFB86C',
  home: '#85C88A',
  extra: '#A3B18A',
};


const ExpenseChart: React.FC<ExpenseChartProps> = ({
  expenses,
  householdMembers,
  currentUserId,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  // Memoize monthly trend data (last 3 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 2; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });
      
      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      months.push({
        month: format(monthDate, 'MMM yyyy'),
        amount: total,
      });
    }
    
    return months;
  }, [expenses]);

  // Memoize category distribution data
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach((expense) => {
      const category = expense.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: categoryLabels[category as ExpenseCategory],
      value: amount,
      color: categoryColors[category as ExpenseCategory],
    }));
  }, [expenses]);

  // Memoize user comparison data
  const userData = useMemo(() => {
    const userTotals: { [userId: string]: number } = {};
    
    expenses.forEach((expense) => {
      const paidBy = expense.paidBy;
      userTotals[paidBy] = (userTotals[paidBy] || 0) + expense.amount;
    });
    
    return householdMembers.map((userId) => {
      const isCurrentUser = userId === currentUserId;
      const userName = isCurrentUser ? 'Tu' : 'Altro utente';
      return {
        name: userName,
        amount: userTotals[userId] || 0,
      };
    });
  }, [expenses, householdMembers, currentUserId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Card className="animate-slide-in-up" style={{ animationDelay: '0.15s' }}>
      <CardContent>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
          Expense Charts 📊
        </Typography>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Monthly Trend" />
          <Tab label="By Category" />
          {householdMembers.length > 1 && <Tab label="User Comparison" />}
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ width: '100%', height: 300 }}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#7A7A7A" />
                  <YAxis stroke="#7A7A7A" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: 8,
                    }}
                    formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Totale']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#FFB86C"
                    strokeWidth={3}
                    dot={{ fill: '#FFB86C', r: 5 }}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                  Not enough data to show chart
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ width: '100%', height: 300 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => {
                        const name = entry.name || '';
                        const percent = entry.percent || 0;
                        return `${name} ${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                      }}
                      formatter={(value: any) => `€${Number(value).toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                  No expenses by category
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {tabValue === 2 && householdMembers.length > 1 && (
          <Box sx={{ width: '100%', height: 300 }}>
            {userData.length > 0 ? (
              <ResponsiveContainer>
                  <BarChart data={userData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="name" stroke="#7A7A7A" />
                    <YAxis stroke="#7A7A7A" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                      }}
                      formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Totale']}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#FFB86C" name="Spese totali" />
                  </BarChart>
                </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: '#7A7A7A' }}>
                  Non ci sono dati per il confronto
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(ExpenseChart);

