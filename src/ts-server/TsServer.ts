import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  IConnection,
  InitializeParams,
  InitializeResult
} from "vscode-languageserver";
import { Intelephense } from "Intelephense";

import elapsed from "../utils/elapsed";

export default class TsServer {
  connection: IConnection;
  documents: TextDocuments;
  workspaceRoot: null | string;
  private initializeResults: InitializeResult;

  constructor(connection: IConnection) {
    this.connection = connection;
    this.documents = new TextDocuments();
    this.workspaceRoot = null;

    this.documents.listen(this.connection);

    let initialisedAt;

    this.connection.onInitialize((params: InitializeParams): Promise<
      InitializeResult
    > => {
      initialisedAt = process.hrtime();
      this.connection.console.info("Initialising");
      const initOptions = {
        storagePath: undefined,
        logWriter: {
          info: connection.console.info,
          warn: connection.console.warn,
          error: connection.console.error
        },
        clearCache: undefined
      };

      return Intelephense.initialise(initOptions).then(() => {
        Intelephense.onPublishDiagnostics(args => {
          connection.sendDiagnostics(args);
        });
        connection.console.info(
          `Initialised in ${elapsed(initialisedAt).toFixed()} ms`
        );

        this.initializeResults = {
          capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            documentSymbolProvider: true,
            workspaceSymbolProvider: true,
            completionProvider: {
              triggerCharacters: ["$", ">", ":", "\\", ".", "<", "/"]
            },
            signatureHelpProvider: {
              triggerCharacters: ["(", ","]
            },
            definitionProvider: true,
            documentFormattingProvider: true,
            documentRangeFormattingProvider: true,
            referencesProvider: true,
            documentLinkProvider: { resolveProvider: true },
            hoverProvider: true,
            documentHighlightProvider: true
          }
        };
        return this.initializeResults;
      });
    });
  }
}
