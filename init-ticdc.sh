#!/bin/bash

echo "Waiting for TiCDC to be ready..."

# Wait for TiCDC API to be available
for i in {1..30}; do
  if curl -s http://ticdc:8300/api/v1/status > /dev/null 2>&1; then
    echo "TiCDC is ready!"
    break
  fi
  echo "Attempt $i/30: TiCDC not ready yet, waiting..."
  sleep 2
done

# Wait additional time for TiDB to be fully initialized
sleep 5

echo "Creating TiCDC changefeed..."

# Check if changefeed already exists
EXISTING=$(curl -s http://ticdc:8300/api/v1/changefeeds | grep "sre-db-cdc" || echo "")

if [ -n "$EXISTING" ]; then
  echo "Changefeed 'sre-db-cdc' already exists"
else
  # Create the changefeed
  RESULT=$(curl -s -X POST http://ticdc:8300/api/v1/changefeeds \
    -H "Content-Type: application/json" \
    -d '{
      "changefeed_id": "sre-db-cdc",
      "sink_uri": "kafka://kafka-broker:29092/sre-db-changes?protocol=canal-json&kafka-version=2.6.0&max-message-bytes=67108864",
      "config": {
        "force-replicate": true
      },
      "rules": ["sre_test.*"]
    }')
  
  if echo "$RESULT" | grep -q "error"; then
    echo "Failed to create changefeed: $RESULT"
    exit 1
  else
    echo "Changefeed created successfully!"
  fi
fi

# Verify changefeed status
echo "Verifying changefeed status..."
curl -s http://ticdc:8300/api/v1/changefeeds

echo "TiCDC initialization complete!"

