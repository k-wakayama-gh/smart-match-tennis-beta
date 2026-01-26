// static/js/tournament.js

document.getElementById("tournament-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const payload = {
        name: form.name.value,
        start_date: form.start_date.value,
        end_date: form.end_date.value || null,
        place: form.place.value || null
    };

    const response = await fetch("/matchbot/tournament", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        // alert("大会を作成しました！");
        window.location.reload();
    } else {
        alert("作成に失敗しました");
    }
});
