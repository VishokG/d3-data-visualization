import React, { useMemo } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import _ from "lodash";
import { formatCurrency, formatPercent } from "../../utils";
import tableTheme from "./theme";

interface DataRow {
  closed_fiscal_quarter: string;
  category: string;
  count: number;
  acv: number;
}

const data: DataRow[] = [];

const TableHeader: React.FC<{ title: string; quarters: string[] }> = ({ title, quarters }) => {

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
        <TableCell align="center" sx={headerCellSx} component="th" scope="col">{title}</TableCell>
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

interface TableComponentProps {
  quarters: string[];
  groupingTypes: string[];
  totals: Record<string, { count: number; acv: number }>;
  dataByGroupingType: Record<string, Array<{ quarter: string; count: number; acv: number; percent: number }>>;
}

const TableComponent = ({
  quarters,
  groupingTypes,
  totals,
  dataByGroupingType
}: TableComponentProps) => {

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHeader title={"Cust Type"} quarters={quarters} />
          <TableBody>
            {groupingTypes.map((type) => (
              <TableBodyRow
                key={type}
                type={type}
                rowData={dataByGroupingType[type]}
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