from fastapi import APIRouter

from app.core.config import settings
from app.modules.contact.models import (
    ContactEnquiry,
    ContactRequest,
    CustomEnquiryRequest,
    CustomPackageEnquiry,
)

router = APIRouter(tags=["contact & support"])


@router.post("/contact", status_code=201)
async def submitContact(request: ContactRequest):
    enquiry = ContactEnquiry(
        name=request.name,
        email=request.email,
        phone=request.phone,
        message=request.message,
    )
    await enquiry.insert()
    return {"message": "Your enquiry has been submitted. We will get back to you soon!"}


@router.post("/contact/custom-enquiry", status_code=201)
async def submitCustomEnquiry(request: CustomEnquiryRequest):
    enquiry = CustomPackageEnquiry(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        guests=request.guests,
        name=request.name,
        email=request.email,
        phone=request.phone,
        requirements=request.requirements,
    )
    await enquiry.insert()
    return {
        "message": "Custom package enquiry submitted successfully! Our travel team is designing your custom itinerary.",
        "enquiry_id": str(enquiry.id),
    }


@router.get("/contact/custom-enquiries")
async def getCustomEnquiries(limit: int = 10):
    enquiries = await CustomPackageEnquiry.find_all(sort="-created_at", limit=limit).to_list()
    return [
        {
            "id": str(e.id),
            "destination": e.destination,
            "days": e.days,
            "budget": e.budget,
            "guests": e.guests,
            "name": e.name,
            "email": e.email,
            "requirements": e.requirements,
            "created_at": e.created_at.strftime("%d %b %Y"),
        }
        for e in enquiries
    ]


@router.get("/support/whatsapp")
async def getWhatsAppLink():
    number = settings.whatsapp_number
    message = "Hi, I need help with Sahyadri Tours and Travels."
    url = f"https://wa.me/{number}?text={message}"
    return {"whatsapp_url": url, "phone": number}

