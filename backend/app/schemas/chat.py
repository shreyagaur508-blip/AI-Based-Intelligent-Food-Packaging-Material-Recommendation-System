"""Pydantic schemas for the PackWise Voice and AI Chat Assistant."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Single message in chat history."""
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message text content")


class SuggestedFormValues(BaseModel):
    """Extracted food commodity parameters ready to pre-fill the recommendation form."""
    commodity_name: Optional[str] = Field(None, description="Identified food commodity name (e.g. 'Tomato')")
    category: Optional[str] = Field(None, description="Food category (e.g. 'Fresh Produce')")
    storage_type: Optional[str] = Field(None, description="'ambient', 'chilled', or 'frozen'")
    desired_shelf_life_days: Optional[int] = Field(None, description="Target shelf life in days")
    sustainability_preference: Optional[str] = Field(None, description="'low', 'medium', or 'high'")
    moisture_category: Optional[str] = Field(None, description="Moisture category")
    oil_fat_category: Optional[str] = Field(None, description="Oil / fat level category")


class ChatRequest(BaseModel):
    """Payload for POST /api/chat endpoint."""
    message: str = Field(..., min_length=1, description="User query or voice transcript")
    language: str = Field("hi", description="ISO language code ('hi', 'en', 'kn', 'mr', 'bho')")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Recent conversation turns")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional extra user context")


class ChatResponse(BaseModel):
    """Response returned by the AI Chat assistant."""
    reply: str = Field(..., description="AI response text in the requested language")
    language: str = Field(..., description="Language of the response")
    suggested_form_values: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Extracted parameters if user mentioned commodity, storage, or shelf-life",
    )
    is_fallback: bool = Field(
        default=False,
        description="True if answered by the offline smart fallback engine",
    )
