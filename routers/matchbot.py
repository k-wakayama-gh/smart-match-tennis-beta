# routers/matchbot.py

from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select

from database import get_session
from models.matchbot import Match, MatchCreate, MatchRead, Team, TeamCreate, TeamRead, Tournament, TournamentCreate, TournamentRead

router = APIRouter()
templates = Jinja2Templates(directory="templates")


# local version
@router.get("/local", response_class=HTMLResponse, tags=["html"])
def get_matchbot_try_html(request: Request):
    template_file = "matchbot_local.html"
    context = {"request": request}
    return templates.TemplateResponse(template_file, context)



# # Match
# @router.post("/match/create", response_model=MatchRead)
# def create_match(match_request: MatchCreate, session: Annotated[Session, Depends(get_session)]):
#     match = Match.from_orm(match_request)
#     session.add(match)
#     session.commit()
#     session.refresh(match)
#     return match


# @router.get("/matches/{match_id}", response_model=MatchRead)
# def read_match(match_id: int, session: Annotated[Session, Depends(get_session)]):
#     match = session.get(Match, match_id)
#     if not match:
#         raise HTTPException(status_code=404, detail="Match not found")
#     return match


# @router.put("/matches/{match_id}", response_model=MatchRead)
# def update_match(match_id: int, match_update: MatchCreate, session: Annotated[Session, Depends(get_session)]):
#     match = session.get(Match, match_id)
#     if not match:
#         raise HTTPException(status_code=404, detail="Match not found")
#     for key, value in match_update.dict().items():
#         setattr(match, key, value)
#     session.add(match)
#     session.commit()
#     session.refresh(match)
#     return match


# @router.delete("/matches/{match_id}")
# def delete_match(match_id: int, session: Annotated[Session, Depends(get_session)]):
#     match = session.get(Match, match_id)
#     if not match:
#         raise HTTPException(status_code=404, detail="Match not found")
#     session.delete(match)
#     session.commit()
#     return {"ok": True}



# # Top page of MatchBot
# @router.get("/matchbot", response_class=HTMLResponse, tags=["html"])
# def get_matchbot_html(request: Request):
#     template_file = "matchbot.html"
#     context = {
#         "request": request
#         }
#     return templates.TemplateResponse(template_file, context)


# # Tournament
# @router.post("/matchbot/tournament", response_model=TournamentRead)
# def create_tournament(tournament_request: TournamentCreate, session: Annotated[Session, Depends(get_session)]):
#     tournament = Tournament.from_orm(tournament_request)
#     session.add(tournament)
#     session.commit()
#     session.refresh(tournament)
#     return tournament


# @router.get("/matchbot/tournaments", response_class=HTMLResponse)
# def get_tournament_list_html(request: Request, session: Annotated[Session, Depends(get_session)]):
#     tournaments = session.exec(select(Tournament)).all()
#     html_file = "/matchbot/tournaments.html"
#     context = {"request": request, "tournaments": tournaments}
#     return templates.TemplateResponse(html_file, context)


# @router.post("/tournament/{tournament_id}/team")
# def add_teams_to_tournament(tournament_id: int, teams: list[TeamCreate], session: Annotated[Session, Depends(get_session)]):
#     tournament = session.get(Tournament, tournament_id)
#     if not tournament:
#         raise HTTPException(status_code=404, detail="Tournament not found")

#     created_teams = []
#     for team_data in teams:
#         team = Team.from_orm(team_data)
#         team.tournament_id = tournament_id
#         session.add(team)
#         created_teams.append(team)
        
#     session.commit()
    
#     for team in created_teams:
#         session.refresh(team)

#     return created_teams


# @router.get("/matchbot/tournament/{tournament_id}/teams", response_class=HTMLResponse)
# def get_create_teams_html(request: Request, tournament_id: int, session: Annotated[Session, Depends(get_session)]):
#     tournament = session.get(Tournament, tournament_id)
#     if not tournament:
#         return HTMLResponse("Tournament not found", status_code=404)
#     html_file = "/matchbot/tournament/teams.html"
#     context = {"request": request, "tournament_id": tournament_id, "tournament": tournament}
#     return templates.TemplateResponse(html_file, context)


# # Team
# @router.post("/teams", response_model=TeamRead)
# def create_team(team_request: TeamCreate, session: Annotated[Session, Depends(get_session)]):
#     team = Team.from_orm(team_request)
#     session.add(team)
#     session.commit()
#     session.refresh(team)
#     return team

