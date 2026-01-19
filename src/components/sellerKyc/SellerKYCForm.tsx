import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Zoom,
  Grow,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  CloudUpload, 
  CheckCircle, 
  Error, 
  Delete, 
  Visibility,
  Business,
  LocationOn,
  Phone,
  Badge,
  Description,
  VerifiedUser,
  Edit,
  Download,
  UploadFile,
  DocumentScanner,
  AccountBalance,
  Home,
  Security,
  ArrowForward,
  Star,
  TrendingUp,
  Speed
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useAuth } from "@/context/auth-context";
import { BASE_URL } from "@/config";

interface FormData {
  company_name: string;
  state: string;
  city: string;
  pin_code: string;
  mobile_number: string;
  pan_number: string;
  aadhaar_number: string;
  gst_number: string;
}

interface DocumentFile {
  name: string;
  type: 'pan' | 'aadhaar' | 'gst' | 'bank' | 'address';
  file: File | null;
  preview: string | null;
  uploaded: boolean;
  icon: React.ReactNode;
  description: string;
}

interface KYCStatus {
  is_verified: boolean;
  verified_at: string | null;
  pending_documents: string[];
  all_documents_uploaded: boolean;
}

interface SellerKYCResponse {
  id: number;
  user_id: number;
  company_name: string;
  state: string;
  city: string;
  pin_code: string;
  mobile_number: string;
  pan_number: string;
  aadhaar_number: string;
  gst_number: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  onKYCUpdate?: () => void;
}

