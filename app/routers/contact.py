"""Contact & support APIs — contact form submission and WhatsApp link."""

from fastapi import APIRouter

from app.core.config import settings
from app.models.contact import ContactEnquiry, ContactRequest

router = APIRouter(tags=["contact & support"])


@router.post("/contact", status_code=201)
async def submitContact(request: ContactRequest):
    """Submit a contact form / enquiry."""
    enquiry = ContactEnquiry(
        name=request.name,
        email=request.email,
        phone=request.phone,
        message=request.message,
    )
    await enquiry.insert()
    return {"message": "Your enquiry has been submitted. We will get back to you soon!"}


@router.get("/support/whatsapp")
async def getWhatsAppLink():
    """Returns the WhatsApp click-to-chat URL."""
    number = settings.whatsapp_number
    message = "Hi, I need help with Sahyadri Tours and Travels."
    url = f"https://wa.me/{number}?text={message}"
    return {"whatsapp_url": url, "phone": number}
