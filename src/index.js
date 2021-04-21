import * as axios from 'axios';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';

const trelloKey = core.getInput('trello-key', { required: true });
const trelloToken = core.getInput('trello-token', { required: true });
const trelloBoard = core.getInput('trello-board', { required: true });

async function getCardIdFromShortLink(board, id) {
  let url = `https://trello.com/1/boards/${board}/cards/${id}`
  let res = await axios.get(url, { 
    params: { 
      key: trelloKey, 
      token: trelloToken 
    }
  });
  return res && res.data ? res.data.id : null;
}

async function postCommentToCard(id, comment) {
  let url = `https://api.trello.com/1/cards/${id}/actions/comments`;
  let res = await axios.post(url, {
    key: trelloKey,
    token: trelloToken, 
    text: comment
  });
  return res && res.status == 200;
}

async function run() {
  console.log("github.event", github.event);
  console.log("github.context", github.context);
  let message = github.event.head_commit.message;
  if (message && message.length > 0) {
    let ids = message.match(/\#\d+/g);
    if (ids && ids.length > 0) {
      for (let id of ids) {
        let cardId = await getCardIdFromShortLink(trelloBoard, id.replace('#', ''));
        if (cardId && cardId.length > 0) {
          let comment = `${message} `;
          await postCommentToCard(cardId, comment);
        }
      }
    }
  }
};

run()