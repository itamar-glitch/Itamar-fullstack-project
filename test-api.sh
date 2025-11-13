#!/bin/bash

API_URL="http://localhost:3000"

echo "========================================="
echo "SRE API Test Script"
echo "========================================="
echo ""

echo "1. Testing health endpoint..."
curl -s "$API_URL/health" | jq '.' || curl -s "$API_URL/health"
echo -e "\n"

echo "2. Testing API health (with database check)..."
curl -s "$API_URL/api/health" | jq '.' || curl -s "$API_URL/api/health"
echo -e "\n"

echo "3. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }')
echo "$REGISTER_RESPONSE" | jq '.' || echo "$REGISTER_RESPONSE"
echo -e "\n"

echo "4. Testing login with default admin user..."
echo "Username: admin, Password: admin123"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')
echo "$LOGIN_RESPONSE" | jq '.' || echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
echo -e "\n"

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "5. Testing token verification..."
  curl -s "$API_URL/api/auth/verify" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || curl -s "$API_URL/api/auth/verify" -H "Authorization: Bearer $TOKEN"
  echo -e "\n"

  echo "6. Testing user profile endpoint..."
  curl -s "$API_URL/api/user/profile" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || curl -s "$API_URL/api/user/profile" -H "Authorization: Bearer $TOKEN"
  echo -e "\n"

  echo "7. Testing logout..."
  curl -s -X POST "$API_URL/api/auth/logout" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || curl -s -X POST "$API_URL/api/auth/logout" -H "Authorization: Bearer $TOKEN"
  echo -e "\n"
else
  echo "Login failed, skipping authenticated tests"
fi

echo "========================================="
echo "Test completed!"
echo "========================================="

