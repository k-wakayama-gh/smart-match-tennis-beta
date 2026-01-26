// static/js/matchbot/tournament/teams.js

const table = document.getElementById("team-table");
document.getElementById("add-row").addEventListener("click", () => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><input type="text" name="players"></td>`;
    table.appendChild(row);
});

document.getElementById("team-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const rows = [...document.querySelectorAll("input[name='players']")];
    const teams = rows
        .map(input => input.value.trim())
        .filter(value => value !== "")
        .map(value => ({ players: value }));

    if (teams.length === 0) {
        alert("少なくとも1つのチームを入力してください");
        return;
    }

    const response = await fetch(`/tournament/{{ tournament_id }}/team`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(teams)
    });

    if (response.ok) {
        alert("チームを登録しました！");
        window.location.href = "/matchbot/tournaments"; // 登録後は一覧に戻る
    } else {
        alert("エラーが発生しました");
    }
});
