import { compareConditionEnum } from "../enums/compareConditionEnum";
import { typeEnum } from "../enums/typeEnum";
import Field from "./Field.class";


export default class Compare {
    field: Field
    condition: compareConditionEnum;
    value: string | number

    constructor(
        field: Field = new Field("Continent", typeEnum.STRING),  // Valeur par défaut
        condition: compareConditionEnum = compareConditionEnum.LIKE, // Valeur par défaut
        value: string | number = "Europe" // Valeur par défaut
    ) {
        this.field = field;
        this.condition = condition;
        this.value = value;
    }
}