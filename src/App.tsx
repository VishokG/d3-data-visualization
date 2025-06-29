import { ThemeProvider } from '@mui/material/styles';
import tableTheme from './components/Table/theme';
import Table from './components/Table/Table'
import { useMemo } from 'react';
import customerTypeData from "./data/Customer Type.json";
import _ from 'lodash';
import BarChart from './components/BarChart/BarChart';

interface DataSet {
  closed_fiscal_quarter: string;
  category: string;
  count: number;
  acv: number;
}

const groupedData = customerTypeData.map(({Cust_Type, ...d}) => ({
  ...d,
  category: Cust_Type,  
}))

const data: DataSet[] = groupedData;

function App() {
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

  return (
      <div>
        {/* <ThemeProvider theme={tableTheme}>
          <Table
            quarters={quarters}
            groupingTypes={groupingTypes}
            dataByGroupingType={dataByGroupingType}
            totals={totals}
          />
        </ThemeProvider> */}
        <BarChart />
      </div>
  );
}

export default App
