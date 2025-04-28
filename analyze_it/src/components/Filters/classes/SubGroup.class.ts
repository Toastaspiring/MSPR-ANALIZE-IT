import Compare from "./Compare.class";
import Logic from "./Logic.class";

export default class SubGroup {
    prop: (Compare|Logic)[];

    constructor(
        prop:(Compare|Logic)[] = [], 
    ) {
        this.prop = prop;
    }
}