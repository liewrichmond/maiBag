import * as path from "path";
import { throws } from "assert";
const Datastore = require("nedb");


export interface IContact {
    _id?: number,
    name: string,
    email: string
}

export class Worker {
    private db: Nedb;
    constructor() {
        this.db = new Datastore({
            filename: path.join(__dirname, "contacts.db"),
            autoload: true
        });
    }

    private isContact(inObject: IContact | any): inObject is IContact {
        return (inObject as IContact).email !== undefined && (inObject as IContact).name !== undefined;
    }

    public listContacts(): Promise<IContact[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({},
                (inError: Error, inDocs: IContact[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    }

    public addContact(inContact: IContact): Promise<IContact> {

        return new Promise((inResolve, inReject) => {
            if (!this.isContact(inContact)) {
                inReject(new Error);
            }
            else {
                this.db.insert(
                    inContact,
                    (inError: Error | null, inNewDoc: IContact) => {
                        if (inError) {
                            console.log("Contacts.Worker.addContact(): Error", inError);
                            inReject(inError);
                        } else {
                            console.log("Contacts.Worker.addContact(): Ok", inNewDoc);
                            inResolve(inNewDoc);
                        }
                    }
                )
            };
        });

    }

    public deleteContact(inID: string): Promise<string> {

        console.log("Contacts.Worker.deleteContact()", inID);

        return new Promise((inResolve, inReject) => {

            this.db.remove(
                { _id: inID },
                {},
                (inError: Error | null, inNumRemoved: number) => {
                    if (inError) {
                        console.log("Contacts.Worker.deleteContact(): Error", inError);
                        inReject(inError);
                    } else {
                        console.log("Contacts.Worker.deleteContact(): Ok", inNumRemoved);
                        inResolve();
                    }
                }
            );
        });

    } /* End deleteContact(). */

    /**
     * Updates an existing contact.
     * @param inId ID of contact to replce. Function does not mutate anything if id is non existent.
     * @param inContact details/fields to add to the existing contact.
     */
    public async updateContact(inId: string, inContact: IContact): Promise<string> {

        // Get existing contact information
        const p: Promise<IContact[]> = new Promise((inResolve, inReject) => {
            this.db.find({ _id: inId }, (inError: Error, inDocs: IContact[]) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inDocs);
                }
            });
        });
        const oldInfo: IContact[] = await p;

        //append new information to old information
        const newContact: IContact = {
            ...oldInfo[0],
            ...inContact
        }

        return new Promise((inResolve, inReject) => {
            inContact;
            this.db.update({ _id: inId },
                newContact,
                {},
                (inError: Error | null, numberofUpdated: number, upsert: boolean) => {
                    if (inError) {
                        console.log("Contacts.Worker.updateContact(): Error")
                        inReject(inError);
                    }
                    else {
                        console.log("Contacts.Worker.updateContact(): Ok")
                        console.log(`Num replaced: ${numberofUpdated}`);
                        inResolve("OK");
                    }
                }
            )
        });
    }
}

