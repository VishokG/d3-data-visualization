// App.tsx - Main application component for sales data visualization
// Imports theme, charts, table, dropdown, and hooks
import { ThemeProvider } from '@mui/material/styles';
import tableTheme from './components/Table/theme';
import Table from './components/Table/Table'
import { useEffect, useState } from 'react';
import _ from 'lodash';
import BarChart from './components/BarChart/BarChart';
import PieChart from './components/PieChart/PieChart';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchData } from './store/dataSlice';
import { Box } from '@mui/material';
import GroupingDropDown from './components/GroupingDropDown/GroupingDropDown';
import type { Grouping } from './types';
import LoadingOverlay from './components/ui/LoadingOverlay';

// Props interface for chart and table data
export interface DataComponentProps {
  quarters: string[];
  groupingTypes: string[];
  totals: Record<string, { count: number; acv: number }>;
  dataByGroupingType: Record<string, Array<{ quarter: string; count: number; acv: number; percent: number }>>;
}

function App() {
  // State for current grouping (industry, acv_range, etc.)
  const [grouping, setGrouping] = useState<Grouping>('industry');

  // Redux hooks for dispatching actions and selecting state
  const dispatch = useAppDispatch();
  const { data: newData, status, error } = useAppSelector(state => state.data);

  // Extract sales data array from Redux state
  const data = newData.sales || [];

  // Fetch data when grouping changes
  useEffect(() => {
    dispatch(fetchData(grouping));
  }, [dispatch, grouping]);

  // Unique list of quarters and grouping types from data
  const quarters = _.uniq(data.map(d => d.closed_fiscal_quarter));
  const groupingTypes = _.uniq(data.map(d => d.category));

  // Totals for each quarter (sum of count and acv)
  const totals = _.fromPairs(
    quarters.map(q => [
      q,
      {
        count: _.sumBy(data, d => d.closed_fiscal_quarter === q ? d.count : 0),
        acv: _.sumBy(data, d => d.closed_fiscal_quarter === q ? d.acv : 0),
      }
    ])
  );

  // Data for each grouping type: array of { quarter, count, acv, percent }
  const dataByGroupingType = _.fromPairs(
    groupingTypes.map(type => [
      type,
      quarters.map(q => {
        const found = data.find(d => d.closed_fiscal_quarter === q && d.category === type);
        const count = found ? found.count : 0;
        const acv = found ? found.acv : 0;
        // Calculate percent of total ACV for this quarter
        const percent = totals[q].acv ? Math.round((acv / totals[q].acv) * 100) : 0;
        return {
          quarter: q,
          count,
          acv,
          percent,
        };
      })
    ])
  );

  // Totals by grouping type (sum of count and acv across all quarters)
  const totalsByGroupingType = _.fromPairs(
    groupingTypes.map(type => [
      type,
      data
        .filter(d => d.category === type)
        .reduce(
          (acc, d) => ({
            count: acc.count + d.count,
            acv: acc.acv + d.acv,
          }),
          { count: 0, acv: 0 }
        ),
    ])
  );

  // Returns a title string based on the current grouping
  const getTitle = (key: Grouping) => {
    switch (key) {
      case 'industry':
        return 'Industry';
      case 'acv_range':
        return 'ACV Range';
      case 'customer_type':
        return 'Customer Type';
      case 'team':
        return 'Team';
      default:
        return 'Sales Data';
    }
  }

  // Main render: loading overlay, grouping dropdown, charts, and table
  return (
    <div className="app-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Show loading or error overlay */}
      <LoadingOverlay open={status === 'loading' || status === 'error'} status={status} />

      {/* Grouping selection dropdown */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <GroupingDropDown
          grouping={grouping}
          setGrouping={setGrouping}
        />
      </Box>
      {/* Charts section: Bar and Pie charts */}
      <div className="charts-container">
        <BarChart
          quarters={quarters}
          groupingTypes={groupingTypes}
          dataByGroupingType={dataByGroupingType}
          totals={totals}
        />
        <PieChart
          groupingTypes={groupingTypes}
          totalsByGroupingType={totalsByGroupingType}
        />
      </div>
      {/* Data table with theme */}
      <ThemeProvider theme={tableTheme}>
        <Table
          title={getTitle(grouping)}
          quarters={quarters}
          groupingTypes={groupingTypes}
          dataByGroupingType={dataByGroupingType}
          totals={totals}
        />
      </ThemeProvider>
    </div>
  );
}

export default App
