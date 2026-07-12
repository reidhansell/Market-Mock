#!/usr/bin/env bash
# Market Mock — deterministic test-data seed.
# AI-authored (Claude), part of the test-target scaffolding — see e2e/README.md for the
# authorship split. Run from the repo root AFTER `docker compose up -d`. Idempotent:
# safe to re-run; it resets the seed account's holdings each time.
set -o pipefail
API=http://localhost:5000

echo "== waiting for backend to serve =="
tries=0
until [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST $API/api/auth/login -H 'Content-Type: application/json' -d '{}')" = "400" ]; do
  tries=$((tries+1)); [ "$tries" -gt 40 ] && { echo "backend not serving — is the stack up? (docker compose up -d)"; exit 1; }; sleep 2
done

echo "== ensure a verified seed user (seed@marketmock.test / Test1234!) =="
curl -s -o /dev/null -X POST $API/api/auth/register -H 'Content-Type: application/json' \
  -d '{"username":"seeduser","email":"seed@marketmock.test","password":"Test1234!"}'
sleep 1
VTOKEN=$(node -e '
(async () => {
  const list = await (await fetch("http://localhost:8025/api/v1/messages")).json();
  if (!list.messages || !list.messages.length) return;
  const m = list.messages.find(x => x.To && x.To[0] && x.To[0].Address === "seed@marketmock.test") || list.messages[0];
  const full = await (await fetch("http://localhost:8025/api/v1/message/" + m.ID)).json();
  const mt = (full.HTML || "").match(/\/verify\/([A-Za-z0-9._-]+)\//);
  if (mt) process.stdout.write(mt[1]);
})().catch(() => {});
')
[ -n "$VTOKEN" ] && curl -s -o /dev/null -X POST "$API/api/auth/verify/$VTOKEN"

echo "== seed market data (tickers + intraday@now + 4d EOD history) =="
docker exec -i mysql mysql -umarketmock -pmarketmock marketmock 2>/dev/null <<'SQL'
INSERT IGNORE INTO Ticker (ticker_symbol, company_name) VALUES
 ('AAPL','Apple Inc.'),('MSFT','Microsoft Corporation'),('GOOGL','Alphabet Inc.'),('TSLA','Tesla, Inc.');

DELETE FROM Ticker_Intraday WHERE ticker_symbol IN ('AAPL','MSFT','GOOGL','TSLA');
INSERT INTO Ticker_Intraday (ticker_symbol, open, high, low, last, close, volume, exchange, date) VALUES
 ('AAPL', 189,191,188,190,190,1000000,'XNAS',UNIX_TIMESTAMP()),
 ('MSFT', 418,422,417,420,420, 900000,'XNAS',UNIX_TIMESTAMP()),
 ('GOOGL',179,181,178,180,180, 800000,'XNAS',UNIX_TIMESTAMP()),
 ('TSLA', 248,252,247,250,250,1200000,'XNAS',UNIX_TIMESTAMP());

DELETE FROM Ticker_End_Of_Day WHERE ticker_symbol IN ('AAPL','MSFT','GOOGL','TSLA');
INSERT INTO Ticker_End_Of_Day (ticker_symbol,open,high,low,close,volume,adjusted_open,adjusted_high,adjusted_low,adjusted_close,adjusted_volume,split_factor,dividend,exchange,date) VALUES
 ('AAPL',186,186,186,186,1000000,186,186,186,186,1000000,1,0,'XNAS',UNIX_TIMESTAMP()-4*86400),
 ('AAPL',187,187,187,187,1000000,187,187,187,187,1000000,1,0,'XNAS',UNIX_TIMESTAMP()-3*86400),
 ('AAPL',188,188,188,188,1000000,188,188,188,188,1000000,1,0,'XNAS',UNIX_TIMESTAMP()-2*86400),
 ('AAPL',189,189,189,189,1000000,189,189,189,189,1000000,1,0,'XNAS',UNIX_TIMESTAMP()-1*86400),
 ('MSFT',414,414,414,414,900000,414,414,414,414,900000,1,0,'XNAS',UNIX_TIMESTAMP()-4*86400),
 ('MSFT',416,416,416,416,900000,416,416,416,416,900000,1,0,'XNAS',UNIX_TIMESTAMP()-3*86400),
 ('MSFT',417,417,417,417,900000,417,417,417,417,900000,1,0,'XNAS',UNIX_TIMESTAMP()-2*86400),
 ('MSFT',418,418,418,418,900000,418,418,418,418,900000,1,0,'XNAS',UNIX_TIMESTAMP()-1*86400),
 ('GOOGL',176,176,176,176,800000,176,176,176,176,800000,1,0,'XNAS',UNIX_TIMESTAMP()-4*86400),
 ('GOOGL',177,177,177,177,800000,177,177,177,177,800000,1,0,'XNAS',UNIX_TIMESTAMP()-3*86400),
 ('GOOGL',178,178,178,178,800000,178,178,178,178,800000,1,0,'XNAS',UNIX_TIMESTAMP()-2*86400),
 ('GOOGL',179,179,179,179,800000,179,179,179,179,800000,1,0,'XNAS',UNIX_TIMESTAMP()-1*86400),
 ('TSLA',244,244,244,244,1200000,244,244,244,244,1200000,1,0,'XNAS',UNIX_TIMESTAMP()-4*86400),
 ('TSLA',246,246,246,246,1200000,246,246,246,246,1200000,1,0,'XNAS',UNIX_TIMESTAMP()-3*86400),
 ('TSLA',248,248,248,248,1200000,248,248,248,248,1200000,1,0,'XNAS',UNIX_TIMESTAMP()-2*86400),
 ('TSLA',249,249,249,249,1200000,249,249,249,249,1200000,1,0,'XNAS',UNIX_TIMESTAMP()-1*86400);
SQL

echo "== reset seed user to a clean \$10k + place demo buys (10 AAPL, 5 MSFT) =="
TOKEN=$(curl -s -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"seed@marketmock.test","password":"Test1234!"}' \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).token||"")}catch(e){}})')
[ -z "$TOKEN" ] && { echo "login failed — seed user not verified?"; exit 1; }
curl -s -o /dev/null -X POST $API/api/auth/reset_progress -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"starting_amount":10000}'
curl -s -o /dev/null -X POST $API/api/order -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"ticker_symbol":"AAPL","order_type":"MARKET","trigger_price":0,"quantity":10}'
curl -s -o /dev/null -X POST $API/api/order -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"ticker_symbol":"MSFT","order_type":"MARKET","trigger_price":0,"quantity":5}'

echo "== seeded. login: seed@marketmock.test / Test1234! =="
docker exec mysql mysql -umarketmock -pmarketmock marketmock 2>/dev/null -e "
SELECT username, current_balance FROM User WHERE username='seeduser';
SELECT s.ticker_symbol, s.quantity FROM User_Stocks s JOIN User u USING(user_id) WHERE u.username='seeduser';"
