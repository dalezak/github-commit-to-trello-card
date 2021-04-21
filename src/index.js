import * as axios from 'axios';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';

const { context = {} } = github;
const { pull_request, head_commit } = context.payload;

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
  console.log("github.context", github.context);
  if (github.context.payload.head_commit) {
    console.log("github.context.payload.head_commit",github.context.payload.head_commit);
    console.log("github.context.payload.head_commit.author", github.context.payload.head_commit.author);
    console.log("github.context.payload.head_commit.committer", github.context.payload.head_commit.committer);
    let message = github.context.payload.head_commit.message;
    let url = github.context.payload.head_commit.url;
    if (message && message.length > 0) {
      let ids = message.match(/\#\d+/g);
      if (ids && ids.length > 0) {
        for (let id of ids) {
          let cardId = await getCardIdFromShortLink(trelloBoard, id.replace('#', ''));
          if (cardId && cardId.length > 0) {
            let comment = `${message} ${url}`;
            await postCommentToCard(cardId, comment);
          }
        }
      }
    }
  }
};

run()