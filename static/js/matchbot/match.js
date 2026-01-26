// static/js/matchbot.js

document.getElementById("match-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const sets = [...document.querySelectorAll(".set")].map(set => {
        const team1 = set.querySelector(".team1").value;
        const team2 = set.querySelector(".team2").value;
        const tiebreakDiv = set.querySelector(".tiebreak");
        const tiebreak = tiebreakDiv.style.display === "none" ? null : {
            team_1_points: +tiebreakDiv.querySelector(".tb-team1").value,
            team_2_points: +tiebreakDiv.querySelector(".tb-team2").value
        };
        return tiebreak ? { team_1_games: +team1, team_2_games: +team2, tiebreak } 
                        : { team_1_games: +team1, team_2_games: +team2 };
    });

    const team1_id = +document.querySelector("[name='team_1_id']").value;
    const team2_id = +document.querySelector("[name='team_2_id']").value;

    const payload = {
        match_id: +document.querySelector("[name='match_id']").value,
        team_1_id: team1_id,
        team_2_id: team2_id,
        sets: sets,
        winner_team_id: calculateWinner(sets, team1_id, team2_id)
    };

    console.log("送信データ:", payload);

    await fetch("/match/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });
});


function calculateWinner(sets, team1_id, team2_id) {
    let team1Sets = 0;
    let team2Sets = 0;

    sets.forEach(set => {
        if (set.team_1_games > set.team_2_games) {
            team1Sets++;
        } else if (set.team_2_games > set.team_1_games) {
            team2Sets++;
        }
    });

    if (team1Sets > team2Sets) return team1_id;
    if (team2Sets > team1Sets) return team2_id;
    return null;
}

