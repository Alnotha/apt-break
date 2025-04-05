from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select

from app import crud
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models import User

router = APIRouter()


@router.get("/login/google")
async def login_google(request: Request) -> Any:
    """
    Redirect to Google OAuth login page.
    """
    google_oauth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.get_google_redirect_uri}&"
        "response_type=code&"
        "scope=email profile&"
        "access_type=offline&"
        "prompt=consent"
    )
    return RedirectResponse(url=google_oauth_url)


@router.get("/login/google/callback")
async def google_callback(
    request: Request,
    code: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Handle Google OAuth callback...
    """
    try:
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.get_google_redirect_uri,
            "grant_type": "authorization_code",
        }
        async with request.app.state.http_client.post(token_url, data=token_data) as response:
            token_response = await response.json()
            if 'error' in token_response:
                print(f"Google OAuth Error: {token_response}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Google OAuth Error: {token_response.get('error_description', token_response['error'])}"
                )
            access_token = token_response["access_token"]

        # Get user info from Google
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        async with request.app.state.http_client.get(userinfo_url, headers=headers) as response:
            userinfo = await response.json()

        # Check if user exists
        statement = select(User).where(User.google_id == userinfo["id"])
        user = db.exec(statement).first()

        if not user:
            # Create new user
            user = User(
                email=userinfo["email"],
                full_name=userinfo.get("name"),
                google_id=userinfo["id"],
                hashed_password=None,  # No password for Google users
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate JWT token
        access_token = security.create_access_token(user.id)
        
        # Use the configured frontend URL or fallback to production URL if needed
        frontend_url = settings.FRONTEND_URL
        if not frontend_url or "localhost" in frontend_url:
            # Fallback to production URL if in production
            if settings.ENVIRONMENT != "local":
                frontend_url = "https://apt-break-frontend-git-main-alnothas.vercel.app"
        
        # Add the token as a query parameter
        redirect_url = f"{frontend_url}/login?token={access_token}"
        
        # Log the redirect for debugging (will appear in server logs)
        print(f"Redirecting to: {redirect_url}")
        
        response = RedirectResponse(url=redirect_url)
        return response

    except Exception as e:
        print(f"Google OAuth Error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Could not validate Google credentials: {str(e)}"
        ) from e 