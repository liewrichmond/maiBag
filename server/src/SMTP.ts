import Mail from "nodemailer/lib/mailer";
import * as nodemailer from "nodemailer";
import { SendMailOptions, SentMessageInfo } from "nodemailer";

import { IServerInfo } from "./ServerInfo";

/**
 * A Worker Class that will handle SMTP requests
 */
export class Worker {
    //Private Field that holds server Information
    private static serverInfo: IServerInfo;

    /**
     * Constructor
     * @param inServerInfo A ServerInfo object 
     */
    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    }

    /**
     * 
     * @param inOptions An object containing standard mail options, e.g to, from, cc, text body.
     * @returns a Promise that resolves to a string.
     */
    public sendMessage(inOptions: SendMailOptions): Promise<string> {
        return new Promise((inResolve, inReject) => {
            const transport: Mail = nodemailer.createTransport(Worker.serverInfo.smtp);
            transport.sendMail(inOptions,
                (inError: Error | null, inInfo: SentMessageInfo) => {
                    if (inError) {
                        console.log(inError);
                        inReject(inError);
                    } else {
                        console.log(inInfo);
                        inResolve();
                    }
                })
        })
    }
}