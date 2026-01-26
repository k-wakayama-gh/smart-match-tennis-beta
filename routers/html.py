# /routers/html.py

from fastapi import APIRouter, Request, HTTPException, Depends, Query, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from typing import Annotated
from datetime import datetime, date, time, timedelta, timezone

from database import get_session

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse, tags=["html"])
def get_index_html(request: Request):
    template_file = "index.html"
    context = {"request": request}
    return templates.TemplateResponse(template_file, context)


# Login page
@router.get("/login", response_class=HTMLResponse, tags=["html"])
def get_login_html(request: Request):
    template_file = "login.html"
    context = {"request": request}
    return templates.TemplateResponse(template_file, context)


# Calendar
@router.get("/calendar", response_class=HTMLResponse, tags=["html"])
def get_index_html(request: Request):
    template_file = "calendar.html"
    context = {"request": request}
    return templates.TemplateResponse(template_file, context)

