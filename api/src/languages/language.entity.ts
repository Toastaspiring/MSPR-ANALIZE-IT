import { User } from "../users/user.entity";
import { AfterInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('Language')
export class Language {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    lang: string

    @OneToMany(() => User, user => user.language)
    users: User[];

    @AfterInsert()
    logInsert() {
        console.log('Language created with id ' + this.id)
    }
}