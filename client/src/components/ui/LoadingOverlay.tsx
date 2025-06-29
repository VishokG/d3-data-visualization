import { Alert, Backdrop, CircularProgress } from '@mui/material';

const LoadingOverlay = ({
  open,
  status,
  message
} : {
  open: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  message?: string;
}) => {

  return (<Backdrop open={open} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    {status === 'loading' ? <CircularProgress color="inherit" /> 
    :
    <Alert severity="error" sx={{ mb: 2, minWidth: 300 }}>
      {message || 'An error occurred.'}
    </Alert>}
  </Backdrop>
  )
};

export default LoadingOverlay;