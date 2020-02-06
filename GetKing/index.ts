import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService, TableQuery } from 'azure-storage';

const tableService = createTableService();
const tableName = 'Kings';

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');
    const email = (req.query.email || (req.body && req.body.email));

    if (email) {
        const query: TableQuery = new TableQuery().where(`RowKey == '${email}'`);
        tableService.queryEntities(tableName, query, null, (error, result, response) => {
            if (!error) {
                context.log(response.body);
                context.res.status(200).json(response.body);
            } else {
                context.res.status(500).json({ error: error });
            }
        });
    }
    else {
        context.res = {
            status: 400,
            body: "Email not provided"
        };
    }
};

export default httpTrigger;

