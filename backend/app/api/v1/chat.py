"""PackWise AI Voice and Text Chat Assistant API Endpoint."""

from fastapi import APIRouter, status
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter()


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Voice & Text AI Packaging Assistant",
    description=(
        "Conversational AI endpoint allowing farmers and food processors to ask packaging questions "
        "via text or speech recognition in their own language (Hindi, English, Kannada, Marathi, Bhojpuri). "
        "Returns clear, domain-accurate advice and structured form values."
    ),
)
async def chat_assistant(request: ChatRequest) -> ChatResponse:
    """Chat endpoint for conversational packaging recommendations."""
    return await chat_service.process_chat(request)
