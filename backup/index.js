// CLI tool for node.js with common usage functionality
// handles multiple async inputs via interactive CLI
//
// multiple async inputs via interactive CLI
// default values
// alternate prompt key and question
// confirmation, and masking (for e.g. password input)
// callback with object hash of all user inputs
// TODO: add docs and tests
// TODO: flexible prompting

var pw = require('pw');

var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var questions = [
	'username',
	{ email: { confirm: true } },
	'age',
	{ sex: 'male' },
	{ happiness: { defaultValue: 'happy', confirm: true, question: 'how happy are you?' } },
	{ password: { mask: true, confirm: true } }
];
var answers = {};
var queue = [];

function write(msg) {
    process.stdout.write(msg);
}

function done() {
    rl.close();
    console.log('all done');
    console.log('answers:', answers);
};

function ask(inputs) {

    var input, defaultInput, confirm, prompt;

    var inputItem = inputs.shift();

    if (typeof inputItem === 'string') {
        input = inputItem;
        question = inputItem;
        defaultInput = false;
        confirm = false;
        mask = false;
    }
    else {
        input = Object.keys(inputItem)[0];
        defaultInput = inputItem[input];
        if ({}.toString.call(defaultInput) === '[object Object]') {
            confirm = defaultInput.confirm;
            question = defaultInput.question || input;
            mask = defaultInput.mask || false;
            defaultInput = defaultInput.defaultValue;
        }
        else {
            confirm = false;
            question = input;
            mask = false;
        }
    }

    
    if (defaultInput) question += ' [' + defaultInput + ']';
    question += ' > ';

    if (mask) {
        rl.close();
        var confirmPwd = function (pwd, confirmPwd) {
            if (pwd !== confirmPwd) {
                console.log('values do not match');
                inputs.unshift(inputItem);
            }
            else {
                answers[input] = pwd;
            }
            if (inputs.length > 0) {
                rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                ask(inputs);
            }
            else done();

        };

        process.stdout.write(question);
        pw(function (password) {
            
            if (confirm) {
                //process.stdout.write('confirm',question);
                write('confirm ' + question);
                pw(function (confirmPassword) {
                    confirmPwd(password, confirmPassword);
                });
            }
            else confirmPwd(password, password);
        });
    }
    else {
        rl.question(question, function (answer) {

            var resolve = function (confirmed, answer) {
                if (confirmed) answers[input] = answer;
                else inputs.unshift(inputItem);
                if (inputs.length > 0) ask(inputs);
                else done();
            };

            if (answer.length === 0 && defaultInput)
                answer = defaultInput;

            if (confirm) {
                console.log('your answer was:', answer);
                rl.question('is this correct? [n] >', function (confirmAnswer) {
                    resolve(confirmAnswer.toLowerCase()[0] === 'y', answer);
                });
            }
            else {
                resolve(true, answer);
            }

        });
    }
}

ask(questions);