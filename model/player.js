class Player {
    constructor(name, kills, assists, death, kast, adr, fkDiff, rating){
        this.name = name;
        this.kills = kills;
        this.assists = assists;
        this.deaths = death;
        this.kast = kast;
        this.adr = adr;
        this.fkDiff = fkDiff;
        this.rating = rating;
    }
}
 module.exports = Player;