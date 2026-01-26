// ---- イベントデータ ----
const events = [
    { title: "国際交流会", date: "2025-09-04" },
    { title: "科学講演：宇宙観測の未来", date: "2025-09-04" },
    { title: "ボランティア説明会", date: "2025-09-10" },
    { title: "地域フェスティバル", date: "2025-09-15" },
    { title: "夏祭り", date: "2025-08-15" }
];

// ---- カレンダー描画処理 ----
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0 = January

function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendar(year, month) {
    const tbody = document.querySelector("#calendar tbody");
    tbody.innerHTML = ""; // 既存のカレンダーをクリア

    document.getElementById("monthYear").textContent = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    let row = document.createElement("tr");

    // 空白セル
    for (let i = 0; i < firstDay; i++) {
        row.appendChild(document.createElement("td"));
    }

    // 日付セル＋イベント表示
    for (let date = 1; date <= lastDate; date++) {
        const cell = document.createElement("td");
        const fullDate = formatDate(year, month, date);

        // 日付表示
        const dateDiv = document.createElement("div");
        dateDiv.textContent = date;
        dateDiv.classList.add("date");
        cell.appendChild(dateDiv);

        // 該当するイベントを抽出
        const dayEvents = events.filter(event => event.date === fullDate);

        // イベント表示
        dayEvents.forEach(event => {
            const eventDiv = document.createElement("div");
            eventDiv.textContent = event.title;
            eventDiv.classList.add("event");
            cell.appendChild(eventDiv);
        });

        row.appendChild(cell);

        if ((firstDay + date) % 7 === 0 || date === lastDate) {
            tbody.appendChild(row);
            row = document.createElement("tr");
        }
    }
}

// ---- 月移動ボタンのイベント設定 ----
document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
});

// ---- 初期描画 ----
renderCalendar(currentYear, currentMonth);
