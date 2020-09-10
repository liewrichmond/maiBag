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
         * 
         */
        showAddContact: function (): void {
            console.log("state.showAddContact()");
            this.setState({ currentView: "contactAdd", contactID: null, contactName: "", contactEmail: "" });
        }.bind(inParentComponent), /* End showAddContact(). */

        /**
         * 
         */
        showHidePleaseWait: function (inVisible: boolean): void {
            this.setState({ pleaseWaitVisible: inVisible });
        }.bind(inParentComponent),

        /**
         * 
         */
        addMailboxToList: function (inMailbox: IMAP.IMailbox): void {
            const cl: IMAP.IMailbox[] = this.state.mailboxes.slice(0);
            cl.push(inMailbox);
            this.setState({ mailboxes: cl });
        }.bind(inParentComponent),

        /**
         * 
         */
        addContactToList: function (inContact: Contacts.IContact): void {
            const cl: Contacts.IContact[] = this.state.contacts.slice(0);
            cl.push({ _id: inContact._id, name: inContact.name, email: inContact.email });
            this.setState({ contacts: cl });
        }.bind(inParentComponent),

        /**
         * 
         */
        setCurrentMailbox: function (inPath: string): void {
            this.setState({ currentView: "welcome", currentMailbox: inPath });
            this.state.getMessages(inPath);
        }.bind(inParentComponent),

        /**
         * 
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
         * 
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


    }
}