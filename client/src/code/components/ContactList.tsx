import React from "react"
import { List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@material-ui/core"
import {Person} from "@material-ui/icons"

const ContactView = ({ state }) => (
    <List>
        {
            state.contacts.map((value) => {
                return (
                    <ListItem key={value} button onClick={() => state.showContact(value._id, value.name, value.email)}>
                        <ListItemAvatar>
                            <Avatar>
                                <Person />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={`${value.name}`}></ListItemText>
                    </ListItem>
                )
            })
        }
    </List>
)

export default ContactView