import { ThemeProvider } from '@mui/material/styles';
import tableTheme from './components/Table/theme';
import Table from './components/Table/Table'
import { useMemo } from 'react';
import customerTypeData from "./data/Customer Type.json";
import industryData from "./data/Account Industry.json";
import acvRangeData from "./data/ACV Range.json";
import teamData from "./data/Team.json";
import _ from 'lodash';
import BarChart from './components/BarChart/BarChart';
import PieChart from './components/PieChart/PieChart';
import { Box } from '@mui/material';
import { getColorScale } from './utils/colorScale';

export interface DataComponentProps {
  quarters: string[];
  groupingTypes: string[];
  totals: Record<string, { count: number; acv: number }>;
  dataByGroupingType: Record<string, Array<{ quarter: string; count: number; acv: number; percent: number }>>;
}

interface DataSet {
  closed_fiscal_quarter: string;
  category: string;
  count: number;
  acv: number;
}

// const groupedData = customerTypeData.map(({Cust_Type, ...d}) => ({
//   ...d,
//   category: Cust_Type,  
// }))

// const groupedData = industryData.map(({Acct_Industry, ...d}) => ({
//   ...d,
//   category: Acct_Industry,  
// }))

// const groupedData = acvRangeData.map(({ACV_Range, ...d}) => ({
//   ...d,
//   category: ACV_Range,  
// }))

const groupedData = teamData.map(({Team , ...d}) => ({
  ...d,
  category: Team,
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

  const color = getColorScale(groupingTypes);

  return (
      <div>
        <Box display={"flex"} border={"1px solid black"}>
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
        </Box>
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
