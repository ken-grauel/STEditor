// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import { Document } from "./document";

let code = "";
code +=
    'constructor (documentText: string = "", extensionOrLanguage: string | Language = "txt") {\n';
code += "    this._lines = documentText. split (/\\r?\\n/). map (lineText=>new Line(lineText));\n";
code += '    if (typeof extensionOrLanguage=== "string") {\n';
code += "        \n";
code += "    }";

let doc = new Document(code, "ts");
doc.validateAll();
doc.consolePrint();
