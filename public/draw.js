export function drawAll(pieces, blockedFields)
{
    drawBoard(blockedFields);
    drawPieces(pieces);
    drawTurn(database.turn);
}

//TR_BORDER = 50;

//calcs Fieldsize * (x)
function BS(x) { 
    return Math.floor((x) * FIELD_SIZE); 
}

export function drawSelectedField(field) 
{
    drawCircle(BS(field[0]-0.5), BS(field[1]-0.5), FIELD_SIZE*0.4, "yellow");
}

function drawBoard(blockedFields) 
{
    drawRect(0-TR_BORDER, 0-TR_BORDER, c.width-TR_BORDER, c.height-TR_BORDER, "gray");
    
    let colour; 
    for (let i=0; i<database.height; i++)
    {
        for (let j=0; j<database.width; j++)
        {
            colour = (i+j)%2 ? "white" : "black";
            drawRect(BS(j), BS(i), FIELD_SIZE, FIELD_SIZE, colour);
        }
    } 
    colour = "pink";
    for (const bf of blockedFields) {
        drawRect(BS(bf[0]-1), BS(bf[1]-1), FIELD_SIZE, FIELD_SIZE, colour);
        
    }
}

function drawPieces(pieces)
{
    let colour, pos;
    for (const piece of pieces)
    {
        pos = piece.pos;
        colour = ALL_COLOURS[piece.team];
        drawCircle(BS(pos[0]-0.5), BS(pos[1]-0.5), Math.floor(FIELD_SIZE*0.4), colour);
    }
}

function drawTurn(turn)
{
    let colour = ALL_COLOURS[turn % database.teams];
    drawCircle(20-TR_BORDER, 20-TR_BORDER, 10, colour);
}


function drawRect(x, y, width, height, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(x+TR_BORDER, y+TR_BORDER, width, height);
}

function drawCircle(x, y, r, colour) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x+TR_BORDER, y+TR_BORDER, r, 0, 2 * Math.PI);
    ctx.fill();
}
