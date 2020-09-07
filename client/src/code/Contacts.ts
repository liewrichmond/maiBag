import axios, { AxiosResponse } from "axios"
import { config } from "./config"
export interface IContact {
    _id?: number,
    name: string,
    email: string
}

export class Worker {
    public async listContacts(): Promise<IContact[]> {
        const reponse: AxiosResponse = await axios.get(`${config.serverAddress}/contacts`);
        return reponse.data;
    }

    public async addContact(inContact: IContact): Promise<IContact> {
        const response: AxiosResponse = await axios.post(`${config.serverAddress}/contacts`, inContact);
        return response.data;
    }

    public async deleteContact(inId): Promise<void> {
        const response: AxiosResponse = await axios.delete(`${config.serverAddress}/contacts/${inId}`);
    }

    public async updateContact(inId): Promise<IContact> {
        const response: AxiosResponse = await axios.put(`${config.serverAddress}/contacts/${inId}`);
        return response.data;
    }
}