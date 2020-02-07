import { AzureFunction, Context, HttpRequest } from "@azure/functions";
const request = require('request');
const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
    context.log('PrepareForBattle function processed by a request.');
    const msgtitle = (req.query.title || (req.body && req.body.title));
    const msgtext = (req.query.text || (req.body && req.body.text));
    if (!msgtitle && !msgtext) {
        console.log(`no message specified. returning 400`);
        context.res.status(400);
        context.done();
    } else {
        let webHookURL = process.env.TEAMS_WAR_CHANNEL_WEBHOOK_URL;
        let msg = JSON.stringify({
            title: msgtitle.toString(),
            text: msgtext.toString()
        })
        request.post({ url: webHookURL, body: msg }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                context.res.status(400);
                context.done();
                return console.error('upload failed:', err);
            }
            else {
                console.log(`successfully sent WarRoom message`)
                context.res.status(200);
                context.done();
            }
        })
    };
    console.log(`successfully sent WarRoom message`)
    context.done();
};
export default httpTrigger;