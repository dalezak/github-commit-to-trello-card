const process = require('process');

const setInput = (name,value)=>
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`]=value;

setInput('trello-api-key', "123")
setInput('trello-auth-token', "456")
setInput('trello-board-id', "789")

setInput('trello-card-action', "Attachment")
setInput('trello-list-name-commit', "Doing")
setInput('trello-list-name-pr-open', "Reviewing")
setInput('trello-list-name-pr-closed', "Testing")

// setInput('trello-card-id-pattern', "trello.com/c/[a-zA-Z]{8}/")
setInput('trello-card-id-pattern', "/")

const {getCardNumbers} = require('./index')

test('parse commit message - default', () => {
  expect(getCardNumbers("https://trello.com/c/AaBbcCDd/134-handle-great-feature this is a commit message")).toStrictEqual(["134"]);
});

