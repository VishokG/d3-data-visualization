import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import type { Grouping } from "../../types"

const GroupingDropDown = ({ grouping, setGrouping }: {
  grouping: Grouping,
  setGrouping: (grouping: Grouping) => void
}) => {
  return (<FormControl size="small" sx={{bgcolor: "white"}}>
    <InputLabel id="grouping-select-label">Grouping</InputLabel>
    <Select
      labelId="grouping-select-label"
      value={grouping}
      label="Grouping"
      onChange={e => setGrouping(e.target.value)}
      style={{ minWidth: 140 }}
    >
      <MenuItem value="customer_type">Customer Type</MenuItem>
      <MenuItem value="industry">Industry</MenuItem>
      <MenuItem value="acv_range">ACV Range</MenuItem>
      <MenuItem value="team">Team</MenuItem>
    </Select>
  </FormControl>)
}

export default GroupingDropDown;