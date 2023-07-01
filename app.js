const express = require('express')
const Sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, "cricketTeam.db")
let db = null 
const initializeDbAndServer = async() => {
   try {
    db = await open ({
    filename:dbPath,
    driver:Sqlite3.Database
       });
   
   app.listen(3000, () => {
       console.log('Server is running at http://localhost:3000')
   })
}
catch(e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
}

}
initializeDbAndServer()
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//Returns a list of all players in the team
app.get("/players/", async(request,response)=> { 
    const getPlayersQuery = `SELECT * FROM cricket_team;`;
    const playersArray = await db.all(getPlayersQuery)
    response.send(playersArray)

})
// Add a player in team
app.post("/players/", async(request, response)=>{
    const cricketTeam =  request.body 
    const  {playerName,jerseyNumber,role} = cricketTeam
    const addPlayerQuery = `INSERT INTO 
    cricket_team(
         playerName,
        jerseyNumber,
        role)
    VALUES 
    ('${playerName}',
    ${jerseyNumber},
    '${role}')`
    const dbResponse = await db.run(addPlayerQuery)
    const playerId = dbResponse.lastId 
    response.send({playerId:playerId})

}); 
//Returns a player based on a player ID 
app.get("/players/:playerId/", async(request,response)=>{
    const {playerId} = request.params; 
    const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
    const player = await db.get(getPlayerQuery)
    response.send(player)
})

// Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/",async(request,response) => {
    const {playerId} = request.params 
    const playerDetails = request.body;
    const  { playerName, jerseyNumber, role } = playerDetails 
    const updatePlayerQuery = `
    UPDATE 
     cricket_team
    SET 
    player_name = "${playerName}",
    jersey_number = "${jerseyNumber}",
    role = "${role}"
    WHERE player_id = ${playerId};`;
    await db.run(updatePlayerQuery) 
    response.send("Player Details Updated")


});


//Deletes a player from the team (database) based on the player ID 
app.delete("/players/:playerId/",async(request,response)=> {
          const{playerId} = request.params;
          const deletePlayerQuery = 
          `DELETE 
          FROM 
          cricket_team 
           WHERE player_id = ${playerId};`;

          await db.run(deletePlayerQuery) 
          response.send("Player Removed")

})
