import { ThemeProvider } from '@mui/material/styles';
import tableTheme from './components/Table/theme';
import Table from './components/Table/Table'


function App() {
  return (
      <div>
        <ThemeProvider theme={tableTheme}>
          <Table />
        </ThemeProvider>
      </div>
  );
}

export default App
