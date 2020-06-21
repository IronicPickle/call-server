import dotenv from "dotenv";
import NodeServer from "./server/NodeServer";
import twilio from "twilio";
import { CronJob } from "cron";

console.log("\nStarting...\n");

console.log("Loading .env file");
const env: dotenv.DotenvConfigOutput = dotenv.config(); // Pull env vars from ' .env ' file
if(env.error) console.error("\nNo environment file, using defaults");

const environment = process.env.NODE_ENV;
console.log("Started in:", environment, "mode\n");

const nodeServer = new NodeServer();
nodeServer.start().then(() => {
  console.log("\n[HTTP] Listening on:", nodeServer.port);

  
  const accountSid = process.env.ACCOUNT_SID;
  const authToken = process.env.AUTH_TOKEN;

  const client = twilio(accountSid, authToken);

  const resourceUrl = process.env.RESOURCE_URL;
  if(!resourceUrl) throw new Error("No resource URL configured");

  const originNumber = process.env.ORIGIN_NUMBER;
  if(!originNumber) throw new Error("No origin number configured");

  const jessNumber = process.env.JESS_NUMBER;
  if(!jessNumber) throw new Error("No jess number configured");

  new CronJob({
    cronTime: "00 00 12 * * *",
    onTick: function() {
      client.calls.create({
        url: `${resourceUrl}/lunch.mp3`,
        to: jessNumber,
        from: originNumber
      }).then(call => {
        console.log("[Twilio] Sent lunch call")
      }).catch(err => {
        console.log(err)
      });
    },
    start: true,
    timeZone: "Europe/London"
  });

  new CronJob({
    cronTime: "00 00 18 * * *",
    onTick: function() {
      client.calls.create({
        url: `${resourceUrl}/dinner.mp3`,
        to: jessNumber,
        from: originNumber
      }).then(call => {
        console.log("[Twilio] Sent dinner call")
      }).catch(err => {
        console.log(err)
      });
    },
    start: true,
    timeZone: "Europe/London"
  });

}).catch((err: Error) => {
  throw err;
});
