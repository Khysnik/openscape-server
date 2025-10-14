# OpenScape-server
what: An open-source private server for the browser game Idlescape

how: Lots of energy drinks and staring at frontend code for hours

when: Not soon, lol. This will be a very long project, but I will do my best to push stable(?) updates daily and update the feature roadmap below

why: I have no respect for my own mental health! (I have way too much free time and want to feel productive)

---

Note:

This repo does not contain any content owned by the Idlescape team, all code used is 100% mine. 

This project was made possible by the sourcemaps **publicly** available [here](https://play.idlescape.com/static/js/main.8f2c20b5.js.map) and [here](https://play.idlescape.com/static/css/main.69e8dc36.css.map), but no frontend code or assets are provided by this repo in the interest of copyright. To run a private server yourself, you must extract and run the frontend from the above links yourself.

---
Roadmap:

- [ ] Account register/login
- [ ] JWT Token
- [ ] Characters list, creation, deletion
- [ ] Socket initialization, send paths, player, globals, group data, and shine info on connect
- [ ] Game chat with message history
- [ ] Socket Events:
  - [ ] send: animation:resume
  - [ ] send: action:start/stop
  - [ ] send: combat:end
  - [ ] send: bestiary:check
  - [ ] send: marketplace:manifest:get
  - [ ] send: combat:requestOverTimeEvents
  - [ ] recieve: update:group
  - [ ] recieve: globals:update:partial
  - [ ] recieve: update:player
  - [ ] recieve: update:inventory
  - [ ] recieve: update-group-member
  - [ ] recieve: animation:start
  - [ ] recieve: marketplace:manifest:send
  - [ ] recieve: bestiary:send
  - [ ] recieve: combat:instanceStats
  - [ ] recieve: combat:buffs
  - [ ] recieve: combat:spawnMonster
  - [ ] recieve: combat:attack
  - [ ] recieve: combat:overTimeEvent
  - [ ] recieve: combat:splotch
  - [ ] recieve: combat:updateMonster
  - [ ] recieve: combat:respawnTimer
