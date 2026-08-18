"""
Async email utility using aiosmtplib (Gmail SMTP / any STARTTLS provider).

Usage:
    from app.core.email import sendEmail
    await sendEmail(
        to="someone@example.com",
        subject="Hello",
        html="<p>Hello!</p>",
        text="Hello!",
    )

Configure via .env:
    SMTP_USER=youraddress@gmail.com
    SMTP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail App Password
"""

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib
from fastapi import HTTPException

from app.core.config import settings


async def sendEmail(
    *,
    to: str,
    subject: str,
    html: str,
    text: str = "",
) -> None:
    """
    Send an HTML email (with optional plain-text fallback) via SMTP STARTTLS.

    Raises:
        HTTPException 503 — if SMTP credentials are not configured.
        HTTPException 502 — if the email could not be delivered (SMTP error).
    """
    if not settings.smtp_user or not settings.smtp_password:
        raise HTTPException(
            status_code=503,
            detail=(
                "Email service is not configured. "
                "Set SMTP_USER and SMTP_PASSWORD in .env."
            ),
        )

    # Build MIME message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to

    if text:
        msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
    except aiosmtplib.SMTPException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to send email: {exc}",
        )
