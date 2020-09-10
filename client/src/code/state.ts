import * as IMAP from "./IMAP";
import * as Contacts from "./Contacts";
import { config } from "./config"

export function createState(inParentComponent) {
    return {
        pleaseWaitVisible: false,
        // List of contacts.
        contacts: [],

        // List of mailboxes.
        mailboxes: [],

        // List of messages in the current mailbox.
        messages: [],

        // The view that is currently showing ("welcome", "message", "compose", "contact" or "contactAdd").
        currentView: "welcome",

        // The currently selected mailbox, if any.
        currentMailbox: null,

        // The details of the message currently being viewed or composed, if any.
        messageID: null,
        messageDate: null,
        messageFrom: null,
        messageTo: null,
        messageSubject: null,
        messageBody: null,

        // The details of the contact currently being viewed or added, if any.
        contactID: null,
        contactName: null,
        contactEmail: null,

        /** 
         *  Toggles which view to show in the "Message" section of the screen, depending on input.
         *  @param inType the type of view to display on the "message" section.
         */
        showComposeMessage: function (inType: string): void {
            switch (inType) {
                case "new":
                    this.setState({
                        currentView: "compose",
                        messageTo: "", messageSubject: "", messageBody: "",
                        messageFrom: config.userEmail
                    });
                    break;
                case "reply":
                    this.setState({
                        currentView: "compose",
                        messageTo: this.state.messageFrom, messageSubject: `Re: ${this.state.messageSubject}`,
                        messageBody: `\n\n---- Original Message ----\n\n${this.state.messageBody}`, messageFrom: config.userEmail
                    });
                    break;
                case "contact":
                    this.setState({
                        currentView: "compose",
                        messageTo: this.state.contactEmail, messageSubject: "", messageBody: "",
                        messageFrom: config.userEmail
                    });
                    break;
            }
        }.bind(inParentComponent), /* End showComposeMessage(). */

        /**
         * Switches the center view area to add a contact with empty fields
         */
        showAddContact: function (): void {
            console.log("state.showAddContact()");
            this.setState({ currentView: "contactAdd", contactID: null, contactName: "", contactEmail: "" });
        }.bind(inParentComponent), /* End showAddContact(). */

        /**
         * Toggles the "Please Wait" message to be shown which blocks interaction with the UI.
         * @param inVisible a boolean. True if the please wait message should be shown, false otherwise
         */
        showHidePleaseWait: function (inVisible: boolean): void {
            this.setState({ pleaseWaitVisible: inVisible });
        }.bind(inParentComponent),

        /**
         * Adds a specified mailbox to the list of mailboxes to be displayed on screen
         * @param inMailbox the IMailbox to be added to the list
         */
        addMailboxToList: function (inMailbox: IMAP.IMailbox): void {
            const cl: IMAP.IMailbox[] = this.state.mailboxes.slice(0);
            cl.push(inMailbox);
            this.setState({ mailboxes: cl });
        }.bind(inParentComponent),

        /**
         * Adds a specified IContact to the list of contacts to be displayed on screen
         * @param inContact the IContact to be added to the list
         */
        addContactToList: function (inContact: Contacts.IContact): void {
            const cl: Contacts.IContact[] = this.state.contacts.slice(0);
            cl.push({ _id: inContact._id, name: inContact.name, email: inContact.email });
            this.setState({ contacts: cl });
        }.bind(inParentComponent),

        /**
         * Sets the currently displayed mailbox to the given mailbox path
         * @param inPath the IMailbox path to be displayed
         */
        setCurrentMailbox: function (inPath: string): void {
            this.setState({ currentView: "welcome", currentMailbox: inPath });
            this.state.getMessages(inPath);
        }.bind(inParentComponent),

        /**
         * Helper functions that gets the messages of the given path
         * @param inPath the IMailbox path whose messages you want to get
         */
        getMessages: async function (inPath: string): Promise<void> {

            console.log("state.getMessages()");

            this.state.showHidePleaseWait(true);
            const imapWorker: IMAP.Worker = new IMAP.Worker();
            const messages: IMAP.IMessage[] = await imapWorker.listMessages(inPath);
            this.state.showHidePleaseWait(false);
            this.state.clearMessages();
            messages.forEach((inMessage: IMAP.IMessage) => {
                this.state.addMessageToList(inMessage);
            });

        }.bind(inParentComponent), /* End getMessages(). */

        /**
         * Helper funciton that adds a specified IMessage to the list of messages of the state.
         * @param inMessage the IMessage to add to the list of messages.
         */
        addMessageToList: function (inMessage: IMAP.IMessage): void {

            // console.log("state.addMessageToList()", inMessage);

            // Copy list.
            const cl = this.state.messages.slice(0);

            // Add new element.
            cl.push({ id: inMessage.id, date: inMessage.date, from: inMessage.from, subject: inMessage.subject });

            // Update list in state.
            this.setState({ messages: cl });

        }.bind(inParentComponent), /* End addMessageToList(). */


        /**
         * Clear the list of messages currently displayed.
         */
        clearMessages: function (): void {

            console.log("state.clearMessages()");

            this.setState({ messages: [] });

        }.bind(inParentComponent), /* End clearMessages(). */

        showContact: function (in_id: string, inName: string, inEmail: string): void {
            this.setState({ currentView: "contact", contactID: in_id, contactName: inName, contactEmail: inEmail });
        }.bind(inParentComponent),


        /**
         * A function to be called when a user types in an editable field.
         */
        fieldChangeHandler: function(inEvent: any): void {
            if(inEvent.target.id === "contactName" && inEvent.target.value.length > 16) {return ;}
            this.setState({[inEvent.target.id] : inEvent.target.value});
        }.bind(inParentComponent),  

        /**
         * Saves a contact 
         */
        saveContact: async function(): Promise<void> {
            const cl = this.state.contacts.slice(0);
            this.state.showHidePleaseWait(true);
            const contactWorker: Contacts.Worker = new Contacts.Worker();
            const newContact: Contacts.IContact = {name: this.state.contactName, email: this.state.contactEmail};
            const returnedContact: Contacts.IContact = await contactWorker.addContact(newContact);
            this.state.showHidePleaseWait(false);
            cl.push(returnedContact);
            this.setState({contacts:cl, contactName: "", contactID: null, contactEmail: ""});
        }.bind(inParentComponent),

        /**
         * Deletes a contact from the contact list
         */
        deleteContact: async function():Promise<void> {
            this.state.showHidePleaseWait(true);
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            await contactsWorker.deleteContact(this.state.contactID);
            this.state.showHidePleaseWait(false);
            const cl = this.state.contacts.filter((value) => {
                return value._id != this.state.contactID;
            });
            console.log(cl)
            this.setState({contacts:cl, contactName: "", contactId: null, contactEmail: ""});
        }.bind(inParentComponent)

    }
}