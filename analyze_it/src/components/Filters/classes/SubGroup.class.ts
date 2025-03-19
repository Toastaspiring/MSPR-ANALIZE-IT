import { subGroupEnum } from "../enums/subGroupEnum";
import Compare from "./Compare.class";
import Logic from "./Logic.class";

export default class SubGroup {
    prop: (Compare|Logic|SubGroup)[];
    type: subGroupEnum

    constructor(
        prop:(Compare|Logic|SubGroup)[] = [], 
        type:subGroupEnum = subGroupEnum.PARENTHESIS
    ) {
        this.prop = prop;
        this.type = type;
    }
}