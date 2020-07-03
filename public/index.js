import { Piece, createPieces } from "/pieces.js" //Piece(team, position)
import { drawAll, drawSelectedField } from "/draw.js"
import { Database } from "/db.js"
import { getBoard } from "/customize.js"

window.database = new Database();
window.FIELD_SIZE = 0;
window.TR_BORDER = 50;
window.ALL_COLOURS = ["blue", "red", "green", "orange", "#03fcf4", "#c100e8"];

let pieces = [];
let blockedFields = [];
let selField = [-1, -1];

let wasPiece = -1;
let wasMove = false;

//start new game
document.getElementById("newGame").addEventListener("click", function() {
    database.resetDb();
     
    pieces = [];
    blockedFields = [];

    selField = [-1, -1];
    database.turn = 0;

    wasPiece = -1;
    wasMove = false;

    let board = getBoard();
    let c = 0;
    for (let i=1; i<board.length; i++) {
        for (let j=1; j<board[i].length; j++) {
            if (board[i][j] > 1) {
                database.dbAddPieces(j, i, board[i][j]-2, c);
                c++;
            } else if (board[i][j] == 1) {
                database.dbAddBlockedField(j, i);
            }
        }
    }
    drawAll(pieces, blockedFields, database.turn);
});

database.DB.collection("blockedFields").onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if(change.type == "added") {
            let data = change.doc.data();
            blockedFields.push([data.x, data.y]);
            wasMove = false;
        }  
    })
});

database.DB.collection("pieces").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if(change.type == "modified") {
            let data = change.doc.data();
            let pos = [data.x, data.y];
            pieces[data.id].move(pos);
            drawAll(pieces, blockedFields);
            wasPiece = -1;
            wasMove = true;
        }
    })
});

database.DB.collection("sessionID").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if(change.type == "modified") {
            database.sessionID = change.doc.data().id;
            loadGame();
        }
    })
});

database.DB.collection("turn").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if(change.type == "modified") {
            database.turn = parseInt(change.doc.data().turn);

            checkDeaths();
            let isOneAlive = false;
            for (let i=0; i<database.teams;i++)
            {       
                if (!dead[i])
                {
                    isOneAlive = true;
                    break;
                }
            }

            while (dead[database.turn%database.teams] && isOneAlive)
            {
                database.turn++;
            }
            drawAll(pieces, blockedFields);
        }
    })
});

function loadGame()
{
    //reset important variables
    blockedFields = [];
    pieces = [];
    selField = [-1, -1];
    dead = [];
    wasMove = false;

    //load blockedFields and pieces and sessionID
    database.DB.collection("sessionID").doc("jEkuCOBZJ67FpDupwP60").get().then(doc => {
        database.sessionID = doc.data().id;
        
        database.DB.collection("blockedFields").get().then((snapshot) => {
            snapshot.forEach(doc => {
                let data = doc.data();
                blockedFields.push([data.x, data.y]);
            })
            drawAll(pieces, blockedFields);
        });
        database.DB.collection("pieces").get().then((snapshot) => {
            snapshot.forEach(doc => {
                if (doc.id.split('#')[0] + '#' == database.sessionID) {
                    let data = doc.data();
                    pieces.push(new Piece(data.team, [data.x, data.y]));
                }
            })
            drawAll(pieces, blockedFields);
        })
    })

    //read gameSettings
    database.DB.collection("gameSettings").doc("fXcm2AxNNTCFM1xjLGmY").get().then(doc => { 
        let data = doc.data();
        database.width = parseInt(data.width);
        database.height = parseInt(data.height);
        database.teams = parseInt(data.teams);

        FIELD_SIZE = Math.floor(750 / (Math.max(database.width, database.height)+1));

        for (let i=0; i<database.teams; i++) {
            database.DB.collection("dead").doc(i.toString()).get().then(doc => {
                dead.push(doc.data().dead);
            })
        }

        database.DB.collection("turn").doc("UVn5cfH7gkze6ulWitXC").get().then(doc => {
            database.turn = doc.data().turn;
            drawAll(pieces, blockedFields);

            checkDeaths();
            while (dead[database.turn%database.teams]) {
                database.turn++;
                if (!dead[database.turn%database.teams])
                    checkDeaths();
            }
        })
    })

    database.DB.collection("moved").doc("gWP9vr5Eblflc75gJDnr").get().then(doc => {
        let data = doc.data();
        wasMove = data.moved;
        selField[0] = data.selX;
        selField[1] = data.selY;
    })

}

