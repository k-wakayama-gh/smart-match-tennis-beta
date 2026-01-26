# models/matchbot.py

from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from datetime import date

# 全修

# Match
class TieBreak(SQLModel):
    team_1_points: int
    team_2_points: int


class SetPoint(SQLModel):
    team_1_games: int
    team_2_games: int
    tiebreak: TieBreak | None = None


class MatchBase(SQLModel):
    team_1_id: int
    team_2_id: int
    sets: list[SetPoint] = Field(default_factory=list, sa_column=Column(JSON))


class Match(MatchBase, table=False):
    id: int | None = Field(default=None, primary_key=True)
    
    winner_team_id: int | None = Field(default=None, foreign_key="team.id")
    tournament_id: int | None = Field(default=None, foreign_key="tournament.id")
    tournament: "Tournament" = Relationship(back_populates="matches")


class MatchCreate(MatchBase):
    pass


class MatchRead(MatchBase):
    id: int



# class TournamentTeamLink(SQLModel, table=True):
#     tournament_id: int = Field(foreign_key="tournament.id", primary_key=True)
#     team_id: int = Field(foreign_key="team.id", primary_key=True)



# Tournament
class TournamentBase(SQLModel):
    name: str
    start_date: date
    end_date: date | None = None
    place: str | None = None


class Tournament(TournamentBase, table=False):
    id: int | None = Field(default=None, primary_key=True)
    
    teams: list["Team"] = Relationship(back_populates="tournament")
    matches: list["Match"] = Relationship(back_populates="tournament")


class TournamentCreate(TournamentBase):
    pass

class TournamentRead(TournamentBase):
    id: int



# Team
class TeamBase(SQLModel):
    players: list[str] = Field(sa_column=Column(JSON))


class Team(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    
    tournament_id: int | None = Field(default=None, foreign_key="tournament.id")
    tournament: "Tournament" = Relationship(back_populates="teams")


class TeamCreate(TeamBase):
    pass


class TeamRead(TeamBase):
    id: int

