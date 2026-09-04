const { Project, SyntaxKind } = require("ts-morph");
const fs = require("fs");

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

let allStrings = new Set();

for (const sourceFile of project.getSourceFiles()) {
    sourceFile.forEachDescendant(node => {
        if (node.getKind() === SyntaxKind.CallExpression) {
            const expression = node.getExpression();
            if (expression.getText() === 't') {
                const args = node.getArguments();
                if (args.length > 0 && args[0].getKind() === SyntaxKind.StringLiteral) {
                    allStrings.add(args[0].getLiteralValue());
                }
            }
        }
    });
}

fs.writeFileSync('final_strings.json', JSON.stringify(Array.from(allStrings), null, 2));
console.log(`Extracted ${allStrings.size} strings.`);
