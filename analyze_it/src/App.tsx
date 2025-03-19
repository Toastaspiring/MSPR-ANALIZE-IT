// import Table from './components/Table'

import Compare from "./components/Filters/classes/Compare.class"
import {fields} from "./components/Filters/classes/Field.class"
import Logic from "./components/Filters/classes/Logic.class"
import LogicOperator from "./components/Filters/components/LogicOperator"
import { compareConditionEnum } from "./components/Filters/enums/compareConditionEnum"
import { logicEnum } from "./components/Filters/enums/logicEnum"
import SubGroup from "./components/Filters/classes/SubGroup.class"
import { subGroupEnum } from "./components/Filters/enums/subGroupEnum"

// function App() {
//   return (<Table/>)
// }

// import WhiteBoard from './components/WhiteBoard'

// function App(){
//   return <WhiteBoard/>


const compare2 = new Compare(fields[5], compareConditionEnum.EQUAL, 40);
const logic2 = new Logic([compare2], logicEnum.NOT);
const subGroup1 = new SubGroup([logic2], subGroupEnum.WHERE)
const logic1 = new Logic([logic2,subGroup1], logicEnum.OR);

function App(){

  const handleRacineChange = (index: number, logic: Logic) => {
    console.log("Racine change :",index,logic)
  }

  return (
      <LogicOperator logic={logic1} index={0} updateParent={handleRacineChange}/>
  )
}

export default App