import { FilterState } from "../enums/filterStates.enum";
import { Column } from "../types/column";

interface TableHeaderProps {
  name: string;
  filterState: FilterState;
  setSortedColumn: (sortedColumn: Column) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({ 
  name, 
  filterState,
  setSortedColumn 
}) => {
  function handleClick() {
    const newState = filterState === FilterState.NONE
      ? FilterState.AZ
      : filterState === FilterState.AZ
        ? FilterState.ZA
        : FilterState.NONE;
    
    setSortedColumn({ name: name, state: newState });
  }

  return (
    <th className="border border-gray-200 p-4 text-center">
      <button 
        className="w-full h-full flex justify-center items-center"
        onClick={() => handleClick()}
      >
        {name}
        {filterState !== FilterState.NONE && (
          <span className="ml-2">{filterState === FilterState.AZ ? "▲" : "▼"}</span>
        )}
      </button>
    </th>
  );
};

export default TableHeader;