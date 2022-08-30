# Tools for council members

Either you run the script with `KEY="..." ..` or you place your JSON keyfile in this directory and name it `key.json` and export `PASSWORD="..."`

## Marking a farm as Gold and it's nodes as Certified

with dry-run

```
NET="ws://localhost:9944" KEY="" node mark_farm_and_nodes.js 1 true
```

without dry-run

```
NET="ws://localhost:9944" KEY="" node mark_farm_and_nodes.js 1 false
```

## Vote for all active motions

```
NET="ws://localhost:9944" KEY="" node vote_active_motions.js
```

## Close all active motions

```
NET="ws://localhost:9944" KEY="" node close_active_motions.js
```
