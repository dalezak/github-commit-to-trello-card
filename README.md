# GitHub-Commit-To-Trello-Card
### GitHub Action to attach GitHub commits to a Trello card

#### Action Variables
- **trello-api-key** - Trello API Key
- **trello-auth-token** - Trello OAuth Token
- **trello-board-id** - Trello Board ID
- **trello-list-name** - Trello List Name, example "Doing"
- **trello-card-action** - Trello Card Action, either "comment" or "attachment"

#### GitHub Action
```
name: GitHub Commit To Trello Comment

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: dalezak/github-commit-to-trello-card@main
        with:
          trello-api-key: ${{ secrets.TRELLO_KEY }}
          trello-auth-token: ${{ secrets.TRELLO_TOKEN }}
          trello-board-id: ${{ secrets.TRELLO_BOARD }}
          trello-list-name: "Doing"
          trello-card-action: "attachment"
```          

#### Build Project
```
npm run build
```