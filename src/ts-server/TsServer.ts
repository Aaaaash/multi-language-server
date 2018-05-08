import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  IConnection,
  InitializeParams,
  InitializeResult
} from "vscode-languageserver";
import * as rpc from "vscode-ws-jsonrpc";

import { Logger, LspClientLogger } from "./language-server/logger";
import { LspServer } from "./language-server/lsp-server";
import { LspClient, LspClientImpl } from "./language-server/lsp-client";

import elapsed from "../utils/elapsed";

export default class TsServer {
  connection: IConnection;
  documents: TextDocuments;
  workspaceRoot: null | string;
  private initializeResults: InitializeResult;

  constructor(connection: IConnection) {

    this.connection = connection;
    // this.documents = new TextDocuments();
    // this.workspaceRoot = null;

    // this.documents.listen(this.connection);

    const lspClient = new LspClientImpl(connection);
    const logger = new LspClientLogger(lspClient, 2);
    const server: LspServer = new LspServer({
      logger,
      lspClient,
      tsserverPath: 'tsserver',
      tsserverLogFile: 'ts-log.txt',
      tsserverLogVerbosity: 'verbose'
    });
    let initialisedAt;

    this.connection.onInitialize(server.initialize.bind(server));
    this.connection.onDidOpenTextDocument(
      server.didOpenTextDocument.bind(server)
    );
    this.connection.onDidSaveTextDocument(
      server.didSaveTextDocument.bind(server)
    );
    this.connection.onDidCloseTextDocument(
      server.didCloseTextDocument.bind(server)
    );
    this.connection.onDidChangeTextDocument(
      server.didChangeTextDocument.bind(server)
    );

    this.connection.onCodeAction(server.codeAction.bind(server));
    this.connection.onCompletion(server.completion.bind(server));
    this.connection.onCompletionResolve(server.completionResolve.bind(server));
    this.connection.onDefinition(server.definition.bind(server));
    this.connection.onDocumentFormatting(
      server.documentFormatting.bind(server)
    );
    this.connection.onDocumentHighlight(server.documentHighlight.bind(server));
    this.connection.onDocumentSymbol(server.documentSymbol.bind(server));
    this.connection.onExecuteCommand(server.executeCommand.bind(server));
    this.connection.onHover(server.hover.bind(server));
    this.connection.onReferences(server.references.bind(server));
    this.connection.onRenameRequest(server.rename.bind(server));
    this.connection.onSignatureHelp(server.signatureHelp.bind(server));
    this.connection.onWorkspaceSymbol(server.workspaceSymbol.bind(server));
  }

  public start() {
    this.connection.listen();
  }
}

function start(reader: rpc.WebSocketMessageReader, writer: rpc.WebSocketMessageWriter): TsServer {
  const connection = createConnection(reader, writer);
  const server = new TsServer(connection);
  server.start();
  return server;
}

export function tsLaunch(socket) {
  const reader = new rpc.WebSocketMessageReader(socket);
  const writer = new rpc.WebSocketMessageWriter(socket);
  start(reader, writer);
}
