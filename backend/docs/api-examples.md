# API examples

```sh
curl 'http://localhost:8000/api/v1/games?page=1&page_size=24'
curl 'http://localhost:8000/api/v1/pokemon?game_id=emerald&page=1&page_size=24'
curl -X POST http://localhost:8000/api/v1/tools/battle/calculate \
  -H 'content-type: application/json' \
  -d '{"game_id":"emerald","level":50,"attack":100,"defense":100,"power":80,"move_type":"fire","defender_types":["grass"],"stab":true}'
```
