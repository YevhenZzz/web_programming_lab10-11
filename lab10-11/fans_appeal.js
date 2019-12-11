document.addEventListener("DOMContentLoaded", function () {
    let allAppeals = [];

    document.getElementById("sendButton").addEventListener("click", addAppeal);
    window.addEventListener("online", function (event) {
        provider.get("appeals", (appeals) => {
            if (appeals) {
                allAppeals = appeals;
            }
            sendAllAppealsToServer(allAppeals);
            showAllAppeals(allAppeals);
            provider.remove("appeals");
            allAppeals = [];
        });
    });

    provider.get("appeals", (appeals) => {
        if (appeals) {
            allAppeals = appeals;
        }
    });
    if (isOnline()) {
        sendAllAppealsToServer(allAppeals);
        provider.remove("appeals");
        allAppeals = [];

        let req = new XMLHttpRequest();
        req.open("GET", "/all_appeals", true);
        req.send();
        req.onreadystatechange = function () {
            if (req.readyState === XMLHttpRequest.DONE) {
                if (req.status != 200) {
                    console.log("Something goes wrong!");
                } else {
                    let data = JSON.parse(req.responseText);
                    showAllAppeals(data);
                }
            }
        };
    }

    function addAppeal() {
        const commentText = document.getElementById("commentSection").value.trim();
        if (commentText === "") {
            alert("Enter text in comment section!");
            document.getElementById("sendButton").blur();
            return;
        }
        const nickname = prompt("Enter your nickname: ", "User").trim();
        if (nickname === "" || nickname == null) {
            alert("Nickname is incorrect!");
            document.getElementById("sendButton").blur();
            return;
        }
        const time = new Date();

        if (isOnline()) {
            sendAppealToServer(nickname, time, commentText);
            showAppeal(nickname, time, commentText);
            alert("Successfully sent to server");
        } else {
            allAppeals.push({name: nickname, time: time, text: commentText});
            provider.add("appeals", allAppeals);
            alert("Saved to storage");
        }

        document.getElementById("sendButton").blur();
        document.getElementById("commentSection").value = "";
    }

    function showAppeal(name, time, text) {
        const commentBlock = document.createElement("div");
        commentBlock.className = "row shadow-sm mb-4";
        const userInfo = document.createElement("div");
        userInfo.className = "col-2 order-1";
        const comment = document.createElement("div");
        comment.className = "col-10 order-2";


        userInfo.innerHTML = "<div class=\"border border-dark rounded text-light bg-dark container\" style=\"margin: 0 1% 0 1%; background-color: black\">" + name + "<br>"  + time.getHours() + ":"
            + (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
            + "</br>" + time.getDate() + "." + (time.getMonth() + 1) + "." + time.getFullYear() + "</div>";
        comment.innerHTML = "<div class=\"border border-dark rounded text-light bg-dark container\" style=\"margin: 0 1% 0 1%; background-color: black\">" + text + "</div>";


        commentBlock.appendChild(userInfo);
        commentBlock.appendChild(comment);

        const referenceNode = document.querySelector('#commentForm');
        referenceNode.parentNode.insertBefore(commentBlock, referenceNode);
    }

    function showAllAppeals(allAppeals) {
        for (let i = 0; i < allAppeals.length; i++) {
            showAppeal(allAppeals[i].name, new Date(allAppeals[i].time), allAppeals[i].text)
        }
    }

    function sendAppealToServer(name, time, text) {
        fetch("/all_appeals", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({name: name, time: time, text: text}),
        })
            .catch(error => console.error("Cannot fetch data:", error));
    }

    function sendAllAppealsToServer(allAppeals) {
        for (let i = 0; i < allAppeals.length; i++) {
            sendAppealToServer(allAppeals[i].name, allAppeals[i].time, allAppeals[i].text)
        }
    }
});