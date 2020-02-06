import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createTableService } from 'azure-storage';

const tableService = createTableService();
const tableName = 'Kings';

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
  context.log('HTTP trigger function processed a request.');

  if (req.body) {
    const item = req.body;
    item['PartitionKey'] = 'King';
    item['RowKey'] = item.email;

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
};

export default httpTrigger;
