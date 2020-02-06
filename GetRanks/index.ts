import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService, TableQuery } from 'azure-storage';

const tableService = createTableService();
const tableName = 'Ranks';

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');

    const query: TableQuery = new TableQuery().top(100);
    tableService.queryEntities(tableName, query, null, (error, result, response) => {
        if (!error) {
            context.log(response.body);
            context.res.status(200).json(response.body);
        } else {
            context.res.status(500).json({ error: error });
        }
    });
};

export default httpTrigger;
