let form;

document.getElementById("customize").addEventListener("click", function() 
{
    if (document.getElementById("form1"))
        return;

    let f = document.createElement("form");
    f.setAttribute("id", "form1");

    let a, l;
    let inputs = ["width", "height", "teams"];
    let labels = ["Width", "Height", "Teams"];
    let defaultVal = ["6", "6", "2"];

    for (let i=0; i<3; i++) {
        a = document.createElement("input"); //input element, text
        a.setAttribute('type',"number");
        a.setAttribute("style", "width: 50px;");
        a.setAttribute("name", inputs[i]);
        a.setAttribute("value", defaultVal[i]);
        
        l = document.createElement("label");
        l.setAttribute("for", inputs[i]);
        l.innerHTML = "&nbsp " + labels[i] + " ";

        f.appendChild(l);
        f.appendChild(a);
    }
    let s = document.createElement("button"); //input element, Submit button
    s.innerHTML = "OK";

    f.appendChild(s);
    document.getElementsByTagName('body')[0].appendChild(f);
    form = document.querySelector("#form1");
    form.addEventListener("submit", confirm1);
});


function confirm1(e)
{
    e.preventDefault();
    database.DB.collection("gameSettings").doc("fXcm2AxNNTCFM1xjLGmY").update({
        width: form1.width.value,
        height: form1.height.value,
        teams: form1.teams.value
    })
    createMenu();
};


let ctx2, menuC, button2;
let board = [];
let mWidth, mHeight, mTeams;
function createMenu()
{
    if (document.getElementById("menuCanvas")) {
        document.body.removeChild(menuC);
        document.body.removeChild(button2);
    }
    else
        document.body.appendChild(document.createElement("p"));
    
    mWidth = parseInt(form1.width.value);
    mHeight = parseInt(form1.height.value);
    mTeams = parseInt(form1.teams.value);
    
    menuC = document.createElement("canvas");
    menuC.id = "menuCanvas";
    menuC.width = mWidth * 40;
    menuC.height = mHeight * 40;

    document.body.appendChild(menuC);

    button2 = document.createElement("button");
    button2.setAttribute("id", "confirmCustom");
    button2.innerHTML = "Start new Game";

    document.body.appendChild(button2);
    
    document.getElementById("confirmCustom").addEventListener("click", function() {
        document.getElementById("newGame").click();
    })

    for (let i=1; i<mHeight+1; i++) {
        board[i] = [];
        for (let j=1; j<mWidth+1; j++) {
            board[i][j] = 0;
        }
    }

    ctx2 = menuC.getContext('2d');
    drawMenu();
    menuC.addEventListener("mousedown", handleClick2);
}   


function handleClick2(e) {
    let rect = menuC.getBoundingClientRect();
    let pos = [];
    pos[0] = Math.ceil( (e.clientX-rect.left) / 40 );
    pos[1] = Math.ceil( (e.clientY-rect.top) / 40 );
    
    board[pos[1]][pos[0]] = (board[pos[1]][pos[0]] + 1) % (mTeams + 2);
    drawMenu();
}

function drawMenu() {
    for (let i=1; i<=mHeight; i++) {
        for (let j=1; j<=mWidth; j++) {
            if (board[i][j] == 1) {
                drawRect((j-1)*40, (i-1)*40, 39, 39, "white");
            }
            else {
                drawRect((j-1)*40, (i-1)*40, 39, 39, "black");
                if (board[i][j] > 1) {
                    let colour = ALL_COLOURS[board[i][j]-2];
                    drawCircle((j-0.5)*40, (i-0.5)*40, 15, colour);
                }
            }
        }
    }
}

function drawRect(x, y, width, height, colour) {
    ctx2.fillStyle = colour;
    ctx2.fillRect(x, y, width, height);
}

function drawCircle(x, y, r, colour) {
    ctx2.fillStyle = colour;
    ctx2.beginPath();
    ctx2.arc(x, y, r, 0, 2 * Math.PI);
    ctx2.fill();
}

export function getBoard() {
    return board;
}
