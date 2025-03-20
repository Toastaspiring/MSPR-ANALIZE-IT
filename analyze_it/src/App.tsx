// import Table from './components/Table'

import SubGroup from "./components/Filters/classes/SubGroup.class"
import SubGroupOperator from "./components/Filters/components/SubGroupOperator";
import { subGroupEnum } from "./components/Filters/enums/subGroupEnum"
import { useState } from "react"

// function App() {
//   return (<Table/>)
// }

// import WhiteBoard from './components/WhiteBoard'

// function App(){
//   return <WhiteBoard/>

const defaultSubGroup = new SubGroup([], subGroupEnum.WHERE)

function App(){
  const [thisSubGroup, setThisSubGroup] = useState<SubGroup>(defaultSubGroup);

  const handleSubGroupChange = (idx: number,  subGroup?: SubGroup) => {
      const tempProps = [...thisSubGroup.prop]; // Copie le tableau
  
      if (!subGroup) {
          tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
      } else {
          tempProps[idx] = new SubGroup(subGroup.prop, subGroup.type);
      }
  
      const updatedSubGroup = new SubGroup(tempProps, thisSubGroup.type); // Crée un nouvel objet Logic
  
      setThisSubGroup(updatedSubGroup);
  };

  return (
      <div className="p-4">
        <SubGroupOperator subGroup={defaultSubGroup} updateParent={handleSubGroupChange}/>
      </div>
  )
}

export default App