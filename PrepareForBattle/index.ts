import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createTableService, TableQuery } from 'azure-storage';
const got = require("got")

const tableService = createTableService();
const tableName = 'Kings';

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
                            context.res.status(200);
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
