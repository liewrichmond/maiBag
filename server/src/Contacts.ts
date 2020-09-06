import * as path from "path";
import { throws, match } from "assert";
const Datastore = require("nedb");


export interface IContact {
    _id?: number,
    name: string,
    email: string
}

export class Worker {
    private db: Nedb;
    /**
     * Creates a new worker to do Contacts related work.
     * @param dbName A database name that ends with .db. Example: test.db
     */
    constructor(dbName?: string) {
        if (dbName) {
            this.db = new Datastore({
                filename: path.join(__dirname, dbName),
                autoload: true
            });
        } else {
            this.db = new Datastore({
                filename: path.join(__dirname, "contacts.db"),
                autoload: true
            });
        }
    }

    private isContact(inObject: IContact | any): inObject is IContact {
        return (inObject as IContact).email !== undefined && (inObject as IContact).name !== undefined;
    }

    private async getContact(inContact: IContact): Promise<IContact[]> {
        const matchingContacts = new Promise<IContact[]>((inResolve, inReject) => {
            this.db.find(inContact, (inError: Error, inDocuments: IContact[]) => {
                if (inError) {
                    inReject(inError);
                }
                else {
                    inResolve(inDocuments);
                }
            })
        });
        return matchingContacts;
    }

    private async contactExists(inContact: IContact): Promise<boolean> {
        const matchingContacts: IContact[] = await this.getContact(inContact);
        if (matchingContacts.length == 0) {
            return false;
        } else if (matchingContacts[0].email === inContact.email && matchingContacts[0].name === inContact.name) {
            return true;
        } else {
            return false;
        }
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

    public async addContact(inContact: IContact): Promise<IContact> {
        const contactExists = await this.contactExists(inContact);
        return new Promise((inResolve, inReject) => {
            if (!this.isContact(inContact)) {
                inReject(new TypeError);
            } else if (contactExists) {
                this.getContact(inContact).then((contact: IContact[]) => {
                    inResolve(contact[0]);
                })
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

