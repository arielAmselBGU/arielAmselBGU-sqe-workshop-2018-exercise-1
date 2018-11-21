import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '[]'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '[[{"lineNum":1,"type":"Variable Declaration","name":"a","value":"1"}]]'
        );
    });

    it('var dec 1', () => {
        assert.deepEqual(
            (parseCode('let a = 1'))[0] ,
            [{lineNum:1, type:'Variable Declaration',name:'a',value:'1'}]
        );
    });

    it('var dec 2', () => {
        assert.deepEqual(
            (parseCode('let w ={name:\'sadf\',value:{a:1,b:false}}'))[0] ,
            [{lineNum:1, type:'Variable Declaration',name:'w',value:'{name:\'sadf\',value:{a:1,b:false}}'}]
        );
    });

    it('var dec 3', () => {
        assert.deepEqual(
            (parseCode('let y = a+b'))[0] ,
            [{lineNum:1, type:'Variable Declaration',name:'y',value:'a+b'}]
        );
    });

    it('assignment 1', () => {
        assert.deepEqual(
            (parseCode('x =  3'))[0] ,
            {lineNum:1, type:'assignment expression',name:'x',value:'3'}
        );
    });

    it('assignment 2', () => {
        assert.deepEqual(
            (parseCode('x =  [1,2]'))[0] ,
            {lineNum:1, type:'assignment expression',name:'x',value:'[1,2]'}
        );
    });

    it('update expression 1', () => {
        assert.deepEqual(
            (parseCode('x ++;'))[0] ,
            {lineNum:1, type:'assignment update expression',name:'x',value:'x ++'}
        );
    });

    it('if expression 1', () => {
        assert.deepEqual(
            (parseCode('if (x===3)\n 1+1\n else\n x'))[0],
            [{lineNum:1, type:'if statement',condition:'x===3'},undefined,undefined]
        );
    });

    it('if expression 2', () => {
        assert.deepEqual(
            (parseCode('if (x===3)\n x ++\n else\n x'))[0],
            [{lineNum:1, type:'if statement',condition:'x===3'},{lineNum:2, type:'assignment update expression',name:'x',value:'x ++'},undefined]
        );
    });

    it('if expression 3', () => {
        assert.deepEqual(
            (parseCode('if (x===3)\n x ++\n else\n x --'))[0],
            [{lineNum:1, type:'if statement',condition:'x===3'},{lineNum:2, type:'assignment update expression',name:'x',value:'x ++'},{lineNum:4, type:'assignment update expression',name:'x',value:'x --'}]
        );
    });

    it('if expression 4', () => {
        assert.deepEqual(
            (parseCode('if (x===3)\n x ++;'))[0],
            [{lineNum:1, type:'if statement',condition:'x===3'},{lineNum:2, type:'assignment update expression',name:'x',value:'x ++'},undefined]
        );
    });

    it('else if expression 1', () => {
        assert.deepEqual(
            (parseCode('if (x === 3)\n y ++\n else if (x<y)\n x ++\n else\n x --'))[0],
            [{lineNum:1, type:'if statement',condition:'x === 3'},{lineNum:2, type:'assignment update expression',name:'y',value:'y ++'},
                [{lineNum:3, type:'else if statement',condition:'x<y'},
                    {lineNum:4, type:'assignment update expression',name:'x',value:'x ++'}
                    ,{lineNum:6, type:'assignment update expression',name:'x',value:'x --'}]]
        );
    });

    it('for expression 1', () => {
        assert.deepEqual(
            (parseCode('for (let x =0; x<5; x++) y=2;'))[0],
            [[{lineNum:1, type:'Variable Declaration',name:'x',value:'0'}],
                {lineNum:1,type:'for statement',condition:'x<5'},
                {lineNum:1, type:'assignment update expression',name:'x',value:'x++'},
                {lineNum:1, type:'assignment expression',name:'y',value:'2'}]
        );
    });

    it('for expression 2', () => {
        assert.deepEqual(
            (parseCode('for (; x<5; x++) y=2;'))[0],
            [undefined,
                {lineNum:1,type:'for statement',condition:'x<5'},
                {lineNum:1, type:'assignment update expression',name:'x',value:'x++'},
                {lineNum:1, type:'assignment expression',name:'y',value:'2'}]
        );
    });

    it('do while expression 2', () => {
        assert.deepEqual(
            (parseCode('do {x++} while (x<2)'))[0],
            [{lineNum:1,condition:'x<2',type:'do while statement'},
                [{lineNum:1, type:'assignment update expression',name:'x',value:'x++'}]]
        );
    });

    it('while expression 1 ', () => {
        assert.deepEqual(
            (parseCode('while (x<2) {x ++}'))[0],
            [{lineNum:1,condition:'x<2',type:'while statement'},
                [{lineNum:1, type:'assignment update expression',name:'x',value:'x ++'}]]
        );
    });

    it('function declaration', () => {
        assert.deepEqual(
            (parseCode('function test (x,y) {x = 1}'))[0],
            [{lineNum:1,type:'function declaration',name:'test'},
                [{lineNum:1, type:'Variable Declaration',name:'x'},
                    {lineNum:1, type:'Variable Declaration',name:'y'}],
                [{lineNum:1, type:'assignment expression',name:'x',value:'1'}]
            ]
        );
    });

    it('arrow function declaration', () => {
        assert.deepEqual(
            (parseCode('(x,y) => {x = 1}'))[0],
            [{lineNum:1,type:'arrow function'},
                [{lineNum:1, type:'Variable Declaration',name:'x'},
                    {lineNum:1, type:'Variable Declaration',name:'y'}],
                [{lineNum:1, type:'assignment expression',name:'x',value:'1'}]
            ]
        );
    });


    it('arrow function declaration', () => {
        assert.deepEqual(
            (parseCode('function test (){\nreturn 1}'))[0],
            [{lineNum:1,type:'function declaration',name:'test'},
                [],
                [{lineNum:2,type:'return statement',value:'1'}]]
        );
    });


});


