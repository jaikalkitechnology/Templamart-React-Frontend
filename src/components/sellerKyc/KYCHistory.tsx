import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility, Download, History } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from "@/context/auth-context";
import { BASE_URL } from "@/config";
interface KYCSubmission {
  id: number;
  company_name: string;
  submission_date: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  verified_by: string | null;
  verified_at: string | null;
}

const KYCHistory: React.FC = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
    const { user } = useAuth();
  useEffect(() => {
    fetchKycHistory();
  }, []);

  const fetchKycHistory = async () => {
    try {
      //const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/dash/seller/kyc/history`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching KYC history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const handleDownload = async (submissionId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/seller/kyc/download/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kyc_submission_${submissionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading KYC:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <History color="primary" />
          <Typography variant="h6">KYC Submission History</Typography>
        </Box>

        {submissions.length === 0 ? (
          <Typography color="text.secondary" align="center" py={4}>
            No submission history found
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verified By</TableCell>
                  <TableCell>Verified Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{submission.company_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={getStatusColor(submission.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{submission.verified_by || 'N/A'}</TableCell>
                    <TableCell>
                      {submission.verified_at
                        ? new Date(submission.verified_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(submission.id)}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default KYCHistory;