import * as axios from 'axios';
import * as core from '@actions/core';
import * as github from '@actions/github';

const { context = {} } = github;
const { pull_request, head_commit } = context.payload;

const trelloApiKey = core.getInput('trello-api-key', { required: true });
const trelloAuthToken = core.getInput('trello-auth-token', { required: true });
const trelloBoardId = core.getInput('trello-board-id', { required: true });
const trelloCardAction = core.getInput('trello-card-action', { required: true });
const trelloListNameCommit = core.getInput('trello-list-name-commit', { required: true });
const trelloListNamePullRequestOpen = core.getInput('trello-list-name-pr-open', { required: false });
const trelloListNamePullRequestClosed = core.getInput('trello-list-name-pr-closed', { required: false });

async function getCardOnBoard(board, card) {
  console.log(`getCardOnBoard(${board}, ${card})`);
  let url = `https://trello.com/1/boards/${board}/cards/${card}`
  return await axios.get(url, { 
    params: { 
      key: trelloApiKey, 
      token: trelloAuthToken 
    }
  }).then(response => { 
    console.log(url, response.data);
    return response.data.id;
  }).catch(error => {
    console.error(url, error.response);
    return null;
  });
}

async function getListOnBoard(board, list) {
  console.log(`getListOnBoard(${board}, ${list})`);
  let url = `https://trello.com/1/boards/${board}/lists`
  return await axios.get(url, { 
    params: { 
      key: trelloApiKey, 
      token: trelloAuthToken 
    }
  }).then(response => { 
    console.log(url, response.data);
    let result = response.data.find(l => l.closed == false && l.name == list);
    return result ? result.id : null;
  }).catch(error => {
    console.error(url, error.response);
    return null;
  });
}

async function addAttachmentToCard(card, link) {
  console.log(`addAttachmentToCard(${card}, ${link})`);
  let url = `https://api.trello.com/1/cards/${card}/attachments`;
  return await axios.post(url, {
    key: trelloApiKey,
    token: trelloAuthToken, 
    url: link
  }).then(response => {
    console.log(url, response.data); 
    return response.status == 200;
  }).catch(error => {
    console.error(url, error.response);
    return null;
  });
}

async function addCommentToCard(card, user, message, link) {
  console.log(`addCommentToCard(${card}, ${user}, ${message}, ${link})`);
  let url = `https://api.trello.com/1/cards/${card}/actions/comments`;
  return await axios.post(url, {
    key: trelloApiKey,
    token: trelloAuthToken, 
    text: `${user}: ${message} ${link}`
  }).then(response => {
    console.log(url, response.data); 
    return response.status == 200;
  }).catch(error => {
    console.error(url, error.response);
    return null;
  });
}

async function moveCardToList(board, card, list) {
  console.log(`moveCardToList(${board}, ${card}, ${list})`);
  let listId = await getListOnBoard(board, list);
  if (listId && listId.length > 0) {
    let url = `https://api.trello.com/1/cards/${card}`;
    return await axios.put(url, {
      key: trelloApiKey,
      token: trelloAuthToken, 
      idList: listId
    }).then(response => { 
      console.log(url, response.data);
      return response.status == 200;
    }).catch(error => {
      console.error(url, error.response);
      return null;
    });
  }       
  return null;
}

async function handleHeadCommit(data) {
  console.log("handleHeadCommit", data);
  let url = data.url;
  let message = data.message;
  let author = data.author.name;
  let ids = message.match(/\#\d+/g);
  if (ids && ids.length > 0) {
    let id = ids[ids.length-1];
    let card = await getCardOnBoard(trelloBoardId, id.replace('#', ''));
    if (card && card.length > 0) {
      if (trelloCardAction && trelloCardAction.toLowerCase() == 'attachment') {
        await addAttachmentToCard(card, url);
      }
      else if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
        await addCommentToCard(card, author, message, url);
      }
      if (message.match(/Merge pull request \#\d+ from/g) && trelloListNamePullRequestClosed && trelloListNamePullRequestClosed.length > 0) {
        await moveCardToList(trelloBoardId, card, trelloListNamePullRequestClosed);
      }
      else if (trelloListNameCommit && trelloListNameCommit.length > 0) {
        await moveCardToList(trelloBoardId, card, trelloListNameCommit);
      }
    }
  }
}

async function handlePullRequest(data) {
  console.log("handlePullRequest", data);
  let url = data.url;
  let title = data.title;
  let user = data.user.name;
  let ids = title.match(/\#\d+/g);
  if (ids && ids.length > 0) {
    for (let id of ids) {
      let card = await getCardOnBoard(trelloBoardId, id.replace('#', ''));
      if (card && card.length > 0) {
        if (trelloCardAction && trelloCardAction.toLowerCase() == 'attachment') {
          await addAttachmentToCard(card, url);
        }
        else if (trelloCardAction && trelloCardAction.toLowerCase() == 'comment') {
          await addCommentToCard(card, user, title, url);
        }
        if (data.state == "open" && trelloListNamePullRequestOpen && trelloListNamePullRequestOpen.length > 0) {
          await moveCardToList(trelloBoardId, card, trelloListNamePullRequestOpen);
        }
        else if (data.state == "closed" && trelloListNamePullRequestClosed && trelloListNamePullRequestClosed.length > 0) {
          await moveCardToList(trelloBoardId, card, trelloListNamePullRequestClosed);
        }
      }
    }
  }
}

async function run() {
  if (head_commit && head_commit.message) {
    handleHeadCommit(head_commit)
  }
  else if (pull_request && pull_request.title) {
    handlePullRequest(pull_request)
  }
};

run()