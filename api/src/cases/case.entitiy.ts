import { AfterInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Case {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    totalConfirmed: number

    @Column()
    totalDeath: number

    @Column()
    totalRecoveries: number

    @Column()
    totalActive: number

    @Column()
    localizationId: number

    @Column()
    date: Date

    @AfterInsert()
    logInsert() {
        console.log('Case created with id ' + this.id)
    }
}