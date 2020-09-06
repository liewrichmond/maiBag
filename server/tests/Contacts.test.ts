// const Contacts = require('../src/Contacts')
import * as Contacts from "../src/Contacts";

test("tests true is true", () => {
    expect(true === true);
})

test("get Contacts", async () => {
    let worker:Contacts.Worker = new Contacts.Worker();
    let contacts: Contacts.IContact[] = await worker.listContacts();
    expect (contacts == []);
})