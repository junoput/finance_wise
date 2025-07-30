import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import apiService from '../services/api';
import { Account, AccountType } from '../types';

interface AccountFormData {
  accountNumber: string;
  accountType: AccountType;
  bankName: string;
  balance: string;
  currency: string;
}

// Mock data
const mockAccounts: Account[] = [
  {
    id: 1,
    partyId: 1,
    balance: '85,230.50',
    accountNumber: '**** 1234',
    accountType: AccountType.CHECKING,
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
    accountType: AccountType.SAVINGS,
    bankName: 'Bank of America',
    currency: 'USD',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-12-19T00:00:00Z',
  },
  {
    id: 3,
    partyId: 1,
    balance: '15,750.00',
    accountNumber: '**** 9012',
    accountType: AccountType.CREDIT_CARD,
    bankName: 'Wells Fargo',
    currency: 'USD',
    isActive: true,
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-12-18T00:00:00Z',
  },
];

function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AccountFormData>();

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      // For development, use mock data
      // const data = await apiService.getAccounts();
      const data = mockAccounts;
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAddAccount = () => {
    setEditingAccount(null);
    reset({
      accountNumber: '',
      accountType: AccountType.CHECKING,
      bankName: '',
      balance: '0.00',
      currency: 'USD',
    });
    setDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    reset({
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      bankName: account.bankName,
      balance: account.balance,
      currency: account.currency,
    });
    setDialogOpen(true);
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        // await apiService.deleteAccount(accountId);
        setAccounts(accounts.filter(account => account.id !== accountId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete account');
      }
    }
  };

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (editingAccount) {
        // await apiService.updateAccount(editingAccount.id, data);
        setAccounts(accounts.map(account => 
          account.id === editingAccount.id 
            ? { ...account, ...data }
            : account
        ));
      } else {
        // const newAccount = await apiService.createAccount(data);
        const newAccount: Account = {
          id: Date.now(),
          partyId: 1,
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAccounts([...accounts, newAccount]);
      }
      setDialogOpen(false);
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount.replace(/,/g, '')));
  };

  const getAccountTypeColor = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return 'primary';
      case AccountType.SAVINGS:
        return 'success';
      case AccountType.CREDIT_CARD:
        return 'warning';
      case AccountType.INVESTMENT:
        return 'info';
      default:
        return 'default';
    }
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance.replace(/,/g, ''));
  }, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading accounts...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          My Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAccount}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Summary Card */}
      <Box display="flex" gap={3} mb={3} flexWrap="wrap">
        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Balance
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight={600}>
                    {formatCurrency(totalBalance.toString())}
                  </Typography>
                </Box>
                <AccountIcon color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Accounts
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight={600}>
                    {accounts.filter(account => account.isActive).length}
                  </Typography>
                </Box>
                <AccountIcon color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Accounts Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Number</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.accountNumber}</TableCell>
                    <TableCell>{account.bankName}</TableCell>
                    <TableCell>
                      <Chip
                        label={account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                        color={getAccountTypeColor(account.accountType) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {formatCurrency(account.balance)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.isActive ? 'Active' : 'Inactive'}
                        color={account.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(account.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditAccount(account)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAccount(account.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Account Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
              <Controller
                name="accountNumber"
                control={control}
                rules={{ required: 'Account number is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Account Number"
                    fullWidth
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber?.message}
                  />
                )}
              />
              <Controller
                name="bankName"
                control={control}
                rules={{ required: 'Bank name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bank Name"
                    fullWidth
                    error={!!errors.bankName}
                    helperText={errors.bankName?.message}
                  />
                )}
              />
              <Box display="flex" gap={2}>
                <Controller
                  name="accountType"
                  control={control}
                  rules={{ required: 'Account type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.accountType}>
                      <InputLabel>Account Type</InputLabel>
                      <Select {...field} label="Account Type">
                        <MenuItem value={AccountType.CHECKING}>Checking</MenuItem>
                        <MenuItem value={AccountType.SAVINGS}>Savings</MenuItem>
                        <MenuItem value={AccountType.CREDIT_CARD}>Credit Card</MenuItem>
                        <MenuItem value={AccountType.INVESTMENT}>Investment</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  name="currency"
                  control={control}
                  rules={{ required: 'Currency is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Currency"
                      fullWidth
                      error={!!errors.currency}
                      helperText={errors.currency?.message}
                    />
                  )}
                />
              </Box>
              <Controller
                name="balance"
                control={control}
                rules={{ 
                  required: 'Balance is required',
                  pattern: {
                    value: /^\d+(\.\d{2})?$/,
                    message: 'Please enter a valid amount (e.g., 100.00)'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Initial Balance"
                    fullWidth
                    type="number"
                    inputProps={{ step: "0.01" }}
                    error={!!errors.balance}
                    helperText={errors.balance?.message}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingAccount ? 'Update' : 'Add'} Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Accounts;
