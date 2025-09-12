from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.config import settings
import smtplib
from email.mime.text import MIMEText
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found.")

    # Generate password reset token (valid for 1 hour)
    expire = datetime.utcnow() + timedelta(hours=1)
    reset_token = jwt.encode({"sub": str(user.id), "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    # Construct reset link (adjust frontend URL as needed)
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"

    # Check if email is properly configured
    email_configured = (
        settings.SMTP_USER != "your_email@gmail.com" and 
        settings.SMTP_PASSWORD != "your_app_password" and
        settings.SMTP_USER and 
        settings.SMTP_PASSWORD
    )

    if email_configured:
        # Send email
        subject = "SheCare-AI Password Reset"
        body = f"Hello,\n\nTo reset your password, click the link below:\n{reset_link}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nSheCare-AI Team"
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_SENDER
        msg["To"] = user.email

        try:
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_SENDER, [user.email], msg.as_string())
            return {"message": "Password reset link sent to your email."}
        except Exception as e:
            # If email fails, return the reset link directly for development
            return {
                "message": "Email service temporarily unavailable. Please use this reset link:",
                "reset_link": reset_link,
                "note": "For development purposes only. Configure SMTP settings for production."
            }
    else:
        # Return reset link directly if email is not configured
        return {
            "message": "Email service not configured. Please use this reset link:",
            "reset_link": reset_link,
            "note": "Configure SMTP settings in your environment variables for production use."
        }
