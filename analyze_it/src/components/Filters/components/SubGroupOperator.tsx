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
    updateParent: (index: number, subGroup?: SubGroup) => void
}

const SubGroupOperator: React.FC<SubGroupOperatorProps> = ({ subGroup, index, updateParent }) => {
    const [thisSubGroup, setThisSubGroup] = useState<SubGroup>(subGroup);

    const subGroupTypeChange = (type: subGroupEnum) => {
        setThisSubGroup(prevSubGroup => {
            const updatedSubGroup = new SubGroup(prevSubGroup.prop, type); // Crée un nouvel objet SubGroup avec le nouveau type
            if (updateParent && index !== undefined) {
                updateParent(index, updatedSubGroup);
            }
            return updatedSubGroup;
        });
    };

    const handleLogicChange = (idx: number, logic?: Logic) => {
        const tempProps = [...thisSubGroup.prop]; // Copie le tableau
    
        if (!logic) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new Logic(logic.prop, logic.type);
        }
    
        const updatedSubGroup = new SubGroup(tempProps, thisSubGroup.type); // Crée un nouvel objet Logic
    
        setThisSubGroup(updatedSubGroup);
    
        if (updateParent && index !== undefined) {
            updateParent(index, updatedSubGroup);
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
    
        if (updateParent && index !== undefined) {
            updateParent(index, updatedSubGroup);
        }
    };

    const handleSubGroupChange = (idx: number,  subGroup?: SubGroup) => {
        const tempProps = [...thisSubGroup.prop]; // Copie le tableau
    
        if (!subGroup) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new SubGroup(subGroup.prop, subGroup.type);
        }
    
        const updatedSubGroup = new SubGroup(tempProps, thisSubGroup.type); // Crée un nouvel objet Logic
    
        setThisSubGroup(updatedSubGroup);
    
        if (updateParent && index !== undefined) {
            updateParent(index, updatedSubGroup);
        }
    };


    const addCompare = () => {
        setThisSubGroup(prevSubGroup => {
            const updatedSubGroup = new SubGroup([...prevSubGroup.prop, new Compare()], prevSubGroup.type);
            if (updateParent && index !== undefined) {
                updateParent(index, updatedSubGroup);
            }
            return updatedSubGroup;
        });
    };

    const addLogic = () => {
        setThisSubGroup(prevSubGroup => {
            const updatedSubGroup = new SubGroup([...prevSubGroup.prop, new Logic()], prevSubGroup.type);
            if (updateParent && index !== undefined) { 
                updateParent(index, updatedSubGroup); 
            }
            return updatedSubGroup;
        });
    };

    const addSubGroup = () => {
        setThisSubGroup(prevSubGroup => {
            const updatedSubGroup = new SubGroup([...prevSubGroup.prop, new SubGroup()], prevSubGroup.type);
            if (updateParent && index !== undefined) { 
                updateParent(index, updatedSubGroup); 
            }
            return updatedSubGroup;
        });
    };

    return (
        <div className='w-fit h-fit my-2 mr-1 bg-black/10 text-black p-4'>
            <div className='flex w-full justify-between'>
                <select className="mr-2" defaultValue={thisSubGroup.type} onChange={(e) => subGroupTypeChange(e.target.value as subGroupEnum)}>
                    <option key={0} value={subGroupEnum.WHERE}>{subGroupEnum.WHERE}</option>
                    <option key={1} value={subGroupEnum.PARENTHESIS}>{subGroupEnum.PARENTHESIS}</option>
                </select>
                {updateParent && index !== undefined && <button className="w-fit h-fit text-black font-bold text-xl px-2" onClick={()=>updateParent(index)}> X </button>}
            </div>
            {thisSubGroup.prop.map((element, index) => {
                if (element instanceof Logic) return <LogicOperator key={index} index={index} logic={element} updateParent={handleLogicChange}/>;
                if (element instanceof SubGroup) return <SubGroupOperator key={index} index={index} subGroup={element} updateParent={handleSubGroupChange}/>;
                if (element instanceof Compare) return <CompareOperator key={index} index={index} compare={element} updateParent={handleCompareChange}/>
                return null;
            })}
            {((thisSubGroup.prop.length < 1 && thisSubGroup.type == subGroupEnum.WHERE) || (thisSubGroup.prop.length < 2 && thisSubGroup.type == subGroupEnum.PARENTHESIS)) && (
                <div className='flex mt-1'>
                    <button className="bg-gray-200 border border-black mr-2 px-2" onClick={addLogic}>+ Add logic</button>
                    <button className="bg-gray-200 border border-black mr-2" onClick={addSubGroup}>+ Add subgroup</button>
                    {thisSubGroup.type == subGroupEnum.WHERE && <button className="bg-gray-200 border border-black" onClick={addCompare}>+ Add compare</button>}
                </div>
            )}
        </div>
    );
};

export default SubGroupOperator;