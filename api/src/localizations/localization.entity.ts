import { AfterInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Localization {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    country: string

    @Column()
    continent: string

    @AfterInsert()
    logInsert() {
        console.log('Localization created with id ' + this.id)
    }
}