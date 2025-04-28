// import Table from './components/Table'

import SubGroup from "./components/Filters/classes/SubGroup.class"
import { useEffect, useState } from "react"
import SubGroupOperator from "./components/Filters/components/SubGroupOperator";

const defaultSubGroup = new SubGroup([])

function App(){
  const [thisSubGroup, setThisSubGroup] = useState<SubGroup>(defaultSubGroup);
  

  const handleSubGroupChange = (subGroup?: SubGroup) => {
      const tempProps = [...thisSubGroup.prop]; // Copie le tableau
  
      if (!subGroup) {
          tempProps.splice(1); // Supprime l'élément à l'index idx
      }
  
      const updatedSubGroup = new SubGroup(tempProps); // Crée un nouvel objet Logic
      setThisSubGroup(updatedSubGroup);
  };

  return (
      
        <SubGroupOperator subGroup={thisSubGroup} updateParent={handleSubGroupChange}/>
      
  )
}

export default App