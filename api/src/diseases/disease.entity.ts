import { AfterInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Disease {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @AfterInsert()
    logInsert() {
        console.log('Disease created with id ' + this.id)
    }
}