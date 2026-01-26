// matchbot_local.js

let workingData = {
    currentMatch: null,
    matchIdCounter: 1,
    blockCount: 1,
    courtNumberCount: 1
}


let tournamentData = {
    id: null,
    name: null,
    description : null,
    courts: [],
    blocks: [],
    players: [],
    matches: []
};


addCourt();
addBlock();

// ------------------- 大会設定 -------------------
function addCourt() {
    const courtList = document.getElementById("court-list");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "コート名";
    input.value = String(workingData.courtNumberCount);
    courtList.appendChild(input);
    workingData.courtNumberCount += 1;
    document.getElementById("court-count").textContent = workingData.courtNumberCount - 1;
}


function removeCourt() {
    const courtList = document.getElementById("court-list");
    if (courtList.childElementCount > 1) {
        courtList.lastChild.remove();
        workingData.courtNumberCount = Math.max(1, workingData.courtNumberCount - 1);
        document.getElementById("court-count").textContent = workingData.courtNumberCount -1;
    };
}


function addBlock() {
    const blocksContainer = document.getElementById("blocks");

    const blockDiv = document.createElement("div");
    blockDiv.className = "block";
    blockDiv.dataset.blockId = workingData.blockCount;

    // ブロック名を自動設定（A, B, C, ...）
    const blockName = document.createElement("input");
    blockName.type = "text";
    blockName.placeholder = "ブロック名";
    blockName.value = String.fromCharCode(64 + workingData.blockCount); // 1→A, 2→B, ...
    blockName.classList.add("block-name");
    blockDiv.appendChild(blockName);

    // 選手リスト
    const playerList = document.createElement("div");
    playerList.className = "player-list";
    blockDiv.appendChild(playerList);

    // 初期選手入力欄を4つ
    for (let i = 0; i < 4; i++) {
        addPlayerInput(playerList);
    }

    // 選手追加ボタン
    const addPlayerBtn = document.createElement("button");
    addPlayerBtn.textContent = "選手＋";
    addPlayerBtn.classList.add("tournament-setup-btn", "alt-btn");
    addPlayerBtn.onclick = () => addPlayerInput(playerList);
    blockDiv.appendChild(addPlayerBtn);

    // 選手削除ボタン
    const removePlayerBtn = document.createElement("button");
    removePlayerBtn.style.marginLeft = "0.5rem";
    removePlayerBtn.textContent = "選手－";
    removePlayerBtn.classList.add("tournament-setup-btn", "alt-btn");
    removePlayerBtn.onclick = () => removePlayerInput(playerList);
    blockDiv.appendChild(removePlayerBtn);

    blocksContainer.appendChild(blockDiv);

    workingData.blockCount += 1;
    document.getElementById("block-count").textContent = workingData.blockCount - 1;
}


function removeBlock() {
    const blocksContainer = document.getElementById("blocks");
    if (blocksContainer.childElementCount > 1) {
        blocksContainer.lastChild.remove();
        workingData.blockCount = Math.max(1, workingData.blockCount - 1);
        document.getElementById("block-count").textContent = workingData.blockCount - 1;
    };
}


function addPlayerInput(playerList) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "選手名";
    playerList.appendChild(input);
}


function removePlayerInput(playerList) {
    if (playerList.childElementCount > 1) {
        playerList.lastChild.remove();
    };
}



function readTournamentFromDOM() {
    const data = {
        id: tournamentData.id ?? Date.now(),
        name: document.getElementById("tournament-name").value,
        description: document.getElementById("tournament-description").value,
        courts: [],
        blocks: [],
        players: [],
        matches: []
    };

    data.courts = Array.from(document.querySelectorAll("#court-list input"))
        .map((input, index) => ({
            id: index + 1,
            name: input.value.trim()
        }))
        .filter(court => court.name);

    let player_id_counter = 1;

    document.querySelectorAll("#blocks > .block").forEach((block_div, block_index) => {
        const block_id_counter = block_index + 1;
        const block_name = block_div.querySelector(".block-name").value;

        data.blocks.push({ id: block_id_counter, name: block_name });

        block_div.querySelectorAll(".player-list input").forEach(input => {
            const player_name = input.value.trim();
            if (player_name) {
                data.players.push({
                    id: player_id_counter++,
                    name: player_name,
                    block_id: block_id_counter
                });
            }
        });
    });

    return data;
}


