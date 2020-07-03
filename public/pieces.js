export class Piece
{

    constructor(team, position) {
        this.team = team;
        this.pos = position;
    }

    move(newPos) {
        this.pos = newPos;
    }

}


export function createPieces(teams, each)
{
    return tPieces;
}
