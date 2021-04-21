# GitHub-Commit-To-Trello-Card
### GitHub Action to attach GitHub commits to a Trello card

#### Action Variables
- **trello-key** - Trello API Key
- **trello-token** - Trello OAuth Token
- **trello-board** - Trello Board ID
- **trello-action** - Trello Card Action, either "comment" or "attachment"

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
          trello-board: ${{ secrets.TRELLO_BOARD }}
          trello-action: "attachment"
```          

#### Build Project
```
npm run build
```