import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { Express } from "express-serve-static-core";
import http from "http";
import fs from "fs";

export default class NodeServer {
  public port: string;

  private server: Express;
  private httpInstance: http.Server | null;
  private publicPath: string;

  constructor() {
    this.port = process.env.PORT || "8080";

    this.server = express(); // Initialise express
    this.httpInstance = null
    
    this.publicPath = path.join(__dirname, "../../public");
    this.server.use(express.static(this.publicPath));

    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
  }

  start() {
    return new Promise((resolve, reject) => {
      const environment = process.env.NODE_ENV;

      const server = this.server;
      const port = this.port;

      this.httpInstance = server.listen(port, () => {
        if(!this.httpInstance) {
          reject("[HTTP] No HTTP instance found"); return;
        }

        server.post("/:file", async function(req, res, next) {
          const fileName = req.params.file;
          res.status(200).sendFile(path.join(__dirname, "../../public/", fileName));
        });

        resolve();
      });
        
    });
  }
}
