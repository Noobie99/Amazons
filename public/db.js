export class Database 
{
    constructor() {
        let firebaseConfig = {
            apiKey: "AIzaSyCp9rPPqntBoKDKOrSsDpxjPyEMHsMo2X0",
            authDomain: "fir-9205a.firebaseapp.com",
            databaseURL: "https://fir-9205a.firebaseio.com",
            projectId: "fir-9205a",
            storageBucket: "fir-9205a.appspot.com",
            messagingSenderId: "316362411176",
            appId: "1:316362411176:web:1a0a4aca1901cb0296069d",
            measurementId: "G-R7FQKTD734"
          };
        firebase.initializeApp(firebaseConfig);
        this.DB = firebase.firestore();
        this.sessionID;
        this.turn;
        this.height;
        this.width;
        this.teams;
    }

    dbAddBlockedField(tx, ty) {
        this.DB.collection("blockedFields").add({
            x: tx,
            y: ty
        })
        this.DB.collection("turn").doc("UVn5cfH7gkze6ulWitXC").update({
            turn: this.turn + 1
        })
        this.DB.collection("moved").doc("gWP9vr5Eblflc75gJDnr").update({
            moved: false
        })
    }

    dbAddPieces(pX, pY, pTeam, pID) {
        this.DB.collection("pieces").doc(this.sessionID + pID.toString()).set({
            x: pX,
            y: pY,
            team: pTeam,
            id: pID
        });
    }

    dbMovePieces(pID, nX, nY) {
        this.DB.collection("pieces").doc(this.sessionID + pID.toString()).update({
            x: nX,
            y: nY,
        });
        this.DB.collection("moved").doc("gWP9vr5Eblflc75gJDnr").update({
            moved: true,
            selX: nX,
            selY: nY
        });
    }

    dbDead(pTeam) {
        this.DB.collection("dead").doc(pTeam.toString()).update({
            dead: true
        });
    }

    newSessionID()
    {
        let tID = Math.floor((Math.random() * 10000000)).toString() + '#';
        this.sessionID = tID;
        this.DB.collection("sessionID").doc("jEkuCOBZJ67FpDupwP60").update({
            id: tID
        });
    }

    resetDb()
    {
        this.newSessionID();
        this.DB.collection("blockedFields").get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                this.DB.collection("blockedFields").doc(doc.id).delete();
            })
        });   
        this.DB.collection("pieces").get().then((snapshot) => {
            snapshot.docs.forEach(doc => {
                if (doc.id.split('#')[0]+'#' != this.sessionID) {
                    this.DB.collection("pieces").doc(doc.id).delete();
                }
            })
        });   
        this.DB.collection("turn").doc("UVn5cfH7gkze6ulWitXC").update({
            turn: 0
        });
        this.DB.collection("moved").doc("gWP9vr5Eblflc75gJDnr").update({
            moved: false
        });
        for (let i=0; i<this.teams; i++) {
            this.DB.collection("dead").doc(i.toString()).update({
                dead: false
            });
        }
    }
}

