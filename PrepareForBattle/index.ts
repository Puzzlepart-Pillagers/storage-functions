import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createTableService, TableQuery } from 'azure-storage';
const got = require("got")

const tableService = createTableService();
const tableName = 'Kings';

function notifyWarRoom(title, text) { return got(`${process.env.NOTIFY_WAR_ROOM_FUNCTION_URL}?title=${title}&text=${text}`) };

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('PrepareForBattle function processed by a request.');
    const attacking = (req.query.attacking || (req.body && req.body.attacking));
    const defending = (req.query.defending || (req.body && req.body.defending));
    if (!attacking || !defending) {
        context.res = {
            status: 400,
            body: "Two kings not provided. A battle can only take place if 'attacking' and 'defending' king's email is specified"
        }
    } else {
        // we use Partitionkey for email on Units, but Rowkey for email on Kings. låll.
        const attackingKingQuery: TableQuery = new TableQuery().where(`RowKey == '${attacking}'`);
        const defendingKingQuery: TableQuery = new TableQuery().where(`RowKey == '${defending}'`);
        tableService.queryEntities(tableName, attackingKingQuery, null, (error, attackerResult, attackerResponse) => {
            if (!error) {
                let attacker = attackerResponse.body["value"][0]
                tableService.queryEntities(tableName, defendingKingQuery, null, (error, defenderResult, defenderResponse) => {
                    let defender = defenderResponse.body["value"][0]
                    if (attacker && defender) {
                        // trigger teams webhook and wait before triggering attack webhook
                        let msg = JSON.stringify({
                            title: "WAR IS COMING",
                            text: `${attacker.FirstName} ${attacker.LastName} and ${defender.FirstName} ${defender.LastName} are going to war shortly, at ${defender.lat}, ${defender.lon}`
                        });
                        let webHookURL = process.env.TEAMS_WAR_CHANNEL_WEBHOOK_URL;
                        got.post(webHookURL, { method: "POST", body: msg }).then(() => {
                            console.log(`successfully send "prepare for battle message to teams`)
                            console.log(msg)
                        }).then(() => {
                            function timeout(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
                            console.log("starting grace period before war begins");
                            timeout(10000).then(() => {
                                console.log("waited ten seconds")
                                let tensecondsTitle = "War starting in ten seconds!"
                                let tensecondsText = "Better buff your thralls!"
                                notifyWarRoom(tensecondsTitle, tensecondsText);
                                console.log("war room notified")
                                timeout(10000).then(() => {
                                    console.log("waited ten MORE seconds")
                                    notifyWarRoom("War is starting!", "Blood will be shed!");
                                    console.log("war starging, room notified")
                                    context.res.status(200);
                                })
                            })
                        })
                    } else {
                        context.log(`something went wrong while getting kings from storage`)
                        context.res.status(500).json({ error: error });
                    }
                })
            } else { context.res.status(500).json({ error: error }); }
        });
    }
};

export default httpTrigger;