const SellerKYCForm: React.FC<Props> = ({ onKYCUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    is_verified: false,
    verified_at: null,
    pending_documents: [],
    all_documents_uploaded: false
  });
  const [existingKYC, setExistingKYC] = useState<SellerKYCResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    state: '',
    city: '',
    pin_code: '',
    mobile_number: '',
    pan_number: '',
    aadhaar_number: '',
    gst_number: '',
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([
    { 
      name: 'PAN Card', 
      type: 'pan', 
      file: null, 
      preview: null, 
      uploaded: false,
      icon: <Badge sx={{ color: '#2196f3' }} />,
      description: 'Permanent Account Number card'
    },
    { 
      name: 'Aadhaar Card', 
      type: 'aadhaar', 
      file: null, 
      preview: null, 
      uploaded: false,
      icon: <VerifiedUser sx={{ color: '#4caf50' }} />,
      description: 'Aadhaar card front & back'
    },
    { 
      name: 'Bank Proof', 
      type: 'bank', 
      file: null, 
      preview: null, 
      uploaded: false,
      icon: <AccountBalance sx={{ color: '#9c27b0' }} />,
      description: 'Canceled cheque or bank statement'
    },
    { 
      name: 'Address Proof', 
      type: 'address', 
      file: null, 
      preview: null, 
      uploaded: false,
      icon: <Home sx={{ color: '#ff9800' }} />,
      description: 'Utility bill or rental agreement'
    },
    { 
      name: 'GST Certificate', 
      type: 'gst', 
      file: null, 
      preview: null, 
      uploaded: false,
      icon: <Description sx={{ color: '#f44336' }} />,
      description: 'GST registration certificate'
    },
  ]);

  const steps = ['Business Details', 'Upload Documents', 'Review & Submit'];

  // Fetch existing KYC data
  useEffect(() => {
    if (user?.token) {
      fetchKYCStatus();
    }
  }, [user?.token]);

  const fetchKYCStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dash/seller/kyc/status`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = response.data;
      setKycStatus({
        is_verified: data.is_verified,
        verified_at: data.verified_at,
        pending_documents: data.pending_documents || [],
        all_documents_uploaded: data.all_documents_uploaded || false,
      });
      if (data.kyc_details) {
        setExistingKYC(data.kyc_details);
        populateFormData(data.kyc_details);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      enqueueSnackbar('Failed to fetch KYC status', { variant: 'error' });
    }
  };

  const populateFormData = (data: any) => {
    setFormData(prev => ({
      ...prev,
      company_name: data.company_name || '',
      state: data.state || '',
      city: data.city || '',
      pin_code: data.pin_code || '',
      mobile_number: data.mobile_number || '',
      pan_number: data.pan_number || '',
      aadhaar_number: data.aadhaar_number || '',
      gst_number: data.gst_number || '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (type: DocumentFile['type'], file: File) => {
    const updatedDocuments = documents.map((doc) => {
      if (doc.type === type) {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
        const preview = URL.createObjectURL(file);
        return {
          ...doc,
          file,
          preview,
          uploaded: false,
        };
      }
      return doc;
    });
    setDocuments(updatedDocuments);
    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        if (newProgress[type] < 90) {
          newProgress[type] += 10;
        } else {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 100);
  };

  const handleRemoveFile = (type: DocumentFile['type']) => {
    const updatedDocuments = documents.map((doc) => {
      if (doc.type === type) {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
        return {
          ...doc,
          file: null,
          preview: null,
          uploaded: false,
        };
      }
      return doc;
    });
    setDocuments(updatedDocuments);
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
  };

  const validateForm = (step: number): boolean => {
    if (step === 0) {
      if (!formData.pan_number || formData.pan_number.trim() === '') {
        enqueueSnackbar('PAN is required', { variant: 'error' });
        return false;
      }
      return true;
    }
    
    if (step === 1) {
      const hasAnyFile = documents.some(doc => doc.file && (doc.type !== 'gst' || doc.file));
      if (!hasAnyFile) {
        enqueueSnackbar('Please upload at least one required document', { variant: 'error' });
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleNext = () => {
    const valid = validateForm(activeStep);
    if (valid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!user?.token) {
      enqueueSnackbar('Authentication required', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Convert PAN and GST to uppercase
      formDataToSend.set('pan_number', formData.pan_number.toUpperCase());
      if (formData.gst_number && formData.gst_number.trim() !== '') {
        formDataToSend.set('gst_number', formData.gst_number.toUpperCase());
      }

      // Add files
      documents.forEach((doc) => {
        if (doc.file) {
          let fieldName = '';
          switch (doc.type) {
            case 'pan':
              fieldName = 'pan_attachment';
              break;
            case 'aadhaar':
              fieldName = 'aadhaar_attachment';
              break;
            case 'gst':
              fieldName = 'gst_attachment';
              break;
            case 'bank':
              fieldName = 'bank_account_attachment';
              break;
            case 'address':
              fieldName = 'address_proof_attachment';
              break;
          }
          if (fieldName && doc.file) {
            formDataToSend.append(fieldName, doc.file);
          }
        }
      });

      const endpoint = `${BASE_URL}/dash/seller/seller/kyc`;

      const response = await axios({
        method: 'post',
        url: endpoint,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            documents.forEach(doc => {
              if (doc.file && !uploadProgress[doc.type]) {
                setUploadProgress(prev => ({ ...prev, [doc.type]: percentCompleted }));
              }
            });
          }
        },
      });

      enqueueSnackbar(response.data.message || 'KYC submitted successfully', {
        variant: 'success',
      });

      // Update document status
      const updatedDocuments = documents.map((doc) => ({
        ...doc,
        uploaded: true,
      }));
      setDocuments(updatedDocuments);

      // Refresh status
      await fetchKYCStatus();
      
      // Reset to first step
      setActiveStep(0);
      
      if (!existingKYC) {
        setFormData({
          company_name: '',
          state: '',
          city: '',
          pin_code: '',
          mobile_number: '',
          pan_number: '',
          aadhaar_number: '',
          gst_number: '',
        });
      }
      
      if (onKYCUpdate) onKYCUpdate();

    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      
      let errorMessage = 'Failed to submit KYC';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 5000 
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (documentType: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/dash/kyc/document/download/${documentType}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentType}_document.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      enqueueSnackbar('Document downloaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading document:', error);
      enqueueSnackbar('Failed to download document', { variant: 'error' });
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grow in={true}>
            <Box>
              <Card 
                sx={{ 
                  mb: 4, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Business Information
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Fill in your company details to get started
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Two-column layout for fields */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 3,
                mb: 4 
              }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Company/Business Name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Business sx={{ mr: 1, color: 'primary.main' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{ maxLength: 10 }}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'primary.main' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="PAN Number"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{ maxLength: 10 }}
                    helperText="Format: ABCDE1234F"
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: 'primary.main' }} />,
                      endAdornment: formData.pan_number && (
                        <CheckCircle color="success" sx={{ ml: 1 }} />
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Aadhaar Number"
                    name="aadhaar_number"
                    value={formData.aadhaar_number}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{ maxLength: 12 }}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <VerifiedUser sx={{ mr: 1, color: 'primary.main' }} />,
                      endAdornment: formData.aadhaar_number && (
                        <CheckCircle color="success" sx={{ ml: 1 }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="GST Number (Optional)"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleInputChange}
                    variant="outlined"
                    inputProps={{ maxLength: 15 }}
                    helperText="15 characters"
                    InputProps={{
                      startAdornment: <Description sx={{ mr: 1, color: 'primary.main' }} />,
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }}>
                <Chip 
                  label="Address Details" 
                  icon={<LocationOn />} 
                  sx={{ 
                    bgcolor: 'white',
                    border: `1px solid ${theme.palette.divider}`,
                    px: 2
                  }}
                />
              </Divider>

              {/* Three-column layout for address */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 3 
              }}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{ flex: 1 }}
                />
                <TextField
                  fullWidth
                  label="PIN Code"
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  inputProps={{ maxLength: 6 }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Grow>
        );

      case 1:
        return (
          <Fade in={true}>
            <Box>
              <Card 
                sx={{ 
                  mb: 4, 
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <UploadFile />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Upload Documents
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Upload required documents for verification
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Paper 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Security color="info" />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      📁 All documents must be clear and readable
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      📏 Max file size: 5MB • 📄 Accepts: PDF, JPG, PNG, JFIF
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Stack spacing={3}>
                {documents.map((doc) => (
                  <Card 
                    key={doc.type}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderLeft: '4px solid',
                      borderLeftColor: doc.file ? theme.palette.success.main : theme.palette.divider,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                        borderLeftColor: doc.file ? theme.palette.success.dark : theme.palette.primary.main,
                      }
                    }}
                  >
                    <CardContent>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ 
                            bgcolor: doc.file ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[300], 0.3),
                            color: doc.file ? theme.palette.success.main : theme.palette.grey[500],
                          }}>
                            {doc.icon}
                          </Avatar>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {doc.name}
                              </Typography>
                              {doc.type !== 'gst' && (
                                <Chip 
                                  label="Required" 
                                  size="small" 
                                  color="error" 
                                  sx={{ height: 20, fontWeight: 600 }} 
                                />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {doc.description}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Box sx={{ minWidth: 200 }}>
                          {doc.file ? (
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Chip 
                                  icon={<CheckCircle />} 
                                  label="Selected" 
                                  color="success" 
                                  size="small"
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Stack>
                              <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress[doc.type] || 0} 
                                sx={{ 
                                  mb: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: theme.palette.success.main,
                                    borderRadius: 3,
                                  }
                                }}
                              />
                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveFile(doc.type)}
                                  color="error"
                                  sx={{
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.error.main, 0.2),
                                    }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                                {doc.file.type.startsWith('image/') && doc.preview && (
                                  <IconButton
                                    size="small"
                                    onClick={() => window.open(doc.preview!, '_blank')}
                                    sx={{
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.info.main, 0.2),
                                      }
                                    }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                )}
                              </Stack>
                            </Box>
                          ) : (
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<CloudUpload />}
                              fullWidth
                              sx={{
                                borderStyle: 'dashed',
                                borderWidth: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                }
                              }}
                            >
                              Choose File
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png,.jfif"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileChange(doc.type, e.target.files[0]);
                                  }
                                }}
                              />
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Zoom in={true}>
            <Box>
              <Card 
                sx={{ 
                  mb: 4, 
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <DocumentScanner />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Review & Submit
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Review your information before submission
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 3,
                mb: 4 
              }}>
                <Card sx={{ 
                  flex: 1,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  background: alpha(theme.palette.primary.main, 0.02)
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <Business color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Business Details
                      </Typography>
                    </Stack>
                    
                    <Stack spacing={2.5}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Company Name
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formData.company_name || 'Not provided'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Address
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {[formData.city, formData.state, formData.pin_code]
                            .filter(Boolean)
                            .join(', ') || 'Not provided'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Mobile Number
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formData.mobile_number || 'Not provided'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ 
                  flex: 1,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  background: alpha(theme.palette.secondary.main, 0.02)
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                      <Badge color="secondary" />
                      <Typography variant="h6" fontWeight={600}>
                        Identity Details
                      </Typography>
                    </Stack>
                    
                    <Stack spacing={2.5}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                      }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          PAN Number
                        </Typography>
                        <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                          {formData.pan_number.toUpperCase() || 'Not provided'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                      }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Aadhaar Number
                        </Typography>
                        <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                          {formData.aadhaar_number || 'Not provided'}
                        </Typography>
                      </Box>
                      
                      {formData.gst_number && (
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.secondary.main, 0.03),
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                        }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            GST Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600} fontFamily="monospace">
                            {formData.gst_number.toUpperCase()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Card sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                background: alpha(theme.palette.info.main, 0.02)
              }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <Description color="info" />
                    <Typography variant="h6" fontWeight={600}>
                      Documents Summary
                    </Typography>
                  </Stack>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          '& th': { fontWeight: 600 }
                        }}>
                          <TableCell>Document</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>File</TableCell>
                          <TableCell>Size</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow 
                            key={doc.type}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.info.main, 0.03),
                              }
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: doc.file ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[200], 0.5),
                                  color: doc.file ? theme.palette.success.main : theme.palette.grey[500],
                                }}>
                                  {doc.icon}
                                </Avatar>
                                <Typography variant="body2" fontWeight={500}>
                                  {doc.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {doc.file ? (
                                <Chip 
                                  icon={<CheckCircle />}
                                  label="Ready" 
                                  color="success" 
                                  size="small"
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : doc.type === 'gst' ? (
                                <Chip 
                                  label="Optional" 
                                  color="default" 
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                <Chip 
                                  icon={<Error />}
                                  label="Missing" 
                                  color="error" 
                                  size="small"
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontWeight: 500 }}>
                                {doc.file?.name || 'Not selected'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {doc.file ? `${Math.round(doc.file.size / 1024)} KB` : '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </Zoom>
        );

      default:
        return null;
    }
  };

  // If KYC is verified, show status
  if (kycStatus?.is_verified && existingKYC) {
    return (
      <Box sx={{ 
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box sx={{ mb: 6 }}>
          <Fade in={true}>
            <Card 
              sx={{ 
                mb: 4, 
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                overflow: 'visible',
                position: 'relative',
                borderRadius: 3,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.dark, 0.2)} 100%)`,
                  zIndex: -1,
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 64, 
                      height: 64,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <VerifiedUser sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" gutterBottom fontWeight={800}>
                        🎉 KYC Verified Successfully!
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Your business is now ready to start selling on our platform
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip 
                    label="VERIFIED" 
                    color="success" 
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'success.main',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: 40,
                      px: 2,
                      '& .MuiChip-label': {
                        px: 2
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Fade>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Card sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
                    📋 KYC Details
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 3,
                    mb: 4 
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Card variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Business color="primary" />
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                              Company Name
                            </Typography>
                          </Stack>
                          <Typography variant="h5" fontWeight={700}>
                            {existingKYC.company_name}
                          </Typography>
                        </Stack>
                      </Card>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Card variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <LocationOn color="primary" />
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                              Address
                            </Typography>
                          </Stack>
                          <Typography variant="body1" fontWeight={600}>
                            {existingKYC.city}, {existingKYC.state}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            PIN: {existingKYC.pin_code}
                          </Typography>
                        </Stack>
                      </Card>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    gap: 3,
                    mb: 4 
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Card variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Badge color="primary" />
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                              PAN Number
                            </Typography>
                          </Stack>
                          <Typography variant="h5" fontWeight={700} fontFamily="monospace">
                            {existingKYC.pan_number}
                          </Typography>
                        </Stack>
                      </Card>
                    </Box>
                    {existingKYC.gst_number && (
                      <Box sx={{ flex: 1 }}>
                        <Card variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Description color="primary" />
                              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                                GST Number
                              </Typography>
                            </Stack>
                            <Typography variant="h5" fontWeight={700} fontFamily="monospace">
                              {existingKYC.gst_number}
                            </Typography>
                          </Stack>
                        </Card>
                      </Box>
                    )}
                  </Box>

                  <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" gap={2}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CheckCircle color="success" sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Verification Date
                          </Typography>
                          <Typography variant="body1">
                            {kycStatus.verified_at ? 
                              new Date(kycStatus.verified_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 
                              'Recently verified'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setActiveStep(0)}
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600
                        }}
                      >
                        Update Information
                      </Button>
                    </Stack>
                  </Card>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ width: { xs: '100%', md: 350 } }}>
              <Card sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                background: alpha(theme.palette.success.main, 0.03),
                height: '100%'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
                    📎 Documents & Benefits
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => downloadDocument('all')}
                      fullWidth
                      sx={{ 
                        py: 2,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Download All Documents
                    </Button>
                    
                    <Divider />
                    
                    <Alert 
                      severity="success" 
                      icon={<CheckCircle />}
                      sx={{ 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        All documents have been verified and approved.
                      </Typography>
                    </Alert>

                    <Stack spacing={2}>
                      {[
                        { title: 'Higher Visibility', desc: 'Get 3x more views', icon: <TrendingUp /> },
                        { title: 'Trust Badge', desc: 'Build customer trust', icon: <Star /> },
                        { title: 'Priority Support', desc: '24/7 dedicated support', icon: <VerifiedUser /> },
                      ].map((benefit, index) => (
                        <Box 
                          key={benefit.title}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                          }}
                        >
                          <Avatar sx={{ 
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.main',
                            width: 40,
                            height: 40
                          }}>
                            {benefit.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {benefit.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {benefit.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 1200,
      mx: 'auto',
      py: 4,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Status alerts */}
      {existingKYC && !kycStatus?.is_verified && (
        <Fade in={true}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              bgcolor: alpha(theme.palette.info.main, 0.05)
            }}
            icon={<Business />}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              KYC Submission Found
            </Typography>
            <Typography variant="body2">
              Your KYC was submitted on {new Date(existingKYC.created_at).toLocaleDateString()} 
              and is currently under review.
            </Typography>
          </Alert>
        </Fade>
      )}

      {kycStatus?.pending_documents && kycStatus.pending_documents.length > 0 && (
        <Fade in={true}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              bgcolor: alpha(theme.palette.warning.main, 0.05)
            }}
            icon={<Error />}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Pending Documents Required
            </Typography>
            <Typography variant="body2">
              Please upload: {kycStatus.pending_documents.join(', ')}
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Stepper */}
      <Card 
        sx={{ 
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{ 
              '& .MuiStepLabel-root .Mui-completed': {
                color: theme.palette.success.main,
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: theme.palette.primary.main,
              },
              '& .MuiStepLabel-label': {
                fontWeight: 600,
                fontSize: '0.95rem'
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  StepIconProps={{
                    sx: {
                      '&.Mui-completed': {
                        color: theme.palette.success.main,
                        width: 40,
                        height: 40,
                      },
                      '&.Mui-active': {
                        color: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                      },
                      '&.Mui-disabled': {
                        color: theme.palette.grey[300],
                      }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          background: 'white',
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 4,
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="outlined"
          sx={{
            minWidth: 120,
            borderRadius: 2,
            py: 1.5,
            fontWeight: 600,
            order: { xs: 2, sm: 1 }
          }}
        >
          Back
        </Button>
        <Box sx={{ order: { xs: 1, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.dark} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Submitting...' : existingKYC ? 'Update KYC' : 'Submit KYC'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              endIcon={<ArrowForward />}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                borderRadius: 2,
                py: 1.5,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Continue
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SellerKYCForm;