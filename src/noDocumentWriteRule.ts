import * as ts from 'typescript';
import * as Lint from 'tslint/lib/lint';

import {ErrorTolerantWalker} from './utils/ErrorTolerantWalker';
import {AstUtils} from './utils/AstUtils';

/**
 * Implementation of the no-document-write rule.
 */
export class Rule extends Lint.Rules.AbstractRule {
    public static WRITE_FAILURE = 'Forbidden call to document.write';
    public static WRITELN_FAILURE = 'Forbidden call to document.writeln';

    public apply(sourceFile : ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoDocumentWriteWalker(sourceFile, this.getOptions()));
    }
}

class NoDocumentWriteWalker extends ErrorTolerantWalker {

    protected visitCallExpression(node: ts.CallExpression) {

        const functionTarget: string = AstUtils.getFunctionTarget(node);
        if (functionTarget === 'document' || functionTarget === 'window.document') {
            if (node.arguments.length === 1) {
                const functionName: string = AstUtils.getFunctionName(node);
                if (functionName === 'write') {
                    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.WRITE_FAILURE));
                } else if (functionName === 'writeln') {
                    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.WRITELN_FAILURE));
                }
            }
        }

        super.visitCallExpression(node);
    }
}
