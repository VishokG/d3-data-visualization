import React, { useMemo } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import customerTypeData from "../../data/Customer Type.json";
import _ from "lodash";
import { formatCurrency, formatPercent } from "../../utils";
import tableTheme from "./theme";

interface CustomerTypeRow {
  closed_fiscal_quarter: string;
  Cust_Type: string;
  count: number;
  acv: number;
}

const data: CustomerTypeRow[] = customerTypeData;

const TableHeader: React.FC<{ quarters: string[] }> = ({ quarters }) => {

  const headerCellSx = { fontWeight: 'bold' };
  const quarterHeaderCellSx = (i: number) => ({
    fontWeight: 'bold',
    background: i % 2 !== 0 ? tableTheme.palette.secondary.main : tableTheme.palette.primary.main,
    color: tableTheme.palette.common.white,
  });

  return (
    <TableHead>
      <TableRow>
        <TableCell
          align="center"
          component="th"
          scope="col"
        >
          Closed Fiscal Quarter
        </TableCell>
        {quarters.map((q, i) => (
          <TableCell
            key={q}
            align="center"
            colSpan={3}
            sx={quarterHeaderCellSx(i)}
            component="th"
            scope="col"
          >
            {q}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell align="center" sx={headerCellSx} component="th" scope="col">Cust Type</TableCell>
        {quarters.map((q) => [
          <TableCell key={q + '-opps'} align="center" component="th" scope="col"># of Opps</TableCell>,
          <TableCell key={q + '-acv'} align="center" sx={headerCellSx} component="th" scope="col">ACV</TableCell>,
          <TableCell key={q + '-pct'} align="center" sx={headerCellSx} component="th" scope="col">% of Total</TableCell>
        ])}
      </TableRow>
    </TableHead>
  );
};

// Helper to generate unique keys for table cells
const getCellKey = (type: string, quarter: string, metric: string) => `${type}-${quarter}-${metric}`;

const TableBodyRow: React.FC<{
  type: string;
  rowData: Array<{ quarter: string; count: number; acv: number; percent: number }>;
}> = React.memo(({ type, rowData }) => {
  return (
    <TableRow key={type}>
      <TableCell align="left" component="th" scope="row">{type}</TableCell>
      {rowData.map(({ quarter, count, acv, percent }) => [
        <TableCell key={getCellKey(type, quarter, 'opps')} align="center">{count}</TableCell>,
        <TableCell key={getCellKey(type, quarter, 'acv')} align="center">{formatCurrency(acv)}</TableCell>,
        <TableCell key={getCellKey(type, quarter, 'pct')} align="center">{formatPercent(percent)}</TableCell>
      ])}
    </TableRow>
  );
});


const TotalRow: React.FC<{
  quarters: string[];
  totals: Record<string, { count: number; acv: number }>;
}> = ({ quarters, totals }) => {

  const totalCellSx = { fontWeight: 'bold', background: tableTheme.palette.background.paper };

  return (
    <TableRow>
      <TableCell align="left" sx={totalCellSx} component="th" scope="row">Total</TableCell>
      {quarters.map((q) => [
        <TableCell key={q + '-total-opps'} align="center" sx={totalCellSx}>{totals[q].count}</TableCell>,
        <TableCell key={q + '-total-acv'} align="center" sx={totalCellSx}>{formatCurrency(totals[q].acv)}</TableCell>,
        <TableCell key={q + '-total-pct'} align="center" sx={totalCellSx}>100%</TableCell>
      ])}
    </TableRow>
  );
};

const TableComponent = () => {
  const { quarters, customerTypes, totals, dataByCustomerType } = useMemo(() => {
    const quarters = _.uniq(data.map(d => d.closed_fiscal_quarter));
    const customerTypes = _.uniq(data.map(d => d.Cust_Type));

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

    // Data for each customer type: array of { quarter, count, acv, percent }
    const dataByCustomerType = _.fromPairs(
      customerTypes.map(type => [
        type,
        quarters.map(q => {
          const found = data.find(d => d.closed_fiscal_quarter === q && d.Cust_Type === type);
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

    return { quarters, customerTypes, totals, dataByCustomerType };
  }, [data]);

  // Error handling for bad data
  if (
    !Array.isArray(data) || data.length === 0 ||
    customerTypes.length === 0 ||
    quarters.length === 0
  ) {
    return <Box sx={{ p: 2, color: 'error.main' }}>Data Error/No Data Available.</Box>;
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHeader quarters={quarters} />
          <TableBody>
            {customerTypes.map((type) => (
              <TableBodyRow
                key={type}
                type={type}
                rowData={dataByCustomerType[type]}
              />
            ))}
            <TotalRow quarters={quarters} totals={totals} />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableComponent;