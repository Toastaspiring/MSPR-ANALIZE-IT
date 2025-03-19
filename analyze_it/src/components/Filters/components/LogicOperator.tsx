import React, { useState } from 'react'
import Logic from '../classes/Logic.class'
import Compare from '../classes/Compare.class'
import SubGroup from '../classes/SubGroup.class'
import CompareOperator from './CompareOperator'
import { logicEnum } from '../enums/logicEnum'
import SubGroupOperator from './SubGroupOperator'

interface LogicOperatorProps {
    logic: Logic
    index: number
    updateParent: (index: number, logic?: Logic) => void
    
}

const LogicOperator: React.FC<LogicOperatorProps> = ({ logic, index, updateParent }) => {
    const [thisLogic, setThisLogic] = useState<Logic>(logic);


    const logicTypeChange = (type: logicEnum) => {
        const tempThisLogic = thisLogic;
        tempThisLogic.type = type;
        setThisLogic(tempThisLogic);
        if (updateParent !== undefined && index !== undefined) { // Mets à jour le parent si il existe
            updateParent(index, tempThisLogic); 
        }
    }


    const handleLogicChange = (idx: number, logic?: Logic) => {
        const tempProps = [...thisLogic.prop]; // Copie le tableau
    
        if (!logic) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new Logic(logic.prop, logic.type);
        }
    
        const updatedLogic = new Logic(tempProps, thisLogic.type); // Crée un nouvel objet Logic
    
        setThisLogic(updatedLogic);
    
        if (updateParent !== undefined && index !== undefined) {
            updateParent(index, updatedLogic);
        }
    };


    const handleCompareChange = (idx: number, compare?: Compare) => {
        const tempProps = [...thisLogic.prop]; // Copie le tableau
    
        if (!compare) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new Compare(compare.field, compare.condition, compare.value);
        }
    
        const updatedLogic = new Logic(tempProps, thisLogic.type); // Crée un nouvel objet Logic
    
        setThisLogic(updatedLogic);
    
        if (updateParent !== undefined && index !== undefined) {
            updateParent(index, updatedLogic);
        }
    };

    const handleSubGroupChange = (idx: number,  subGroup?: SubGroup) => {
        const tempProps = [...thisLogic.prop]; // Copie le tableau
    
        if (!subGroup) {
            tempProps.splice(idx, 1); // Supprime l'élément à l'index idx
        } else {
            tempProps[idx] = new SubGroup(subGroup.prop, subGroup.type);
        }
    
        const updatedLogic = new Logic(tempProps, thisLogic.type); // Crée un nouvel objet Logic
    
        setThisLogic(updatedLogic);
    
        if (updateParent !== undefined && index !== undefined) {
            updateParent(index, updatedLogic);
        }
    };


    const addCompare = () => {
        setThisLogic(prevLogic => {
            const updatedLogic = new Logic([...prevLogic.prop, new Compare()], prevLogic.type);
            if (updateParent !== undefined && index !== undefined) { 
                updateParent(index, updatedLogic); 
            }
            return updatedLogic;
        });
    };

    const addLogic = () => {
        setThisLogic(prevLogic => {
            const updatedLogic = new Logic([...prevLogic.prop, new Logic()], prevLogic.type);
            if (updateParent !== undefined && index !== undefined) { 
                updateParent(index, updatedLogic); 
            }
            return updatedLogic;
        });
    };

    const addSubGroup = () => {
        setThisLogic(prevLogic => {
            const updatedLogic = new Logic([...prevLogic.prop, new SubGroup()], prevLogic.type);
            if (updateParent !== undefined && index !== undefined) { 
                updateParent(index, updatedLogic); 
            }
            return updatedLogic;
        });
    };


    return (
        <div className='flex items-center w-fit h-fit my-2 mr-1 bg-black/10 text-black p-4'>
            <select className="mr-2 h-fit" defaultValue={logic.type} onChange={(e) => logicTypeChange(e.target.value as logicEnum)}>
                <option key={0} value={logicEnum.AND}>{logicEnum.AND}</option>
                <option key={1} value={logicEnum.OR}>{logicEnum.OR}</option>
                <option key={2} value={logicEnum.NOT}>{logicEnum.NOT}</option>
            </select>
            <div className='flex flex-col w-fit'>
                {thisLogic.prop.map((element, index) => {
                    if (element instanceof Logic) return <LogicOperator key={index} index={index} logic={element} updateParent={handleLogicChange}/>;
                    if (element instanceof SubGroup) return <SubGroupOperator key={index} index={index} subGroup={element} updateParent={handleSubGroupChange}/>;
                    if (element instanceof Compare) return <CompareOperator key={index} index={index} compare={element} updateParent={handleCompareChange}/>
                    return null;
                })}
                <div className='flex mt-1'>
                    <button className="bg-gray-200 border border-black mr-2 px-2" onClick={addLogic}>+ Add logic</button>
                    <button className="bg-gray-200 border border-black mr-2"onClick={addSubGroup}>+ Add subgroup</button>
                    <button className="bg-gray-200 border border-black" onClick={addCompare}>+ Add compare</button>
                </div>
            </div>
            <button className="w-fit h-fit text-black font-bold text-xl px-2" onClick={()=>updateParent(index)}> X </button>
        </div>
    );
};

export default LogicOperator;