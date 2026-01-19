import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Pending,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from "@/context/auth-context";
import { BASE_URL } from "@/config";

interface KYCStatusData {
  is_verified: boolean;
  verified_at: string | null;
  pending_documents?: string[]; // Make optional
  all_documents_uploaded?: boolean; // Make optional
  company_name?: string;
  pan_number?: string;
  aadhaar_number?: string;
  gst_number?: string;
  created_at?: string;
}

const KYCStatus: React.FC = () => {
  const [status, setStatus] = useState<KYCStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dash/seller/kyc/status`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      // Ensure pending_documents is always an array
      const statusData = {
        ...response.data,
        pending_documents: Array.isArray(response.data.pending_documents) 
          ? response.data.pending_documents 
          : [],
        all_documents_uploaded: response.data.all_documents_uploaded || false
      };
      
      setStatus(statusData);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      
      // Set default status on error
      setStatus({
        is_verified: false,
        verified_at: null,
        pending_documents: [],
        all_documents_uploaded: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (!status) {
    return (
      <Alert severity="info">
        No KYC submission found. Please submit your KYC documents.
      </Alert>
    );
  }

  // Safely access pending_documents with default empty array
  const pendingDocuments = status.pending_documents || [];
  
  // Safely get completion progress
  const getProgressValue = () => {
    if (status.is_verified) return 100;
    if (status.all_documents_uploaded) return 75;
    if (pendingDocuments.length === 0) return 50;
    return 25;
  };

  const getStatusColor = () => {
    if (status.is_verified) return 'success';
    if (status.all_documents_uploaded) return 'warning';
    return 'error';
  };

  const getStatusText = () => {
    if (status.is_verified) return 'Verified';
    if (status.all_documents_uploaded) return 'Under Review';
    return 'Pending Documents';
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">KYC Status</Typography>
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              icon={status.is_verified ? <CheckCircle /> : <Pending />}
            />
          </Box>

          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Completion Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={getProgressValue()}
              color={getStatusColor()}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>

          {status.company_name && (
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Business Information
              </Typography>
              <Typography variant="body2">
                <strong>Company:</strong> {status.company_name}
              </Typography>
              {status.pan_number && (
                <Typography variant="body2">
                  <strong>PAN:</strong> {status.pan_number}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Document Status
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              {/* Safe check for pending documents */}
              {pendingDocuments.some(doc => 
                doc.toLowerCase().includes('pan') || 
                doc.toLowerCase() === 'pan attachment'
              ) ? (
                <ErrorIcon color="error" />
              ) : (
                <CheckCircle color="success" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="PAN Card"
              secondary={pendingDocuments.some(doc => 
                doc.toLowerCase().includes('pan') || 
                doc.toLowerCase() === 'pan attachment'
              ) ? 'Pending' : 'Uploaded'}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              {pendingDocuments.some(doc => 
                doc.toLowerCase().includes('aadhaar') || 
                doc.toLowerCase().includes('aadhar')
              ) ? (
                <ErrorIcon color="error" />
              ) : (
                <CheckCircle color="success" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="Aadhaar Card"
              secondary={pendingDocuments.some(doc => 
                doc.toLowerCase().includes('aadhaar') || 
                doc.toLowerCase().includes('aadhar')
              ) ? 'Pending' : 'Uploaded'}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              {pendingDocuments.some(doc => 
                doc.toLowerCase().includes('bank') || 
                doc.toLowerCase().includes('account proof')
              ) ? (
                <ErrorIcon color="error" />
              ) : (
                <CheckCircle color="success" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="Bank Account Proof"
              secondary={pendingDocuments.some(doc => 
                doc.toLowerCase().includes('bank') || 
                doc.toLowerCase().includes('account proof')
              ) ? 'Pending' : 'Uploaded'}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              {pendingDocuments.some(doc => 
                doc.toLowerCase().includes('address') || 
                doc.toLowerCase().includes('proof')
              ) ? (
                <ErrorIcon color="error" />
              ) : (
                <CheckCircle color="success" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="Address Proof"
              secondary={pendingDocuments.some(doc => 
                doc.toLowerCase().includes('address') || 
                doc.toLowerCase().includes('proof')
              ) ? 'Pending' : 'Uploaded'}
            />
          </ListItem>
        </List>

        {status.is_verified && status.verified_at && (
          <Alert severity="success" sx={{ mt: 2 }}>
            KYC was verified on {new Date(status.verified_at).toLocaleDateString()}
          </Alert>
        )}

        {pendingDocuments.length > 0 && !status.is_verified && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please upload the following documents: {pendingDocuments.join(', ')}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default KYCStatus;