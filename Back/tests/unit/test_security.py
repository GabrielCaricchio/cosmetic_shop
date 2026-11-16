import pytest
from Back.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_argon2id_hashing_and_verification():
    password = "MinhaSenhaForteCosmetico123!"
    hashed = hash_password(password)
    assert hashed != password
    assert hashed.startswith("$argon2id$")
    assert verify_password(password, hashed) is True
    assert verify_password("SenhaErrada", hashed) is False

def test_jwt_generation_and_payload_decode():
    token = create_access_token({"sub": "client_1", "role": "client"})
    payload = decode_access_token(token)
    assert payload["sub"] == "client_1"
    assert payload["role"] == "client"
