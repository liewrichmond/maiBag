const IMAPClient = require("emailjs-imap-client")
import { ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { IServerInfo } from "./ServerInfo";
import { parse } from "path";

export interface ICallOptions {
    mailbox: string,
    id?: number
};

export interface IMessage {
    id: string,
    date: string,
    from: string,
    subject: string,
    body?: string
};

export interface IMailbox {
    name: string,
    path: string
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export class Worker {
    private static serverInfo: IServerInfo;
    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    }

    private async connectToServer(): Promise<any> {
        const client: any = new IMAPClient.default(
            Worker.serverInfo.imap.host,
            Worker.serverInfo.imap.port,
            { auth: Worker.serverInfo.imap.auth }
        );
        client.logLevel = client.LOG_LEVEL_NONE;
        client.onerror = (inError: Error) => {
            console.log(
                "IMAP.Worker.listMailboxes(): Connection Error",
                inError
            );
        }
        await client.connect();
        console.log("IMAP.Worker.listMailboxes(): Connected");

        return client;
    }

    public async listMailboxes(): Promise<IMailbox[]> {
        const client: any = await this.connectToServer();
        const mailboxes: any = await client.listMailboxes();
        await client.close();
        const finalMailboxes: IMailbox[] = [];
        const iterateChildren: Function = (inArray: any[]): void => {
            inArray.forEach((inValue: any) => {
                finalMailboxes.push({
                    name: inValue.name,
                    path: inValue.path
                });
                iterateChildren(inValue.children);
            });
        };
        iterateChildren(mailboxes.children);
        return finalMailboxes;
    }

    public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
        const client = await this.connectToServer();
        const mailbox: any = await client.selectMailbox(inCallOptions.mailbox);
        if (mailbox.exists === 0) {
            await client.close();
            return [];
        }
        const latestMessage: any[] = await client.listMessages(
            inCallOptions.mailbox, "*:*", ["uid", "envelope"]
        );

        const latestId:number = latestMessage[0]["#"];
        const startId: number = latestId - 30 > 0 ? latestId - 30 : 1;
        
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox, `${startId}:*`, ["uid", "envelope"]
        );
        await client.close();
        const finalMessages: IMessage[] = [];
        messages.forEach((inValue: any) => {
            finalMessages.push({
                id: inValue.uid,
                date: inValue.envelope.date,
                from: inValue.envelope.from[0].address,
                subject: inValue.envelope.subject
            });
        });
        return finalMessages.reverse();
    }

    public async getMessageBody(inCallOptions: ICallOptions): Promise<string> {

        console.log("IMAP.Worker.getMessageBody()", inCallOptions);

        const client: any = await this.connectToServer();

        // noinspection TypeScriptValidateJSTypes
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox,
            inCallOptions.id,
            ["body[]"],
            { byUid: true }
        );
        const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]);

        await client.close();

        if (parsed.text === undefined) {
            console.log("empty body")
            return "";
        }
        return parsed.text;

    } /* End getMessageBody(). */

    public async deleteMessage(inCallOptions: ICallOptions): Promise<any> {

        console.log("IMAP.Worker.deleteMessage()", inCallOptions);

        const client: any = await this.connectToServer();

        await client.deleteMessages(
            inCallOptions.mailbox,
            inCallOptions.id,
            { byUid: true }
        );

        await client.close();

    } /* End deleteMessage(). */


}

