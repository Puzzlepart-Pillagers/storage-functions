import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createTableService, TableQuery } from 'azure-storage';
const got = require("got")
const functionURL = `https://pillagers-storage-functions.azurewebsites.net/api`
const tableService = createTableService();
const tableName = 'Kings';

function notifyWarRoom(title, text) { return got(`${process.env.NOTIFY_WAR_ROOM_FUNCTION_URL}?title=${title}&text=${text}`) };
function wageWar(king1, king2) { got(`${process.env.WAGE_WAR_FUNCTION_URL}?attacking=${king1}&defending=${king2}`) };

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
                        let title = "WAR IS COMING"
                        let text = `${attacker.FirstName} ${attacker.LastName} and ${defender.FirstName} ${defender.LastName} are going to war shortly, at ${defender.lat}, ${defender.lon}`
                        notifyWarRoom(title, text)
                        setTimeout(() => {
                            notifyWarRoom("WAR COMMENCING", "hope you buffed your thralls");
                            wageWar(attacking, defending);
                        }
                            , 5000)
                        context.res.status(200);
                        context.done();
                    } else {
                        context.log(`something went wrong while getting kings from storage`)
                        context.res.status(500).json({ error: error });
                        context.done();
                    }
                })
            } else { context.res.status(500).json({ error: error }); context.done(); }
        });
    }
};

export default httpTrigger;
