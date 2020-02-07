import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService, TableQuery } from 'azure-storage';

const tableService = createTableService();
const unitsTable = 'Units';
const kingsTable = 'Kings';

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');
    // const email = (req.query.email || (req.body && req.body.email));
};

export default httpTrigger;
