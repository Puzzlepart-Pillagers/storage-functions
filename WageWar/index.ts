import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService, TableQuery } from 'azure-storage';
const got = require("got")
const tableService = createTableService();
const unitsTable = 'Units';
const kingsTable = 'Kings';
const functionURL = `https://pillagers-storage-functions.azurewebsites.net/api`;

function notifyWarRoom(title, text) { return got(`${process.env.NOTIFY_WAR_ROOM_FUNCTION_URL}?title=${title}&text=${text}`) };
const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');
    const attacking = (req.query.attacking || (req.body && req.body.attacking));
    const defending = (req.query.defending || (req.body && req.body.defending));
    if (!attacking || !defending) {
        context.res = {
            status: 400,
            body: "attacker or defender mail not provider"
        }
    } else {
        wageWar(attacking, defending).then(() => {
            notifyWarRoom("WAR OVER", "details in chat")
        })
        // get attacker, get defender,
        // do calculations,
        // update table
        // post to teams
    }
};

// THESE ARE MAIL ADDRESSES
async function wageWar(attacking, defending): Promise<void> {
    let attackerRes = await got(`${functionURL}/GetKing?email=${attacking}`).json();
    let defenderRes = await got(`${functionURL}/GetKing?email=${defending}`).json();
    let atUnits = await got(`${functionURL}/GetUnits?email=${attacking}`).json();
    let defUnits = await got(`${functionURL}/GetUnits?email=${defending}`).json();
    let attacker = attackerRes.value[0]
    let defender = defenderRes.value[0]
    let atFullName = `${attacker.FirstName} ${attacker.LastName}`
    let defFullName = `${defender.FirstName} ${defender.LastName}`
    let atXP = 0;
    let defXP = 0;
    // total xp == all units XP summed
    atUnits.value.forEach(unit => atXP += unit.XP)
    defUnits.value.forEach(unit => defXP += unit.XP)
    let atBuf = parseFloat(attacker.Buff);
    let defBuf = parseFloat(defender.Buff);
    //total xp of all units + 1% pr buff
    let atBuffedXP = atXP * (1 + atBuf / 100)
    let defBuffedXP = atXP * (1 + defBuf / 100)
    // max 50% buff
    if (atBuffedXP > (atXP * 1.5)) { atBuffedXP = atXP * 1.5 }
    if (defBuffedXP > (defXP * 1.5)) { defBuffedXP = defXP * 1.5 }
    let sumStrength = atBuffedXP + defBuffedXP;
    let atChance = (atBuffedXP * 100) / sumStrength;
    let defChance = (defBuffedXP * 100) / sumStrength;
    // sum of randomisation + strength
    let atSum = Math.round(atChance * Math.random())
    let defSum = Math.round(defChance * Math.random())

    // total sum
    let warSum = atSum + defSum;

    // sum of losses for attacker and defender
    let atLoss = defSum / warSum
    let defLoss = atSum / warSum

    let atWon = defLoss > atLoss;
    if (atWon) {
        notifyWarRoom(`Attacker ${atFullName} wins`, `with ${atLoss} to ${defLoss} casualties`)
    } else {
        notifyWarRoom(`Defender ${defFullName} wins`, `with ${defLoss} to ${atLoss} casualties`)
    }
}

export default httpTrigger;
