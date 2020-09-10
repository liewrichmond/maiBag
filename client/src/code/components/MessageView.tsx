import React from "react"
import { InputBase, TextField, Button } from "@material-ui/core"

const MessageView = ({ state }) => (
    <form>
        {/* Message ID */}
        {state.currentView === "message" &&
            <InputBase defaultValue={`ID ${state.messageID}`} margin="dense" disabled={true} fullWidth={true} className="messageInfoField" />
        }
        {state.currentView === "message" && <br />}
        {/* Message Date */}
        {state.currentView === "message" &&
            <InputBase defaultValue={state.messageDate} margin="dense" disabled={true} fullWidth={true} className="messageInfoField" />
        }
        {state.currentView === "message" && <br />}
        {/* From Field */}
        {state.currentView === "message" &&
            <TextField margin="dense" variant="outlined" fullWidth={true} label="From" value={state.messageFrom}
                disabled={true} InputProps={{ style: { color: "#000000" } }} />}
        {state.currentView === "message" && <br />}
        {/* To Field */}
        {state.currentView === "compose" &&
            <TextField margin="dense" id="messageTo" variant="outlined" fullWidth={true} label="To" value={state.messageTo}
                InputProps={{ style: { color: "#000000" } }} onChange={state.fieldChangeHandler} />
        }
        {state.currentView === "compose" && <br />}
        {/* Subject Field */}
        <TextField margin="dense" id="messageSubject" label="Subject" variant="outlined" fullWidth={true} value={state.messageSubject}
            disabled={state.currentView === "message"} InputProps={{ style: { color: "#000000" } }} onChange={state.fieldChangeHandler} />
        <br />
        {/* Message Body */}
        <TextField margin="dense" id="messageBody" variant="outlined" fullWidth={true} multiline={true}
            rows={12} value={state.messageBody} disabled={state.currentView === "message"} InputProps={{ style: { color: "#000000" } }} onChange={state.fieldChangeHandler} />
        {/* Send Button */}
        {state.currentView === "compose" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }} onClick={state.sendMessage}>
                Send
            </Button>
        }
        {/* Reply Button */}
        {state.currentView === "message" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10, marginRight: 10 }}
                onClick={() => state.showComposeMessage("reply")}>
                Reply
            </Button>
        }
        {/* Delete Button */}
        {state.currentView === "message" &&
            <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }}
                onClick={state.deleteMessage}>
                Delete
            </Button>
        }
    </form>
)

export default MessageView