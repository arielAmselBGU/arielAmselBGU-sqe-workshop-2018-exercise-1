
import * as esprima from 'esprima';

let originalCode;

const parseCode = (codeToParse) => {
    let esprimaTree =  esprima.parseScript(codeToParse,{loc:true,range:true},null);
    originalCode = codeToParse;
    const astTree = esprimaTree.body.map(CreateNewLineForTabele);
    return astTree;
};

export {parseCode};

/*
type lineInTable = {
    lineNum: int
    type: string
    name: string
    condition: string
    value: undefined
}
*/

function extractValue (start,end){
    return originalCode.substring(start,end);
}

function CreateletDecLine(letDec) {
    let lineNum, name, value, type = 'Variable Declaration';
    let ans = [];
    for (let dec of letDec.declarations) {
        name = dec.id.name;
        value = extractValue(dec.init.range[0], dec.init.range[1]);
        lineNum = dec.loc.start.line;
        ans = ans.concat({lineNum:lineNum, type:type,name:name,value:value});
    }
    return ans;


}

function CreateAssignmentLine(assignment) {
    let lineNum,name,value,type = 'assignment expression';
    name = assignment.left.name;
    value = extractValue(assignment.right.range[0],assignment.right.range[1]);
    lineNum = assignment.loc.start.line;

    return {lineNum:lineNum, type:type,name:name,value:value};
}

function CreateUpdateExpression(updateExpr) {
    let lineNum,name,value,type = 'assignment update expression';
    lineNum = updateExpr.loc.start.line;
    name = updateExpr.argument.name;
    value = extractValue(updateExpr.range[0],updateExpr.range[1]);

    return {lineNum:lineNum,type:type,name:name,value:value,};
}

function CreateIfLine(ifExpr) {
    let alternate,consequent,lineNum,condition,type = 'if statement';
    lineNum = ifExpr.loc.start.line;
    condition = extractValue(ifExpr.test.range[0],ifExpr.test.range[1]);
    consequent = CreateNewLineForTabele (ifExpr.consequent);
    if (ifExpr.alternate !==null) {
        if (ifExpr.alternate.type === 'IfStatement')
            ifExpr.alternate.type = 'elseIfStatement';
        alternate = CreateNewLineForTabele(ifExpr.alternate);
    }
    if (alternate === null || alternate === undefined)
        return [{lineNum:lineNum,type:type,condition:condition},consequent];
    return [{lineNum:lineNum,type:type,condition:condition},consequent,alternate];
}


function CreateElseIfLine(elseifExpr) {
    let ans = CreateIfLine(elseifExpr);
    ans[0].type = 'else if statement';
    return ans;
}

function CreateForLine(forExpr) {
    let forInit,forUpdate,forBody,lienNum,condition,type = 'for statement';
    if (forExpr.init !== null)
        forInit = CreateNewLineForTabele (forExpr.init);
    lienNum = forExpr.loc.start.line;
    condition = extractValue(forExpr.test.range[0],forExpr.test.range[1]);
    forUpdate = CreateNewLineForTabele(forExpr.update);
    forBody = CreateNewLineForTabele(forExpr.body);

    return [forInit,{lineNum:lienNum,type:type,condition:condition},forUpdate,forBody];
}

function CreateDoWhileLine(doWhileExpr) {
    let body,lineNum,condition,type = 'do while statement';
    lineNum = doWhileExpr.loc.start.line;
    condition = extractValue(doWhileExpr.test.range[0],doWhileExpr.test.range[1]);
    body = CreateNewLineForTabele(doWhileExpr.body);

    return [{lineNum:lineNum,condition:condition,type:type},body];
}

function CreateWhileLine(whileExpr) {
    let body,lineNum,condition,type = 'while statement';
    lineNum = whileExpr.loc.start.line;
    condition = extractValue(whileExpr.test.range[0],whileExpr.test.range[1]);
    body = CreateNewLineForTabele(whileExpr.body);

    return [{lineNum:lineNum,type:type,condition:condition},body];
}

function CreateFunctionDeclarationLine(funcDec) {
    let params,body, lineNum, name, type = 'function declaration';
    lineNum =  funcDec.loc.start.line;
    name = funcDec.id.name;
    params = funcDec.params.map(CreateFuncParamList);
    body = CreateNewLineForTabele (funcDec.body);

    return [{lineNum:lineNum,type:type,name:name},params,body];
}

function CreateArrowFunctionLine(arrowFunc) {
    let body,params,lineNum,type = 'arrow function';
    lineNum = arrowFunc.loc.start.line;
    params = arrowFunc.params.map (CreateFuncParamList);
    body = CreateNewLineForTabele (arrowFunc.body);

    return [{lineNum:lineNum,type:type},params,body];
}

function CreateFuncParamList (param){
    let lineNum,name,type='Variable Declaration';
    lineNum = param.loc.start.line;
    name = param.name;

    return {lineNum:lineNum,type:type,name:name};
}

function CreateReturnLine(returnExpr) {
    let lineNum,value, type = 'return statement';
    lineNum = returnExpr.loc.start.line;
    value = extractValue(returnExpr.argument.range[0],returnExpr.argument.range[1]);

    return {lineNum:lineNum,type:type,value:value};
}

function CreateNewLineForTabele (body){
    if (body.type === 'ExpressionStatement')
        body = body.expression;
    else if (body.type === 'BlockStatement')
        return body.body.map(CreateNewLineForTabele);

    switch (body.type) {
        case 'VariableDeclaration':             //let declaration
            return CreateletDecLine (body);

        case 'AssignmentExpression':
            return CreateAssignmentLine (body);

        case 'UpdateExpression':
            return CreateUpdateExpression (body);

            ////---------------------   conditions    ------------------
        case 'IfStatement':
            return CreateIfLine (body);

        case  'elseIfStatement':
            return CreateElseIfLine (body);

            //-------------  loops  ----------
        case 'ForStatement':
            return CreateForLine (body);

        case 'DoWhileStatement':
            return CreateDoWhileLine (body);

        case 'WhileStatement':
            return CreateWhileLine (body);

            ///----------- functions  ------------
        case 'FunctionDeclaration':
            return CreateFunctionDeclarationLine (body);

        case 'ArrowFunctionExpression':
            return CreateArrowFunctionLine (body);

        case 'ReturnStatement':  /// return statment
            return CreateReturnLine (body);

        default:
            return undefined;//'not implemented type ' + body.type;
    }
}