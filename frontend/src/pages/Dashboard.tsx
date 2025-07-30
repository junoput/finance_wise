import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance as AccountIcon,
  Receipt as TransactionIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { DashboardData, Account, Transaction } from '../types';

// Mock data for development
const mockDashboardData: DashboardData = {
  totalBalance: '125,450.75',
  accounts: [
    {
      id: 1,
      partyId: 1,
      balance: '85,230.50',
      accountNumber: '**** 1234',
      accountType: 'checking' as any,
      bankName: 'Chase Bank',
      currency: 'USD',
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-12-20T00:00:00Z',
    },
    {
      id: 2,
      partyId: 1,
      balance: '40,220.25',
      accountNumber: '**** 5678',
      accountType: 'savings' as any,
      bankName: 'Bank of America',
      currency: 'USD',
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-12-19T00:00:00Z',
    },
  ],
  recentTransactions: [
    {
      id: 1,
      accountId: 1,
      amount: '-125.50',
      transactionType: 'debit' as any,
      description: 'Grocery Store',
      category: 'Food & Dining',
      date: '2024-12-20T10:30:00Z',
      createdAt: '2024-12-20T10:30:00Z',
      updatedAt: '2024-12-20T10:30:00Z',
    },
    {
      id: 2,
      accountId: 1,
      amount: '2500.00',
      transactionType: 'credit' as any,
      description: 'Salary Deposit',
      category: 'Income',
      date: '2024-12-19T09:00:00Z',
      createdAt: '2024-12-19T09:00:00Z',
      updatedAt: '2024-12-19T09:00:00Z',
    },
    {
      id: 3,
      accountId: 2,
      amount: '-89.99',
      transactionType: 'debit' as any,
      description: 'Electric Bill',
      category: 'Utilities',
      date: '2024-12-18T15:45:00Z',
      createdAt: '2024-12-18T15:45:00Z',
      updatedAt: '2024-12-18T15:45:00Z',
    },
  ],
  monthlySpending: [
    { month: 'Jul', amount: '3250.50', income: '4500.00', expenses: '3250.50' },
    { month: 'Aug', amount: '2890.25', income: '4500.00', expenses: '2890.25' },
    { month: 'Sep', amount: '3120.75', income: '4500.00', expenses: '3120.75' },
    { month: 'Oct', amount: '3450.00', income: '4500.00', expenses: '3450.00' },
    { month: 'Nov', amount: '2980.50', income: '4500.00', expenses: '2980.50' },
    { month: 'Dec', amount: '3180.25', income: '4500.00', expenses: '3180.25' },
  ],
  categoryBreakdown: [
    { category: 'Food & Dining', amount: '850.25', percentage: 28, color: '#3b82f6' },
    { category: 'Transportation', amount: '620.50', percentage: 21, color: '#10b981' },
    { category: 'Utilities', amount: '450.75', percentage: 15, color: '#f59e0b' },
    { category: 'Entertainment', amount: '380.00', percentage: 13, color: '#ef4444' },
    { category: 'Healthcare', amount: '320.25', percentage: 11, color: '#8b5cf6' },
    { category: 'Other', amount: '358.50', percentage: 12, color: '#6b7280' },
  ],
};

function Dashboard() {
  const theme = useTheme();
  const { state } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For development, use mock data
      // const data = await apiService.getDashboardData();
      const data = mockDashboardData;
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button onClick={loadDashboardData} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getTransactionColor = (amount: string) => {
    return parseFloat(amount) >= 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  const getTransactionIcon = (amount: string) => {
    return parseFloat(amount) >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Welcome back, {state.user?.firstName || 'User'}!
        </Typography>
        <IconButton onClick={loadDashboardData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3} mb={3}>
        {/* Summary Cards */}
        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Balance
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight={600}>
                    {formatCurrency(dashboardData.totalBalance)}
                  </Typography>
                </Box>
                <AccountIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Accounts
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight={600}>
                    {dashboardData.accounts.length}
                  </Typography>
                </Box>
                <AccountIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight={600}>
                    {formatCurrency(dashboardData.monthlySpending[dashboardData.monthlySpending.length - 1]?.amount || '0')}
                  </Typography>
                </Box>
                <AnalyticsIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h5" component="div" fontWeight={600}>
                    {dashboardData.recentTransactions.length}
                  </Typography>
                </Box>
                <TransactionIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Charts */}
      <Box display="flex" gap={3} mb={3} flexWrap="wrap">
        {/* Spending Trend Chart */}
        <Box flex="2" minWidth="500px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as string)} />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Category Breakdown */}
        <Box flex="1" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="percentage"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {dashboardData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                        gap={1}
                        color={getTransactionColor(transaction.amount)}
                      >
                        {getTransactionIcon(transaction.amount)}
                        <Typography
                          fontWeight={600}
                          color={getTransactionColor(transaction.amount)}
                        >
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;
