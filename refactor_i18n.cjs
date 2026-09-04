const { Project, SyntaxKind, Node } = require("ts-morph");
const fs = require("fs");

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

let allStrings = new Set();
const skipTags = ["script", "style", "code", "pre"];
const attrToTranslate = ["placeholder", "title", "label", "alt"];

for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().includes("main.tsx")) continue;

    let modified = false;
    let componentsToInject = new Set();
    
    let keepGoing = true;
    while (keepGoing) {
        keepGoing = false;
        sourceFile.forEachDescendant((node) => {
            if (keepGoing) return;
            
            if (Node.isJsxText(node)) {
                const text = node.getText();
                if (text.trim().length > 0 && /[a-zA-Z]/.test(text) && !text.includes("{t(")) {
                    const parentElement = node.getFirstAncestorByKind(SyntaxKind.JsxElement) || node.getFirstAncestorByKind(SyntaxKind.JsxSelfClosingElement);
                    const tagName = parentElement ? parentElement.getDescendantsOfKind(SyntaxKind.Identifier)[0]?.getText() : null;
                    
                    if (tagName && !skipTags.includes(tagName)) {
                        let cleaned = text.trim().replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\s+/g, ' ');
                        if (cleaned.replace(/[^a-zA-Z]/g, '').length > 0) {
                            
                            const comp = node.getFirstAncestor(n => Node.isFunctionDeclaration(n) || Node.isArrowFunction(n));
                            let compName = "anonymous";
                            if (comp) {
                                compName = comp.getName ? comp.getName() : null;
                                if (!compName && Node.isVariableDeclaration(comp.getParent())) compName = comp.getParent().getName();
                            }

                            node.replaceWithText(` {t("${cleaned}")} `);
                            allStrings.add(cleaned);
                            modified = true;
                            keepGoing = true;
                            
                            if (compName) componentsToInject.add(compName);
                            return; // Stop checking this node since it was removed
                        }
                    }
                }
            }
            
            if (Node.isJsxAttribute(node)) {
                const nameNode = node.getNameNode();
                if (nameNode) {
                    const name = nameNode.getText();
                    if (attrToTranslate.includes(name)) {
                        const init = node.getInitializer();
                        if (init && Node.isStringLiteral(init)) {
                            const text = init.getLiteralValue();
                            if (text.trim().length > 0 && /[a-zA-Z]/.test(text) && !text.includes("{t(")) {
                                
                                const comp = node.getFirstAncestor(n => Node.isFunctionDeclaration(n) || Node.isArrowFunction(n));
                                let compName = "anonymous";
                                if (comp) {
                                    compName = comp.getName ? comp.getName() : null;
                                    if (!compName && Node.isVariableDeclaration(comp.getParent())) compName = comp.getParent().getName();
                                }

                                node.setInitializer(`{t("${text.replace(/"/g, '\\"')}")}`);
                                allStrings.add(text);
                                modified = true;
                                keepGoing = true;
                                
                                if (compName) componentsToInject.add(compName);
                                return; // Stop checking this node since it was removed
                            }
                        }
                    }
                }
            }
        });
    }

    if (modified) {
        if (!sourceFile.getImportDeclaration("react-i18next")) {
            sourceFile.addImportDeclaration({
                namedImports: ["useTranslation"],
                moduleSpecifier: "react-i18next"
            });
        }
        
        sourceFile.forEachDescendant((node) => {
            if (Node.isFunctionDeclaration(node) || Node.isArrowFunction(node)) {
                let name = node.getName ? node.getName() : null;
                if (!name && Node.isVariableDeclaration(node.getParent())) name = node.getParent().getName();
                
                if (name && componentsToInject.has(name)) {
                    let body = node.getBody();
                    if (body && Node.isBlock(body)) {
                        let alreadyInjected = false;
                        body.getStatements().forEach(stmt => {
                            if (stmt.getText().includes("useTranslation")) alreadyInjected = true;
                        });
                        
                        if (!alreadyInjected) {
                            body.insertStatements(0, "const { t } = useTranslation();");
                        }
                    }
                }
            }
        });
        
        sourceFile.saveSync();
        console.log(`Refactored ${sourceFile.getFilePath()}`);
    }
}

fs.writeFileSync('extracted_i18n.json', JSON.stringify(Array.from(allStrings), null, 2));
console.log(`Extracted ${allStrings.size} strings.`);