//load game
window.onload = function() {
    window.c = document.getElementById('gameCanvas');
    window.ctx = c.getContext('2d');
    c.addEventListener("mousedown", handleClick);

    loadGame();
}


function handleClick(e) {
    let rect = c.getBoundingClientRect();
    let pos = [0, 0];
    pos[0] = Math.ceil((e.clientX-rect.left-TR_BORDER)/FIELD_SIZE);
    pos[1] = Math.ceil((e.clientY-rect.top-TR_BORDER)/FIELD_SIZE);

    if (pos[0] < 1 || pos[0] > database.width || pos[1] < 1 || pos[1] > database.height) 
        return;
   
    let legal = true;
    
    //shoot Arrow
    if (wasMove) {
        if (checkLegality(pos))
            database.dbAddBlockedField(pos[0], pos[1]);
        else
            legal = false;

    //move
    } else if (wasPiece != -1) {
        if (checkLegality(pos))
            database.dbMovePieces(wasPiece, pos[0], pos[1]);
        else
            legal = false;

    //select
    } else {
        wasMove = false;
        drawAll(pieces, blockedFields);
        for (let i=0; i<pieces.length; i++) {
            let p = pieces[i].pos;
            if (p[0] == pos[0] && p[1] == pos[1] && pieces[i].team == database.turn%database.teams) {
                wasPiece = i;
                drawSelectedField(p);
            }
        }
    }
    if (legal)
        selField = pos;
    else {
        wasPiece = -1;
        drawAll(pieces, blockedFields);
    }
}

function checkLegality(pos)
{
    let a = pos[0] - selField[0];
    let b = pos[1] - selField[1];

    let tPos = Object.assign({}, selField);

    if (a == 0 && b == 0)
        return false;

    setInvalidPositions();
    
    if (Math.abs(a) == Math.abs(b)) {
        let c = a / Math.abs(a);
        let d = b / Math.abs(b);
        while (tPos[0]!=pos[0]) { 
            tPos[0] += c;
            tPos[1] += d;
            if (isFLegal(tPos))
                    return false;
        }
        return true;
    }
    if (a!=0 && b == 0) {
        let c = a / Math.abs(a);
        while (tPos[0] != pos[0]) {
            tPos[0] += c;
            if(isFLegal(tPos))
                return false;
        }
        return true;
    }

    if (a==0 && b != 0)
    {
        let c = b / Math.abs(b);
        while (tPos[1] != pos[1]) {
            tPos[1] += c;
            if(isFLegal(tPos))
                return false;
        }
        return true;
    }

    return false;
}

let dead = [];
function checkDeaths() {
    if (typeof(dead[0]) == "undefined") {
        setTimeout(checkDeaths, 100);
        return;
    }

    setInvalidPositions();

    let isdead = true;

    let checks = [[-1,-1], [0,-1], [1,-1], [1,0], [1,1], [0,1], [-1,1], [-1, 0]];
    for (const piece of pieces) {
        if (piece.team != database.turn % database.teams)
            continue

        let tPos = piece.pos;
        for (const check of checks) {
            let t = [tPos[0] + check[0], tPos[1] + check[1]];
            if (!isFLegal(t)) {
                isdead = false;
                break;
            }
        }
    } 
    if (isdead) {
        dead[database.turn % database.teams] = true;
        database.dbDead(database.turn%database.teams);
    }

    let count = 0;
    for (const d of dead) {
        if (!d) count++;
    }
    if (count < 2)
    {
        for (let i=0; i<database.teams; i++)
        {
            if (!dead[i])
            {
                alert("PAUL IST EIN HUUUUURRRENSOHN!!! (" + ALL_COLOURS[(i)] + " won!)");
                break;
            }
        }
    }
}


let invalidPositions = [];
function setInvalidPositions() {
    invalidPositions = [];
    
    for (let i=1; i<database.width+1; i++) {
        invalidPositions[i] = [];
        for (let j=1; j<database.height+1; j++)
            invalidPositions[i][j] = 0;
    }

    for (const piece of pieces)
        invalidPositions[piece.pos[0]] [piece.pos[1]] = 1;

    for (const field of blockedFields) {
        invalidPositions[field[0]][field[1]] = 1;
    }
}


function isFLegal(pos) {
    if (pos[0] < 1 || pos[0] > database.width || pos[1] < 1 || pos[1] > database.height) 
        return true;
    return invalidPositions[pos[0]][pos[1]];
}
