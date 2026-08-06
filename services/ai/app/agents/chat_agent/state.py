from typing import Annotated

from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class ChatAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    conversation_id: str
    user_id: str
