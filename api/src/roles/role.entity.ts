import { AfterInsert, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { User } from "../users/user.entity"

@Entity('Role')
export class Role {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    roleName: string

    @OneToMany(() => User, user => user.role)
    users: User[];

    @AfterInsert()
    logInsert() {
        console.log('Localization created with id ' + this.id)
    }
}