let express = require("express");
let axios= require('axios');
let fs = require('fs');
let prompt = require('prompt-sync')({sigint: true});
let open = require('open');

let app = express().use(express.static(__dirname + "/public"));
let header = {"authorization": ""}
let data = {};

async function main() {
    console.log("Do you want to scan and update connections.json before displaying your connections? If this is your first time running the program, you will have to scan. (y/n)");
    let scan = prompt();
    console.log();
    if (["yes", "y"].includes(scan.toLowerCase())) {
        header.authorization = prompt("Enter Token: ",  {echo: "*"});
        await update();
    }
    graph();
} 

async function update() {
    let result = await axios.get(`https://discord.com/api/v9/users/@me/relationships`, {headers: header});
    let relationships = Array.from(result.data);
    for (let i = 0; i < relationships.length; i++) {
        if (relationships[i].type == 1) { // https://luna.gitlab.io/discord-unofficial-docs/relationships.html#relationshiptype-enum
            data[relationships[i].id] = {
                "username": relationships[i].user.username,
                "avatarUrl": relationships[i].user.avatar !==  null ? `https://cdn.discordapp.com/avatars/${relationships[i].id}/${relationships[i].user.avatar}.png`: `https://cdn.discordapp.com/embed/avatars/${relationships[i].user.discriminator%5}.png`,
                "id": relationships[i].id,
                "connections": []
            }
            let mutuals = await axios.get(`https://discord.com/api/v9/users/${relationships[i].id}/relationships`, {headers: header});
            mutuals.data.forEach(mutual => data[relationships[i].id].connections.push(mutual.id));
            console.log(`Saved: ${i}/${relationships.length}`)
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pause for one second so we don't spam the API
        }
    }
    fs.writeFile('data/connections.json', JSON.stringify(data), (_err) => console.log("Scan complete."));
}

async function graph() {
    app.get("/", (_request, response) => response.sendFile(__dirname + "/public/index.html"));
    app.get("/connections", (_request, response) => response.sendFile(__dirname + "/data/connections.json"));
    let listener = app.listen(80, () => {
        console.log(`Graph available @ localhost:${listener.address().port} | Page may take a while to load`);
        open(`http://localhost:${listener.address().port}`);
    });
}

main();
