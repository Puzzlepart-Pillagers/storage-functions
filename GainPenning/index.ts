import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService } from 'azure-storage';

const tableService = createTableService();
const tableName = 'Kings';

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');

    if (req.body) {
        const item = req.body

        tableService.mergeEntity(tableName, { PartitionKey: item.email, RowKey: item.id, Penning: item.Penning }, (error, result, response) => {
            if (!error) {
                context.res.status(202).json(response.body);
            } else {
                context.res = {
                    status: 500,
                    body: 'Merge error'
                }
            }
        });

    } else {
        context.res = {
            status: 400,
            body: 'Nothing to update'
        };
        context.done();
    }

};

export default httpTrigger;