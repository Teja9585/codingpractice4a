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
Add a player in team
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
