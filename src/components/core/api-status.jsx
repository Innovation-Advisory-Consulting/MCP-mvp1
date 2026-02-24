import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { healthApi, API_BASE_URL } from '@/services/api';

export function ApiStatus() {
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const health = await healthApi.check();
      setStatus({
        type: health.status === 'healthy' ? 'success' : 'error',
        message: health.status === 'healthy'
          ? 'Backend API is healthy'
          : 'Backend API is unhealthy',
        details: health,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Cannot connect to backend API',
        details: { error: error.message },
      });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    checkHealth();
  }, []);

  if (!status && !loading) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity={status?.type || 'info'}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={checkHealth}
            disabled={loading}
          >
            {loading ? <CircularProgress size={16} /> : 'Retry'}
          </Button>
        }
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer' }}
      >
        <Box>
          <Typography variant="body2">
            {loading ? 'Checking backend connection...' : status?.message}
          </Typography>
          <Collapse in={expanded}>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" component="div">
                API URL: {API_BASE_URL}
              </Typography>
              {status?.details && (
                <Typography variant="caption" component="pre" sx={{ mt: 1, fontSize: '0.7rem' }}>
                  {JSON.stringify(status.details, null, 2)}
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Alert>
    </Box>
  );
}
