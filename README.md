# GitHub-Commit-To-Trello-Card
### GitHub Action to attach GitHub commits to a Trello card

#### Action Variables
- **trello-key** - Trello API Key
- **trello-token** - Trello OAuth Token
- **trello-board-id** - Trello Board ID
- **trello-card-action** - Trello Card Action, either "comment" or "attachment"
- **trello-list-name** - Trello List Name, example "Doing"

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
          trello-key: ${{ secrets.TRELLO_KEY }}
          trello-token: ${{ secrets.TRELLO_TOKEN }}
          trello-board-id: ${{ secrets.TRELLO_BOARD }}
          trello-list-name: "Doing"
          trello-card-action: "attachment"
```          

#### Build Project
```
npm run build
```