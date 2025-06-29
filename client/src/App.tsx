import { ThemeProvider } from '@mui/material/styles';
import tableTheme from './components/Table/theme';
import Table from './components/Table/Table'
import { useEffect } from 'react';
import _ from 'lodash';
import BarChart from './components/BarChart/BarChart';
import PieChart from './components/PieChart/PieChart';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchData } from './store/dataSlice';

export interface DataComponentProps {
  quarters: string[];
  groupingTypes: string[];
  totals: Record<string, { count: number; acv: number }>;
  dataByGroupingType: Record<string, Array<{ quarter: string; count: number; acv: number; percent: number }>>;
}

function App() {
  const dispatch = useAppDispatch();
  const { data: newData, status, error } = useAppSelector(state => state.data);

  const data = newData.sales || []

  useEffect(() => {
    dispatch(fetchData('acv_range'));
  }, [dispatch]);

  const quarters = _.uniq(data.map(d => d.closed_fiscal_quarter));
  const groupingTypes = _.uniq(data.map(d => d.category));

  // Totals for each quarter
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

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div className="app-container">
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
      <ThemeProvider theme={tableTheme}>
        <Table
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
