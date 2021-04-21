import * as axios from 'axios';
import * as core from '@actions/core';
import * as github from '@actions/github';

const { context = {} } = github;
const { pull_request, head_commit } = context.payload;

const trelloKey = core.getInput('trello-key', { required: true });
const trelloToken = core.getInput('trello-token', { required: true });
const trelloBoard = core.getInput('trello-board', { required: true });
const trelloCardAction = core.getInput('trello-card-action', { required: true });
const trelloListName = core.getInput('trello-list-name', { required: true });

async function getCardOnBoard(board, card) {
  let url = `https://trello.com/1/boards/${board}/cards/${card}`
  let res = await axios.get(url, { 
    params: { 
      key: trelloKey, 
      token: trelloToken 
    }
  });
  return res && res.data ? res.data.id : null;
}

async function getListOnBoard(board, list) {
  let url = `https://trello.com/1/boards/${board}/lists`
  let res = await axios.get(url, { 
    params: { 
      key: trelloKey, 
      token: trelloToken 
    }
  });
  return res && res.data ? res.data.filter(l => l.closed == false && l.name == list)  : null;
}

async function addCommentToCard(card, author, message, link) {
  let url = `https://api.trello.com/1/cards/${card}/actions/comments`;
  let res = await axios.post(url, {
    key: trelloKey,
    token: trelloToken, 
    text: `${author}: ${message} ${link}`
  });
  return res && res.status == 200;
}

async function addAttachmentToCard(card, link) {
  let url = `https://api.trello.com/1/cards/${card}/attachments`;
  let res = await axios.post(url, {
    key: trelloKey,
    token: trelloToken, 
    url: link
  });
  return res && res.status == 200;
}

async function moveCardToList(card, list) {
  let url = `https://api.trello.com/1/cards/${card}`;
  let res = await axios.put(url, {
    key: trelloKey,
    token: trelloToken, 
    idList: list
  });
  return res && res.status == 200;
}

async function run() {
  console.log("github.context", github.context);
  if (head_commit && head_commit.message) {
    let url = head_commit.url;
    let message = head_commit.message;
    let author = head_commit.author.name;
    let ids = message.match(/\#\d+/g);
    if (ids && ids.length > 0) {
      for (let id of ids) {
        let card = await getCardOnBoard(trelloBoard, id.replace('#', ''));
        if (card && card.length > 0) {
          if (trelloCardAction == 'comment') {
            await addCommentToCard(card, author, message, url);
          }
          else if (trelloCardAction == 'attachment') {
            await addAttachmentToCard(card, url);
          }
          let list = await getListOnBoard(trelloBoard, trelloListName);
          if (list && list.length > 0) {
            await moveCardToList(card, list);
          }
        }
      }
    }
  }
  else if (pull_request) {
    // TODO implement handling of PR to move card between lists
  }
};

run()