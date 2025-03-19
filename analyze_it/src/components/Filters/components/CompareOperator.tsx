import { useEffect, useState } from "react"
import {fields} from "../classes/Field.class"
import Compare from "../classes/Compare.class"
import { compareConditionEnum } from "../enums/compareConditionEnum"

// const defaultCompare: Compare = {
//     field: fields[0],
//     condition: compareConditionEnum.LIKE,
//     value: ""
// }

interface CompareOperatorProps {
    compare: Compare
    index: number
    updateParent: (index: number, compare?: Compare) => void
}

// Pour le moment on ne fais que montrer la valeur passee en prop ou alors une valeur par defaut
const CompareOperator: React.FC<CompareOperatorProps> = ({ compare, index, updateParent }) => {
    const [thisCompare,setThisCompare] = useState<Compare>(compare);
    
    
    const handleCompareChange = (value: compareConditionEnum) => {
        setThisCompare(prev => ({ ...prev, condition: value }))
    }
    
    
    const handleFieldChange = (value: string) => {
        const field = fields.find(field => field.label === value); // Trouve l'objet field correspondant
        
        if (field) {
            setThisCompare(prev => ({ ...prev, field:field })); // Met à jour compare.field
        }
    }

    const handleValueChange =(value:string) => {
        setThisCompare(prev => ({ ...prev, value:value }))
    }
    
    // permet d'afficher le bon type d'input en fonction du champs selectionne
    const inputType = () => {
        let type :string = "";
        let placeholder :string = "";
        let defaultValue :string|number = "";
        
        if(thisCompare.field.type == "string"){ type = "text"; placeholder="Text..."; defaultValue=compare.value}
        if(thisCompare.field.type == "number"){ type = "number"; placeholder="Number..."; defaultValue=compare.value}
        
        return <input className="h-fit" id="valueInput" type={type} placeholder={placeholder} defaultValue={compare.value} onChange={(e) => handleValueChange(e.target.value)}/>
    }
    
    // Permet d'afficher les conditions utilisables par le champs en fonction du champs selectionne
    const conditionType = () => {
        const conditionsMap: Record<string, compareConditionEnum[]> = {
            string: [compareConditionEnum.LIKE, compareConditionEnum.NOT_LIKE],
            number: [
                compareConditionEnum.EQUAL,
                compareConditionEnum.NOT_EQUAL,
                compareConditionEnum.GREATER_THAN,
                compareConditionEnum.LESS_THAN,
                compareConditionEnum.GREATER_THAN_OR_EQUAL,
                compareConditionEnum.LESS_THAN_OR_EQUAL
            ],
        };
        
        const conditions = conditionsMap[thisCompare.field.type] || [];
        
        return (
            <select className="mr-2 h-fit" onChange={(e) => handleCompareChange(e.target.value as compareConditionEnum)}>
                {conditions.map((condition,index) => (
                    <option key={index} value={condition}>{condition}</option>
                ))}
            </select>
        );
    };
    
    // Lorsque compare est modifie on met a jour le parent
    useEffect(()=>{
        updateParent(index, thisCompare)
    },[thisCompare])
    
    
    return (
        <div className="flex h-fit text-black font-bold bg-red-500 w-fit p-1">
            <select className="mr-2 h-fit" onChange={(e) => handleFieldChange(e.target.value)} defaultValue={compare.field.label}>
                {fields.map((field, index) => (
                    <option key={index} value={field.label}>{field.label}</option>
                ))}
            </select>
            {conditionType()}
            {inputType()}
            <button className="w-fit h-fit text-black font-bold text-xl px-2" onClick={()=>updateParent(index)}> X </button>
        </div>
    )
}

export default CompareOperator