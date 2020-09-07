// const Contacts = require('../src/Contacts')
import * as Contacts from "../src/Contacts";

test("tests true is true", () => {
    expect(true === true);
})
 
test("adds a contact", async () => {
    let worker:Contacts.Worker = new Contacts.Worker("test.db");
    let contact: Contacts.IContact = await worker.addContact({
        name:"Janet Jackson",
        email:"LessPopularJackson@heavenMail.com"
    });
    expect(contact.name).toBe("Janet Jackson");
    expect(contact.email).toBe("LessPopularJackson@heavenMail.com");
})