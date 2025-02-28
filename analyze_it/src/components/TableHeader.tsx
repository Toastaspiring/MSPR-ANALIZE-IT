import { useEffect, useState } from "react";

enum FilterState {
    AZ = "az",
    ZA = "za",
    NONE = "none",
  }
  
  // Définir les types des props
  interface TableHeaderProps {
    name: string;
    filterState: FilterState;
    onClick: (name: string | null, filterState: FilterState) => void;
  }
  
  const TableHeader: React.FC<TableHeaderProps> = ({ name, filterState, onClick }) => {
    const [state, setState] = useState<FilterState>(FilterState.NONE);

    function isClicked() {
        if(state == FilterState.NONE){
            setState(FilterState.AZ);
        } else if (state == FilterState.AZ){
            setState(FilterState.ZA)
        }else{
            setState(FilterState.NONE)
        }
        onClick(name, filterState);
    }

    useEffect(()=>{

    },[state])
  
    return (
      <th className="border-[1px] border-gray-200 p-4 text-center">
        <button 
        className={`${state != FilterState.NONE ? ' flex bg-red-200': ''} w-full h-full`}
        onClick={() => isClicked()
        }>{name}{state == FilterState.AZ && (<p>^</p>)}
        {state == FilterState.ZA && (<p>v</p>)}</button>
        
      </th>
    );
  };
  
  export default TableHeader;