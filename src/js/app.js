import $ from 'jquery';
import {parseCode} from './code-analyzer';

var table;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        table = document.getElementById('resTable');
        parsedCode.map (CreateLineForTable);
    });
});


function CreateLineForTable (line){
    if (line === null)
        return null;
    if (line.constructor === Array)
        line.map(CreateLineForTable);
    else {
        var row = table.insertRow(); //create new ow
        // add all cells
        var lineCell = row.insertCell(0);
        var typeCell = row.insertCell(1);
        var nameCell = row.insertCell(2);
        var conditionCell = row.insertCell(3);
        var valueCell = row.insertCell(4);
        //set cell value
        lineCell.innerHTML = line.lineNum;
        typeCell.innerHTML = line.type;
        nameCell.innerHTML = (line.name != undefined) ? line.name : '';
        conditionCell.innerHTML = (line.condition != undefined) ? line.condition : '';
        valueCell.innerHTML = (line.value != undefined) ? line.value : '';
    }


}




