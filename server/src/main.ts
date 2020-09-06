import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";

import { serverInfo } from "./ServerInfo"
import { IContact } from "./Contacts"
import * as SMTP from "./SMTP"
import * as IMAP from "./IMAP"
import * as Contacts from "./Contacts"

const app: Express = express();

app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.use(function (inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET, POST, DELTE, OPTIONS");
    inResponse.header("Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    inNext();
})

//Get mailboxes
app.get("/mailboxes",
    async (inRequest: Request, inResponse: Response) => {
        try {
            console.log("getting mailboxes")
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
            inResponse.json(mailboxes);
        } catch (inError) {
            inResponse.send("error")
        }
    });

//list messages in a mailbox
app.get("/mailboxes/:mailbox",
    async (inRequest: Request, inResponse: Response) => {
        try {
            console.log("retreiving messages")
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messages: IMAP.IMessage[] = await imapWorker.listMessages({
                mailbox: inRequest.params.mailbox
            });
            inResponse.json(messages);
        } catch (inError) {
            inResponse.send("error")
        }
    });

//Get a message
app.get("/mailboxes/:mailbox/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messageBody: string = await imapWorker.getMessageBody({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10)
            });
            inResponse.send(messageBody);
        } catch (inError) {
            inResponse.send("error")
        }
    });

//Delete message
app.delete("/mailboxes/:mailbox/:id",
    async (inReqest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            await imapWorker.deleteMessage({
                mailbox: inReqest.params.mailbox,
                id: parseInt(inReqest.params.id, 10)
            });
            inResponse.send("ok")
        } catch (inError) {
            inResponse.send("error");
        }
    });

//Send Message
app.post("/messages",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
            await smtpWorker.sendMessage(inRequest.body);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.send("error");
        }
    });

//list contacts
app.get("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: IContact[] = await contactWorker.listContacts();
            inResponse.json(contacts);
        } catch (inError) {
            inResponse.send("error");
        }
    });

//create new contact
app.post("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactWorker.addContact(inRequest.body);
            inResponse.json(contact);
        } catch (inError) {
            inResponse.send("error");
        }
    });

//update existing contact information
app.put("/contacts/:id", async (inRequest: Request, inResponse: Response) => {
    try {
        const contactWorker: Contacts.Worker = new Contacts.Worker();
        await contactWorker.updateContact(inRequest.params.id, inRequest.body);
        inResponse.send("ok");
    } catch {
        inResponse.send("erorr");
    }
})


//delete a contact
app.delete("/contacts/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactWorker: Contacts.Worker = new Contacts.Worker();
            await contactWorker.deleteContact(inRequest.params.id);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.send("error");
        }
    });


app.listen(80, () => {
    console.log("serving")
})