function copyToUI(data) {
    document.getElementById("tournament-name").value = data.name ?? "";
    document.getElementById("tournament-description").value = data.description ?? "";

    // コート描画
    const courtListContainer = document.getElementById("court-list");
    courtListContainer.innerHTML = "";
    workingData.courtNumberCount = 1;

    data.courts.forEach(court => {
        addCourt();
        courtListContainer.lastChild.value = court.name;
    });

    // ブロック描画
    const blocksContainer = document.getElementById("blocks");
    blocksContainer.innerHTML = "";
    workingData.blockCount = 1;

    data.blocks.forEach(block => {
        addBlock();
        const blockDiv = blocksContainer.lastChild;
        blockDiv.querySelector(".block-name").value = block.name;

        const playerListDiv = blockDiv.querySelector(".player-list");
        playerListDiv.innerHTML = "";

        const players = data.players.filter(player => player.block_id === block.id);
        players.forEach(player => addPlayerInput(playerListDiv));
        players.forEach((player, index) => playerListDiv.children[index].value = player.name);
    });
}


function generateTournamentFromDOM() {
    const data = readTournamentFromDOM();
    generateTournament(data);
    saveTournamentData(tournamentData);
}


// ------------------- 試合生成 -------------------
function generateTournament(data) {
    const blockMatches = [];

    data.blocks.forEach(block => {
        const matches = autoGenerateMatches(data, block.id);
        blockMatches.push(matches);
    });

    const fairMatches = mergeMatchesFairly(blockMatches);

    data.matches = fairMatches;

    console.log("大会データ:", data);

    renderTournamentDataToDOM(data);
}


function renderTournamentDataToDOM(data) {
    tournamentData = data;
    setInitialMatches();
    displayBlockMatrix();
    displayMatchSequence();
    displayCurrentMatches();
    renderTournamentTitle();
    goToMatchManagement();
}


// 最初にコート数分だけ試合を進行中にする
function setInitialMatches() {
    tournamentData.courts.forEach((court, index) => {
        const match = tournamentData.matches[index];
        if (match && match.status !== "finished") {
            match.status = "ongoing";
            match.court_id = court.id;
        }
    });
}


function autoGenerateMatches(data, block_id) {
    const players = data.players.filter(player => player.block_id === block_id);
    const matches = [];

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            matches.push({
                id: workingData.matchIdCounter++,
                block_id: block_id,
                player_1_id: players[i].id,
                player_2_id: players[j].id,
                sets: [],
                winner_player_id: null,
                status: "pending",
                court_id: null
            });
        }
    }

    return matches;
}



function mergeMatchesFairly(blockMatches) {
    const result = [];
    const lastPlayed = new Map(); // player_id -> last match index
    let round = 0;

    while (blockMatches.some(matches => matches.length > 0)) {

        for (let b = 0; b < blockMatches.length; b++) {
            const matches = blockMatches[b];
            if (matches.length === 0) continue;

            // プレイヤー偏りが少ない試合を選ぶ
            matches.sort((m1, m2) => {
                const p1 = Math.max(
                    lastPlayed.get(m1.player_1_id) ?? -Infinity,
                    lastPlayed.get(m1.player_2_id) ?? -Infinity
                );
                const p2 = Math.max(
                    lastPlayed.get(m2.player_1_id) ?? -Infinity,
                    lastPlayed.get(m2.player_2_id) ?? -Infinity
                );
                return p1 - p2;
            });

            const match = matches.shift();
            result.push(match);

            lastPlayed.set(match.player_1_id, round);
            lastPlayed.set(match.player_2_id, round);

            round++;
        }
    }

    return result;
}




function getPlayerById(player_id) {
    return tournamentData.players.find(player => player.id === player_id);
}

