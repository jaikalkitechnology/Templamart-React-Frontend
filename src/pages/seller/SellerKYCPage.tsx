import React from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Fade,
  Grow,
  Stack,
  Divider,
  IconButton,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  VerifiedUser, 
  Description, 
  History, 
  CheckCircle,
  CloudUpload,
  Timeline,
  DocumentScanner,
  Shield,
  Business,
  Download,
  Visibility,
  ArrowForward,
  EmojiEvents,
  Star,
  TrendingUp,
  Security,
  SupportAgent,
  Speed,
  Verified
} from '@mui/icons-material';
import SellerKYCForm from '../../components/sellerKyc/SellerKYCForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <Grow in={value === index} timeout={300}>
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`kyc-tabpanel-${index}`}
        aria-labelledby={`kyc-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
      </div>
    </Grow>
  );
};

const SellerKYCPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleKYCUpdate = () => {
    // Refresh any parent state if needed
  };

  // Mock data for demonstration
  const kycStats = {
    progress: 75,
    submittedDocs: 3,
    totalDocs: 5,
    daysRemaining: 2,
    verificationScore: 85,
  };

  const recentActivity = [
    { id: 1, action: 'PAN Card Uploaded', date: '2 hours ago', status: 'completed' },
    { id: 2, action: 'Address Proof Verified', date: '1 day ago', status: 'completed' },
    { id: 3, action: 'GST Certificate Pending', date: '2 days ago', status: 'pending' },
  ];

  const documentList = [
    { name: 'PAN Card', status: 'verified', uploaded: '2024-01-10', size: '1.2 MB' },
    { name: 'Aadhaar Card', status: 'verified', uploaded: '2024-01-10', size: '2.1 MB' },
    { name: 'Bank Statement', status: 'pending', uploaded: '2024-01-11', size: '3.4 MB' },
    { name: 'GST Certificate', status: 'uploaded', uploaded: '2024-01-12', size: '1.8 MB' },
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ 
        py: { xs: 3, md: 5 },
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 50%),
                    ${alpha(theme.palette.background.default, 1)}`,
      }}>
        {/* Hero Header */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: 4,
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              mb: 4 
            }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2,
                  px: 2,
                  py: 0.5,
                  borderRadius: 50,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}>
                  <Security sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" color="primary" fontWeight="bold">
                    SECURE VERIFICATION
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Elevate Your<br />Seller Profile
                </Typography>
                
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ 
                    mb: 4,
                    maxWidth: 600,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    fontWeight: 400
                  }}
                >
                  Complete KYC verification to unlock premium features, 
                  increase buyer trust, and boost your sales by up to <strong>300%</strong>
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<TrendingUp />} 
                    label="Higher Conversions" 
                    color="success"
                    variant="filled"
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.dark',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    icon={<Star />} 
                    label="Trust Badge" 
                    color="warning"
                    variant="filled"
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: 'warning.dark',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    icon={<Speed />} 
                    label="Fast Processing" 
                    color="info"
                    variant="filled"
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: 'info.dark',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ 
                width: { xs: '100%', md: '400px' },
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  borderRadius: '24px',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                  zIndex: 0,
                }
              }}>
                <Card
                  sx={{
                    position: 'relative',
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    color: 'white',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    border: `1px solid ${alpha(theme.palette.primary.light, 0.3)}`,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 100,
                      height: 100,
                      background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
                      borderRadius: '0 0 0 100%',
                    }}
                  />
                  
                  <CardContent sx={{ p: 4, position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 56, 
                        height: 56,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <Verified sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" gutterBottom fontWeight={700}>
                          Verification Status
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Complete KYC to unlock all benefits
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {kycStats.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={kycStats.progress} 
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#fff',
                            borderRadius: 6,
                            backgroundImage: 'linear-gradient(90deg, #fff 0%, #e0e0e0 100%)',
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Paper 
                        sx={{ 
                          flex: 1,
                          p: 2, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="h3" fontWeight={800}>
                          {kycStats.submittedDocs}/{kycStats.totalDocs}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Documents
                        </Typography>
                      </Paper>
                      <Paper 
                        sx={{ 
                          flex: 1,
                          p: 2, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="h3" fontWeight={800}>
                          {kycStats.verificationScore}%
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Trust Score
                        </Typography>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Left Side - Main Tabs */}
          <Box sx={{ flex: 1 }}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: 'white',
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  p: 3,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      py: 1.5,
                      px: 3,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      minHeight: 48,
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateY(-2px)',
                      },
                      '&.Mui-selected': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none',
                    },
                  }}
                >
                  <Tab 
                    icon={<VerifiedUser />}
                    iconPosition="start"
                    label="Submit KYC"
                  />
                  <Tab 
                    icon={<Description />}
                    iconPosition="start"
                    label="My Documents"
                  />
                  <Tab 
                    icon={<History />}
                    iconPosition="start"
                    label="KYC History"
                  />
                </Tabs>
              </Box>

              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <TabPanel value={tabValue} index={0}>
                  <SellerKYCForm onKYCUpdate={handleKYCUpdate} />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2,
                      mb: 4 
                    }}>
                      <Box>
                        <Typography variant="h5" gutterBottom fontWeight={700}>
                          📁 My Documents
                        </Typography>
                        <Typography color="text.secondary">
                          Manage and view all your uploaded documents
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Upload New
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {documentList.map((doc, index) => (
                        <Grow in timeout={(index + 1) * 200} key={doc.name}>
                          <Card 
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              border: '2px solid',
                              borderColor: doc.status === 'verified' ? alpha(theme.palette.success.main, 0.3) : 
                                         doc.status === 'pending' ? alpha(theme.palette.warning.main, 0.3) : alpha(theme.palette.divider, 0.5),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                                borderColor: doc.status === 'verified' ? theme.palette.success.main : 
                                            doc.status === 'pending' ? theme.palette.warning.main : theme.palette.primary.main,
                              }
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    bgcolor: doc.status === 'verified' ? alpha(theme.palette.success.main, 0.1) : 
                                            doc.status === 'pending' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.grey[200], 0.5),
                                    color: doc.status === 'verified' ? theme.palette.success.main : 
                                          doc.status === 'pending' ? theme.palette.warning.main : theme.palette.grey[500],
                                    width: 48,
                                    height: 48,
                                  }}
                                >
                                  <Description />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                      {doc.name}
                                    </Typography>
                                    <Chip 
                                      label={doc.status.toUpperCase()} 
                                      size="small"
                                      color={doc.status === 'verified' ? 'success' : 
                                            doc.status === 'pending' ? 'warning' : 'default'}
                                      sx={{ 
                                        fontWeight: 600,
                                        borderRadius: 1.5
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Uploaded: {doc.uploaded} • {doc.size}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <Button
                                  size="small"
                                  startIcon={<Visibility />}
                                  variant="outlined"
                                  sx={{ 
                                    flex: 1, 
                                    borderRadius: 2,
                                    fontWeight: 600
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<Download />}
                                  variant="contained"
                                  sx={{ 
                                    flex: 1, 
                                    borderRadius: 2,
                                    fontWeight: 600
                                  }}
                                >
                                  Download
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grow>
                      ))}
                    </Box>
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2,
                      mb: 4 
                    }}>
                      <Box>
                        <Typography variant="h5" gutterBottom fontWeight={700}>
                          📜 KYC History
                        </Typography>
                        <Typography color="text.secondary">
                          Track your verification journey
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Timeline />}
                        sx={{ 
                          borderRadius: 3,
                          fontWeight: 600
                        }}
                      >
                        View Timeline
                      </Button>
                    </Box>

                    <Box sx={{ position: 'relative', pl: 4 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          bgcolor: 'divider',
                          borderRadius: 1,
                        }}
                      />

                      {recentActivity.map((activity, index) => (
                        <Fade in key={activity.id} timeout={(index + 1) * 300}>
                          <Box sx={{ position: 'relative', mb: 3 }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                left: -4,
                                top: 8,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: activity.status === 'completed' ? theme.palette.success.main : theme.palette.warning.main,
                                border: '3px solid white',
                                boxShadow: `0 0 0 4px ${alpha(activity.status === 'completed' ? 
                                  theme.palette.success.main : 
                                  theme.palette.warning.main, 0.2)}`,
                                zIndex: 1,
                              }}
                            />

                            <Card
                              sx={{
                                borderRadius: 3,
                                borderLeft: '4px solid',
                                borderLeftColor: activity.status === 'completed' ? theme.palette.success.main : theme.palette.warning.main,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(8px)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                }
                              }}
                              variant="outlined"
                            >
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                      {activity.action}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {activity.date}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    icon={activity.status === 'completed' ? <CheckCircle /> : <History />}
                                    label={activity.status === 'completed' ? 'Completed' : 'Pending'}
                                    color={activity.status === 'completed' ? 'success' : 'warning'}
                                    variant="filled"
                                    size="medium"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Box>
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </Box>

          {/* Right Side - Quick Actions & Info */}
          <Box sx={{ width: { xs: '100%', lg: '380px' } }}>
            <Stack spacing={4}>
              {/* Verification Steps */}
              <Card sx={{ 
                borderRadius: 4, 
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }
              }}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight={700}>
                    🎯 Verification Steps
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete these steps to get verified
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                  {[
                    { step: 1, title: 'Basic Information', completed: true },
                    { step: 2, title: 'Upload Documents', completed: true },
                    { step: 3, title: 'ID Verification', completed: false },
                    { step: 4, title: 'Final Review', completed: false },
                  ].map((item, index) => (
                    <Box key={item.step} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: item.completed ? theme.palette.success.main : alpha(theme.palette.grey[300], 0.5),
                            color: item.completed ? 'white' : theme.palette.grey[600],
                            width: 36,
                            height: 36,
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {item.completed ? <CheckCircle /> : item.step}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={item.completed ? 400 : 600}>
                            {item.title}
                          </Typography>
                        </Box>
                        {item.completed && (
                          <CheckCircle color="success" />
                        )}
                      </Box>
                      {index < 3 && (
                        <Box
                          sx={{
                            ml: 4,
                            height: 20,
                            width: 2,
                            bgcolor: item.completed ? theme.palette.success.main : alpha(theme.palette.grey[300], 0.5),
                            transition: 'all 0.3s ease',
                          }}
                        />
                      )}
                    </Box>
                  ))}
                  
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{ 
                      mt: 3, 
                      borderRadius: 3, 
                      py: 1.5,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Continue Verification
                  </Button>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card 
                sx={{ 
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.9)} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: alpha('#fff', 0.1),
                  }
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <SupportAgent />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Need Help?
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        24/7 dedicated support team
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Typography variant="body2" gutterBottom fontWeight={600}>
                        📞 Call Support
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        +91 22 350 399 27
                      </Typography>
                    </Paper>
                    
                    <Paper 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Typography variant="body2" gutterBottom fontWeight={600}>
                        📧 Email Support
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        support@templamart.com
                      </Typography>
                    </Paper>
                  </Stack>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      borderRadius: 3, 
                      py: 1.5,
                      fontWeight: 600,
                      bgcolor: 'white',
                      color: 'info.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits Card */}
              <Card sx={{ 
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                background: alpha(theme.palette.success.light, 0.03),
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                    ✅ Verified Seller Benefits
                  </Typography>
                  
                  <Stack spacing={2}>
                    {[
                      { title: 'Higher Visibility', desc: 'Get 3x more views', icon: <TrendingUp /> },
                      { title: 'Trust Badge', desc: 'Build customer trust', icon: <Shield /> },
                      { title: 'Priority Support', desc: '24/7 dedicated support', icon: <SupportAgent /> },
                      { title: 'Early Access', desc: 'New features first', icon: <Star /> },
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
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                          }
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
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>

        {/* Footer Note */}
        <Fade in timeout={1000}>
          <Paper
            sx={{
              mt: 6,
              p: 4,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flex: 1,
                minWidth: { xs: '100%', sm: 'auto' }
              }}>
                <Shield color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Bank-Level Security
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your documents are securely encrypted with 256-bit SSL and stored in compliance with global security standards.
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<DocumentScanner />}
                sx={{ 
                  borderRadius: 3,
                  fontWeight: 600
                }}
              >
                Learn About Security
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default SellerKYCPage;