#!/bin/bash
# Quick TiDB query script

sudo docker exec sre-api node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: 'tidb',
    port: 4000,
    user: 'root',
    password: '',
    database: 'sre_test'
  });
  
  const query = process.argv[1] || 'SELECT * FROM users';
  
  try {
    const [result] = await conn.execute(query);
    console.log('\n✅ Query Result:\n');
    console.table(result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await conn.end();
})();
" "$@"
