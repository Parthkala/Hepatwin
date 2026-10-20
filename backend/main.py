"""
HepaTwin Backend
================
Entry point – imports and runs the FastAPI application.

Usage
-----
  uvicorn main:app --reload --port 8000
"""

from app.main import app  # noqa: F401 – re-export so uvicorn finds it

__all__ = ["app"]
