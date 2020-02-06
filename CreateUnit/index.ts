import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService } from 'azure-storage';
import * as uuid from 'uuid/v1';

const tableService = createTableService();
const tableName = 'Units';

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('HTTP trigger function processed a request.');
    const email = (req.query.email || (req.body && req.body.email));

    if (email) {
        if (req.body) {
            const item = req.body;
            item['PartitionKey'] = email;
            item['RowKey'] = uuid();

            tableService.insertEntity(tableName, item, (error, result, response) => {
                if (!error) {
                    context.res.status(201).json(response);
                } else {
                    context.res.status(500).json({ error: error });
                }
            });

        } else {
            context.res = {
                status: 400,
                body: 'Missing item to create from request'
            };
            context.done();
        }
    }
    else {
        context.res = {
            status: 400,
            body: "Email not provided"
        };
    }
};

export default httpTrigger;