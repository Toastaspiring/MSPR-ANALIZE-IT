import React, { useState } from 'react'
import Compare from '../classes/Compare.class'
import SubGroup from '../classes/SubGroup.class'
import CompareOperator from './CompareOperator'
import { subGroupEnum } from '../enums/subGroupEnum'
import Logic from '../classes/Logic.class'
import LogicOperator from './LogicOperator'

interface SubGroupOperatorProps {
    subGroup: SubGroup
    index?: number
    updateParent: (index: number, subGroup: SubGroup) => void
}

const SubGroupOperator: React.FC<SubGroupOperatorProps> = ({ subGroup, index, updateParent }) => {
    const [thisSubGroup, setThisSubGroup] = useState<SubGroup>(subGroup);


    const subGroupTypeChange = (type: subGroupEnum) => {
        const tempThisSubGroup = thisSubGroup;
        tempThisSubGroup.type = type;
        setThisSubGroup(tempThisSubGroup);
        if (updateParent !== undefined && index !== undefined) { // Mets à jour le parent si il existe
            updateParent(index, tempThisSubGroup); 
        }
    }

    const handleLogicChange = (idx: number, logic: Logic) => {
        const tempThisSubgGroup = thisSubGroup;
        tempThisSubgGroup.prop[idx] = new Logic(logic.prop, logic.type);
        setThisSubGroup(tempThisSubgGroup);
        if (updateParent !== undefined && index !== undefined) { // Mets à jour le parent si il existe
            updateParent(index, tempThisSubgGroup); 
        }
    };


    const handleSubGroupChange = (idx: number, subGroup: SubGroup) => {
        const tempThisSubGroup = thisSubGroup;
        tempThisSubGroup.prop[idx] = new SubGroup(subGroup.prop, subGroup.type);
        setThisSubGroup(tempThisSubGroup);
        if (updateParent !== undefined && index !== undefined) { // Mets à jour le parent si il existe
            updateParent(index, tempThisSubGroup); 
        }
    };


    const handleCompareChange = (idx: number, compare?: Compare) => {
            const tempProps = [...thisSubGroup.prop]; // Copie le tableau
        
            if (!compare) {
                tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
            } else {
                tempProps[idx] = new Compare(compare.field, compare.condition, compare.value);
            }
        
            const updatedSubGroup = new SubGroup(tempProps, thisSubGroup.type); // Crée un nouvel objet Logic
        
            setThisSubGroup(updatedSubGroup);
        
            if (updateParent !== undefined && index !== undefined) {
                updateParent(index, updatedSubGroup);
            }
        };


    return (
        <div className='w-fit my-2 mr-1 bg-black/10 text-black p-4'>
            <select className="mr-2" onChange={(e) => subGroupTypeChange(e.target.value as subGroupEnum)}>
                <option key={0} value={subGroupEnum.WHERE}>{subGroupEnum.WHERE}</option>
                <option key={1} value={subGroupEnum.PARENTHESIS}>{subGroupEnum.PARENTHESIS}</option>
            </select>
                {thisSubGroup.prop.map((element, index) => {
                    if (element instanceof Logic) return <LogicOperator key={index} index={index} logic={element} updateParent={handleLogicChange}/>;
                    if (element instanceof SubGroup) return <SubGroupOperator key={index} index={index} subGroup={element} updateParent={handleSubGroupChange}/>;
                    if (element instanceof Compare) return <CompareOperator key={index} index={index} compare={element} updateParent={handleCompareChange}/>
                    return null;
                })}
        </div>
    );
};

export default SubGroupOperator;