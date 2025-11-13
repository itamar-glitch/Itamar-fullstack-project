const { Kafka } = require('kafkajs');
const { logger, logCDCEvent } = require('./logger');

// Kafka configuration
const kafka = new Kafka({
  clientId: 'cdc-consumer',
  brokers: [process.env.KAFKA_BROKER || 'kafka-broker:29092'],
  retry: {
    initialRetryTime: 3000,
    retries: 10
  }
});

const consumer = kafka.consumer({ 
  groupId: 'sre-cdc-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

// Parse Canal-JSON format from TiCDC
const parseCanalMessage = (message) => {
  try {
    const data = JSON.parse(message);
    
    // Canal-JSON format from TiCDC
    if (data.type && data.database && data.table) {
      return {
        database: data.database,
        table: data.table,
        operation: data.type.toUpperCase(), // INSERT, UPDATE, DELETE
        data: data.data && data.data[0] ? data.data[0] : null,
        old_data: data.old && data.old[0] ? data.old[0] : null,
        timestamp: data.ts || Date.now()
      };
    }
    
    return null;
  } catch (error) {
    logger.error('Failed to parse CDC message:', error.message);
    return null;
  }
};

const startConsumer = async () => {
  try {
    logger.info('Starting CDC consumer...');
    
    await consumer.connect();
    logger.info('Connected to Kafka');
    
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC || 'sre-db-changes',
      fromBeginning: false 
    });
    logger.info(`Subscribed to topic: ${process.env.KAFKA_TOPIC || 'sre-db-changes'}`);
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value.toString();
          const event = parseCanalMessage(value);
          
          if (event) {
            logCDCEvent(event);
          }
        } catch (error) {
          logger.error('Error processing message:', error.message);
        }
      },
    });
    
    logger.info('CDC consumer is now listening for database changes...');
  } catch (error) {
    logger.error('Failed to start CDC consumer:', error.message);
    logger.info('Retrying in 5 seconds...');
    setTimeout(startConsumer, 5000);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down CDC consumer...');
  await consumer.disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the consumer
startConsumer();

