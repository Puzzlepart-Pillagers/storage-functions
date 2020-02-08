import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const got = require("got")
const functionURL = `https://pillagers-storage-functions.azurewebsites.net/api`;

function notifyWarRoom(msgTitle, msgTxt) {
    return got.post(process.env.NOTIFY_WAR_ROOM_FUNCTION_URL, {
        json: {
            title: msgTitle.toString(),
            text: msgTxt.toString()
        }
    })
};
const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');
    const attacking = (req.query.attacking || (req.body && req.body.attacking));
    const defending = (req.query.defending || (req.body && req.body.defending));
    if (!attacking || !defending) {
        context.res = {
            status: 400,
            body: "attacker or defender mail not provider"
        }
        context.done();
    } else {
        wageWar(attacking, defending, context)
    }
};

// THESE ARE MAIL ADDRESSES
function wageWar(attacking, defending, context) {
    Promise.all([
        got(`${functionURL}/GetKing?email=${attacking}`).json(),
        got(`${functionURL}/GetKing?email=${defending}`).json(),
        got(`${functionURL}/GetUnits?email=${attacking}`).json(),
        got(`${functionURL}/GetUnits?email=${defending}`).json()]).then(res => {
            let attackerRes = res[0]
            let defenderRes = res[1]
            let atUnits = res[2]
            let defUnits = res[3]
            let attacker = attackerRes.value[0];
            let defender = defenderRes.value[0];
            let atFullName = `${attacker.FirstName} ${attacker.LastName}`
            let defFullName = `${defender.FirstName} ${defender.LastName}`
            let atPenning = attacker.Penning
            let defPenning = defender.Penning
            // number of units for attacker and defender
            let atUnitCount = atUnits.value.length;
            let defUnitCount = defUnits.value.length;
            // total xp == all units XP summed
            let atXP = 0;
            let defXP = 0;
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
            let atLossPct = (defSum / warSum);
            let defLossPct = (atSum / warSum);

            let atUnitLoss = Math.round(atUnitCount * atLossPct);
            let defUnitLoss = Math.round(defUnitCount * defLossPct);

            let atWon = defLossPct > atLossPct;
            let atPenningLossGain = Math.round(atWon ? defPenning * defLossPct : -(atPenning * atLossPct));
            let defPenningLossGain = Math.round(atWon ? -(defPenning * defLossPct) : atPenning * atLossPct);

            let title = `WAR REPORT - ${atFullName} v. ${defFullName}`.toString();
            let txt = `**${atWon
                ? attacker.FirstName
                : defender.FirstName} WINS**   \nUnits lost:
               \n${attacker.FirstName}: **${atUnitLoss.toString()}**
               \n${defender.FirstName}: **${defUnitLoss.toString()}**
               \nPenning forfeited:
                \n${atWon
                    ? `**${attacker.FirstName}** steals **₰${atPenningLossGain.toString()}** from **${defender.FirstName}**`
                    : `**${defender.FirstName}** steals **₰${defPenningLossGain.toString()}** from **${attacker.FirstName}**`}`;
            // return [title, txt];
            notifyWarRoom(title, txt);
            console.log("WAR OVER, details in chat")
            context.res = {
                status: 200,
                body: "successfully launched an attack"
            }
            context.done();
        })
}

export default httpTrigger;
