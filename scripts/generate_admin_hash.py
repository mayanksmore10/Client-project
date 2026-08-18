"""
Run this script once to generate the admin password hash.
Then paste the output into your .env file as ADMIN_PASSWORD_HASH.

Usage:
    python scripts/generate_admin_hash.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def main():
    print("=== Sahyadri Tours — Admin Password Setup ===\n")
    password = input("Enter the admin password you want to use: ").strip()

    if len(password) < 10:
        print("❌ Password must be at least 10 characters for security.")
        sys.exit(1)

    hashed = _pwd_context.hash(password)

    print("\n✅ Add these lines to your .env file:\n")
    print(f'ADMIN_EMAIL="admin@sahyadritours.com"')
    print(f'ADMIN_PASSWORD_HASH="{hashed}"')
    print(f'\nAlso add a strong random secret for ADMIN_JWT_SECRET_KEY:')
    import secrets
    print(f'ADMIN_JWT_SECRET_KEY="{secrets.token_urlsafe(48)}"')
    print("\n⚠️  Never share your .env file or commit it to git.")


if __name__ == "__main__":
    main()
