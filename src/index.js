import * as axios from 'axios';
import * as core from '@actions/core';
import * as github from '@actions/github';

const { context = {} } = github;
const { pull_request, head_commit } = context.payload;

const trelloKey = core.getInput('trello-key', { required: true });
const trelloToken = core.getInput('trello-token', { required: true });
const trelloBoard = core.getInput('trello-board', { required: true });

async function getCardId(board, id) {
  let url = `https://trello.com/1/boards/${board}/cards/${id}`
  let res = await axios.get(url, { 
    params: { 
      key: trelloKey, 
      token: trelloToken 
    }
  });
  return res && res.data ? res.data.id : null;
}

async function addCommentToCard(id, comment) {
  let url = `https://api.trello.com/1/cards/${id}/actions/comments`;
  let res = await axios.post(url, {
    key: trelloKey,
    token: trelloToken, 
    text: comment
  });
  return res && res.status == 200;
}

async function addAttachmentToCard(id, attachment) {
  let url = `https://api.trello.com/1/cards/${id}/attachments`;
  let res = await axios.post(url, {
    key: trelloKey,
    token: trelloToken, 
    url: attachment
  });
  return res && res.status == 200;
}

async function run() {
  console.log("github.context", github.context);
  if (head_commit && head_commit.message) {
    let url = head_commit.url;
    let author = head_commit.author.name;
    let message = head_commit.message;
    let ids = message.match(/\#\d+/g);
    if (ids && ids.length > 0) {
      for (let id of ids) {
        let cardId = await getCardId(trelloBoard, id.replace('#', ''));
        if (cardId && cardId.length > 0) {
          await addCommentToCard(cardId, `${author}: ${message} ${url}`);
          await addAttachmentToCard(cardId, url);
        }
      }
    }
  }
  else if (pull_request) {
  
  }
};

run()