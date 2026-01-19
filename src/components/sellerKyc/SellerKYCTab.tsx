import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import { Info, Refresh, VerifiedUser } from '@mui/icons-material';
import SellerKYCForm from './SellerKYCForm';
import KYCStatus from './KYCStatus';
import KYCHistory from './KYCHistory';
import { useAuth } from "@/context/auth-context";
import { BASE_URL } from "@/config";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kyc-tabpanel-${index}`}
      aria-labelledby={`kyc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const SellerKYCTab: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleKYCUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" gutterBottom>
          KYC Verification
        </Typography>
        <Box>
          <Tooltip title="Refresh KYC Status">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="KYC Information">
            <IconButton size="small">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab 
            label="Submit KYC" 
            icon={<VerifiedUser />}
            iconPosition="start"
          />
          <Tab 
            label="Status" 
            icon={
              <Badge color="primary" variant="dot" invisible={false}>
                <VerifiedUser />
              </Badge>
            }
            iconPosition="start"
          />
          <Tab label="History" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SellerKYCForm onKYCUpdate={handleKYCUpdate} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <KYCStatus key={refreshTrigger} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <KYCHistory key={refreshTrigger} />
      </TabPanel>
    </Box>
  );
};

export default SellerKYCTab;