function getPlayerNameById(player_id) {
    return getPlayerById(player_id)?.name ?? "未設定";
}



// ------------------- 試合順リスト表示 -------------------
function displayMatchSequence() {
    const container = document.getElementById("match-sequence-list");
    container.innerHTML = "";
    if (!tournamentData || !tournamentData.matches) return;

    const table = document.createElement("table");

    // ヘッダー
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["No.", "ブロック", "選手1", "選手2", "スコア", "ステータス", "コート"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ボディ
    const tbody = document.createElement("tbody");
    tournamentData.matches.forEach((match, index) => {
        const block = tournamentData.blocks.find(block => block.id === match.block_id);
        const player1 = getPlayerNameById(match.player_1_id);
        const player2 = getPlayerNameById(match.player_2_id);

        const tr = document.createElement("tr");
        if (match.status === "ongoing") tr.classList.add("on-going");

        const cols = [
            index + 1,
            block.name,
            player1,
            player2,
            "", // スコアセルは後でボタンに置き換え
            getStatusLabel(match.status),
            match.court_id ? tournamentData.courts.find(court => court.id === match.court_id).name : ""
        ];

        cols.forEach((val, colIndex) => {
            const td = document.createElement("td");

            // スコア列だけインタラクト可能にする
            if (colIndex === 4) {
                td.classList.add("score-cell");
                td.dataset.matchId = match.id;
            
                if (match.sets && match.sets.length > 0) {
                    const set = match.sets[0];
                    td.textContent = `${set.player_1_games} - ${set.player_2_games}`;
                } else {
                    td.textContent = "";
                }
            
                td.onclick = () => openScoreModal(match, td);
            } else {
                td.textContent = val;
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}




// ------------------- 現在進行中の試合表示 -------------------
function displayCurrentMatches() {
    const container = document.getElementById("current-matches-list");
    container.innerHTML = "";

    if (!tournamentData) return;

    const table = document.createElement("table");

    // ヘッダー
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["コート", "ブロック", "選手1", "選手2", "スコア"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ボディ
    const tbody = document.createElement("tbody");

    tournamentData.courts.forEach(court => {
        const match = tournamentData.matches.find(
            match => match.court_id === court.id && match.status === "ongoing"
        );

        const tr = document.createElement("tr");

        if (match) {
            const block = tournamentData.blocks.find(block => block.id === match.block_id);
            const player_1_name = getPlayerNameById(match.player_1_id);
            const player_2_name = getPlayerNameById(match.player_2_id);

            const scoreText =
                match.sets && match.sets.length > 0
                    ? `${match.sets[0].player_1_games} - ${match.sets[0].player_2_games}`
                    : "入力";

            // コート
            tr.appendChild(createTd(court.name));

            // ブロック
            tr.appendChild(createTd(block.name));

            // 選手1
            tr.appendChild(createTd(`${player_1_name}`));

            // 選手2
            tr.appendChild(createTd(`${player_2_name}`));

            // スコア（クリック可能）
            const scoreTd = document.createElement("td");
            scoreTd.textContent = scoreText;
            scoreTd.classList.add("score-cell");
            scoreTd.onclick = () => openScoreModal(match, scoreTd);
            tr.appendChild(scoreTd);

            tr.classList.add("ongoing-row");
        } else {
            const td = document.createElement("td");
            td.colSpan = 5;
            td.textContent = `${court.name}：空き`;
            td.style.textAlign = "center";
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ヘルパー
function createTd(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}



// ------------------- スコア入力画面 -------------------
function openScoreModal(match, td) {
    if (!match) return;

    workingData.currentMatch = match;

    const player_1_name = tournamentData.players.find(player => player.id === match.player_1_id).name;
    const player_2_name = tournamentData.players.find(player => player.id === match.player_2_id).name;

    document.getElementById("score-modal-title").innerText = "スコア入力";
    document.getElementById("player1-name").textContent = player_1_name;
    document.getElementById("player2-name").textContent = player_2_name;
    document.getElementById("player1-score").value = match.player1_score ?? "";
    document.getElementById("player2-score").value = match.player2_score ?? "";

    const is_opposite = td.classList.contains("opposite-score");
    document.querySelector("#score-modal .score-grid").classList.toggle("reverse", is_opposite);

    document.getElementById("score-modal").classList.remove("hidden");
}



function closeScoreModal() {
    document.getElementById("score-modal").classList.add("hidden");
    document.querySelector("#score-modal .score-grid").classList.remove("reverse");
}



function saveScore() {
    if (!workingData.currentMatch) return;

    const player_1_score = parseInt(document.getElementById("player1-score").value, 10);
    const player_2_score = parseInt(document.getElementById("player2-score").value, 10);

    if (isNaN(player_1_score) || isNaN(player_2_score)) {
        alert("スコアを入力してください");
        return;
    }

    workingData.currentMatch.player1_score = player_1_score;
    workingData.currentMatch.player2_score = player_2_score;
    workingData.currentMatch.sets = [{ player_1_games: player_1_score, player_2_games: player_2_score }];
    workingData.currentMatch.status = "finished";

    scheduleNextMatches();

    closeScoreModal();
    displayMatchSequence();
    displayCurrentMatches();

    refreshBlockMatrix ()
}



// マトリックス内のスコアボタンだけ更新
function refreshBlockMatrix () {
    const matrixDiv = document.getElementById("block-matches-list");
    if (matrixDiv) {
        const cells = matrixDiv.querySelectorAll(".score-cell");
        cells.forEach(cell => {
            if (parseInt(cell.dataset.matchId, 10) === workingData.currentMatch.id) {
                const row_player_id = parseInt(cell.dataset.rowPlayerId, 10);
                const set = workingData.currentMatch.sets[0];

                if (!isNaN(row_player_id)) {
                    cell.textContent =
                        workingData.currentMatch.player_1_id === row_player_id
                            ? `${set.player_1_games} - ${set.player_2_games}`
                            : `${set.player_2_games} - ${set.player_1_games}`;
                } else {
                    cell.textContent = `${set.player_1_games} - ${set.player_2_games}`;
                }
            }
        });
    }
}



// ------------------- 空きコートに次の試合を割り当て -------------------
function scheduleNextMatches() {
    tournamentData.courts.forEach(court => {
        const ongoing = tournamentData.matches.find(
            match => match.court_id === court.id && match.status === "ongoing"
        );
        if (!ongoing) {
            const nextMatch = tournamentData.matches.find(match => match.status === "pending");
            if (nextMatch) {
                nextMatch.status = "ongoing";
                nextMatch.court_id = court.id;
            }
        }
    });
}




function goToMatchManagement() {
    document.getElementById("tournament-setup").classList.add("hidden");
    document.getElementById("match-management").classList.remove("hidden");
    document.getElementById("savedata-div").classList.add("hidden");
    displayMatchSequence();
    displayCurrentMatches();
    window.scrollTo({
        top: 0
    });
}

function goToSetup() {
    document.getElementById("match-management").classList.add("hidden");
    document.getElementById("tournament-setup").classList.remove("hidden");
    document.getElementById("savedata-div").classList.remove("hidden");
    loadSavedataList();
    window.scrollTo({
        top: 0
    });
}



// ブロックマトリックス
function displayBlockMatrix() {
    const container = document.getElementById("block-matches-list");
    container.innerHTML = "";

    if (!tournamentData || !tournamentData.blocks) return;

    tournamentData.blocks.forEach(block => {
        const div = document.createElement("div");
        div.className = "block-matrix";

        const title = document.createElement("h3");
        title.textContent = `ブロック：${block.name}`;
        div.appendChild(title);

        const block_players = tournamentData.players.filter(
            player => player.block_id === block.id
        );
        
        const table = document.createElement("table");

        // ヘッダー
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headerRow.appendChild(document.createElement("th")); // 左上空白
        block_players.forEach(player => {
            const th = document.createElement("th");
            th.textContent = player.name;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);


        // ボディ
        const tbody = document.createElement("tbody");
        block_players.forEach((row_player, row_index) => {
            const tr = document.createElement("tr");

            // 行の先頭に選手名
            const th = document.createElement("th");
            th.textContent = row_player.name;
            tr.appendChild(th);

            block_players.forEach((col_player, col_index) => {
                const td = document.createElement("td");

                if (row_index === col_index) {
                    td.textContent = "---"; // 自分自身との対戦
                } else {
                    // 該当マッチを検索
                    const match = tournamentData.matches.find(
                        match =>
                          match.block_id === block.id &&
                          (
                            (match.player_1_id === row_player.id && match.player_2_id === col_player.id) ||
                            (match.player_1_id === col_player.id && match.player_2_id === row_player.id)
                          )
                      );

                    if (match) {
                        td.classList.add("score-cell");
                        td.dataset.matchId = match.id;
                        td.dataset.rowPlayerId = row_player.id;
                        td.dataset.colPlayerId = col_player.id;

                        const is_opposite = match.player_1_id === col_player.id && match.player_2_id === row_player.id;

                        if (is_opposite) {
                            td.classList.add("opposite-score");
                        }
                    
                        if (match.sets && match.sets.length > 0) {
                            const set = match.sets[0];
                            td.textContent =
                                !is_opposite
                                    ? `${set.player_1_games} - ${set.player_2_games}`
                                    : `${set.player_2_games} - ${set.player_1_games}`;
                        } else {
                            td.textContent = "";
                        }
                    
                        td.onclick = () => openScoreModal(match, td);
                    }
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        div.appendChild(table);
        container.appendChild(div);
    });
}


function getStatusLabel(status) {
    switch (status) {
        case "pending": return "待ち";
        case "ongoing": return "進行中";
        case "finished": return "終了";
        case "nextup": return "控え";
        default: return "";
    }
}



function loadTournamentList() {
    const tournamentList = JSON.parse(localStorage.getItem("tournamentList"));
    if (!tournamentList) {
        return [];
    } else {
        return tournamentList;
    }
}


function loadTournamentData(tournament_id) {
    const tournamentList = loadTournamentList();
    const data = tournamentList.find(data => data.id === tournament_id);
    renderTournamentDataToDOM(data);
}


function saveTournamentData(tournamentData) {
    const tournamentList = loadTournamentList();
    const new_list = tournamentList.filter(data => data.id !== tournamentData.id);
    new_list.push(tournamentData);
    localStorage.setItem("tournamentList", JSON.stringify(new_list));
    loadSavedataList();
    console.log(tournamentData);
}



function deleteTournamentData(tournament_id) {
    const tournamentList = loadTournamentList();
    const new_list = tournamentList.filter(data => data.id !== tournament_id);
    localStorage.setItem("tournamentList", JSON.stringify(new_list));
}


document.getElementById("back-to-setup-btn").addEventListener("click", function () {
    saveTournamentData(tournamentData);
})


function loadSavedataList() {
    const ul = document.getElementById("savedata-list");
    ul.innerHTML = "";

    const list = loadTournamentList();

    list.forEach(data => {
        const li = document.createElement("li");
        li.classList.add("savedata-li");

        const nameSpan = document.createElement("span");
        nameSpan.textContent = data.name || "(無名)";
        nameSpan.style.cursor = "pointer";
        nameSpan.onclick = () => loadTournamentData(data.id);

        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.classList.add("save-del-btn");
        delBtn.onclick = () => {
            if (confirm(`「${data.name}」を削除しますか？`)) {
                deleteTournamentData(data.id);
                loadSavedataList();
            }
        };

        li.appendChild(nameSpan);
        li.appendChild(delBtn);
        ul.appendChild(li);
    });
}


loadSavedataList();


function renderTournamentTitle() {
    const title = tournamentData.name;
    const h2 = document.createElement("h2");
    h2.textContent = title;
    h2.classList.add("tournament-title");
    document.getElementById("tournament-title-div").appendChild(h2);
}
