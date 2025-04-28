import React, { useEffect, useState } from 'react'
import Compare from '../classes/Compare.class'
import SubGroup from '../classes/SubGroup.class'
import CompareOperator from './CompareOperator'
import Logic from '../classes/Logic.class'
import LogicOperator from './LogicOperator'

interface SubGroupOperatorProps {
    subGroup: SubGroup
    updateParent: (subGroup?: SubGroup) => void
}

const SubGroupOperator: React.FC<SubGroupOperatorProps> = ({ subGroup, updateParent }) => {
    const [thisSubGroup, setThisSubGroup] = useState<SubGroup>(subGroup);

    useEffect(()=>{
        console.log("SubGroupOperator", thisSubGroup);
    },[thisSubGroup])

    const handleLogicChange = (idx: number, logic?: Logic) => {
        const tempProps = [...thisSubGroup.prop]; // Copie le tableau
    
        if (!logic) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new Logic(logic.prop, logic.type);
        }
    
        const updatedSubGroup = new SubGroup(tempProps); // Crée un nouvel objet Logic
    
        setThisSubGroup(updatedSubGroup);
    
        if (updateParent) {
            updateParent(updatedSubGroup);
        }
    };


    const handleCompareChange = (idx: number, compare?: Compare) => {
        const tempProps = [...thisSubGroup.prop]; // Copie le tableau
    
        if (!compare) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new Compare(compare.field, compare.condition, compare.value);
        }
    
        const updatedSubGroup = new SubGroup(tempProps); // Crée un nouvel objet Logic
    
        setThisSubGroup(updatedSubGroup);
    
        if (updateParent) {
            updateParent(updatedSubGroup);
        }
    };

    const addCompare = () => {
        setThisSubGroup(prevSubGroup => {
            const updatedSubGroup = new SubGroup([...prevSubGroup.prop, new Compare()]);
            if (updateParent) {
                updateParent(updatedSubGroup);
            }
            return updatedSubGroup;
        });
    };

    const addLogic = () => {
        setThisSubGroup(prevSubGroup => {
            const updatedSubGroup = new SubGroup([...prevSubGroup.prop, new Logic()]);
            if (updateParent) { 
                updateParent(updatedSubGroup); 
            }
            return updatedSubGroup;
        });
    };

    return (
        <div className='w-fit h-fit my-2 mr-1 bg-black/10 text-black p-4'>
            <h1>WHERE</h1>
            {thisSubGroup.prop.map((element, index) => {
                if (element instanceof Logic) return <LogicOperator key={index} index={index} logic={element} updateParent={handleLogicChange}/>;
                if (element instanceof Compare) return <CompareOperator key={index} index={index} compare={element} updateParent={handleCompareChange}/>
                return null;
            })}
            {(thisSubGroup.prop.length < 1) && (
                <div className='flex mt-1'>
                    <button className="bg-gray-200 border border-black mr-2 px-2" onClick={addLogic}>+ Add logic</button>
                    <button className="bg-gray-200 border border-black" onClick={addCompare}>+ Add compare</button>
                </div>
            )}
        </div>
    );
};

export default SubGroupOperator;