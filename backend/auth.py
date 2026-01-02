from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import requests

security = HTTPBearer()

JWKS_URL = "https://sgapkherqlttqwznhzun.supabase.co/auth/v1/certs"
JWKS = requests.get(JWKS_URL).json()

def get_public_key(token: str):
    headers = jwt.get_unverified_header(token)
    kid = headers.get("kid")

    for key in JWKS["keys"]:
        if key["kid"] == kid:
            return key

    raise HTTPException(status_code=401, detail="Invalid token key")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        public_key = get_public_key(token)

        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience="authenticated",
            options={"verify_exp": True},
        )

        return payload

    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")