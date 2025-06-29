import { createTheme } from '@mui/material/styles';

const tableTheme = createTheme({
  palette: {
    primary: {
      main: "#4471C4",
    },
    secondary: {
      main: "#5B9BD5",
    },
    background: {
      default: "#f5f6fa",
      paper: "#fff",
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    fontSize: 16,
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: '1px solid #D6D6D6',
          padding: '4px 8px',
          fontSize: '1rem',
        },
        head: {
          fontWeight: 'bold',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& th': { borderBottom: '2px solid #D6D6D6' },
        },
      },
    },
  },
});

export default tableTheme;
